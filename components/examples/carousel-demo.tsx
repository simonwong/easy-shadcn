"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  type CarouselApi,
  type CarouselItem,
} from "@/registry/ui/carousel";

const PROJECTS: CarouselItem[] = [
  { item: "Transit map", value: "transit-map" },
  { item: "Station board", value: "station-board" },
  { item: "Route planner", value: "route-planner" },
];

const useSelectedSlide = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedSlide, setSelectedSlide] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const syncSelectedSlide = () => setSelectedSlide(api.selectedScrollSnap());
    syncSelectedSlide();
    api.on("reInit", syncSelectedSlide);
    api.on("select", syncSelectedSlide);

    return () => {
      api.off("reInit", syncSelectedSlide);
      api.off("select", syncSelectedSlide);
    };
  }, [api]);

  return { selectedSlide, setApi };
};

const Slide = ({ children }: { children: string }) => (
  <div className="flex h-40 items-center justify-center rounded-xl border bg-muted/40 font-medium text-lg">
    {children}
  </div>
);

const Demo = () => {
  const horizontal = useSelectedSlide();
  const vertical = useSelectedSlide();

  return (
    <div className="grid w-full max-w-4xl gap-12 lg:grid-cols-2">
      <section className="space-y-4 px-12">
        <h3 className="font-medium text-sm">Horizontal</h3>
        <Carousel
          aria-label="Featured projects"
          className="mx-auto w-full max-w-sm"
          itemClassName="basis-4/5"
          items={PROJECTS.map((project) => ({
            ...project,
            item: <Slide>{String(project.item)}</Slide>,
            itemClassName:
              project.value === "station-board" ? "basis-full" : undefined,
          }))}
          setApi={horizontal.setApi}
          tabIndex={0}
        />
        <p
          aria-live="polite"
          className="text-center text-muted-foreground text-xs"
          data-carousel-status="horizontal"
          role="status"
        >
          Slide {horizontal.selectedSlide + 1} of {PROJECTS.length}
        </p>
      </section>

      <section className="space-y-4 px-12 py-12">
        <h3 className="font-medium text-sm">Vertical</h3>
        <Carousel
          aria-label="Project timeline"
          className="mx-auto w-full max-w-sm"
          contentClassName="h-40"
          items={PROJECTS.map((project) => ({
            ...project,
            item: <Slide>{String(project.item)}</Slide>,
          }))}
          opts={{ align: "start", loop: true }}
          orientation="vertical"
          setApi={vertical.setApi}
        />
        <p
          aria-live="polite"
          className="text-center text-muted-foreground text-xs"
          data-carousel-status="vertical"
          role="status"
        >
          Slide {vertical.selectedSlide + 1} of {PROJECTS.length}
        </p>
      </section>

      <section className="space-y-4 px-12 lg:col-span-2">
        <h3 className="font-medium text-sm">Single item</h3>
        <Carousel
          aria-label="Featured release"
          className="mx-auto w-full max-w-sm"
          items={[
            {
              item: <Slide>Version 2.0</Slide>,
              value: "version-2",
            },
          ]}
        />
        <p className="text-center text-muted-foreground text-xs">
          One slide keeps its landmark and omits both controls.
        </p>
      </section>
    </div>
  );
};

export default Demo;
