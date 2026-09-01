import type { InputGroupProps } from "./input-group";

declare const acceptProps: (props: InputGroupProps) => undefined;

acceptProps({
  "aria-label": "Domain",
  className: ["root-x", false],
  defaultValue: "example",
  endAddon: ".com",
  endAddonClassName: ["end-x", null],
  inputClassName: ["input-x", undefined],
  name: "domain",
  onChange: (event) => event.currentTarget.value,
  ref: (node) => node?.select(),
  startAddon: "https://",
  startAddonClassName: ["start-x", false],
});

// @ts-expect-error InputGroup owns its child structure.
acceptProps({ children: <input /> });

// @ts-expect-error Raw HTML is invalid for the owned void input.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" } });

// @ts-expect-error The primitive slot marker is Compose-owned.
acceptProps({ "data-slot": "bypass" });
