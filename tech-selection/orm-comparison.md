---
title: 'Prisma vs Drizzle vs TypeORM 徹底比較'
order: 31
category: 'databases'
---

# Prisma vs Drizzle vs TypeORM 徹底比較

## 概要と歴史

### ORM（Object-Relational Mapping）とは

ORMは、プログラミング言語のオブジェクトとリレーショナルデータベースのテーブルを対応付ける技術である。SQLを直接書く代わりに、プログラミング言語のオブジェクトやメソッドを使ってデータベース操作を行える。

ORMの主なメリット:

- SQLを直接書く量を削減
- 型安全なデータベース操作（TypeScript環境）
- マイグレーション管理
- 複数DBへの対応（PostgreSQL、MySQL、SQLite等）

### Prismaとは

Prismaは、2019年に正式リリースされたNode.js/TypeScript向けの次世代ORMである。独自のスキーマ言語（Prisma Schema）でデータモデルを定義し、それから型安全なクライアントを自動生成するアプローチを採用している。

従来のORMが「クラスをテーブルにマッピングする」Active Record/Data Mapperパターンを使うのに対し、Prismaは「スキーマファースト」のアプローチで、より直感的なAPIを提供する。

### Drizzleとは

Drizzle ORMは、2022年にリリースされた比較的新しいTypeScript ORMである。「SQLライクな構文をTypeScriptで書く」というアプローチで、SQLの知識をそのまま活かせる設計が特徴だ。「If you know SQL, you know Drizzle」がキャッチフレーズである。

### TypeORMとは

TypeORMは、2016年にリリースされたTypeScript/JavaScript向けのORMである。Active RecordパターンとData Mapperパターンの両方をサポートし、デコレータベースのエンティティ定義が特徴だ。JavaのHibernateやPHPのDoctrineに影響を受けている。

### 主要なマイルストーン

| 年     | Prisma                          | Drizzle                 | TypeORM          |
| ------ | ------------------------------- | ----------------------- | ---------------- |
| 2016年 | Prisma 1（GraphQL中心）         | -                       | v0.1リリース     |
| 2019年 | Prisma 2（ORM方向に転換）       | -                       | v0.2（安定化）   |
| 2020年 | Prisma Client GA                | -                       | v0.3             |
| 2021年 | Prisma Migrate GA               | -                       | -                |
| 2022年 | -                               | v0.x初期リリース        | -                |
| 2023年 | Prisma v5（パフォーマンス改善） | v0.28（急速な人気獲得） | メンテナンス停滞 |
| 2024年 | Prisma v6（Typed SQL等）        | v0.33+                  | v0.3.x           |

---

## 強みと弱み

### Prismaの強みと弱み

| 観点             | 強み                                     | 弱み                               |
| ---------------- | ---------------------------------------- | ---------------------------------- |
| 型安全性         | スキーマから完全型安全なクライアント生成 | 型が複雑になりすぎることがある     |
| DX（開発体験）   | 直感的なAPI、優れた自動補完              | Prisma固有のAPI学習が必要          |
| スキーマ管理     | Prisma Schemaで一元管理                  | 独自DSLの学習コスト                |
| マイグレーション | Prisma Migrate（自動生成）               | カスタムマイグレーションの柔軟性   |
| ドキュメント     | 非常に充実                               | -                                  |
| エコシステム     | Prisma Studio、Prisma Accelerate等       | 有料サービスへの誘導               |
| パフォーマンス   | Rust製クエリエンジン                     | 中間層のオーバーヘッド             |
| SQL制御          | 抽象化されている                         | Raw SQLの書きやすさはDrizzleに劣る |
| Edge対応         | Prisma Accelerate経由                    | 直接的なEdge対応に制約             |

### Drizzleの強みと弱み

| 観点             | 強み                            | 弱み                             |
| ---------------- | ------------------------------- | -------------------------------- |
| SQLライク        | SQLの知識がそのまま使える       | SQL初心者には恩恵が少ない        |
| 軽量性           | ランタイムの依存が最小限        | 機能がPrismaより少ない           |
| パフォーマンス   | オーバーヘッドが極めて小さい    | ベンチマークはユースケース依存   |
| Edge対応         | ネイティブにEdge対応            | -                                |
| バンドルサイズ   | 非常に小さい                    | -                                |
| TypeScript       | TypeScript-firstの設計          | 型の推論が複雑な場合がある       |
| マイグレーション | Drizzle Kit（スキーマから生成） | Prisma Migrateほど成熟していない |
| エコシステム     | 急速に成長中                    | Prismaほどの成熟度はない         |
| 柔軟性           | SQLに近い柔軟なクエリ記述       | 抽象化レベルが低い               |
| スキーマ定義     | TypeScriptで直接定義            | DSLがないため冗長になることも    |

### TypeORMの強みと弱み

| 観点          | 強み                                       | 弱み                               |
| ------------- | ------------------------------------------ | ---------------------------------- |
| 歴史          | 最も長い歴史、実績が豊富                   | レガシーな設計パターン             |
| デコレータ    | エンティティ定義が宣言的                   | デコレータの依存                   |
| Active Record | Rails/Laravelに近い使い方                  | 密結合になりやすい                 |
| Data Mapper   | 疎結合な設計も可能                         | 設定が複雑                         |
| DB対応        | PostgreSQL, MySQL, SQLite, MSSQL, Oracle等 | -                                  |
| メンテナンス  | -                                          | メンテナンスが停滞気味             |
| 型安全性      | デコレータベースの型推論                   | Prisma/Drizzleほどの型安全性はない |
| ドキュメント  | 一応充実                                   | 最新情報の更新が遅れがち           |

---

## スキーマ定義の比較

### Prisma

```prisma
// schema.prisma（独自DSL）
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### Drizzle

```typescript
// schema.ts（TypeScript）
import { pgTable, serial, varchar, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  published: boolean('published').default(false),
  authorId: integer('author_id').references(() => users.id),
})
```

### TypeORM

```typescript
// user.entity.ts（デコレータ）
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  name: string

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[]

  @CreateDateColumn()
  createdAt: Date
}
```

---

## クエリ記述の比較

### 基本的なCRUD

| 操作         | Prisma                                                | Drizzle                                             | TypeORM                                  |
| ------------ | ----------------------------------------------------- | --------------------------------------------------- | ---------------------------------------- |
| 全件取得     | prisma.user.findMany()                                | db.select().from(users)                             | userRepo.find()                          |
| 条件付き取得 | prisma.user.findMany({ where: { email: 'x' } })       | db.select().from(users).where(eq(users.email, 'x')) | userRepo.find({ where: { email: 'x' } }) |
| 1件取得      | prisma.user.findUnique({ where: { id: 1 } })          | db.select().from(users).where(eq(users.id, 1))      | userRepo.findOneBy({ id: 1 })            |
| 作成         | prisma.user.create({ data: {...} })                   | db.insert(users).values({...})                      | userRepo.save({...})                     |
| 更新         | prisma.user.update({ where: { id: 1 }, data: {...} }) | db.update(users).set({...}).where(eq(users.id, 1))  | userRepo.update(1, {...})                |
| 削除         | prisma.user.delete({ where: { id: 1 } })              | db.delete(users).where(eq(users.id, 1))             | userRepo.delete(1)                       |

### リレーション取得

| 方法          | Prisma                                              | Drizzle                   | TypeORM                                |
| ------------- | --------------------------------------------------- | ------------------------- | -------------------------------------- |
| Eager Loading | include: { posts: true }                            | .leftJoin(posts, eq(...)) | relations: ['posts']                   |
| 条件付き      | include: { posts: { where: {...} } }                | .leftJoin + .where        | QueryBuilderで記述                     |
| ネスト        | include: { posts: { include: { comments: true } } } | 複数のJOIN                | relations: ['posts', 'posts.comments'] |

---

## パフォーマンス比較

### オーバーヘッド

| ORM     | ランタイムオーバーヘッド | 理由                                       |
| ------- | ------------------------ | ------------------------------------------ |
| Prisma  | 中                       | Rustクエリエンジンが中間層として動作       |
| Drizzle | 低                       | SQLに近い薄いラッパー                      |
| TypeORM | 中〜高                   | メタデータリフレクション、エンティティ管理 |

### バンドルサイズ（概算）

| ORM           | パッケージサイズ              |
| ------------- | ----------------------------- |
| Prisma Client | 約2-5MB（クエリエンジン含む） |
| Drizzle       | 約50-100KB                    |
| TypeORM       | 約500KB-1MB                   |

### クエリ生成効率

| 観点       | Prisma                       | Drizzle             | TypeORM                      |
| ---------- | ---------------------------- | ------------------- | ---------------------------- |
| N+1防止    | includeで自動JOIN/サブクエリ | 開発者がJOINを明示  | eager:trueまたはQueryBuilder |
| バッチ処理 | createMany, updateMany       | バルクInsert/Update | save(配列)                   |
| Raw SQL    | prisma.$queryRaw             | sql`...`            | query()                      |

---

## マイグレーション比較

| 項目         | Prisma Migrate                   | Drizzle Kit              | TypeORM Migration     |
| ------------ | -------------------------------- | ------------------------ | --------------------- |
| 生成方法     | スキーマ差分から自動生成         | スキーマ差分から自動生成 | 手動 or 自動同期      |
| 生成物       | SQLファイル                      | SQLファイル              | TypeScriptファイル    |
| ロールバック | リセット（prisma migrate reset） | カスタム                 | down()メソッド        |
| 本番デプロイ | prisma migrate deploy            | drizzle-kit push         | typeorm migration:run |
| シード       | prisma db seed                   | 手動スクリプト           | 手動スクリプト        |

---

## Edge Runtime対応

サーバーレスやEdge環境（Cloudflare Workers、Vercel Edge等）での対応状況。

| 項目               | Prisma                     | Drizzle        | TypeORM |
| ------------------ | -------------------------- | -------------- | ------- |
| Cloudflare Workers | Prisma Accelerate経由      | ネイティブ対応 | 非対応  |
| Vercel Edge        | Prisma Accelerate経由      | ネイティブ対応 | 非対応  |
| Deno               | 対応                       | 対応           | 限定的  |
| Bun                | 対応                       | 対応           | 限定的  |
| コールドスタート   | やや遅い（エンジン初期化） | 速い           | 中      |

---

## 適しているユースケース

### Prismaが適しているケース

- **TypeScript開発で最大限の型安全性**: スキーマから自動生成される型
- **大規模プロジェクト**: 充実したエコシステムとドキュメント
- **チーム開発**: 統一されたスキーマ管理
- **SQLに詳しくないチーム**: 直感的なAPI
- **複雑なリレーション**: includeによるシンプルなデータ取得

### Drizzleが適しているケース

- **SQLに精通した開発者**: SQLの知識を直接活かせる
- **Edge/サーバーレス**: 軽量でEdge対応
- **パフォーマンス重視**: 最小のオーバーヘッド
- **バンドルサイズ重視**: フロントエンド寄りのバックエンド
- **柔軟なクエリ**: SQLに近い表現力

### TypeORMが適しているケース

- **既存TypeORMプロジェクト**: 移行コストを避けたい
- **Active Recordパターン**: Rails/Laravel経験者
- **NestJSプロジェクト**: @nestjs/typeormとの統合
- **多数のDB対応**: Oracle、MSSQL等の対応が必要

---

## 人気と採用動向

### npmダウンロード数（2026年時点、週間概算）

| ORM     | 週間ダウンロード数（概算） |
| ------- | -------------------------- |
| Prisma  | 約300万+                   |
| TypeORM | 約200万+                   |
| Drizzle | 約100万+                   |

### トレンド

| 観点              | 傾向                                  |
| ----------------- | ------------------------------------- |
| 新規プロジェクト  | Prisma or Drizzleが選ばれることが多い |
| 既存プロジェクト  | TypeORMの継続利用                     |
| Edge/サーバーレス | Drizzleが急増                         |
| エンタープライズ  | Prismaが主流                          |
| 個人開発          | Drizzle人気が上昇中                   |

---

## 他のORM/クエリビルダー

Prisma、Drizzle、TypeORM以外にも選択肢がある。

| ライブラリ   | 特徴                                  |
| ------------ | ------------------------------------- |
| Knex.js      | SQLクエリビルダー（ORMではない）      |
| Sequelize    | 歴史あるNode.js ORM（JavaScript中心） |
| MikroORM     | Data Mapperパターン、Unit of Work     |
| Kysely       | 型安全SQLクエリビルダー               |
| Objection.js | Knex.jsベースのORM                    |

---

## 選択の判断フロー

```
TypeScript開発？
|
+-- いいえ → Sequelize or Knex.js
+-- はい
    |
    +-- SQLに精通している？
    |   +-- はい → Drizzle
    |   +-- いいえ → Prisma
    |
    +-- Edge/サーバーレス？
    |   +-- はい → Drizzle（軽量）
    |   +-- いいえ → Prisma or Drizzle
    |
    +-- 既存TypeORMプロジェクト？
    |   +-- はい → TypeORM継続 or 段階的にPrisma/Drizzleへ移行
    |   +-- いいえ → Prisma or Drizzle
    |
    +-- NestJS？
        +-- Prisma（@nestjs/prismaが公式）
        +-- Drizzle（手動統合）
        +-- TypeORM（@nestjs/typeormが公式）
```

---

## まとめ

TypeScript/Node.jsのORM選択は、2026年現在「Prisma vs Drizzle」の二強時代に入っている。

**Prismaを選ぶべき場合**:

- 最大限の型安全性と開発体験を重視
- SQLの知識が限られたチーム
- 充実したエコシステム（Studio、Accelerate等）を活用したい
- 大規模プロジェクトで統一的なスキーマ管理が必要

**Drizzleを選ぶべき場合**:

- SQLの知識を活かしたい
- Edge/サーバーレス環境
- パフォーマンスとバンドルサイズが重要
- SQLに近い柔軟なクエリ記述が必要

**TypeORMを選ぶべき場合**:

- 既存プロジェクトの保守
- Active Recordパターンに慣れている
- Oracle、MSSQL等の特殊なDB対応

どのORMを選んでも、TypeScriptの型システムを活用したデータベース操作が可能であり、生のSQLと比較して開発効率と安全性が大幅に向上する。プロジェクトの要件、チームのスキル、デプロイ環境を総合的に考慮して選択することが重要だ。

---

## 参考リンク

- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [Drizzle ORM公式ドキュメント](https://orm.drizzle.team/)
- [TypeORM公式ドキュメント](https://typeorm.io/)
- [Prisma GitHubリポジトリ](https://github.com/prisma/prisma)
- [Drizzle GitHubリポジトリ](https://github.com/drizzle-team/drizzle-orm)
- [TypeORM GitHubリポジトリ](https://github.com/typeorm/typeorm)
