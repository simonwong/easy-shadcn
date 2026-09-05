# Table sorting changes presentation, not source identity

Table owns optional single-column sorting because callers otherwise rebuild header controls, direction state, and accessible feedback while retaining Table's existing selection state. A column comparator sorts supplied records locally; `sorter: true` emits intent and leaves remote ordering to the caller. A second mode flag or data-table dependency would duplicate that declaration.

Sorting reorders a copy of row metadata after identity and source indices are resolved. All index callbacks, selection records, and bulk-selection key ordering retain their `dataSource` semantics, including stable equal-value ordering in both directions. Display indices would silently change function-based row keys and existing callback behavior. Missing or ambiguous sort columns suspend effective sorting without discarding the stored intent or emitting reconciliation callbacks.
