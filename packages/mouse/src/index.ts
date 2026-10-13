import type { Vector } from "@repo/utils/math/types";
import { throttle } from "@repo/utils/throttle";
import type { HintedString } from "@repo/utils/types";

// @ts-expect-error -- HACK: here we rely on the fact that the (currently only) consumer
// of this packages uses vite for bundling, which can import this file as a string.
// See: https://vite.dev/guide/assets.html#explicit-inline-handling
import stylesString from "./styles.css?inline";

// Shared between every cursor (there's one per connected user), rather than cloned into each shadow root
const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(stylesString);

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

    shadowRoot.adoptedStyleSheets = [styleSheet];
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

  private clearCursorTextTimeout: ReturnType<typeof setTimeout> | undefined;
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

    // `mouseover`/`mouseout` bubble (unlike `mouseenter`/`mouseleave`), so we can listen once on the
    // document, which also covers elements that are added or moved later. `crossed` finds the
    // element matching `selector` that the pointer has just entered or left, ignoring movement
    // between that element's own descendants (as `mouseenter`/`mouseleave` would).
    const crossed = (e: MouseEvent, selector: string) => {
      const element = (e.target as Element).closest<HTMLElement>(selector);
      return element && !element.contains(e.relatedTarget as Node | null) ? element : null;
    };

    /** biome-ignore-start lint/style/noNonNullAssertion: to get the types to work we do non-null assertions on properties that we've know we've just queried for */

    document.addEventListener("mouseover", (e) => {
      if (crossed(e, "a, button")) this.size = "lg";
      const placement = crossed(e, "[data-cursor-placement]");
      if (placement) this.placement = placement.dataset.cursorPlacement!;
      const shape = crossed(e, "[data-cursor-shape]");
      if (shape) this.shape = shape.dataset.cursorShape!;
      const size = crossed(e, "[data-cursor-size]");
      if (size) this.size = size.dataset.cursorSize!;
      const contents = crossed(e, "[data-cursor-contents]");
      if (contents) this.textContent = contents.dataset.cursorContents!;
      const color = crossed(e, "[data-cursor-color]");
      if (color) this.color = color.dataset.cursorColor!;
    });

    document.addEventListener("mouseout", (e) => {
      if (crossed(e, "a, button")) this.size = "md";
      const placement = crossed(e, "[data-cursor-placement]");
      if (placement) this.placement = placement.dataset.cursorPlacement!;
      if (crossed(e, "[data-cursor-shape]")) this.shape = "circle";
      if (crossed(e, "[data-cursor-size]")) this.size = "md";
      if (crossed(e, "[data-cursor-contents]")) this.textContent = "";
      if (crossed(e, "[data-cursor-color]")) this.color = "";
    });

    document.addEventListener("click", (e) => {
      const target = e.target as Element;

      // some elements may change their contents attribute, or the cursor's color, on click
      const contents = target.closest<HTMLElement>("[data-cursor-contents]");
      if (contents) setTimeout(() => (this.textContent = contents.dataset.cursorContents!), 10);
      const color = target.closest<HTMLElement>("[data-cursor-color]");
      if (color) setTimeout(() => (this.color = color.dataset.cursorColor!), 10);

      const regrow = target.closest<HTMLElement>("[data-cursor-regrow=true]");
      if (regrow) {
        this.size = "md";
        const cursorReset = setTimeout(() => (this.size = regrow.dataset.cursorSize ?? "lg"), 1000);
        regrow.addEventListener("click", () => clearTimeout(cursorReset), { once: true });
        regrow.addEventListener(
          "mouseleave",
          () => {
            clearTimeout(cursorReset);
            this.size = "md";
          },
          { once: true },
        );
      }
    });

    /** biome-ignore-end lint/style/noNonNullAssertion: we no longer need to use non-null assertions */
    /** biome-ignore-end lint/suspicious/noAssignInExpressions: we no longer need to assign in expressions */

    let keydownTimeout: ReturnType<typeof setTimeout>;
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
