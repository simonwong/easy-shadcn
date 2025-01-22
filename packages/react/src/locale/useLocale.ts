import * as React from 'react';

import type { Locale } from './interface';
import type { LocaleContextProps } from './context';
import LocaleContext from './context';
import defaultLocaleData from './en_US';

export type LocaleComponentName = Exclude<keyof Locale, 'locale'>;

const useLocale = <C extends LocaleComponentName = LocaleComponentName>(
  componentName: C,
  defaultLocale?: Locale[C] | (() => Locale[C])
): readonly [NonNullable<Locale[C]>, string] => {
  const fullLocale = React.useContext<LocaleContextProps | undefined>(LocaleContext);

  const locale = React.useMemo<NonNullable<Locale[C]>>(() => {
    const locale = defaultLocale || defaultLocaleData[componentName];
    const localeFromContext = fullLocale?.[componentName] ?? {};
    return {
      ...(typeof locale === 'function' ? locale() : locale),
      ...(localeFromContext || {}),
    };
  }, [componentName, defaultLocale, fullLocale]);

  const localeLanguageCode = React.useMemo<string>(() => {
    const localeCode = fullLocale?.locale;
    return localeCode!;
  }, [fullLocale]);

  return [locale, localeLanguageCode] as const;
};

export default useLocale;
