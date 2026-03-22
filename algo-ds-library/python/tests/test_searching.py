import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from searching.binary_search import binary_search_iterative, binary_search_recursive


def make_binary_search_test_case(search_fn):
    """Factory: generate a TestCase class for any binary search function."""

    class BinarySearchTests(unittest.TestCase):

        def test_empty_list(self):
            self.assertEqual(search_fn([], 1), -1)

        def test_single_element_found(self):
            self.assertEqual(search_fn([5], 5), 0)

        def test_single_element_not_found(self):
            self.assertEqual(search_fn([5], 3), -1)

        def test_target_at_start(self):
            self.assertEqual(search_fn([1, 2, 3, 4, 5], 1), 0)

        def test_target_at_end(self):
            self.assertEqual(search_fn([1, 2, 3, 4, 5], 5), 4)

        def test_target_in_middle(self):
            self.assertEqual(search_fn([1, 2, 3, 4, 5], 3), 2)

        def test_target_not_found(self):
            self.assertEqual(search_fn([1, 2, 3, 4, 5], 99), -1)

        def test_negative_numbers(self):
            self.assertEqual(search_fn([-5, -3, -1, 0, 2], -3), 1)

        def test_large_list(self):
            arr = list(range(0, 1000, 2))  # [0, 2, 4, ..., 998]
            self.assertEqual(search_fn(arr, 500), 250)

        def test_target_below_range(self):
            self.assertEqual(search_fn([10, 20, 30], 5), -1)

        def test_target_above_range(self):
            self.assertEqual(search_fn([10, 20, 30], 99), -1)

    BinarySearchTests.__name__ = f"Test_{search_fn.__name__}"
    return BinarySearchTests


# Register test classes for both implementations
TestIterative = make_binary_search_test_case(binary_search_iterative)
TestRecursive = make_binary_search_test_case(binary_search_recursive)

if __name__ == "__main__":
    unittest.main()
