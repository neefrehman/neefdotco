const lzy = (offset = 500) => {

    const images = document.querySelectorAll("[data-src]");

    if (!window.IntersectionObserver) {
        images.forEach(image => {
            const imageSource = image.getAttribute("data-src");
            if (image.tagName === "IMG") {
                image.setAttribute("src", imageSource);
            } else {
                image.style.backgroundImage = `url(${imageSource})`;
            }
            image.removeAttribute("data-src");
        });
    } else {

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
            const imageSource = imageEl.getAttribute("data-src");
            if (imageEl.tagName === "IMG") {
                imageEl.setAttribute("src", imageSource);
            } else {
                imageEl.style.backgroundImage = `url(${imageSource})`;
            }
            imageEl.removeAttribute("data-src");
        };

        images.forEach(image => observer.observe(image));
    }

};