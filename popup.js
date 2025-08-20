// Import secrets
const SUPABASE_URL = window.secrets.SUPABASE_URL;
const SUPABASE_KEY = window.secrets.SUPABASE_KEY;

const radioButtons = document.querySelectorAll('input[name="boring-level"]');
const statusDiv = document.getElementById('status');
const feedbackText = document.getElementById('feedbackText');
const submitFeedbackBtn = document.getElementById('submitFeedback');
const feedbackSection = document.querySelector('.feedback-section');

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
submitFeedbackBtn.addEventListener('click', function() {
    const feedback = feedbackText.value.trim();
    if (feedback) {
        updateStatus('Thank you for your feedback!');
        feedbackText.value = '';
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
