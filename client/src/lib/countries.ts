import rawCountries from "country-list/data.json";

type CountryOption = {
  code: string;
  name: string;
};

const COUNTRY_NAME_OVERRIDES: Record<string, string> = {
  AE: "United Arab Emirates",
  BO: "Bolivia",
  BS: "Bahamas",
  CC: "Cocos (Keeling) Islands",
  CD: "Democratic Republic of the Congo",
  CF: "Central African Republic",
  CG: "Republic of the Congo",
  DO: "Dominican Republic",
  FM: "Micronesia",
  GB: "United Kingdom",
  GM: "Gambia",
  IO: "British Indian Ocean Territory",
  IR: "Iran",
  KP: "North Korea",
  KR: "South Korea",
  LA: "Laos",
  MD: "Moldova",
  MH: "Marshall Islands",
  MP: "Northern Mariana Islands",
  NL: "Netherlands",
  PH: "Philippines",
  PS: "Palestine",
  RU: "Russia",
  SH: "Saint Helena, Ascension and Tristan da Cunha",
  SX: "Sint Maarten",
  SY: "Syria",
  TF: "French Southern Territories",
  TW: "Taiwan",
  TZ: "Tanzania",
  UM: "United States Minor Outlying Islands",
  US: "United States",
  VA: "Vatican City",
  VE: "Venezuela",
  VG: "British Virgin Islands",
  VI: "U.S. Virgin Islands",
};

const collator = new Intl.Collator("en", { sensitivity: "base" });

export const COUNTRIES: CountryOption[] = (rawCountries as CountryOption[])
  .map(({ code, name }) => ({
    code,
    name: COUNTRY_NAME_OVERRIDES[code] ?? name,
  }))
  .sort((a, b) => collator.compare(a.name, b.name));

const COUNTRY_MAP = new Map(COUNTRIES.map((country) => [country.code, country.name]));

export function normalizeCountryCode(value?: string | null): string | null {
  if (!value) return null;

  const code = value.trim().toUpperCase();
  return COUNTRY_MAP.has(code) ? code : null;
}

export function getCountryName(code?: string | null): string | null {
  const normalized = normalizeCountryCode(code);
  if (!normalized) return null;

  return COUNTRY_MAP.get(normalized) ?? null;
}
