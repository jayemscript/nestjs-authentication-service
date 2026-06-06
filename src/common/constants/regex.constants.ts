//src/common/constants/regex.constants.ts
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,

  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,

  PHONE: /^[\d\s\-\+\(\)]{10,}$/,

  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,

  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,

  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,

  NUMERIC: /^\d+$/,

  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};