import React from 'react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { cn } from '@easy-shadcn/utils';
import { format } from 'date-fns';

import {
  DateRange,
  DayPickerMultipleProps,
  DayPickerRangeProps,
  DayPickerSingleProps,
  SelectMultipleEventHandler,
  SelectRangeEventHandler,
  SelectSingleEventHandler,
} from 'react-day-picker';
import { Popover } from '../popover';
import { Button } from '../button';
import { Calendar } from '../calendar';

type DatePickerMode = 'single' | 'multiple' | 'range';

export type DatePickerProps = {
  placeholder?: string;
  buttonClassName?: string;
  dateFormat?: string;
  mode?: DatePickerMode;
} & (
  | (Omit<DayPickerSingleProps, 'mode'> & { mode?: 'single' })
  | DayPickerMultipleProps
  | DayPickerRangeProps
);

const useAllModeProps = ({
  mode,
  dateFormat,
  selected,
  onSelect,
}: {
  mode: DatePickerMode;
  dateFormat: string;
  selected?: DatePickerProps['selected'];
  onSelect?: DatePickerProps['onSelect'];
}) => {
  const [singleDate, setSingleDate] = React.useState<Date>();
  const [multiDate, setMultiDate] = React.useState<Date[]>();
  const [rangeDate, setRangeDate] = React.useState<DateRange>();

  switch (mode) {
    case 'single': {
      const singleProps = {
        mode: 'single',
        selected: (selected as Date) || singleDate,
        defaultMonth: (selected as Date) || singleDate,
        onSelect: (onSelect as SelectSingleEventHandler) || setSingleDate,
      } satisfies DayPickerSingleProps;
      return {
        props: singleProps,
        hasValue: !!singleProps.selected,
        renderText: () => {
          return singleProps.selected ? format(singleProps.selected, dateFormat) : null;
        },
      };
    }
    case 'multiple': {
      const multiProps = {
        mode: 'multiple',
        selected: (selected as Date[]) || multiDate,
        defaultMonth: ((selected as Date[]) || multiDate)?.at(-1),
        onSelect: (onSelect as SelectMultipleEventHandler) || setMultiDate,
      } satisfies DayPickerMultipleProps;
      return {
        props: multiProps,
        hasValue: multiProps.selected && multiProps.selected.length > 0,
        renderText: () => {
          return multiProps.selected
            ? multiProps.selected.map((dt) => format(dt, dateFormat)).join(', ')
            : null;
        },
      };
    }
    case 'range': {
      const rangeProps = {
        mode: 'range',
        selected: (selected as DateRange) || rangeDate,
        defaultMonth: ((selected as DateRange) || rangeDate)?.to,
        onSelect: (onSelect as SelectRangeEventHandler) || setRangeDate,
      } satisfies DayPickerRangeProps;
      return {
        props: rangeProps,
        hasValue: !!rangeProps.selected && !!rangeProps.selected.from,
        renderText: () => {
          return rangeProps.selected ? (
            rangeProps.selected.from ? (
              rangeProps.selected.to ? (
                <>
                  {format(rangeProps.selected.from, dateFormat)} -{' '}
                  {format(rangeProps.selected.to, dateFormat)}
                </>
              ) : (
                format(rangeProps.selected.from, dateFormat)
              )
            ) : null
          ) : null;
        },
      };
    }
    default:
      return {};
  }
};

export const DatePicker: React.FC<DatePickerProps> = ({
  placeholder = 'Pick a date',
  mode = 'single',
  dateFormat = 'yyyy-MM-dd',
  buttonClassName,
  selected,
  onSelect,
  ...resetProps
}) => {
  const allMode = useAllModeProps({
    mode,
    dateFormat,
    selected,
    onSelect,
  });

  return (
    <Popover
      contentProps={{
        className: 'w-auto p-0',
        align: 'start',
      }}
      content={<Calendar initialFocus {...resetProps} {...allMode.props} />}
    >
      <Button
        variant={'outline'}
        className={cn(
          'justify-start text-left font-normal',
          !allMode.hasValue && 'text-muted-foreground',
          buttonClassName
        )}
      >
        <CalendarIcon className="mr-2 size-4" />
        {allMode.renderText?.() || <span>{placeholder}</span>}
      </Button>
    </Popover>
  );
};
