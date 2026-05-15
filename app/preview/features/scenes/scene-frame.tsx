import type { ReactNode } from "react";

export interface SceneFrameProps {
  children: ReactNode;
  components: string[];
  id?: string;
  no: string;
  subtitle: string;
  title: string;
}

export function SceneFrame({
  children,
  components,
  id,
  no,
  subtitle,
  title,
}: SceneFrameProps) {
  return (
    <section className="border-border border-t py-12" id={id}>
      <div className="mx-auto max-w-5xl px-6">
        <header className="mb-6 flex flex-col gap-1">
          <p className="text-muted-foreground text-xs">Scene {no}</p>
          <h2 className="font-semibold text-2xl tracking-tight">{title}</h2>
          <p className="mt-1 text-muted-foreground text-sm">{subtitle}</p>
          <p className="mt-1 text-muted-foreground text-xs">
            Components: {components.join(" · ")}
          </p>
        </header>
        {children}
      </div>
    </section>
  );
}
