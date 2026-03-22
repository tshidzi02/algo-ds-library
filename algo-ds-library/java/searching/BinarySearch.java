package searching;

/**
 * Binary Search Implementation
 *
 * Precondition: Input array must be sorted in ascending order.
 *
 * Time Complexity:
 *   Best:    O(1)     — target is the middle element
 *   Average: O(log n)
 *   Worst:   O(log n)
 *
 * Space Complexity:
 *   Iterative: O(1)
 *   Recursive: O(log n) — recursive call stack
 */
public class BinarySearch {

    /**
     * Iterative binary search.
     * Returns the index of target if found, otherwise -1.
     */
    public static int iterative(int[] arr, int target) {
        int low = 0, high = arr.length - 1;

        while (low <= high) {
            int mid = (low + high) / 2;

            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        return -1;
    }

    /**
     * Recursive binary search.
     * Returns the index of target if found, otherwise -1.
     */
    public static int recursive(int[] arr, int target) {
        return recursive(arr, target, 0, arr.length - 1);
    }

    private static int recursive(int[] arr, int target, int low, int high) {
        if (low > high) return -1;

        int mid = (low + high) / 2;

        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            return recursive(arr, target, mid + 1, high);
        } else {
            return recursive(arr, target, low, mid - 1);
        }
    }
}
