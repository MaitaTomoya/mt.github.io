---
title: 'Express / NestJS 徹底解説'
order: 21
category: 'backend-frameworks'
---

# Express / NestJS 徹底解説

## 概要と歴史

### Expressとは

Expressは、2010年にTJ Holowaychukによって開発されたNode.js向けの軽量Webフレームワークである。「Minimalist web framework for Node.js」を標榜し、最小限のコア機能とミドルウェアによる拡張性を特徴とする。Node.jsのWebフレームワークとして最も広く使われており、事実上の標準と言える存在だ。

### NestJSとは

NestJSは、2017年にKamil Mysliewskiによって開発されたNode.js向けのフルフレームワークである。AngularにインスパイアされたアーキテクチャでTypeScriptを第一言語として設計され、依存性注入（DI）、モジュールシステム、デコレータベースのルーティングなど、エンタープライズ向けの機能を標準提供する。内部的にはExpressまたはFastifyをHTTPサーバーとして使用する。

### 主要なマイルストーン

| 年     | Express                            | NestJS                         |
| ------ | ---------------------------------- | ------------------------------ |
| 2010年 | v1.0リリース                       | -                              |
| 2014年 | v4.0リリース（現在の安定版ベース） | -                              |
| 2017年 | -                                  | v1.0リリース                   |
| 2019年 | -                                  | v6.0（GraphQL統合強化）        |
| 2020年 | -                                  | v7.0（大幅パフォーマンス改善） |
| 2022年 | v5.0の開発が進行                   | v9.0                           |
| 2024年 | v5.0ベータ                         | v10.0                          |

---

## 強みと弱み

### Expressの強みと弱み

| 観点           | 強み                                   | 弱み                                       |
| -------------- | -------------------------------------- | ------------------------------------------ |
| 軽量性         | コアが極めて小さく、必要な機能だけ追加 | 多くの機能を自分で選択・設定する必要がある |
| 学習曲線       | シンプルで学びやすい                   | 規模が大きくなると設計が破綻しやすい       |
| 柔軟性         | アーキテクチャを自由に設計できる       | 自由すぎて統一的な設計が困難               |
| ミドルウェア   | 豊富なエコシステム                     | ミドルウェアの品質にばらつきがある         |
| コミュニティ   | 最大級の利用者数                       | メンテナンスがやや停滞していた時期がある   |
| TypeScript     | 型定義ファイルで対応可能               | TypeScript前提の設計ではない               |
| パフォーマンス | 十分な性能                             | Fastifyなどの新世代FWより遅い              |

### NestJSの強みと弱み

| 観点             | 強み                               | 弱み                                   |
| ---------------- | ---------------------------------- | -------------------------------------- |
| アーキテクチャ   | 明確なモジュール構造、DI、層の分離 | 学習コストが高い                       |
| TypeScript       | 最初からTypeScript前提             | JavaScript単体では使いにくい           |
| DI               | テスタビリティと疎結合を実現       | 小規模プロジェクトにはオーバースペック |
| CLI              | コード生成が充実                   | 生成されるファイル数が多い             |
| テスト           | テスト基盤が標準搭載               | TestBedの設定が複雑                    |
| マイクロサービス | gRPC、MQTT、Kafka等を標準サポート  | 設定の複雑さ                           |
| ドキュメント     | 公式ドキュメントが充実             | 情報量が多く、最初は圧倒される         |
| GraphQL          | @nestjs/graphqlで統合対応          | GraphQL自体の学習も必要                |

---

## コアコンセプト比較

### リクエスト処理の流れ

```
Express:
  リクエスト → ミドルウェア1 → ミドルウェア2 → ルートハンドラ → レスポンス

NestJS:
  リクエスト → ミドルウェア → ガード → インターセプター(前) → パイプ → コントローラー → サービス → インターセプター(後) → レスポンス
```

### Expressのミドルウェアパターン

Expressの設計哲学は「ミドルウェアの連鎖」である。リクエストは一連のミドルウェアを通過し、各ミドルウェアがリクエスト/レスポンスを加工する。

```
app.use(cors());           // CORSミドルウェア
app.use(helmet());         // セキュリティヘッダー
app.use(express.json());   // JSONパース
app.use(morgan('dev'));    // ログ出力

app.get('/api/users', (req, res) => {
  // ルートハンドラ
});
```

### NestJSのモジュールシステム

NestJSは、Angularのモジュールシステムをバックエンドに適用している。

```
Module（機能単位のまとまり）
  ├── Controller（ルーティング、リクエスト/レスポンスの処理）
  ├── Service（ビジネスロジック）
  ├── Repository（データアクセス）
  └── DTO（データ転送オブジェクト）
```

### 依存性注入（NestJS）

NestJSの中核をなすDI（依存性注入）の仕組み。

```
// サービスの定義
@Injectable()
class UserService {
  constructor(private userRepository: UserRepository) {}
  // UserRepositoryはNestJSが自動的に注入する
}

// コントローラーでの利用
@Controller('users')
class UserController {
  constructor(private userService: UserService) {}
  // UserServiceはNestJSが自動的に注入する
}
```

---

## 適しているユースケース

### Expressが適しているケース

- **プロトタイプ・MVP開発**: 素早く動くものを作りたい場合
- **マイクロサービスの個別サービス**: 単一責務の小さなサービス
- **API Gateway**: リバースプロキシ的な用途
- **学習目的**: Node.jsのHTTP処理を理解したい場合
- **既存のExpressプロジェクト**: 移行コストを避けたい場合
- **軽量なAPI**: 数エンドポイントのシンプルなAPI

### NestJSが適しているケース

- **エンタープライズアプリケーション**: 大規模チーム、長期保守
- **マイクロサービスアーキテクチャ**: gRPC、メッセージキュー対応
- **GraphQL API**: @nestjs/graphqlによる統合
- **リアルタイム通信**: WebSocket（@nestjs/websockets）
- **CQRS/イベントソーシング**: @nestjs/cqrsモジュール
- **テスタビリティ重視**: DIによるモック注入が容易

### 適していないケース

| 状況                   | Express              | NestJS                      |
| ---------------------- | -------------------- | --------------------------- |
| 高スループットが最優先 | Fastifyの方が高速    | Fastifyアダプターに切替可能 |
| 非Node.js環境          | N/A                  | N/A                         |
| 静的サイト生成         | 専用ツールを使うべき | 専用ツールを使うべき        |
| CPU集約型処理          | Node.js自体が不向き  | Node.js自体が不向き         |

---

## 採用企業の実例

### Expressを採用している企業

| 企業    | 用途                   | 備考                         |
| ------- | ---------------------- | ---------------------------- |
| IBM     | APIサービス            | 大規模企業での採用           |
| Uber    | マイクロサービスの一部 | Node.jsベースのサービス      |
| PayPal  | Web層                  | Java → Node.js移行で採用     |
| Netflix | API Gateway            | Node.jsの初期採用企業        |
| Twitter | 一部のAPIサービス      | マイクロサービスの一つとして |

### NestJSを採用している企業

| 企業      | 用途                           | 備考                     |
| --------- | ------------------------------ | ------------------------ |
| Adidas    | ECバックエンド                 | エンタープライズでの採用 |
| Roche     | ヘルスケアプラットフォーム     | 堅牢性が評価された       |
| Capgemini | エンタープライズソリューション | コンサルティングファーム |
| Autodesk  | クラウドサービス               | 設計ツールのバックエンド |
| Decathlon | ECプラットフォーム             | スポーツ用品EC           |

---

## パフォーマンス比較

### リクエスト処理速度（概算、ベンチマーク参考値）

| フレームワーク    | リクエスト/秒（概算） | 備考                  |
| ----------------- | --------------------- | --------------------- |
| Express           | 約15,000 req/s        | 最小構成              |
| NestJS（Express） | 約12,000 req/s        | Express上で動作       |
| NestJS（Fastify） | 約25,000 req/s        | Fastifyアダプター使用 |
| Fastify単体       | 約30,000 req/s        | 参考値                |

注: ベンチマーク値はハードウェアと設定に大きく依存する。実際のアプリケーションでは、データベースアクセスやビジネスロジックがボトルネックになることが多い。

### メモリ使用量

| フレームワーク | 初期メモリ使用量（概算） |
| -------------- | ------------------------ |
| Express        | 約30MB                   |
| NestJS         | 約50-70MB                |

NestJSはDIコンテナやモジュールシステムのオーバーヘッドにより、Expressよりメモリ使用量が多い。

---

## エコシステム比較

### Express

| カテゴリ             | 主要ライブラリ                   |
| -------------------- | -------------------------------- |
| セキュリティ         | helmet, cors, express-rate-limit |
| 認証                 | passport, express-jwt            |
| バリデーション       | express-validator, joi           |
| ログ                 | morgan, winston                  |
| ファイルアップロード | multer                           |
| セッション           | express-session                  |
| テンプレートエンジン | ejs, pug, handlebars             |

### NestJS

| カテゴリ         | 公式/推奨モジュール                |
| ---------------- | ---------------------------------- |
| 認証             | @nestjs/passport, @nestjs/jwt      |
| バリデーション   | class-validator, class-transformer |
| ORM              | @nestjs/typeorm, @nestjs/prisma    |
| GraphQL          | @nestjs/graphql                    |
| WebSocket        | @nestjs/websockets                 |
| マイクロサービス | @nestjs/microservices              |
| キャッシュ       | @nestjs/cache-manager              |
| 設定管理         | @nestjs/config                     |
| スケジューリング | @nestjs/schedule                   |
| ヘルスチェック   | @nestjs/terminus                   |

---

## 選択の判断基準

| 判断基準               | Express推奨            | NestJS推奨             |
| ---------------------- | ---------------------- | ---------------------- |
| プロジェクト規模       | 小〜中規模             | 中〜大規模             |
| チームサイズ           | 1-5人                  | 5人以上                |
| 開発期間               | 短期（数週間〜数ヶ月） | 中長期（数ヶ月〜数年） |
| TypeScript             | 任意                   | 必須                   |
| テスト重視度           | 中                     | 高                     |
| アーキテクチャの一貫性 | 自分で設計             | フレームワークが提供   |
| 学習コスト             | 低                     | 中〜高                 |
| Angular経験            | 関係なし               | 経験があれば有利       |

---

## ExpressからNestJSへの移行

既存のExpressプロジェクトをNestJSに移行する場合の段階的アプローチ。

### 段階1: 共存

NestJSはExpress上で動作するため、既存のExpressミドルウェアをそのまま使用可能。

### 段階2: ルートの段階的移行

既存のExpressルートを一つずつNestJSのController/Serviceに移行。

### 段階3: 完全移行

すべてのルートとミドルウェアをNestJSの方式に変換。

---

## 学習ロードマップ

### Express初学者向け

1. **Node.jsの基礎**: モジュールシステム、非同期処理
2. **HTTPの基礎**: リクエスト/レスポンス、ステータスコード
3. **Expressの基本**: ルーティング、ミドルウェア
4. **RESTful API**: CRUD操作、エラーハンドリング
5. **認証**: JWT、Passport
6. **データベース連携**: MongoDB/PostgreSQL

### NestJS初学者向け

1. **TypeScriptの基礎**: デコレータ、インターフェース
2. **Expressの基本理解**（推奨）
3. **NestJSの基本**: Module、Controller、Service
4. **DI**: Provider、Injection Token
5. **バリデーション**: Pipe、class-validator
6. **認証**: Guard、JWT Strategy
7. **データベース**: TypeORM or Prisma連携
8. **テスト**: Unit Test、E2E Test

---

## まとめ

ExpressとNestJSは「軽量 vs フル機能」という対照的な設計思想を持つ。

**Expressを選ぶべき場合**: 素早くAPIを立ち上げたい、自由な設計がしたい、学習コストを最小化したい場合。特にプロトタイプやマイクロサービスの個別サービスに適している。

**NestJSを選ぶべき場合**: 大規模チームで一貫したアーキテクチャが必要、テスタビリティを重視する、TypeScriptをフル活用したい場合。エンタープライズアプリケーションやマイクロサービスアーキテクチャに適している。

どちらもNode.jsエコシステムの重要な選択肢であり、プロジェクトの規模と要件に応じて使い分けることが重要だ。

---

## 参考リンク

- [Express公式ドキュメント](https://expressjs.com/)
- [NestJS公式ドキュメント](https://docs.nestjs.com/)
- [Express GitHubリポジトリ](https://github.com/expressjs/express)
- [NestJS GitHubリポジトリ](https://github.com/nestjs/nest)
