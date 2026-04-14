---
id: 83
title: "ベクトル検索とRAG入門 — 仕組みから実装例まで、具体例で学ぶAI検索の基礎"
tags: [AI, LLM, RAG, ベクトル検索, OpenAI, Embedding]
create: "2026-04-14 23:21"
---

## はじめに

ChatGPTやClaudeなどのLLM(大規模言語モデル)を業務で使おうとすると、必ずぶつかるのが「LLMは社内のドキュメントや最新情報を知らない」という壁だ。この壁を乗り越える手法として一気に普及したのが**RAG(Retrieval-Augmented Generation)**であり、その中核を支えるのが**ベクトル検索**である。

本記事では、ベクトル検索とRAGの仕組みを、身近な具体例とコードサンプルを交えながら解説する。読み終わる頃には、公式ドキュメントを読む準備が整い、自分で最小のRAGシステムを組み立てられる状態を目指す。

---

## なぜ「普通の検索」ではダメなのか

### キーワード検索の限界

まず、従来のキーワード検索(全文検索)の例を見てみよう。

社内FAQに以下の文書があったとする。

> 「有給休暇の申請は、前日までに上長へSlackで連絡してください」

ここでユーザーが「**休みを取るにはどうすればいい?**」と検索した場合、**「休み」「取る」**というキーワードは文書中に一切登場しない。全文検索(LIKE句やElasticsearchのmatchクエリ)ではヒットしない可能性が高い。

| 検索クエリ | 文書中の語 | 一致 |
|---|---|---|
| 休み | 有給休暇 | ✗ |
| 取る | 申請 | ✗ |
| どうすれば | 連絡してください | ✗ |

人間なら「同じこと聞いてるな」と分かるが、キーワード検索は**文字の一致しか見ない**ので無力である。

### ベクトル検索が解決すること

ベクトル検索は「意味が近いものを探す」検索手法だ。文章を数百〜数千次元の数値ベクトル(座標)に変換し、**座標が近いもの=意味が近いもの**として扱う。

先ほどの例なら、「休みを取る」と「有給休暇の申請」は意味的に近いので、ベクトル空間上でも近い位置に配置される。結果、キーワードが一致しなくてもヒットする。

---

## ベクトルと埋め込み(Embedding)の具体例

### 「ベクトルにする」ってどういうこと?

言葉だけだとピンと来ないので、2次元の超シンプルな例で考えてみる。各単語に(動物度, 食べ物度)という2つの軸で点数を付けるとしよう。

| 単語 | 動物度 | 食べ物度 |
|---|---|---|
| 犬 | 0.95 | 0.05 |
| 猫 | 0.93 | 0.07 |
| りんご | 0.02 | 0.90 |
| バナナ | 0.03 | 0.88 |
| 寿司 | 0.10 | 0.95 |

これを2次元平面にプロットすると、**「犬」と「猫」は近い場所**に、**「りんご」と「バナナ」と「寿司」も近い場所**に集まる。一方、「犬」と「寿司」は遠い。

実際のEmbedding(埋め込み)モデルは、この軸を**1536次元や3072次元**といった非常に多くの次元で自動的に学習している。人間が軸を定義するのではなく、大量のテキストから「こういう文脈で出てくる単語は近い意味だ」というパターンをモデルが勝手に学ぶ。

### OpenAIのEmbedding APIを使ってみる

実際にOpenAIの`text-embedding-3-small`モデルで「犬」をベクトル化してみる。

```python
from openai import OpenAI

client = OpenAI()

response = client.embeddings.create(
    model="text-embedding-3-small",
    input="犬"
)

vector = response.data[0].embedding
print(f"次元数: {len(vector)}")
print(f"先頭10個: {vector[:10]}")
```

実行結果(例)：

```
次元数: 1536
先頭10個: [-0.0123, 0.0456, -0.0789, 0.0234, ...]
```

1536個の数字の羅列が返ってくる。人間には意味不明だが、モデルにとっては「犬」という概念を表す座標だ。

### 類似度の計算 — コサイン類似度

2つのベクトルがどれだけ近いかを測る代表的な指標が**コサイン類似度**である。2つのベクトルのなす角度の余弦(cos θ)で、**1に近いほど似ている**、**0は無関係**、**-1は正反対**を意味する。

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# 3つの文章をベクトル化
texts = [
    "休みを取るにはどうすればいいですか",
    "有給休暇の申請は前日までに上長へSlackで連絡してください",
    "今日のランチは何を食べようかな"
]
vectors = [
    client.embeddings.create(model="text-embedding-3-small", input=t).data[0].embedding
    for t in texts
]

print(f"質問 vs FAQ:   {cosine_similarity(vectors[0], vectors[1]):.3f}")
print(f"質問 vs ランチ: {cosine_similarity(vectors[0], vectors[2]):.3f}")
```

実行結果(例)：

```
質問 vs FAQ:   0.612
質問 vs ランチ: 0.198
```

キーワードが一致していないのに、「休みを取る質問」と「有給休暇のFAQ」は高い類似度が出ている。これがベクトル検索の威力だ。

---

## RAG(Retrieval-Augmented Generation)とは

### 何を解決するのか

LLMには次のような弱点がある。

1. **知識が古い** — 学習データのカットオフ以降の情報を知らない
2. **社内情報を知らない** — 非公開のドキュメントや顧客情報は当然学習していない
3. **ハルシネーション** — それっぽい嘘を自信満々に生成することがある

これらを解決するために、**質問に関連する文書を検索して、その内容をプロンプトに同梱してLLMに答えさせる**手法がRAGである。

### RAGの3ステップ

```
[1. Indexing（事前準備）]
  社内文書 → 分割 → Embedding → ベクトルDBに保存

[2. Retrieval（検索）]
  ユーザーの質問 → Embedding → ベクトルDBで類似文書を検索

[3. Generation（生成）]
  検索結果 + 質問 → LLMに投げる → 回答を得る
```

図で表すと以下のようになる。

```
ユーザー質問
    ↓
[Embedding化]
    ↓
[ベクトルDB検索] ←─── 社内文書(事前にEmbedding済み)
    ↓
関連文書TOP-K
    ↓
[プロンプト組み立て]
  「以下の文書を参考に質問に答えて: {文書} 質問: {質問}」
    ↓
  [LLM]
    ↓
  回答
```

---

## 最小のRAGを実装してみる

実際に動く最小構成のRAGを組み立ててみよう。ここではベクトルDBを使わず、Pythonのリストとnumpyだけで実装する(理解優先のため)。

### ステップ1: 社内文書をEmbedding化

```python
from openai import OpenAI
import numpy as np

client = OpenAI()

# 仮の社内FAQデータ
documents = [
    "有給休暇の申請は、前日までに上長へSlackで連絡してください。",
    "経費精算は毎月25日までに会計システムに入力してください。",
    "リモートワークは週3日まで可能です。事前に上長の承認が必要です。",
    "社内研修は毎週水曜日の15時からZoomで開催されます。",
    "健康診断は年1回、10月に実施されます。予約は9月中に行ってください。"
]

def embed(text: str) -> list[float]:
    """テキストをベクトル化する"""
    resp = client.embeddings.create(model="text-embedding-3-small", input=text)
    return resp.data[0].embedding

# 文書を全部ベクトル化してメモリに保存
doc_vectors = [embed(d) for d in documents]
```

### ステップ2: 質問から関連文書を検索

```python
def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def retrieve(question: str, top_k: int = 2) -> list[str]:
    """質問に近い文書をTOP-K件返す"""
    q_vec = embed(question)
    scored = [(cosine_similarity(q_vec, dv), doc) for dv, doc in zip(doc_vectors, documents)]
    scored.sort(key=lambda x: x[0], reverse=True)
    return [doc for _, doc in scored[:top_k]]

# 実行
question = "休みを取りたいんだけど、どうすればいい?"
relevant_docs = retrieve(question, top_k=2)
for i, d in enumerate(relevant_docs, 1):
    print(f"{i}. {d}")
```

実行結果(例)：

```
1. 有給休暇の申請は、前日までに上長へSlackで連絡してください。
2. リモートワークは週3日まで可能です。事前に上長の承認が必要です。
```

「休み」「取る」といった単語は文書に含まれていないのに、**意味が近い**ため正しく有給休暇のFAQがTOPに来ている。

### ステップ3: LLMに答えさせる

```python
def answer(question: str) -> str:
    docs = retrieve(question, top_k=2)
    context = "\n".join(f"- {d}" for d in docs)

    prompt = f"""以下の社内ドキュメントを参考に、質問に答えてください。
ドキュメントに書かれていないことは「分かりません」と答えてください。

# ドキュメント
{context}

# 質問
{question}
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return resp.choices[0].message.content

print(answer("休みを取りたいんだけど、どうすればいい?"))
```

実行結果(例)：

```
有給休暇を取得する場合は、前日までに上長へSlackで連絡してください。
```

これで最小のRAGが完成した。わずか数十行のコードで、社内ドキュメントに基づいて答えるAIアシスタントが動く。

---

## 実務で使うベクトルDB

上の例はメモリ上のリストで済ませたが、実務では**数万〜数千万件の文書**を扱うためベクトルDBを使う。代表的な選択肢は以下の通り。

| ベクトルDB | 特徴 | こんな時に |
|---|---|---|
| **Pinecone** | フルマネージドSaaS。運用ほぼ不要 | 運用工数を減らしたい |
| **Weaviate** | OSS + SaaS。ハイブリッド検索が強い | セルフホストも視野 |
| **Qdrant** | OSS。Rust実装で高速 | 性能重視・オンプレ運用 |
| **Chroma** | 軽量OSS。ローカル開発に便利 | プロトタイピング |
| **pgvector** | PostgreSQLの拡張。既存DBと統合 | 既にPostgresを使っている |
| **Elasticsearch** | 全文検索+ベクトル検索のハイブリッド | キーワード検索も必要 |

### pgvectorでの例

既存のPostgreSQLがある現場ではpgvectorが手軽だ。

```sql
-- 拡張を有効化
CREATE EXTENSION IF NOT EXISTS vector;

-- テーブル作成(1536次元のベクトル列)
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536)
);

-- 類似検索(<=> はコサイン距離演算子)
SELECT content, embedding <=> '[0.012, ...]'::vector AS distance
FROM documents
ORDER BY embedding <=> '[0.012, ...]'::vector
LIMIT 5;
```

距離が小さい=類似度が高い。インデックス(HNSWやIVFFlat)を張れば数百万件でも高速に検索できる。

---

## RAGの精度を上げる実践テクニック

最小RAGが動いたら、次は精度を上げるフェーズだ。実務でよく使われる工夫を紹介する。

### 1. チャンク分割(Chunking)

長いドキュメントを丸ごとEmbeddingすると、**ノイズが多くて類似度が出にくい**。そのため適切なサイズに分割する。

- 目安：500〜1000文字程度(日本語なら300〜500字)
- **オーバーラップを設ける**(例：50文字かぶせる)ことで、文の切れ目で情報が失われるのを防ぐ

```python
def chunk_text(text: str, size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start:start + size])
        start += size - overlap
    return chunks
```

### 2. ハイブリッド検索

ベクトル検索は意味的類似には強いが、**固有名詞や型番**など「完全一致してほしいもの」には弱い。そこで**BM25(キーワード検索) + ベクトル検索**を組み合わせ、スコアを合成する手法が広く使われる。

### 3. リランキング(Reranking)

ベクトル検索でTOP-20件取ってきて、それを**より精度の高いモデル(Cross-Encoder)で再スコアリング**してTOP-3に絞る。Cohere Rerankなどが有名。

### 4. メタデータフィルタ

文書に「部署」「作成日」などメタデータを付けておき、検索時に絞り込む。

```python
# 例: 人事部の文書かつ2025年以降
filter = {"department": "HR", "created_at": {"$gte": "2025-01-01"}}
```

### 5. 質問の書き換え(Query Rewriting)

ユーザーの質問をそのまま検索するのではなく、LLMに「検索に適した形」に書き換えさせてから検索する。会話履歴を踏まえた質問の明確化にも有効。

---

## よくあるハマりどころ

実際に筆者が手を動かして遭遇した注意点をまとめる。

### 1. 同じモデルで埋め込むこと

**インデックス作成時と検索時で、必ず同じEmbeddingモデルを使う**。`text-embedding-3-small`と`text-embedding-3-large`はベクトル空間が別物なので、混ぜると類似度が意味を持たなくなる。

### 2. 日本語の扱い

日本語は単語の境界が曖昧なため、英語向けのEmbeddingモデルだと精度が落ちることがある。OpenAIの`text-embedding-3`シリーズは多言語対応で日本語も強いが、用途によっては**多言語E5**や**BGE-M3**などのOSSモデルも検討に値する。

### 3. コスト

Embedding APIは安いが、**大量の文書を毎回Embeddingし直す**と馬鹿にならない。ドキュメントのハッシュを取って、変更があった時だけ再Embeddingする仕組みを入れるとよい。

### 4. セキュリティ

社内文書をOpenAI APIに送る場合、**契約や社内規程で外部送信が許される内容か**を必ず確認する。機密度が高い場合はAzure OpenAIの企業契約や、オンプレのOSSモデル(Llama系+OSS Embedding)を検討する。

---

## まとめ

- **ベクトル検索**は文章を高次元の数値ベクトルに変換し、**意味が近いもの**を探す検索手法。キーワードが一致しなくてもヒットする。
- **RAG**は「検索で関連文書を取得 → LLMに同梱して答えさせる」パターン。LLMの知識不足とハルシネーションを同時に緩和できる。
- 最小RAGは**Embedding API + numpy + LLM API**の3点で数十行で作れる。まず動かしてみるのが理解への近道。
- 実務投入にはベクトルDB、チャンク分割、ハイブリッド検索、リランキングなどの工夫を積み重ねる。
- 同じEmbeddingモデルを使う、日本語モデルを選ぶ、コスト管理、社外送信の可否——この4点は最初に押さえておきたい注意点。

まずは本記事のコードをコピペして自分の環境で動かし、手持ちのドキュメントを食わせてみてほしい。「意味で検索できる」感覚を掴めれば、公式ドキュメントやベクトルDBの比較記事がぐっと読みやすくなるはずだ。

---

## 参考リンク

- [OpenAI Embeddings — 公式ドキュメント](https://platform.openai.com/docs/guides/embeddings)
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks(元論文)](https://arxiv.org/abs/2005.11401)
- [pgvector — PostgreSQL拡張](https://github.com/pgvector/pgvector)
- [Pinecone — Learning Center](https://www.pinecone.io/learn/)
- [LangChain — RAGの実装フレームワーク](https://python.langchain.com/docs/tutorials/rag/)
- [LlamaIndex — データ接続フレームワーク](https://docs.llamaindex.ai/)
- [Cohere Rerank](https://docs.cohere.com/docs/rerank)
