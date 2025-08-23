// Import secrets
const SUPABASE_URL = window.secrets.SUPABASE_URL;
const SUPABASE_KEY = window.secrets.SUPABASE_KEY;
const SUPABASE_TABLE_DEV = window.secrets.SUPABASE_TABLE_DEV;
const SUPABASE_TABLE_PROD = window.secrets.SUPABASE_TABLE_PROD;

const radioButtons = document.querySelectorAll('input[name="boring-level"]');
const statusDiv = document.getElementById('status');
const feedbackText = document.getElementById('feedbackText');
const submitFeedbackBtn = document.getElementById('submitFeedback');
const feedbackSection = document.querySelector('.feedback-section');


function getExtensionVersion(){
    return chrome.runtime.getManifest().version;
}


function getCurrentTimestamp(){
    return new Date().toISOString();
}

//add api here 
async function getUserFromIdentity() {
    try {
        // Update status and wait before getting auth token
        updateStatus('I only accept feedback if you are logged in! Please login first.');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        
        const tokenResponse = await chrome.identity.getAuthToken({interactive: true});
        console.log('OAuth Token Response:', tokenResponse);
        
        // Extract the actual token string from the response object
        const token = tokenResponse.token || tokenResponse;
        console.log('Extracted Token:', token);
        
        // Use the correct Google People API endpoint
        const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        const userInfo = await response.json();
        console.log('Full userInfo response:', userInfo);
        
        // Extract data from the new API response format
        const name = userInfo.names && userInfo.names[0] ? userInfo.names[0].displayName : null;
        const email = userInfo.emailAddresses && userInfo.emailAddresses[0] ? userInfo.emailAddresses[0].value : null;
        const userId = userInfo.resourceName ? userInfo.resourceName.replace('people/', '') : null;
        
        console.log('User ID:', userId);
        console.log('User Email:', email);
        console.log('User Name:', name);

        return {
            user_id: userId,
            email: email,
            name: name
        };
    } catch(error) {
        console.log('Identity API not available:', error);
        return {
            user_id: null,
            email: null,
            name: null
        }
    }
}


// Apply settings when radio button is selected
radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
        const level = parseInt(this.value);
        
        if (level === 0) {
            updateStatus('YouTube will stay distracting as usual!');
        } else {
            updateStatus(`Boring level ${level} applied! YouTube is now more boring.`);
        }
        
        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
                // Send message for all levels (including level 0)
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "applyBoring",
                    level: level
                });
                
                // Refresh the page after applying any level change
                setTimeout(() => {
                    chrome.tabs.reload(tabs[0].id);
                }, 500); // Small delay to ensure the message is processed
            }
        });
        
        // Store the preference
        chrome.storage.sync.set({boringLevel: level});
    });
});

// Load saved preference when popup opens
chrome.storage.sync.get(['boringLevel'], function(result) {
    if (result.boringLevel !== undefined) {
        const radioButton = document.querySelector(`input[value="${result.boringLevel}"]`);
        if (radioButton) {
            radioButton.checked = true;
        }
    } else {
        // Default to "Keep YouTube Distracting" (level 0)
        const defaultRadioButton = document.querySelector('input[value="0"]');
        if (defaultRadioButton) {
            defaultRadioButton.checked = true;
        }
    }
});

// Submit feedback
submitFeedbackBtn.addEventListener('click', async function() {
    const feedback = feedbackText.value.trim();
    if (feedback) {
        updateStatus('Checking feedback eligibility...');

        try {
            // Get user info
            const userInfo = await getUserFromIdentity();
            console.log('UserInfo from getUserFromIdentity:', userInfo);

            // Check if user is logged in
            if (!userInfo.user_id) {
                updateStatus('Hey, sorry I only accept feedback from logged in users :(. Please login to your google account first!');
                return;
            }

            // Check 24-hour cooldown
            const userKey = `feedback_${userInfo.user_id}`;
            const existingFeedback = await chrome.storage.local.get([userKey]);

            if (existingFeedback[userKey]) {
                const lastSubmissionTime = new Date(existingFeedback[userKey]);
                const now = new Date();
                const hoursDiff = (now - lastSubmissionTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    const remainingHours = Math.ceil(24 - hoursDiff);
                    updateStatus(`Please wait ${remainingHours} hours to submit another feedback`);
                    return;
                }
            }

            updateStatus('Submitting feedback...');

            // Prepare data for Supabase
            const data = {
                user_id: userInfo.user_id,
                email: userInfo.email,
                name: userInfo.name,
                feedback_text: feedback,
                extension_version: getExtensionVersion(),
                created_at: getCurrentTimestamp()
            };
            
            console.log('Data being sent to Supabase:', data);

            // Determine which table to use based on user ID
            const targetTable = userInfo.user_id === '110806083993815849787' ? SUPABASE_TABLE_DEV : SUPABASE_TABLE_PROD;
            console.log('Target table:', targetTable);
            
            // Submit to Supabase
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${targetTable}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'apikey': SUPABASE_KEY
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Record the submission timestamp for cooldown
                await chrome.storage.local.set({ [userKey]: getCurrentTimestamp() });
                
                // Set different success messages based on target table
                if (targetTable === SUPABASE_TABLE_DEV) {
                    updateStatus('Data has to sent to Dev, Boss.');
                } else {
                    updateStatus('Thank you for your feedback!');
                }
                feedbackText.value = '';
            } else {
                updateStatus('Failed to submit feedback');
                console.log('API Response:', response);
                console.log('Response status:', response.status);
                console.log('Response statusText:', response.statusText);
            }
        } catch (error) {
            updateStatus('Failed to submit feedback');
            console.log('Error in feedback submission:', error);
        }
    } else {
        updateStatus('Please enter some feedback first');
    }
});

//Fix for the chrome api auto whitespace issue
if (feedbackText.value.trim() === '') {
    feedbackText.value = '';
}


function updateStatus(message) {
    statusDiv.textContent = message;
    setTimeout(() => {
        statusDiv.textContent = '';
    }, 3000);
}