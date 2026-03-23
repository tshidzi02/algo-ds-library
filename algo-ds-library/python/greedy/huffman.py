"""
Huffman Coding
--------------
A greedy algorithm for lossless data compression. Characters that appear
more frequently are assigned shorter binary codes.

Greedy Strategy:
    Always merge the two nodes with the lowest frequencies first.
    This guarantees the optimal prefix-free binary encoding.

Time Complexity:  O(n log n) — n insertions and extractions from a min-heap
Space Complexity: O(n)       — heap and code table
"""

import heapq
from dataclasses import dataclass, field
from typing import Optional


@dataclass(order=True)
class HuffmanNode:
    freq: int
    char: Optional[str] = field(default=None, compare=False)
    left:  Optional['HuffmanNode'] = field(default=None, compare=False)
    right: Optional['HuffmanNode'] = field(default=None, compare=False)

    def is_leaf(self) -> bool:
        return self.left is None and self.right is None


def build_huffman_tree(text: str) -> Optional[HuffmanNode]:
    """
    Build the Huffman tree for the given text.
    Returns the root node, or None if text is empty.
    """
    if not text:
        return None

    # Step 1: Count character frequencies
    freq_map = {}
    for ch in text:
        freq_map[ch] = freq_map.get(ch, 0) + 1

    # Step 2: Build a min-heap of leaf nodes
    heap = [HuffmanNode(freq=f, char=c) for c, f in freq_map.items()]
    heapq.heapify(heap)

    # Edge case: single unique character
    if len(heap) == 1:
        node = heapq.heappop(heap)
        return HuffmanNode(freq=node.freq, left=node)

    # Step 3: Greedy merge — always combine the two lowest-frequency nodes
    while len(heap) > 1:
        left  = heapq.heappop(heap)
        right = heapq.heappop(heap)
        merged = HuffmanNode(
            freq=left.freq + right.freq,
            left=left,
            right=right
        )
        heapq.heappush(heap, merged)

    return heap[0]


def build_codes(root: Optional[HuffmanNode]) -> dict:
    """
    Traverse the Huffman tree and generate binary codes for each character.
    Left edge = '0', Right edge = '1'.
    Returns a dict mapping character → binary code string.
    """
    if root is None:
        return {}

    codes = {}

    def traverse(node: HuffmanNode, code: str):
        if node.is_leaf():
            codes[node.char] = code if code else '0'
            return
        if node.left:
            traverse(node.left, code + '0')
        if node.right:
            traverse(node.right, code + '1')

    traverse(root, '')
    return codes


def encode(text: str, codes: dict) -> str:
    """Encode text using the Huffman codes. Returns binary string."""
    return ''.join(codes[ch] for ch in text)


def decode(encoded: str, root: HuffmanNode) -> str:
    """Decode a binary string back to text using the Huffman tree."""
    if not encoded or root is None:
        return ''

    result = []
    node = root

    for bit in encoded:
        node = node.left if bit == '0' else node.right
        if node.is_leaf():
            result.append(node.char)
            node = root

    return ''.join(result)


def huffman_compress(text: str) -> dict:
    """
    Full compression pipeline.
    Returns a summary dict with codes, encoded string, and compression stats.
    """
    if not text:
        return {}

    root  = build_huffman_tree(text)
    codes = build_codes(root)
    encoded = encode(text, codes)

    original_bits  = len(text) * 8
    compressed_bits = len(encoded)
    ratio = round((1 - compressed_bits / original_bits) * 100, 1)

    return {
        'codes':           codes,
        'encoded':         encoded,
        'root':            root,
        'original_bits':   original_bits,
        'compressed_bits': compressed_bits,
        'compression_pct': ratio,
    }
