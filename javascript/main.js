// Header stretch
var $document = $(document);

$document.mousemove(function(e) {
    var width = $document.width() / 255;
    var pageX = e.pageX / width;
    var pageY = e.pageY / width;
    var valueX = ( Math.abs(pageX) + 700 ) / 700;
    $("span.stretch").css("transform", "scale(" + valueX + "," + 1 + ")");
});
window.ondevicemotion = function(event) {
  var mobileX = event.accelerationIncludingGravity.x;
  var mobileY = event.accelerationIncludingGravity.y;
  var mobileZ = event.accelerationIncludingGravity.z;
  var valueMobileX = ( Math.abs(mobileX) + 14 ) / 14;
  var valueMobileY = ( Math.abs(mobileY) + 14 ) / 14;
  $("span.stretch").css("transform", "scale(" + valueMobileX + "," + 1 + ")");
  if(window.innerWidth > window.innerHeight) {
    $("span.stretch").css("transform", "scale(" + valueMobileY + "," + 1 + ")");
  }
}


// Randomise photo order
var cards = $("section");
for(var i = 0; i < cards.length; i++){
    var target = Math.floor(Math.random() * cards.length -1) + 1;
    var target2 = Math.floor(Math.random() * cards.length -1) +1;
    cards.eq(target).before(cards.eq(target2));
}


// Grid view
$(".grid_toggle").click(function() {
  $("body").toggleClass("grid");
  $("section").toggleClass("grid");
  $("section").trigger("unveil");

  var x = document.getElementById("toggle");
  if (x.innerHTML === "Grid") { x.innerHTML = "Full"; }
  else { x.innerHTML = "Grid"; }
});


// unveil
$(document).ready(function() {
  $("section").unveil(3000);
});
