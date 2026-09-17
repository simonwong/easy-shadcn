"use client";

import { NavigationMenu } from "@/registry/ui/navigation-menu";

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu
      items={[
        {
          value: "components",
          trigger: "Components",
          items: [
            { value: "card", content: "Card", href: "/docs/components/card" },
            { value: "tabs", content: "Tabs", href: "/docs/components/tabs" },
            {
              value: "table",
              content: "Table",
              href: "/docs/components/table",
            },
          ],
        },
        {
          value: "resources",
          trigger: "Resources",
          items: [
            {
              value: "install",
              content: "Installation",
              href: "/docs/installation",
            },
            {
              value: "menubar",
              content: "Application menus",
              href: "/docs/components/menubar",
            },
          ],
        },
        { value: "preview", content: "Preview", href: "/preview" },
      ]}
    />
  );
}
