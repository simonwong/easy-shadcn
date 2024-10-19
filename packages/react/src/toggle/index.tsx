import React, { ComponentProps, ReactNode } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../../components/ui/toggle-group';

export type ToggleProps = {
  options: ({
    value: string;
    label: ReactNode;
  } & ComponentProps<typeof ToggleGroupItem>)[];
} & ComponentProps<typeof ToggleGroup>;

export const Toggle: React.FC<ToggleProps> = ({ options, ...resetProps }) => {
  return (
    <ToggleGroup {...resetProps}>
      {options.map(({ value, label, ...resetOpt }) => (
        <ToggleGroupItem key={value} value={value} {...resetOpt}>
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
