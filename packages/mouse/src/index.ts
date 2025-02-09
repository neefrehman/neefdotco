import type { Vector } from "@repo/utils/math/types";
import { throttle } from "@repo/utils/throttle";

// @ts-expect-error -- TODO: comment about vite
import stylesString from "./styles.css?inline";

export class Cursor extends HTMLElement {
  private cursorOuterElement!: HTMLDivElement;
  private cursorContentsElement!: HTMLDivElement;

  private connectedCallback() {
    const cursorOuter = document.createElement("div");
    const cursorContents = document.createElement("div");
    const cursorTransitionOverlay = document.createElement("div");

    const shadowRoot = this.attachShadow({ mode: "open" });

    cursorOuter.appendChild(cursorContents).classList.add("cursor-contents");
    shadowRoot.appendChild(cursorOuter).classList.add("cursor-outer");
    shadowRoot.appendChild(cursorTransitionOverlay).classList.add("cursor-transition-overlay");

    const template = document.createElement("template");
    template.innerHTML = `
    <style>
    ${stylesString}
    </style>
    `;

    shadowRoot.appendChild(template.content.cloneNode(true));
    
    this.classList.add("hide");
    this.cursorOuterElement = cursorOuter;
    this.cursorContentsElement = cursorContents;
  }

  public registerEventHandlers = ({
    onMove = this.move,
  }: { onMove?: (coords: Vector<2>) => void }) => {
    document.addEventListener("mousemove", () => this.classList.remove("hide"), { once: true });
    document.addEventListener("mousemove", e => onMove([e.clientX, e.clientY]));

    document.addEventListener("mousedown", () => this.classList.add("small"));
    document.addEventListener("mouseup", () => this.classList.remove("small"));

    document.querySelectorAll<HTMLAnchorElement>("a, button").forEach(link => {
      link.addEventListener("mouseenter", () => this.classList.add("large"));
      link.addEventListener("mouseleave", () => this.classList.remove("large"));
    });

    document.querySelectorAll<HTMLElement>("[data-cursor-move]").forEach(el => {
      el.addEventListener("mouseenter", () => this.classList.add(el.dataset.cursorMove!));
      el.addEventListener("mouseleave", () => this.classList.remove(el.dataset.cursorMove!));
    });

    document.querySelectorAll<HTMLElement>("[data-cursor-shape]").forEach(el => {
      el.addEventListener("mouseenter", () => this.classList.add(el.dataset.cursorShape!));
      el.addEventListener("mouseleave", () => this.classList.remove(el.dataset.cursorShape!));
    });

    document.querySelectorAll<HTMLElement>("[data-cursor-size]").forEach(el => {
      el.addEventListener("mouseenter", () => this.classList.add(el.dataset.cursorSize!));
      el.addEventListener("mouseleave", () => this.classList.remove(el.dataset.cursorSize!));
    });

    document.querySelectorAll<HTMLElement>("[data-cursor-contents]").forEach(el => {
      el.addEventListener("mouseenter", () => (this.textContent = el.dataset.cursorContents!));
      el.addEventListener("mouseleave", () => (this.textContent = ""));
      el.addEventListener("click", () => {
        setTimeout(() => (this.textContent = el.dataset.cursorContents!), 10); // some elements may change their contents attribute on click
      });
    });

    document.querySelectorAll<HTMLElement>("[data-cursor-color]").forEach(el => {
      el.addEventListener("mouseenter", () => (this.color = el.dataset.cursorColor!));
      el.addEventListener("mouseleave", () => (this.color = ""));
    });

    document.querySelectorAll<HTMLElement>("[data-cursor-regrow=true]").forEach(el => {
      el.addEventListener("click", () => {
        if (!this.classList.contains(el.dataset.cursorSize!)) {
          return;
        }
        this.classList.remove(el.dataset.cursorSize!, "large");
        const cursorReset = setTimeout(() => this.classList.add(el.dataset.cursorSize!), 1000);
        el.addEventListener("click", () => clearTimeout(cursorReset), { once: true });
        el.addEventListener(
          "mouseleave",
          () => {
            clearTimeout(cursorReset);
            this.classList.remove(el.dataset.cursorSize!, "large");
          },
          { once: true }
        );
      });
    });
  };

  public position: Vector<2> = [0, 0];
  public move = throttle(([x, y]: Vector<2>) => {
    this.position = [x, y];
    this.style.translate = `${x}px ${y}px`;
  }, 35); // ~33fps

  private clearCursorTextTimeout = setTimeout(() => void 0);
  override set textContent(text: string) {
    if (text === "") {
      this.classList.remove("has-contents");
      this.clearCursorTextTimeout = setTimeout(() => {
        this.cursorContentsElement.textContent = "";
      }, 500);
      return;
    }

    // annoyingly some characters, like +/-, aren't quite the right size in Fleuron
    ["+", "-", "–", "—"].includes(text)
      ? this.classList.add("contents-small-chars")
      : this.classList.remove("contents-small-chars");
    this.classList.add("has-contents");
    this.cursorContentsElement.textContent = text;
    clearTimeout(this.clearCursorTextTimeout);
  }

  override get textContent() {
    return this.cursorContentsElement.textContent ?? "";
  }

  public get color() {
    // We must use `getComputedStyle`, as the `style.backgroundColor` is value not known to clients with different custom property values.
    return getComputedStyle(this.cursorOuterElement).getPropertyValue("--cursor-background-color");
  }

  public set color(color: string) {
    this.style.setProperty("--cursor-background-color", color);
  }
}
