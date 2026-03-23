package tests;

import org.junit.Test;
import static org.junit.Assert.*;
import dynamic_programming.Fibonacci;
import dynamic_programming.Knapsack;
import dynamic_programming.CoinChange;

/**
 * Test suite for Dynamic Programming: Fibonacci, Knapsack, Coin Change.
 *
 * Compile:
 *   javac -cp ".;lib/junit-4.13.2.jar" -d out java/dynamic_programming/*.java java/tests/TestDynamicProgramming.java
 * Run:
 *   java -cp "out;lib/junit-4.13.2.jar;lib/hamcrest-core-1.3.jar" org.junit.runner.JUnitCore tests.TestDynamicProgramming
 */
public class TestDynamicProgramming {

    private static final long[] FIB = {0,1,1,2,3,5,8,13,21,34,55};

    // ── Fibonacci ────────────────────────────────────────────────────────────

    @Test public void fib_recursive_baseCase()    { assertEquals(0, Fibonacci.recursive(0)); assertEquals(1, Fibonacci.recursive(1)); }
    @Test public void fib_recursive_sequence()    { for (int i=0;i<FIB.length;i++) assertEquals(FIB[i], Fibonacci.recursive(i)); }
    @Test public void fib_memo_sequence()         { for (int i=0;i<FIB.length;i++) assertEquals(FIB[i], Fibonacci.memo(i)); }
    @Test public void fib_tabulation_sequence()   { for (int i=0;i<FIB.length;i++) assertEquals(FIB[i], Fibonacci.tabulation(i)); }
    @Test public void fib_optimised_sequence()    { for (int i=0;i<FIB.length;i++) assertEquals(FIB[i], Fibonacci.optimised(i)); }
    @Test public void fib_all_agree_at_20()       { assertEquals(Fibonacci.memo(20), Fibonacci.tabulation(20)); assertEquals(Fibonacci.tabulation(20), Fibonacci.optimised(20)); }
    @Test(expected = IllegalArgumentException.class)
    public void fib_negative_throws()             { Fibonacci.optimised(-1); }

    // ── Knapsack ─────────────────────────────────────────────────────────────

    @Test
    public void knapsack_basicCase() {
        assertEquals(9, Knapsack.knapsack(new int[]{1,3,4,5}, new int[]{1,4,5,7}, 7));
    }
    @Test
    public void knapsack_zeroCapacity() {
        assertEquals(0, Knapsack.knapsack(new int[]{1,2}, new int[]{10,20}, 0));
    }
    @Test
    public void knapsack_itemDoesNotFit() {
        assertEquals(0, Knapsack.knapsack(new int[]{5}, new int[]{10}, 3));
    }
    @Test
    public void knapsack_allItemsFit() {
        assertEquals(12, Knapsack.knapsack(new int[]{1,1,1}, new int[]{3,4,5}, 3));
    }
    @Test
    public void knapsack_optimisedMatchesStandard() {
        int[] w = {2,3,4,5}, v = {3,4,5,6};
        assertEquals(Knapsack.knapsack(w,v,8), Knapsack.knapsackOptimised(w,v,8));
    }
    @Test
    public void knapsack_withItems_correctValue() {
        int[] result = Knapsack.knapsackWithItems(new int[]{1,3,4,5}, new int[]{1,4,5,7}, 7);
        assertEquals(9, result[0]);
    }

    // ── Coin Change ──────────────────────────────────────────────────────────

    @Test
    public void coinChange_minBasicCase() {
        assertEquals(3, CoinChange.minCoins(new int[]{1,5,10,25}, 36));
    }
    @Test
    public void coinChange_minExactCoin() {
        assertEquals(1, CoinChange.minCoins(new int[]{1,5,10}, 10));
    }
    @Test
    public void coinChange_minImpossible() {
        assertEquals(-1, CoinChange.minCoins(new int[]{2}, 3));
    }
    @Test
    public void coinChange_minZeroAmount() {
        assertEquals(0, CoinChange.minCoins(new int[]{1,5}, 0));
    }
    @Test
    public void coinChange_minLargeAmount() {
        assertEquals(20, CoinChange.minCoins(new int[]{1,2,5}, 100));
    }
    @Test
    public void coinChange_waysBasicCase() {
        assertEquals(4, CoinChange.countWays(new int[]{1,5,10}, 10));
    }
    @Test
    public void coinChange_waysZeroAmount() {
        assertEquals(1, CoinChange.countWays(new int[]{1,2,3}, 0));
    }
    @Test
    public void coinChange_waysImpossible() {
        assertEquals(0, CoinChange.countWays(new int[]{2}, 3));
    }
    @Test
    public void coinChange_withPath_correctCount() {
        int[] result = CoinChange.minCoinsWithPath(new int[]{1,5,10,25}, 36);
        assertEquals(3, result[0]);
    }
    @Test
    public void coinChange_withPath_coinsSum() {
        int[] result = CoinChange.minCoinsWithPath(new int[]{1,5,10,25}, 36);
        int sum = 0;
        for (int i = 1; i < result.length; i++) sum += result[i];
        assertEquals(36, sum);
    }
    @Test
    public void coinChange_withPath_impossible() {
        int[] result = CoinChange.minCoinsWithPath(new int[]{2}, 3);
        assertEquals(-1, result[0]);
    }
}
