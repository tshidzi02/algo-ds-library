"""
Fibonacci Number
-----------------
Find the nth Fibonacci number where F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).

Naive Recursion:
    Time:  O(2^n) — exponential, recomputes same subproblems repeatedly
    Space: O(n)   — call stack depth

Memoisation (Top-Down DP):
    Time:  O(n)   — each subproblem solved exactly once
    Space: O(n)   — memo cache + call stack

Tabulation (Bottom-Up DP):
    Time:  O(n)
    Space: O(n)   — dp table

Optimised (Bottom-Up, constant space):
    Time:  O(n)
    Space: O(1)   — only two variables needed
"""


def fib_recursive(n: int) -> int:
    """
    Naive recursive Fibonacci.
    Included to demonstrate why memoisation is needed —
    this recomputes F(k) exponentially many times.
    """
    if n < 0:
        raise ValueError("n must be non-negative")
    if n <= 1:
        return n
    return fib_recursive(n - 1) + fib_recursive(n - 2)


def fib_memo(n: int, memo: dict = None) -> int:
    """
    Top-Down DP with memoisation.
    Stores already-computed results to avoid redundant work.
    """
    if n < 0:
        raise ValueError("n must be non-negative")
    if memo is None:
        memo = {}
    if n <= 1:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]


def fib_tabulation(n: int) -> int:
    """
    Bottom-Up DP with a table.
    Builds the solution from the smallest subproblems upward.
    """
    if n < 0:
        raise ValueError("n must be non-negative")
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]


def fib_optimised(n: int) -> int:
    """
    Bottom-Up DP with O(1) space.
    Only the previous two values are needed at any point.
    """
    if n < 0:
        raise ValueError("n must be non-negative")
    if n <= 1:
        return n
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    return curr
