/// <reference types="astro/client" />

declare interface HTMLImageElement extends HTMLElement {
  fetchPriority?: "high" | "low" | "auto";
}
declare interface HTMLLinkElement extends HTMLElement {
  fetchPriority?: "high" | "low" | "auto";
}

interface Node extends EventTarget {
  cloneNode(deep?: boolean): this;
}