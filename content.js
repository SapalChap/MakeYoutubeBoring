

const blackImage = chrome.runtime.getURL("BoringYoutubeThumbnail.png");

// Add message listener at the top
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "applyBoring") {
        applyBoringLevel(request.level);
    }
});

// New function to apply different boring levels
function applyBoringLevel(level) {
    console.log(`Applying boring level: ${level}`);
    
    switch(level) {

        case 0:
            //no nothing
            break;
        case 1:
            // Level 1: Remove thumbnails + shorts
            makeImagesBoring();
            removeShorts();
            break;
        case 2:
            // Level 2: Level 1 + black & white videos + no comments
            makeImagesBoring();
            removeShorts();
            makeVideosBlackAndWhite();
            removeComments();
            break;
        case 3:
            // Level 3: Same as Level 2 for now
            makeImagesBoring();
            removeShorts();
            makeVideosBlackAndWhite();
            removeComments();
            clearYouTubeHome();
            break;
        default:
            console.log('Invalid boring level');
    }
}

function makeImagesBoring(){
    const imgs = document.getElementsByTagName("img");
    
    for (image of imgs) {
        
        if (image.src !== blackImage) {
            image.src = blackImage;
        }
     }
}

function makeTitlesBoring() {
    const videoTitles = document.querySelectorAll("h3[title], a#video-title");

    for (let titleElement of videoTitles) {
        let originalTitle = titleElement.getAttribute("title") || titleElement.textContent.trim();

        if (originalTitle && originalTitle.length > 0) {
            let lowerTitle = originalTitle.toLowerCase();
            
            // Update title attribute
            titleElement.setAttribute("title", lowerTitle);
            
            // Update visible text based on element type
            if (titleElement.tagName === 'H3') {
                const span = titleElement.querySelector("span");
                if (span) {
                    span.textContent = lowerTitle;
                }
            } else {
                titleElement.textContent = lowerTitle;
            }
            
        }
    }
}

function removeShorts() {
    // Look for common Shorts selectors (removed invalid selectors)
    const shortsLinks = document.querySelectorAll(`
        a[href="/shorts"],
        a[href*="/shorts"],
        a[href*="feed/subscriptions/shorts"],
        [title*="Shorts" i],
        ytd-guide-entry-renderer,
        ytm-shorts-lockup-view-model-v2,
        ytm-shorts-lockup-view-model
    `);
    
    shortsLinks.forEach(element => {
        if (element.textContent.toLowerCase().includes('shorts') ||
            element.getAttribute('title')?.toLowerCase().includes('shorts') ||
            element.querySelector('a[href*="/shorts"]') ||
            element.querySelector('ytm-shorts-lockup-view-model-v2') ||
            element.querySelector('ytm-shorts-lockup-view-model')) {
            element.style.display = 'none';
        }
    });
    
    // Handle rich-item-renderer elements separately (since :has() may not work)
    const richItems = document.querySelectorAll('ytd-rich-item-renderer');
    richItems.forEach(item => {
        const hasShorts = item.querySelector('a[href*="/shorts"]') ||
                          item.querySelector('ytm-shorts-lockup-view-model-v2') ||
                          item.querySelector('ytm-shorts-lockup-view-model');
        if (hasShorts) {
            item.style.display = 'none';
        }
    });
    
    // Hide touch feedback shape elements that are part of shorts
    const touchFeedbackElements = document.querySelectorAll(`
        .yt-spec-touch-feedback-shape__fill,
        .yt-spec-touch-feedback-shape__stroke,
        .yt-spec-touch-feedback-shape,
        yt-touch-feedback-shape
    `);
    
    touchFeedbackElements.forEach(element => {
        element.style.display = 'none';
    });
    
    // Hide any element that contains shorts in its href
    const allLinks = document.querySelectorAll('a[href*="shorts"]');
    allLinks.forEach(link => {
        link.style.display = 'none';
        // Also hide parent elements that might contain this link
        let parent = link.parentElement;
        for (let i = 0; i < 3 && parent; i++) {
            if (parent.textContent.toLowerCase().includes('shorts')) {
                parent.style.display = 'none';
            }
            parent = parent.parentElement;
        }
    });
    
    // Hide spans with "Shorts" text (using manual filtering instead of :contains)
    const titleSpans = document.querySelectorAll('span[id="title"]');
    titleSpans.forEach(span => {
        if (span.textContent.includes('Shorts')) {
            span.style.display = 'none';
        }
    });
    
    // Hide any span or element that contains "Shorts" text
    const allSpans = document.querySelectorAll('span');
    allSpans.forEach(element => {
        if (element.textContent.trim() === 'Shorts' ||
            element.textContent.includes('Shorts')) {
            element.style.display = 'none';
        }
    });
}
function removeSidebar() {
    // Common YouTube sidebar selectors
    const sidebarSelectors = [
        '#secondary', // Main sidebar container
        '#related', // Related videos section
        'ytd-watch-next-secondary-results-renderer', // Next video recommendations
        '#secondary-inner', // Inner sidebar content
        'ytd-guide-renderer', // Left navigation guide
        '#guide-content' // Guide content
    ];
    
    sidebarSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = 'none';
        }
    });
}


function makeVideosBlackAndWhite() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Apply black and white immediately if not already applied
        if (!video.style.filter.includes('grayscale')) {
            video.style.filter = 'grayscale(100%)';
        }
    });
}


function removeComments() {
    // Find all comment threads
    const commentThreads = document.querySelectorAll('ytd-comment-thread-renderer, ytm-comment-thread-renderer');
    
    // Hide all comments after the first 3
    commentThreads.forEach((thread, index) => {
        if (index >= 3) {
            thread.style.display = 'none';
        }
    });
    
    // Also hide "Show more" or "Load more" buttons to prevent loading more comments
    const showMoreButtons = document.querySelectorAll(`
        ytd-continuation-item-renderer,
        .load-more-button,
        #continuations,
        ytd-comments-header-renderer #expand-button
    `);
    
    showMoreButtons.forEach(button => {
        button.style.display = 'none';
    });
}


function clearYouTubeHome() {
    if (window.location.hostname === 'www.youtube.com' && 
        (window.location.pathname === '/' || window.location.pathname === '')) {
        
        const contentsDiv = document.getElementById('contents');
        if (contentsDiv) {
            contentsDiv.innerHTML = '';
            // Prevent new content from loading
            contentsDiv.style.display = 'none';
        }
    }}

// Apply default boring level on page load
chrome.storage.sync.get(['boringLevel'], function(result) {
    if (result.boringLevel !== undefined) {
        applyBoringLevel(result.boringLevel);
    } else {
        // Default to level 0 (YouTube as usual) if no preference is set
        applyBoringLevel(0);
    }
});

// Keep applying effects periodically
setInterval(() => {
    chrome.storage.sync.get(['boringLevel'], function(result) {
        const level = result.boringLevel !== undefined ? result.boringLevel : 0;
        applyBoringLevel(level);
    });
}, 2000);

