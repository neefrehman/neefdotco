// jshint esversion: 6
// Header stretch
const stretch = document.querySelector("span.stretch");
document.onmousemove = function (e) {
    let width = document.body.clientWidth / 255;
    let pageX = e.pageX / width;
    let pageY = e.pageY / width;
    let valueX = 0.1 + ( (Math.abs(pageX) + 1200 ) / 1200);
    stretch.style.transform = `scale(${valueX}, 1)`;
};
window.ondevicemotion = function (e) {
    let mobileX = e.accelerationIncludingGravity.x;
    let mobileY = e.accelerationIncludingGravity.y;
    let valueX = 0.1 + ( (Math.abs(mobileX) + 16 ) / 16);
    let valueY = 0.1 + ( (Math.abs(mobileY) + 16 ) / 16);
    if (window.innerHeight > window.innerWidth) {
        stretch.style.transform = `scale(${valueX}, 1)`;
    } else {
        stretch.style.transform = `scale(${valueY}, 1)`;
    }
};

// Photos
$(document).ready(function () {

    // Create elements & add HTML attributes
    var n = 56;
    $("footer").after(new Array(++n).join("<div></div>"));
    $.each($("div"), function (index, value) {
        var num = index + 1;
        $(value).attr({
            "data-src": "photos/photo_" + num + ".jpg",
            "class": "grid"
        });
    });

    // Randomise order
    var cards = $("div");
    for (var i = 0; i < cards.length; i++) {
        var target = Math.floor(Math.random() * cards.length -1) + 1;
        var target2 = Math.floor(Math.random() * cards.length -1) + 1;
        cards.eq(target).before(cards.eq(target2));
    }

    // unveil
    $("div").unveil(2000);

    // Grid view
    $("#grid_toggle").click(function () {

        // Scroll variables (pre-change)
        var pixelsScrolled = $(document).scrollTop();
        var pageHeight = $(document).height() - $(window).height();
        var decimalScrolled = (pixelsScrolled / pageHeight);

        // Execute grid view
        $("body, div").toggleClass("grid");

        // Maintain relative scroll height
        var newPageHeight = $(document).height() - $(window).height();
        $(document).scrollTop(decimalScrolled * newPageHeight);

        // Re-unveil
        $("div").unveil(2000);

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
        $("#grid_toggle").click();
    }

    // Zoom photos on click
    $("div").click(function () {
        $(this).toggleClass("zoom")
        .siblings().removeClass("zoom");
    });

    // Remove zoom on whitespace click
    $(document).click(function (e) {
        var element = $("div");
        if (!element.is(e.target) && element.has(e.target).length === 0) {
            element.removeClass("zoom");
        }
    });

});


// Console log
console.log("Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯");
