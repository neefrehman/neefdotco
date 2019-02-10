// Dark mode (localStorage trigger in html <head>)
const darkModeToggle = document.documentElement;
const darkMode = () => document.documentElement.classList.toggle("dark");

darkModeToggle.addEventListener("dblclick", e => {
    if (!e.target.matches(".photo-container > .grid")) darkMode();

    if (document.documentElement.classList.contains("dark")) {
        localStorage.setItem("darkMode", true);
    } else {
        localStorage.removeItem("darkMode");
    }
});


// Header stretch
const title = document.querySelector("span.stretch");
if (title) {

    document.onmousemove = e => {
        const mousePosition = e.pageX / document.body.clientWidth;
        const stretchValue = 1.1 + (mousePosition / 5);
        title.style.transform = `scale(${stretchValue}, 1)`;
    };

    window.ondevicemotion = e => {
        const deviceTilt = (window.innerHeight > window.innerWidth) ?
            e.accelerationIncludingGravity.x : e.accelerationIncludingGravity.y;
        const stretchValue = 1.1 + (Math.abs(deviceTilt) / 15);
        title.style.transform = `scale(${stretchValue}, 1)`;
    };

}


// Photos
const photoContainer = document.querySelector(".photo-container");
if (photoContainer) {

    // Create & insert shuffled div array
    const n = 56;
    const photoArray = Array.from({length: n}, (item, i) =>
        `<div class="grid" data-src="photos/photo_${++i}.jpg"> </div>`
    );
    photoContainer.innerHTML = shuffle(photoArray).join("");
    const photos = document.querySelectorAll("[data-src]");

    // Lazy-load
    lzy(1000);

    const r = () => 10 * (Math.floor(Math.random() * 9)) - 40;
    photos.forEach(photo => {
        // Generate random variables for size & translate
        photo.style.setProperty("--x", `${r()}px`);
        photo.style.setProperty("--y", `${r()}px`);

        // Zoom on click
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
    const gridToggle = document.querySelector("#grid_toggle");
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

}


// Console log
console.log("Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯");
