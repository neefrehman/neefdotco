// Photo array variables
const n = 70;
const size = (window.innerWidth > 500) ? "large" : "small";
const r = () => 10 * (Math.floor(Math.random() * 9)) - 40;

// Create photo array
const photoArray = Array.from({length: n}, (photo, i) => {
    return `
        <div class="grid"
            data-src="photos/${size}/photo_${++i}.jpg"
            style="--x: ${r()}px; --y: ${r()}px"> </div>
    `;
});

// Shuffle
const shuffle = a => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// Add photos to DOM
const photoContainer = document.querySelector(".photo-container");
photoContainer.innerHTML = shuffle(photoArray).join("");
const photos = document.querySelectorAll("[data-src]");

// Lazy-load
lzy(1000);

// Zoom on click
photos.forEach(photo => {
    photo.addEventListener("click", () => {
        photo.classList.toggle("zoom");
        const siblings = [...photos].filter(sibling => sibling !== photo);
        siblings.forEach(sibling => sibling.classList.remove("zoom"));
    });
});

// Remove zoom on whitespace click
document.addEventListener("click", e => {
    if (!e.target.matches(".photo-container > .grid")) {
        photos.forEach(photo => photo.classList.remove("zoom"));
    }
});

// Full screen
const gridToggle = document.querySelector(".grid-toggle");
gridToggle.addEventListener("click", () => {

    // Scroll variables (pre-change)
    const scrollElement = document.scrollingElement;
    const pixelsScrolled = scrollElement.scrollTop;
    const pageHeight = scrollElement.scrollHeight - window.innerHeight;
    const decimalScrolled = pixelsScrolled / pageHeight;

    // Execute full screen
    photoContainer.classList.toggle("grid");
    photos.forEach(photo => photo.classList.toggle("grid"));

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

});

// Execute full screen if hash in URL
if (window.location.hash == "#full") gridToggle.click();

// Scroll 100vh on arrow press & grid toggle on g/f
window.onkeyup = e => {
    if (e.key == "ArrowRight") window.scrollBy(0, window.innerHeight);
    if (e.key == "ArrowLeft") window.scrollBy(0, -window.innerHeight);
    if (e.key == "g" || e.key == "f") gridToggle.click();
};
