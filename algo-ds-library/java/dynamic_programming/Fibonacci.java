package dynamic_programming;

import java.util.HashMap;
import java.util.Map;

/**
 * Fibonacci Number
 *
 * Naive Recursion:    Time O(2^n)  Space O(n)
 * Memoisation:        Time O(n)    Space O(n)
 * Tabulation:         Time O(n)    Space O(n)
 * Optimised:          Time O(n)    Space O(1)
 */
public class Fibonacci {

    /** Naive recursive — exponential time, for demonstration only. */
    public static long recursive(int n) {
        if (n < 0) throw new IllegalArgumentException("n must be non-negative");
        if (n <= 1) return n;
        return recursive(n - 1) + recursive(n - 2);
    }

    /** Top-Down DP with memoisation. */
    public static long memo(int n) {
        if (n < 0) throw new IllegalArgumentException("n must be non-negative");
        return memoHelper(n, new HashMap<>());
    }

    private static long memoHelper(int n, Map<Integer, Long> cache) {
        if (n <= 1) return n;
        if (cache.containsKey(n)) return cache.get(n);
        long result = memoHelper(n - 1, cache) + memoHelper(n - 2, cache);
        cache.put(n, result);
        return result;
    }

    /** Bottom-Up DP with table. */
    public static long tabulation(int n) {
        if (n < 0) throw new IllegalArgumentException("n must be non-negative");
        if (n <= 1) return n;
        long[] dp = new long[n + 1];
        dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }

    /** Bottom-Up DP with O(1) space. */
    public static long optimised(int n) {
        if (n < 0) throw new IllegalArgumentException("n must be non-negative");
        if (n <= 1) return n;
        long prev = 0, curr = 1;
        for (int i = 2; i <= n; i++) {
            long next = prev + curr;
            prev = curr;
            curr = next;
        }
        return curr;
    }
}
