package greedy;

import java.util.*;

/**
 * Activity Selection Problem
 *
 * Greedy strategy: always pick the activity that finishes earliest.
 *
 * Time Complexity:  O(n log n) — sorting dominates
 * Space Complexity: O(n)
 */
public class ActivitySelection {

    public static class Activity {
        public final String name;
        public final int start;
        public final int finish;

        public Activity(int start, int finish) {
            this("", start, finish);
        }

        public Activity(String name, int start, int finish) {
            this.name   = name;
            this.start  = start;
            this.finish = finish;
        }

        @Override
        public String toString() {
            return name.isEmpty()
                ? String.format("(%d,%d)", start, finish)
                : String.format("%s(%d,%d)", name, start, finish);
        }
    }

    /**
     * Select the maximum number of non-overlapping activities.
     * Returns the selected activities in order.
     */
    public static List<Activity> select(List<Activity> activities) {
        if (activities == null || activities.isEmpty()) return Collections.emptyList();

        // Sort by finish time — the greedy choice
        List<Activity> sorted = new ArrayList<>(activities);
        sorted.sort(Comparator.comparingInt(a -> a.finish));

        List<Activity> selected = new ArrayList<>();
        selected.add(sorted.get(0));
        int lastFinish = sorted.get(0).finish;

        for (int i = 1; i < sorted.size(); i++) {
            Activity act = sorted.get(i);
            if (act.start >= lastFinish) {
                selected.add(act);
                lastFinish = act.finish;
            }
        }

        return selected;
    }
}
