import * as React from "react";
import type { LocaleContextProps } from "../locale/context";
import LocaleContext from "../locale/context";
import defaultLocaleData from "../locale/en_US";
import type { Locale } from "../locale/interface";

export type LocaleComponentName = Exclude<keyof Locale, "locale">;

const useLocale = <C extends LocaleComponentName = LocaleComponentName>(
  componentName: C,
  defaultLocale?: Locale[C] | (() => Locale[C])
): readonly [NonNullable<Locale[C]>, string] => {
  const fullLocale = React.useContext<LocaleContextProps | undefined>(
    LocaleContext
  );

  const locale = React.useMemo<NonNullable<Locale[C]>>(() => {
    const defLocale = defaultLocale || defaultLocaleData[componentName];
    const localeFromContext = fullLocale?.[componentName] ?? {};
    return {
      ...(typeof defLocale === "function" ? defLocale() : defLocale),
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
