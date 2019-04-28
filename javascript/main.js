// Dark mode (localStorage trigger in html <head>)
const darkModeButton = document.documentElement;
const darkModeToggle = () => document.documentElement.classList.toggle("dark");
// const darkUserPref = window.matchMedia("(prefers-color-scheme: dark)").matches;

darkModeButton.addEventListener("dblclick", e => {
    if (!e.target.matches(".photo-container > .grid")) darkModeToggle();
    const isDark = document.documentElement.classList.contains("dark");
    isDark ? localStorage.setItem("darkMode", true) : localStorage.removeItem("darkMode");
});


// Header stretch
const title = document.querySelector("span.stretch");
if (title && window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", e => {
        const deviceTilt = (window.innerHeight > window.innerWidth) ?
            e.accelerationIncludingGravity.x : e.accelerationIncludingGravity.y;
        const stretchValue = 1.1 + (Math.abs(deviceTilt) / 15);
        title.style.transform = `scale(${stretchValue}, 1)`;
    });
}


// Console log
console.log("Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯");
