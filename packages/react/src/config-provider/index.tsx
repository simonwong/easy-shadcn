import { Locale } from 'date-fns';
import React, { PropsWithChildren, useContext } from 'react';

export type ConfigContextProps = {
  dateLocal?: Locale;
};

const ConfigContext = React.createContext<ConfigContextProps>({});

export const useConfigContext = () => {
  return useContext(ConfigContext);
};

export const ConfigProvider = ({ children, ...props }: PropsWithChildren<ConfigContextProps>) => {
  return <ConfigContext.Provider value={{ ...props }}>{children}</ConfigContext.Provider>;
};
