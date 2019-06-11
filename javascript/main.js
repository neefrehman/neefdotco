// Dark mode (localStorage & media query trigger in html <head>)
const darkModeButton = document.querySelector(".dark-mode-button");
const favicon = document.querySelector(`link[rel="icon"]`);

let isDark = document.documentElement.classList.contains("dark");
favicon.href = isDark ? "icons/favicon-dark.png" : "icons/favicon-light.png";

const darkMode = () => {
    document.documentElement.classList.toggle("dark");
    isDark = document.documentElement.classList.contains("dark");
    isDark ? localStorage.setItem("darkMode", 1) : localStorage.setItem("darkMode", 0);
    favicon.href = isDark ? "icons/favicon-dark.png" : "icons/favicon-light.png";
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


// em-dash movement
const emDashes = document.querySelectorAll("span.em-dash");
if (emDashes && window.innerWidth < 497 && window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", e => {
        const deviceTilt = (window.innerHeight > window.innerWidth)
            ? e.accelerationIncludingGravity.x
            : e.accelerationIncludingGravity.y;
        const stretchValue = Math.abs(deviceTilt) * 2;
        
        emDashes.forEach(dash => {
            dash.style.transform = `translate(${stretchValue}px)`;
        });
    });
}


// Console log
console.log("Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯");
