const lzy = (offset = 500) => {
    const images = document.querySelectorAll("[data-srcset]");

    const loadImage = (imageEl) => {
        const imageSource = imageEl.getAttribute("data-srcset");
        if (imageEl.tagName === "IMG") {
            imageEl.setAttribute("srcset", imageSource);
        } else {
            imageEl.style.backgroundImage = `url(${imageSource})`;
        }
        imageEl.removeAttribute("data-srcset");
    };

    if ("loading" in HTMLImageElement.prototype) {
        images.forEach((image) => loadImage(image));
        return;
    }

    const onIntersection = (entries) => {
        entries.forEach((entry) => {
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

    images.forEach((image) => observer.observe(image));
};
