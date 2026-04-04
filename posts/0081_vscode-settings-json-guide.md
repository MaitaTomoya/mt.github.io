---
id: 81
title: "VSCode の .vscode/settings.json 活用ガイド — エンコーディング問題から便利設定まで"
tags: [VSCode, 開発環境, 設定, エンコーディング]
create: "2026-04-04 10:00"
---

## はじめに

VSCode でファイルを開いたら文字化けしていた——そんな経験はないだろうか。特にレガシーなプロジェクトでは EUC-JP や Shift_JIS のファイルと UTF-8 のファイルが混在していることが多い。

本記事では、実際に遭遇した「MDファイルがすべて EUC-JP で開かれて読めない」という問題の解決をきっかけに、`.vscode/settings.json` でできる便利な設定を幅広く紹介する。

---

## 実際に起きた問題：MDファイルの文字化け

### 状況

プロジェクトの PHP ファイルが EUC-JP で書かれているため、`.vscode/settings.json` に以下の設定があった。

```json
{
    "files.encoding": "eucjp"
}
```

この設定により **すべてのファイル** が EUC-JP として開かれる。PHP ファイルは正しく表示されるが、UTF-8 で書かれた Markdown ファイルや JSON ファイルは文字化けしてしまう。

### 解決策：言語別エンコーディング設定

VSCode では `[言語ID]` を使って、ファイルタイプごとに設定を上書きできる。

```json
{
    "files.encoding": "eucjp",
    "[markdown]": {
        "files.encoding": "utf8"
    },
    "[json]": {
        "files.encoding": "utf8"
    },
    "[jsonc]": {
        "files.encoding": "utf8"
    }
}
```

これで PHP ファイルは EUC-JP、Markdown や JSON は UTF-8 で開かれるようになる。

### 自動判定を使う方法

エンコーディングの自動判定を有効にする方法もある。

```json
{
    "files.autoGuessEncoding": true
}
```

ただし自動判定は万能ではない。短いファイルや ASCII のみのファイルでは誤判定が起きやすいため、明示的に指定するほうが確実だ。

---

## .vscode/settings.json の基本

### スコープ

VSCode の設定には 3 つのスコープがある。

| スコープ | 場所 | 影響範囲 |
|---|---|---|
| ユーザー設定 | `~/Library/Application Support/Code/User/settings.json` | すべてのプロジェクト |
| ワークスペース設定 | `.vscode/settings.json` | そのプロジェクトのみ |
| フォルダー設定 | `.code-workspace` ファイル内 | マルチルートワークスペースの特定フォルダー |

優先順位は **フォルダー > ワークスペース > ユーザー** の順。プロジェクト固有の設定は `.vscode/settings.json` に書くのがベストプラクティスだ。

### Git 管理すべきか

`.vscode/settings.json` はチームで共有すべき設定（エンコーディング、フォーマッター、拡張子の関連付けなど）を含む場合、Git にコミットするのが望ましい。個人的な設定（フォントサイズ、テーマなど）はユーザー設定に書く。

---

## ファイル関連の設定

### エンコーディング（files.encoding）

```json
{
    "files.encoding": "utf8"
}
```

主な値：`utf8`, `utf8bom`, `eucjp`, `shiftjis`, `iso88591`

### ファイルの関連付け（files.associations）

拡張子とファイルタイプの紐付けを定義できる。

```json
{
    "files.associations": {
        "*.inc": "php",
        "*.tpl": "smarty",
        "*.env.*": "dotenv",
        "Dockerfile.*": "dockerfile"
    }
}
```

これにより、`.inc` ファイルで PHP のシンタックスハイライトが効くようになる。

### 末尾の空白を自動削除（files.trimTrailingWhitespace）

```json
{
    "files.trimTrailingWhitespace": true
}
```

保存時に行末の不要な空白を自動で削除する。

### 最終行に改行を挿入（files.insertFinalNewline）

```json
{
    "files.insertFinalNewline": true
}
```

POSIX 準拠のため、ファイル末尾に必ず改行を入れる。Git の diff で `No newline at end of file` の警告が出なくなる。

### ファイルの除外（files.exclude）

エクスプローラーから特定のファイル・フォルダーを非表示にする。

```json
{
    "files.exclude": {
        "**/.git": true,
        "**/node_modules": true,
        "**/.DS_Store": true,
        "**/vendor": true
    }
}
```

### 検索対象の除外（search.exclude）

検索結果から除外するパターンを指定する。

```json
{
    "search.exclude": {
        "**/node_modules": true,
        "**/dist": true,
        "**/build": true,
        "**/*.min.js": true
    }
}
```

### ファイル監視の除外（files.watcherExclude）

大量のファイルがあるディレクトリを監視対象から外すことで、パフォーマンスを改善できる。

```json
{
    "files.watcherExclude": {
        "**/vendor/**": true,
        "**/node_modules/**": true,
        "**/storage/**": true
    }
}
```

---

## エディタの設定

### インデント

```json
{
    "editor.tabSize": 4,
    "editor.insertSpaces": true,
    "editor.detectIndentation": true
}
```

`detectIndentation` を `true` にすると、ファイルの既存のインデントを自動検出して合わせてくれる。

### 保存時の自動フォーマット

```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

言語ごとにフォーマッターを変えることもできる。

```json
{
    "[php]": {
        "editor.defaultFormatter": "bmewburn.vscode-intelephense-client"
    },
    "[javascript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[python]": {
        "editor.defaultFormatter": "ms-python.black-formatter"
    }
}
```

### 保存時のアクション（editor.codeActionsOnSave）

保存時に自動で実行するアクションを設定できる。

```json
{
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit",
        "source.organizeImports": "explicit"
    }
}
```

これにより、保存するたびに ESLint の自動修正とインポートの整理が実行される。

---

## 言語別設定の活用

`[言語ID]` を使うと、特定のファイルタイプだけに設定を適用できる。冒頭のエンコーディング問題もこの仕組みで解決した。

```json
{
    "[markdown]": {
        "editor.wordWrap": "on",
        "editor.quickSuggestions": {
            "other": false,
            "comments": false,
            "strings": false
        },
        "files.encoding": "utf8"
    },
    "[php]": {
        "editor.tabSize": 4,
        "editor.insertSpaces": true
    },
    "[javascript][typescript]": {
        "editor.tabSize": 2
    }
}
```

Markdown では自動補完を無効にし、折り返しを有効にする。PHP と JS/TS でインデント幅を変える。こうした細かい制御が言語別設定で実現できる。

### 利用可能な言語ID

よく使う言語IDの一覧：

| 言語ID | 対象 |
|---|---|
| `javascript` | JavaScript |
| `typescript` | TypeScript |
| `php` | PHP |
| `python` | Python |
| `markdown` | Markdown |
| `json` | JSON |
| `jsonc` | コメント付きJSON |
| `html` | HTML |
| `css` | CSS |
| `smarty` | Smarty テンプレート |

---

## ターミナルの設定

```json
{
    "terminal.integrated.defaultProfile.osx": "zsh",
    "terminal.integrated.fontSize": 13,
    "terminal.integrated.env.osx": {
        "LANG": "ja_JP.UTF-8"
    }
}
```

ターミナルの文字化けも `LANG` 環境変数の設定で防げる。

---

## 拡張機能の設定

拡張機能の設定もプロジェクト単位で管理できる。

```json
{
    "eslint.validate": [
        "javascript",
        "typescript",
        "vue"
    ],
    "php.validate.executablePath": "/usr/local/bin/php",
    "emmet.includeLanguages": {
        "smarty": "html"
    }
}
```

Smarty テンプレートで Emmet を HTML として使えるようにするなど、プロジェクト固有の拡張機能設定を共有できる。

---

## おすすめの設定テンプレート

### レガシー PHP プロジェクト（EUC-JP 混在）

今回の文字化け問題のようなケースに対応するテンプレート。

```json
{
    "files.encoding": "eucjp",
    "files.associations": {
        "*.inc": "php",
        "*.tpl": "smarty"
    },
    "files.insertFinalNewline": true,
    "files.trimTrailingWhitespace": true,

    "[markdown]": {
        "files.encoding": "utf8",
        "editor.wordWrap": "on"
    },
    "[json]": {
        "files.encoding": "utf8"
    },
    "[jsonc]": {
        "files.encoding": "utf8"
    },
    "[yaml]": {
        "files.encoding": "utf8"
    },

    "files.exclude": {
        "**/.git": true,
        "**/vendor": true,
        "**/.DS_Store": true
    },
    "search.exclude": {
        "**/vendor": true,
        "**/node_modules": true
    },

    "emmet.includeLanguages": {
        "smarty": "html"
    }
}
```

### モダン Web プロジェクト（TypeScript + React）

```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit"
    },
    "editor.tabSize": 2,

    "files.insertFinalNewline": true,
    "files.trimTrailingWhitespace": true,

    "typescript.preferences.importModuleSpecifier": "non-relative",
    "typescript.updateImportsOnFileMove.enabled": "always",

    "files.exclude": {
        "**/node_modules": true,
        "**/.next": true
    },
    "search.exclude": {
        "**/node_modules": true,
        "**/.next": true,
        "**/dist": true
    }
}
```

---

## まとめ

| やりたいこと | 設定キー |
|---|---|
| ファイルタイプ別にエンコーディングを変える | `[言語ID].files.encoding` |
| 拡張子とファイルタイプの関連付け | `files.associations` |
| 保存時の自動フォーマット | `editor.formatOnSave` |
| 保存時の自動修正 | `editor.codeActionsOnSave` |
| 末尾空白の削除 | `files.trimTrailingWhitespace` |
| エクスプローラーの非表示 | `files.exclude` |
| 検索対象の除外 | `search.exclude` |
| 言語別の詳細設定 | `[言語ID]` ブロック |

`.vscode/settings.json` を適切に設定しておくだけで、チーム全体の開発体験を統一し、文字化けやフォーマットのずれといった地味だが厄介な問題を防げる。今回のエンコーディング問題のように、設定一つで解決できることは意外と多い。
