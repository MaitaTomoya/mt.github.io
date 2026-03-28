---
title: 'Rust'
order: 11
category: 'backend-languages'
---

# Rust -- 安全性とパフォーマンスを両立する次世代言語

## はじめに

Rustは、2010年にMozillaのGraydon Hoareによって開発が始まったシステムプログラミング言語である。「安全性」「速度」「並行性」の3つを同時に実現することを目標に設計され、Stack Overflow Surveyで8年連続「最も愛されている言語」に選ばれ続けている。

本記事では、Rustの革新的な所有権システム、バックエンド開発での活用、そして採用を検討する際の判断基準を解説する。

---

## Rustの立ち位置

### C/C++の後継を目指す安全なシステム言語

Rustは、C/C++が長年抱えてきた「メモリ安全性」の問題をコンパイル時に解決する言語として設計された。

```
C/C++の問題とRustの解決策:

C/C++で発生する問題:
+-----------------------------------+
| メモリリーク                       |  --> Rustの所有権システムが防ぐ
| ダングリングポインタ                |  --> 借用チェッカーが防ぐ
| バッファオーバーフロー              |  --> 境界チェックが防ぐ
| データ競合                         |  --> 型システムが防ぐ
| Use After Free                    |  --> 所有権の移動で防ぐ
| 二重解放                           |  --> 所有権の一意性で防ぐ
+-----------------------------------+

Rustの立ち位置:
           安全性
             |
    Python   |   Rust  <-- 安全性とパフォーマンスを両立
    Java     |
    Go       |
             |
  -----------+-----------> パフォーマンス
             |
             |   C/C++  <-- 高速だが安全性に欠ける
             |
```

### 所有権システム -- Rustの革命

Rustの最も特徴的な仕組みが「所有権（Ownership）」システムである。ガベージコレクター（GC）なしでメモリ安全性を保証する。

```
所有権の3つのルール:

1. 各値は「所有者」となる変数を1つだけ持つ
2. 所有者がスコープを抜けると、値は自動的に解放される
3. 所有権は移動（move）できるが、同時に2つの所有者は存在しない
```

```rust
// 所有権の移動（move）
fn main() {
    let s1 = String::from("hello"); // s1が所有者
    let s2 = s1;                     // 所有権がs2に移動
    // println!("{}", s1);           // コンパイルエラー！s1はもう使えない
    println!("{}", s2);              // OK
}

// 借用（borrowing）-- 所有権を移動せずに参照を貸し出す
fn print_length(s: &String) {  // &は借用（参照）
    println!("長さ: {}", s.len());
}

fn main() {
    let s = String::from("hello");
    print_length(&s);  // sの参照を貸し出す
    println!("{}", s);  // sはまだ使える
}
```

```
メモリ管理の比較:

GC付き言語（Java, Go, Python等）:
プログラム実行 --> [メモリ確保][使用中...][GC実行(一時停止)][解放]
                                           ^^^^^^^^^^^^^^
                                           予測不能な停止

C/C++:
プログラム実行 --> [メモリ確保][使用中...][手動解放]
                                         ^^^^^^^^
                                         忘れるとメモリリーク
                                         二重解放でクラッシュ

Rust:
プログラム実行 --> [メモリ確保][使用中...][スコープ終了で自動解放]
                                         ^^^^^^^^^^^^^^^^^
                                         コンパイル時に保証
                                         GC不要、手動不要
```

---

## Rustの強み

### 1. メモリ安全性の保証

Rustのコンパイラ（借用チェッカー）が、メモリ関連のバグをコンパイル時に100%検出する。

```rust
// コンパイラが防ぐ典型的なバグ

// 1. ダングリング参照の防止
fn dangling() -> &String {  // コンパイルエラー！
    let s = String::from("hello");
    &s  // sはこの関数の終了時に解放される
}       // --> 解放済みメモリへの参照を返そうとしている

// 2. データ競合の防止
fn main() {
    let mut data = vec![1, 2, 3];
    let r1 = &data;     // 不変借用
    // data.push(4);    // コンパイルエラー！不変借用中に変更不可
    println!("{:?}", r1);
}

// 3. Null安全性（Option型）
fn find_user(id: u64) -> Option<User> {
    // NULLの代わりにOption<T>を使用
    // None or Some(user)
    if id == 0 {
        None
    } else {
        Some(User { id, name: "田中".into() })
    }
}

// パターンマッチで安全にアンラップ
match find_user(1) {
    Some(user) => println!("見つかりました: {}", user.name),
    None => println!("ユーザーが見つかりません"),
}
```

### 2. ゼロコスト抽象化

Rustの高レベルな抽象化（イテレータ、クロージャ、ジェネリクス等）は、コンパイル後に手書きの低レベルコードと同等のパフォーマンスを発揮する。

```rust
// 高レベルな書き方でも、コンパイル後は最適化される
let sum: i32 = (0..1000)
    .filter(|x| x % 2 == 0)  // 偶数のみ
    .map(|x| x * x)          // 二乗
    .sum();                   // 合計

// 上記は手書きのforループと同等のパフォーマンス
// コンパイラが最適化してくれる
```

### 3. C/C++級の実行速度

```
実行速度ベンチマーク（相対比較、概算）:

C        : █ 1.0x（基準）
Rust     : █ 1.0-1.1x
C++      : █ 1.0x
Go       : ██ 1.5-2x
Java     : ██ 1.5-2x
C#       : ██ 2x
Node.js  : ████ 3-5x
Python   : ████████████████████ 30-100x

* ベンチマークの種類により変動
* RustはC/C++とほぼ同等の速度を安全に達成
```

### 4. 強力な型システムとパターンマッチ

```rust
// 代数的データ型とパターンマッチの例
enum Shape {
    Circle { radius: f64 },
    Rectangle { width: f64, height: f64 },
    Triangle { base: f64, height: f64 },
}

fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle { radius } => std::f64::consts::PI * radius * radius,
        Shape::Rectangle { width, height } => width * height,
        Shape::Triangle { base, height } => 0.5 * base * height,
    }
    // 全パターンを網羅しないとコンパイルエラー
}

// Result型によるエラーハンドリング
fn parse_config(path: &str) -> Result<Config, ConfigError> {
    let content = std::fs::read_to_string(path)?;  // ?演算子でエラー伝播
    let config: Config = toml::from_str(&content)?;
    Ok(config)
}
```

### 5. 安全な並行処理

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    // Arc: スレッド安全な参照カウント
    // Mutex: 排他的アクセス
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("結果: {}", *counter.lock().unwrap()); // 常に10
}
// データ競合が型レベルで防止される
```

---

## Rustの弱み

### 1. 急峻な学習曲線

所有権、借用、ライフタイムの概念は他の言語にはなく、習得に時間がかかる。

```
学習曲線の比較（生産性が実用レベルに達するまでの時間、概算）:

Python     : ██ 数日~1週間
JavaScript : ███ 1~2週間
Go         : █████ 2~4週間
Java       : ██████ 3~6週間
Rust       : ████████████████ 2~6ヶ月

Rustの学習段階:
Phase 1 (1-2週間): 基本構文、変数、関数
Phase 2 (2-4週間): 所有権、借用、ライフタイムの理解
Phase 3 (1-2ヶ月): コンパイラとの"戦い"に慣れる
Phase 4 (2-3ヶ月): トレイト、ジェネリクス、非同期処理
Phase 5 (3-6ヶ月): マクロ、unsafe、高度なパターン
```

### 2. コンパイル時間の長さ

Rustのコンパイラは非常に多くの検証を行うため、コンパイル時間が長い。

```
コンパイル時間の比較（中規模プロジェクト、クリーンビルド）:

Go   : █ 数秒
C    : ███ 10-30秒
Java : ████ 20-60秒
C++  : ████████ 1-5分
Rust : ██████████████ 2-10分

* インクリメンタルビルドでは大幅に短縮される
* cargo check（型チェックのみ）は高速
```

### 3. エコシステムが発展途上

RustのWebフレームワークやライブラリは急速に成長しているが、JavaやPythonのエコシステムと比較するとまだ発展途上である。

| フレームワーク | 特徴                              |
| -------------- | --------------------------------- |
| Actix-web      | 最も高速なWebフレームワークの一つ |
| Axum           | Tokioチームが開発、人気急上昇     |
| Rocket         | 使いやすさ重視                    |
| warp           | フィルターベースのAPI             |

### 4. 開発速度

コンパイラの厳格なチェックにより、特に初期段階ではPythonやGoと比較して開発速度が遅くなる。

---

## 適しているケース

### 1. パフォーマンスクリティカルなシステム

```
低レイテンシが求められるシステム:

+----------+     +----------+     +----------+
| クライアント|---->| Rust API |---->| DB       |
+----------+     +----------+     +----------+
                  応答時間: <1ms

金融取引システム、ゲームサーバー、
広告配信システム、リアルタイムデータ処理
```

### 2. WebAssembly（WASM）

RustはWebAssemblyのファーストクラスサポートを持ち、ブラウザ上でネイティブ級の性能を発揮する。

```rust
// Rust + WebAssemblyの例
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

// ブラウザ上でJavaScriptの数十倍高速に実行される
```

```
WebAssemblyのユースケース:

+--------------------+    WASM    +--------------------+
|   ブラウザ          | <-------> |   Rust             |
+--------------------+            +--------------------+
| 画像/動画処理      |            | フィルター処理      |
| ゲームエンジン      |            | 物理演算           |
| CAD/3Dモデリング   |            | レンダリング        |
| 暗号処理           |            | 暗号演算           |
+--------------------+            +--------------------+
```

### 3. 組み込みシステム / IoT

GCがないため、リソース制約のある環境でも予測可能な動作が可能。

### 4. システムツール

```
Rust製の著名なツール:

+------------------+---------------------------+
| ツール            | 説明                       |
+------------------+---------------------------+
| ripgrep (rg)     | 高速なgrep代替             |
| fd               | 高速なfind代替             |
| bat              | 高機能なcat代替            |
| exa/eza          | モダンなls代替             |
| starship         | カスタマイズ可能なプロンプト |
| delta            | 高機能なdiff              |
| tokei            | コード行数カウント          |
| zoxide           | スマートなcd代替           |
+------------------+---------------------------+

これらは全て、既存のUnixツールを
Rustで書き直して高速化したもの
```

---

## 適していないケース

| ケース             | 理由                               | 代替案       |
| ------------------ | ---------------------------------- | ------------ |
| プロトタイプ開発   | 学習曲線と開発速度がボトルネック   | Python、Ruby |
| 小規模Web API      | オーバーエンジニアリングになりがち | Go、Node.js  |
| 学習コスト許容不可 | チーム全員の習得に時間がかかる     | Go           |
| AI/ML              | エコシステムが限定的               | Python       |
| 短期プロジェクト   | 初期投資が回収できない             | Go、Python   |

---

## 採用企業例

### Discord

Discordは、Goで書かれていたサービスの一部をRustに書き換え、テールレイテンシを大幅に改善した。特にGCによる一時停止が解消されたことが決め手であった。

```
DiscordのGo --> Rust移行成果:
+------------------------+----------+----------+
| 指標                   | Go       | Rust     |
+------------------------+----------+----------+
| p99レイテンシ           | 基準     | 大幅改善 |
| GC一時停止              | あり     | なし     |
| CPU使用率              | 基準     | 削減     |
| メモリ使用量            | 基準     | 削減     |
+------------------------+----------+----------+
```

### Cloudflare

Cloudflareは、エッジコンピューティングプラットフォームの中核部分にRustを採用。毎秒数百万リクエストを処理する環境で、安全性とパフォーマンスの両立が必要だった。

### Figma

FigmaのリアルタイムコラボレーションエンジンはRustで書かれており、数百人が同時に編集するシナリオでもスムーズな動作を実現している。

### Mozilla

FirefoxブラウザのレンダリングエンジンServoや、CSSエンジンのStyloがRustで書かれている。Rust自体がMozillaの研究プロジェクトから生まれた言語である。

---

## Rustの非同期処理

Rust 1.39以降、async/awaitによる非同期処理がサポートされている。

```rust
// Axumを使った非同期Web APIの例
use axum::{
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct User {
    id: u64,
    name: String,
}

#[derive(Deserialize)]
struct CreateUser {
    name: String,
}

async fn get_users() -> Json<Vec<User>> {
    let users = vec![
        User { id: 1, name: "田中".into() },
        User { id: 2, name: "佐藤".into() },
    ];
    Json(users)
}

async fn create_user(Json(input): Json<CreateUser>) -> Json<User> {
    let user = User { id: 3, name: input.name };
    Json(user)
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/users", get(get_users).post(create_user));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

---

## パフォーマンスベンチマーク

```
TechEmpower Framework Benchmarks（概算、JSON Serialization）:

Actix-web (Rust)  : ████████████████████████████████ ~700,000 req/s
Axum (Rust)       : █████████████████████████████ ~650,000 req/s
Gin (Go)          : ████████████████ ~350,000 req/s
Fastify (Node.js) : █████████ ~200,000 req/s
Spring (Java)     : ████████ ~180,000 req/s

* 実アプリケーションではDB接続がボトルネックになるため
  この差は縮小する
```

---

## まとめ

Rustは、安全性とパフォーマンスの両立という、これまでトレードオフとされてきた課題を解決する革新的な言語である。学習曲線は急峻だが、その投資に見合うだけのメリットがある。

```
Rustを選ぶべき判断基準:
[x] パフォーマンスが最優先事項
[x] メモリ安全性が重要（セキュリティクリティカル）
[x] GCによる一時停止が許容できない
[x] WebAssemblyを活用したい
[x] システムレベルのツールを開発する
[x] チームに学習のための時間的余裕がある
[ ] プロトタイプを素早く作りたい --> Python/Rubyを検討
[ ] 小規模なWeb API --> Go/Node.jsを検討
[ ] AI/ML中心のプロジェクト --> Pythonを検討
```

---

## 参考リンク

- [Rust公式サイト](https://www.rust-lang.org/ja)
- [The Rust Programming Language（公式書籍）](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [Axum公式ドキュメント](https://docs.rs/axum/latest/axum/)
- [Actix-web公式サイト](https://actix.rs/)
- [Are we web yet?](https://www.arewewebyet.org/)
