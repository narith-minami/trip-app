// React Doctor configuration.
// https://react.doctor/docs — only confirmed false positives / intentional
// project decisions are suppressed here; every entry documents the reason.
export default {
  ignore: {
    // Mock implementations are swapped in only when VITE_MOCK is set, via the
    // alias map in vite.config.ts (resolve.alias). Static analysis can't follow
    // that dynamic wiring, so the whole tree is reported as unused/unreachable.
    files: ["src/mocks/**"],
  },
  rules: {
    // FALSE POSITIVE: useTodoMutations / useScheduleMutations DO invalidate the
    // cache — through a shared `invalidate` helper passed as `onSuccess`. The
    // rule only recognises an inline arrow at the call site.
    "react-doctor/query-mutation-missing-invalidation": "off",

    // This is a design-system + typed-API package: UI primitives
    // (CardHeader/CardTitle…), auth/query lib wrappers, Zod schemas and server
    // helpers/scaffolding (AppShell, PageContainer, ErrorBoundary, auth-schema)
    // are kept as an intentional public surface even before they are consumed.
    "deslop/unused-export": "off",
    "deslop/unused-file": "off",

    // The following are intentional decisions on generic UI primitives that also
    // carry an adjacent `biome-ignore`. They're suppressed here (not inline)
    // because react-doctor requires its directive to be the line immediately
    // above the code, which would displace the required biome-ignore comment.
    //
    // <Label> is a generic primitive; callers associate it with a control via
    // the spread `htmlFor` prop.
    "react-doctor/label-has-associated-control": "off",
    // <Dialog> is an intentional custom overlay: native <dialog> is avoided so
    // the imperative API/backdrop behaviour can be controlled manually.
    "react-doctor/prefer-tag-over-role": "off",
    "react-doctor/prefer-html-dialog": "off",

    // DEFERRED (not a false positive): wrapping the Dialog's onClose in
    // useEffectEvent is the right React 19 fix, but the pinned react-hooks
    // (5.2.0) and react-compiler ESLint plugins don't yet detect useEffectEvent
    // and emit false exhaustive-deps / react-compiler errors. Re-enable once the
    // lint toolchain supports effect events. See src/components/ui/dialog.tsx.
    "react-doctor/prefer-use-effect-event": "off",
  },
};
