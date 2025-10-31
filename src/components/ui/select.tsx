import * as React from "react";

export type SelectRootProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  children?: React.ReactNode;
};

export const Select: React.FC<SelectRootProps> = ({ value, defaultValue, onValueChange, children }) => (
  <select value={value} defaultValue={defaultValue} onChange={(e) => onValueChange?.(e.target.value)}>
    {children}
  </select>
);

export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = (p) => <div {...p} />;
export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = (p) => <div {...p} />;
export const SelectItem: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = (p) => <li {...p} />;
export const SelectValue: React.FC<{ placeholder?: string } & React.HTMLAttributes<HTMLSpanElement>> = ({ placeholder, ...p }) => (
  <span {...p}>{p.children ?? placeholder ?? ""}</span>
);


