---
title: 'Dart'
order: 6
category: 'frontend-languages'
---

# Dart

## はじめに

Dartは、Googleが2011年に開発したプログラミング言語です。当初はJavaScriptの代替としてブラウザで動作することを目指していましたが、現在は**Flutter**というUIフレームワークの開発言語として広く知られています。

Flutterの登場により、DartはiOS、Android、Web、デスクトップの全てを単一のコードベースで開発できるクロスプラットフォーム言語として注目を集めています。本記事では、技術選定の観点からDartの特徴を解説します。

---

## Dartとは

### 基本情報

| 項目                   | 内容                                 |
| :--------------------- | :----------------------------------- |
| 開発元                 | Google                               |
| 初リリース             | 2011年                               |
| 最新メジャーバージョン | Dart 3.x（2025-2026年時点）          |
| 型システム             | 静的型付け + 型推論                  |
| パラダイム             | オブジェクト指向、関数型要素あり     |
| 主な用途               | Flutter（モバイル/Web/デスクトップ） |
| パッケージマネージャー | pub.dev                              |
| ライセンス             | BSD                                  |

### Dartの位置づけ

```
+-----------------------------------------------------------+
|                    Dartの守備範囲                            |
+-----------------------------------------------------------+
|                                                           |
|   モバイル            Web              デスクトップ          |
|   +-------------+   +-------------+   +-------------+     |
|   | iOS         |   | SPA         |   | Windows     |     |
|   | Android     |   | PWA         |   | macOS       |     |
|   +-------------+   +-------------+   | Linux       |     |
|         \               |              +-------------+     |
|          \              |              /                   |
|           \             |             /                    |
|            +------------+------------+                     |
|            |        Flutter          |                     |
|            |   （UIフレームワーク）     |                     |
|            +-------------------------+                     |
|                      |                                     |
|            +-------------------------+                     |
|            |         Dart            |                     |
|            |   （プログラミング言語）   |                     |
|            +-------------------------+                     |
|                                                           |
|   サーバーサイド                                             |
|   +---------------------------------------------------+   |
|   | dart:io、shelf等のサーバーサイドライブラリも存在        |   |
|   | ただしNode.jsやGo等と比べてエコシステムは小さい         |   |
|   +---------------------------------------------------+   |
|                                                           |
+-----------------------------------------------------------+
```

---

## 歴史

```
2011  Google I/OでDartを発表（JavaScript代替を目指す）
  |
2013  Dart 1.0リリース
  |
2014  Dartium（Dart VM内蔵ブラウザ）でブラウザ動作を目指すが普及せず
  |
2015  ブラウザネイティブ戦略を断念。JavaScriptへのコンパイルに方針転換
  |
2017  Flutter Alpha版リリース。DartがFlutterの言語として再注目
  |
2018  Dart 2.0リリース（強い型システム、Sound Type System）
  |     Flutter 1.0リリース
  |
2021  Dart 2.12（Null Safety導入） ★ 重要なマイルストーン
  |
2023  Dart 3.0リリース（Records、Patterns、Class Modifiers）
  |     Flutter 3.10+
  |
2024  Dart 3.x（さらなるパフォーマンス改善、マクロ検討中）
  |
2025~ Dart 3.x系の継続的な進化、Flutter との統合強化
```

### Dartの転換点

Dartの歴史において最も重要な転換点は2つあります:

1. **2015年: ブラウザネイティブ戦略の断念** -- JavaScriptに勝てないと認め、コンパイル戦略に転換
2. **2018年: Flutter 1.0リリース** -- Flutterの成功により、Dart自体の価値が再評価された

---

## 強み

### 1. Flutter -- 真のクロスプラットフォーム

Flutterは、単一のコードベースからiOS、Android、Web、Windows、macOS、Linuxの全てに対応したアプリを構築できます。

```
従来のアプローチ（プラットフォームごとに別開発）:

  iOS:      Swift / UIKit / SwiftUI
  Android:  Kotlin / Jetpack Compose
  Web:      TypeScript / React
  Desktop:  C# / Electron

  → 3〜4つのコードベースを保守（コスト: x3〜x4）


Flutterのアプローチ:

  iOS + Android + Web + Desktop:  Dart / Flutter

  → 1つのコードベースで全プラットフォーム対応（コスト: x1〜x1.5）
```

### コード共有率の比較

| アプローチ     | iOS/Android共有率 | Web共有率       | デスクトップ共有率 |
| :------------- | :---------------- | :-------------- | :----------------- |
| ネイティブ開発 | 0%                | 0%              | 0%                 |
| React Native   | 70〜90%           | 別途開発        | 別途開発           |
| Flutter        | 90〜95%           | 80〜90%         | 80〜90%            |
| PWA            | -                 | 100%（元がWeb） | -                  |

### 2. AOTコンパイル

Dartは**AOT（Ahead-of-Time）コンパイル**と**JIT（Just-in-Time）コンパイル**の両方をサポートしています。

```
開発時（JITコンパイル）:
  +----------------+     +----------------+
  | Dart VM        |     | Hot Reload     |
  | JITコンパイル   | --> | 変更を即座に反映 |
  | 高速な起動      |     | 開発速度向上    |
  +----------------+     +----------------+

本番リリース時（AOTコンパイル）:
  +----------------+     +----------------+
  | AOTコンパイラ   |     | ネイティブコード  |
  | 事前にコンパイル | --> | 高速な起動      |
  |                |     | 最適化された性能 |
  +----------------+     +----------------+
```

| コンパイル方式 | 起動時間 | 実行速度 | 開発体験       | 用途         |
| :------------- | :------- | :------- | :------------- | :----------- |
| JIT            | 遅い     | 中程度   | Hot Reload可能 | 開発時       |
| AOT            | 速い     | 高速     | Hot Reload不可 | 本番リリース |

### 3. Null Safety（Null安全性）

Dart 2.12以降、**Sound Null Safety**が導入されました。これにより、nullに起因するバグをコンパイル時に検出できます。

```dart
// Null Safety あり（Dart 2.12+）

String name = "Alice";    // nullを代入できない
String? nickname = null;   // ?をつけるとnull許容

// nullチェックなしではコンパイルエラー
// print(nickname.length);  // エラー: nickname は null の可能性がある

// 安全なアクセス方法
print(nickname?.length);           // nullなら null を返す
print(nickname?.length ?? 0);      // nullなら 0 を返す
print(nickname!.length);           // nullでないことを保証（実行時エラーの可能性）

// if文でnullチェック
if (nickname != null) {
  print(nickname.length);  // この時点でnickname は non-null として扱われる
}
```

### 4. Hot Reload

Flutterの**Hot Reload**は、コードの変更を即座にアプリに反映する機能です。アプリの状態を維持したまま、UIの変更がリアルタイムで確認できます。

```
通常の開発サイクル:
  コード変更 → ビルド（30秒〜数分） → アプリ再起動 → 画面遷移 → 確認
  1サイクル: 1〜5分

Hot Reloadの開発サイクル:
  コード変更 → Hot Reload（1秒以下） → 確認
  1サイクル: 数秒

1日100回の変更がある場合:
  通常: 100分〜500分のビルド待ち
  Hot Reload: 数分のビルド待ち
```

### 5. 言語としての読みやすさ

DartはJava、JavaScript、C#に影響を受けており、これらの言語経験者にとって読みやすい構文です。

```dart
// クラス定義
class User {
  final String name;
  final int age;
  final String? email;

  // コンストラクタ（簡略構文）
  User({required this.name, required this.age, this.email});

  // メソッド
  String greet() => 'こんにちは、$nameです。${age}歳です。';

  // toString
  @override
  String toString() => 'User(name: $name, age: $age, email: $email)';
}

// Records（Dart 3.0+）
(String, int) getUserInfo() => ('Alice', 30);

// Patterns（Dart 3.0+）
void processShape(Shape shape) {
  switch (shape) {
    case Circle(radius: var r) when r > 0:
      print('円（半径: $r）');
    case Rectangle(width: var w, height: var h):
      print('長方形（$w x $h）');
    default:
      print('不明な図形');
  }
}

// 非同期処理
Future<List<User>> fetchUsers() async {
  final response = await http.get(Uri.parse('https://api.example.com/users'));
  final List<dynamic> data = jsonDecode(response.body);
  return data.map((json) => User.fromJson(json)).toList();
}
```

---

## 弱み

### 1. Webフロントエンド単体では弱い

DartはFlutterを通じてWebアプリを構築できますが、**Flutter Webは通常のWebアプリとは異なるレンダリング方式**を使います。

```
通常のWebアプリ（React、Vue等）:
  HTML + CSS + JavaScript
  → ブラウザのDOMを操作
  → SEOフレンドリー
  → アクセシビリティ対応が容易

Flutter Web:
  Dart → Canvas (CanvasKit) or HTML要素
  → 独自のレンダリングエンジン
  → SEO: 対応は改善中だが課題あり
  → アクセシビリティ: 対応は改善中だが課題あり
  → 初期ロード: JSバンドルサイズが大きい
```

| 比較項目             | React/Vue (通常のWeb) | Flutter Web                 |
| :------------------- | :-------------------- | :-------------------------- |
| SEO                  | 良好                  | 課題あり                    |
| 初期ロード時間       | 速い                  | やや遅い（CanvasKit使用時） |
| アクセシビリティ     | ブラウザネイティブ    | 改善中                      |
| ブラウザ開発者ツール | 完全対応              | 一部制限あり                |
| バンドルサイズ       | 小さい                | 大きい                      |
| 用途                 | コンテンツサイト、SPA | アプリライクなWeb           |

### 2. コミュニティ規模

JavaScriptやPythonと比較すると、Dartのコミュニティはまだ小さいです。

| 指標                 | JavaScript | Dart                        |
| :------------------- | :--------- | :-------------------------- |
| npmパッケージ数      | 200万+     | -                           |
| pub.devパッケージ数  | -          | 5万+                        |
| Stack Overflow質問数 | 非常に多い | 中程度                      |
| 日本語情報           | 非常に豊富 | やや少ない                  |
| 求人数               | 非常に多い | 少ない（Flutter求人として） |

### 3. サーバーサイドのエコシステム

Dartにはサーバーサイド向けのライブラリ（shelf等）がありますが、Node.js、Go、Pythonなどと比べるとエコシステムが未成熟です。

```
サーバーサイド技術のエコシステム成熟度

成熟度
  ^
  |  *Node.js   *Python   *Java
  |
  |        *Go       *Ruby
  |
  |              *Rust
  |
  |                    *Dart  ← サーバーサイドとしては発展途上
  |
  +----------------------------------------->
```

### 4. 採用市場の狭さ

Dartエンジニアの採用は、JavaScriptやTypeScriptと比べて難しいです。

```
採用の現実:

  「Dartエンジニア募集」→ 応募者が少ない
  「Flutterエンジニア募集」→ やや増えるが、まだ少ない

  実際の採用戦略:
  1. モバイル開発者（Swift/Kotlin）を採用してDart/Flutterを教育
  2. フロントエンド開発者（JS/TS）を採用してDart/Flutterを教育
  3. Dart経験者を高待遇で採用
```

---

## Flutter + Dartの組み合わせの強さ

DartはFlutterなしでは技術選定の候補に上がることは少ないですが、Flutter + Dartの組み合わせは非常に強力です。

### Flutterのアーキテクチャ

```
+-----------------------------------------------------------+
|                    Flutterの構造                            |
+-----------------------------------------------------------+
|                                                           |
|  Dartコード（あなたが書くコード）                            |
|  +-----------------------------------------------------+ |
|  | Widget（UI部品）                                     | |
|  | State Management（状態管理）                          | |
|  | ビジネスロジック                                       | |
|  +-----------------------------------------------------+ |
|                      |                                    |
|  Flutterフレームワーク                                     |
|  +-----------------------------------------------------+ |
|  | Rendering Layer（レンダリング）                        | |
|  | Animation、Gestures（アニメーション、ジェスチャー）      | |
|  | Material / Cupertino（UIコンポーネント）                | |
|  +-----------------------------------------------------+ |
|                      |                                    |
|  Flutter Engine（C++）                                    |
|  +-----------------------------------------------------+ |
|  | Skia（2Dグラフィックス） / Impeller（新エンジン）       | |
|  | Dart VM / AOTコンパイル                                | |
|  | プラットフォーム連携                                    | |
|  +-----------------------------------------------------+ |
|                      |                                    |
|  プラットフォーム                                          |
|  +----------+ +----------+ +----------+ +----------+      |
|  | iOS      | | Android  | | Web      | | Desktop  |      |
|  +----------+ +----------+ +----------+ +----------+      |
|                                                           |
+-----------------------------------------------------------+
```

### Flutter開発のコード例

```dart
import 'package:flutter/material.dart';

// メインアプリケーション
void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'タスク管理アプリ',
      theme: ThemeData(
        colorSchemeSeed: Colors.blue,
        useMaterial3: true,
      ),
      home: const TaskListScreen(),
    );
  }
}

// タスク一覧画面
class TaskListScreen extends StatefulWidget {
  const TaskListScreen({super.key});

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen> {
  final List<Task> _tasks = [];

  void _addTask(String title) {
    setState(() {
      _tasks.add(Task(title: title, isCompleted: false));
    });
  }

  void _toggleTask(int index) {
    setState(() {
      _tasks[index] = _tasks[index].copyWith(
        isCompleted: !_tasks[index].isCompleted,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('タスク一覧')),
      body: ListView.builder(
        itemCount: _tasks.length,
        itemBuilder: (context, index) {
          final task = _tasks[index];
          return ListTile(
            leading: Checkbox(
              value: task.isCompleted,
              onChanged: (_) => _toggleTask(index),
            ),
            title: Text(
              task.title,
              style: task.isCompleted
                  ? const TextStyle(decoration: TextDecoration.lineThrough)
                  : null,
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddTaskDialog(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  // このコードはiOS、Android、Web、デスクトップ全てで動作する
}
```

---

## 適しているユースケース

| ユースケース                    | 適合度     | 理由                                  |
| :------------------------------ | :--------- | :------------------------------------ |
| モバイルアプリ（iOS + Android） | 非常に高い | Flutterの主戦場                       |
| クロスプラットフォームアプリ    | 非常に高い | 1つのコードベースで全プラットフォーム |
| モバイル優先のスタートアップ    | 高い       | 開発コスト削減                        |
| 社内業務アプリ                  | 高い       | UIの統一性、開発効率                  |
| プロトタイプ                    | 高い       | Hot Reloadで高速開発                  |

## 適していないユースケース

| ユースケース              | 適合度   | 理由                   | 代替技術            |
| :------------------------ | :------- | :--------------------- | :------------------ |
| SEO重視のWebサイト        | 低い     | Flutter WebのSEO課題   | Next.js、Nuxt.js    |
| コンテンツ中心のWebサイト | 低い     | 通常のHTMLが適切       | HTML + CSS + JS     |
| サーバーサイド開発        | やや低い | エコシステム不足       | Node.js、Go、Python |
| ネイティブに近い性能要求  | やや低い | ネイティブには及ばない | Swift、Kotlin       |

---

## 実際のプロダクト例

### Google Ads

Googleの広告管理アプリはFlutter + Dartで構築されています。Google自身がFlutterの最大のユーザーの一つです。

### Alibaba（闲鱼 / Xianyu）

中国のフリマアプリ「闲鱼」はFlutterで構築されており、数億人のユーザーを抱えています。大規模なFlutter導入事例として有名です。

### BMW

BMWのコネクテッドカーアプリはFlutterで開発されており、iOS/Androidの両プラットフォームに対応しています。

### その他の採用例

| 企業/アプリ | 用途             | 規模                                 |
| :---------- | :--------------- | :----------------------------------- |
| Google Pay  | 決済アプリ       | グローバル                           |
| eBay Motors | 自動車売買       | 大規模                               |
| Nubank      | フィンテック     | 大規模（ブラジル最大のデジタル銀行） |
| Toyota      | コネクテッドカー | 大規模                               |
| Philips Hue | IoTデバイス制御  | 中規模                               |

---

## まとめ: Dartの技術選定での位置づけ

### 5段階評価

| 評価項目               | スコア | コメント                                |
| :--------------------- | :----- | :-------------------------------------- |
| パフォーマンス         | 4/5    | AOTコンパイルで高速。ネイティブには劣る |
| 型安全性               | 4/5    | Sound Null Safetyで強力                 |
| 学習曲線               | 4/5    | Java/JS経験者なら比較的容易             |
| エコシステム           | 3/5    | Flutterエコシステムは充実。汎用は小さい |
| 採用市場               | 2/5    | まだ狭い。成長中                        |
| クロスプラットフォーム | 5/5    | Flutterにより最強クラス                 |
| 開発速度               | 4/5    | Hot Reloadで高速                        |
| 保守性                 | 4/5    | 型安全性 + 構造化されたFW               |

### Dartを選ぶべきとき

- モバイルアプリ（iOS + Android）を効率的に開発したい
- クロスプラットフォーム対応が必要
- 開発リソースが限られている（少人数チーム）
- UIの統一性が重要

### Dartを選ぶべきでないとき

- Webフロントエンドのみのプロジェクト（TypeScript + Reactが適切）
- SEOが重要なWebサイト
- サーバーサイド中心の開発
- Dartエンジニアの採用が困難な場合

---

## 参考資料

- Dart公式: https://dart.dev/
- Flutter公式: https://flutter.dev/
- pub.dev（パッケージレジストリ）: https://pub.dev/
- Flutter Showcase（採用事例）: https://flutter.dev/showcase
- Dart Language Specification: https://dart.dev/guides/language/spec
