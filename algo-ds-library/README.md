# Algorithm & Data Structures Library

A dual-language library of core CS algorithms implemented in Python and Java.

## Algorithms Covered
- **Sorting:** Quicksort, Merge Sort
- **Searching:** Binary Search *(Week 2)*
- **Graph Traversal:** DFS, BFS *(Week 3)*
- **Strategies:** Dynamic Programming, Recursion, Greedy *(Weeks 4–5)*

## Project Structure
```
algo-ds-library/
├── python/
│   ├── sorting/
│   │   ├── quicksort.py
│   │   └── merge_sort.py
│   └── tests/
│       └── test_sorting.py
├── java/
│   ├── sorting/
│   │   ├── Quicksort.java
│   │   └── MergeSort.java
│   └── tests/
│       └── TestSorting.java
└── README.md
```

## Complexity Summary

| Algorithm  | Best       | Average    | Worst      | Space     |
|------------|------------|------------|------------|-----------|
| Quicksort  | O(n log n) | O(n log n) | O(n²)      | O(log n)  |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n)      |

## Running Tests

### Python
```bash
cd algo-ds-library
pip install pytest
python -m pytest python/tests/ -v
```

### Java
```bash
# Download JUnit 4 jars first, then:
javac -cp .:junit-4.13.2.jar -d out java/sorting/*.java java/tests/*.java
java -cp out:junit-4.13.2.jar:hamcrest-core-1.3.jar org.junit.runner.JUnitCore tests.TestSorting
```

## Requirements
- Python 3.10+
- Java 17+
- pytest
- JUnit 4
