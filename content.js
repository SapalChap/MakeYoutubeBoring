

const blackImage = chrome.runtime.getURL("BoringYoutubeThumbnail.png");


function makeImagesBoring(){
    const imgs = document.getElementsByTagName("img");
    
    for (image of imgs) {
        
        if (image.src !== blackImage) {
            image.src = blackImage;
        }
     }
}



function makeTitlesBoring(){

    const videoTitles = document.querySelectorAll("h3[title], a#video-title")
    const boringTitles = [];

    for (let titleElement of videoTitles){
        let originalTitle = titleElement.getAttribute("title") || titleElement.textContent;

        if (originalTitle) { //make lower case
            let lowerTitle = originalTitle.toLowerCase();
            titleElement.textContent = lowerTitle;
            titleElement.setAttribute("title", lowerTitle);

            if (titleElement.hasAttribute("title")) {
                console.log("Successfully changed to lower case")
                titleElement.setAttribute("title", lowerTitle);
            }            
            
        }
    } }


makeImagesBoring();
makeTitlesBoring();

setInterval(makeImagesBoring, 1000);
setInterval(makeTitlesBoring, 1000);

