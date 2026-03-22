package sorting;

/**
 * Quicksort Implementation
 *
 * Time Complexity:
 *   Best:    O(n log n)
 *   Average: O(n log n)
 *   Worst:   O(n^2) — occurs when pivot is always min or max element
 *
 * Space Complexity: O(log n) — recursive call stack
 */
public class Quicksort {

    public static void quicksort(int[] arr) {
        if (arr == null || arr.length == 0) return;
        quicksort(arr, 0, arr.length - 1);
    }

    private static void quicksort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            quicksort(arr, low, pivotIndex - 1);
            quicksort(arr, pivotIndex + 1, high);
        }
    }

    /** Lomuto partition scheme — pivot is last element. */
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;

        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }

        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;

        return i + 1;
    }
}
