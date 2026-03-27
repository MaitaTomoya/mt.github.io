import { AlgorithmStep } from './types'

/**
 * 配列のディープコピーを返すユーティリティ
 */
function copyArray(arr: number[]): number[] {
  return [...arr]
}

/**
 * 線形探索
 * 配列の先頭から順に目的の値を探す。
 * 探索対象は配列の最大値とする（可視化のため）。
 * 計算量: O(n)
 */
export function linearSearch(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  const target = Math.max(...a)

  steps.push({
    array: copyArray(a),
    description: `線形探索を開始します。目標値: ${target}`,
  })

  for (let i = 0; i < a.length; i++) {
    steps.push({
      array: copyArray(a),
      searching: i,
      description: `位置${i}の値 ${a[i]} を確認します`,
    })

    if (a[i] === target) {
      steps.push({
        array: copyArray(a),
        found: i,
        description: `目標値 ${target} を位置${i}で発見しました`,
      })
      return steps
    }

    steps.push({
      array: copyArray(a),
      searching: i,
      description: `${a[i]} !== ${target} なので次へ進みます`,
    })
  }

  steps.push({
    array: copyArray(a),
    description: `目標値 ${target} は見つかりませんでした`,
  })

  return steps
}

/**
 * 二分探索
 * ソート済み配列を半分に分割しながら目的の値を探す。
 * 入力配列をソートしてから探索する。
 * 計算量: O(log n)
 */
export function binarySearch(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr).sort((x, y) => x - y)
  const target = a[Math.floor(a.length * 0.75)] // 探索対象は75%の位置の値

  steps.push({
    array: copyArray(a),
    description: `二分探索を開始します。ソート済み配列で目標値 ${target} を探します`,
  })

  let left = 0
  let right = a.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)

    steps.push({
      array: copyArray(a),
      searching: mid,
      comparing: [left, right],
      description: `探索範囲 [${left}..${right}]、中央（位置${mid}）の値 ${a[mid]} を確認します`,
    })

    if (a[mid] === target) {
      steps.push({
        array: copyArray(a),
        found: mid,
        description: `目標値 ${target} を位置${mid}で発見しました`,
      })
      return steps
    }

    if (a[mid] < target) {
      steps.push({
        array: copyArray(a),
        searching: mid,
        description: `${a[mid]} < ${target} なので右半分を探索します`,
      })
      left = mid + 1
    } else {
      steps.push({
        array: copyArray(a),
        searching: mid,
        description: `${a[mid]} > ${target} なので左半分を探索します`,
      })
      right = mid - 1
    }
  }

  steps.push({
    array: copyArray(a),
    description: `目標値 ${target} は見つかりませんでした`,
  })

  return steps
}

/**
 * ハッシュ探索（シミュレーション）
 * ハッシュテーブルを使い、ほぼ一定時間で目的の値を見つける。
 * 可視化のためにハッシュテーブルの構築と探索をステップで示す。
 * 計算量: 平均 O(1)（テーブル構築はO(n)）
 */
export function hashSearch(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  const target = Math.max(...a)
  const tableSize = a.length
  // ハッシュテーブルを配列で表現（各要素が格納先を示す）
  const hashTable: number[] = new Array(tableSize).fill(0)

  steps.push({
    array: copyArray(a),
    description: `ハッシュ探索を開始します。まずハッシュテーブル（サイズ${tableSize}）を構築します`,
  })

  // ハッシュテーブル構築フェーズ
  for (let i = 0; i < a.length; i++) {
    const hashIdx = a[i] % tableSize
    hashTable[hashIdx] = a[i]

    steps.push({
      array: copyArray(hashTable),
      searching: hashIdx,
      description: `${a[i]} のハッシュ値 = ${a[i]} % ${tableSize} = ${hashIdx}。テーブルに格納します`,
    })
  }

  steps.push({
    array: copyArray(hashTable),
    description: `ハッシュテーブルの構築が完了しました。目標値 ${target} を探索します`,
  })

  // 探索フェーズ
  const searchHashIdx = target % tableSize

  steps.push({
    array: copyArray(hashTable),
    searching: searchHashIdx,
    description: `${target} のハッシュ値 = ${target} % ${tableSize} = ${searchHashIdx}。直接アクセスします`,
  })

  if (hashTable[searchHashIdx] === target) {
    steps.push({
      array: copyArray(hashTable),
      found: searchHashIdx,
      description: `ハッシュテーブルの位置${searchHashIdx}で目標値 ${target} を発見しました（O(1)アクセス）`,
    })
  } else {
    steps.push({
      array: copyArray(hashTable),
      description: `目標値 ${target} は見つかりませんでした`,
    })
  }

  return steps
}
