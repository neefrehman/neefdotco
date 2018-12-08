// jshint esversion: 6

// Header stretch
const stretch = document.querySelector("span.stretch");
if (document.body.contains(stretch)) {

    document.onmousemove = function (e) {
        let width = document.body.clientWidth / 255;
        let pageX = e.pageX / width;
        let pageY = e.pageY / width;
        let valueX = 0.1 + ((Math.abs(pageX) + 1200) / 1200);
        stretch.style.transform = `scale(${valueX}, 1)`;
    };

    window.ondevicemotion = function (e) {
        let mobileX = e.accelerationIncludingGravity.x;
        let mobileY = e.accelerationIncludingGravity.y;
        let valueX = 0.1 + ((Math.abs(mobileX) + 16) / 16);
        let valueY = 0.1 + ((Math.abs(mobileY) + 16) / 16);
        if (window.innerHeight > window.innerWidth) {
            stretch.style.transform = `scale(${valueX}, 1)`;
        } else {
            stretch.style.transform = `scale(${valueY}, 1)`;
        }
    };

}


// Photos
const photoChecker = document.querySelector("footer.photos");
if (document.body.contains(photoChecker)) {

    // Create divs
    let n = 56;
    var photoArray = Array.from({ length: n }, function (item, i) {
        return `<div class="grid"
                     data-src="photos/photo_${++i}.jpg"> </div>`;
    }).join('');
    $(photoChecker).after(photoArray);

    // Declare photos variable
    const photos = $("div");

    // Randomise order
    for (let i = 0; i < photos.length; i++) {
        let target = Math.floor(Math.random() * photos.length -1) + 1;
        let target2 = Math.floor(Math.random() * photos.length -1) + 1;
        photos.eq(target).before(photos.eq(target2));
    }

    // unveil
    photos.unveil(2000);

    // Grid view
    $("#grid_toggle").click(function () {

        // Scroll variables (pre-change)
        let pixelsScrolled = $(document).scrollTop();
        let pageHeight = $(document).height() - $(window).height();
        let decimalScrolled = (pixelsScrolled / pageHeight);

        // Execute grid view
        $("body, div").toggleClass("grid");

        // Maintain relative scroll height
        let newPageHeight = $(document).height() - $(window).height();
        $(document).scrollTop(decimalScrolled * newPageHeight);

        // Re-unveil
        photos.unveil(2000);

        // Toggle button text & update URL
        if (this.innerHTML === "Full screen") {
            this.innerHTML = "Grid view";
            window.location.hash = "#full";
        } else {
            this.innerHTML = "Full screen";
            history.replaceState("", document.title, window.location.pathname);
        }

        return false;

    });

    // Execute grid view if hash in URL
    if (window.location.hash === "#full") {
        $("#grid_toggle").click();
    }

    // Zoom photos on click
    photos.click(function () {
        $(this).toggleClass("zoom")
        .siblings().removeClass("zoom");
    });

    // Remove zoom on whitespace click
    $(document).click(function (e) {
        if (!photos.is(e.target) && photos.has(e.target).length === 0) {
            photos.removeClass("zoom");
        }
    });

}


// Console log
console.log("Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯");
