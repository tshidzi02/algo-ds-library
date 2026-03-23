"""
Activity Selection Problem
---------------------------
Given n activities each with a start and finish time, select the maximum
number of activities that can be performed by a single person, assuming
that a person can only work on one activity at a time.

Greedy Strategy:
    Always pick the activity that finishes earliest — this leaves the most
    room for subsequent activities.

Time Complexity:  O(n log n) — dominated by sorting
Space Complexity: O(n)       — storing selected activities
"""


def activity_selection(activities: list[tuple]) -> list[tuple]:
    """
    Select the maximum number of non-overlapping activities.

    Args:
        activities: List of (start, finish) tuples.

    Returns:
        List of selected (start, finish) tuples in order.

    Example:
        activities = [(1,4), (3,5), (0,6), (5,7), (3,9), (5,9), (6,10), (8,11)]
        → [(1,4), (5,7), (8,11)]
    """
    if not activities:
        return []

    # Sort by finish time — the core greedy decision
    sorted_activities = sorted(activities, key=lambda x: x[1])

    selected = [sorted_activities[0]]
    last_finish = sorted_activities[0][1]

    for start, finish in sorted_activities[1:]:
        # Greedy: take the activity if it starts after the last one finishes
        if start >= last_finish:
            selected.append((start, finish))
            last_finish = finish

    return selected


def activity_selection_with_names(activities: list[dict]) -> list[dict]:
    """
    Activity selection with named activities for readability.

    Args:
        activities: List of {'name': str, 'start': int, 'finish': int} dicts.

    Returns:
        List of selected activity dicts.
    """
    if not activities:
        return []

    sorted_acts = sorted(activities, key=lambda x: x['finish'])
    selected = [sorted_acts[0]]
    last_finish = sorted_acts[0]['finish']

    for act in sorted_acts[1:]:
        if act['start'] >= last_finish:
            selected.append(act)
            last_finish = act['finish']

    return selected
