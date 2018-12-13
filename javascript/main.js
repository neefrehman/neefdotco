// Header stretch
const title = document.querySelector("span.stretch");
if (document.body.contains(title)) {

    document.onmousemove = function(e) {
        let width = document.body.clientWidth / 255;
        let mousePosition = e.pageX / width;
        let stretchValue = 0.1 + (mousePosition + 1200) / 1200;
        title.style.transform = `scale(${stretchValue}, 1)`;
    };

    window.ondevicemotion = function(e) {
        let deviceTilt = (window.innerHeight > window.innerWidth) ?
            e.accelerationIncludingGravity.x : e.accelerationIncludingGravity.y;
        let stretchValue = 0.1 + ((Math.abs(deviceTilt) + 16) / 16);
        title.style.transform = `scale(${stretchValue}, 1)`;
    };

}


// Photos
const photoContainer = document.querySelector(".photo-container");
if (document.body.contains(photoContainer)) {

    // Create divs
    let n = 56;
    let photoArray = Array.from({length: n}, function(item, i) {
        return `<div class="grid" data-src="photos/photo_${++i}.jpg"> </div>`;
    }).join('');
    photoContainer.innerHTML = photoArray;

    // Declare photos variable
    const photos = document.querySelectorAll("[data-src]");
    const photosJ = $("[data-src]");

    // Randomise order
    for (let i = 0; i < photos.length; i++) {
        let target = Math.floor(Math.random() * photos.length -1) + 1;
        let target2 = Math.floor(Math.random() * photos.length -1) + 1;
        photosJ.eq(target).before(photosJ.eq(target2));
    }

    // Lazy-load
    lazyAdam();

    // Grid view
    const gridToggle = document.querySelector("#grid_toggle");
    gridToggle.addEventListener("click", function() {

        // Scroll variables (pre-change)
        let scrollValue = document.documentElement.scrollTop;
        let pageHeight = $(document).height() - $(window).height();
        let decimalScrolled = scrollValue / pageHeight;

        // Execute grid view
        photoContainer.classList.toggle("grid");
        photos.forEach(photo => photo.classList.toggle("grid"));

        // Maintain relative scroll height
        let newPageHeight = $(document).height() - $(window).height();
        document.documentElement.scrollTop = decimalScrolled * newPageHeight;

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
    photos.forEach(function(photo) {
        photo.addEventListener( "click", function() {
            this.classList.toggle("zoom");
            const siblings = [...photos].filter(sibling => sibling !== this);
            siblings.forEach(sibling => sibling.classList.remove("zoom"));
        });
    });

    // Remove zoom on whitespace click
    document.addEventListener("click", function(e) {
        if (!photosJ.is(e.target)) {
            photos.forEach(photo => photo.classList.remove("zoom"));
        }
    });

}


// Console log
console.log("Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯");
