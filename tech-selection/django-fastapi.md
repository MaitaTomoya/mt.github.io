---
title: 'Django / FastAPI 徹底解説'
order: 22
category: 'backend-frameworks'
---

# Django / FastAPI 徹底解説

## 概要と歴史

### Djangoとは

Djangoは、2005年にリリースされたPython製のフルスタックWebフレームワークである。「The web framework for perfectionists with deadlines（締切のある完璧主義者のためのWebフレームワーク）」というキャッチフレーズが示すように、高品質なWebアプリケーションを迅速に開発することを目的としている。

Djangoの起源はアメリカ・カンザス州の新聞社Lawrence Journal-Worldのニュースサイト開発チームにある。ニュース業界特有の「厳しい締切の中で高品質なWebサイトを作る」という要件が、Djangoの設計思想に大きく影響している。

### FastAPIとは

FastAPIは、2018年にSebastian Ramrezによって開発されたPython製のモダンなWeb APIフレームワークである。Python 3.6以降の型ヒント（Type Hints）を最大限に活用し、高速なAPI開発を実現する。内部的にはStarletteとPydanticの上に構築されている。

FastAPIの登場は、Python Web開発に大きなインパクトを与えた。従来のPython Web開発は「Djangoかflask」の二択だったが、FastAPIはAPI開発に特化した第三の選択肢として急速に人気を獲得した。

### 主要なマイルストーン

| 年     | Django                 | FastAPI      |
| ------ | ---------------------- | ------------ |
| 2005年 | v0.90リリース          | -            |
| 2008年 | v1.0リリース           | -            |
| 2017年 | v2.0（Python 3必須化） | -            |
| 2018年 | -                      | v0.1リリース |
| 2019年 | v3.0（ASGI対応）       | 人気が急上昇 |
| 2022年 | v4.0                   | v0.85        |
| 2023年 | v4.2（LTS）            | v0.100+      |
| 2024年 | v5.0                   | v0.110+      |

---

## 強みと弱み

### Djangoの強みと弱み

| 観点           | 強み                                          | 弱み                                     |
| -------------- | --------------------------------------------- | ---------------------------------------- |
| バッテリー同梱 | ORM、認証、管理画面、フォームなど全て標準搭載 | 不要な機能もバンドルされる               |
| 管理画面       | Django Adminが自動生成される                  | カスタマイズの限界がある                 |
| ORM            | Django ORMが強力で直感的                      | 複雑なクエリはRaw SQLが必要なことも      |
| セキュリティ   | CSRF、XSS、SQLi対策が標準                     | 過度な保護がカスタマイズを制限することも |
| コミュニティ   | 巨大で成熟したエコシステム                    | レガシーな慣習が残っている               |
| 学習曲線       | ドキュメントが充実                            | 全体像の把握に時間がかかる               |
| 非同期対応     | Django 3.0以降でASGI対応                      | 完全な非同期サポートは発展途上           |
| パフォーマンス | 十分な性能                                    | FastAPIやNode.jsと比較すると遅い         |

### FastAPIの強みと弱み

| 観点                 | 強み                              | 弱み                                   |
| -------------------- | --------------------------------- | -------------------------------------- |
| パフォーマンス       | Node.js/Goに匹敵する速度          | I/O以外のCPU処理はPythonの制約を受ける |
| 型安全性             | PydanticによるランタイムType検証  | 型ヒントの学習が必要                   |
| 自動ドキュメント     | Swagger UI/ReDocが自動生成        | ドキュメントのカスタマイズに制約       |
| 非同期               | async/awaitをネイティブサポート   | 非同期プログラミングの理解が必要       |
| 学習曲線             | API開発にフォーカスして学びやすい | フルスタック機能は自分で構成           |
| 依存性注入           | Depends()によるDIシステム         | Dependsの入れ子が深くなることがある    |
| エコシステム         | 急速に成長中                      | Djangoと比較するとまだ小さい           |
| テンプレートエンジン | Jinja2対応                        | フルスタックWebアプリには不向き        |

---

## コアコンセプト比較

### アーキテクチャの違い

```
Django（MTV: Model-Template-View）:
  URL → View（ビジネスロジック） → Model（データアクセス） → Template（HTML生成）

  特徴: フルスタック、サーバーサイドレンダリング前提

FastAPI:
  URL → エンドポイント関数 → Pydanticモデル（バリデーション） → レスポンス

  特徴: API特化、フロントエンドは別途構築
```

### Django ORM vs SQLAlchemy

Djangoは独自のORMを内蔵しているが、FastAPIでは一般的にSQLAlchemyを使用する。

| 観点             | Django ORM                       | SQLAlchemy                   |
| ---------------- | -------------------------------- | ---------------------------- |
| 設計思想         | Active Record パターン           | Data Mapper パターン         |
| 学習曲線         | Djangoと統合されており学びやすい | 独立したライブラリで奥が深い |
| マイグレーション | 自動生成（makemigrations）       | Alembicを別途使用            |
| クエリビルダー   | 直感的なAPI                      | より細かい制御が可能         |
| 複雑なクエリ     | annotate/aggregateで対応         | 柔軟性が高い                 |
| 非同期           | Django 4.1以降で対応             | 非同期版(asyncio)あり        |

### 認証・認可

| 機能           | Django                             | FastAPI                  |
| -------------- | ---------------------------------- | ------------------------ |
| ユーザー管理   | 標準搭載                           | 自分で構築 or ライブラリ |
| セッション認証 | 標準搭載                           | Starlette経由            |
| JWT認証        | djangorestframework-simplejwt      | python-jose, PyJWT等     |
| OAuth2         | django-allauth                     | FastAPI Security         |
| パーミッション | 標準搭載（オブジェクトレベルも可） | 自分で実装               |
| CSRF保護       | 標準搭載                           | APIでは不要なことが多い  |

---

## 適しているユースケース

### Djangoが適しているケース

- **フルスタックWebアプリケーション**: 管理画面付きのWebサービス
- **コンテンツ管理システム（CMS）**: Django CMS、Wagtailの活用
- **Eコマース**: django-oscar、Saleorなどのパッケージ
- **ニュース・メディアサイト**: Djangoの起源であるニュースサイト
- **MVPの高速開発**: Django Adminで管理画面を素早く構築
- **データ分析ダッシュボード**: PythonのデータサイエンスライブラリとDjango
- **レガシーシステムの保守**: 多くの企業で実績がある

### FastAPIが適しているケース

- **RESTful API / GraphQL API**: API特化の設計
- **マイクロサービス**: 軽量で高速なサービス構築
- **機械学習APIのサービング**: ML/AIモデルのHTTPエンドポイント化
- **リアルタイム通信**: WebSocket対応
- **IoTバックエンド**: 高スループットなデータ受信
- **フロントエンド分離アーキテクチャ**: React/Vue等との組み合わせ
- **データバリデーションが重要なAPI**: Pydanticの型検証

### 適していないケース

| 状況                  | Django               | FastAPI                    |
| --------------------- | -------------------- | -------------------------- |
| 超軽量API             | オーバースペック     | 適している                 |
| フルスタックWebアプリ | 適している           | テンプレートエンジンが弱い |
| 非Pythonチーム        | 言語の選択自体を検討 | 言語の選択自体を検討       |
| CPU集約型処理         | GILの制約            | GILの制約                  |

---

## 採用企業の実例

### Djangoを採用している企業

| 企業                | 用途                         | 備考                           |
| ------------------- | ---------------------------- | ------------------------------ |
| Instagram           | メインバックエンド           | Pythonの最大規模デプロイの一つ |
| Pinterest           | Webバックエンド              | 大規模トラフィック             |
| Mozilla             | addons.mozilla.org等         | 複数のプロジェクト             |
| Disqus              | コメントプラットフォーム     | 高スケーラビリティ             |
| Eventbrite          | イベント管理プラットフォーム | フルスタック活用               |
| NASA                | 内部ツール                   | 政府機関での採用               |
| Spotify             | バックエンドサービスの一部   | マイクロサービスの一つ         |
| The Washington Post | コンテンツ管理               | メディア業界                   |

### FastAPIを採用している企業

| 企業                  | 用途                     | 備考                   |
| --------------------- | ------------------------ | ---------------------- |
| Microsoft             | 一部のAPIサービス        | クラウドサービス       |
| Uber                  | 機械学習プラットフォーム | MLモデルサービング     |
| Netflix               | 内部ツール               | データエンジニアリング |
| Explosion AI（spaCy） | NLP APIサービス          | AI/NLP                 |

---

## パフォーマンス比較

### リクエスト処理速度（概算）

| フレームワーク     | リクエスト/秒（概算） | 備考         |
| ------------------ | --------------------- | ------------ |
| Django（WSGI）     | 約3,000-5,000 req/s   | Gunicorn使用 |
| Django（ASGI）     | 約5,000-8,000 req/s   | Uvicorn使用  |
| FastAPI            | 約15,000-25,000 req/s | Uvicorn使用  |
| Flask              | 約2,000-4,000 req/s   | Gunicorn使用 |
| Express（Node.js） | 約15,000 req/s        | 参考値       |

注: 実際のパフォーマンスはアプリケーションの処理内容に大きく依存する。

### なぜFastAPIが速いのか

1. **ASGI**: 非同期サーバーゲートウェイインターフェースにより、I/O待ちの間に他のリクエストを処理
2. **Starlette**: 高速な非同期Webフレームワーク上に構築
3. **Pydantic v2**: Rustで実装されたバリデーションエンジン
4. **async/await**: ネイティブの非同期処理サポート

---

## エコシステム比較

### Django

| カテゴリ     | 主要パッケージ                            |
| ------------ | ----------------------------------------- |
| REST API     | Django REST Framework（DRF）              |
| 認証         | django-allauth, django-rest-auth          |
| CMS          | Wagtail, Django CMS                       |
| EC           | django-oscar, Saleor                      |
| 管理画面拡張 | django-grappelli, django-jet              |
| タスクキュー | Celery + django-celery-beat               |
| 検索         | django-haystack, django-elasticsearch-dsl |
| デバッグ     | django-debug-toolbar                      |

### FastAPI

| カテゴリ               | 主要パッケージ               |
| ---------------------- | ---------------------------- |
| ORM                    | SQLAlchemy, Tortoise ORM     |
| マイグレーション       | Alembic                      |
| 認証                   | FastAPI Users, python-jose   |
| タスクキュー           | Celery, ARQ                  |
| テスト                 | httpx（AsyncClient）, pytest |
| バリデーション         | Pydantic（組み込み）         |
| WebSocket              | Starlette（組み込み）        |
| バックグラウンドタスク | BackgroundTasks（組み込み）  |

---

## 選択の判断基準

| 判断基準             | Django推奨            | FastAPI推奨                    |
| -------------------- | --------------------- | ------------------------------ |
| アプリケーション種類 | フルスタックWebアプリ | API専用サービス                |
| 管理画面の必要性     | 必要（Django Admin）  | 不要 or 別途構築               |
| 開発速度             | MVPを素早く           | APIを素早く                    |
| パフォーマンス要件   | 中程度                | 高い                           |
| 非同期処理           | あまり必要ない        | 必須                           |
| 機械学習連携         | 可能だがやや重い      | MLモデルサービングに最適       |
| チームのPython経験   | Django経験者が多い    | モダンPython（型ヒント）に精通 |
| ドキュメント自動生成 | DRFで対応             | 標準搭載（Swagger/ReDoc）      |

---

## Django REST Framework（DRF）とFastAPI

API開発に限定した場合、Django + DRFとFastAPIの比較が重要になる。

| 観点                 | DRF                    | FastAPI                  |
| -------------------- | ---------------------- | ------------------------ |
| シリアライゼーション | Serializerクラス       | Pydanticモデル           |
| バリデーション       | Serializer内で定義     | Pydanticで自動           |
| 認証                 | 豊富な認証バックエンド | Security依存性注入       |
| ページネーション     | 標準搭載               | 自分で実装               |
| フィルタリング       | django-filter          | 自分で実装               |
| ViewSet              | CRUDの自動化           | 手動でエンドポイント定義 |
| ドキュメント         | drf-spectacular等      | 標準搭載                 |

---

## 学習ロードマップ

### Django初学者向け

1. **Pythonの基礎**: クラス、デコレータ、コンテキストマネージャ
2. **Djangoの基本**: プロジェクト作成、MTV理解、URLルーティング
3. **モデル**: Django ORM、マイグレーション
4. **ビューとテンプレート**: CBV（クラスベースビュー）、テンプレートタグ
5. **フォーム**: Django Forms、バリデーション
6. **Django Admin**: 管理画面のカスタマイズ
7. **DRF**: API開発（必要な場合）
8. **テスト**: Django TestCase、Factory Boy
9. **デプロイ**: Gunicorn + Nginx

### FastAPI初学者向け

1. **Pythonの基礎 + 型ヒント**: typing module、Pydantic
2. **非同期プログラミング**: async/await、asyncio
3. **FastAPIの基本**: エンドポイント定義、パスパラメータ、クエリパラメータ
4. **Pydantic**: モデル定義、バリデーション
5. **依存性注入**: Depends()
6. **データベース連携**: SQLAlchemy + Alembic
7. **認証**: OAuth2、JWT
8. **テスト**: httpx、pytest
9. **デプロイ**: Uvicorn + Docker

---

## まとめ

DjangoとFastAPIは、Python Web開発の二大選択肢であり、それぞれ異なる強みを持つ。

**Djangoを選ぶべき場合**: フルスタックWebアプリケーションを迅速に開発したい、管理画面が必要、CMS/ECなどの既存パッケージを活用したい場合。15年以上の実績と巨大なエコシステムが最大の強みである。

**FastAPIを選ぶべき場合**: API専用サービスを高速に構築したい、非同期処理が必要、機械学習モデルのサービングがしたい場合。モダンなPythonの型システムとパフォーマンスが最大の強みである。

両者は競合というよりも補完的な関係にある。Djangoでメインのアプリケーションを構築し、高パフォーマンスが必要なAPIサービスにFastAPIを使うという組み合わせも有効だ。

---

## 参考リンク

- [Django公式ドキュメント](https://docs.djangoproject.com/)
- [FastAPI公式ドキュメント](https://fastapi.tiangolo.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Pydantic公式ドキュメント](https://docs.pydantic.dev/)
- [SQLAlchemy公式ドキュメント](https://www.sqlalchemy.org/)
