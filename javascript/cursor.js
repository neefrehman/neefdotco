if (matchMedia("(pointer:fine)").matches) {

    const cursorContainer = document.querySelector(".cursor-container");
    const cursor = document.querySelector(".cursor");
    const cursorInner = document.querySelector(".cursor-inner");

    const allLinks = document.querySelectorAll("a");
    const projectLinks = document.querySelectorAll(".made a");
    const photographyLink = document.querySelector(`a[href="photos.html"]`);

    let vmaxRatio = Math.max(window.innerWidth, window.innerHeight) / 14;
    cursorContainer.style.setProperty("--vmaxRatio", vmaxRatio);

    window.addEventListener("resize", () => {
        vmaxRatio = Math.max(window.innerWidth, window.innerHeight) / 14;
        cursorContainer.style.setProperty("--vmaxRatio", vmaxRatio);
    });

    document.addEventListener("mousemove", e => {
        cursor.style.cssText = `top: ${e.pageY}px; left: ${e.pageX}px;`;
        cursorInner.style.cssText = `top: ${e.pageY}px; left: ${e.pageX}px;`;
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

    photographyLink.addEventListener("click", e => {
        cursor.classList.add("transition");
        setTimeout(() => window.location = photographyLink.href, 1000);
        e.preventDefault();
    });

}
