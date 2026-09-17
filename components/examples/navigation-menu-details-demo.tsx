"use client";

import { NavigationMenu } from "@/registry/ui/navigation-menu";

export default function NavigationMenuDetailsDemo() {
  return (
    <NavigationMenu
      aria-label="Documentation navigation"
      items={[
        {
          value: "guide",
          trigger: "Guide",
          items: [
            {
              value: "navigation-menu",
              content: "Navigation Menu",
              description: "Website links and dropdowns from one items array.",
              href: "#link-details",
              active: true,
            },
            {
              value: "sidebar",
              content: "Sidebar",
              description:
                "An application frame with desktop and mobile navigation.",
              href: "/docs/components/sidebar",
            },
          ],
        },
        {
          value: "github",
          content: "GitHub ↗",
          href: "https://github.com/simonwong/easy-shadcn",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      ]}
    />
  );
}
