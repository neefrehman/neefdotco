// Header stretch
$(document).mousemove(function (e) {
    var width = $(document).width() / 255;
    var pageX = e.pageX / width;
    var pageY = e.pageY / width;
    var valueX = 0.15 + ((Math.abs(pageX) + 1200) / 1200);
    $("span.stretch").css("transform", "scale(" + valueX + "," + 1 + ")");
});
window.ondevicemotion = function (event) {
    var mobileX = event.accelerationIncludingGravity.x;
    var mobileY = event.accelerationIncludingGravity.y;
    var valueMobileX = 0.15 + ((Math.abs(mobileX) + 14) / 14);
    var valueMobileY = 0.15 + ((Math.abs(mobileY) + 14) / 14);
    if (window.innerHeight > window.innerWidth) {
        $("span.stretch").css("transform", "scale(" + valueMobileX + "," + 1 + ")");
    } else {
        $("span.stretch").css("transform", "scale(" + valueMobileY + "," + 1 + ")");
    }
};


// Photos
$(document).ready(function () {

    // Create elements & add HTML attributes
    var n = 55;
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

        // Relative scroll variables (pre-change)
        var pixelsScrolled = $(document).scrollTop();
        var pageHeight = $(document).height() - $(window).height();
        var decimalScrolled = (pixelsScrolled / pageHeight);

        // Execute grid view
        $("body, div").toggleClass("grid");

        // Maintain relative scroll height
        var newPageHeight = $(document).height() - $(window).height();
        $(document).scrollTop(decimalScrolled * newPageHeight);

        // Toggle button text
        if (this.innerHTML === "Full screen") {
            this.innerHTML = "Grid view";
            window.location.hash = "#full";
        } else {
            this.innerHTML = "Full screen";
            history.replaceState("", document.title, window.location.pathname);
        }

        // Re-unveil
        $("div").unveil(2000);

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
