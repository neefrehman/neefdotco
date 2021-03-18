const photoContainer = document.querySelector(".photo-container");
let photos = photoContainer.querySelectorAll("img");

// Shuffle photos
const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

photoContainer.innerHTML = shuffle([...photos].map((photo) => photo.outerHTML)).join(
    ""
);

// Lazy-load
lzy(200);

// Ransomise size and offset
const randomOffset = () => 10 * Math.floor(Math.random() * 9) - 40;

photos = photoContainer.querySelectorAll("img"); // reset after shuffle
photos.forEach((photo) => {
    photo.style.setProperty("--x", `${randomOffset()}px`);
    photo.style.setProperty("--y", `${randomOffset()}px`);
    // Zoom on click
    photo.addEventListener("click", () => {
        photo.classList.toggle("zoom");
        const siblings = [...photos].filter((sibling) => sibling !== photo);
        siblings.forEach((sibling) => sibling.classList.remove("zoom"));
    });
});

// Un-zoom on background click
document.addEventListener("click", (e) => {
    if (!e.target.matches("a, .photo-container > .grid")) {
        photos.forEach((photo) => photo.classList.remove("zoom"));
    }
});

// Full screen
const gridToggle = document.querySelector(".grid-toggle");
const toggleFullScreen = () => {
    // Scroll variables (pre-change)
    const scrollElement = document.scrollingElement;
    const pixelsScrolled = scrollElement.scrollTop;
    const pageHeight = scrollElement.scrollHeight - window.innerHeight;
    const decimalScrolled = pixelsScrolled / pageHeight;

    // Execute full screen
    photoContainer.classList.toggle("grid");
    photos.forEach((photo) => photo.classList.toggle("grid"));

    // Maintain relative scroll height
    const newPageHeight = scrollElement.scrollHeight - window.innerHeight;
    scrollElement.scrollTop = decimalScrolled * newPageHeight;

    // Toggle button text & update URL
    if (gridToggle.innerHTML === "Full screen") {
        gridToggle.innerHTML = "Grid view";
        window.location.hash = "#full";
    } else {
        gridToggle.innerHTML = "Full screen";
        history.replaceState("", document.title, window.location.pathname);
    }
};

gridToggle.addEventListener("click", () => toggleFullScreen());
if (window.location.hash === "#full") toggleFullScreen();

// Scroll 100vh on arrow press & grid toggle on g/f
window.addEventListener("keyup", (e) => {
    if (e.key == "ArrowRight") window.scrollBy(0, window.innerHeight);
    if (e.key == "ArrowLeft") window.scrollBy(0, -window.innerHeight);
    if (e.key == "g" || e.key == "f") toggleFullScreen();
});
