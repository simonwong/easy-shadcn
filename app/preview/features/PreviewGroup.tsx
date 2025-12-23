import type React from "react";

export interface PreviewGroupProps {
  children: React.ReactNode;
}

export const PreviewGroup: React.FC<PreviewGroupProps> = ({ children }) => {
  return <div className="space-x-2 space-y-2 p-4">{children}</div>;
};
