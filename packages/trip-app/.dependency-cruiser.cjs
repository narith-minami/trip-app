/**
 * .dependency-cruiser.cjs
 *
 * Filesystem dependency-graph linting. Mirrors the architecture
 * boundaries enforced by eslint-plugin-boundaries (see eslint.config.mjs):
 *
 *   pages → features → components → hooks → lib → types
 *                    → api        → lib    → types
 *
 * Forbidden: features importing other features (horizontal),
 * lower layers importing upward, and circular dependencies.
 */

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      comment: "Circular dependencies make code hard to reason about and to test.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-cross-feature",
      comment:
        "A feature must not import from a different feature. Share via components/hooks/api/lib/types instead.",
      severity: "error",
      from: { path: "^src/features/([^/]+)/" },
      to: {
        path: "^src/features/([^/]+)/",
        pathNot: "^src/features/$1/",
      },
    },
    {
      name: "components-stay-low",
      comment: "components may only depend on hooks, lib and types — not api, features or pages.",
      severity: "error",
      from: { path: "^src/components/" },
      to: { path: "^src/(api|features|routes)/" },
    },
    {
      name: "api-stays-low",
      comment: "api may only depend on lib and types.",
      severity: "error",
      from: { path: "^src/api/" },
      to: { path: "^src/(features|components|routes|hooks)/" },
    },
    {
      name: "lib-stays-low",
      comment: "lib may only depend on types (and external packages).",
      severity: "error",
      from: { path: "^src/lib/" },
      to: { path: "^src/(api|features|components|routes|hooks)/" },
    },
    {
      name: "types-have-no-deps",
      comment: "types must be leaf modules with no dependencies on other layers.",
      severity: "error",
      from: { path: "^src/types/" },
      to: { path: "^src/(api|features|components|routes|hooks|lib|server)/" },
    },
    {
      name: "no-orphans",
      comment:
        "Orphan modules (e.g. unused UI primitives) are reported as a warning, not an error.",
      severity: "warn",
      from: {
        orphan: true,
        pathNot: [
          "\\.d\\.ts$",
          "(^|/)tsconfig\\.json$",
          "(^|/)(routeTree|main)\\.tsx?$",
          "\\.(test|spec|stories)\\.[jt]sx?$",
        ],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "\\.(test|spec|stories)\\.[jt]sx?$" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
  },
};
