import { AlgorithmStep } from './types'

/**
 * 配列のディープコピーを返すユーティリティ
 */
function copyArray(arr: number[]): number[] {
  return [...arr]
}

/**
 * バブルソート
 * 隣接する要素を比較し、順序が逆なら交換する。
 * これを配列の末尾から先頭に向けてソート済み領域を広げていく。
 * 計算量: O(n^2)
 */
export function bubbleSort(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  const n = a.length
  const sorted: number[] = []

  steps.push({
    array: copyArray(a),
    sorted: [...sorted],
    description: 'バブルソートを開始します',
  })

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      // 比較ステップ
      steps.push({
        array: copyArray(a),
        comparing: [j, j + 1],
        sorted: [...sorted],
        description: `${a[j]} と ${a[j + 1]} を比較します`,
      })

      if (a[j] > a[j + 1]) {
        // 交換ステップ
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        steps.push({
          array: copyArray(a),
          swapping: [j, j + 1],
          sorted: [...sorted],
          description: `${a[j + 1]} > ${a[j]} なので交換しました`,
        })
      }
    }
    // このパスでソート済みになった要素を記録
    sorted.push(n - 1 - i)
  }

  sorted.push(0)
  steps.push({
    array: copyArray(a),
    sorted: [...sorted],
    description: 'バブルソートが完了しました',
  })

  return steps
}

/**
 * 選択ソート
 * 未ソート部分から最小値を見つけ、未ソート部分の先頭と交換する。
 * 計算量: O(n^2)
 */
export function selectionSort(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  const n = a.length
  const sorted: number[] = []

  steps.push({
    array: copyArray(a),
    sorted: [...sorted],
    description: '選択ソートを開始します',
  })

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i

    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: copyArray(a),
        comparing: [minIdx, j],
        sorted: [...sorted],
        description: `最小値候補 ${a[minIdx]}(位置${minIdx}) と ${a[j]}(位置${j}) を比較します`,
      })

      if (a[j] < a[minIdx]) {
        minIdx = j
        steps.push({
          array: copyArray(a),
          comparing: [minIdx],
          sorted: [...sorted],
          description: `新しい最小値 ${a[minIdx]} を見つけました（位置${minIdx}）`,
        })
      }
    }

    if (minIdx !== i) {
      ;[a[i], a[minIdx]] = [a[minIdx], a[i]]
      steps.push({
        array: copyArray(a),
        swapping: [i, minIdx],
        sorted: [...sorted],
        description: `最小値 ${a[i]} を位置${i}に配置しました`,
      })
    }

    sorted.push(i)
  }

  sorted.push(n - 1)
  steps.push({
    array: copyArray(a),
    sorted: [...sorted],
    description: '選択ソートが完了しました',
  })

  return steps
}

/**
 * 挿入ソート
 * 各要素を、ソート済み部分の正しい位置に挿入していく。
 * 計算量: O(n^2)
 */
export function insertionSort(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  const n = a.length
  const sorted: number[] = [0]

  steps.push({
    array: copyArray(a),
    sorted: [...sorted],
    description: '挿入ソートを開始します。最初の要素はソート済みとします',
  })

  for (let i = 1; i < n; i++) {
    const key = a[i]
    let j = i - 1

    steps.push({
      array: copyArray(a),
      comparing: [i],
      sorted: [...sorted],
      description: `${key} を正しい位置に挿入します`,
    })

    while (j >= 0 && a[j] > key) {
      steps.push({
        array: copyArray(a),
        comparing: [j, j + 1],
        sorted: [...sorted],
        description: `${a[j]} > ${key} なので${a[j]}を右にずらします`,
      })

      a[j + 1] = a[j]
      j--

      steps.push({
        array: copyArray(a),
        swapping: [j + 1, j + 2],
        sorted: [...sorted],
        description: `要素を右にずらしました`,
      })
    }

    a[j + 1] = key
    sorted.push(i)

    steps.push({
      array: copyArray(a),
      sorted: [...sorted],
      description: `${key} を位置${j + 1}に挿入しました`,
    })
  }

  steps.push({
    array: copyArray(a),
    sorted: Array.from({ length: n }, (_, i) => i),
    description: '挿入ソートが完了しました',
  })

  return steps
}

/**
 * クイックソート
 * ピボットを選び、ピボットより小さい要素と大きい要素に分割して再帰的にソートする。
 * 計算量: 平均 O(n log n)、最悪 O(n^2)
 */
export function quickSort(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  const n = a.length
  const sortedIndices = new Set<number>()

  steps.push({
    array: copyArray(a),
    description: 'クイックソートを開始します',
  })

  function partition(low: number, high: number): number {
    const pivot = a[high]

    steps.push({
      array: copyArray(a),
      comparing: [high],
      sorted: Array.from(sortedIndices),
      description: `ピボット ${pivot}（位置${high}）を選択しました`,
    })

    let i = low - 1

    for (let j = low; j < high; j++) {
      steps.push({
        array: copyArray(a),
        comparing: [j, high],
        sorted: Array.from(sortedIndices),
        description: `${a[j]} とピボット ${pivot} を比較します`,
      })

      if (a[j] <= pivot) {
        i++
        if (i !== j) {
          ;[a[i], a[j]] = [a[j], a[i]]
          steps.push({
            array: copyArray(a),
            swapping: [i, j],
            sorted: Array.from(sortedIndices),
            description: `${a[j]} と ${a[i]} を交換しました（ピボット以下の要素を左に移動）`,
          })
        }
      }
    }

    ;[a[i + 1], a[high]] = [a[high], a[i + 1]]
    steps.push({
      array: copyArray(a),
      swapping: [i + 1, high],
      sorted: Array.from(sortedIndices),
      description: `ピボット ${pivot} を正しい位置（${i + 1}）に配置しました`,
    })

    sortedIndices.add(i + 1)
    return i + 1
  }

  function quickSortHelper(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high)
      quickSortHelper(low, pi - 1)
      quickSortHelper(pi + 1, high)
    } else if (low === high) {
      sortedIndices.add(low)
      steps.push({
        array: copyArray(a),
        sorted: Array.from(sortedIndices),
        description: `位置${low}の要素 ${a[low]} は確定しました`,
      })
    }
  }

  quickSortHelper(0, n - 1)

  steps.push({
    array: copyArray(a),
    sorted: Array.from({ length: n }, (_, i) => i),
    description: 'クイックソートが完了しました',
  })

  return steps
}

/**
 * マージソート
 * 配列を半分に分割し、それぞれを再帰的にソートした後、統合する。
 * 計算量: O(n log n)
 */
export function mergeSort(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  const n = a.length
  const sortedIndices = new Set<number>()

  steps.push({
    array: copyArray(a),
    description: 'マージソートを開始します',
  })

  function mergeSortHelper(left: number, right: number): void {
    if (left >= right) {
      return
    }

    const mid = Math.floor((left + right) / 2)

    steps.push({
      array: copyArray(a),
      comparing: [left, mid, right],
      sorted: Array.from(sortedIndices),
      description: `配列を分割します: [${left}..${mid}] と [${mid + 1}..${right}]`,
    })

    mergeSortHelper(left, mid)
    mergeSortHelper(mid + 1, right)
    merge(left, mid, right)
  }

  function merge(left: number, mid: number, right: number): void {
    const leftArr = a.slice(left, mid + 1)
    const rightArr = a.slice(mid + 1, right + 1)

    steps.push({
      array: copyArray(a),
      comparing: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      sorted: Array.from(sortedIndices),
      description: `[${leftArr.join(', ')}] と [${rightArr.join(', ')}] を統合します`,
    })

    let i = 0
    let j = 0
    let k = left

    while (i < leftArr.length && j < rightArr.length) {
      if (leftArr[i] <= rightArr[j]) {
        a[k] = leftArr[i]
        i++
      } else {
        a[k] = rightArr[j]
        j++
      }

      steps.push({
        array: copyArray(a),
        swapping: [k],
        sorted: Array.from(sortedIndices),
        description: `位置${k}に ${a[k]} を配置しました`,
      })

      k++
    }

    while (i < leftArr.length) {
      a[k] = leftArr[i]
      steps.push({
        array: copyArray(a),
        swapping: [k],
        sorted: Array.from(sortedIndices),
        description: `残りの左側要素 ${a[k]} を位置${k}に配置しました`,
      })
      i++
      k++
    }

    while (j < rightArr.length) {
      a[k] = rightArr[j]
      steps.push({
        array: copyArray(a),
        swapping: [k],
        sorted: Array.from(sortedIndices),
        description: `残りの右側要素 ${a[k]} を位置${k}に配置しました`,
      })
      j++
      k++
    }

    // 全体がソート済みかチェック（最上位のマージ完了時）
    if (left === 0 && right === n - 1) {
      for (let idx = left; idx <= right; idx++) {
        sortedIndices.add(idx)
      }
    }
  }

  mergeSortHelper(0, n - 1)

  steps.push({
    array: copyArray(a),
    sorted: Array.from({ length: n }, (_, i) => i),
    description: 'マージソートが完了しました',
  })

  return steps
}

/**
 * ヒープソート
 * 最大ヒープを構築し、最大要素を末尾に移動して繰り返す。
 * 計算量: O(n log n)
 */
export function heapSort(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const a = copyArray(arr)
  const n = a.length
  const sorted: number[] = []

  steps.push({
    array: copyArray(a),
    description: 'ヒープソートを開始します。まず最大ヒープを構築します',
  })

  function heapify(size: number, rootIdx: number): void {
    let largest = rootIdx
    const left = 2 * rootIdx + 1
    const right = 2 * rootIdx + 2

    if (left < size) {
      steps.push({
        array: copyArray(a),
        comparing: [largest, left],
        sorted: [...sorted],
        description: `親 ${a[largest]}(位置${largest}) と左子 ${a[left]}(位置${left}) を比較します`,
      })

      if (a[left] > a[largest]) {
        largest = left
      }
    }

    if (right < size) {
      steps.push({
        array: copyArray(a),
        comparing: [largest, right],
        sorted: [...sorted],
        description: `現在の最大値 ${a[largest]}(位置${largest}) と右子 ${a[right]}(位置${right}) を比較します`,
      })

      if (a[right] > a[largest]) {
        largest = right
      }
    }

    if (largest !== rootIdx) {
      ;[a[rootIdx], a[largest]] = [a[largest], a[rootIdx]]
      steps.push({
        array: copyArray(a),
        swapping: [rootIdx, largest],
        sorted: [...sorted],
        description: `${a[largest]} と ${a[rootIdx]} を交換してヒープ性を維持します`,
      })

      heapify(size, largest)
    }
  }

  // 最大ヒープを構築
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i)
  }

  steps.push({
    array: copyArray(a),
    sorted: [...sorted],
    description: '最大ヒープの構築が完了しました。ソートを開始します',
  })

  // ヒープから要素を1つずつ取り出す
  for (let i = n - 1; i > 0; i--) {
    ;[a[0], a[i]] = [a[i], a[0]]
    sorted.push(i)

    steps.push({
      array: copyArray(a),
      swapping: [0, i],
      sorted: [...sorted],
      description: `最大値 ${a[i]} を末尾（位置${i}）に移動しました`,
    })

    heapify(i, 0)
  }

  sorted.push(0)
  steps.push({
    array: copyArray(a),
    sorted: Array.from({ length: n }, (_, i) => i),
    description: 'ヒープソートが完了しました',
  })

  return steps
}
