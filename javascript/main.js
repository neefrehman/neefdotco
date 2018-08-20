// Header stretch
var $document = $(document);

$document.mousemove(function(e) {
    var width = $document.width() / 255;
    var pageX = e.pageX / width;
    var pageY = e.pageY / width;
    var valueX = pageX + 150;
    var valueY = pageY;
    $("span.stretch").css("transform", "scale(" + valueX/200 + "," + 1 + ")");
});
window.ondevicemotion = function(event) {
  var x = event.accelerationIncludingGravity.x;
  var y = event.accelerationIncludingGravity.y;
  var z = event.accelerationIncludingGravity.z;
  $("span.stretch").css("transform", "scale(" + (Math.abs(x)+5)/5 + "," + 1 + ")");
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
