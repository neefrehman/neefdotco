if (matchMedia("(pointer:fine)").matches) {

    const cursor = document.createElement("div");
    cursor.className = "cursor-container";
    cursor.innerHTML = `<div class="cursor"> </div>
                        <div class="cursor-inner"> </div>`;
    document.body.prepend(cursor);

    const allLinks = document.querySelectorAll("a");
    const projectLinks = document.querySelectorAll(".made a");
    const navLinks = document.querySelectorAll("a.nav");

    document.addEventListener("mousemove", e => {
        cursor.classList.add("moved");
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
            const isHomePage = window.location.pathname == "/" || window.location.pathname.includes("/index.html");
            cursor.classList.add(isHomePage ? "transition" : "transition-small");
            setTimeout(() => window.location = link.href, 950);
            e.preventDefault();
        });
    });

    const updateVmaxRatio = () => {
        const vmaxValue = Math.max(window.innerWidth, window.innerHeight);
        const emValue = parseFloat(getComputedStyle(document.body).fontSize);
        const vmaxRatio = vmaxValue / emValue;
        cursor.style.setProperty("--vmaxRatio", vmaxRatio);
    };

    updateVmaxRatio();
    window.addEventListener("resize", () => updateVmaxRatio());

}
