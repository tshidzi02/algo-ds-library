package tests;

import org.junit.Test;
import static org.junit.Assert.*;
import sorting.Quicksort;
import sorting.MergeSort;

/**
 * Test suite for Quicksort and MergeSort.
 * Run with: javac -cp .:junit-4.13.2.jar -d out java/sorting/*.java java/tests/*.java
 *           java  -cp out:junit-4.13.2.jar:hamcrest-core-1.3.jar org.junit.runner.JUnitCore tests.TestSorting
 */
public class TestSorting {

    // ── Quicksort Tests ──────────────────────────────────────────────────────

    @Test
    public void quicksort_emptyArray() {
        int[] arr = {};
        Quicksort.quicksort(arr);
        assertArrayEquals(new int[]{}, arr);
    }

    @Test
    public void quicksort_singleElement() {
        int[] arr = {1};
        Quicksort.quicksort(arr);
        assertArrayEquals(new int[]{1}, arr);
    }

    @Test
    public void quicksort_alreadySorted() {
        int[] arr = {1, 2, 3, 4, 5};
        Quicksort.quicksort(arr);
        assertArrayEquals(new int[]{1, 2, 3, 4, 5}, arr);
    }

    @Test
    public void quicksort_reverseSorted() {
        int[] arr = {5, 4, 3, 2, 1};
        Quicksort.quicksort(arr);
        assertArrayEquals(new int[]{1, 2, 3, 4, 5}, arr);
    }

    @Test
    public void quicksort_duplicates() {
        int[] arr = {3, 1, 2, 1, 3};
        Quicksort.quicksort(arr);
        assertArrayEquals(new int[]{1, 1, 2, 3, 3}, arr);
    }

    @Test
    public void quicksort_negativeNumbers() {
        int[] arr = {-3, -1, -4, -1, -5};
        Quicksort.quicksort(arr);
        assertArrayEquals(new int[]{-5, -4, -3, -1, -1}, arr);
    }

    @Test
    public void quicksort_mixedNegativePositive() {
        int[] arr = {3, -2, 0, -1, 5};
        Quicksort.quicksort(arr);
        assertArrayEquals(new int[]{-2, -1, 0, 3, 5}, arr);
    }

    // ── MergeSort Tests ──────────────────────────────────────────────────────

    @Test
    public void mergeSort_emptyArray() {
        assertArrayEquals(new int[]{}, MergeSort.mergeSort(new int[]{}));
    }

    @Test
    public void mergeSort_singleElement() {
        assertArrayEquals(new int[]{1}, MergeSort.mergeSort(new int[]{1}));
    }

    @Test
    public void mergeSort_alreadySorted() {
        assertArrayEquals(new int[]{1, 2, 3, 4, 5}, MergeSort.mergeSort(new int[]{1, 2, 3, 4, 5}));
    }

    @Test
    public void mergeSort_reverseSorted() {
        assertArrayEquals(new int[]{1, 2, 3, 4, 5}, MergeSort.mergeSort(new int[]{5, 4, 3, 2, 1}));
    }

    @Test
    public void mergeSort_duplicates() {
        assertArrayEquals(new int[]{1, 1, 2, 3, 3}, MergeSort.mergeSort(new int[]{3, 1, 2, 1, 3}));
    }

    @Test
    public void mergeSort_negativeNumbers() {
        assertArrayEquals(new int[]{-5, -4, -3, -1, -1}, MergeSort.mergeSort(new int[]{-3, -1, -4, -1, -5}));
    }

    @Test
    public void mergeSort_mixedNegativePositive() {
        assertArrayEquals(new int[]{-2, -1, 0, 3, 5}, MergeSort.mergeSort(new int[]{3, -2, 0, -1, 5}));
    }
}
