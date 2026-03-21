# リファクタリングタスク一覧

## 決定事項
- デプロイ先: GitHub Pages -> Vercel に移行
- テーマ: ダークで統一
- テンプレート機能: 残す（Web制作受注用）
- 進め方: Phase 1 -> 2 -> 3 の順に全て実施

---

## Phase 1: 基盤整備 [完了]

### 1-4. 不要ファイルの整理
- [x] `copilot_suggestion.md`を`.tmp/`へ移動
- [x] `brainstorming/`を`.tmp/`へ移動
- [x] `project-ideas.md`を`.tmp/`へ移動
- [x] `docs/`を`.tmp/`へ移動

### 1-5. 記事IDの重複修正
- [x] `0030_`重複を解消（dotenv->0060, copilot->0061）
- [x] id欠損記事（0052-0056, 0058-0059）にID追加
- [x] id:100を修正（0051_->id:51）、id:51を修正（0057_->id:57）
- [x] frontmatter外の余分なid行を削除

### 1-3. lang属性とメタデータの修正
- [x] `<html lang="en">`を`<html lang="ja">`に変更

### 1-V. Vercel移行
- [x] `output: 'export'`を削除
- [x] `basePath`/`assetPrefix`設定を削除
- [x] `images: { unoptimized: true }`を削除
- [x] `gh-pages`パッケージを削除
- [x] `deploy`スクリプトを削除
- [ ] Vercelへの接続（ユーザーが手動で実施）

### 1-1. 共通レイアウト・ナビゲーション
- [x] ヘッダーコンポーネント作成（サイト名 + ナビ + レスポンシブ）
- [x] フッターコンポーネント作成
- [x] layout.tsxに組み込み
- [x] 各ページの個別ナビをヘッダーに統合

### 1-2. テーマの統一
- [x] `/note`ページをダークテーマに変更
- [x] `/note/webpage-temp`一覧ページをダークテーマに変更
- [x] `TemplateCard`コンポーネントをダークテーマに変更
- [x] ゲーム関連ページの背景色をグローバルに統一

---

## Phase 2: コンテンツ改善 [完了]

### 2-1. タグシステムの強化
- [x] タグ別一覧ページ（`/blog/tags/[tag]`）追加
- [x] タグ一覧ページ（`/blog/tags`）追加
- [x] ヘッダーにTagsリンク追加

### 2-2. 検索機能の追加
- [x] クライアントサイド検索コンポーネント（SearchBox）
- [x] 記事タイトル/タグでのフィルタリング
- [x] トップページに検索ボックス追加

### 2-3. SEO対策
- [x] sitemap.xml自動生成（`src/app/sitemap.ts`）
- [x] OGPメタタグ設定（layout.tsx）
- [x] metadataBase設定

### 2-4. テンプレートデータの最適化
- [ ] 動的importの導入 -> 別タスクとして切り出し（73ファイルの大規模変更）

---

## Phase 3: DX改善 [完了]

### 3-1. テスト環境の構築
- [x] Vitest導入（vitest.config.ts）
- [x] posts.tsのテスト作成（6テスト全合格）
- [x] Node.jsバージョン更新（20.5.0 -> 20）

### 3-2. CI/CDパイプライン
- [x] GitHub Actions CIワークフロー作成（lint, typecheck, test, build）
- [ ] Vercel自動デプロイ連携（Vercel接続後に自動）

### 3-3. コード品質ツール
- [x] Prettier導入（.prettierrc, .prettierignore）
- [x] lint-staged導入（.lintstagedrc.json）
- [x] husky導入（pre-commitフック）

---

## 残作業（ユーザー手動）
- [ ] Vercelにリポジトリを接続
- [ ] NEXT_PUBLIC_BASE_URL環境変数の設定（Vercelダッシュボード）
