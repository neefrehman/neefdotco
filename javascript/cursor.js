if (matchMedia("(pointer:fine)").matches) {

    const cursorContainer = document.querySelector(".cursor-container");
    const cursor = document.querySelector(".cursor");
    const cursorInner = document.querySelector(".cursor-inner");

    const allLinks = document.querySelectorAll("a");
    const projectLinks = document.querySelectorAll(".made a");
    const navLinks = document.querySelectorAll("a.nav");

    let vmaxRatio = (Math.max(window.innerWidth, window.innerHeight) / 14) + 1;
    cursorContainer.style.setProperty("--vmaxRatio", vmaxRatio);

    window.addEventListener("resize", () => {
        vmaxRatio = Math.max(window.innerWidth, window.innerHeight) / 14;
        cursorContainer.style.setProperty("--vmaxRatio", vmaxRatio);
    });

    document.addEventListener("mousemove", e => {
        cursor.style.cssText = `top: ${e.clientY}px; left: ${e.clientX}px;`;
        cursorInner.style.cssText = `top: ${e.clientY}px; left: ${e.clientX}px;`;
    });

    document.addEventListener("mousedown", () => cursor.classList.add("small"));
    document.addEventListener("mouseup", () => cursor.classList.remove("small"));

    allLinks.forEach(link => {
        link.addEventListener("mouseenter", () => cursor.classList.add("large"));
        link.addEventListener("mouseleave", () => cursor.classList.remove("large"));
    });

    projectLinks.forEach(link => {
        link.addEventListener("mouseenter", () => cursor.classList.add("hide"));
        link.addEventListener("mouseleave", () => cursor.classList.remove("hide"));
    });

    navLinks.forEach(link => {
        link.addEventListener("click", e => {
            cursorContainer.classList.add("transition");
            setTimeout(() => window.location = link.href, 960);
            e.preventDefault();
        });
    });

}
