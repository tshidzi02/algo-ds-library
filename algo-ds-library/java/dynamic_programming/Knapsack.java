package dynamic_programming;

import java.util.ArrayList;
import java.util.List;

/**
 * 0/1 Knapsack Problem
 *
 * Time Complexity:  O(n * W)
 * Space Complexity: O(n * W) standard, O(W) optimised
 */
public class Knapsack {

    /** Standard 0/1 Knapsack — returns max value. */
    public static int knapsack(int[] weights, int[] values, int capacity) {
        int n = weights.length;
        int[][] dp = new int[n + 1][capacity + 1];

        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= capacity; w++) {
                dp[i][w] = dp[i - 1][w];
                if (weights[i - 1] <= w) {
                    int take = dp[i - 1][w - weights[i - 1]] + values[i - 1];
                    dp[i][w] = Math.max(dp[i][w], take);
                }
            }
        }
        return dp[n][capacity];
    }

    /** Space-optimised 0/1 Knapsack — O(W) space. */
    public static int knapsackOptimised(int[] weights, int[] values, int capacity) {
        int[] dp = new int[capacity + 1];
        for (int i = 0; i < weights.length; i++) {
            for (int w = capacity; w >= weights[i]; w--) {
                dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
            }
        }
        return dp[capacity];
    }

    /** Knapsack with item tracking — returns max value and selected indices. */
    public static int[] knapsackWithItems(int[] weights, int[] values, int capacity) {
        int n = weights.length;
        int[][] dp = new int[n + 1][capacity + 1];

        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= capacity; w++) {
                dp[i][w] = dp[i - 1][w];
                if (weights[i - 1] <= w) {
                    int take = dp[i - 1][w - weights[i - 1]] + values[i - 1];
                    dp[i][w] = Math.max(dp[i][w], take);
                }
            }
        }

        // Backtrack to find selected items (stored as count in result[0], then indices)
        List<Integer> selected = new ArrayList<>();
        int w = capacity;
        for (int i = n; i > 0; i--) {
            if (dp[i][w] != dp[i - 1][w]) {
                selected.add(0, i - 1);
                w -= weights[i - 1];
            }
        }

        int[] result = new int[selected.size() + 1];
        result[0] = dp[n][capacity];
        for (int i = 0; i < selected.size(); i++) result[i + 1] = selected.get(i);
        return result;
    }
}
