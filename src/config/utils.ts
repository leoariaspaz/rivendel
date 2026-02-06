export const envToBool = (value?: string, defaultValue = false): boolean => {
  if (value === undefined) return defaultValue;
  return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
};

export const envToNumber = (value?: string, defaultValue?: number): number | undefined => {
  if (value === undefined) return defaultValue;
  const n = Number(value);
  return Number.isNaN(n) ? defaultValue : n;
};
