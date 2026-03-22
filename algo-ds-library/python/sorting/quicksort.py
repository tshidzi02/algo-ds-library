"""
Quicksort Implementation
------------------------
Time Complexity:
    - Best:    O(n log n)
    - Average: O(n log n)
    - Worst:   O(n^2)  — occurs when pivot is always min or max element
Space Complexity: O(log n) — recursive call stack
"""


def quicksort(arr: list) -> list:
    """Sort a list using the quicksort algorithm (in-place via helper)."""
    _quicksort(arr, 0, len(arr) - 1)
    return arr


def _quicksort(arr: list, low: int, high: int) -> None:
    if low < high:
        pivot_index = _partition(arr, low, high)
        _quicksort(arr, low, pivot_index - 1)
        _quicksort(arr, pivot_index + 1, high)


def _partition(arr: list, low: int, high: int) -> int:
    """Lomuto partition scheme — pivot is last element."""
    pivot = arr[high]
    i = low - 1

    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]

    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
