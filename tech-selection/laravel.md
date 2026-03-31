---
title: 'Laravel 徹底解説'
order: 25
category: 'backend-frameworks'
---

# Laravel 徹底解説

## 概要と歴史

### Laravelとは

Laravelは、Taylor Otwellが2011年にリリースしたPHP製のフルスタックWebフレームワークである。PHPフレームワークの中で最も人気があり、「The PHP Framework for Web Artisans（Web職人のためのPHPフレームワーク）」というキャッチフレーズを掲げている。

Taylor OtwellはもともとCodeIgniterを使っていたが、認証やルーティングなどの機能が不足していると感じ、「PHPで美しく、表現力豊かなコードを書けるフレームワーク」としてLaravelを開発した。Ruby on RailsやASP.NET MVCから強い影響を受けている。

### 主要なマイルストーン

| 年     | 出来事                                        |
| ------ | --------------------------------------------- |
| 2011年 | Laravel v1リリース                            |
| 2012年 | Laravel v3（Artisan CLI、マイグレーション）   |
| 2013年 | Laravel v4（Composer採用、完全書き換え）      |
| 2015年 | Laravel v5（ディレクトリ構造刷新、Elixir）    |
| 2017年 | Laravel v5.5（LTS、Auto-Discovery）           |
| 2020年 | Laravel v8（Jetstream、モデルファクトリ刷新） |
| 2022年 | Laravel v9（Symfony 6ベース）                 |
| 2023年 | Laravel v10（PHP 8.1必須）                    |
| 2024年 | Laravel v11（最小構成、Laravel Cloud発表）    |

---

## 強みと弱み

| 観点              | 強み                                        | 弱み                                       |
| ----------------- | ------------------------------------------- | ------------------------------------------ |
| Eloquent ORM      | 美しいAPI、リレーション定義が直感的         | N+1問題が発生しやすい                      |
| Bladeテンプレート | シンプルで強力なテンプレートエンジン        | SPAとの統合は別途必要                      |
| Artisan CLI       | コード生成、マイグレーション、タスク実行    | カスタムコマンドが多くなると管理が大変     |
| エコシステム      | Forge、Vapor、Nova、Jetstream等の公式ツール | 一部は有料サービス                         |
| 学習曲線          | ドキュメントが優秀、コミュニティが活発      | フルスタック機能の全容把握には時間がかかる |
| PHP               | 世界のWebサイトの約77%で使用される言語      | 言語としてのイメージが低い場合がある       |
| テスト            | PHPUnit統合、Feature/Unitテストの区分       | テストの実行速度                           |
| キュー・ジョブ    | 標準搭載で設定が簡単                        | 大規模な場合は専用ツールが必要             |
| セキュリティ      | CSRF、XSS対策が標準                         | PHPの脆弱性に依存する部分もある            |
| 求人市場          | 世界的に豊富、日本でも需要あり              | SIer系ではSpring/Javaが優位                |

---

## コアコンセプト解説

### Eloquent ORM

EloquentはLaravelの中核をなすORM（Object-Relational Mapper）である。ActiveRecordパターンを採用し、RailsのActiveRecordに影響を受けている。

| 機能                | 説明                                           |
| ------------------- | ---------------------------------------------- |
| モデル定義          | テーブルとPHPクラスの対応                      |
| リレーション        | hasOne, hasMany, belongsTo, belongsToMany等    |
| スコープ            | 再利用可能なクエリ条件                         |
| アクセサ/ミューテタ | 属性の取得/設定時のデータ変換                  |
| ソフトデリート      | 論理削除                                       |
| イベント            | creating, created, updating, updated等のフック |
| コレクション        | クエリ結果の強力な操作メソッド群               |

### Bladeテンプレート

Bladeは、Laravelのテンプレートエンジンである。PHPコードを直接書くことも可能だが、Blade独自のディレクティブにより、よりクリーンなテンプレートを記述できる。

```
主要なディレクティブ:
  @if / @elseif / @else / @endif     → 条件分岐
  @foreach / @endforeach              → ループ
  @extends('layout')                  → レイアウト継承
  @section('content') / @endsection   → セクション定義
  @yield('content')                   → セクション表示
  @component / @endcomponent          → コンポーネント
  {{ $variable }}                     → エスケープ出力
  {!! $html !!}                       → 非エスケープ出力
```

### Artisan CLI

ArtisanはLaravelのコマンドラインツールである。

| コマンド        | 用途                   |
| --------------- | ---------------------- |
| make:model      | モデル作成             |
| make:controller | コントローラー作成     |
| make:migration  | マイグレーション作成   |
| make:seeder     | シーダー作成           |
| make:middleware | ミドルウェア作成       |
| make:request    | フォームリクエスト作成 |
| make:job        | ジョブ作成             |
| migrate         | マイグレーション実行   |
| db:seed         | シーダー実行           |
| route:list      | ルート一覧表示         |
| queue:work      | キューワーカー起動     |
| schedule:run    | スケジューラー実行     |

### サービスコンテナとサービスプロバイダ

LaravelのIoC（Inversion of Control）コンテナは、依存性注入の中核である。

```
サービスコンテナ: クラスの依存関係を解決し、インスタンスを生成する仕組み
  → コンストラクタに型宣言するだけで自動注入

サービスプロバイダ: サービスをコンテナに登録する場所
  → register(): バインディングの登録
  → boot(): 初期化処理
```

### Laravel 11の変更点

Laravel 11は「最小構成」をテーマに大幅なスリム化が行われた。

| 変更点                   | 説明                                    |
| ------------------------ | --------------------------------------- |
| ディレクトリ構造の簡素化 | Middleware、Consoleディレクトリ等が削除 |
| bootstrap/app.php        | アプリケーション設定の一元化            |
| スリムなスケルトン       | 不要なファイルが生成されなくなった      |
| PHP 8.2必須              | モダンPHP機能の活用                     |
| ヘルスチェック           | 標準搭載                                |
| 年1回のリリースサイクル  | LTSモデルから年次リリースへ             |

---

## Laravelエコシステム

### 公式ツール・サービス

| ツール            | 用途                                    | 備考         |
| ----------------- | --------------------------------------- | ------------ |
| Laravel Forge     | サーバープロビジョニング・デプロイ      | 有料サービス |
| Laravel Vapor     | サーバーレスデプロイ（AWS Lambda）      | 有料サービス |
| Laravel Nova      | 管理パネル構築                          | 有料         |
| Laravel Jetstream | 認証スカフォールド                      | 無料         |
| Laravel Breeze    | 軽量認証スカフォールド                  | 無料         |
| Laravel Cashier   | サブスクリプション課金（Stripe/Paddle） | 無料         |
| Laravel Scout     | 全文検索                                | 無料         |
| Laravel Horizon   | Redisキューの監視                       | 無料         |
| Laravel Telescope | デバッグ・監視ツール                    | 無料         |
| Laravel Sanctum   | API認証（SPA/モバイル）                 | 無料         |
| Laravel Livewire  | リアクティブUI（PHP only）              | 無料         |
| Inertia.js        | SPA開発（React/Vue + Laravel）          | 無料         |
| Laravel Sail      | Docker開発環境                          | 無料         |
| Laravel Herd      | ローカル開発環境（macOS/Windows）       | 無料版あり   |

### Livewire vs Inertia.js

フロントエンド開発のアプローチとして、LaravelにはLivewireとInertia.jsの2つの選択肢がある。

| 観点           | Livewire            | Inertia.js                         |
| -------------- | ------------------- | ---------------------------------- |
| 概念           | PHPでリアクティブUI | SPA（React/Vue）+ Laravel          |
| JavaScript     | 不要（PHPのみ）     | React/Vue/Svelteを使用             |
| 学習コスト     | 低い（PHPだけでOK） | 中（フロントエンドFWの知識が必要） |
| パフォーマンス | AJAX通信でDOM更新   | SPA的な高速遷移                    |
| 適したケース   | 管理画面、CRUD系    | モダンなUI/UX                      |

---

## 適しているユースケース

### Laravelが適しているケース

- **フルスタックWebアプリ**: ECサイト、SaaS、SNS
- **API開発**: RESTful API、GraphQL API
- **管理画面付きWebサービス**: Nova/Filamentによる素早い構築
- **コンテンツ管理**: ブログ、メディアサイト
- **SaaS**: マルチテナント、課金管理（Cashier）
- **リアルタイム通信**: Broadcasting（Pusher/WebSocket）

### 適していないケース

- **超高パフォーマンス要件**: Go、Rustの方が適切
- **マイクロサービス**: 軽量なフレームワークの方が適切
- **機械学習**: Pythonの方が適切
- **非PHP環境**: チームがPHPに不慣れな場合

---

## 採用企業の実例

| 企業          | 用途                           | 備考                   |
| ------------- | ------------------------------ | ---------------------- |
| 9GAG          | コンテンツプラットフォーム     | 大規模トラフィック     |
| Barracuda     | セキュリティ製品               | エンタープライズ       |
| About You     | ECプラットフォーム             | ドイツのファッションEC |
| Alison        | オンライン学習プラットフォーム | EdTech                 |
| Ratio         | FinTechプラットフォーム        | 金融                   |
| Invoice Ninja | 請求書管理SaaS                 | オープンソースSaaS     |
| BASE          | ECプラットフォーム             | 日本のEC               |
| note          | コンテンツプラットフォーム     | 日本のメディア         |

---

## パフォーマンス特性

### リクエスト処理速度

| 構成                         | リクエスト/秒（概算） |
| ---------------------------- | --------------------- |
| Laravel（PHP-FPM）           | 約500-2,000 req/s     |
| Laravel Octane（Swoole）     | 約5,000-15,000 req/s  |
| Laravel Octane（RoadRunner） | 約4,000-12,000 req/s  |

### Laravel Octane

Laravel 8.x以降で導入されたOctaneは、アプリケーションを常駐プロセスとして実行することで、リクエストごとのブートストラップコストを排除し、大幅なパフォーマンス向上を実現する。

| 観点           | 通常のPHP-FPM        | Octane（Swoole）   |
| -------------- | -------------------- | ------------------ |
| リクエスト処理 | 毎回ブートストラップ | 初回のみ           |
| パフォーマンス | 基準                 | 5-10倍向上         |
| メモリ管理     | リクエスト終了で解放 | メモリリークに注意 |
| 並行処理       | プロセスベース       | コルーチンベース   |

---

## 他フレームワークとの比較

| 観点         | Laravel       | Rails               | Django       | Spring Boot       |
| ------------ | ------------- | ------------------- | ------------ | ----------------- |
| 言語         | PHP           | Ruby                | Python       | Java/Kotlin       |
| ORM          | Eloquent      | ActiveRecord        | Django ORM   | Spring Data JPA   |
| テンプレート | Blade         | ERB/Slim            | Jinja2       | Thymeleaf         |
| CLI          | Artisan       | rails               | manage.py    | Spring Initializr |
| 管理画面     | Nova/Filament | ActiveAdmin         | Django Admin | 自作              |
| キュー       | Laravel Queue | Sidekiq/Solid Queue | Celery       | Spring Batch      |
| 学習曲線     | 中            | 中                  | 中           | 急                |
| 求人（日本） | 増加中        | 多い                | 増加中       | 多い              |

---

## 学習ロードマップ

### Laravel初学者向け

1. **PHPの基礎**: OOP、名前空間、Composer
2. **Laravelの基本**: ルーティング、コントローラー、ビュー
3. **Eloquent**: モデル、マイグレーション、リレーション
4. **Blade**: テンプレート、コンポーネント
5. **認証**: Breeze or Jetstream
6. **バリデーション**: FormRequest、カスタムルール
7. **テスト**: Feature Test、Unit Test
8. **キュー/ジョブ**: 非同期処理
9. **API開発**: Sanctum、API Resources
10. **デプロイ**: Forge or Docker

---

## まとめ

Laravelは、PHP最人気のフレームワークとして確固たる地位を築いている。Eloquentの直感的なAPI、Bladeの美しいテンプレート、Artisanの生産性、そして豊富な公式エコシステムにより、フルスタックWebアプリケーション開発において極めて高い生産性を実現する。

特に以下の場合にLaravelを推奨する。

- PHPで本格的なWebアプリケーションを開発したい
- フルスタック開発を一つのフレームワークで完結させたい
- 管理画面付きのWebサービスを素早く構築したい
- 既存のPHPプロジェクトをモダン化したい

Laravel 11の「最小構成」への移行と、Livewire/Inertia.jsによるモダンなフロントエンド対応により、Laravelは今後もPHP Webフレームワークのトップであり続けるだろう。

---

## 参考リンク

- [Laravel公式ドキュメント](https://laravel.com/docs)
- [Laravel公式サイト](https://laravel.com/)
- [Laravel GitHubリポジトリ](https://github.com/laravel/laravel)
- [Laracasts（学習サイト）](https://laracasts.com/)
- [Laravel News](https://laravel-news.com/)
