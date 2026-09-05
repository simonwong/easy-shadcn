# Table pagination owns visible membership, not remote data

Table uses an explicit external pagination mode because a supplied total cannot reliably distinguish a complete dataset from an already-paginated page. Local pagination slices after sorting and limits header selection to visible eligible rows, while selected-record callbacks retain source-array order across all supplied records. Sorting preserves the current page instead of emitting a second state change, so a refused controlled sort cannot move the page; callers needing a reset update controlled sort and page together.
