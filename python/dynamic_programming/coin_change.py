"""
Coin Change Problems
---------------------

Problem 1 — Minimum Coins:
    Given coin denominations and a target amount, find the minimum
    number of coins needed to make that amount.
    Return -1 if the amount cannot be made.

    Time Complexity:  O(amount * len(coins))
    Space Complexity: O(amount)

Problem 2 — Number of Ways:
    Count the total number of distinct combinations of coins
    that sum to the target amount.

    Time Complexity:  O(amount * len(coins))
    Space Complexity: O(amount)
"""


def coin_change_min(coins: list, amount: int) -> int:
    """
    Minimum number of coins to make the given amount.
    Classic unbounded knapsack / BFS-style DP.
    Returns -1 if amount cannot be reached.
    """
    # dp[i] = min coins needed to make amount i
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0  # Base case: 0 coins needed for amount 0

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] != float('inf'):
                dp[i] = min(dp[i], dp[i - coin] + 1)

    return dp[amount] if dp[amount] != float('inf') else -1


def coin_change_ways(coins: list, amount: int) -> int:
    """
    Number of distinct combinations of coins that sum to amount.
    Order does not matter — [1,2] and [2,1] count as one combination.
    """
    # dp[i] = number of ways to make amount i
    dp = [0] * (amount + 1)
    dp[0] = 1  # One way to make 0: use no coins

    # Outer loop over coins ensures each combination counted once
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] += dp[i - coin]

    return dp[amount]


def coin_change_min_with_path(coins: list, amount: int) -> tuple:
    """
    Minimum coins with backtracking to show which coins were used.
    Returns (min_count, list_of_coins_used) or (-1, []) if impossible.
    """
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    last_coin = [-1] * (amount + 1)

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] + 1 < dp[i]:
                dp[i] = dp[i - coin] + 1
                last_coin[i] = coin

    if dp[amount] == float('inf'):
        return -1, []

    # Backtrack to find coins used
    used = []
    remaining = amount
    while remaining > 0:
        used.append(last_coin[remaining])
        remaining -= last_coin[remaining]

    return dp[amount], used
