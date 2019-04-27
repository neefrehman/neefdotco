if (matchMedia("(pointer:fine)").matches) {

    const cursor = document.querySelector(".cursor-container");

    const allLinks = document.querySelectorAll("a");
    const projectLinks = document.querySelectorAll(".made a");
    const navLinks = document.querySelectorAll("a.nav");

    document.addEventListener("mousemove", e => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
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
            const pathSplit = window.location.pathname.split("/");
            const isHomePage = window.location.pathname == "/" || pathSplit[pathSplit.length - 1] == "index.html";
            cursor.classList.add(isHomePage ? "transition" : "transition-small");
            setTimeout(() => window.location = link.href, 950);
            e.preventDefault();
        });
    });

    let vmaxRatio = (Math.max(window.innerWidth, window.innerHeight) / 14) + 1;
    cursor.style.setProperty("--vmaxRatio", vmaxRatio);

    window.addEventListener("resize", () => {
        vmaxRatio = (Math.max(window.innerWidth, window.innerHeight) / 14) + 1;
        cursor.style.setProperty("--vmaxRatio", vmaxRatio);
    });

}
