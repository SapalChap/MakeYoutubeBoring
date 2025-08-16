

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
            
            console.log(`Changed: "${originalTitle}" -> "${lowerTitle}"`);
        }
    }
}


makeImagesBoring();
makeTitlesBoring();

setInterval(makeImagesBoring, 1000);
setInterval(makeTitlesBoring, 1000);

