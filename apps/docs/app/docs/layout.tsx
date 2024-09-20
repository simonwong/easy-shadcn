import { DocsSidebarNav } from "@/components/sidebar-nav"

interface DocsLayoutProps {
  children: React.ReactNode
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <aside className="w-full h-full">
        <div className="h-full py-6 pr-6 lg:py-8">
          <DocsSidebarNav
            config={[
              {
                title: 'Getting Started',
                items: [
                  {
                    title: 'Introduction',
                    href: "/docs/guide",
                  },
                  {
                    title: 'Installation',
                    href: "/docs/guide/installation",
                  }
                ]
              },
              {
                title: 'Components',
                items: [
                  {
                    title: 'Button',
                    href: "/docs/components/button",
                  },
                  {
                    title: 'Card',
                    href: "/docs/components/card",
                  },
                  {
                    title: 'Calendar',
                    href: "/docs/components/calendar",
                  },
                  {
                    title: 'DatePicker',
                    href: "/docs/components/datepicker",
                  },
                  {
                    title: 'DropdownMenu',
                    href: "/docs/components/dropdown-menu",
                  },
                  {
                    title: 'Modal',
                    href: "/docs/components/modal",
                  },
                  {
                    title: 'Popover',
                    href: "/docs/components/popover",
                  },
                  {
                    title: 'Tabs',
                    href: "/docs/components/tabs",
                  },
                  {
                    title: 'Toast',
                    href: "/docs/components/toast",
                  },
                  {
                    title: 'Tooltip',
                    href: "/docs/components/tooltip",
                  },
                  {
                    title: 'Toggle',
                    href: "/docs/components/toggle",
                  },
                  {
                    title: 'ConfigProvider',
                    href: "/docs/components/config-provider",
                  },
                ]
              },
            ]}
          />
        </div>
      </aside>
      {children}
    </div>
  )
}
