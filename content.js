

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
    // Look for common Shorts selectors
    const shortsLinks = document.querySelectorAll(`
        a[href="/shorts"],
        a[href*="/shorts"],
        [title*="Shorts" i],
        ytd-guide-entry-renderer
    `);
    
    shortsLinks.forEach(element => {
        if (element.textContent.toLowerCase().includes('shorts') || 
            element.getAttribute('title')?.toLowerCase().includes('shorts')) {
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

