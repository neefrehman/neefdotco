import type { Vector } from "@repo/utils/math/types";
import { throttle } from "@repo/utils/throttle";
import type { HintedString } from "@repo/utils/types";

// @ts-expect-error -- HACK: here we rely on the fact that the (currently only) consumer
// of this packages uses vite for bundling, which can import this file as a string.
// See: https://vite.dev/guide/assets.html#explicit-inline-handling
import stylesString from "./styles.css?inline";

const styleTemplate = document.createElement("template");
styleTemplate.innerHTML = `<style>${stylesString}</style>`;

type CursorState = {
  position: Vector<2>;
  visibility: HintedString<"hidden" | "shown" | "exiting">;
  size: HintedString<"sm" | "md" | "lg" | "xl" | "xxl" | "xxxl">;
  speed: HintedString<"slow" | "regular">;
  placement: HintedString<"center" | "top" | "bottom" | "left" | "right">;
  shape: HintedString<"circle" | "square">;
  color: string;
  textContent: string | null;
};

export class Cursor extends HTMLElement {
  private cursorRootElement!: HTMLDivElement;
  private cursorContentsElement!: HTMLDivElement;

  private connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "open" });

    const cursorRoot = document.createElement("div");
    const cursorOuter = document.createElement("div");
    const cursorContents = document.createElement("div");
    const cursorTransitionOverlay = document.createElement("div");

    shadowRoot.appendChild(styleTemplate.content.cloneNode(true));
    shadowRoot.appendChild(cursorRoot).classList.add("cursor-root");

    cursorRoot.appendChild(cursorOuter).classList.add("cursor-outer");
    cursorRoot.appendChild(cursorTransitionOverlay).classList.add("cursor-transition-overlay");
    cursorOuter.appendChild(cursorContents).classList.add("cursor-contents");

    this.cursorRootElement = cursorRoot;
    this.cursorContentsElement = cursorContents;

    this.visibility = "hidden";
  }

  private dispatchStateChange = (changedState: Partial<CursorState>) => {
    this.shadowRoot?.dispatchEvent(
      new CustomEvent<Partial<CursorState>>("statechange", {
        composed: true,
        detail: changedState,
      }),
    );
  };

  public static observedAttributes: (keyof CursorState)[] = [
    "size",
    "speed",
    "color",
    "placement",
    "shape",
    "visibility",
  ];
  private attributeChangedCallback(name: keyof CursorState, _: string, newValue: string) {
    this.dispatchStateChange({ [name]: newValue });
  }

  public get visibility() {
    return this.getAttribute("visibility") ?? "hidden";
  }
  public set visibility(visibility: CursorState["visibility"]) {
    this.setAttribute("visibility", visibility);
  }

  public get size() {
    return this.getAttribute("size") ?? "md";
  }
  public set size(size: CursorState["size"]) {
    if (this.size === size) {
      return;
    }
    this.setAttribute("size", size);
  }

  public get speed() {
    return this.getAttribute("speed") ?? "md";
  }
  public set speed(speed: CursorState["speed"]) {
    if (this.speed === speed) {
      return;
    }
    this.setAttribute("speed", speed);
  }

  public get placement() {
    return this.getAttribute("placement") ?? "center";
  }
  public set placement(placement: CursorState["placement"]) {
    this.setAttribute("placement", placement);
  }

  public get shape() {
    return this.getAttribute("shape") ?? "circle";
  }
  public set shape(shape: CursorState["shape"]) {
    this.setAttribute("shape", shape);
  }

  private getComputedColor = () =>
    // We must use `getComputedStyle`, as `style.backgroundColor` is not known to clients with different custom property values.
    getComputedStyle(this.cursorRootElement).getPropertyValue("--cursor-background-color");
  public get color() {
    return this.getAttribute("color") ?? this.getComputedColor();
  }
  public set color(color: CursorState["color"]) {
    this.cursorRootElement.style.setProperty("--cursor-background-color", color);
    this.setAttribute("color", this.getComputedColor());
  }

  private currentPosition: Vector<2> = [0, 0];
  public move = throttle(([x, y]: Vector<2>) => {
    this.currentPosition = [x, y];
    this.cursorRootElement.style.translate = `${x}px ${y}px`;
    this.dispatchStateChange({ position: [x, y] });
  }, 35); // ~33fps
  public get position() {
    return this.currentPosition;
  }
  public set position(pos: Vector<2>) {
    this.move(pos);
  }

  private clearCursorTextTimeout = setTimeout(() => void 0);
  override set textContent(text: CursorState["textContent"]) {
    this.dispatchStateChange({ textContent: text });
    if (!text) {
      this.setAttribute("contents-type", "none");
      this.clearCursorTextTimeout = setTimeout(() => {
        this.cursorContentsElement.textContent = "";
      }, 500);
      return;
    }
    this.setAttribute("contents-type", ["+", "-", "–"].includes(text) ? "small-chars" : "regular");
    this.cursorContentsElement.textContent = text;
    clearTimeout(this.clearCursorTextTimeout);
  }
  override get textContent() {
    return this.cursorContentsElement.textContent;
  }

  /** biome-ignore-start lint/suspicious/noAssignInExpressions: here I'm being opinionated about formatting and prefer assignment-in-expressions over breaking across multiple lines */

  public registerEventHandlers = ({
    onMove = this.move,
  }: {
    onMove?: (coords: Vector<2>) => void;
  }) => {
    document.addEventListener("mousemove", () => (this.visibility = "shown"), { once: true });
    document.addEventListener("mousemove", (e) => onMove([e.clientX, e.clientY]));

    document.addEventListener("mousedown", () => {
      if (this.size === "md") this.size = "sm";
    });
    document.addEventListener("mouseup", () => {
      if (this.size === "sm") this.size = "md";
    });

    document.querySelectorAll<HTMLElement>("a, button").forEach((link) => {
      link.addEventListener("mouseenter", () => (this.size = "lg"));
      link.addEventListener("mouseleave", () => (this.size = "md"));
    });

    /** biome-ignore-start lint/style/noNonNullAssertion: to get the types to work we do non-null assertions on properties that we've know we've just queried for */

    document.querySelectorAll<HTMLElement>("[data-cursor-placement]").forEach((el) => {
      el.addEventListener("mouseenter", () => (this.placement = el.dataset.cursorPlacement!));
      el.addEventListener("mouseleave", () => (this.placement = el.dataset.cursorPlacement!));
    });

    document.querySelectorAll<HTMLElement>("[data-cursor-shape]").forEach((el) => {
      el.addEventListener("mouseenter", () => (this.shape = el.dataset.cursorShape!));
      el.addEventListener("mouseleave", () => (this.shape = "circle"));
    });

    document.querySelectorAll<HTMLElement>("[data-cursor-size]").forEach((el) => {
      el.addEventListener("mouseenter", () => (this.size = el.dataset.cursorSize!));
      el.addEventListener("mouseleave", () => (this.size = "md"));
    });

    document.querySelectorAll<HTMLElement>("[data-cursor-contents]").forEach((el) => {
      el.addEventListener("mouseenter", () => (this.textContent = el.dataset.cursorContents!));
      el.addEventListener("mouseleave", () => (this.textContent = ""));
      el.addEventListener("click", () => {
        setTimeout(() => (this.textContent = el.dataset.cursorContents!), 10); // some elements may change their contents attribute on click
      });
    });

    document.querySelectorAll<HTMLElement>("[data-cursor-color]").forEach((el) => {
      el.addEventListener("mouseenter", () => (this.color = el.dataset.cursorColor!));
      el.addEventListener("mouseleave", () => (this.color = ""));
      el.addEventListener("click", () => {
        setTimeout(() => (this.color = el.dataset.cursorColor!), 10); // some elements may change the cursor's color on click
      });
    });

    document.querySelectorAll<HTMLElement>("[data-cursor-regrow=true]").forEach((el) => {
      el.addEventListener("click", () => {
        this.size = "md";
        const cursorReset = setTimeout(() => (this.size = el.dataset.cursorSize ?? "lg"), 1000);
        el.addEventListener("click", () => clearTimeout(cursorReset), { once: true });
        el.addEventListener(
          "mouseleave",
          () => {
            clearTimeout(cursorReset);
            this.size = "md";
          },
          { once: true },
        );
      });
    });

    /** biome-ignore-end lint/style/noNonNullAssertion: we no longer need to use non-null assertions */
    /** biome-ignore-end lint/suspicious/noAssignInExpressions: we no longer need to assign in expressions */

    let keydownTimeout: NodeJS.Timeout;
    window.addEventListener("keydown", (e) => {
      clearTimeout(keydownTimeout);
      const clearCursor = () => {
        this.size = "md";
        this.textContent = "";
      };
      const setCursor = (string: string) => {
        this.textContent = string;
        this.size = "lg";
        keydownTimeout = setTimeout(clearCursor, 1500);
      };
      if (e.key === "Backspace") {
        clearCursor();
        return;
      }
      if (document.activeElement?.tagName !== "BODY" || e.key.length !== 1) {
        return;
      }
      if (this.textContent === e.key) {
        this.textContent = "";
        setTimeout(() => setCursor(e.key), 100);
        return;
      }
      setCursor(e.key);
    });
  };
}
