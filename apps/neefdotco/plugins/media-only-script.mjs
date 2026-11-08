/**
 * Defers an Astro `<script>` until a media query matches. This is `client:media` for scripts.
 *
 * @example
 *
 * ```astro
 * <script>
 *   import "../../plugins/mediaScript.mjs" with { media: "(pointer: fine)" };
 *   // ...the rest of the script, which is only fetched and run once the query matches
 * </script>
 * ```
 *
 * The import is a marker: this plugin removes it, and splits the rest of the script into its own
 * chunk, behind a tiny loader. The chunk is fetched immediately if the query already matches, or
 * later if it starts matching (e.g. a mouse is plugged in). The rest of the script runs as normal.
 *
 * @remarks
 * Why a plugin driven by a marker import in the script, rather than something else:
 *
 * - `<Cursor client:media="…" />` isn't possible. Astro only supports `client:*` directives on
 *   framework components (an `.astro` component renders at build time and has no client runtime to
 *   hydrate), and just logs a warning and ignores the directive. Adding a UI framework only for this
 *   isn't worth it, and a custom directive has the same limitation.
 * - Gating the component's import (e.g. `import Cursor from "./Cursor.astro?media=…"`) would need a
 *   plugin to pass state between the import and the component's script. That ran into astro's
 *   server-side stubs of client scripts and the same module being reachable by several ids, and was
 *   fragile.
 * - Splitting the logic into separate `.ts` modules behind a dynamic `import()` works, but gives
 *   up Astro's spirit of co-locating a component's markup, styles and logic in one file.
 *
 * Here the script's own module is what gets deferred, so the component stays a single file. Using an
 * import (with the query as an import attribute) means the marker is real code that typechecks,
 * and can be followed to this documentation. It also fails loudly if misused. If this plugin isn't
 * installed, the import would pull this file into the client bundle.
 *
 * @returns {import("vite").Plugin}
 */
const MARKER_FILE = /media-only-script\.mjs["']/;
const MARKER_IMPORT =
  /^import\s+(["'])[^"']*\/media-only-script\.mjs\1\s+with\s*\{\s*media:\s*(["'])(.+?)\2\s*\}\s*;?[ \t]*\n?/m;

export const mediaOnlyScript = () => {
  const bodies = new Map(); // lazy chunk id -> script source
  let server;
  return {
    name: "media-script",
    enforce: "pre",
    configureServer(devServer) {
      server = devServer;
    },
    async resolveId(source, importer, options) {
      const [, path, suffix] = source.match(/^(.*\.astro)(\.media-\d+\.ts)$/) ?? [];
      if (!path) return null;
      const resolved = await this.resolve(path, importer, { ...options, skipSelf: true });
      return resolved && resolved.id + suffix;
    },
    load(id) {
      return bodies.get(id) ?? null;
    },
    transform(code, id) {
      if (!id.includes("?astro&type=script")) return null;
      if (!MARKER_FILE.test(code)) return null;

      const [marker, , , query] = code.match(MARKER_IMPORT) ?? [];
      if (!marker) {
        this.error(
          `${id}: expected \`import "…/media-only-script.mjs" with { media: "<query>" };\` (see ${import.meta.url})`,
        );
      }
      const body = code.replace(marker, "");

      // Not a `.astro` path (or query), which astro's own plugin would claim and replace
      const bodyId = `${id.split("?")[0]}.media-${id.match(/index=(\d+)/)?.[1]}.ts`;
      if (bodies.get(bodyId) !== body) {
        bodies.set(bodyId, body);
        const bodyModule = server?.moduleGraph.getModuleById(bodyId);
        if (bodyModule) server.moduleGraph.invalidateModule(bodyModule);
      }

      return {
        map: null,
        code: `
          const mediaQuery = matchMedia(${JSON.stringify(query)});
          const load = () => import(${JSON.stringify(bodyId)});
          if (mediaQuery.matches) {
            load();
          } else {
            mediaQuery.addEventListener("change", load, { once: true });
          }
        `,
      };
    },
  };
};
