if (matchMedia("(pointer:fine)").matches) {

    const cursor = document.createElement("div");
    cursor.className = "cursor-container";
    cursor.innerHTML = `<div class="cursor"> </div>
                        <div class="cursor-inner"> </div>`;
    document.body.prepend(cursor);

    const allLinks = document.querySelectorAll("a");
    const darkModeButton = document.querySelector("a.dark-mode-button");
    const navLinks = document.querySelectorAll("a.nav");
    const summaries = document.querySelectorAll("summary");

    document.addEventListener("mousemove", e => {
        cursor.classList.add("show");
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });

    document.addEventListener("mousedown", () => cursor.classList.add("small"));
    document.addEventListener("mouseup", () => cursor.classList.remove("small"));

    allLinks.forEach(link => {
        link.addEventListener("mouseenter", () => cursor.classList.add("large"));
        link.addEventListener("mouseleave", () => cursor.classList.remove("large"));
    });

    summaries.forEach(summary => {
        summary.addEventListener("mouseenter", () => cursor.classList.add("large"));
        summary.addEventListener("mouseleave", () => cursor.classList.remove("large"));
        summary.addEventListener("click", () => cursor.classList.toggle("large"));
    });

    if (darkModeButton) {
        darkModeButton.addEventListener("mouseenter", () => cursor.classList.add("large", "dark-mode-toggle"));
        darkModeButton.addEventListener("mouseleave", () => cursor.classList.remove("large", "dark-mode-toggle"));
        
        darkModeButton.addEventListener("click", () => {
            cursor.classList.remove("large");
            const cursorReset = setTimeout(() => cursor.classList.add("large"), 2000);
            darkModeButton.addEventListener("click", () => clearTimeout(cursorReset));
            darkModeButton.addEventListener("mouseleave", () => {
                clearTimeout(cursorReset);
                cursor.classList.remove("large");
            });
        });
    }

    navLinks.forEach(link => {
        link.addEventListener("click", e => {
            cursor.classList.add("transition");
            setTimeout(() => window.location = link.href, 950);
            e.preventDefault();
        });
    });

}
