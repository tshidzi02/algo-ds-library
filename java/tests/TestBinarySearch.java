package tests;

import org.junit.Test;
import static org.junit.Assert.*;
import searching.BinarySearch;

/**
 * Test suite for BinarySearch (iterative and recursive).
 *
 * Compile:
 *   javac -cp ".;lib/junit-4.13.2.jar" -d out java/searching/*.java java/tests/TestBinarySearch.java
 * Run:
 *   java -cp "out;lib/junit-4.13.2.jar;lib/hamcrest-core-1.3.jar" org.junit.runner.JUnitCore tests.TestBinarySearch
 */
public class TestBinarySearch {

    // ── Iterative Tests ──────────────────────────────────────────────────────

    @Test
    public void iterative_emptyArray() {
        assertEquals(-1, BinarySearch.iterative(new int[]{}, 1));
    }

    @Test
    public void iterative_singleElementFound() {
        assertEquals(0, BinarySearch.iterative(new int[]{5}, 5));
    }

    @Test
    public void iterative_singleElementNotFound() {
        assertEquals(-1, BinarySearch.iterative(new int[]{5}, 3));
    }

    @Test
    public void iterative_targetAtStart() {
        assertEquals(0, BinarySearch.iterative(new int[]{1, 2, 3, 4, 5}, 1));
    }

    @Test
    public void iterative_targetAtEnd() {
        assertEquals(4, BinarySearch.iterative(new int[]{1, 2, 3, 4, 5}, 5));
    }

    @Test
    public void iterative_targetInMiddle() {
        assertEquals(2, BinarySearch.iterative(new int[]{1, 2, 3, 4, 5}, 3));
    }

    @Test
    public void iterative_targetNotFound() {
        assertEquals(-1, BinarySearch.iterative(new int[]{1, 2, 3, 4, 5}, 99));
    }

    @Test
    public void iterative_negativeNumbers() {
        assertEquals(1, BinarySearch.iterative(new int[]{-5, -3, -1, 0, 2}, -3));
    }

    @Test
    public void iterative_targetBelowRange() {
        assertEquals(-1, BinarySearch.iterative(new int[]{10, 20, 30}, 5));
    }

    @Test
    public void iterative_targetAboveRange() {
        assertEquals(-1, BinarySearch.iterative(new int[]{10, 20, 30}, 99));
    }

    // ── Recursive Tests ──────────────────────────────────────────────────────

    @Test
    public void recursive_emptyArray() {
        assertEquals(-1, BinarySearch.recursive(new int[]{}, 1));
    }

    @Test
    public void recursive_singleElementFound() {
        assertEquals(0, BinarySearch.recursive(new int[]{5}, 5));
    }

    @Test
    public void recursive_singleElementNotFound() {
        assertEquals(-1, BinarySearch.recursive(new int[]{5}, 3));
    }

    @Test
    public void recursive_targetAtStart() {
        assertEquals(0, BinarySearch.recursive(new int[]{1, 2, 3, 4, 5}, 1));
    }

    @Test
    public void recursive_targetAtEnd() {
        assertEquals(4, BinarySearch.recursive(new int[]{1, 2, 3, 4, 5}, 5));
    }

    @Test
    public void recursive_targetInMiddle() {
        assertEquals(2, BinarySearch.recursive(new int[]{1, 2, 3, 4, 5}, 3));
    }

    @Test
    public void recursive_targetNotFound() {
        assertEquals(-1, BinarySearch.recursive(new int[]{1, 2, 3, 4, 5}, 99));
    }

    @Test
    public void recursive_negativeNumbers() {
        assertEquals(1, BinarySearch.recursive(new int[]{-5, -3, -1, 0, 2}, -3));
    }

    @Test
    public void recursive_targetBelowRange() {
        assertEquals(-1, BinarySearch.recursive(new int[]{10, 20, 30}, 5));
    }

    @Test
    public void recursive_targetAboveRange() {
        assertEquals(-1, BinarySearch.recursive(new int[]{10, 20, 30}, 99));
    }
}
