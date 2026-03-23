"""
Binary Search Implementation
-----------------------------
Precondition: Input list must be sorted in ascending order.

Time Complexity:
    - Best:    O(1)      — target is the middle element
    - Average: O(log n)
    - Worst:   O(log n)

Space Complexity:
    - Iterative: O(1)
    - Recursive: O(log n) — recursive call stack
"""


def binary_search_iterative(arr: list, target: int) -> int:
    """
    Search for target in a sorted list using iteration.
    Returns the index of target if found, otherwise -1.
    """
    low, high = 0, len(arr) - 1

    while low <= high:
        mid = (low + high) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1


def binary_search_recursive(arr: list, target: int, low: int = 0, high: int = None) -> int:
    """
    Search for target in a sorted list using recursion.
    Returns the index of target if found, otherwise -1.
    """
    if high is None:
        high = len(arr) - 1

    if low > high:
        return -1

    mid = (low + high) // 2

    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, high)
    else:
        return binary_search_recursive(arr, target, low, mid - 1)
