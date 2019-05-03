if (matchMedia("(pointer:fine)").matches) {

    // Markup
    const cursor = document.createElement("div");
    cursor.className = "cursor-container";
    cursor.innerHTML = `<div class="cursor"> </div>
                        <div class="cursor-inner"> </div>`;
    document.body.prepend(cursor);

    // Style
    const cursorStyle = document.createElement("style");
    cursorStyle.innerHTML = `
        .cursor-container {
            position: fixed;
            z-index: -1;
            top: -1rem;
            left: -1rem;
            pointer-events: none;
            transition: transform 35ms;
        }
        .cursor, .cursor-inner {
            position: fixed;
            border-radius: 100%;
            width: 2rem;
            height: 2rem;
            transform: scale(0);
        }
        .cursor {
            background-color: #757575;
            transition: transform 430ms cubic-bezier(1, 0.1, 0.1, 1);
        }
        .cursor-inner {
            background-color: var(--backgroundColor);
            transition: transform 780ms cubic-bezier(1, 0.1, 0.1, 1) 230ms;
        }
        .cursor-container.show .cursor {
            transform: scale(1);
        }
        .cursor-container.large .cursor {
            transform: scale(2);
        }
        .cursor-container.small .cursor {
            transform: scale(0.5);
        }
        .cursor-container.hide .cursor {
            transform: scale(0);
        }
        .cursor-container.transition,
        .cursor-container.transition-small,
        .cursor-container.hide {
            z-index: 5;
        }
        .cursor-container.transition .cursor,
        .cursor-container.transition .cursor-inner {
            transform: scale(var(--vmaxRatio)) translate(1%, 1%);
        }
        .cursor-container.transition-small .cursor {
            transform: scale(1.25);
        }
        .cursor-container.transition-small .cursor-inner {
            transform: scale(1.28);
        }

        @media (ponter: coarse) {
            .cursor-container, .cursor, .cursor-inner {
                display: none;
            }
        }
    `;
    cursor.insertAdjacentElement("afterend", cursorStyle);

    // Logic
    const allLinks = document.querySelectorAll("a");
    const projectLinks = document.querySelectorAll(".made a");
    const navLinks = document.querySelectorAll("a.nav");

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
