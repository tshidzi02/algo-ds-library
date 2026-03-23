// ─── Quicksort step generator ───────────────────────────────────────────────
export function generateQuicksortSteps(inputArr) {
  const steps = []
  const arr = [...inputArr]
  const sorted = new Set()

  function qs(arr, low, high) {
    if (low >= high) { if (low === high) sorted.add(low); return }
    const pivot = arr[high]
    steps.push({
      type: 'pivot', arr: [...arr], pivot: high, low, high, sorted: [...sorted],
      explain: `<span class="pivot-hl">Pivot selected: arr[${high}] = ${pivot}</span>. The pivot is the last element of subarray [${low}..${high}]. Everything ≤ ${pivot} will move left, everything > ${pivot} will move right.`,
      pl: 7
    })
    let i = low - 1
    for (let j = low; j < high; j++) {
      steps.push({
        type: 'compare', arr: [...arr], pivot: high, comparing: [j], low, high, sorted: [...sorted],
        explain: `Comparing <span class="compare-hl">arr[${j}] = ${arr[j]}</span> with pivot <span class="pivot-hl">${pivot}</span>. ${arr[j] <= pivot
          ? `<span class="hl">${arr[j]} ≤ ${pivot}</span> → increment i and swap into the left partition.`
          : `<span class="compare-hl">${arr[j]} > ${pivot}</span> → leave in place, belongs in right partition.`}`,
        pl: 10
      })
      if (arr[j] <= pivot) {
        i++
        if (i !== j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          steps.push({
            type: 'swap', arr: [...arr], pivot: high, swapping: [i, j], low, high, sorted: [...sorted],
            explain: `<span class="hl">Swapping</span> arr[${i}] = ${arr[i]} ↔ arr[${j}] = ${arr[j]}. The smaller element moves left. i is now at index ${i}, marking the left partition boundary.`,
            pl: 11
          })
        }
      }
    }
    ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
    const pi = i + 1
    sorted.add(pi)
    steps.push({
      type: 'place', arr: [...arr], pivot: pi, sorted: [...sorted], low, high,
      explain: `<span class="pivot-hl">Pivot ${arr[pi]}</span> placed at its <span class="sorted-hl">final sorted position (index ${pi})</span>. All elements to its left are ≤ ${arr[pi]}, all to its right are > ${arr[pi]}. This element is done.`,
      pl: 12
    })
    qs(arr, low, pi - 1)
    qs(arr, pi + 1, high)
  }

  qs(arr, 0, arr.length - 1)
  return steps
}

// ─── Merge sort step generator ───────────────────────────────────────────────
export function generateMergesortSteps(inputArr) {
  const steps = []
  let w = [...inputArr]
  const sorted = new Set()

  function rec(a, s, e) {
    if (e - s < 1) return a.slice(s, e + 1)
    const mid = Math.floor((s + e) / 2)
    steps.push({
      type: 'split', arr: [...w],
      comparing: Array.from({ length: e - s + 1 }, (_, k) => s + k),
      sorted: [...sorted],
      explain: `<span class="hl">Splitting</span> subarray [${s}..${e}] → left half [${s}..${mid}] and right half [${mid + 1}..${e}]. We keep dividing until subarrays are length 1 — always sorted by definition.`,
      pl: 2
    })
    const L = rec(a, s, mid)
    const R = rec(a, mid + 1, e)
    let i = 0, j = 0, k = s
    while (i < L.length && j < R.length) {
      steps.push({
        type: 'compare', arr: [...w], comparing: [s + i, mid + 1 + j], sorted: [...sorted],
        explain: `<span class="compare-hl">Merging:</span> left[${i}] = <span class="compare-hl">${L[i]}</span> vs right[${j}] = <span class="compare-hl">${R[j]}</span>. Taking <span class="hl">${L[i] <= R[j] ? L[i] : R[j]}</span> (the smaller). Building the merged sorted subarray one step at a time.`,
        pl: 10
      })
      if (L[i] <= R[j]) w[k++] = L[i++]
      else w[k++] = R[j++]
    }
    while (i < L.length) w[k++] = L[i++]
    while (j < R.length) w[k++] = R[j++]
    for (let x = s; x <= e; x++) sorted.add(x)
    steps.push({
      type: 'merged', arr: [...w], merged: [s, e], sorted: [...sorted],
      explain: `<span class="sorted-hl">✓ Subarray [${s}..${e}] merged and sorted:</span> [${w.slice(s, e + 1).join(', ')}]. Both halves were sorted, so merge just picks the smaller each time — this is why Merge Sort is O(n log n) guaranteed.`,
      pl: 5
    })
    return w.slice(s, e + 1)
  }

  rec(w, 0, inputArr.length - 1)
  return steps
}

// ─── Binary search step generator ────────────────────────────────────────────
export function generateBinarySearchSteps(arr, target) {
  const steps = []
  let low = 0, high = arr.length - 1

  steps.push({
    low, high, mid: -1, state: 'init', pl: 1,
    explain: `Initialise: <span class="low-hl">low = 0</span> (value ${arr[0]}), <span class="high-hl">high = ${high}</span> (value ${arr[high]}). Searching the entire array for target = <span class="hl">${target}</span>.`
  })

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    steps.push({
      low, high, mid, state: 'check', pl: 4,
      explain: `<span class="mid-hl">mid = ⌊(${low}+${high})/2⌋ = ${mid}</span>. Checking arr[${mid}] = <span class="mid-hl">${arr[mid]}</span> against target <span class="hl">${target}</span>. Equal, less, or greater?`
    })
    if (arr[mid] === target) {
      steps.push({
        low, high, mid, state: 'found', pl: 6,
        explain: `<span class="sorted-hl">✓ Found!</span> arr[<span class="mid-hl">${mid}</span>] = <span class="hl">${arr[mid]}</span> matches target <span class="hl">${target}</span>. Done in ${steps.length} comparisons. A linear search could need up to ${arr.length} — binary search is <span class="mid-hl">O(log n)</span>.`
      })
      return steps
    } else if (arr[mid] < target) {
      steps.push({
        low, high, mid, state: 'right', pl: 7,
        explain: `arr[${mid}] = <span class="mid-hl">${arr[mid]}</span> &lt; target <span class="hl">${target}</span>. Target is in the <span class="low-hl">right half</span>. Discard indices 0..${mid}. New <span class="low-hl">low = ${mid + 1}</span>.`
      })
      low = mid + 1
    } else {
      steps.push({
        low, high, mid, state: 'left', pl: 9,
        explain: `arr[${mid}] = <span class="mid-hl">${arr[mid]}</span> &gt; target <span class="hl">${target}</span>. Target is in the <span class="high-hl">left half</span>. Discard indices ${mid}..${high}. New <span class="high-hl">high = ${mid - 1}</span>.`
      })
      high = mid - 1
    }
  }

  steps.push({
    low, high, mid: -1, state: 'notfound', pl: 11,
    explain: `<span class="compare-hl">✗ Not found.</span> <span class="low-hl">low (${low})</span> exceeded <span class="high-hl">high (${high})</span> — search space is empty. Target <span class="hl">${target}</span> does not exist in this array. Return -1.`
  })
  return steps
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a
}

export function randomArray(n) {
  return Array.from({ length: n }, () => randInt(8, 96))
}

export function randomSortedArray(n) {
  const vals = new Set()
  while (vals.size < n) vals.add(randInt(1, 99))
  return [...vals].sort((a, b) => a - b)
}