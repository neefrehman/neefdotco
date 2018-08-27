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


// Randomise photo order
function randomiseOrder () {
var cards = $("section");
for(var i = 0; i < cards.length; i++){
    var target = Math.floor(Math.random() * cards.length -1) + 1;
    var target2 = Math.floor(Math.random() * cards.length -1) +1;
    cards.eq(target).before(cards.eq(target2));
}};


// Grid view
$("#grid_toggle").click(function() {
    $("body").toggleClass("grid");
    $("section").toggleClass("grid");
    $("section").unveil(3000);
    if (this.innerHTML === "Grid view") {
        this.innerHTML = "Full screen";
        window.location.hash = "#grid";
    } else {
        this.innerHTML = "Grid view";
        history.replaceState("", document.title, window.location.pathname);
    }
});


// Zoom on click
$("section").click(function() {
    $("section").not(this).removeClass('zoom');
    $(this).toggleClass("zoom");
});


// Add data-src & onclick HTML attributes, randomise order, execute grid view if hash exists, unveil
$(document).ready(function () {
    $.each($("section"), function(index, value) {
        var num = index + 1;
        $(value).attr("data-src", "images/image_" + num + ".jpg");
        $(this).attr("onClick", "void(0)");
    });
    randomiseOrder();
    if (window.location.hash === "#grid") {
        $("#grid_toggle").click();
    }
    $("section").unveil(3000);
});


// Console log
console.log("Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯")
