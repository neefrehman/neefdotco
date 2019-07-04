const transitionBlocker = document.createElement("div");
transitionBlocker.className = "transition-blocker";
document.body.prepend(transitionBlocker);


const navLinks = document.querySelectorAll("a.nav");
navLinks.forEach(link => {
    link.addEventListener("click", e => {
        transitionBlocker.classList.add("loading");
        setTimeout(() => window.location = link.href, 920);
        e.preventDefault();
    });
});


// CSS:
// .transition-blocker {
//     height: 100vh;
//     width: 100vw;
//     background-color: var(--backgroundColor);
//     position: fixed;
//     z-index: 9;
//     top: 0;
//     right: 0;
//     transform: scale(1, 0);
//     transition: transform 780ms cubic-bezier(1, 0.15, 0.15, 1) 220ms;
//     transform-origin: top;
// 
//     &.loading {
//         transform: scale(1, 1);
//     }
// }