# リポジトリリファクタリング設計書

## 現状分析

### リポジトリ概要
- **名前**: mt114ran.github.io (GitHub Pages)
- **技術スタック**: Next.js 15 + React 19 + Tailwind CSS 3 + TypeScript
- **ビルド方式**: `output: 'export'`（静的サイト生成）、`gh-pages`でデプロイ
- **Node.js**: `.nvmrc`あり

### 現在のコンテンツ構成

| セクション | パス | 内容 | 規模 |
|---|---|---|---|
| トップページ | `/` | ブログ記事一覧（タブ切替: 最新/日次メモ/BookMark） | - |
| ブログ記事 | `/blog/[slug]` | Markdownベースの技術ブログ（59記事） | 59ファイル |
| ブログ一覧 | `/blog/page/[pageNum]` | ページネーション付き一覧 | - |
| Noteトップ | `/note` | 個人作業スペースのポータル | - |
| Webテンプレート | `/note/webpage-temp` | 73種類のHTMLテンプレート集 | 3.1MB（データ） |
| ゲーム | `/note/game` | テトリス、スネーク、2048 | 3ゲーム |

### ディレクトリ構造
```
mt.github.io/
├── posts/                    # Markdownブログ記事（59ファイル）
├── src/
│   ├── app/
│   │   ├── page.tsx          # トップページ
│   │   ├── layout.tsx        # 共通レイアウト（ナビなし）
│   │   ├── globals.css       # グローバルCSS（99行）
│   │   ├── blog/             # ブログ機能
│   │   └── note/             # 個人プロジェクト
│   │       ├── game/         # ブラウザゲーム
│   │       └── webpage-temp/ # Webテンプレート集
│   ├── components/
│   │   ├── HomeTabs.tsx      # トップページのタブ
│   │   ├── Pagination.tsx
│   │   ├── ScrollToTopButton.tsx
│   │   ├── MermaidRenderer.tsx / MermaidWrapper.tsx
│   │   ├── games/            # ゲームコンポーネント（3つ）
│   │   └── templates/        # テンプレート関連コンポーネント
│   └── lib/
│       ├── posts.ts          # 記事取得ロジック
│       ├── games/            # ゲームデータ/型
│       └── templates/        # テンプレートデータ（73ファイル、3.1MB）
├── public/                   # 静的アセット
├── .github/workflows/        # Claude Bot CI（現在非活用？）
├── brainstorming/            # アイデアメモ
├── docs/                     # Claude API/Bot設定ドキュメント
├── project-ideas.md          # プロジェクトアイデア
└── copilot_suggestion.md     # Copilot提案メモ
```

---

## 課題と改善ポイント

### 1. 構造的な課題

| 課題 | 詳細 |
|---|---|
| **共通レイアウトがない** | ヘッダー/フッター/ナビゲーションが未実装。ページ間の遷移がしづらい |
| **テンプレートデータが巨大** | `templates/data/`が73ファイル3.1MBあり、ビルド時間・バンドルサイズに影響 |
| **コンポーネント分割が粗い** | `components/`直下にフラットに配置。共通UIコンポーネント（ボタン、カードなど）がない |
| **テーマ/スタイルの不統一** | トップページはダークテーマ、`/note`ページはライトテーマ。統一感がない |
| **lang属性が"en"** | 日本語サイトなのに`<html lang="en">`になっている |
| **不要ファイルの散在** | `copilot_suggestion.md`、`brainstorming/`、`project-ideas.md`等が散在 |

### 2. 機能的な課題

| 課題 | 詳細 |
|---|---|
| **SEO対策が不十分** | OGP、構造化データ、sitemap.xmlがない |
| **検索機能なし** | 59記事あるが検索手段がタブフィルタのみ |
| **タグページなし** | タグはあるがタグ別一覧ページがない |
| **記事のid重複** | `0030_`で始まるファイルが3つある（命名規則の破綻） |
| **Mermaid処理がad-hoc** | 正規表現ベースのプレースホルダー方式。remarkプラグインで統一すべき |

### 3. DX（開発体験）の課題

| 課題 | 詳細 |
|---|---|
| **テストなし** | ユニットテスト/E2Eテストが未設定 |
| **Lintが最小限** | ESLint設定はあるが、Prettierや他のツールが未設定 |
| **CI/CDが不十分** | Claude Botのワークフローのみ。ビルド/デプロイの自動化がない |

---

## リファクタリング計画

### Phase 1: 基盤整備（優先度: 高）

#### 1-1. 共通レイアウト・ナビゲーションの実装
- ヘッダー: サイト名 + ナビ（ブログ / Note / About）
- フッター: コピーライト + リンク
- レスポンシブナビゲーション（ハンバーガーメニュー）

#### 1-2. テーマの統一
- ダークテーマに統一（現在のトップページ基準）
- `/note`ページのライトテーマをダークに変更
- CSS変数によるテーマ管理の導入

#### 1-3. lang属性とメタデータの修正
- `<html lang="ja">`に変更
- 適切なmetadata設定

#### 1-4. 不要ファイルの整理
- `copilot_suggestion.md` -> 削除 or `.tmp/`へ移動
- `brainstorming/` -> `.tmp/`へ移動
- `project-ideas.md` -> `.tmp/`へ移動
- `docs/CLAUDE_API_SETUP.md`、`docs/CLAUDE_BOT_SETUP.md` -> 内容確認後整理

#### 1-5. 記事IDの重複修正
- `0030_`が3つ存在する問題を修正

### Phase 2: コンテンツ改善（優先度: 中）

#### 2-1. タグシステムの強化
- タグ別一覧ページ（`/blog/tags/[tag]`）の追加
- タグクラウドコンポーネント

#### 2-2. 検索機能の追加
- クライアントサイド検索（静的サイトのため）
- 記事タイトル/タグでのフィルタリング

#### 2-3. SEO対策
- `sitemap.xml`の自動生成
- OGPメタタグの設定
- 構造化データ（JSON-LD）

#### 2-4. テンプレートデータの最適化
- 動的import（コード分割）の導入
- テンプレートのカテゴリ別遅延読み込み

### Phase 3: DX改善（優先度: 中）

#### 3-1. テスト環境の構築
- Vitest導入（ユニットテスト）
- Playwright導入（E2Eテスト）

#### 3-2. CI/CDパイプライン
- GitHub Actionsでビルド/デプロイ自動化
- PRでのプレビューデプロイ

#### 3-3. コード品質ツール
- Prettier導入
- lint-staged + husky導入

---

## デプロイ先の比較: GitHub Pages vs Vercel

### 現状: GitHub Pages
```
ビルド: next build -> out/ (静的HTML)
デプロイ: gh-pages -d out -t
```

### 比較表

| 観点 | GitHub Pages | Vercel（無料枠） |
|---|---|---|
| **コスト** | 完全無料 | 無料（Hobby Plan） |
| **帯域制限** | 100GB/月 | 100GB/月 |
| **ビルド時間** | GitHub Actions（2000分/月） | 6000分/月 |
| **カスタムドメイン** | 対応 | 対応 |
| **HTTPS** | 自動 | 自動 |
| **プレビューデプロイ** | 手動構築が必要 | PR毎に自動 |
| **SSR/ISR** | 不可（静的のみ） | 対応 |
| **Edge Functions** | 不可 | 対応 |
| **Analytics** | 不可 | 対応（無料枠あり） |
| **Image Optimization** | 不可（`unoptimized: true`） | 対応（1000枚/月） |
| **リダイレクト/リライト** | 不可 | next.config.tsで設定可 |
| **速度** | CDN（Fastly） | Edge Network（グローバル） |

### 推奨: Vercelへの移行

**理由:**
1. **PRプレビューデプロイ**が自動で使える -> レビューが格段に楽になる
2. **Image Optimization**が使える -> `unoptimized: true`を外せる
3. **将来的なSSR/ISR対応**が可能 -> 記事検索APIなどを追加できる
4. **Analytics**が無料で使える -> PV確認が可能
5. **設定がほぼ不要** -> Vercelにリポジトリを接続するだけ
6. Next.jsの開発元 = Vercelなので相性が最高

**移行の手間:**
- `output: 'export'`を削除（または残してもOK）
- `basePath`/`assetPrefix`の設定を調整
- `gh-pages`パッケージを削除
- GitHub Actionsのデプロイworkflowを削除（Vercelが自動処理）

**注意点:**
- Vercel無料枠の制限: 商用利用不可（個人/趣味なら問題なし）
- チームメンバーは1人まで
- サーバーレス関数の実行時間: 10秒

### 折衷案: 両方使う
- **GitHub Pages**: メインサイト（独自ドメイン `mt114ran.github.io`）
- **Vercel**: 開発プレビュー用

この場合、GitHub Pagesでの運用を継続しつつ、Vercelのプレビューデプロイだけを活用する方法もある。

---

## 推奨される実行順序

1. **Phase 1-4**: 不要ファイル整理（すぐできる）
2. **Phase 1-5**: 記事ID重複修正（すぐできる）
3. **Phase 1-3**: lang属性修正（すぐできる）
4. **Vercel移行の判断**（判断後に次のステップが変わる）
5. **Phase 1-1**: 共通レイアウト・ナビゲーション
6. **Phase 1-2**: テーマ統一
7. **Phase 2以降**: 順次対応

---

## 次のアクション
ユーザーの判断が必要な項目:
- [ ] デプロイ先をVercelに変更するか？
- [ ] テーマはダークで統一するか？
- [ ] テンプレート機能は今後も拡張するか？（データ量の最適化方針に影響）
- [ ] どのPhaseから着手するか？
