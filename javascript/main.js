// Header stretch
const stretch = document.querySelector("span.stretch");
if (document.body.contains(stretch)) {

    document.onmousemove = function(e) {
        let width = document.body.clientWidth / 255;
        let pageX = e.pageX / width;
        let valueX = 0.1 + ((Math.abs(pageX) + 1200) / 1200);
        stretch.style.transform = `scale(${valueX}, 1)`;
    };

    window.ondevicemotion = function(e) {
        if (window.innerHeight > window.innerWidth) {
            let mobileX = e.accelerationIncludingGravity.x;
        } else {
            let mobileX = e.accelerationIncludingGravity.y;
        }
        let valueX = 0.1 + ((Math.abs(mobileX) + 16) / 16);
        stretch.style.transform = `scale(${valueX}, 1)`;
    };

}


// Photos
const photoContainer = document.querySelector(".photo-container");
if (document.body.contains(photoContainer)) {

    // Create divs
    let n = 56;
    var photoArray = Array.from({length: n}, function(item, i) {
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
        let pixelsScrolled = $(document).scrollTop();
        let pageHeight = $(document).height() - $(window).height();
        let decimalScrolled = (pixelsScrolled / pageHeight);

        // Execute grid view
        $(".photo-container, div").toggleClass("grid");

        // Maintain relative scroll height
        let newPageHeight = $(document).height() - $(window).height();
        $(document).scrollTop(decimalScrolled * newPageHeight);

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
    if (window.location.hash === "#full") {
        gridToggle.click();
    }

    // Zoom photos on click
    photosJ.click(function() {
        $(this).toggleClass("zoom")
        .siblings().removeClass("zoom");
    });

    // Remove zoom on whitespace click
    document.addEventListener("click", function(e) {
        if (!photosJ.is(e.target) && photosJ.has(e.target).length === 0) {
            photosJ.removeClass("zoom");
        }
    });

}


// Console log
console.log("Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯");
