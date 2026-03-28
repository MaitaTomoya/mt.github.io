---
title: 'Supabase vs Firebase 徹底比較'
order: 30
category: 'databases'
---

# Supabase vs Firebase 徹底比較

## 概要と歴史

### BaaS（Backend as a Service）とは

BaaS（Backend as a Service）は、バックエンドの機能（データベース、認証、ストレージ、リアルタイム通信など）をクラウドサービスとして提供するプラットフォームである。開発者はバックエンドのインフラ構築を省略し、フロントエンド開発に集中できる。

### Firebaseとは

Firebaseは、2011年にAndrew LeeとJames Tamplinによって設立されたリアルタイムデータベースサービスで、2014年にGoogleに買収された。以降、Googleの支援を受けて、認証、ホスティング、Cloud Functions、Analytics、Cloud Messaging（FCM）など、モバイル・Web開発に必要な機能を包括的に提供するプラットフォームに成長した。

### Supabaseとは

Supabaseは、2020年にPaul CopplestoneとAnt Wilsonによって設立された「オープンソースのFirebase代替」を標榜するBaaSプラットフォームである。PostgreSQLをベースとし、Firebaseに相当する機能（データベース、認証、ストレージ、リアルタイム、Edge Functions）をオープンソースの技術スタックで提供する。

### 主要なマイルストーン

| 年     | Firebase                     | Supabase                         |
| ------ | ---------------------------- | -------------------------------- |
| 2011年 | Firebase設立                 | -                                |
| 2012年 | Realtime Database公開        | -                                |
| 2014年 | Google買収                   | -                                |
| 2017年 | Cloud Firestore発表          | -                                |
| 2020年 | Firebase v9（モジュラーSDK） | Supabase設立、Y Combinatorに参加 |
| 2021年 | -                            | パブリックベータ、$30Mの資金調達 |
| 2022年 | -                            | Edge Functions、$80Mの資金調達   |
| 2023年 | Vertex AI統合                | AI/Vector統合、$116Mの資金調達   |
| 2024年 | Genkit                       | Supabase GA（正式版）、Branching |

---

## 強みと弱み

### Firebaseの強みと弱み

| 観点               | 強み                                          | 弱み                                            |
| ------------------ | --------------------------------------------- | ----------------------------------------------- |
| Googleエコシステム | GCP、Google Analyticsとの深い統合             | Googleへのベンダーロックイン                    |
| モバイル対応       | iOS/Android SDKが充実                         | Web開発では必要以上に複雑                       |
| リアルタイム       | Realtime Database/Firestoreのリアルタイム同期 | コストが予測しにくい                            |
| 認証               | Firebase Auth（ソーシャルログイン対応）       | カスタマイズの限界                              |
| Cloud Functions    | サーバーレス関数（Node.js/Python）            | コールドスタートの遅延                          |
| Analytics          | Firebase Analytics（無料）                    | データの所有権がGoogle                          |
| FCM                | プッシュ通知（無料）                          | 競合サービスとの統合が限定的                    |
| ドキュメント       | 充実した公式ドキュメント                      | 機能が多く全容把握が困難                        |
| 料金               | 無料枠が充実                                  | スケール時のコスト急増（Firestore読み取り課金） |

### Supabaseの強みと弱み

| 観点               | 強み                                        | 弱み                                      |
| ------------------ | ------------------------------------------- | ----------------------------------------- |
| オープンソース     | 全コンポーネントがOSS                       | 自己ホスティングの運用負荷                |
| PostgreSQL         | 業界標準のRDBMS、SQL対応                    | NoSQLの柔軟性が必要な場合は不向き         |
| データの所有権     | データは自分のPostgreSQLに                  | セルフホスト時の管理責任                  |
| 移行容易性         | 標準SQL、ベンダーロックインが少ない         | 一部Supabase固有の機能あり                |
| Row Level Security | PostgreSQLのRLSによるきめ細かいアクセス制御 | RLSポリシーの設計が複雑                   |
| Edge Functions     | Deno Deployベース                           | Firebase Functionsより機能が限定的        |
| リアルタイム       | Realtime機能（PostgreSQLのCDC）             | Firestoreのリアルタイムほどの成熟度はない |
| 型安全性           | supabase gen typesでTypeScript型自動生成    | 型生成のタイミング管理                    |
| ベクトル検索       | pgvectorによるAI/ML対応                     | 設定と最適化が必要                        |
| 成熟度             | 急速に成長中                                | Firebaseと比較すると歴史が浅い            |

---

## 技術スタック比較

### データベース

| 項目             | Firebase                          | Supabase                             |
| ---------------- | --------------------------------- | ------------------------------------ |
| DB種類           | Firestore（NoSQL）                | PostgreSQL（RDBMS）                  |
| データモデル     | ドキュメント/コレクション         | テーブル/行/列                       |
| クエリ言語       | Firestore SDK（メソッドチェーン） | SQL + PostgREST API                  |
| スキーマ         | スキーマレス                      | スキーマあり（マイグレーション管理） |
| リレーション     | 非正規化が基本                    | 正規化、外部キー、JOIN               |
| トランザクション | 対応（バッチ書き込み）            | 完全なACIDトランザクション           |
| インデックス     | 自動 + 複合インデックス手動       | 手動（柔軟性が高い）                 |
| 全文検索         | 非対応（Algolia連携が必要）       | 対応（tsvector/tsquery）             |
| ベクトル検索     | Vertex AI連携                     | pgvector拡張                         |

### 認証

| 項目                 | Firebase Auth                      | Supabase Auth（GoTrue）         |
| -------------------- | ---------------------------------- | ------------------------------- |
| メール/パスワード    | 対応                               | 対応                            |
| ソーシャルログイン   | Google, Facebook, Twitter, Apple等 | Google, GitHub, GitLab, Apple等 |
| 電話番号認証         | 対応                               | 対応                            |
| マジックリンク       | 非対応                             | 対応                            |
| SSO（SAML）          | Identity Platformで対応（有料）    | 対応（Proプラン）               |
| カスタムクレーム     | 対応                               | JWTカスタムクレーム             |
| マルチファクター認証 | 対応                               | 対応                            |
| Row Level Security   | Firestore Rules                    | PostgreSQL RLS                  |

### ストレージ

| 項目               | Firebase Storage     | Supabase Storage             |
| ------------------ | -------------------- | ---------------------------- |
| ベース             | Google Cloud Storage | S3互換オブジェクトストレージ |
| セキュリティ       | Storageルール        | PostgreSQL RLS               |
| 画像変換           | Firebase Extensions  | 組み込みの画像変換           |
| CDN                | Google CDN           | Supabase CDN                 |
| 最大ファイルサイズ | 5TB                  | 5GB（デフォルト）            |

### サーバーレス関数

| 項目             | Cloud Functions for Firebase                 | Supabase Edge Functions       |
| ---------------- | -------------------------------------------- | ----------------------------- |
| ランタイム       | Node.js, Python                              | Deno（TypeScript/JavaScript） |
| トリガー         | HTTP、Firestore、Auth、Storage、スケジュール | HTTP、Webhooks                |
| コールドスタート | あり（数秒）                                 | 短い（Deno Deploy）           |
| デプロイ         | firebase deploy                              | supabase functions deploy     |
| ローカル開発     | Firebase Emulator                            | supabase functions serve      |

### リアルタイム

| 項目                 | Firebase Realtime/Firestore | Supabase Realtime           |
| -------------------- | --------------------------- | --------------------------- |
| 仕組み               | WebSocket（自動管理）       | WebSocket（PostgreSQL CDC） |
| リアルタイムリスナー | onSnapshot                  | subscribe()                 |
| オフライン対応       | 自動キャッシュ + 同期       | 限定的                      |
| プレゼンス           | Realtime DBで対応           | Presence API                |
| ブロードキャスト     | 非対応                      | Broadcast API               |
| データベース変更検知 | 自動                        | Postgres Changes            |

---

## 適しているユースケース

### Firebaseが適しているケース

- **モバイルアプリ**: iOS/Android SDKの充実度
- **リアルタイムアプリ**: チャット、コラボレーションツール
- **プッシュ通知**: FCM（Firebase Cloud Messaging）
- **オフラインファースト**: Firestoreの自動オフライン対応
- **Google連携**: Analytics、AdMob、Crashlytics
- **プロトタイプ**: 素早くバックエンドを構築
- **Googleエコシステム**: GCPの他サービスとの連携

### Supabaseが適しているケース

- **Webアプリケーション**: PostgreSQL + TypeScript
- **SQLが必要**: 複雑なクエリ、JOIN、集計
- **データの所有権が重要**: オープンソース、セルフホスト可能
- **既存のPostgreSQLスキル**: SQLの知識を活かしたい
- **マイグレーション考慮**: ベンダーロックインを避けたい
- **AI/ベクトル検索**: pgvectorの活用
- **Row Level Security**: きめ細かいアクセス制御
- **TypeScript開発**: 型自動生成との親和性

### 適していないケース

| 状況                     | Firebase          | Supabase           |
| ------------------------ | ----------------- | ------------------ |
| 複雑なSQL JOIN           | Firestoreは不向き | 得意               |
| 完全オフライン対応       | 得意              | 限定的             |
| ベンダーロックイン回避   | 困難              | セルフホスト可能   |
| Google Analytics連携     | 得意              | 別途設定が必要     |
| 超大規模（ペタバイト級） | Firestoreの制約   | PostgreSQLの制約   |
| プッシュ通知             | FCMが強力         | 外部サービスが必要 |

---

## 料金比較

### 無料枠

| 項目         | Firebase                             | Supabase            |
| ------------ | ------------------------------------ | ------------------- |
| データベース | Firestore: 1GBストレージ、50K読取/日 | PostgreSQL: 500MB   |
| 認証         | 月間ユーザー数無制限                 | 月間50,000MAU       |
| ストレージ   | 5GB                                  | 1GB                 |
| 関数         | 月200万回呼出、40万時間GB            | 500K呼出、100万時間 |
| リアルタイム | 同時接続100                          | 200同時接続         |
| 帯域         | 10GB/月                              | 2GB/月              |

### 有料プラン（概算、最小構成）

| プラン     | Firebase（Blaze）      | Supabase（Pro）      |
| ---------- | ---------------------- | -------------------- |
| 月額基本料 | 従量課金のみ           | $25/月               |
| DB読み取り | $0.06/10万ドキュメント | 8GBまで含む          |
| DB書き込み | $0.18/10万ドキュメント | 8GBまで含む          |
| ストレージ | $0.026/GB/月           | 100GBまで含む        |
| 関数       | $0.40/100万回          | $2/100万回（超過分） |

### コスト予測の注意点

Firebaseは読み取り/書き込み回数ベースの課金であるため、アプリケーションの使い方によってはコストが急増する可能性がある。特にリアルタイムリスナーを多用する場合、予想以上の読み取り回数が発生することがある。

Supabaseは固定月額+従量課金のハイブリッドモデルで、コスト予測がしやすい。

---

## 採用企業の実例

### Firebase

| 企業/サービス      | 用途                       |
| ------------------ | -------------------------- |
| Duolingo           | プッシュ通知、Analytics    |
| Alibaba            | モバイルアプリバックエンド |
| The New York Times | ニュースアプリ             |
| Lyft               | Analytics、Crashlytics     |
| Shazam             | リアルタイムデータ         |
| Trivago            | A/Bテスト                  |

### Supabase

| 企業/サービス | 用途                           |
| ------------- | ------------------------------ |
| Peerlist      | プロフェッショナルネットワーク |
| Mobbin        | デザインリファレンス           |
| Chatbase      | AIチャットボット               |
| Quivr         | AIセカンドブレイン             |
| HappyKit      | フィーチャーフラグ             |
| Replicate     | AI推論プラットフォーム         |

---

## 移行

### FirebaseからSupabaseへの移行

Supabaseは公式の移行ガイドとツールを提供している。

| 移行対象                            | 方法                                      | 難易度                       |
| ----------------------------------- | ----------------------------------------- | ---------------------------- |
| Firestore → PostgreSQL              | データエクスポート + インポートスクリプト | 高（データモデル変更が必要） |
| Firebase Auth → Supabase Auth       | ユーザーデータのマイグレーション          | 中                           |
| Firebase Storage → Supabase Storage | ファイルの移行                            | 低                           |
| Cloud Functions → Edge Functions    | 書き換え（Node.js → Deno）                | 中〜高                       |
| Firestore Rules → RLS               | セキュリティルールの再設計                | 高                           |

主な注意点:

- FirestoreのドキュメントモデルをRDBMSのテーブルに変換する必要がある
- ネストされたドキュメントを正規化するか、JSONBカラムで対応するかの判断
- クライアントSDKの書き換え

---

## 開発体験の比較

| 項目           | Firebase                     | Supabase                       |
| -------------- | ---------------------------- | ------------------------------ |
| ダッシュボード | Firebase Console（多機能）   | Supabase Dashboard（モダン）   |
| CLI            | firebase-tools               | supabase CLI                   |
| ローカル開発   | Firebase Emulator Suite      | supabase start（Docker）       |
| TypeScript型   | 手動定義                     | supabase gen types（自動生成） |
| テスト         | Emulatorでテスト             | ローカルPostgreSQLでテスト     |
| SDK            | firebase, firebase-admin     | @supabase/supabase-js          |
| エミュレータ   | Firestore, Auth, Functions等 | PostgreSQL, Auth, Storage等    |

---

## 選択の判断基準

| 判断基準           | Firebase    | Supabase         |
| ------------------ | ----------- | ---------------- |
| モバイルアプリ中心 | 推奨        | -                |
| Webアプリ中心      | -           | 推奨             |
| SQLが必要          | -           | 推奨             |
| オフライン対応     | 推奨        | -                |
| オープンソース重視 | -           | 推奨             |
| Google連携         | 推奨        | -                |
| コスト予測性       | -           | 推奨             |
| プッシュ通知       | 推奨（FCM） | -                |
| AI/ベクトル検索    | -           | 推奨（pgvector） |
| RDBMSの経験        | -           | 推奨             |

---

## まとめ

FirebaseとSupabaseは、BaaS市場における二大選択肢であり、それぞれ異なる強みを持つ。

**Firebaseを選ぶべき場合**:

- モバイルアプリ（iOS/Android）が主体
- Googleエコシステム（Analytics、AdMob、FCM）を活用したい
- オフラインファーストが必要
- プッシュ通知が重要
- NoSQL（ドキュメントDB）が適したデータモデル

**Supabaseを選ぶべき場合**:

- Webアプリケーションが主体
- SQLとリレーショナルデータモデルが必要
- オープンソースとデータの所有権を重視
- TypeScript開発との親和性を求める
- ベンダーロックインを避けたい
- AI/ベクトル検索を活用したい

2026年現在のトレンドとしては、Webアプリケーション開発ではSupabaseの採用が急増している。PostgreSQLベースであることの安心感、型自動生成によるTypeScriptとの親和性、pgvectorによるAI対応が大きな要因である。一方、モバイルアプリ開発ではFirebaseの優位性は依然として高い。

---

## 参考リンク

- [Firebase公式ドキュメント](https://firebase.google.com/docs)
- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase GitHubリポジトリ](https://github.com/supabase/supabase)
- [Firebase GitHubリポジトリ](https://github.com/firebase/)
- [Supabase vs Firebase（公式比較ページ）](https://supabase.com/alternatives/supabase-vs-firebase)
