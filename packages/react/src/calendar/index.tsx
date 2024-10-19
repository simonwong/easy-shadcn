import { useConfigContext } from '../config-provider';
import { Calendar as InternalCalendar, type CalendarProps } from '../../components/ui/calendar';

export const Calendar: React.FC<CalendarProps> = (props) => {
  const { dateLocal } = useConfigContext();

  console.log('props', props);
  return <InternalCalendar locale={dateLocal} {...props} />;
};

export type { CalendarProps };
