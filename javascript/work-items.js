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
if (matchMedia("(pointer:fine)").matches && window.innerWidth > 450) {

    workItemElements.forEach(item => {
        const thumbnailVideo = item.querySelector("video");

        item.addEventListener("mouseenter", () => {
            thumbnailVideo.play();
        });

        item.addEventListener("mouseleave", () => {
            thumbnailVideo.pause();
        });
    });

// Intersection Observer - Mobile
} else {

    const allThumbnailVideos = document.querySelectorAll(".work-item video");

    const onIntersection = entries => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                const thumbnailVideo = entry.target.querySelector("video");
                allThumbnailVideos.forEach(video => video.pause());
                thumbnailVideo.play();
            }
        });
    };

    const observer = new IntersectionObserver(onIntersection, {
        rootMargin: "-25%",
        threshold: 0.5
    });

    workItemElements.forEach(item => observer.observe(item));

}