import { Calendar as InternalCalendar, type CalendarProps } from '../../components/ui/calendar';
import useLocale from '../locale/useLocale';

export const Calendar: React.FC<CalendarProps> = (props) => {
  const [locale] = useLocale('Calendar');

  return <InternalCalendar locale={locale} {...props} />;
};

export type { CalendarProps };
