import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from greedy.activity_selection import activity_selection, activity_selection_with_names
from greedy.huffman import build_huffman_tree, build_codes, encode, decode, huffman_compress


# ── Activity Selection ───────────────────────────────────────────────────────

class TestActivitySelection(unittest.TestCase):

    def test_basic_case(self):
        acts = [(1,4), (3,5), (0,6), (5,7), (3,9), (5,9), (6,10), (8,11)]
        result = activity_selection(acts)
        self.assertEqual(len(result), 3)

    def test_no_overlap(self):
        # All activities are non-overlapping — should select all
        acts = [(0,1), (2,3), (4,5), (6,7)]
        self.assertEqual(len(activity_selection(acts)), 4)

    def test_all_overlap(self):
        # All overlap with each other — should select only 1
        acts = [(0,10), (1,9), (2,8), (3,7)]
        self.assertEqual(len(activity_selection(acts)), 1)

    def test_empty_input(self):
        self.assertEqual(activity_selection([]), [])

    def test_single_activity(self):
        self.assertEqual(activity_selection([(2, 5)]), [(2, 5)])

    def test_result_is_non_overlapping(self):
        acts = [(1,4), (3,5), (0,6), (5,7), (3,9), (5,9), (6,10), (8,11)]
        result = activity_selection(acts)
        for i in range(len(result) - 1):
            self.assertGreaterEqual(result[i + 1][0], result[i][1])

    def test_unsorted_input(self):
        # Should handle unsorted input correctly
        acts = [(8,11), (1,4), (5,7), (0,6)]
        result = activity_selection(acts)
        self.assertEqual(len(result), 3)

    def test_adjacent_activities(self):
        # Finish time of one == start time of next — should both be selected
        acts = [(0,2), (2,4), (4,6)]
        self.assertEqual(len(activity_selection(acts)), 3)

    def test_with_names(self):
        acts = [
            {'name': 'A', 'start': 1, 'finish': 4},
            {'name': 'B', 'start': 3, 'finish': 5},
            {'name': 'C', 'start': 5, 'finish': 7},
        ]
        result = activity_selection_with_names(acts)
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]['name'], 'A')
        self.assertEqual(result[1]['name'], 'C')


# ── Huffman Coding ───────────────────────────────────────────────────────────

class TestHuffman(unittest.TestCase):

    def test_codes_generated(self):
        codes = build_codes(build_huffman_tree("hello"))
        self.assertIn('h', codes)
        self.assertIn('e', codes)
        self.assertIn('l', codes)
        self.assertIn('o', codes)

    def test_frequent_char_shorter_code(self):
        # 'l' appears twice, others once — 'l' should have shorter or equal code
        codes = build_codes(build_huffman_tree("hello"))
        self.assertLessEqual(len(codes['l']), len(codes['h']))

    def test_encode_decode_roundtrip(self):
        text = "hello world"
        root = build_huffman_tree(text)
        codes = build_codes(root)
        encoded = encode(text, codes)
        decoded = decode(encoded, root)
        self.assertEqual(decoded, text)

    def test_encode_decode_long_text(self):
        text = "the quick brown fox jumps over the lazy dog"
        root = build_huffman_tree(text)
        codes = build_codes(root)
        self.assertEqual(decode(encode(text, codes), root), text)

    def test_single_char_text(self):
        text = "aaaa"
        result = huffman_compress(text)
        self.assertEqual(decode(result['encoded'], result['root']), text)

    def test_compression_reduces_size(self):
        # Repeated characters should compress well
        text = "aaaaaabbbbccdd"
        result = huffman_compress(text)
        self.assertLess(result['compressed_bits'], result['original_bits'])

    def test_all_codes_unique(self):
        codes = build_codes(build_huffman_tree("abcdefgh"))
        values = list(codes.values())
        self.assertEqual(len(values), len(set(values)))

    def test_codes_are_prefix_free(self):
        # No code should be a prefix of another (fundamental Huffman property)
        codes = build_codes(build_huffman_tree("abracadabra"))
        code_list = list(codes.values())
        for i, c1 in enumerate(code_list):
            for j, c2 in enumerate(code_list):
                if i != j:
                    self.assertFalse(
                        c2.startswith(c1),
                        f"Code '{c1}' is a prefix of '{c2}' — not prefix-free!"
                    )

    def test_empty_text(self):
        self.assertIsNone(build_huffman_tree(""))
        self.assertEqual(huffman_compress(""), {})

    def test_compression_stats_present(self):
        result = huffman_compress("hello world")
        self.assertIn('compression_pct', result)
        self.assertIn('original_bits', result)
        self.assertIn('compressed_bits', result)


if __name__ == "__main__":
    unittest.main()
