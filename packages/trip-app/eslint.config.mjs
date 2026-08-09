// eslint.config.mjs
//
// ツール分担:
//   Biome              … フォーマット / 一般lint / import整理 / a11y
//                        / Cognitive Complexity (閾値10, error)
//                        / 命名規則 / noBarrelFile 等
//   ESLint (本ファイル) … ① react-hooks + react-compiler
//                         ② アーキテクチャ境界 (boundaries)
//                         ③ TanStack Query
//                         ④ SonarJS — コードスメル / 複雑度 / 重複検出
//                         ⑤ 肥大化メトリクス (行数・引数・ネスト・依存数)
//                         ⑥ fetch 直書き禁止
//   dependency-cruiser … ファイルシステム依存グラフ lint
//   react-doctor       … React アンチパターン / ヘルススコア
//
// SonarJS と Biome の役割分担:
//   Biome の noExcessiveCognitiveComplexity … 関数単位の Cognitive Complexity
//   SonarJS の cognitive-complexity        … 同じアルゴリズムで IDE リアルタイム検知
//   → 両方有効にすることで IDE (SonarJS) + CI (Biome) の二重チェックを実現
//   SonarJS の no-identical-functions      … コードクローン検出 (旧 Lizard --CPD 相当)
//   SonarJS の no-duplicate-string        … マジックストリング検出

import tsParser      from "@typescript-eslint/parser";
import reactHooks    from "eslint-plugin-react-hooks";
import reactCompiler from "eslint-plugin-react-compiler";
import boundaries    from "eslint-plugin-boundaries";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import importPlugin  from "eslint-plugin-import";
import sonarjs       from "eslint-plugin-sonarjs";

// ================================================================
// 閾値定数 — ここを変えれば全ルールに反映
// ================================================================
const THRESHOLDS = {
  COGNITIVE_COMPLEXITY: 10,   // Biome と揃える
  MAX_FUNC_LINES:        60,   // 空行・コメント除く実行行（hooks/logic）
  MAX_FUNC_LINES_TSX:    90,  // TSX コンポーネントは JSX で行数を要するため緩め
  MAX_FILE_LINES:       300,   // ファイル全体
  MAX_PARAMS:             4,   // 4超 → オブジェクト引数化のサイン
  MAX_DEPTH:              3,   // 3超 → Early return で対応
  MAX_DEPENDENCIES:      10,   // 10超 → 多重責務の間接シグナル
  DUPLICATE_STRING_MIN:   5,   // 同一文字列が5回以上 → 定数化
  IDENTICAL_FUNC_LINES:   5,   // 同一実装が5行以上の関数 → 関数抽出
};

export default [
  // ----------------------------------------------------------------
  // グローバル除外
  // ----------------------------------------------------------------
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      "docs/**",
      "*.config.cjs",
      ".dependency-cruiser.cjs",
    ],
  },

  // ================================================================
  // ⓪ TypeScript パーサ
  //    flat config では TS/TSX を解釈するため明示的にパーサを設定する
  // ================================================================
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
  },

  // ================================================================
  // ① react-hooks + react-compiler
  //    Biome の useExhaustiveDependencies より厳密
  // ================================================================
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks":    reactHooks,
      "react-compiler": reactCompiler,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-compiler/react-compiler": "error",
    },
  },

  // ================================================================
  // ② アーキテクチャ境界 (eslint-plugin-boundaries)
  //    IDE 上でリアルタイムにアーキテクチャ違反を検出
  //
  //    依存方向:
  //      pages → features → components → hooks → lib → types
  //                       → api        → lib    → types
  //    禁止: features 同士の横断 / components → api 直呼び
  // ================================================================
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "pages",      pattern: "src/routes/**/*"      },
        { type: "features",   pattern: "src/features/**/*"   },
        { type: "components", pattern: "src/components/**/*" },
        { type: "hooks",      pattern: "src/hooks/**/*"      },
        { type: "api",        pattern: "src/api/**/*"        },
        { type: "lib",        pattern: "src/lib/**/*"        },
        { type: "types",      pattern: "src/types/**/*"      },
      ],
      "boundaries/ignore": [
        "**/*.test.*",
        "**/*.spec.*",
        "**/*.stories.*",
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "pages",      allow: ["features","components","hooks","api","lib","types"] },
            { from: "features",   allow: ["components","hooks","api","lib","types"] },
            { from: "components", allow: ["hooks","lib","types"] },
            { from: "hooks",      allow: ["lib","types"] },
            { from: "api",        allow: ["lib","types"] },
            { from: "lib",        allow: ["types"] },
            { from: "types",      allow: [] },
          ],
        },
      ],
    },
  },

  // ================================================================
  // ③ TanStack Query ベストプラクティス
  //    queryKey の依存変数漏れ等を静的検出
  // ================================================================
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "@tanstack/query": tanstackQuery },
    rules: {
      ...tanstackQuery.configs["flat/recommended"].rules,
    },
  },

  // ================================================================
  // ④ SonarJS — コードスメル / 重複 / 論理バグ検出
  //
  //    旧 Lizard との置き換え対応:
  //      Lizard --CPD (コードクローン)  → no-identical-functions
  //      Lizard -C 10 (Cyclomatic)     → cognitive-complexity (同アルゴリズム)
  //
  //    Biome との重複回避:
  //      Biome が担う noExplicitAny / noUnusedVars 等は SonarJS で有効化しない
  //      sonarjs/recommended を丸ごと使わず、必要ルールだけをピンポイント指定
  // ================================================================
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { sonarjs },
    rules: {
      // --- 複雑度 (Biome と同アルゴリズム → IDE でリアルタイム表示) ---
      "sonarjs/cognitive-complexity": ["error", THRESHOLDS.COGNITIVE_COMPLEXITY],

      // --- コードクローン検出 (旧 Lizard --CPD 相当) ---
      // 同一実装を持つ関数 → どちらかを削除 or 共通関数に抽出
      "sonarjs/no-identical-functions": ["warn", THRESHOLDS.IDENTICAL_FUNC_LINES],

      // --- 重複文字列 (マジックストリング化のサイン) ---
      // 同一文字列リテラルが 3 回以上 → 定数に切り出す
      "sonarjs/no-duplicate-string": [
        "warn",
        { threshold: THRESHOLDS.DUPLICATE_STRING_MIN },
      ],

      // --- 条件分岐の重複実装 ---
      // if/else の両ブランチが同じ実装 → コピペバグの典型
      "sonarjs/no-duplicated-branches":     "error",
      "sonarjs/no-all-duplicated-branches": "error",

      // --- 同一条件式 ---
      // a === a のような恒真/恒偽条件
      "sonarjs/no-identical-conditions":  "error",
      "sonarjs/no-identical-expressions": "error",

      // --- 論理バグ ---
      // 無視されるべきでない戻り値 (副作用のない関数の戻り値を捨てている)
      "sonarjs/no-ignored-return": "warn",

      // 空のコレクションへのアクセス
      "sonarjs/no-empty-collection": "error",

      // --- 冗長コード ---
      // 折りたたみ可能な if 文 → else if に統合
      "sonarjs/no-collapsible-if": "warn",

      // 不要な boolean リテラル (return x === true など)
      "sonarjs/no-redundant-boolean": "error",

      // 不要な jump 文 (関数末尾の return; 等)
      "sonarjs/no-redundant-jump": "warn",

      // switch が多すぎる case を持つ → 別構造化を検討
      "sonarjs/max-switch-cases": ["warn", 10],
    },
  },

  // ================================================================
  // ⑤ 肥大化メトリクス (Biome 未実装ルールを ESLint で補完)
  //    Biome 担当: noExcessiveCognitiveComplexity (閾値10)
  //    SonarJS 担当: cognitive-complexity (同閾値10, IDE表示)
  //    ESLint 担当: 行数 / ファイル行数 / 引数数 / ネスト / 依存数
  // ================================================================
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { import: importPlugin },
    rules: {
      // --- 関数行数 ---
      // TSX (JSX コンポーネント) は JSX の冗長性を考慮して緩めの閾値
      // TS (hooks/logic) は厳格に 60 行を維持

      // ファイル全体の行数
      "max-lines": [
        "warn",
        {
          max:            THRESHOLDS.MAX_FILE_LINES,
          skipBlankLines: true,
          skipComments:   true,
        },
      ],

      // 引数数 (4超 → オブジェクト引数に束ねる)
      "max-params": ["warn", { max: THRESHOLDS.MAX_PARAMS }],

      // ネスト深さ (3超 → Early return / Extract Function)
      "max-depth": ["warn", { max: THRESHOLDS.MAX_DEPTH }],

      // 1ファイルの依存モジュール数 (10超 → 多重責務のシグナル)
      "import/max-dependencies": [
        "warn",
        {
          max:               THRESHOLDS.MAX_DEPENDENCIES,
          ignoreTypeImports: true,
        },
      ],

      // 循環参照 (Biome 未実装 / dependency-cruiser の二重チェック)
      "import/no-cycle": ["error", { maxDepth: 5 }],
    },
  },

  // --- import/max-dependencies 適用除外: 構成ルートファイル ---
  // ルート定義 / ルーター集約 / 複数ダイアログの調整役など、ファイルの
  // 唯一の責務が「まとめること」であるファイルは、依存数が機能の追加に
  // 比例して増えるのが自然であり、多重責務のシグナルにはならない。
  {
    files: [
      "src/routeTree.tsx",
      "src/server/app.ts",
      "src/features/schedule/components/ScheduleSection.tsx",
    ],
    rules: {
      "import/max-dependencies": "off",
    },
  },

  // --- max-lines-per-function: TSX は JSX の冗長性を考慮して緩め ---
  {
    files: ["src/**/*.tsx"],
    rules: {
      "max-lines-per-function": ["warn", { max: THRESHOLDS.MAX_FUNC_LINES_TSX, skipBlankLines: true, skipComments: true, IIFEs: true }],
    },
  },
  {
    files: ["src/**/*.ts"],
    rules: {
      "max-lines-per-function": ["warn", { max: THRESHOLDS.MAX_FUNC_LINES, skipBlankLines: true, skipComments: true, IIFEs: true }],
    },
  },

  // ================================================================
  // ⑥ fetch 直書き禁止
  //    components / pages / features での fetch() 直接呼び出しを禁止
  // ================================================================
  {
    files: [
      "src/components/**/*.{ts,tsx}",
      "src/routes/**/*.{ts,tsx}",
      "src/features/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name:    "fetch",
          message: "fetch() を直接呼ばないでください。src/api/ に queryFn を定義し useQuery 経由にしてください。",
        },
      ],
    },
  },

  // ================================================================
  // テスト・設定ファイルの例外
  // ================================================================
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "max-lines-per-function":      ["warn", { max: 120, skipBlankLines: true, skipComments: true }],
      "max-lines":                   ["warn", { max: 500, skipBlankLines: true, skipComments: true }],
      "max-params":                  "off",
      "import/max-dependencies":     "off",
      // テストでは同じセットアップを繰り返すことが多い
      "sonarjs/no-identical-functions": "off",
      "sonarjs/no-duplicate-string":    "off",
    },
  },
];
