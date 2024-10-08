import React, { ComponentProps, ReactNode } from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@easy-shadcn/utils'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../components/ui/command'
import { Button, ButtonProps } from '../button'

type BaseOption = {
  value: string,
  label: string,
}

export interface SelectProps<OPT extends BaseOption> {
  placeholder?: ReactNode
  buttonProps?: ButtonProps
  showSearch?: boolean
  searchProps?: ComponentProps<typeof CommandInput>
  contentProps?: ComponentProps<typeof PopoverContent>
  empty?: ReactNode
  options: OPT[],
  value?: OPT['value'],
  width?: number | string,
  onChange?: (val?: OPT['value'], opt?: OPT) => void
  allowClear?: boolean
}

export const Select = <OPT extends BaseOption>({
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
  allowClear = true,
}: SelectProps<OPT>) => {
  const [open, setOpen] = React.useState(false)
  const [innerValue, setInnerValue] = React.useState<OPT['value'] | undefined>(undefined)
  const relValue = value || innerValue

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          {...buttonProps}
          className={cn("justify-between", buttonProps?.className)}
          style={{
            width,
            ...buttonProps?.style
          }}
        >
          {relValue
            ? options.find((opt) => opt.value === relValue)?.label
            : placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        {...contentProps}
        style={{
          minWidth: width,
        }}
        className={cn("p-0 w-auto", contentProps?.className)}
      >
        <Command>
          {
            showSearch && (
              <CommandInput {...searchProps} />
            )
          }
          <CommandList>
            <CommandEmpty>{empty || 'No Data.'}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value as string}
                  onSelect={(currentValue) => {
                    if (allowClear && currentValue === relValue) {
                      onChange?.(undefined, undefined)
                      setInnerValue(undefined)
                    } else {
                      setInnerValue(currentValue)
                      onChange?.(currentValue, opt)
                    }
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      relValue === opt.value ? "opacity-100" : "opacity-0"
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
  )
}
