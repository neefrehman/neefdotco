// Dark mode (localStorage trigger in html <head>)
const darkModeButton = document.querySelector(".dark-mode-button");
const darkModeLocal = localStorage.getItem("darkMode");
const hasDarkUserPref = window.matchMedia("(prefers-color-scheme: dark)").matches;
let isDark = document.documentElement.classList.contains("dark");

const darkMode = () => {
    document.documentElement.classList.toggle("dark");
    isDark = document.documentElement.classList.contains("dark");
    isDark ? localStorage.setItem("darkMode", 1) : localStorage.setItem("darkMode", 0);
};

if (darkModeButton) {
    darkModeButton.addEventListener("click", () => {
        darkMode();

        darkModeButton.classList.add("hide-bg");
        const bgReset = setTimeout(() => darkModeButton.classList.remove("hide-bg"), 3000);
        darkModeButton.addEventListener("click", () => clearTimeout(bgReset));
        darkModeButton.addEventListener("mouseleave", () => {
            clearTimeout(bgReset);
            darkModeButton.classList.remove("hide-bg");
        });
    });
}

if (hasDarkUserPref && !darkModeLocal && !isDark) darkMode();


// Header stretch
const title = document.querySelector("span.stretch");
if (title && window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", e => {
        const deviceTilt = (window.innerHeight > window.innerWidth)
            ? e.accelerationIncludingGravity.x : e.accelerationIncludingGravity.y;
        const stretchValue = 1.1 + (Math.abs(deviceTilt) / 15);
        title.style.transform = `scale(${stretchValue}, 1)`;
    });
}


// Console log
console.log("Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯");
