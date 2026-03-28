---
title: 'Vercel vs Cloudflare Pages vs AWS Amplify vs Netlify: フロントエンドホスティング比較'
order: 33
category: 'cloud-aws'
---

# Vercel vs Cloudflare Pages vs AWS Amplify vs Netlify: フロントエンドホスティング比較

## はじめに

フロントエンドアプリケーションのデプロイ先を選ぶことは、開発体験、パフォーマンス、コストに直結する重要な決定です。本記事では、主要なフロントエンドホスティングサービスを多角的に比較します。

### 身近な例えで理解するホスティングサービス

ホスティングサービスは「お店を出す場所」のようなものです。

- **Vercel** = 駅前の一等地。Next.jsの開発元が運営する最高の開発体験。ただし賃料（料金）は高め
- **Cloudflare Pages** = コスパ最強の商業施設。世界中に拠点があり、帯域幅無制限
- **AWS Amplify** = 大型ショッピングモール（AWS）のテナント。AWS全体との連携が強み
- **Netlify** = 老舗のレンタルスペース。Jamstackの先駆者で安定した実績

---

## 基本情報比較

| 項目                 | Vercel                    | Cloudflare Pages   | AWS Amplify               | Netlify                   |
| :------------------- | :------------------------ | :----------------- | :------------------------ | :------------------------ |
| 運営会社             | Vercel社                  | Cloudflare社       | Amazon                    | Netlify社                 |
| 設立/リリース        | 2015年                    | 2020年             | 2017年                    | 2014年                    |
| 得意なフレームワーク | Next.js                   | Astro, SvelteKit等 | React, Next.js等          | Gatsby, Hugo等            |
| エッジネットワーク   | Cloudflare利用            | Cloudflare自社     | CloudFront                | Cloudflare利用            |
| Git連携              | GitHub, GitLab, Bitbucket | GitHub, GitLab     | GitHub, GitLab, Bitbucket | GitHub, GitLab, Bitbucket |

---

## 料金比較

### 無料プラン

| 項目             | Vercel       | Cloudflare Pages     | AWS Amplify          | Netlify              |
| :--------------- | :----------- | :------------------- | :------------------- | :------------------- |
| 帯域幅           | 100GB/月     | 無制限               | 15GB/月              | 100GB/月             |
| ビルド時間       | 6,000分/月   | 500回/月             | 1,000分/月           | 300分/月             |
| サーバーレス実行 | 100GB-hrs    | 100,000リクエスト/日 | 500,000リクエスト/月 | 125,000リクエスト/月 |
| 同時ビルド       | 1            | 1                    | 1                    | 1                    |
| チームメンバー   | 1人（Hobby） | 無制限               | 無制限               | 1人                  |
| カスタムドメイン | 無制限       | 無制限               | 無制限               | 無制限               |
| SSL              | 自動         | 自動                 | 自動                 | 自動                 |

### 有料プラン（月額）

| プラン           | Vercel          | Cloudflare Pages           | AWS Amplify | Netlify         |
| :--------------- | :-------------- | :------------------------- | :---------- | :-------------- |
| 個人/小規模      | $20/月（Pro）   | 無料（Workers Paid $5/月） | 従量課金    | $19/月（Pro）   |
| チーム           | $20/ユーザー/月 | $5/月（Workers Paid）      | 従量課金    | $19/ユーザー/月 |
| エンタープライズ | カスタム        | カスタム                   | 従量課金    | $99/ユーザー/月 |

### 帯域幅超過時のコスト

| サービス         | 超過料金           |
| :--------------- | :----------------- |
| Vercel           | Pro: $40/100GB     |
| Cloudflare Pages | 無制限（超過なし） |
| AWS Amplify      | $0.15/GB           |
| Netlify          | $55/100GB          |

---

## 機能比較

### サーバーサイド機能

| 機能                              | Vercel                | Cloudflare Pages   | AWS Amplify          | Netlify                |
| :-------------------------------- | :-------------------- | :----------------- | :------------------- | :--------------------- |
| SSR（サーバーサイドレンダリング） | 対応                  | 対応（Workers）    | 対応                 | 対応                   |
| ISR（増分静的再生成）             | ネイティブ対応        | 手動実装           | 対応                 | 対応                   |
| Edge Functions                    | Vercel Edge Functions | Cloudflare Workers | CloudFront Functions | Netlify Edge Functions |
| Edge Middleware                   | ネイティブ対応        | Workers対応        | 非対応               | 対応                   |
| Cron Jobs                         | 対応                  | Workers Cron       | EventBridge連携      | Scheduled Functions    |
| WebSocket                         | 非対応（別途必要）    | Durable Objects    | AppSync              | 非対応                 |

### Edge Functionsの比較

Edge Functionsとは、ユーザーに近いサーバー（エッジ）でコードを実行する仕組みです。レスポンスが速くなるメリットがあります。

| 項目             | Vercel Edge  | Cloudflare Workers | Lambda@Edge | Netlify Edge |
| :--------------- | :----------- | :----------------- | :---------- | :----------- |
| ランタイム       | V8           | V8                 | Node.js     | Deno         |
| コールドスタート | 極めて短い   | 極めて短い         | 数百ms      | 極めて短い   |
| 実行時間制限     | 30秒（Free） | 50ms CPU（Free）   | 5秒         | 50秒         |
| メモリ           | 128MB        | 128MB              | 128MB       | 512MB        |
| グローバル拠点数 | 不明         | 300+               | 200+        | 不明         |

### 開発者体験（DX）

| 機能               | Vercel                    | Cloudflare Pages   | AWS Amplify        | Netlify            |
| :----------------- | :------------------------ | :----------------- | :----------------- | :----------------- |
| プレビューデプロイ | 全PR自動                  | 全PR自動           | 全PR自動           | 全PR自動           |
| ローカル開発       | vercel dev                | wrangler pages dev | amplify serve      | netlify dev        |
| 環境変数管理       | ダッシュボード+CLI        | ダッシュボード+CLI | ダッシュボード+CLI | ダッシュボード+CLI |
| デプロイ速度       | 非常に速い                | 速い               | やや遅い           | 速い               |
| ロールバック       | ワンクリック              | ワンクリック       | ワンクリック       | ワンクリック       |
| モニタリング       | Speed Insights, Analytics | Web Analytics      | CloudWatch連携     | Analytics          |

---

## フレームワーク対応状況

| フレームワーク | Vercel         | Cloudflare Pages   | AWS Amplify | Netlify                  |
| :------------- | :------------- | :----------------- | :---------- | :----------------------- |
| Next.js        | 最高（開発元） | 対応（アダプター） | 対応        | 対応                     |
| Nuxt.js        | 対応           | 対応               | 対応        | 対応                     |
| SvelteKit      | 対応           | 良好               | 対応        | 対応                     |
| Astro          | 対応           | 良好               | 対応        | 対応                     |
| Remix          | 対応           | 良好               | 対応        | 対応                     |
| Gatsby         | 対応           | 対応               | 対応        | 良好（Gatsby Cloud統合） |
| Angular        | 対応           | 対応               | 対応        | 対応                     |
| Vue.js（SPA）  | 対応           | 対応               | 対応        | 対応                     |
| React（SPA）   | 対応           | 対応               | 対応        | 対応                     |

---

## パフォーマンス比較

### レイテンシ（日本からのアクセス）

| サービス         | 初回応答時間（TTFB概算） | 静的配信速度 |
| :--------------- | :----------------------- | :----------- |
| Vercel           | 20-50ms                  | 非常に速い   |
| Cloudflare Pages | 10-30ms                  | 最速クラス   |
| AWS Amplify      | 30-80ms                  | 速い         |
| Netlify          | 20-60ms                  | 速い         |

Cloudflare Pagesは、Cloudflareの自社ネットワーク（世界300以上の拠点）を活用するため、静的コンテンツの配信速度は最速クラスである。

---

## 判断フローチャート

```
[フロントエンドホスティング選定]
    |
    v
[Next.jsを使う?]
    |
    +-- はい --> [予算に余裕がある?]
    |               |
    |               +-- はい --> Vercel（最高のNext.js体験）
    |               |
    |               +-- いいえ --> Cloudflare Pages（帯域幅無制限で安い）
    |
    +-- いいえ
         |
         v
    [AWSの他サービスと連携が必要?]
         |
         +-- はい --> AWS Amplify（AWS統合が強い）
         |
         +-- いいえ
              |
              v
         [帯域幅のコストを最小化したい?]
              |
              +-- はい --> Cloudflare Pages（帯域幅無制限）
              |
              +-- いいえ
                   |
                   v
              [静的サイト中心? (Jamstack)]
                   |
                   +-- はい --> Netlify or Cloudflare Pages
                   |
                   +-- いいえ --> Vercel or Cloudflare Pages
```

---

## 実際の企業での採用事例

### Vercel

- **Hulu**: 動画ストリーミングサービスのフロントエンドにVercelを採用
- **The Washington Post**: ニュースサイトのフロントエンドでVercelを利用
- **Notion**: ドキュメントツールのWebサイトでVercelを活用

### Cloudflare Pages

- 個人開発者やスタートアップでの採用が増加中
- 帯域幅無制限という特性から、画像や動画が多いサイトでの採用が多い

### AWS Amplify

- AWSを全面採用している企業のフロントエンド基盤として利用
- バックエンドがAWS（Lambda, DynamoDB等）の場合に選ばれやすい

### Netlify

- **Vite**: JavaScriptビルドツールの公式ドキュメント
- **Jamstack系サイト**: 静的サイトジェネレーターを使うプロジェクトでの採用が多い

---

## ユースケース別おすすめ

### 個人ブログ・ポートフォリオ

**おすすめ: Cloudflare Pages**

- 帯域幅無制限で完全無料
- 静的サイトの配信速度が最速クラス
- セットアップが簡単

### スタートアップのプロダクト

**おすすめ: Vercel**

- 最高の開発者体験
- プレビューデプロイが充実
- Next.jsとの相性が抜群

### エンタープライズWebアプリ

**おすすめ: AWS Amplify or Vercel Enterprise**

- AWSとの統合が必要ならAmplify
- SLAやサポートが必要ならVercel Enterprise

### 大規模メディアサイト

**おすすめ: Cloudflare Pages**

- 帯域幅コストを気にしなくてよい
- 世界中のユーザーに高速配信
- Workers連携でSSRも可能

---

## 移行時の注意点

サービス間の移行は比較的容易だが、以下の点に注意が必要:

| 移行元→先       | 注意点                                                    |
| :-------------- | :-------------------------------------------------------- |
| Vercel → 他     | Vercel固有のAPI（Image Optimization等）の置き換えが必要   |
| Netlify → 他    | netlify.tomlの設定を移行先の設定ファイルに変換            |
| Amplify → 他    | Amplify固有のバックエンド機能を使っている場合、分離が必要 |
| Cloudflare → 他 | Workers固有のAPIを使っている場合、置き換えが必要          |

---

## まとめ

| 選択基準            | おすすめサービス            |
| :------------------ | :-------------------------- |
| Next.jsの最高体験   | Vercel                      |
| コスト最優先        | Cloudflare Pages            |
| AWS統合             | AWS Amplify                 |
| Jamstack/静的サイト | Netlify or Cloudflare Pages |
| Edge Computing重視  | Cloudflare Pages            |

どのサービスも優れた機能を持っているが、最も重要なのは「プロジェクトの要件に合ったサービスを選ぶこと」である。料金、パフォーマンス、チームの経験、バックエンドとの連携など、複数の要素を総合的に評価して判断しよう。

---

## 2025年のトレンドと今後の展望

### Edge Computingの普及

2025年現在、全てのサービスがEdge Computing機能を強化している。ユーザーに最も近いサーバーで処理を実行することで、レスポンス時間を大幅に短縮できる。

| サービス   | Edge Runtime                       | 特徴                               |
| :--------- | :--------------------------------- | :--------------------------------- |
| Vercel     | Edge Functions                     | V8ベース、Next.js Middlewareに最適 |
| Cloudflare | Workers                            | V8ベース、最も拠点が多い（300+）   |
| Netlify    | Edge Functions                     | Denoベース                         |
| AWS        | CloudFront Functions / Lambda@Edge | Node.jsベース                      |

### サーバーコンポーネント（RSC）への対応

React Server Components（RSC）はフロントエンドの大きなパラダイムシフトである。各サービスの対応状況は以下の通り。

| サービス         | RSC対応  | 状況                       |
| :--------------- | :------- | :------------------------- |
| Vercel           | 完全対応 | Next.js App Routerで最適化 |
| Cloudflare Pages | 対応中   | OpenNextjsアダプターで対応 |
| AWS Amplify      | 対応     | Next.jsのRSCをサポート     |
| Netlify          | 対応     | Next.js Runtimeで対応      |

### Web Standardsへの回帰

2025年のトレンドとして、ベンダー固有のAPIではなく、Web標準API（Fetch API、Cache API、Web Streams等）を使ったコードが重視されている。Cloudflare WorkersはWeb標準に最も準拠しており、この点で優位性がある。

### コスト最適化の重要性

フロントエンドのトラフィックが増加するにつれ、帯域幅コストが無視できなくなる。特にメディアリッチなサイトでは、Cloudflare Pagesの帯域幅無制限が大きなアドバンテージとなる。

| トラフィック | Vercel(Pro) | Cloudflare Pages | Netlify(Pro) |
| :----------- | :---------- | :--------------- | :----------- |
| 100GB/月     | $0（含む）  | $0               | $0（含む）   |
| 500GB/月     | $160        | $0               | $220         |
| 1TB/月       | $360        | $0               | $495         |
| 5TB/月       | $1,960      | $0               | $2,695       |

---

## 参考リンク

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Cloudflare Pages公式ドキュメント](https://developers.cloudflare.com/pages/)
- [AWS Amplify公式ドキュメント](https://docs.aws.amazon.com/amplify/)
- [Netlify公式ドキュメント](https://docs.netlify.com/)
