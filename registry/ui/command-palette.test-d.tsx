import type {
  CommandPaletteAction,
  CommandPaletteGroup,
  CommandPaletteProps,
} from "./command-palette";

declare const acceptProps: (props: CommandPaletteProps) => undefined;
declare const acceptAction: (action: CommandPaletteAction) => undefined;
declare const acceptGroup: (group: CommandPaletteGroup) => undefined;

const action: CommandPaletteAction = {
  className: ["action-x", false],
  description: <span>Creates a project</span>,
  disabled: false,
  icon: <span>+</span>,
  keywords: ["new", "workspace"],
  label: "Create project",
  onSelect: async () => undefined,
  shortcut: "⌘N",
  value: "create-project",
};

const group: CommandPaletteGroup = {
  className: ["group-x", null],
  headingClassName: ["heading-x", undefined],
  items: [action],
  label: "Projects",
  type: "group",
  value: "projects",
};

const actionWithOwnedHandlers = {
  ...action,
  onKeyUp: () => undefined,
  onPointerUp: () => undefined,
};
// @ts-expect-error Event handlers cannot cross the item ownership seam through variables.
acceptAction(actionWithOwnedHandlers);

const groupWithOwnedSemantics = {
  ...group,
  "aria-describedby": "forged-description",
  "data-selected": "true",
};
// @ts-expect-error ARIA and state data cannot cross the group ownership seam through variables.
acceptGroup(groupWithOwnedSemantics);

const propsWithControlledQuery = {
  items: [action],
  onValueChange: () => undefined,
  query: "project",
};
// @ts-expect-error Controlled query props cannot cross the root ownership seam through variables.
acceptProps(propsWithControlledQuery);

acceptProps({ items: [action] });
acceptProps({
  className: ["palette-x", false],
  defaultOpen: false,
  description: <span>Find a command.</span>,
  descriptionClassName: "description-x",
  emptyClassName: "empty-x",
  emptyMessage: <span>Nothing found.</span>,
  errorClassName: "error-x",
  errorMessage: <span>Try again.</span>,
  groupClassName: "group-x",
  headingClassName: "heading-x",
  hotkey: false,
  inputClassName: "input-x",
  inputLabel: "Find commands",
  itemClassName: "item-x",
  items: [action, group],
  listClassName: "list-x",
  loadingClassName: "loading-x",
  loadingMessage: <span>Running.</span>,
  loop: false,
  onOpenChange: (_open) => undefined,
  open: true,
  placeholder: "Search...",
  shortcutClassName: "shortcut-x",
  title: <span>Commands</span>,
  trigger: <button type="button">Open</button>,
});

// @ts-expect-error Items are the only required field.
acceptProps({});

// @ts-expect-error Trigger composition requires one React element.
acceptProps({ items: [], trigger: "Open" });

// @ts-expect-error Compose owns generated children.
acceptProps({ children: <span>Bypass</span>, items: [] });

// @ts-expect-error Raw HTML conflicts with generated children.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" }, items: [] });

// @ts-expect-error Root element replacement is fixed.
acceptProps({ items: [], render: <section /> });

// @ts-expect-error Dialog semantics are fixed.
acceptProps({ items: [], role: "alertdialog" });

// @ts-expect-error Primitive prop bags bypass explicit ownership.
acceptProps({ dialogProps: {}, items: [] });

// @ts-expect-error Slot objects bypass the flat Interface.
acceptProps({ items: [], slots: {} });

// @ts-expect-error Query state stays internal.
acceptProps({ items: [], query: "project" });

// @ts-expect-error Active-item state stays primitive-owned.
acceptProps({ activeValue: "create", items: [] });

// @ts-expect-error Custom filters stay on the Primitive.
acceptProps({ filter: () => 1, items: [] });

// @ts-expect-error Custom hotkey chords are excluded.
acceptProps({ hotkey: "mod+p", items: [] });

// @ts-expect-error Remote item sources are excluded.
acceptProps({ items: [], loadItems: async () => [] });

// @ts-expect-error Pending state is derived from action Promises.
acceptProps({ items: [], loading: true });

acceptProps({
  items: [
    {
      label: "Missing identity",
      onSelect: () => undefined,
      // @ts-expect-error Action identity is required.
      value: undefined,
    },
  ],
});

acceptProps({
  items: [
    {
      // @ts-expect-error Labels are readable strings.
      label: <span>Create</span>,
      onSelect: () => undefined,
      value: "create",
    },
  ],
});

acceptProps({
  items: [
    {
      label: "Create",
      // @ts-expect-error Action callback takes no arguments.
      onSelect: (_value: string) => undefined,
      value: "create",
    },
  ],
});

acceptProps({
  items: [
    {
      label: "Create",
      onSelect: () => undefined,
      // @ts-expect-error DOM handlers cannot replace item activation.
      onClick: () => undefined,
      value: "create",
    },
  ],
});

acceptProps({
  items: [
    {
      label: "Create",
      onSelect: () => undefined,
      // @ts-expect-error Item rendering is fixed.
      render: <button type="button" />,
      value: "create",
    },
  ],
});

acceptProps({
  items: [
    {
      items: [
        // @ts-expect-error Groups are exactly one level deep.
        { items: [], label: "Nested", type: "group", value: "nested" },
      ],
      label: "Top",
      type: "group",
      value: "top",
    },
  ],
});

acceptProps({
  items: [
    {
      // @ts-expect-error Group descendants are generated.
      children: <span>Bypass</span>,
      items: [],
      label: "Projects",
      type: "group",
      value: "projects",
    },
  ],
});
