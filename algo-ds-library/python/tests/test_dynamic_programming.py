import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dynamic_programming.fibonacci import fib_recursive, fib_memo, fib_tabulation, fib_optimised
from dynamic_programming.knapsack import knapsack, knapsack_optimised, knapsack_with_items
from dynamic_programming.coin_change import coin_change_min, coin_change_ways, coin_change_min_with_path


# ── Fibonacci ────────────────────────────────────────────────────────────────

FIB_SEQUENCE = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55]

def make_fib_tests(fn):
    class FibTests(unittest.TestCase):
        def test_base_case_zero(self):      self.assertEqual(fn(0), 0)
        def test_base_case_one(self):       self.assertEqual(fn(1), 1)
        def test_small_values(self):
            for i, expected in enumerate(FIB_SEQUENCE):
                self.assertEqual(fn(i), expected)
        def test_larger_value(self):        self.assertEqual(fn(20), 6765)
        def test_negative_raises(self):
            with self.assertRaises(ValueError): fn(-1)
    FibTests.__name__ = f"TestFib_{fn.__name__}"
    return FibTests

TestFibRecursive   = make_fib_tests(fib_recursive)
TestFibMemo        = make_fib_tests(fib_memo)
TestFibTabulation  = make_fib_tests(fib_tabulation)
TestFibOptimised   = make_fib_tests(fib_optimised)


# ── Knapsack ─────────────────────────────────────────────────────────────────

class TestKnapsack(unittest.TestCase):

    def test_basic_case(self):
        # weights=[1,3,4,5], values=[1,4,5,7], capacity=7 → max value = 9
        self.assertEqual(knapsack([1,3,4,5], [1,4,5,7], 7), 9)

    def test_zero_capacity(self):
        self.assertEqual(knapsack([1,2], [10,20], 0), 0)

    def test_single_item_fits(self):
        self.assertEqual(knapsack([2], [5], 3), 5)

    def test_single_item_does_not_fit(self):
        self.assertEqual(knapsack([5], [10], 3), 0)

    def test_all_items_fit(self):
        self.assertEqual(knapsack([1,1,1], [3,4,5], 3), 12)

    def test_empty_items(self):
        self.assertEqual(knapsack([], [], 10), 0)

    def test_optimised_matches_standard(self):
        w, v, c = [2,3,4,5], [3,4,5,6], 8
        self.assertEqual(knapsack(w,v,c), knapsack_optimised(w,v,c))


class TestKnapsackWithItems(unittest.TestCase):

    def test_returns_correct_value(self):
        val, items = knapsack_with_items([1,3,4,5], [1,4,5,7], 7)
        self.assertEqual(val, 9)

    def test_selected_items_within_capacity(self):
        weights = [1,3,4,5]
        val, items = knapsack_with_items(weights, [1,4,5,7], 7)
        self.assertLessEqual(sum(weights[i] for i in items), 7)

    def test_empty_items(self):
        val, items = knapsack_with_items([], [], 10)
        self.assertEqual(val, 0)
        self.assertEqual(items, [])


# ── Coin Change ──────────────────────────────────────────────────────────────

class TestCoinChangeMin(unittest.TestCase):

    def test_basic_case(self):
        self.assertEqual(coin_change_min([1,5,10,25], 36), 3)  # 25+10+1

    def test_exact_coin(self):
        self.assertEqual(coin_change_min([1,5,10], 10), 1)

    def test_impossible(self):
        self.assertEqual(coin_change_min([2], 3), -1)

    def test_zero_amount(self):
        self.assertEqual(coin_change_min([1,5], 0), 0)

    def test_single_coin_type(self):
        self.assertEqual(coin_change_min([3], 9), 3)

    def test_large_amount(self):
        self.assertEqual(coin_change_min([1,2,5], 100), 20)  # 20×5


class TestCoinChangeWays(unittest.TestCase):

    def test_basic_case(self):
        # [1,5,10,25] → amount 10: {10}, {5,5}, {5,1×5}, {1×10} = 4 ways
        self.assertEqual(coin_change_ways([1,5,10], 10), 4)

    def test_zero_amount(self):
        self.assertEqual(coin_change_ways([1,2,3], 0), 1)

    def test_impossible(self):
        self.assertEqual(coin_change_ways([2], 3), 0)

    def test_single_denomination(self):
        self.assertEqual(coin_change_ways([1], 5), 1)


class TestCoinChangeWithPath(unittest.TestCase):

    def test_returns_correct_count(self):
        count, coins = coin_change_min_with_path([1,5,10,25], 36)
        self.assertEqual(count, 3)

    def test_coins_sum_to_amount(self):
        count, coins = coin_change_min_with_path([1,5,10,25], 36)
        self.assertEqual(sum(coins), 36)

    def test_impossible_returns_minus_one(self):
        count, coins = coin_change_min_with_path([2], 3)
        self.assertEqual(count, -1)
        self.assertEqual(coins, [])


if __name__ == "__main__":
    unittest.main()
