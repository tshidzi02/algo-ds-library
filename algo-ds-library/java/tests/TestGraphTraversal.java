package tests;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;
import java.util.*;
import graphs.GraphTraversal;

/**
 * Test suite for GraphTraversal (DFS recursive, DFS iterative, BFS, BFS shortest path).
 *
 * Test graph:
 *     A --- B --- D
 *     |     |
 *     C --- E --- F
 *
 * Compile:
 *   javac -cp ".;lib/junit-4.13.2.jar" -d out java/graphs/*.java java/tests/TestGraphTraversal.java
 * Run:
 *   java -cp "out;lib/junit-4.13.2.jar;lib/hamcrest-core-1.3.jar" org.junit.runner.JUnitCore tests.TestGraphTraversal
 */
public class TestGraphTraversal {

    private GraphTraversal graph;
    private GraphTraversal disconnected;

    @Before
    public void setUp() {
        // Main graph: A-B-C-D-E-F
        graph = new GraphTraversal();
        graph.addEdge("A", "B");
        graph.addEdge("A", "C");
        graph.addEdge("B", "D");
        graph.addEdge("B", "E");
        graph.addEdge("C", "E");
        graph.addEdge("E", "F");

        // Disconnected: A-B and C-D are separate
        disconnected = new GraphTraversal();
        disconnected.addEdge("A", "B");
        disconnected.addEdge("C", "D");
    }

    // ── DFS Recursive ────────────────────────────────────────────────────────

    @Test
    public void dfsRecursive_visitsAllNodes() {
        List<String> result = graph.dfsRecursive("A");
        assertEquals(6, result.size());
        assertTrue(result.containsAll(Arrays.asList("A","B","C","D","E","F")));
    }

    @Test
    public void dfsRecursive_startNodeFirst() {
        assertEquals("A", graph.dfsRecursive("A").get(0));
    }

    @Test
    public void dfsRecursive_noDuplicates() {
        List<String> result = graph.dfsRecursive("A");
        assertEquals(result.size(), new HashSet<>(result).size());
    }

    @Test
    public void dfsRecursive_disconnectedOnlyVisitsComponent() {
        List<String> result = disconnected.dfsRecursive("A");
        assertEquals(2, result.size());
        assertTrue(result.containsAll(Arrays.asList("A","B")));
    }

    @Test
    public void dfsRecursive_singleNode() {
        GraphTraversal g = new GraphTraversal();
        g.addNode("X");
        assertEquals(List.of("X"), g.dfsRecursive("X"));
    }

    // ── DFS Iterative ────────────────────────────────────────────────────────

    @Test
    public void dfsIterative_visitsAllNodes() {
        List<String> result = graph.dfsIterative("A");
        assertEquals(6, result.size());
        assertTrue(result.containsAll(Arrays.asList("A","B","C","D","E","F")));
    }

    @Test
    public void dfsIterative_startNodeFirst() {
        assertEquals("A", graph.dfsIterative("A").get(0));
    }

    @Test
    public void dfsIterative_noDuplicates() {
        List<String> result = graph.dfsIterative("A");
        assertEquals(result.size(), new HashSet<>(result).size());
    }

    @Test
    public void dfsIterative_matchesRecursive() {
        List<String> recursive = graph.dfsRecursive("A");
        List<String> iterative = graph.dfsIterative("A");
        Collections.sort(recursive);
        Collections.sort(iterative);
        assertEquals(recursive, iterative);
    }

    @Test
    public void dfsIterative_disconnectedOnlyVisitsComponent() {
        List<String> result = disconnected.dfsIterative("A");
        assertEquals(2, result.size());
        assertTrue(result.containsAll(Arrays.asList("A","B")));
    }

    // ── BFS ──────────────────────────────────────────────────────────────────

    @Test
    public void bfs_visitsAllNodes() {
        List<String> result = graph.bfs("A");
        assertEquals(6, result.size());
        assertTrue(result.containsAll(Arrays.asList("A","B","C","D","E","F")));
    }

    @Test
    public void bfs_startNodeFirst() {
        assertEquals("A", graph.bfs("A").get(0));
    }

    @Test
    public void bfs_levelOrder() {
        List<String> result = graph.bfs("A");
        // B and C (level 1) must appear before D, E, F (level 2+)
        assertTrue(result.indexOf("B") < result.indexOf("D"));
        assertTrue(result.indexOf("C") < result.indexOf("F"));
    }

    @Test
    public void bfs_noDuplicates() {
        List<String> result = graph.bfs("A");
        assertEquals(result.size(), new HashSet<>(result).size());
    }

    @Test
    public void bfs_disconnectedOnlyVisitsComponent() {
        List<String> result = disconnected.bfs("A");
        assertEquals(2, result.size());
        assertTrue(result.containsAll(Arrays.asList("A","B")));
    }

    // ── BFS Shortest Path ─────────────────────────────────────────────────────

    @Test
    public void bfsShortestPath_directNeighbour() {
        assertEquals(Arrays.asList("A","B"), graph.bfsShortestPath("A","B"));
    }

    @Test
    public void bfsShortestPath_twoHops() {
        assertEquals(Arrays.asList("A","B","D"), graph.bfsShortestPath("A","D"));
    }

    @Test
    public void bfsShortestPath_sameNode() {
        assertEquals(List.of("A"), graph.bfsShortestPath("A","A"));
    }

    @Test
    public void bfsShortestPath_noPath() {
        assertTrue(disconnected.bfsShortestPath("A","C").isEmpty());
    }

    @Test
    public void bfsShortestPath_isShortestNotJustAny() {
        List<String> path = graph.bfsShortestPath("A","F");
        assertNotNull(path);
        assertEquals("A", path.get(0));
        assertEquals("F", path.get(path.size()-1));
        assertTrue(path.size() <= 4);
    }
}
