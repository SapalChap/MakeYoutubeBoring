

const blackImage = chrome.runtime.getURL("BoringYoutubeThumbnail.png");


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


makeImagesBoring();
makeTitlesBoring();
removeShorts();
removeSidebar();


setInterval(makeImagesBoring, 1000);
setInterval(makeTitlesBoring, 1000);
setInterval(removeShorts, 2000);
setInterval(removeSidebar, 1000); 

