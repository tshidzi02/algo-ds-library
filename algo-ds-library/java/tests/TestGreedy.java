package tests;

import org.junit.Test;
import static org.junit.Assert.*;
import java.util.*;
import greedy.ActivitySelection;
import greedy.ActivitySelection.Activity;
import greedy.HuffmanCoding;
import greedy.HuffmanCoding.Node;

/**
 * Test suite for Greedy Algorithms: Activity Selection and Huffman Coding.
 *
 * Compile:
 *   javac -cp ".;lib/junit-4.13.2.jar" -d out java/greedy/*.java java/tests/TestGreedy.java
 * Run:
 *   java -cp "out;lib/junit-4.13.2.jar;lib/hamcrest-core-1.3.jar" org.junit.runner.JUnitCore tests.TestGreedy
 */
public class TestGreedy {

    // ── Activity Selection ───────────────────────────────────────────────────

    private List<Activity> acts(int[][] data) {
        List<Activity> list = new ArrayList<>();
        for (int[] d : data) list.add(new Activity(d[0], d[1]));
        return list;
    }

    @Test
    public void activitySelection_basicCase() {
        List<Activity> result = ActivitySelection.select(
            acts(new int[][]{{1,4},{3,5},{0,6},{5,7},{3,9},{5,9},{6,10},{8,11}})
        );
        assertEquals(3, result.size());
    }

    @Test
    public void activitySelection_noOverlap() {
        assertEquals(4, ActivitySelection.select(
            acts(new int[][]{{0,1},{2,3},{4,5},{6,7}})
        ).size());
    }

    @Test
    public void activitySelection_allOverlap() {
        assertEquals(1, ActivitySelection.select(
            acts(new int[][]{{0,10},{1,9},{2,8},{3,7}})
        ).size());
    }

    @Test
    public void activitySelection_emptyInput() {
        assertTrue(ActivitySelection.select(new ArrayList<>()).isEmpty());
    }

    @Test
    public void activitySelection_singleActivity() {
        List<Activity> result = ActivitySelection.select(acts(new int[][]{{2,5}}));
        assertEquals(1, result.size());
    }

    @Test
    public void activitySelection_nonOverlapping() {
        List<Activity> result = ActivitySelection.select(
            acts(new int[][]{{1,4},{3,5},{0,6},{5,7},{3,9},{5,9},{6,10},{8,11}})
        );
        for (int i = 0; i < result.size() - 1; i++)
            assertTrue(result.get(i + 1).start >= result.get(i).finish);
    }

    @Test
    public void activitySelection_adjacentActivities() {
        assertEquals(3, ActivitySelection.select(
            acts(new int[][]{{0,2},{2,4},{4,6}})
        ).size());
    }

    // ── Huffman Coding ───────────────────────────────────────────────────────

    @Test
    public void huffman_codesGenerated() {
        Map<Character, String> codes = HuffmanCoding.buildCodes(HuffmanCoding.buildTree("hello"));
        assertTrue(codes.containsKey('h'));
        assertTrue(codes.containsKey('e'));
        assertTrue(codes.containsKey('l'));
        assertTrue(codes.containsKey('o'));
    }

    @Test
    public void huffman_frequentCharShorterCode() {
        Map<Character, String> codes = HuffmanCoding.buildCodes(HuffmanCoding.buildTree("hello"));
        assertTrue(codes.get('l').length() <= codes.get('h').length());
    }

    @Test
    public void huffman_encodeDecodeRoundtrip() {
        String text = "hello world";
        Node root = HuffmanCoding.buildTree(text);
        Map<Character, String> codes = HuffmanCoding.buildCodes(root);
        assertEquals(text, HuffmanCoding.decode(HuffmanCoding.encode(text, codes), root));
    }

    @Test
    public void huffman_longTextRoundtrip() {
        String text = "the quick brown fox jumps over the lazy dog";
        Node root = HuffmanCoding.buildTree(text);
        Map<Character, String> codes = HuffmanCoding.buildCodes(root);
        assertEquals(text, HuffmanCoding.decode(HuffmanCoding.encode(text, codes), root));
    }

    @Test
    public void huffman_allCodesUnique() {
        Map<Character, String> codes = HuffmanCoding.buildCodes(HuffmanCoding.buildTree("abcdefgh"));
        Set<String> values = new HashSet<>(codes.values());
        assertEquals(codes.size(), values.size());
    }

    @Test
    public void huffman_prefixFree() {
        Map<Character, String> codes = HuffmanCoding.buildCodes(HuffmanCoding.buildTree("abracadabra"));
        List<String> codeList = new ArrayList<>(codes.values());
        for (int i = 0; i < codeList.size(); i++)
            for (int j = 0; j < codeList.size(); j++)
                if (i != j)
                    assertFalse(codeList.get(j).startsWith(codeList.get(i)));
    }

    @Test
    public void huffman_compressionReducesSize() {
        int[] stats = HuffmanCoding.compressionStats("aaaaaabbbbccdd");
        assertTrue(stats[1] < stats[0]);
    }

    @Test
    public void huffman_emptyText() {
        assertNull(HuffmanCoding.buildTree(""));
    }
}
