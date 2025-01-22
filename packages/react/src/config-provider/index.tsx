import React, { PropsWithChildren, useContext } from 'react';
import LocaleContext, { LocaleContextProps } from '../locale/context';
import { Modal } from '../modal';

export type ConfigContextProps = {
  locale?: LocaleContextProps;
};

const ConfigContext = React.createContext<ConfigContextProps>({});

export const useConfigContext = () => {
  return useContext(ConfigContext);
};

export const ConfigProvider = ({ children, ...props }: PropsWithChildren<ConfigContextProps>) => {
  return (
    <ConfigContext.Provider value={{ ...props }}>
      <LocaleContext.Provider value={props.locale}>
        <Modal.Provider>{children}</Modal.Provider>
      </LocaleContext.Provider>
    </ConfigContext.Provider>
  );
};
