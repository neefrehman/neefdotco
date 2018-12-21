// Night mode
const body = document.querySelector("body");
const links = document.querySelectorAll("a");
const nightModeToggle = document.documentElement;
const nightMode = () => {
    body.classList.toggle("night");
    links.forEach(link => link.classList.toggle("night"));

    if (body.classList.contains("night")) {
        localStorage.setItem("nightMode", true);
    } else {
        localStorage.removeItem("nightMode");
    }
};

// Toggle if in storage
if (localStorage.getItem("nightMode")) nightMode();

// Triggers
nightModeToggle.addEventListener("dblclick", e => {
    if (!e.target.matches(".photo-container > .grid")) nightMode();
});

window.onkeyup = e => {
    if (e.key == "n" || e.key == "d") nightMode();
};


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
    lazyAdam();

    // Grid view
    const gridToggle = document.querySelector("#grid_toggle");
    gridToggle.addEventListener("click", function() {

        // Scroll variables (pre-change)
        const scrollEl = document.scrollingElement;
        const scrollValue = scrollEl.scrollTop;
        const pageHeight = scrollEl.scrollHeight - window.innerHeight;
        const decimalScrolled = scrollValue / pageHeight;

        // Execute grid view
        photoContainer.classList.toggle("grid");
        photos.forEach(photo => photo.classList.toggle("grid"));

        // Maintain relative scroll height
        const newPageHeight = scrollEl.scrollHeight - window.innerHeight;
        scrollEl.scrollTop = decimalScrolled * newPageHeight;

        // Toggle button text & update URL
        if (this.innerHTML === "Full screen") {
            this.innerHTML = "Grid view";
            window.location.hash = "#full";
        } else {
            this.innerHTML = "Full screen";
            history.replaceState("", document.title, window.location.pathname);
        }

    });

    // Execute grid view if hash in URL
    if (window.location.hash == "#full") gridToggle.click();

    // Zoom photos on click
    photos.forEach(photo => {
        photo.addEventListener("click", function() {
            this.classList.toggle("zoom");
            const siblings = [...photos].filter(sibling => sibling !== this);
            siblings.forEach(sibling => sibling.classList.remove("zoom"));
        });
    });

    // Remove zoom on whitespace click
    document.addEventListener("click", e => {
        if (!e.target.matches(".photo-container > .grid")) {
            photos.forEach(photo => photo.classList.remove("zoom"));
        }
    });

    // Scroll 100vh on arrow press & grid toggle on g/f
    window.onkeyup = e => {
        if (e.key == "ArrowRight") window.scrollBy(0, window.innerHeight);
        if (e.key == "ArrowLeft") window.scrollBy(0, -window.innerHeight);
        if (e.key == "g" || e.key == "f") gridToggle.click();
    };

}


// Console log
console.log("Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯");
