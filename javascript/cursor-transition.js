if (matchMedia("(pointer:fine)").matches) {

    const cursor = document.createElement("div");
    cursor.className = "cursor-container";
    cursor.innerHTML = `<div class="cursor"> </div>
                        <div class="cursor-inner"> </div>`;
    document.body.prepend(cursor);

    const allLinks = document.querySelectorAll("a");
    const darkModeButton = document.querySelector("a.dark-mode-button");
    const gridItems = document.querySelectorAll(".work-item, .see-more");

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

    if (gridItems) {
        gridItems.forEach(item => {
            item.addEventListener("mouseenter", () => cursor.classList.add("over"));
            item.addEventListener("mouseleave", () => cursor.classList.remove("over"));
        });
    }

    if (darkModeButton) {
        darkModeButton.addEventListener("mouseenter", () => cursor.classList.add("x-large", "dark-mode-toggle"));
        darkModeButton.addEventListener("mouseleave", () => cursor.classList.remove("x-large", "dark-mode-toggle"));
        
        darkModeButton.addEventListener("click", () => {
            cursor.classList.remove("x-large", "large");
            const cursorReset = setTimeout(() => cursor.classList.add("x-large"), 1200);
            darkModeButton.addEventListener("click", () => clearTimeout(cursorReset));
            darkModeButton.addEventListener("mouseleave", () => {
                clearTimeout(cursorReset);
                cursor.classList.remove("x-large", "large");
            });
        });
    }


    const transitionBlocker = document.createElement("div");
    transitionBlocker.className = "transition-blocker";
    document.body.prepend(transitionBlocker);


    const navLinks = document.querySelectorAll("a.nav");
    navLinks.forEach(link => {
        link.addEventListener("click", e => {
            if (cursor) cursor.classList.add("transition");
            transitionBlocker.classList.add("loading");
            setTimeout(() => window.location = link.href, 915);
            e.preventDefault();
        });
    });
    
}
