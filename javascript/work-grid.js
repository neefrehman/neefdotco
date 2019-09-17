const workArray = [
    {
        iframesrc: "/work/studiowave/iframe/",
        url: "https://studiowave.fm",
        title: "studiowave.fm",
        description: "A simple webapp dishing out chillout tunes and inspiration"
    },
    {
        iframesrc: "/work/adventurev2/iframe/",
        url: "https://adventure.ustwo.com",
        title: "ustwo Adventure",
        description: "New site and art direction for the investment arm of ustwo"
    },
    {
        iframesrc: "/work/generative/iframe/",
        url: "https://generative.neef.co",
        title: "Generative",
        description: "An ongoing series of digital sketches, generated with p5.js"
    }
];

let workElements = workArray.map(obj => {
    return `
        <a class="work-item" href=${obj.url} target="_blank" rel="noopener noreferrer">
            <iframe class="media" src=${obj.iframesrc} loading="lazy"> </iframe>
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

// Intersection Observer - Mobile
if (window.innerWidth <= 450) {
    let yOffset, isScrollingUp, isScrollingDown;

    const onIntersection = entries => {
        entries.forEach(entry => {
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
                workElements.forEach(item => item.classList.remove("intersected"));
                intersectedItem.classList.add("intersected");
            } else if (entryIsFirstOrLast) {
                workElements.forEach(item => item.classList.remove("intersected"));
            }
        });
    };

    const observer = new IntersectionObserver(onIntersection, {
        rootMargin: "-22%",
        threshold: 0.5
    });

    workElements.forEach(item => observer.observe(item));
}
