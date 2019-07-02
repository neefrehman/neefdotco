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


const workItemElements = workItemArray.map(obj => {
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