import { AlgorithmStep } from './types'

/**
 * 配列のディープコピーを返すユーティリティ
 */
function copyArray(arr: number[]): number[] {
  return [...arr]
}

/**
 * フィボナッチ数列（再帰版）
 * 再帰的にフィボナッチ数を計算する。重複計算が多く非効率。
 * 配列の各要素を「計算回数」として可視化する。
 * 計算量: O(2^n)
 */
export function fibRecursive(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const n = arr.length
  // 各インデックスの計算回数を記録する配列
  const callCount: number[] = new Array(n).fill(0)

  steps.push({
    array: copyArray(callCount),
    description: `フィボナッチ数列（再帰版）を開始します。F(${n - 1})を計算します`,
  })

  function fib(x: number): number {
    if (x < n) {
      callCount[x]++
      steps.push({
        array: copyArray(callCount),
        searching: x,
        description: `F(${x}) を計算中です（${x}番目の呼び出し回数: ${callCount[x]}回目）`,
      })
    }

    if (x <= 1) return x
    return fib(x - 1) + fib(x - 2)
  }

  fib(n - 1)

  steps.push({
    array: copyArray(callCount),
    sorted: Array.from({ length: n }, (_, i) => i),
    description: `完了しました。再帰による重複計算が多く、特に小さい値ほど何度も呼ばれます`,
  })

  return steps
}

/**
 * フィボナッチ数列（動的計画法版）
 * ボトムアップで計算結果をメモ化しながらフィボナッチ数を求める。
 * 計算量: O(n)
 */
export function fibDP(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const n = arr.length
  const callCount: number[] = new Array(n).fill(0)

  steps.push({
    array: copyArray(callCount),
    description: `フィボナッチ数列（DP版）を開始します。F(${n - 1})を計算します`,
  })

  const dp: number[] = new Array(n).fill(0)
  if (n > 0) dp[0] = 0
  if (n > 1) dp[1] = 1

  for (let i = 0; i < Math.min(2, n); i++) {
    callCount[i] = 1
    steps.push({
      array: copyArray(callCount),
      searching: i,
      description: `F(${i}) = ${dp[i]}（基底ケース、計算回数: 1回）`,
    })
  }

  for (let i = 2; i < n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
    callCount[i] = 1

    steps.push({
      array: copyArray(callCount),
      searching: i,
      comparing: [i - 1, i - 2],
      description: `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${dp[i]}（各値を1回だけ計算）`,
    })
  }

  steps.push({
    array: copyArray(callCount),
    sorted: Array.from({ length: n }, (_, i) => i),
    description: `完了しました。各値を1回ずつ計算するだけで済みます`,
  })

  return steps
}

/**
 * べき乗の素朴計算
 * base^exp を単純なループで計算する。
 * 計算量: O(n)
 */
export function powerNaive(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const n = arr.length
  const progress: number[] = new Array(n).fill(0)
  const base = 2

  steps.push({
    array: copyArray(progress),
    description: `べき乗の素朴計算を開始します。${base}^${n} を計算します`,
  })

  let result = 1
  for (let i = 0; i < n; i++) {
    result *= base
    progress[i] = result

    steps.push({
      array: copyArray(progress),
      searching: i,
      description: `ステップ${i + 1}: ${base}を掛けて ${result} になりました（${i + 1}回の乗算）`,
    })
  }

  steps.push({
    array: copyArray(progress),
    sorted: Array.from({ length: n }, (_, i) => i),
    description: `完了しました。${n}回の乗算が必要でした`,
  })

  return steps
}

/**
 * 繰り返し二乗法
 * base^exp を二乗を繰り返して高速に計算する。
 * 計算量: O(log n)
 */
export function powerFast(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const n = arr.length
  const progress: number[] = new Array(n).fill(0)
  const base = 2

  steps.push({
    array: copyArray(progress),
    description: `繰り返し二乗法を開始します。${base}^${n} を計算します`,
  })

  let result = 1
  let currentBase = base
  let exp = n
  let stepIdx = 0

  while (exp > 0) {
    if (exp % 2 === 1) {
      result *= currentBase
      if (stepIdx < n) {
        progress[stepIdx] = result
        steps.push({
          array: copyArray(progress),
          searching: stepIdx,
          description: `指数が奇数（${exp}）なので結果に掛けます: ${result}`,
        })
        stepIdx++
      }
    }

    exp = Math.floor(exp / 2)
    if (exp > 0) {
      currentBase *= currentBase
      if (stepIdx < n) {
        progress[stepIdx] = currentBase
        steps.push({
          array: copyArray(progress),
          searching: stepIdx,
          description: `底を二乗します: ${currentBase}（指数の残り: ${exp}）`,
        })
        stepIdx++
      }
    }
  }

  steps.push({
    array: copyArray(progress),
    sorted: Array.from({ length: stepIdx }, (_, i) => i),
    description: `完了しました。log(${n}) = 約${Math.ceil(Math.log2(n))}回の演算で済みました`,
  })

  return steps
}

/**
 * 最大部分配列の全探索
 * 全ての部分配列の和を計算し、最大のものを見つける。
 * 計算量: O(n^2)
 */
export function maxSubarrayBrute(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  // 値を正負の混合に変換
  const mixed = a.map((v, i) => (i % 3 === 0 ? -v : v))

  steps.push({
    array: copyArray(mixed),
    description: `最大部分配列の全探索を開始します`,
  })

  let maxSum = -Infinity
  let maxStart = 0
  let maxEnd = 0

  for (let i = 0; i < mixed.length; i++) {
    let currentSum = 0

    for (let j = i; j < mixed.length; j++) {
      currentSum += mixed[j]

      steps.push({
        array: copyArray(mixed),
        comparing: Array.from({ length: j - i + 1 }, (_, k) => i + k),
        description: `部分配列 [${i}..${j}] の和 = ${currentSum}${currentSum > maxSum ? '（新しい最大値）' : ''}`,
      })

      if (currentSum > maxSum) {
        maxSum = currentSum
        maxStart = i
        maxEnd = j
      }
    }
  }

  steps.push({
    array: copyArray(mixed),
    sorted: Array.from({ length: maxEnd - maxStart + 1 }, (_, k) => maxStart + k),
    description: `完了しました。最大部分配列は [${maxStart}..${maxEnd}]、和 = ${maxSum}`,
  })

  return steps
}

/**
 * カダネのアルゴリズム
 * 最大部分配列を線形時間で見つける。
 * 計算量: O(n)
 */
export function maxSubarrayKadane(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  const mixed = a.map((v, i) => (i % 3 === 0 ? -v : v))

  steps.push({
    array: copyArray(mixed),
    description: `カダネのアルゴリズムを開始します`,
  })

  let maxSum = mixed[0]
  let currentSum = mixed[0]
  let maxStart = 0
  let maxEnd = 0
  let currentStart = 0

  steps.push({
    array: copyArray(mixed),
    searching: 0,
    description: `初期値: 現在の和 = ${currentSum}、最大和 = ${maxSum}`,
  })

  for (let i = 1; i < mixed.length; i++) {
    if (currentSum + mixed[i] < mixed[i]) {
      currentSum = mixed[i]
      currentStart = i
      steps.push({
        array: copyArray(mixed),
        searching: i,
        description: `位置${i}: 新しい部分配列を開始（${mixed[i]}）。これまでの和が負だったため`,
      })
    } else {
      currentSum += mixed[i]
      steps.push({
        array: copyArray(mixed),
        searching: i,
        comparing: Array.from({ length: i - currentStart + 1 }, (_, k) => currentStart + k),
        description: `位置${i}: 現在の和に加算 = ${currentSum}`,
      })
    }

    if (currentSum > maxSum) {
      maxSum = currentSum
      maxStart = currentStart
      maxEnd = i
      steps.push({
        array: copyArray(mixed),
        searching: i,
        description: `新しい最大和 = ${maxSum}（区間 [${maxStart}..${maxEnd}]）`,
      })
    }
  }

  steps.push({
    array: copyArray(mixed),
    sorted: Array.from({ length: maxEnd - maxStart + 1 }, (_, k) => maxStart + k),
    description: `完了しました。最大部分配列は [${maxStart}..${maxEnd}]、和 = ${maxSum}`,
  })

  return steps
}

/**
 * 二数の和（全探索）
 * 全てのペアを調べて目標の和になる組を見つける。
 * 計算量: O(n^2)
 */
export function twoSumBrute(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  const target = a[0] + a[a.length - 1]

  steps.push({
    array: copyArray(a),
    description: `二数の和（全探索）を開始します。目標の和: ${target}`,
  })

  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      steps.push({
        array: copyArray(a),
        comparing: [i, j],
        description: `${a[i]} + ${a[j]} = ${a[i] + a[j]}${a[i] + a[j] === target ? ' = 目標値' : ' !== ' + target}`,
      })

      if (a[i] + a[j] === target) {
        steps.push({
          array: copyArray(a),
          found: i,
          sorted: [i, j],
          description: `発見: ${a[i]}(位置${i}) + ${a[j]}(位置${j}) = ${target}`,
        })
        return steps
      }
    }
  }

  steps.push({
    array: copyArray(a),
    description: `目標の和 ${target} になるペアは見つかりませんでした`,
  })

  return steps
}

/**
 * 二数の和（ハッシュマップ版）
 * ハッシュマップで補数を管理し、1回の走査で組を見つける。
 * 計算量: O(n)
 */
export function twoSumHash(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  const target = a[0] + a[a.length - 1]
  const seen = new Map<number, number>()

  steps.push({
    array: copyArray(a),
    description: `二数の和（ハッシュマップ版）を開始します。目標の和: ${target}`,
  })

  for (let i = 0; i < a.length; i++) {
    const complement = target - a[i]

    steps.push({
      array: copyArray(a),
      searching: i,
      description: `位置${i}: ${a[i]} の補数 ${complement} がハッシュマップにあるか確認します`,
    })

    if (seen.has(complement)) {
      const j = seen.get(complement)!
      steps.push({
        array: copyArray(a),
        found: i,
        sorted: [j, i],
        description: `発見: ${a[j]}(位置${j}) + ${a[i]}(位置${i}) = ${target}`,
      })
      return steps
    }

    seen.set(a[i], i)
    steps.push({
      array: copyArray(a),
      searching: i,
      description: `${a[i]} をハッシュマップに登録しました`,
    })
  }

  steps.push({
    array: copyArray(a),
    description: `目標の和 ${target} になるペアは見つかりませんでした`,
  })

  return steps
}

/**
 * 素数列挙（試し割り法）
 * 各数に対して2からsqrt(n)まで割り切れるか試す。
 * 計算量: O(n * sqrt(n))
 */
export function primeNaive(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const n = arr.length
  // 2からn+1までの数を素数判定する
  const numbers = Array.from({ length: n }, (_, i) => i + 2)
  const result: number[] = new Array(n).fill(0) // 0=未判定, 1=素数, -1=合成数

  steps.push({
    array: copyArray(numbers),
    description: `素数列挙（試し割り法）を開始します。${numbers[0]}から${numbers[n - 1]}までを判定します`,
  })

  for (let i = 0; i < n; i++) {
    const num = numbers[i]
    let isPrime = true

    for (let d = 2; d * d <= num; d++) {
      steps.push({
        array: copyArray(numbers),
        searching: i,
        description: `${num} が ${d} で割り切れるか確認します`,
      })

      if (num % d === 0) {
        isPrime = false
        result[i] = -1
        steps.push({
          array: copyArray(numbers),
          searching: i,
          description: `${num} は ${d} で割り切れます。合成数です`,
        })
        break
      }
    }

    if (isPrime) {
      result[i] = 1
      steps.push({
        array: copyArray(numbers),
        found: i,
        description: `${num} は素数です`,
      })
    }
  }

  const primeIndices = result.map((v, i) => (v === 1 ? i : -1)).filter((v) => v >= 0)
  steps.push({
    array: copyArray(numbers),
    sorted: primeIndices,
    description: `完了しました。見つかった素数: ${primeIndices.map((i) => numbers[i]).join(', ')}`,
  })

  return steps
}

/**
 * エラトステネスの篩
 * 素数の倍数を順に除外していく効率的な素数列挙法。
 * 計算量: O(n log log n)
 */
export function primeSieve(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const n = arr.length
  const numbers = Array.from({ length: n }, (_, i) => i + 2)
  const isPrime: boolean[] = new Array(n).fill(true)

  steps.push({
    array: copyArray(numbers),
    description: `エラトステネスの篩を開始します。${numbers[0]}から${numbers[n - 1]}までを判定します`,
  })

  for (let i = 0; i < n; i++) {
    if (!isPrime[i]) continue

    const p = numbers[i]

    steps.push({
      array: copyArray(numbers),
      found: i,
      description: `${p} は素数です。${p}の倍数を除外します`,
    })

    // pの倍数を除外
    for (let j = i + p; j < n; j += p) {
      if (isPrime[j]) {
        isPrime[j] = false
        steps.push({
          array: copyArray(numbers),
          searching: j,
          comparing: [i],
          description: `${numbers[j]} は ${p} の倍数なので合成数です`,
        })
      }
    }
  }

  const primeIndices = isPrime.map((v, i) => (v ? i : -1)).filter((v) => v >= 0)
  steps.push({
    array: copyArray(numbers),
    sorted: primeIndices,
    description: `完了しました。見つかった素数: ${primeIndices.map((i) => numbers[i]).join(', ')}`,
  })

  return steps
}

/**
 * 重複検出（二重ループ版）
 * 全てのペアを比較して重複を見つける。
 * 計算量: O(n^2)
 */
export function duplicateBrute(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  // 意図的に重複を含む配列を作る
  const a = copyArray(arr)
  if (a.length > 2) {
    a[a.length - 1] = a[0] // 重複を作る
  }

  steps.push({
    array: copyArray(a),
    description: `重複検出（二重ループ版）を開始します`,
  })

  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      steps.push({
        array: copyArray(a),
        comparing: [i, j],
        description: `位置${i}(${a[i]}) と 位置${j}(${a[j]}) を比較します`,
      })

      if (a[i] === a[j]) {
        steps.push({
          array: copyArray(a),
          found: j,
          sorted: [i, j],
          description: `重複を発見: ${a[i]}（位置${i}と位置${j}）`,
        })
        return steps
      }
    }
  }

  steps.push({
    array: copyArray(a),
    description: `重複は見つかりませんでした`,
  })

  return steps
}

/**
 * 重複検出（ソート+走査版）
 * 配列をソートして隣接要素を比較する。
 * 計算量: O(n log n)
 */
export function duplicateSort(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  if (a.length > 2) {
    a[a.length - 1] = a[0] // 重複を作る
  }

  steps.push({
    array: copyArray(a),
    description: `重複検出（ソート+走査版）を開始します。まずソートします`,
  })

  // 簡易ソート（ステップ記録あり）
  a.sort((x, y) => x - y)

  steps.push({
    array: copyArray(a),
    description: `ソートが完了しました（O(n log n)）。隣接要素を比較します`,
  })

  for (let i = 0; i < a.length - 1; i++) {
    steps.push({
      array: copyArray(a),
      comparing: [i, i + 1],
      description: `位置${i}(${a[i]}) と 位置${i + 1}(${a[i + 1]}) を比較します`,
    })

    if (a[i] === a[i + 1]) {
      steps.push({
        array: copyArray(a),
        found: i + 1,
        sorted: [i, i + 1],
        description: `重複を発見: ${a[i]}（位置${i}と位置${i + 1}）`,
      })
      return steps
    }
  }

  steps.push({
    array: copyArray(a),
    description: `重複は見つかりませんでした`,
  })

  return steps
}

/**
 * 回文判定（素朴法）
 * 文字列を反転して比較する。配列の要素を文字コードとして扱う。
 * 計算量: O(n)（ただし反転にO(n)の追加メモリ）
 */
export function palindromeBrute(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  // 回文になるよう配列を構成
  const half = arr.slice(0, Math.ceil(arr.length / 2))
  const a = [...half, ...half.slice(0, Math.floor(arr.length / 2)).reverse()]

  steps.push({
    array: copyArray(a),
    description: `回文判定（素朴法）を開始します。配列を反転して比較します`,
  })

  // 反転した配列を作成
  const reversed = [...a].reverse()
  const reversedDisplay: number[] = new Array(a.length).fill(0)

  for (let i = 0; i < a.length; i++) {
    reversedDisplay[i] = reversed[i]
    steps.push({
      array: copyArray(reversedDisplay),
      searching: i,
      description: `反転配列の位置${i}に ${reversed[i]} を配置（元の配列の末尾からコピー）`,
    })
  }

  steps.push({
    array: copyArray(a),
    description: `反転が完了しました。元の配列と比較します`,
  })

  // 全要素を比較
  for (let i = 0; i < a.length; i++) {
    steps.push({
      array: copyArray(a),
      comparing: [i, a.length - 1 - i],
      description: `位置${i}(${a[i]}) と 反転後の位置${i}(${reversed[i]}) を比較します`,
    })

    if (a[i] !== reversed[i]) {
      steps.push({
        array: copyArray(a),
        description: `不一致: ${a[i]} !== ${reversed[i]}。回文ではありません`,
      })
      return steps
    }
  }

  steps.push({
    array: copyArray(a),
    sorted: Array.from({ length: a.length }, (_, i) => i),
    description: `全ての要素が一致しました。この配列は回文です`,
  })

  return steps
}

/**
 * 回文判定（両端ポインタ法）
 * 配列の両端からポインタを近づけながら比較する。
 * 計算量: O(n/2)（追加メモリ不要）
 */
export function palindromeTwoPointer(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  // 回文になるよう配列を構成
  const half = arr.slice(0, Math.ceil(arr.length / 2))
  const a = [...half, ...half.slice(0, Math.floor(arr.length / 2)).reverse()]

  steps.push({
    array: copyArray(a),
    description: `回文判定（両端ポインタ法）を開始します。両端から中央に向かって比較します`,
  })

  let left = 0
  let right = a.length - 1

  while (left < right) {
    steps.push({
      array: copyArray(a),
      comparing: [left, right],
      description: `左ポインタ(位置${left}: ${a[left]}) と 右ポインタ(位置${right}: ${a[right]}) を比較します`,
    })

    if (a[left] !== a[right]) {
      steps.push({
        array: copyArray(a),
        description: `不一致: ${a[left]} !== ${a[right]}。回文ではありません`,
      })
      return steps
    }

    steps.push({
      array: copyArray(a),
      sorted: [left, right],
      description: `一致しました。ポインタを内側に進めます`,
    })

    left++
    right--
  }

  steps.push({
    array: copyArray(a),
    sorted: Array.from({ length: a.length }, (_, i) => i),
    description: `全ての比較が一致しました。この配列は回文です（比較回数: ${Math.floor(a.length / 2)}回）`,
  })

  return steps
}
