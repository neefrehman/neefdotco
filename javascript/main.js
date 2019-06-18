// Dark mode (localStorage & media query trigger in html <head>)
const darkModeButton = document.querySelector(".dark-mode-button");
const favicon = document.querySelector(`link[rel="icon"]`);

let isDark = document.documentElement.classList.contains("dark");
favicon.href = isDark ? "/icons/favicon-dark.png" : "/icons/favicon-light.png";

const darkMode = () => {
    document.documentElement.classList.toggle("dark");
    isDark = document.documentElement.classList.contains("dark");
    isDark ? localStorage.setItem("darkMode", 1) : localStorage.setItem("darkMode", 0);
    favicon.href = isDark ? "/icons/favicon-dark.png" : "/icons/favicon-light.png";
};

if (darkModeButton) {
    darkModeButton.addEventListener("click", () => darkMode());
}


// See less
const seeLessButton = document.querySelector(".see-less-button");
const queryWithExcludes = "header :not(.hidden):not(.no-hide), main :not(.hidden):not(.no-hide)";

if (seeLessButton) {
    seeLessButton.addEventListener("click", () => {
        const elementArray = [...document.body.querySelectorAll(queryWithExcludes)];
        const filteredElementArray = elementArray.filter(element => element.childElementCount <= 3);
        const randomElementNumber = Math.floor(Math.random() * filteredElementArray.length) + 1;
        const randomElement = filteredElementArray[randomElementNumber];

        randomElement.classList.add("hidden");
    });
}


// Devicemotion
// const colons = document.querySelectorAll("span.translate");
// if (colons && window.innerWidth < 497 && window.DeviceMotionEvent) {
//     window.addEventListener("devicemotion", e => {
//         const deviceTilt = (window.innerHeight > window.innerWidth)
//             ? e.accelerationIncludingGravity.x
//             : e.accelerationIncludingGravity.y;
//         const stretchValue = Math.abs(deviceTilt) * 2;
        
//         colons.forEach(colon => {
//             colon.style.transform = `translate(${stretchValue}px)`;
//         });
//     });
// }


// Console log
console.log("Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯");
