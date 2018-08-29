// Header stretch
$(document).mousemove(function(e) {
    var width = $(document).width() / 255;
    var pageX = e.pageX / width;
    var pageY = e.pageY / width;
    var valueX = ( Math.abs(pageX) + 750 ) / 750;
    $("span.stretch").css("transform", "scale(" + valueX + "," + 1 + ")");
});
window.ondevicemotion = function(event) {
    var mobileX = event.accelerationIncludingGravity.x;
    var mobileY = event.accelerationIncludingGravity.y;
    var mobileZ = event.accelerationIncludingGravity.z;
    var valueMobileX = ( Math.abs(mobileX) + 15 ) / 15;
    var valueMobileY = ( Math.abs(mobileY) + 15 ) / 15;
    $("span.stretch").css("transform", "scale(" + valueMobileX + "," + 1 + ")");
    if(window.innerWidth > window.innerHeight) {
        $("span.stretch").css("transform", "scale(" + valueMobileY + "," + 1 + ")");
    }
}


// Photos
$(document).ready(function() {
    // Create elements & add data-src HTML attribute
    var n = 44
    $("footer").after(new Array(++n).join("<div></div>"));
    $.each($("div"), function(index, value) {
        var num = index + 1;
        $(value).attr({
            "data-src": "images/image_" + num + ".jpg",
            "class": "grid"
        });
    });
    // Randomise
    var cards = $("div");
    for(var i = 0; i < cards.length; i++){
        var target = Math.floor(Math.random() * cards.length -1) + 1;
        var target2 = Math.floor(Math.random() * cards.length -1) +1;
        cards.eq(target).before(cards.eq(target2));
    };
    // unveil
    $("div").unveil(3000);
    // Grid view & if hash execute
    $("#grid_toggle").click(function() {
        $("body").toggleClass("grid");
        $("div").toggleClass("grid");
        $("div").unveil(3000);
        if (this.innerHTML === "Full screen") {
            this.innerHTML = "Grid view";
            window.location.hash = "#full";
        } else {
            this.innerHTML = "Full screen";
            history.replaceState("", document.title, window.location.pathname);
        }
    });
    if (window.location.hash === "#full") {
        $("#grid_toggle").click();
    }
    // Zoom on click
    $("div").click(function() {
        $(this).toggleClass("zoom")
        .siblings().removeClass("zoom");
    });
    $(document).click(function(e) {
        var element = $("div");
        if (!element.is(e.target) && element.has(e.target).length === 0)
            element.removeClass("zoom");
    });
});


// Console log
console.log("Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯")
