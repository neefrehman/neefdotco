const workArray = [
    {
        dir: "studiowave",
        tempurl: "https://studiowave.fm",
        title: "studiowave.fm",
        description:
            "A simple webapp dishing out chillout tunes and inspiration"
    },
    {
        dir: "adventure",
        tempurl: "https://adventure.ustwo.com",
        title: "ustwo Adventure",
        description:
            "New site and art direction for the investment arm of ustwo"
    },
    {
        dir: "generative",
        tempurl: "https://generative.neef.co",
        title: "Generative",
        description:
            "An ongoing series of digital sketches, generated with p5.js"
    }
];

let workElements = workArray.map(obj => {
    return `
        <a class="work-item" href=${
            obj.tempurl
        } target="_blank" rel="noopener noreferrer">
            <video playsinline loop muted
                data-src="/work/assets/${obj.dir}/thumbnail_video.mp4"
                poster="/work/assets/${obj.dir}/thumbnail.png">
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
