"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/registry/ui/slider";

const Demo = () => {
  const [temperature, setTemperature] = useState(20);
  const [priceRange, setPriceRange] = useState([20, 80]);
  const [submitted, setSubmitted] = useState("not submitted");

  return (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
      <section className="space-y-3">
        <h3 className="font-medium text-sm">Basic</h3>
        <Slider defaultValue={40} label="Volume" />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Controlled</h3>
        <Slider
          label="Temperature"
          max={50}
          min={-20}
          onValueChange={setTemperature}
          step={5}
          value={temperature}
        />
        <p className="text-muted-foreground text-xs">
          Controlled value: {temperature}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Custom bounds and steps</h3>
        <Slider
          defaultValue={100}
          label="Zoom"
          largeStep={50}
          max={200}
          min={50}
          step={10}
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Multi-thumb range</h3>
        <Slider
          form="slider-form"
          label="Price range"
          minStepsBetweenValues={5}
          multiple
          name="price-range"
          onValueChange={setPriceRange}
          thumbCollisionBehavior="none"
          thumbLabels={["Minimum price", "Maximum price"]}
          value={priceRange}
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Hidden value</h3>
        <Slider defaultValue={65} label="Opacity" showValue={false} />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Disabled</h3>
        <Slider defaultValue={30} disabled label="Unavailable volume" />
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-sm">Vertical</h3>
        <Slider
          className="h-40"
          defaultValue={60}
          label="Vertical volume"
          orientation="vertical"
        />
      </section>

      <section className="space-y-3 sm:col-span-2">
        <h3 className="font-medium text-sm">Native form</h3>
        <form
          className="space-y-3"
          id="slider-form"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const volume = String(data.get("form-volume") ?? "missing");
            const range = data.getAll("price-range").join(" – ");
            setSubmitted(`${volume}; range: ${range}`);
          }}
        >
          <Slider defaultValue={35} label="Form volume" name="form-volume" />
          <Button size="sm" type="submit" variant="outline">
            Submit form
          </Button>
          <p
            aria-live="polite"
            className="text-muted-foreground text-xs"
            role="status"
          >
            Submitted value: {submitted}
          </p>
        </form>
      </section>
    </div>
  );
};

export default Demo;
