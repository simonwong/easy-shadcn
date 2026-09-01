import type { AlertProps } from "./alert";

declare const acceptProps: (props: AlertProps) => undefined;

acceptProps({
  "aria-label": "Deployment status",
  action: <button type="button">Undo</button>,
  actionClassName: ["action-x", false],
  description: "Available now.",
  descriptionClassName: ["description-x", null],
  icon: <svg aria-hidden="true" />,
  id: "deployment-alert",
  title: <span>Deployed</span>,
  titleClassName: ["title-x", undefined],
  variant: "destructive",
});

// @ts-expect-error Alert owns its child structure through flat content props.
acceptProps({ children: "Bypass" });

// @ts-expect-error Raw HTML conflicts with Compose-owned descendants.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" } });

// @ts-expect-error Alert owns the root alert role.
acceptProps({ role: "status" });

// @ts-expect-error The primitive root slot is Compose-owned.
acceptProps({ "data-slot": "bypass" });
