// Dark mode (localStorage & media query trigger in html <head>)
const darkModeButton = document.querySelector(".dark-mode-button");
const favicon = document.querySelector(`link[rel="icon"]`);

let isDark = document.documentElement.classList.contains("dark");
favicon.href = isDark ? "/icons/favicon-dark.png" : "/icons/favicon-light.png";

const darkMode = () => {
    document.documentElement.classList.toggle("dark");
    isDark = document.documentElement.classList.contains("dark");
    isDark
        ? localStorage.setItem("darkMode", 1)
        : localStorage.setItem("darkMode", 0);
    favicon.href = isDark
        ? "/icons/favicon-dark.png"
        : "/icons/favicon-light.png";
};

if (darkModeButton) darkModeButton.addEventListener("click", () => darkMode());

// See less
const seeLessButton = document.querySelector(".see-less-button");

if (seeLessButton) {
    const elementArray = [
        ...document.body.querySelectorAll(
            "header :not(.no-hide), main :not(.no-hide)"
        )
    ];
    const filteredElementArray = elementArray.filter(
        element => element.childElementCount <= 3
    );

    seeLessButton.addEventListener("click", () => {
        if (filteredElementArray.length > 0) {
            const randomElementIndex = Math.floor(
                Math.random() * filteredElementArray.length
            );
            const randomElement = filteredElementArray[randomElementIndex];
            const childElements = randomElement.querySelectorAll(
                "*:not(.no-hide):not(.hidden)"
            );
            const totalChildElements = childElements ? childElements.length : 0;

            randomElement.classList.add("hidden");
            filteredElementArray.splice(
                randomElementIndex,
                1 + totalChildElements
            );
        } else {
            seeLessButton.remove();
        }
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
console.log(
    "Nothing here. Hope you weren't looking for something cool. ¯\\_(ツ)_/¯"
);
