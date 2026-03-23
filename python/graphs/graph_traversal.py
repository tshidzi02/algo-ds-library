"""
Graph Traversal: DFS & BFS
---------------------------
Graphs are represented as adjacency lists:
    graph = {
        'A': ['B', 'C'],
        'B': ['A', 'D'],
        ...
    }

DFS (Depth-First Search)
------------------------
Time Complexity:  O(V + E)  — V = vertices, E = edges
Space Complexity: O(V)      — visited set + recursion stack

BFS (Breadth-First Search)
--------------------------
Time Complexity:  O(V + E)
Space Complexity: O(V)      — visited set + queue
"""

from collections import deque


# ─── DFS ────────────────────────────────────────────────────────────────────

def dfs_recursive(graph: dict, start: str, visited: set = None) -> list:
    """
    Depth-First Search using recursion.
    Explores as deep as possible before backtracking.
    Returns list of nodes in visit order.
    """
    if visited is None:
        visited = set()

    visited.add(start)
    result = [start]

    for neighbour in graph.get(start, []):
        if neighbour not in visited:
            result.extend(dfs_recursive(graph, neighbour, visited))

    return result


def dfs_iterative(graph: dict, start: str) -> list:
    """
    Depth-First Search using an explicit stack.
    Equivalent traversal to recursive DFS.
    Returns list of nodes in visit order.
    """
    visited = set()
    stack = [start]
    result = []

    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            result.append(node)
            # Push neighbours in reverse so left-to-right order is preserved
            for neighbour in reversed(graph.get(node, [])):
                if neighbour not in visited:
                    stack.append(neighbour)

    return result


# ─── BFS ────────────────────────────────────────────────────────────────────

def bfs(graph: dict, start: str) -> list:
    """
    Breadth-First Search using a queue.
    Explores all neighbours at the current depth before going deeper.
    Returns list of nodes in visit order.
    """
    visited = {start}
    queue = deque([start])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node)

        for neighbour in graph.get(node, []):
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append(neighbour)

    return result


def bfs_shortest_path(graph: dict, start: str, end: str) -> list | None:
    """
    BFS to find the shortest path between start and end.
    Returns the path as a list of nodes, or None if no path exists.
    """
    if start == end:
        return [start]

    visited = {start}
    queue = deque([[start]])

    while queue:
        path = queue.popleft()
        node = path[-1]

        for neighbour in graph.get(node, []):
            if neighbour not in visited:
                new_path = path + [neighbour]
                if neighbour == end:
                    return new_path
                visited.add(neighbour)
                queue.append(new_path)

    return None  # No path found
