"""
0/1 Knapsack Problem
---------------------
Given n items each with a weight and value, and a knapsack of capacity W,
find the maximum value achievable without exceeding the weight capacity.
Each item can be taken at most once (0/1 — either take it or leave it).

Time Complexity:  O(n * W) — n items, W capacity
Space Complexity: O(n * W) — DP table
                  O(W)     — space-optimised version
"""


def knapsack(weights: list, values: list, capacity: int) -> int:
    """
    0/1 Knapsack using bottom-up DP.
    dp[i][w] = max value using first i items with capacity w.
    Returns the maximum value achievable.
    """
    n = len(weights)
    # dp[i][w] = best value with first i items and capacity w
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            # Option 1: skip item i
            dp[i][w] = dp[i - 1][w]
            # Option 2: take item i (only if it fits)
            if weights[i - 1] <= w:
                take = dp[i - 1][w - weights[i - 1]] + values[i - 1]
                dp[i][w] = max(dp[i][w], take)

    return dp[n][capacity]


def knapsack_optimised(weights: list, values: list, capacity: int) -> int:
    """
    0/1 Knapsack with O(W) space.
    Uses a single 1D dp array, iterating capacity in reverse
    to prevent using the same item twice.
    """
    dp = [0] * (capacity + 1)

    for i in range(len(weights)):
        # Traverse backwards so we don't reuse item i in the same pass
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])

    return dp[capacity]


def knapsack_with_items(weights: list, values: list, capacity: int) -> tuple:
    """
    0/1 Knapsack that also returns which items were selected.
    Returns (max_value, list_of_selected_indices).
    """
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                take = dp[i - 1][w - weights[i - 1]] + values[i - 1]
                dp[i][w] = max(dp[i][w], take)

    # Backtrack to find selected items
    selected = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            selected.append(i - 1)  # 0-indexed
            w -= weights[i - 1]

    return dp[n][capacity], list(reversed(selected))
