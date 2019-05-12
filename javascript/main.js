// Dark mode (localStorage & media query trigger in html <head>)
const darkModeButton = document.querySelector(".dark-mode-button");

const darkMode = () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    isDark ? localStorage.setItem("darkMode", 1) : localStorage.setItem("darkMode", 0);
};

if (darkModeButton) {
    darkModeButton.addEventListener("click", () => {
        darkMode();

        darkModeButton.classList.add("hide-bg");
        const bgReset = setTimeout(() => darkModeButton.classList.remove("hide-bg"), 2600);
        darkModeButton.addEventListener("click", () => clearTimeout(bgReset));
        darkModeButton.addEventListener("mouseleave", () => {
            clearTimeout(bgReset);
            darkModeButton.classList.remove("hide-bg");
        });
    });
}


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
