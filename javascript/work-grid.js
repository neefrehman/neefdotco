const workItemArray = [
    {
        name: "studiowave",
        title: "studiowave.fm",
        description: "A simple webapp dishing out chillout tunes and inspiration"
    },
    {
        name: "adventure",
        title: "ustwo Adventure",
        description: "New site and art direction for the investment arm of ustwo"
    },
    {
        name: "generative",
        title: "Generative",
        description: "An ongoing series of digital sketches using p5js"
    }
];


let workItemElements = workItemArray.map(obj => {
    return `
        <a class="work-item nav" href="/work/${obj.name}.html">
            <video playsinline loop muted
                src="/work/assets/${obj.name}/thumbnail_video.mp4"
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


const workItemGrid = workItemElements.join("");
const workItemGridContainer = document.querySelector(".work-grid");
workItemGridContainer.insertAdjacentHTML("afterbegin", workItemGrid);


workItemElements = document.querySelectorAll(".work-item");

// Mouse hover - Computer
if (matchMedia("(pointer:fine)").matches) {

    workItemElements.forEach(item => {
        const thumbnailVideo = item.querySelector("video");
        
        item.addEventListener("mouseenter", () => thumbnailVideo.play());
        item.addEventListener("mouseleave", () => thumbnailVideo.pause());
    });

// Intersection Observer - Mobile
} else if (window.innerWidth <= 450) {

    let yOffset, isScrollingUp, isScrollingDown, relativeScroll;

    const onIntersection = entries => {
        entries.forEach(entry => {
            const intersectedItem = entry.target;
            const allThumbnailVideos = document.querySelectorAll(".work-item video");

            isScrollingUp = window.scrollY < yOffset;
            isScrollingDown = window.scrollY > yOffset;
            yOffset = window.scrollY;

            const entryIsFirstOrLast = intersectedItem == workItemElements[0] || intersectedItem == workItemElements[workItemElements.length - 1];
            if (entryIsFirstOrLast) relativeScroll = intersectedItem == workItemElements[0]
                ? isScrollingUp
                : isScrollingDown;
            const ratioTarget = (entryIsFirstOrLast && relativeScroll) ? 0.5 : 0;

            if (entry.intersectionRatio > ratioTarget) {
                workItemElements.forEach(item => item.classList.remove("intersected"));
                intersectedItem.classList.add("intersected");

                const thumbnailVideo = intersectedItem.querySelector("video");
                allThumbnailVideos.forEach(video => video.pause());
                thumbnailVideo.play();
            } else if (entryIsFirstOrLast) {
                workItemElements.forEach(item => item.classList.remove("intersected"));
                allThumbnailVideos.forEach(video => video.pause());
            }
        });
    };

    const observer = new IntersectionObserver(onIntersection, {
        rootMargin: "-22.5%",
        threshold: 0.5
    });

    workItemElements.forEach(item => observer.observe(item));

}