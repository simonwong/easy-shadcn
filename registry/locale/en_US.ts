import { enUS as DateEnUS } from 'date-fns/locale';
import type { Locale } from './interface';

const enUS: Locale = {
  locale: 'en',
  AlertModal: {
    okText: 'OK',
    cancelText: 'Cancel',
  },
  Select: {
    empty: 'No Data',
  },
  Calendar: DateEnUS,
};

export default enUS;
