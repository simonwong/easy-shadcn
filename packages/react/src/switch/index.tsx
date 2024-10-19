import { ComponentProps, ReactNode, useState } from 'react';
import { cn } from '@easy-shadcn/utils';
import { Switch as InternalSwitch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';

export interface SwitchProps extends ComponentProps<typeof InternalSwitch> {
  label?: ReactNode;
  labelProps?: ComponentProps<typeof Label>;
  wrapperClassName?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  labelProps,
  wrapperClassName,
  checked,
  defaultChecked,
  onCheckedChange,
  ...restProps
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const isChecked = checked ?? internalChecked;
  const handleChange = (checked: boolean) => {
    onCheckedChange?.(checked);
    setInternalChecked(checked);
  };

  return (
    <div className={cn('flex items-center space-x-2', wrapperClassName)}>
      <InternalSwitch checked={isChecked} onCheckedChange={handleChange} {...restProps} />
      {label && (
        <Label
          onClick={() => {
            handleChange(!isChecked);
          }}
          {...labelProps}
        >
          {label}
        </Label>
      )}
    </div>
  );
};
