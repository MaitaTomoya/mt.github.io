import { AlgorithmPair } from './types'
import { bubbleSort, selectionSort, insertionSort, quickSort, mergeSort, heapSort } from './sorting'
import { linearSearch, binarySearch, hashSearch } from './searching'
import {
  fibRecursive,
  fibDP,
  powerNaive,
  powerFast,
  maxSubarrayBrute,
  maxSubarrayKadane,
  twoSumBrute,
  twoSumHash,
  primeNaive,
  primeSieve,
  duplicateBrute,
  duplicateSort,
  palindromeBrute,
  palindromeTwoPointer,
} from './numeric'

/** 全アルゴリズムペア定義（20ペア） */
export const algorithmPairs: AlgorithmPair[] = [
  // --- ソートアルゴリズム（6ペア） ---
  {
    id: 'bubble-vs-quick',
    title: 'バブルソート vs クイックソート',
    category: 'sort',
    categoryLabel: 'ソート',
    description:
      'バブルソートは隣り合う要素を1つずつ比較して並べ替える素朴な方法です。クイックソートは「ピボット」という基準値で配列を分割し、効率的にソートします。',
    algorithmA: {
      name: 'バブルソート',
      complexity: 'O(n^2)',
      generator: bubbleSort,
      color: 'bg-red-500',
    },
    algorithmB: {
      name: 'クイックソート',
      complexity: 'O(n log n)',
      generator: quickSort,
      color: 'bg-blue-500',
    },
    defaultSize: 10,
    explanation:
      'バブルソートは全てのペアを愚直に比較するため、要素数が倍になると処理時間は4倍になります。クイックソートは配列を効率的に分割するため、要素数が倍になっても処理時間は約2倍程度に収まります。',
  },
  {
    id: 'selection-vs-merge',
    title: '選択ソート vs マージソート',
    category: 'sort',
    categoryLabel: 'ソート',
    description:
      '選択ソートは未ソート部分から最小値を見つけて先頭に配置する方法です。マージソートは配列を半分に分割し、それぞれをソートしてから統合します。',
    algorithmA: {
      name: '選択ソート',
      complexity: 'O(n^2)',
      generator: selectionSort,
      color: 'bg-orange-500',
    },
    algorithmB: {
      name: 'マージソート',
      complexity: 'O(n log n)',
      generator: mergeSort,
      color: 'bg-green-500',
    },
    defaultSize: 10,
    explanation:
      '選択ソートは毎回全ての未ソート要素をスキャンして最小値を探すため、比較回数がn^2に比例します。マージソートは「分割統治法」により、問題を半分ずつに分けるため、log n段階の処理で済みます。',
  },
  {
    id: 'insertion-vs-heap',
    title: '挿入ソート vs ヒープソート',
    category: 'sort',
    categoryLabel: 'ソート',
    description:
      '挿入ソートは要素を1つずつ正しい位置に挿入していく方法です。ヒープソートは「ヒープ」というデータ構造を使って効率的にソートします。',
    algorithmA: {
      name: '挿入ソート',
      complexity: 'O(n^2)',
      generator: insertionSort,
      color: 'bg-yellow-500',
    },
    algorithmB: {
      name: 'ヒープソート',
      complexity: 'O(n log n)',
      generator: heapSort,
      color: 'bg-purple-500',
    },
    defaultSize: 10,
    explanation:
      '挿入ソートは最悪の場合、各要素を挿入するたびに全ての要素をずらす必要があります。ヒープソートはヒープ構造を利用して、最大値の取り出しをO(log n)で行えるため全体の効率が良くなります。',
  },
  {
    id: 'bubble-vs-selection',
    title: 'バブルソート vs 選択ソート',
    category: 'sort',
    categoryLabel: 'ソート',
    description:
      'どちらもO(n^2)のソートアルゴリズムですが、交換回数に違いがあります。バブルソートは隣接要素を何度も交換しますが、選択ソートは各パスで1回だけ交換します。',
    algorithmA: {
      name: 'バブルソート',
      complexity: 'O(n^2)',
      generator: bubbleSort,
      color: 'bg-red-500',
    },
    algorithmB: {
      name: '選択ソート',
      complexity: 'O(n^2)',
      generator: selectionSort,
      color: 'bg-orange-500',
    },
    defaultSize: 10,
    explanation:
      '計算量は同じO(n^2)ですが、選択ソートは各パスで最小値を見つけてから1回だけ交換するため、交換回数が少なくなります。バブルソートは条件を満たすたびに交換するため、交換回数が多くなりがちです。',
  },
  {
    id: 'quick-vs-merge',
    title: 'クイックソート vs マージソート',
    category: 'sort',
    categoryLabel: 'ソート',
    description:
      'どちらもO(n log n)の高速なソートアルゴリズムです。クイックソートはインプレース（追加メモリが少ない）、マージソートは安定ソート（同じ値の順序が保たれる）という特徴があります。',
    algorithmA: {
      name: 'クイックソート',
      complexity: 'O(n log n)',
      generator: quickSort,
      color: 'bg-blue-500',
    },
    algorithmB: {
      name: 'マージソート',
      complexity: 'O(n log n)',
      generator: mergeSort,
      color: 'bg-green-500',
    },
    defaultSize: 12,
    explanation:
      '平均計算量は同じですが、クイックソートは最悪O(n^2)になる可能性があります（ピボット選択が悪い場合）。マージソートは常にO(n log n)ですが、追加のメモリ空間O(n)が必要です。実際の性能はデータの特性やキャッシュの効率に依存します。',
  },
  {
    id: 'insertion-vs-bubble',
    title: '挿入ソート vs バブルソート',
    category: 'sort',
    categoryLabel: 'ソート',
    description:
      'どちらもO(n^2)ですが、ほぼソート済みの配列では挿入ソートが圧倒的に高速です。実際の使い分けを理解しましょう。',
    algorithmA: {
      name: 'バブルソート',
      complexity: 'O(n^2)',
      generator: bubbleSort,
      color: 'bg-red-500',
    },
    algorithmB: {
      name: '挿入ソート',
      complexity: 'O(n^2)',
      generator: insertionSort,
      color: 'bg-yellow-500',
    },
    defaultSize: 10,
    explanation:
      '挿入ソートは「ほぼソート済み」のデータに対してはO(n)に近い性能を発揮します。各要素の移動距離が短いためです。バブルソートはデータの状態に関わらず全てのペアを比較する傾向があります。小規模データや部分的にソートされたデータには挿入ソートが適しています。',
  },

  // --- 探索アルゴリズム（3ペア） ---
  {
    id: 'linear-vs-binary',
    title: '線形探索 vs 二分探索',
    category: 'search',
    categoryLabel: '探索',
    description:
      '線形探索は配列の先頭から順に1つずつ確認します。二分探索はソート済み配列を半分に分けながら探します。',
    algorithmA: {
      name: '線形探索',
      complexity: 'O(n)',
      generator: linearSearch,
      color: 'bg-red-500',
    },
    algorithmB: {
      name: '二分探索',
      complexity: 'O(log n)',
      generator: binarySearch,
      color: 'bg-blue-500',
    },
    defaultSize: 16,
    explanation:
      '線形探索は最悪の場合、配列の全要素を確認する必要があります。二分探索は毎回探索範囲を半分にするため、1000個の要素でも約10回の比較で見つけられます。ただし二分探索にはソート済みの配列が必要です。',
  },
  {
    id: 'linear-vs-hash',
    title: '線形探索 vs ハッシュ探索',
    category: 'search',
    categoryLabel: '探索',
    description:
      '線形探索は先頭から順に探す方法です。ハッシュ探索はハッシュテーブルを使い、計算で直接位置を特定します。',
    algorithmA: {
      name: '線形探索',
      complexity: 'O(n)',
      generator: linearSearch,
      color: 'bg-red-500',
    },
    algorithmB: {
      name: 'ハッシュ探索',
      complexity: 'O(1)',
      generator: hashSearch,
      color: 'bg-green-500',
    },
    defaultSize: 12,
    explanation:
      'ハッシュ探索はハッシュ関数で格納位置を計算するため、データ量に関係なく一定時間でアクセスできます。ただしハッシュテーブルの構築にO(n)の時間とメモリが必要です。頻繁に探索する場合はハッシュテーブルが有利です。',
  },
  {
    id: 'binary-vs-hash',
    title: '二分探索 vs ハッシュ探索',
    category: 'search',
    categoryLabel: '探索',
    description:
      '二分探索はソート済み配列で高速に探します。ハッシュ探索はハッシュテーブルでさらに高速に探します。それぞれの長所と短所を比較します。',
    algorithmA: {
      name: '二分探索',
      complexity: 'O(log n)',
      generator: binarySearch,
      color: 'bg-blue-500',
    },
    algorithmB: {
      name: 'ハッシュ探索',
      complexity: 'O(1)',
      generator: hashSearch,
      color: 'bg-green-500',
    },
    defaultSize: 12,
    explanation:
      '二分探索はO(log n)で十分高速ですが、ハッシュ探索のO(1)には及びません。ただし二分探索は追加メモリが不要で、範囲検索もできるという利点があります。ハッシュ探索は衝突処理が必要で、メモリ使用量が多くなります。',
  },

  // --- 数値/応用アルゴリズム（11ペア） ---
  {
    id: 'fib-recursive-vs-dp',
    title: 'フィボナッチ数列: 再帰 vs 動的計画法',
    category: 'numeric',
    categoryLabel: '数値計算',
    description:
      'フィボナッチ数列を求める2つの方法を比較します。素朴な再帰は同じ計算を何度も繰り返しますが、動的計画法（DP）は結果を記録して再利用します。',
    algorithmA: {
      name: 'フィボナッチ（再帰）',
      complexity: 'O(2^n)',
      generator: fibRecursive,
      color: 'bg-red-500',
    },
    algorithmB: {
      name: 'フィボナッチ（DP）',
      complexity: 'O(n)',
      generator: fibDP,
      color: 'bg-blue-500',
    },
    defaultSize: 8,
    explanation:
      '再帰版はF(5)を求めるだけでF(3)を2回、F(2)を3回計算します。nが大きくなると重複計算が指数的に増えます。DP版は各値を1回だけ計算してテーブルに保存するため、線形時間で完了します。これが「メモ化」の力です。',
  },
  {
    id: 'power-naive-vs-fast',
    title: 'べき乗計算: 素朴法 vs 繰り返し二乗法',
    category: 'numeric',
    categoryLabel: '数値計算',
    description:
      'べき乗（例: 2の10乗）を計算する2つの方法です。素朴な方法はn回掛け算しますが、繰り返し二乗法は二乗を活用して高速に計算します。',
    algorithmA: {
      name: 'べき乗（素朴法）',
      complexity: 'O(n)',
      generator: powerNaive,
      color: 'bg-orange-500',
    },
    algorithmB: {
      name: '繰り返し二乗法',
      complexity: 'O(log n)',
      generator: powerFast,
      color: 'bg-teal-500',
    },
    defaultSize: 10,
    explanation:
      '素朴法はbase * base * ... をn回繰り返します。繰り返し二乗法は「2^8 = (2^4)^2 = ((2^2)^2)^2」のように、二乗を繰り返すことでlog n回の演算で結果を得ます。暗号処理などで大きなべき乗を扱う場面で重要です。',
  },
  {
    id: 'subarray-brute-vs-kadane',
    title: '最大部分配列: 全探索 vs カダネのアルゴリズム',
    category: 'applied',
    categoryLabel: '応用',
    description:
      '配列から連続する部分を取り出して和が最大になるものを見つける問題です。全探索は全ての組み合わせを試し、カダネのアルゴリズムは1回の走査で答えを見つけます。',
    algorithmA: {
      name: '全探索',
      complexity: 'O(n^2)',
      generator: maxSubarrayBrute,
      color: 'bg-red-500',
    },
    algorithmB: {
      name: 'カダネのアルゴリズム',
      complexity: 'O(n)',
      generator: maxSubarrayKadane,
      color: 'bg-blue-500',
    },
    defaultSize: 10,
    explanation:
      '全探索は全ての開始位置と終了位置の組み合わせを試すためO(n^2)です。カダネのアルゴリズムは「現在の部分和が負になったら新しく始める」という巧妙なアイデアで、1回の走査（O(n)）で最大和を求めます。',
  },
  {
    id: 'twosum-brute-vs-hash',
    title: '二数の和: 全探索 vs ハッシュマップ',
    category: 'applied',
    categoryLabel: '応用',
    description:
      '配列から2つの数を選んで特定の和になる組を見つける問題です。コーディング面接でよく出題される有名な問題です。',
    algorithmA: {
      name: '全探索（二重ループ）',
      complexity: 'O(n^2)',
      generator: twoSumBrute,
      color: 'bg-red-500',
    },
    algorithmB: {
      name: 'ハッシュマップ',
      complexity: 'O(n)',
      generator: twoSumHash,
      color: 'bg-green-500',
    },
    defaultSize: 8,
    explanation:
      '全探索は全てのペアを調べるためO(n^2)です。ハッシュマップ版は各要素について「目標値 - 現在の値」がテーブルにあるかを確認するだけなので、O(n)で済みます。「補数をハッシュで探す」というテクニックは多くの問題に応用できます。',
  },
  {
    id: 'prime-naive-vs-sieve',
    title: '素数列挙: 試し割り vs エラトステネスの篩',
    category: 'numeric',
    categoryLabel: '数値計算',
    description:
      'ある範囲内の素数を全て見つける問題です。試し割りは各数を個別に判定し、エラトステネスの篩は倍数を一括で除外します。',
    algorithmA: {
      name: '試し割り法',
      complexity: 'O(n * sqrt(n))',
      generator: primeNaive,
      color: 'bg-orange-500',
    },
    algorithmB: {
      name: 'エラトステネスの篩',
      complexity: 'O(n log log n)',
      generator: primeSieve,
      color: 'bg-purple-500',
    },
    defaultSize: 12,
    explanation:
      '試し割りは各数に対して2からsqrt(n)まで割り切れるか確認します。エラトステネスの篩は素数を見つけたらその倍数を一気にマークするため、重複した判定を避けられます。大きな範囲の素数列挙では篩が圧倒的に高速です。',
  },
  {
    id: 'duplicate-brute-vs-sort',
    title: '重複検出: 二重ループ vs ソート+走査',
    category: 'applied',
    categoryLabel: '応用',
    description:
      '配列に同じ値が2つ以上あるかを判定する問題です。全てのペアを比較する方法と、先にソートしてから隣接要素を比較する方法を比較します。',
    algorithmA: {
      name: '二重ループ',
      complexity: 'O(n^2)',
      generator: duplicateBrute,
      color: 'bg-red-500',
    },
    algorithmB: {
      name: 'ソート+走査',
      complexity: 'O(n log n)',
      generator: duplicateSort,
      color: 'bg-teal-500',
    },
    defaultSize: 10,
    explanation:
      '二重ループは全てのペアn*(n-1)/2を比較するためO(n^2)です。ソート+走査はO(n log n)でソートした後、隣接要素だけ比較（O(n)）するため全体でO(n log n)になります。ハッシュセットを使えばO(n)も可能ですが、ソートは追加メモリが少なくて済む利点があります。',
  },
  {
    id: 'palindrome-brute-vs-twopointer',
    title: '回文判定: 反転比較 vs 両端ポインタ',
    category: 'applied',
    categoryLabel: '応用',
    description:
      '配列（文字列）が前から読んでも後ろから読んでも同じかを判定する問題です。配列を反転して比較する方法と、両端からポインタを近づける方法を比較します。',
    algorithmA: {
      name: '反転比較法',
      complexity: 'O(n)',
      generator: palindromeBrute,
      color: 'bg-orange-500',
    },
    algorithmB: {
      name: '両端ポインタ法',
      complexity: 'O(n/2)',
      generator: palindromeTwoPointer,
      color: 'bg-blue-500',
    },
    defaultSize: 8,
    explanation:
      'どちらもO(n)ですが、反転比較法は配列全体のコピーとn回の比較が必要です。両端ポインタ法は追加メモリ不要で、比較回数もn/2回で済みます。不一致を見つけた時点で早期終了できるのも利点です。定数倍の違いですが、大規模データでは差が出ます。',
  },
  {
    id: 'bubble-vs-merge',
    title: 'バブルソート vs マージソート',
    category: 'sort',
    categoryLabel: 'ソート',
    description:
      '最も基本的なソートと、効率的な分割統治ソートの比較です。要素数が増えるとどれだけ差が開くかを体感できます。',
    algorithmA: {
      name: 'バブルソート',
      complexity: 'O(n^2)',
      generator: bubbleSort,
      color: 'bg-red-500',
    },
    algorithmB: {
      name: 'マージソート',
      complexity: 'O(n log n)',
      generator: mergeSort,
      color: 'bg-green-500',
    },
    defaultSize: 12,
    explanation:
      'バブルソートは全ての隣接ペアを比較・交換するためO(n^2)です。マージソートは配列を再帰的に半分に分割し、ソート済みの部分列を効率的に統合するためO(n log n)になります。要素数100ではバブルが約10000回、マージが約700回の比較で済みます。',
  },
  {
    id: 'selection-vs-heap',
    title: '選択ソート vs ヒープソート',
    category: 'sort',
    categoryLabel: 'ソート',
    description:
      '選択ソートは「最小値を探して配置」を繰り返します。ヒープソートもアイデアは似ていますが、ヒープ構造で最小値の探索を高速化しています。',
    algorithmA: {
      name: '選択ソート',
      complexity: 'O(n^2)',
      generator: selectionSort,
      color: 'bg-orange-500',
    },
    algorithmB: {
      name: 'ヒープソート',
      complexity: 'O(n log n)',
      generator: heapSort,
      color: 'bg-purple-500',
    },
    defaultSize: 10,
    explanation:
      '選択ソートは毎回未ソート部分の全要素をスキャンして最小値を探すためO(n)、それをn回繰り返すのでO(n^2)です。ヒープソートはヒープ構造により最大値の取り出しがO(log n)で行えるため、全体でO(n log n)になります。「データ構造の選択が計算量を変える」好例です。',
  },
  {
    id: 'insertion-vs-quick',
    title: '挿入ソート vs クイックソート',
    category: 'sort',
    categoryLabel: 'ソート',
    description:
      '挿入ソートは小規模データに適し、クイックソートは大規模データに適します。実際のソートライブラリでは両方を組み合わせることもあります。',
    algorithmA: {
      name: '挿入ソート',
      complexity: 'O(n^2)',
      generator: insertionSort,
      color: 'bg-yellow-500',
    },
    algorithmB: {
      name: 'クイックソート',
      complexity: 'O(n log n)',
      generator: quickSort,
      color: 'bg-blue-500',
    },
    defaultSize: 12,
    explanation:
      '挿入ソートはオーバーヘッドが小さいため、10要素程度の小規模配列では高速です。クイックソートは分割のオーバーヘッドがありますが、大規模データでは圧倒的に速くなります。JavaScriptのArray.sortなど多くの言語の標準ソートは、小規模部分には挿入ソート、大規模にはクイックソートを使うハイブリッド方式を採用しています。',
  },
]

/**
 * IDでアルゴリズムペアを取得する
 */
export function getAlgorithmPairById(id: string): AlgorithmPair | undefined {
  return algorithmPairs.find((p) => p.id === id)
}

/**
 * カテゴリでアルゴリズムペアを絞り込む
 */
export function getAlgorithmPairsByCategory(category: string): AlgorithmPair[] {
  return algorithmPairs.filter((p) => p.category === category)
}

// 型の再エクスポート
export type { AlgorithmStep, AlgorithmGenerator, AlgorithmPair } from './types'
