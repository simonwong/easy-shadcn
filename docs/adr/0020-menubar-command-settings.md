# Menubar delegates interaction and separates command identity from settings

Menubar owns a finite application-command tree over shadcn's Base UI Menubar. It delegates menu switching, keyboard navigation, focus, positioning, and dismissal to the primitives. Persistent navigation remains Menu's responsibility; Menubar does not share its renderer or selection state.

Tree entries use stable `key` identity, following Menu's tree vocabulary. Radio options use `value`, and radio groups expose `value` / `onValueChange` for the selected setting. Keeping identity separate avoids overloading `value` with both a group's identity and its selection. Top-level content is `trigger`; command content is `content`, matching DropdownMenu and the rendered primitive roles.

Checkbox and radio settings are controlled by the caller. Popup descendants unmount on close, so primitive-local defaults would silently reset settings between openings. Required `checked` / `value` makes persistence explicit without introducing a second setting store. Setting changes leave menus open; normal actions close them. Callbacks retain Base UI's cancellable event details. Shortcut hints are decorative and do not install global handlers.

Arbitrary markup, links, custom popup policy, controlled opening, async execution state, and custom portals remain primitive composition. The basic use case requires only `items`; settings and nested menus remain optional item variants.
