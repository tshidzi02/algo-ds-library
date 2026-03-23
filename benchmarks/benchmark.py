"""
Big-O Benchmarking Suite
-------------------------
Measures real execution time of all algorithms across increasing input sizes
and prints a formatted report showing how performance scales.
"""

import time
import random
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python")))

from sorting.quicksort import quicksort
from sorting.merge_sort import merge_sort
from searching.binary_search import binary_search_iterative
from graphs.graph_traversal import dfs_iterative, bfs
from dynamic_programming.fibonacci import fib_optimised
from dynamic_programming.knapsack import knapsack_optimised
from dynamic_programming.coin_change import coin_change_min
from greedy.activity_selection import activity_selection
from greedy.huffman import huffman_compress

# ── Helpers ──────────────────────────────────────────────────────────────────

def time_it(fn, *args) -> float:
    """Run fn(*args) and return elapsed time in milliseconds."""
    start = time.perf_counter()
    fn(*args)
    return (time.perf_counter() - start) * 1000


def random_array(n: int) -> list:
    return [random.randint(1, 10_000) for _ in range(n)]


def sorted_array(n: int) -> list:
    return list(range(1, n + 1))


def random_graph(n: int) -> dict:
    """Build a random connected graph with n nodes."""
    nodes = [str(i) for i in range(n)]
    graph = {node: [] for node in nodes}
    for i in range(1, n):
        j = random.randint(0, i - 1)
        graph[nodes[i]].append(nodes[j])
        graph[nodes[j]].append(nodes[i])
    return graph


def random_activities(n: int) -> list:
    acts = []
    for _ in range(n):
        s = random.randint(0, 100)
        acts.append((s, s + random.randint(1, 20)))
    return acts


# ── Report helpers ────────────────────────────────────────────────────────────

SEP   = "─" * 72
TITLE = "█"

def header(title: str):
    print(f"\n{SEP}")
    print(f"  {title}")
    print(SEP)
    print(f"  {'Input Size':>12}  {'Time (ms)':>12}  {'Ratio (×prev)':>15}  {'Expected':>12}")
    print(f"  {'─'*12}  {'─'*12}  {'─'*15}  {'─'*12}")


def row(size: int, ms: float, prev_ms: float, expected: str):
    ratio = f"{ms / prev_ms:.2f}×" if prev_ms > 0 else "—"
    print(f"  {size:>12,}  {ms:>12.4f}  {ratio:>15}  {expected:>12}")


# ── Benchmark functions ───────────────────────────────────────────────────────

def bench_sorting():
    sizes = [100, 500, 1_000, 5_000, 10_000]

    for name, fn in [("Quicksort", quicksort), ("Merge Sort", merge_sort)]:
        header(f"{name}  —  Expected: O(n log n)")
        prev = 0
        for n in sizes:
            arr = random_array(n)
            ms = time_it(fn, arr.copy())
            row(n, ms, prev, "O(n log n)")
            prev = ms


def bench_binary_search():
    sizes = [1_000, 10_000, 100_000, 1_000_000]
    header("Binary Search  —  Expected: O(log n)")
    prev = 0
    for n in sizes:
        arr = sorted_array(n)
        target = random.randint(1, n)
        ms = time_it(binary_search_iterative, arr, target)
        row(n, ms, prev, "O(log n)")
        prev = ms


def bench_graphs():
    sizes = [50, 100, 500, 1_000]

    for name, fn in [("DFS", dfs_iterative), ("BFS", bfs)]:
        header(f"Graph {name}  —  Expected: O(V + E)")
        prev = 0
        for n in sizes:
            graph = random_graph(n)
            start = str(0)
            ms = time_it(fn, graph, start)
            row(n, ms, prev, "O(V + E)")
            prev = ms


def bench_dp():
    # Fibonacci
    sizes = [10, 50, 100, 500, 1_000]
    header("Fibonacci (optimised)  —  Expected: O(n)")
    prev = 0
    for n in sizes:
        ms = time_it(fib_optimised, n)
        row(n, ms, prev, "O(n)")
        prev = ms

    # Knapsack
    sizes = [10, 50, 100, 200]
    header("0/1 Knapsack  —  Expected: O(n × W)")
    prev = 0
    for n in sizes:
        weights = [random.randint(1, 20) for _ in range(n)]
        values  = [random.randint(1, 100) for _ in range(n)]
        ms = time_it(knapsack_optimised, weights, values, 200)
        row(n, ms, prev, "O(n × W)")
        prev = ms

    # Coin Change
    sizes = [50, 100, 500, 1_000]
    header("Coin Change (min coins)  —  Expected: O(amount × coins)")
    prev = 0
    for n in sizes:
        ms = time_it(coin_change_min, [1, 5, 10, 25], n)
        row(n, ms, prev, "O(a × c)")
        prev = ms


def bench_greedy():
    # Activity Selection
    sizes = [100, 500, 1_000, 5_000]
    header("Activity Selection  —  Expected: O(n log n)")
    prev = 0
    for n in sizes:
        acts = random_activities(n)
        ms = time_it(activity_selection, acts)
        row(n, ms, prev, "O(n log n)")
        prev = ms

    # Huffman
    sizes = [100, 500, 1_000, 5_000]
    header("Huffman Coding  —  Expected: O(n log n)")
    prev = 0
    for n in sizes:
        text = ''.join(random.choices('abcdefghij', k=n))
        ms = time_it(huffman_compress, text)
        row(n, ms, prev, "O(n log n)")
        prev = ms


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("\n" + "═" * 72)
    print("  ALGORITHM BENCHMARKING SUITE  —  Big-O Analysis")
    print("  All times in milliseconds (ms). Ratio = time vs previous size.")
    print("═" * 72)

    bench_sorting()
    bench_binary_search()
    bench_graphs()
    bench_dp()
    bench_greedy()

    print(f"\n{SEP}")
    print("  Benchmark complete.")
    print(SEP + "\n")


if __name__ == "__main__":
    main()
