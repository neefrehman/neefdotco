const lazyAdam = function() {

  const images = document.querySelectorAll("[data-src]");
  const observer = new IntersectionObserver(onIntersection, {
    rootMargin: "1500px 0px",
    threshold: 0.01
  });

  function loadImage(imageEl) {
    imageEl.style.backgroundImage = `url(${imageEl.getAttribute("data-src")})`;
    imageEl.removeAttribute("data-src");
  }

  images.forEach(function(image) {
    observer.observe(image);
  });

  function onIntersection(entries) {
    entries.forEach(function(entry) {
      if (entry.intersectionRatio > 0) {
        observer.unobserve(entry.target);
        loadImage(entry.target);
      }
    });
  }

};
