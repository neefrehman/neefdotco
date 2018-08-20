// Header stretch
var $document = $(document);

$document.mousemove(function(e) {
    var width = $document.width() / 255;
    var pageX = e.pageX / width;
    var pageY = e.pageY / width;
    var valueX = (pageX + 300) / 300;
    $("span.stretch").css("transform", "scale(" + valueX + "," + 1 + ")");
});
window.ondevicemotion = function(event) {
  var mobileX = event.accelerationIncludingGravity.x;
  var mobileY = event.accelerationIncludingGravity.y;
  var mobileZ = event.accelerationIncludingGravity.z;
  var mobileValueX = (mobileX +5)/6;
  $("span.stretch").css("transform", "scale(" + mobileValueX + "," + 1 + ")");
}


// Randomise photo order
var cards = $("section");
for(var i = 0; i < cards.length; i++){
    var target = Math.floor(Math.random() * cards.length -1) + 1;
    var target2 = Math.floor(Math.random() * cards.length -1) +1;
    cards.eq(target).before(cards.eq(target2));
}


// unveil
$(document).ready(function() {
  $("section").unveil(3000);
});
