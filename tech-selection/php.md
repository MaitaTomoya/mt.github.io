---
title: 'PHP'
order: 13
category: 'backend-languages'
---

# PHP -- Webの75%を支えるサーバーサイド言語

## はじめに

PHPは1995年にRasmus Lerdorfによって開発されたサーバーサイドスクリプト言語である。「Personal Home Page Tools」の略称から始まった言語が、今やWeb全体の75%以上を動かす巨大な存在となっている。批判されることも多いPHPだが、その圧倒的な普及率と近年の劇的な改善は、正当な評価に値する。

本記事では、PHPの歴史的経緯、現在の強み・弱み、PHP8での大幅改善、そしてWordPressエコシステムの巨大さを解説する。

---

## PHPの立ち位置

### Webの75%を支える言語

```
Web全体の言語シェア（サーバーサイド、W3Techs 2025年概算）:

PHP        : ████████████████████████████████████████ ~75%
Ruby       : ███ ~5%
Java       : ██ ~4%
Python     : ██ ~3%
JavaScript : ██ ~3%
その他      : ████ ~10%

* CMS（WordPress、Joomla等）を含む全Webサイト対象
* 企業システムやAPIだけで見ると割合は異なる
```

この圧倒的なシェアの主な要因はWordPressである。世界のWebサイトの40%以上がWordPressで構築されており、WordPressはPHPで書かれている。

### PHPの歴史

```
PHPの進化:

1995: PHP/FI（Personal Home Page / Forms Interpreter）
  --> CGIの代替としてフォーム処理用に開発

1998: PHP 3
  --> 言語の再設計、コミュニティ主導に

2000: PHP 4（Zend Engine）
  --> 本格的なWeb開発言語に

2004: PHP 5（OOP対応）
  --> オブジェクト指向プログラミングをサポート

2015: PHP 7（高速化）
  --> 性能が2倍以上に、メモリ使用量半減
  --> PHP 6はスキップ（Unicode対応断念）

2020: PHP 8.0（JIT、Union型、Match式）
  --> モダン言語に大幅進化

2023: PHP 8.3（型付きクラス定数、json_validate）
  --> さらなる改善

2024: PHP 8.4（プロパティフック、非対称可視性）
  --> モダン化が加速
```

---

## PHPの強み

### 1. 圧倒的な普及率

PHPが選ばれ続ける最大の理由は、その圧倒的な普及率とエコシステムの成熟度である。

| 指標                  | 数値                |
| --------------------- | ------------------- |
| Webサイトシェア       | ~75%                |
| WordPressシェア       | Webサイト全体の~43% |
| Packagistパッケージ数 | 38万+               |
| PHPフレームワーク数   | 数十種類            |
| ホスティング対応率    | ほぼ100%            |

### 2. WordPress -- 世界最大のCMSエコシステム

```
WordPressの規模:

全Webサイトの~43%がWordPress
CMS市場でのシェア: ~63%

WordPressエコシステム:
+------------------+------------------+
| テーマ            | 1万+（公式のみ）  |
| プラグイン         | 6万+（公式のみ）  |
| 開発者コミュニティ  | 数百万人         |
| 関連する仕事       | 全Web関連の~30%  |
+------------------+------------------+

WordPress案件の種類:
  - コーポレートサイト
  - ブログ/メディア
  - ECサイト（WooCommerce）
  - 会員制サイト
  - ポートフォリオサイト
  - ランディングページ
```

### 3. Laravel -- モダンPHP Webフレームワーク

LaravelはPHP界で最も人気のあるフレームワークであり、Ruby on Railsに影響を受けた優雅な構文と充実した機能を提供する。

```php
// Laravelのルーティング
Route::get('/articles', [ArticleController::class, 'index']);
Route::post('/articles', [ArticleController::class, 'store']);
Route::get('/articles/{article}', [ArticleController::class, 'show']);

// Eloquent ORM（ActiveRecordパターン）
class Article extends Model
{
    protected $fillable = ['title', 'content', 'author_id'];

    // リレーション定義
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    // スコープ
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('published_at', '<=', now());
    }
}

// コントローラー
class ArticleController extends Controller
{
    public function index(): JsonResponse
    {
        $articles = Article::published()
            ->with(['author', 'tags'])
            ->latest()
            ->paginate(20);

        return response()->json($articles);
    }

    public function store(StoreArticleRequest $request): JsonResponse
    {
        $article = Article::create($request->validated());
        return response()->json($article, 201);
    }
}
```

Laravelの主要機能:

| 機能         | 説明                            |
| ------------ | ------------------------------- |
| Eloquent ORM | 直感的なActiveRecordパターンORM |
| Blade        | テンプレートエンジン            |
| Artisan      | CLIツール                       |
| Migration    | データベースマイグレーション    |
| Queue        | ジョブキュー                    |
| Broadcasting | リアルタイムイベント            |
| Sanctum      | API認証                         |
| Horizon      | Redisキュー管理ダッシュボード   |
| Sail         | Docker開発環境                  |
| Livewire     | リアクティブUI（SPAなし）       |

### 4. 学習の容易さ

PHPは、HTMLに埋め込む形で書き始められるため、初心者にとって非常にとっつきやすい。

```php
<!-- PHPの最もシンプルな例 -->
<!DOCTYPE html>
<html>
<body>
  <h1>現在時刻</h1>
  <p><?php echo date('Y-m-d H:i:s'); ?></p>

  <?php
  // 変数と条件分岐
  $hour = (int)date('H');
  if ($hour < 12) {
      echo '<p>おはようございます</p>';
  } elseif ($hour < 18) {
      echo '<p>こんにちは</p>';
  } else {
      echo '<p>こんばんは</p>';
  }
  ?>
</body>
</html>
```

### 5. 共有ホスティング対応

PHPは事実上全てのレンタルサーバーで利用可能であり、月額数百円の格安ホスティングでもPHP + MySQLの組み合わせが利用できる。

```
ホスティング環境の対応状況:

PHP    : ████████████████████████ ほぼ100%のホスティングが対応
Python : ████████ VPS/クラウドが必要なことが多い
Ruby   : ██████ Heroku等の特定環境が主
Node.js: ████████ VPS/クラウドが一般的
Go     : ████ VPS/コンテナが基本
Java   : ██████ 専用サーバーが必要なことが多い

* 格安ホスティング（月額数百円レベル）での対応状況
```

---

## PHPの弱み

### 1. 歴史的な設計の不整合

PHPは長い歴史の中で、一貫性のない設計が蓄積されている。

```php
// 関数名の不整合
strlen($str);      // 文字列長
str_replace();     // 文字列置換（アンダースコア区切り）
strpos();          // 文字列検索（区切りなし）

// 引数順序の不整合
array_map($callback, $array);    // コールバックが先
array_filter($array, $callback); // 配列が先

// array_関数 vs str関数の命名規則の違い
// PHP 8.1以降のFiber等で改善が進んでいる
```

### 2. 型安全性の課題

PHPは動的型付け言語であり、暗黙の型変換が予期しない動作を引き起こすことがある。

```php
// PHPの暗黙の型変換（弱い比較演算子の問題）
var_dump(0 == "foo");   // PHP 7: true（!）, PHP 8: false（修正済み）
var_dump("" == false);  // true
var_dump(null == false); // true

// 対策: 厳格な比較演算子を使用
var_dump(0 === "foo");  // false（型も比較する）

// PHP 8以降のstrict_types宣言
declare(strict_types=1);

function add(int $a, int $b): int {
    return $a + $b;
}

add("1", "2"); // TypeError（厳格モードではエラー）
```

### 3. パフォーマンスの上限

PHPはリクエストごとにプロセスを起動する「Shared Nothing」アーキテクチャであり、メモリ上にステートを保持できない。

```
PHPの実行モデル（従来）:

リクエスト1: [起動][初期化][実行][レスポンス][破棄]
リクエスト2: [起動][初期化][実行][レスポンス][破棄]
リクエスト3: [起動][初期化][実行][レスポンス][破棄]
  * 毎回ゼロから初期化 --> オーバーヘッドが大きい

Node.js / Go等:
[起動][初期化]
  --> リクエスト1 --> レスポンス
  --> リクエスト2 --> レスポンス
  --> リクエスト3 --> レスポンス
  * プロセスを維持 --> 初期化コストなし

改善策:
  - OPcache（コンパイル結果をキャッシュ）
  - PHP-FPM（プロセスプール管理）
  - Swoole / RoadRunner（常駐プロセス）
  - Octane（Laravel高速化）
```

---

## PHP8での大幅改善

PHP8は、PHPの歴史において最大級のアップデートである。

### JITコンパイラ

```
PHP 7 vs PHP 8（JIT）のパフォーマンス:

ベンチマーク（数値計算系）:
PHP 7.4  : ██████████████████████ 基準
PHP 8.0  : ████████████████ ~25%高速
PHP 8.1+ : ██████████████ ~35%高速

* Webアプリケーションでは差が小さいが、
  数値計算やバッチ処理で大きな効果
```

### Union型とMatch式

```php
// Union型（PHP 8.0）
function processInput(int|string $input): string
{
    if (is_int($input)) {
        return "数値: $input";
    }
    return "文字列: $input";
}

// Match式（PHP 8.0）-- switch文のモダンな代替
$result = match ($statusCode) {
    200 => '成功',
    301 => 'リダイレクト',
    404 => '見つかりません',
    500 => 'サーバーエラー',
    default => '不明なステータス',
};

// Named Arguments（PHP 8.0）
htmlspecialchars(
    string: $text,
    encoding: 'UTF-8',
    double_encode: false,
);
```

### Fiber（PHP 8.1）

```php
// Fiber: 軽量な並行処理（コルーチン）
$fiber = new Fiber(function (): void {
    $value = Fiber::suspend('最初の中断');
    echo "受け取った値: $value\n";
});

$firstValue = $fiber->start();     // '最初の中断'
$fiber->resume('再開データ');       // '受け取った値: 再開データ'

// Fiberを基盤にした非同期ライブラリ（ReactPHP, Revolt等）
```

### Enum（PHP 8.1）

```php
// PHP 8.1以降: ネイティブEnum
enum Role: string
{
    case Admin = 'admin';
    case Editor = 'editor';
    case Viewer = 'viewer';

    public function label(): string
    {
        return match ($this) {
            self::Admin => '管理者',
            self::Editor => '編集者',
            self::Viewer => '閲覧者',
        };
    }
}

// 使用例
function authorize(User $user, Role $requiredRole): bool
{
    return $user->role === $requiredRole;
}

authorize($user, Role::Admin); // 型安全なEnum使用
```

### Readonly Properties（PHP 8.2）

```php
// PHP 8.2: readonly class
readonly class UserDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public int $age,
    ) {}
}

$user = new UserDTO('田中', 'tanaka@example.com', 30);
// $user->name = '佐藤'; // Error: readonlyプロパティは変更不可
```

---

## PHPフレームワーク比較

| フレームワーク | 特徴                                     | 適したプロジェクト |
| -------------- | ---------------------------------------- | ------------------ |
| Laravel        | フルスタック、エレガント、最も人気       | Webアプリ全般      |
| Symfony        | エンタープライズ級、コンポーネントベース | 大規模システム     |
| CakePHP        | Convention over Configuration            | 中規模Webアプリ    |
| CodeIgniter    | 軽量、高速                               | 小~中規模          |
| Slim           | マイクロフレームワーク                   | API開発            |
| Laminas (Zend) | エンタープライズ                         | 大規模レガシー     |

```
PHPフレームワーク人気度（GitHubスター数、概算）:

Laravel     : ████████████████████████████ ~78k
Symfony     : ████████████ ~30k
CodeIgniter : ██████████ ~18k
Slim        : ████████ ~12k
CakePHP     : ████████ ~9k
Laminas     : ███ ~5k
```

---

## WordPressエコシステムの巨大さ

### WordPressの経済圏

```
WordPress関連市場（年間、概算）:

テーマ・プラグイン販売:
  ThemeForest   : ~$10億/年
  WordPress.org : 無料テーマ 1万+, プラグイン 6万+

WordPress関連の仕事:
  世界のWeb開発案件の ~30% がWordPress関連
  日本のWeb制作案件の ~40% がWordPress関連

主要なWordPressプラグイン:
+-------------------+---------------------+-------------------+
| WooCommerce       | EC機能              | 500万+インストール |
| Elementor         | ページビルダー       | 500万+インストール |
| Yoast SEO         | SEO対策             | 500万+インストール |
| Contact Form 7    | フォーム作成         | 500万+インストール |
| WPForms           | フォームビルダー     | 600万+インストール |
+-------------------+---------------------+-------------------+
```

### WordPressのカスタム開発例

```php
// カスタム投稿タイプの登録
function register_product_post_type(): void
{
    register_post_type('product', [
        'labels' => [
            'name' => '商品',
            'singular_name' => '商品',
        ],
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true, // Gutenberg対応
        'supports' => ['title', 'editor', 'thumbnail'],
    ]);
}
add_action('init', 'register_product_post_type');

// REST API エンドポイントの追加
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/products', [
        'methods' => 'GET',
        'callback' => function (WP_REST_Request $request) {
            $products = get_posts([
                'post_type' => 'product',
                'numberposts' => 20,
            ]);
            return rest_ensure_response($products);
        },
        'permission_callback' => '__return_true',
    ]);
});
```

---

## 採用企業例

### Facebook（初期）

Facebookは元々PHPで構築された。その後、PHPの性能問題を解決するために独自のPHP実行環境「HHVM」とPHP方言「Hack」を開発した。現在でもHack/PHPベースのコードが大量に残存している。

### WordPress.com（Automattic）

WordPress.comを運営するAutomatticは、PHPを中心とした技術スタックを使用。世界最大級のPHPアプリケーションの一つである。

### Slack（初期）

Slackの初期バージョンはPHPで構築された。急成長に伴い徐々に他の言語（Java、Go等）に移行しているが、PHPコードも残存している。

### Wikipedia

Wikipediaのバックエンド（MediaWiki）はPHPで書かれており、月間数十億のページビューを処理している。

```
採用企業とPHP活用:

+------------------+------------------------------------------+
| 企業/サービス     | 活用領域                                  |
+------------------+------------------------------------------+
| Facebook (Meta)  | 初期バックエンド --> Hack/HHVMに進化      |
| WordPress.com    | CMS基盤                                  |
| Slack (初期)     | 初期バックエンド                           |
| Wikipedia        | MediaWiki（CMS）                         |
| Etsy             | ECプラットフォーム                         |
| Mailchimp        | メールマーケティング                       |
| Tumblr           | ブログプラットフォーム                      |
+------------------+------------------------------------------+
```

---

## PHPのモダンな開発スタイル

現代のPHP開発は、かつての「スパゲッティコード」とは全く異なる。

```php
// モダンPHP開発の例（PHP 8.2 + Laravel + 型安全）
declare(strict_types=1);

// DTO（Data Transfer Object）
readonly class CreateArticleDTO
{
    public function __construct(
        public string $title,
        public string $content,
        public int $authorId,
        public array $tagIds = [],
    ) {}
}

// サービスクラス
final class ArticleService
{
    public function __construct(
        private ArticleRepository $repository,
        private TagService $tagService,
        private EventDispatcher $events,
    ) {}

    public function create(CreateArticleDTO $dto): Article
    {
        $article = $this->repository->create([
            'title' => $dto->title,
            'content' => $dto->content,
            'author_id' => $dto->authorId,
        ]);

        if (!empty($dto->tagIds)) {
            $this->tagService->attachToArticle($article, $dto->tagIds);
        }

        $this->events->dispatch(new ArticleCreated($article));

        return $article;
    }
}
```

---

## パフォーマンスベンチマーク

```
HTTPリクエスト処理性能（リクエスト/秒、概算）:

Laravel + Octane  : ███████████ ~15,000 req/s
Laravel (標準)     : ████ ~2,000 req/s
Symfony           : █████ ~3,000 req/s
Slim              : ████████ ~5,000 req/s
Swoole (素のPHP)  : ████████████████ ~50,000 req/s

比較対象:
Express (Node.js) : ████████████ ~15,000 req/s
Django (Python)   : █████ ~5,000 req/s
Rails (Ruby)      : ████ ~3,000 req/s
Gin (Go)          : ████████████████████████████ ~100,000 req/s

* Swoole/Octane使用でNode.js並のパフォーマンスに
```

---

## まとめ

PHPは「古い」「ダサい」という偏見を持たれがちだが、PHP8以降の進化は目覚ましく、Laravelを筆頭としたモダンな開発スタイルは他の言語に引けを取らない。何より、Web全体の75%を支えている実績と、WordPressエコシステムの巨大さは他の言語にはない強みである。

```
PHPを選ぶべき判断基準:
[x] WordPress/CMSベースのプロジェクト
[x] 格安ホスティングでの運用が必要
[x] Web制作案件（コーポレートサイト等）
[x] 既存のPHPシステムの保守・拡張
[x] ECサイト構築（WooCommerce）
[x] 素早いWeb開発（Laravel）
[ ] AI/ML --> Pythonを検討
[ ] マイクロサービス --> Go/Javaを検討
[ ] リアルタイム通信 --> Node.jsを検討
[ ] パフォーマンスクリティカル --> Rust/Goを検討
```

---

## 参考リンク

- [PHP公式サイト](https://www.php.net/)
- [Laravel公式ドキュメント](https://laravel.com/docs)
- [Symfony公式ドキュメント](https://symfony.com/doc/current/index.html)
- [WordPress Developer Resources](https://developer.wordpress.org/)
- [PHP: The Right Way](https://phptherightway.com/)
- [Packagist（PHPパッケージレジストリ）](https://packagist.org/)
