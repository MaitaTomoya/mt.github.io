import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

// Next.js 16でnext lintが廃止されたため、eslint-config-nextが提供する
// flat configを直接読み込む構成に変更。旧FlatCompat経由の読み込みは
// eslint-config-next 16系でcircular structureエラーになるため使用しない。
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    // eslint-plugin-react-hooks v6が既定でerrorにするReact Compiler互換チェック用の
    // ルール群。本プロジェクトはReact Compilerを導入していないため、これらをerrorで
    // 強制するとビルド可能・実行時正常なコードまでCIを落とす。可視性は残しつつCIを
    // ブロックしないようwarnに緩和する。React Compiler導入時に改めてerror化を検討する。
    rules: {
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/refs": "warn",
    },
  },
];

export default eslintConfig;
