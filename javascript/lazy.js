const lazyImages = ({ rootMargin = "1500px 0px", threshold = 0.01 } = {}) => {
    const images = document.querySelectorAll("[data-src]");
    const config = {
        rootMargin,
        threshold
    };

    function noImageFound(event) {
        event.currentTarget.parentNode.classList.add("error");
        event.currentTarget.removeEventListener("error", noImageFound);
    }

    function showImage(event) {
        event.currentTarget.classList.add("show");
        event.currentTarget.removeEventListener("load", showImage);
    }

    function loadImage(imageEl) {
        imageEl.style.backgroundImage = `url(${imageEl.getAttribute("data-src")})`;
        ["data-src"].forEach(attr => imageEl.removeAttribute(attr));
        imageEl.addEventListener("load", showImage);
        imageEl.addEventListener("error", noImageFound);
    }

    if (!("IntersectionObserver" in window)) {
        // load all images upfront
        [].slice.call(images).forEach(function(image) {
          loadImage(image, noImageFound);
        });
    } else {
        var observer = new IntersectionObserver(onIntersection, config);
        images.forEach(function(image) {
            observer.observe(image);
        });

        function onIntersection(entries) {
            entries.forEach(function(entry) {
              if (entry.intersectionRatio > 0) {
                  observer.unobserve(entry.target);
                  loadImage(entry.target, noImageFound);
              }
          });
        }
    }
};
