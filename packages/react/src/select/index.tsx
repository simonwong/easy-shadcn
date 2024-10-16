import React, { ComponentProps, ReactNode, useEffect } from 'react';
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react';
import { cn } from '@easy-shadcn/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../components/ui/command';
import { Button, ButtonProps } from '../button';

type BaseOption = {
  value: string | number;
  label: string;
};

export interface SelectProps<OPT extends BaseOption, IsMultiple extends boolean> {
  placeholder?: ReactNode;
  buttonProps?: ButtonProps;
  showSearch?: boolean;
  searchProps?: ComponentProps<typeof CommandInput>;
  contentProps?: ComponentProps<typeof PopoverContent>;
  empty?: ReactNode;
  options: OPT[];
  value?: IsMultiple extends true ? OPT['value'][] : OPT['value'];
  width?: number | string;
  onChange?: (val?: IsMultiple extends true ? OPT['value'][] : OPT['value'], opt?: OPT) => void;
  allowClear?: boolean;
  multiple?: IsMultiple;
}

export const Select = <OPT extends BaseOption, IsMultiple extends boolean = false>({
  placeholder,
  buttonProps,
  showSearch,
  searchProps,
  contentProps,
  empty,
  options,
  value,
  onChange,
  width,
  allowClear,
  multiple,
}: SelectProps<OPT, IsMultiple>) => {
  const [open, setOpen] = React.useState(false);
  const [innerValue, setInnerValue] = React.useState<
    (IsMultiple extends true ? OPT['value'][] : OPT['value']) | undefined
  >(value);
  const [innerOption, setInnerOption] = React.useState<
    (IsMultiple extends true ? OPT[] : OPT) | undefined
  >(
    (Array.isArray(value)
      ? options.filter((opt) => value.includes(opt.value))
      : options.find((opt) => opt.value === value)) as IsMultiple extends true ? OPT[] : OPT
  );

  useEffect(() => {
    setInnerValue(value);
    setInnerOption(
      (Array.isArray(value)
        ? options.filter((opt) => value.includes(opt.value))
        : options.find((opt) => opt.value === value)) as IsMultiple extends true ? OPT[] : OPT
    );
  }, [value, options]);

  const selectedLabelNode = React.useMemo(() => {
    if (innerOption) {
      if (Array.isArray(innerOption)) {
        if (innerOption.length > 0) {
          return innerOption.map((opt) => opt.label).join(',');
        }
      } else {
        return innerOption.label;
      }
    }
    return placeholder || null;
  }, [innerOption, placeholder]);

  const handleSelect = (opt: OPT) => {
    if (multiple === true) {
      const newValue = Array.isArray(innerValue)
        ? innerValue.includes(opt.value)
          ? innerValue.filter((v) => v !== opt.value)
          : [...innerValue, opt.value]
        : [opt.value];
      const newOpt = Array.isArray(innerOption)
        ? innerOption.some((o) => o.value === opt.value)
          ? innerOption.filter((o) => o.value !== opt.value)
          : [...innerOption, opt]
        : [opt];
      setInnerValue(newValue as IsMultiple extends true ? OPT['value'][] : OPT['value']);
      setInnerOption(newOpt as IsMultiple extends true ? OPT[] : OPT);
      onChange?.(newValue as IsMultiple extends true ? OPT['value'][] : OPT['value'], opt);
    } else {
      if (opt.value === innerValue) {
        return;
      }
      setInnerValue(opt.value as IsMultiple extends true ? OPT['value'][] : OPT['value']);
      setInnerOption(opt as IsMultiple extends true ? OPT[] : OPT);
      onChange?.(opt.value as IsMultiple extends true ? OPT['value'][] : OPT['value'], opt);
      setOpen(false);
    }
  };

  const hasSelected = !!innerValue && Array.isArray(innerValue) && innerValue.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          {...buttonProps}
          className={cn('justify-between flex items-center group', buttonProps?.className)}
          style={{
            width,
            ...buttonProps?.style,
          }}
        >
          <span className="flex-1 truncate text-left">{selectedLabelNode}</span>
          <span className="relative">
            <ChevronsUpDownIcon className={cn('ml-2 size-4 shrink-0 text-gray-500')} />
            {allowClear && hasSelected && (
              <span className="absolute left-0 top-0 ml-2 hidden size-4 items-center justify-center rounded-full bg-slate-400 hover:bg-slate-500 group-hover:flex">
                <XIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    setInnerValue(undefined);
                    setInnerOption(undefined);
                    onChange?.(undefined, undefined);
                  }}
                  className={cn('size-3 shrink-0 text-white')}
                />
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        {...contentProps}
        style={{
          minWidth: width,
        }}
        className={cn('p-0 w-auto', contentProps?.className)}
      >
        <Command>
          {showSearch && <CommandInput {...searchProps} />}
          <CommandList>
            <CommandEmpty>{empty || 'No Data.'}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value as string}
                  onSelect={() => handleSelect(opt)}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      (
                        Array.isArray(innerValue)
                          ? innerValue.includes(opt.value)
                          : innerValue === opt.value
                      )
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
