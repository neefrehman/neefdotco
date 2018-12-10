const lazyAdam = ({ offset } = {}) => {

    const images = document.querySelectorAll("[data-src]");
    const config = {
        rootMargin: offset ? `${offset}px 0px` : "1000px 0px",
        threshold: 0.01
    };

    function loadImage(imageEl) {
        imageEl.style.backgroundImage = `url(${imageEl.getAttribute("data-src")})`;
        ["data-src"].forEach(attr => imageEl.removeAttribute(attr));
    }

    const observer = new IntersectionObserver(onIntersection, config);
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
