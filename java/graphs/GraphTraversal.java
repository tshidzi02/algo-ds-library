package graphs;

import java.util.*;

/**
 * Graph Traversal: DFS & BFS
 *
 * Graph represented as an adjacency list.
 *
 * DFS (Depth-First Search)
 *   Time Complexity:  O(V + E)
 *   Space Complexity: O(V) — visited set + stack
 *
 * BFS (Breadth-First Search)
 *   Time Complexity:  O(V + E)
 *   Space Complexity: O(V) — visited set + queue
 */
public class GraphTraversal {

    private final Map<String, List<String>> adjacencyList;

    public GraphTraversal() {
        this.adjacencyList = new LinkedHashMap<>();
    }

    /** Add an undirected edge between two nodes. */
    public void addEdge(String a, String b) {
        adjacencyList.computeIfAbsent(a, k -> new ArrayList<>()).add(b);
        adjacencyList.computeIfAbsent(b, k -> new ArrayList<>()).add(a);
    }

    /** Add a node with no edges. */
    public void addNode(String node) {
        adjacencyList.putIfAbsent(node, new ArrayList<>());
    }

    // ── DFS Recursive ────────────────────────────────────────────────────────

    /**
     * DFS using recursion.
     * Explores as deep as possible before backtracking.
     * Returns nodes in visit order.
     */
    public List<String> dfsRecursive(String start) {
        List<String> result = new ArrayList<>();
        Set<String> visited = new HashSet<>();
        dfsHelper(start, visited, result);
        return result;
    }

    private void dfsHelper(String node, Set<String> visited, List<String> result) {
        visited.add(node);
        result.add(node);
        for (String neighbour : adjacencyList.getOrDefault(node, Collections.emptyList())) {
            if (!visited.contains(neighbour)) {
                dfsHelper(neighbour, visited, result);
            }
        }
    }

    // ── DFS Iterative ────────────────────────────────────────────────────────

    /**
     * DFS using an explicit stack.
     * Returns nodes in visit order.
     */
    public List<String> dfsIterative(String start) {
        List<String> result = new ArrayList<>();
        Set<String> visited = new HashSet<>();
        Deque<String> stack = new ArrayDeque<>();
        stack.push(start);

        while (!stack.isEmpty()) {
            String node = stack.pop();
            if (!visited.contains(node)) {
                visited.add(node);
                result.add(node);
                List<String> neighbours = adjacencyList.getOrDefault(node, Collections.emptyList());
                // Push in reverse to preserve left-to-right order
                for (int i = neighbours.size() - 1; i >= 0; i--) {
                    if (!visited.contains(neighbours.get(i))) {
                        stack.push(neighbours.get(i));
                    }
                }
            }
        }
        return result;
    }

    // ── BFS ──────────────────────────────────────────────────────────────────

    /**
     * BFS using a queue.
     * Explores all neighbours at current depth before going deeper.
     * Returns nodes in visit order.
     */
    public List<String> bfs(String start) {
        List<String> result = new ArrayList<>();
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();

        visited.add(start);
        queue.add(start);

        while (!queue.isEmpty()) {
            String node = queue.poll();
            result.add(node);
            for (String neighbour : adjacencyList.getOrDefault(node, Collections.emptyList())) {
                if (!visited.contains(neighbour)) {
                    visited.add(neighbour);
                    queue.add(neighbour);
                }
            }
        }
        return result;
    }

    /**
     * BFS shortest path between start and end.
     * Returns the path as a list of nodes, or an empty list if no path exists.
     */
    public List<String> bfsShortestPath(String start, String end) {
        if (start.equals(end)) return List.of(start);

        Set<String> visited = new HashSet<>();
        Queue<List<String>> queue = new LinkedList<>();
        queue.add(new ArrayList<>(List.of(start)));
        visited.add(start);

        while (!queue.isEmpty()) {
            List<String> path = queue.poll();
            String node = path.get(path.size() - 1);

            for (String neighbour : adjacencyList.getOrDefault(node, Collections.emptyList())) {
                if (!visited.contains(neighbour)) {
                    List<String> newPath = new ArrayList<>(path);
                    newPath.add(neighbour);
                    if (neighbour.equals(end)) return newPath;
                    visited.add(neighbour);
                    queue.add(newPath);
                }
            }
        }
        return Collections.emptyList(); // No path found
    }
}
