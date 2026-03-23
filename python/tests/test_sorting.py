import unittest
import sys
import os
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sorting.quicksort import quicksort
from sorting.merge_sort import merge_sort


def make_sorting_test_case(sort_fn):
    """Factory: generate a TestCase class for any sorting function."""

    class SortingTests(unittest.TestCase):

        def test_empty_list(self):
            self.assertEqual(sort_fn([]), [])

        def test_single_element(self):
            self.assertEqual(sort_fn([1]), [1])

        def test_already_sorted(self):
            self.assertEqual(sort_fn([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5])

        def test_reverse_sorted(self):
            self.assertEqual(sort_fn([5, 4, 3, 2, 1]), [1, 2, 3, 4, 5])

        def test_duplicates(self):
            self.assertEqual(sort_fn([3, 1, 2, 1, 3]), [1, 1, 2, 3, 3])

        def test_all_same(self):
            self.assertEqual(sort_fn([7, 7, 7, 7]), [7, 7, 7, 7])

        def test_negative_numbers(self):
            self.assertEqual(sort_fn([-3, -1, -4, -1, -5]), [-5, -4, -3, -1, -1])

        def test_mixed_negative_positive(self):
            self.assertEqual(sort_fn([3, -2, 0, -1, 5]), [-2, -1, 0, 3, 5])

        def test_large_input(self):
            arr = random.sample(range(1000), 500)
            self.assertEqual(sort_fn(arr.copy()), sorted(arr))

    SortingTests.__name__ = f"Test_{sort_fn.__name__}"
    return SortingTests


# Register test classes for both algorithms
TestQuicksort = make_sorting_test_case(quicksort)
TestMergeSort = make_sorting_test_case(merge_sort)

if __name__ == "__main__":
    unittest.main()
