const workArray = [
    {
        iframesrc: "/work/generative/",
        url: "https://generative.neef.co",
        title: "Generative",
        description:
            "An ongoing digital sketch series exploring generative art, WebGL and machine learning"
    },
    {
        iframesrc: "/work/millzbot/",
        url: "https://millzbot.neef.co",
        title: "millzbot",
        description:
            "A GPT-2 bot trained on my bosses tweets, and a guide to making your own"
    },
    {
        iframesrc: "/work/adventurev2/",
        url: "https://adventure.ustwo.com",
        title: "ustwo Adventure",
        description: "New site and art direction for the investment arm of ustwo"
    },
    {
        iframesrc: "/work/make-matrix/",
        url: "https://github.com/neefrehman/make-matrix",
        title: "make-matrix",
        description:
            "A simple, type-safe way to create multi-dimensional arrays in JavaScript"
    },
    {
        iframesrc: "https://manyworlds.neef.co/?no-ui&iframe-link",
        url: "https://manyworlds.neef.co",
        title: "many worlds",
        description: "A scifi-inspired study of signed distance functions in WegGL"
    },
    {
        iframesrc: "/work/studiowave/",
        url: "https://studiowave.fm",
        title: "studiowave.fm",
        description: "A simple webapp dishing out chillout tunes and inspiration"
    }
];

let workElements = workArray.map((obj) => {
    return `
        <div class="no-hide transition">
            <a class="work-item" href=${obj.url} target="_blank" rel="noopener noreferrer">
                <iframe class="media" src=${obj.iframesrc} title="embedded iframe" loading="lazy"> </iframe>
                <div class="project-text-container">
                    <h2>${obj.title}</h2>
                    <p>
                        ${obj.description}
                    </p>
                </div>
            </a>
        </div>
    `;
});

const workGrid = workElements.join("");
const workGridContainer = document.querySelector(".work-grid");
workGridContainer.insertAdjacentHTML("afterbegin", workGrid);

// Intersection Observer - Mobile
if (window.innerWidth <= 450) {
    workElements = document.querySelectorAll(".work-item");
    let yOffset, isScrollingUp, isScrollingDown;

    const onIntersection = (entries) => {
        entries.forEach((entry) => {
            const intersectedItem = entry.target;

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
                workElements.forEach((item) => item.classList.remove("intersected"));
                intersectedItem.classList.add("intersected");
            } else if (entryIsFirstOrLast) {
                workElements.forEach((item) => item.classList.remove("intersected"));
            }
        });
    };

    const observer = new IntersectionObserver(onIntersection, {
        rootMargin: "-22%",
        threshold: 0.5
    });

    workElements.forEach((item) => observer.observe(item));
} else {
    // Loaded animation - Desktop
    const transitionElements = document.querySelectorAll(".transition");
    document.addEventListener("DOMContentLoaded", () => {
        transitionElements.forEach((el, i) => {
            setTimeout(() => el.classList.add("loaded"), 200 + i * 280);
        });
    });
}
