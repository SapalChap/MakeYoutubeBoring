
const imgs = document.getElementsByTagName("img");
const blackImage = chrome.runtime.getURL("BoringYoutubeThumbnail.png");

for (image of imgs) {
    image.src = blackImage;
}
