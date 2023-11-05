export type ApiResponse = { value: number };

export type WucValueResponse = {
  data: WucValue | undefined | null;
  error?: string;
};

export const CURRENCIES = ["USD", "GBP", "EUR", "CNY", "JPY"] as const;

export const SYMBOLS: Record<Currency, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  CNY: "¥",
  JPY: "¥",
};

export type Currency = (typeof CURRENCIES)[number];

export type WucValue = {
  currency: Currency;
  value: number;
};
