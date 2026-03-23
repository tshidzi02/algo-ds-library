import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from graphs.graph_traversal import dfs_recursive, dfs_iterative, bfs, bfs_shortest_path

# Shared test graph:
#
#     A --- B --- D
#     |     |
#     C --- E --- F
#
GRAPH = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'E'],
    'D': ['B'],
    'E': ['B', 'C', 'F'],
    'F': ['E'],
}

# Disconnected graph
DISCONNECTED = {
    'A': ['B'],
    'B': ['A'],
    'C': ['D'],
    'D': ['C'],
}


class TestDFSRecursive(unittest.TestCase):

    def test_visits_all_nodes(self):
        result = dfs_recursive(GRAPH, 'A')
        self.assertEqual(sorted(result), ['A', 'B', 'C', 'D', 'E', 'F'])

    def test_start_node_first(self):
        result = dfs_recursive(GRAPH, 'A')
        self.assertEqual(result[0], 'A')

    def test_single_node_graph(self):
        self.assertEqual(dfs_recursive({'X': []}, 'X'), ['X'])

    def test_linear_graph(self):
        graph = {'A': ['B'], 'B': ['C'], 'C': []}
        self.assertEqual(dfs_recursive(graph, 'A'), ['A', 'B', 'C'])

    def test_disconnected_only_visits_component(self):
        result = dfs_recursive(DISCONNECTED, 'A')
        self.assertEqual(sorted(result), ['A', 'B'])

    def test_no_duplicates(self):
        result = dfs_recursive(GRAPH, 'A')
        self.assertEqual(len(result), len(set(result)))


class TestDFSIterative(unittest.TestCase):

    def test_visits_all_nodes(self):
        result = dfs_iterative(GRAPH, 'A')
        self.assertEqual(sorted(result), ['A', 'B', 'C', 'D', 'E', 'F'])

    def test_start_node_first(self):
        result = dfs_iterative(GRAPH, 'A')
        self.assertEqual(result[0], 'A')

    def test_single_node_graph(self):
        self.assertEqual(dfs_iterative({'X': []}, 'X'), ['X'])

    def test_disconnected_only_visits_component(self):
        result = dfs_iterative(DISCONNECTED, 'A')
        self.assertEqual(sorted(result), ['A', 'B'])

    def test_no_duplicates(self):
        result = dfs_iterative(GRAPH, 'A')
        self.assertEqual(len(result), len(set(result)))

    def test_matches_recursive(self):
        self.assertEqual(
            sorted(dfs_iterative(GRAPH, 'A')),
            sorted(dfs_recursive(GRAPH, 'A'))
        )


class TestBFS(unittest.TestCase):

    def test_visits_all_nodes(self):
        result = bfs(GRAPH, 'A')
        self.assertEqual(sorted(result), ['A', 'B', 'C', 'D', 'E', 'F'])

    def test_start_node_first(self):
        result = bfs(GRAPH, 'A')
        self.assertEqual(result[0], 'A')

    def test_level_order(self):
        # From A: level 1 = B, C — level 2 = D, E — level 3 = F
        result = bfs(GRAPH, 'A')
        self.assertLess(result.index('B'), result.index('D'))
        self.assertLess(result.index('C'), result.index('F'))

    def test_single_node_graph(self):
        self.assertEqual(bfs({'X': []}, 'X'), ['X'])

    def test_disconnected_only_visits_component(self):
        result = bfs(DISCONNECTED, 'A')
        self.assertEqual(sorted(result), ['A', 'B'])

    def test_no_duplicates(self):
        result = bfs(GRAPH, 'A')
        self.assertEqual(len(result), len(set(result)))


class TestBFSShortestPath(unittest.TestCase):

    def test_direct_neighbours(self):
        self.assertEqual(bfs_shortest_path(GRAPH, 'A', 'B'), ['A', 'B'])

    def test_two_hops(self):
        self.assertEqual(bfs_shortest_path(GRAPH, 'A', 'D'), ['A', 'B', 'D'])

    def test_same_start_end(self):
        self.assertEqual(bfs_shortest_path(GRAPH, 'A', 'A'), ['A'])

    def test_no_path(self):
        self.assertIsNone(bfs_shortest_path(DISCONNECTED, 'A', 'C'))

    def test_path_length_is_shortest(self):
        path = bfs_shortest_path(GRAPH, 'A', 'F')
        self.assertIsNotNone(path)
        self.assertEqual(path[0], 'A')
        self.assertEqual(path[-1], 'F')
        self.assertLessEqual(len(path), 4)


if __name__ == "__main__":
    unittest.main()
