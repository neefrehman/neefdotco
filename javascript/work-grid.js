const workArray = [
    {
        name: "studiowave",
        title: "studiowave.fm",
        description:
            "A simple webapp dishing out chillout tunes and inspiration"
    },
    {
        name: "adventure",
        title: "ustwo Adventure",
        description:
            "New site and art direction for the investment arm of ustwo"
    },
    {
        name: "generative",
        title: "Generative",
        description: "An ongoing series of digital sketches using p5js"
    }
];

let workElements = workArray.map(obj => {
    return `
        <a class="work-item nav" href="/work/${obj.name}.html">
            <video playsinline loop muted
                data-src="/work/assets/${obj.name}/thumbnail_video.mp4"
                poster="/work/assets/${obj.name}/thumbnail.png">
            </video>
            <div class="project-text-container">
                <h2>${obj.title}</h2>
                <p>
                    ${obj.description}
                </p>
            </div>
        </a>
    `;
});

const workGrid = workElements.join("");
const workGridContainer = document.querySelector(".work-grid");
workGridContainer.insertAdjacentHTML("afterbegin", workGrid);

workElements = document.querySelectorAll(".work-item");

const loadVideo = videoEl => {
    const videoSource = videoEl.getAttribute("data-src");
    if (videoSource) {
        videoEl.setAttribute("src", videoSource);
        videoEl.removeAttribute("data-src");
    }
};

// Mouse hover - Computer
if (matchMedia("(pointer:fine)").matches) {
    workElements.forEach(item => {
        const thumbnailVideo = item.querySelector("video");
        loadVideo(thumbnailVideo);

        item.addEventListener("mouseenter", () => thumbnailVideo.play());
        item.addEventListener("mouseleave", () => thumbnailVideo.pause());
    });

    // Intersection Observer - Mobile
} else if (window.innerWidth <= 450) {
    let yOffset, isScrollingUp, isScrollingDown;

    const onIntersection = entries => {
        entries.forEach(entry => {
            const intersectedItem = entry.target;
            const allThumbnailVideos = document.querySelectorAll(
                ".work-item video"
            );

            isScrollingUp = window.scrollY < yOffset;
            isScrollingDown = window.scrollY > yOffset;
            yOffset = window.scrollY;

            const entryIsFirstOrLast =
                intersectedItem === workElements[0] ||
                intersectedItem === workElements[workElements.length - 1];
            const relativeScroll =
                entryIsFirstOrLast && intersectedItem === workElements[0]
                    ? isScrollingUp
                    : isScrollingDown;
            const ratioTarget = entryIsFirstOrLast && relativeScroll ? 0.5 : 0;

            if (entry.intersectionRatio > ratioTarget) {
                workElements.forEach(item =>
                    item.classList.remove("intersected")
                );
                intersectedItem.classList.add("intersected");

                const thumbnailVideo = intersectedItem.querySelector("video");
                loadVideo(thumbnailVideo);

                allThumbnailVideos.forEach(video => video.pause());
                thumbnailVideo.play();
            } else if (entryIsFirstOrLast) {
                workElements.forEach(item =>
                    item.classList.remove("intersected")
                );
                allThumbnailVideos.forEach(video => video.pause());
            }
        });
    };

    const observer = new IntersectionObserver(onIntersection, {
        rootMargin: "-22%",
        threshold: 0.5
    });

    workElements.forEach(item => observer.observe(item));
}
