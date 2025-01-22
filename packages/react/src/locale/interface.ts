import { Locale as DateLocale } from 'date-fns';

export interface Locale {
  locale: string;
  AlertModal: {
    okText: string;
    cancelText: string;
  };
  Select: {
    empty: string;
  };
  Calendar: DateLocale;
}
