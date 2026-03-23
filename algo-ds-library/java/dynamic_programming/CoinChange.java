package dynamic_programming;

import java.util.ArrayList;
import java.util.List;

/**
 * Coin Change Problems
 *
 * Minimum coins:   Time O(amount * coins)  Space O(amount)
 * Number of ways:  Time O(amount * coins)  Space O(amount)
 */
public class CoinChange {

    /** Minimum number of coins to make amount. Returns -1 if impossible. */
    public static int minCoins(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        java.util.Arrays.fill(dp, amount + 1);
        dp[0] = 0;

        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }

    /** Number of distinct combinations of coins that sum to amount. */
    public static int countWays(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        dp[0] = 1;
        for (int coin : coins) {
            for (int i = coin; i <= amount; i++) {
                dp[i] += dp[i - coin];
            }
        }
        return dp[amount];
    }

    /**
     * Minimum coins with coin list backtracking.
     * Returns int[] where result[0] = min count, result[1..] = coins used.
     * Returns {-1} if impossible.
     */
    public static int[] minCoinsWithPath(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        int[] lastCoin = new int[amount + 1];
        java.util.Arrays.fill(dp, amount + 1);
        java.util.Arrays.fill(lastCoin, -1);
        dp[0] = 0;

        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i && dp[i - coin] + 1 < dp[i]) {
                    dp[i] = dp[i - coin] + 1;
                    lastCoin[i] = coin;
                }
            }
        }

        if (dp[amount] > amount) return new int[]{-1};

        List<Integer> used = new ArrayList<>();
        int remaining = amount;
        while (remaining > 0) {
            used.add(lastCoin[remaining]);
            remaining -= lastCoin[remaining];
        }

        int[] result = new int[used.size() + 1];
        result[0] = dp[amount];
        for (int i = 0; i < used.size(); i++) result[i + 1] = used.get(i);
        return result;
    }
}
