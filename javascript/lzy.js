const lzy = (offset = 200) => {

    const images = document.querySelectorAll("[data-src]");
    
    const onIntersection = entries => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                observer.unobserve(entry.target);
                loadImage(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(onIntersection, {
        rootMargin: `${offset}px ${offset}px`,
        threshold: 0.01
    });

    const loadImage = imageEl => {
        imageEl.style.backgroundImage = `url(${imageEl.getAttribute("data-src")})`;
        imageEl.removeAttribute("data-src");
    };

    images.forEach(image => observer.observe(image));

};
