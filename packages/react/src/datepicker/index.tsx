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
import { useConfigContext } from '../config-provider';

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

  const singleProps = {
    mode: 'single',
    selected: (selected as Date) || singleDate,
    onSelect: (onSelect as SelectSingleEventHandler) || setSingleDate,
  } satisfies DayPickerSingleProps;

  const multiProps = {
    mode: 'multiple',
    selected: (selected as Date[]) || multiDate,
    onSelect: (onSelect as SelectMultipleEventHandler) || setMultiDate,
  } satisfies DayPickerMultipleProps;

  const rangeProps = {
    mode: 'range',
    selected: (selected as DateRange) || rangeDate,
    onSelect: (onSelect as SelectRangeEventHandler) || setRangeDate,
  } satisfies DayPickerRangeProps;

  const modeMap = {
    single: {
      props: singleProps,
      hasValue: !!singleProps.selected,
      renderText: () => {
        return singleProps.selected ? format(singleProps.selected, dateFormat) : null;
      },
    },
    multiple: {
      props: multiProps,
      hasValue: multiProps.selected && multiProps.selected.length > 0,
      renderText: () => {
        return multiProps.selected
          ? multiProps.selected.map((dt) => format(dt, dateFormat)).join(', ')
          : null;
      },
    },
    range: {
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
    },
  };

  return modeMap[mode];
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
  const { dateLocal } = useConfigContext();
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
      content={<Calendar initialFocus locale={dateLocal} {...resetProps} {...allMode.props} />}
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
        {allMode.renderText() || <span>{placeholder}</span>}
      </Button>
    </Popover>
  );
};
