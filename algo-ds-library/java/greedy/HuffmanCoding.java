package greedy;

import java.util.*;

/**
 * Huffman Coding
 *
 * Greedy strategy: always merge the two lowest-frequency nodes.
 *
 * Time Complexity:  O(n log n)
 * Space Complexity: O(n)
 */
public class HuffmanCoding {

    // ── Node ─────────────────────────────────────────────────────────────────

    public static class Node implements Comparable<Node> {
        public final char   ch;
        public final int    freq;
        public final Node   left, right;
        public final boolean isLeaf;

        /** Leaf node */
        public Node(char ch, int freq) {
            this.ch = ch; this.freq = freq;
            this.left = null; this.right = null;
            this.isLeaf = true;
        }

        /** Internal node */
        public Node(Node left, Node right) {
            this.ch = '\0'; this.freq = left.freq + right.freq;
            this.left = left; this.right = right;
            this.isLeaf = false;
        }

        @Override
        public int compareTo(Node other) { return Integer.compare(this.freq, other.freq); }
    }

    // ── Build tree ───────────────────────────────────────────────────────────

    public static Node buildTree(String text) {
        if (text == null || text.isEmpty()) return null;

        // Count frequencies
        Map<Character, Integer> freqMap = new LinkedHashMap<>();
        for (char c : text.toCharArray())
            freqMap.merge(c, 1, Integer::sum);

        // Build min-heap
        PriorityQueue<Node> heap = new PriorityQueue<>();
        for (Map.Entry<Character, Integer> e : freqMap.entrySet())
            heap.add(new Node(e.getKey(), e.getValue()));

        // Single unique character edge case
        if (heap.size() == 1) {
            Node leaf = heap.poll();
            return new Node(leaf, new Node('\0', 0) {{ }}) {
                { }
            };
        }

        // Greedy merge
        while (heap.size() > 1) {
            Node left  = heap.poll();
            Node right = heap.poll();
            heap.add(new Node(left, right));
        }

        return heap.poll();
    }

    // ── Build codes ──────────────────────────────────────────────────────────

    public static Map<Character, String> buildCodes(Node root) {
        Map<Character, String> codes = new LinkedHashMap<>();
        if (root == null) return codes;
        traverse(root, "", codes);
        return codes;
    }

    private static void traverse(Node node, String code, Map<Character, String> codes) {
        if (node == null) return;
        if (node.isLeaf) { codes.put(node.ch, code.isEmpty() ? "0" : code); return; }
        traverse(node.left,  code + "0", codes);
        traverse(node.right, code + "1", codes);
    }

    // ── Encode / Decode ──────────────────────────────────────────────────────

    public static String encode(String text, Map<Character, String> codes) {
        StringBuilder sb = new StringBuilder();
        for (char c : text.toCharArray()) sb.append(codes.get(c));
        return sb.toString();
    }

    public static String decode(String encoded, Node root) {
        if (encoded == null || encoded.isEmpty() || root == null) return "";
        StringBuilder result = new StringBuilder();
        Node node = root;
        for (char bit : encoded.toCharArray()) {
            node = bit == '0' ? node.left : node.right;
            if (node != null && node.isLeaf) {
                result.append(node.ch);
                node = root;
            }
        }
        return result.toString();
    }

    // ── Compress summary ─────────────────────────────────────────────────────

    public static int[] compressionStats(String text) {
        Node root = buildTree(text);
        Map<Character, String> codes = buildCodes(root);
        String encoded = encode(text, codes);
        int originalBits   = text.length() * 8;
        int compressedBits = encoded.length();
        return new int[]{ originalBits, compressedBits };
    }
}
