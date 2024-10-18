import { allDocs } from 'contentlayer/generated';
import { DocsSidebarNav } from '@/components/sidebar-nav';

interface DocsLayoutProps {
  children: React.ReactNode;
}

function getComponentMenuItems() {
  return allDocs
    .filter((item) => item.slugAsParams.startsWith('components/'))
    .map((item) => ({
      title: item.title,
      href: `/docs/${item.slugAsParams}`,
    }));
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  const componentMenuItems = getComponentMenuItems();

  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <aside className="size-full">
        <div className="h-full py-6 pr-6 lg:py-8">
          <DocsSidebarNav
            config={[
              {
                title: 'Getting Started',
                items: [
                  {
                    title: 'Introduction',
                    href: '/docs/guide',
                  },
                  {
                    title: 'Installation',
                    href: '/docs/guide/installation',
                  },
                ],
              },
              {
                title: 'Components',
                items: componentMenuItems,
              },
            ]}
          />
        </div>
      </aside>
      {children}
    </div>
  );
}
