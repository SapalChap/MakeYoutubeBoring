// Import secrets
const SUPABASE_URL = window.secrets.SUPABASE_URL;
const SUPABASE_KEY = window.secrets.SUPABASE_KEY;
const SUPABASE_TABLE = window.secrets.SUPABASE_TABLE;

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
        updateStatus(`Boring level ${level} applied! YouTube is now more boring.`);
        
        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "applyBoring",
                    level: level
                });
                
                // Refresh the page after applying the new boring level
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
    if (result.boringLevel) {
        const radioButton = document.querySelector(`input[value="${result.boringLevel}"]`);
        if (radioButton) {
            radioButton.checked = true;
        }
    }
});

// Submit feedback
submitFeedbackBtn.addEventListener('click', async function() {
    const feedback = feedbackText.value.trim();
    if (feedback) {
        updateStatus('Submitting feedback...');

        try {
            // Get user name
            const userInfo = await getUserFromIdentity();
            console.log('UserInfo from getUserFromIdentity:', userInfo);

            // Prepare data for Supabase
            const data = {
                user_id: userInfo.user_id,
                email: userInfo.email,
                name: userInfo.name,
                feedback_text: feedback,
                extension_version: getExtensionVersion(),
                created_at: getCurrentTimestamp()
            };
            
            // Submit to Supabase
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'apikey': SUPABASE_KEY
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                updateStatus('Thank you for your feedback!');
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