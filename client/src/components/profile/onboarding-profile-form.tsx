import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { COUNTRIES, getCountryName } from "@/lib/countries";
import type { User } from "@/lib/banking/types";
import { cn } from "@/lib/utils";
import { AnimatedInputSection } from "@/components/profile/animated-input-section";

const TITLE_OPTIONS = ["Mr", "Ms", "Mrs", "Miss", "Dr", "Prof"];
const YEARS_TRADING_OPTIONS = ["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "Over 10 years"];
const TRADING_FREQUENCY_OPTIONS = ["Daily", "Weekly", "Monthly", "Quarterly", "Occasionally"];
const KNOWLEDGE_LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Expert", "Professional"];
const PREFERRED_MARKETS_OPTIONS = ["Forex", "Stocks", "Commodities", "Indices", "Cryptocurrencies"];
const TRADING_PLATFORM_OPTIONS = ["MetaTrader 4", "MetaTrader 5", "cTrader", "TradingView", "Other"];
const ANNUAL_INCOME_OPTIONS = ["Under 50k", "50k - 100k", "100k - 200k", "200k - 500k", "Over 500k"];
const INCOME_SOURCE_OPTIONS = ["Employment", "Self-Employment", "Investments", "Trading Profits", "Other"];

const ONBOARDING_STEPS = [
  { key: "personal", title: "Personal Information", progress: 0 },
  { key: "contact", title: "Contact and Address Information", progress: 16 },
  { key: "experience", title: "Trading Experience", progress: 39 },
  { key: "earnings", title: "Annual Earnings", progress: 58 },
  { key: "declaration", title: "Client Declaration", progress: 92 },
] as const;

const FIELD_LABELS: Record<keyof OnboardingFormValues, string> = {
  title: "Title",
  firstName: "First Name",
  lastName: "Last Name",
  dob: "Date of Birth",
  houseNo: "House No",
  streetAddress: "Street Address",
  city: "City",
  province: "Province",
  zipCode: "Zip Code",
  country: "Country",
  phone: "Phone",
  yearsTrading: "Years Trading",
  tradingFrequency: "Trading Frequency",
  instruments: "Instruments",
  knowledgeLevel: "Knowledge Level",
  preferredMarkets: "Preferred Markets",
  tradingPlatforms: "Trading Platforms",
  annualIncome: "Annual Income",
  incomeSource: "Income Source",
  taxResidency: "Tax Residency",
};

type OnboardingFormValues = {
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  houseNo: string;
  streetAddress: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
  phone: string;
  yearsTrading: string;
  tradingFrequency: string;
  instruments: string;
  knowledgeLevel: string;
  preferredMarkets: string;
  tradingPlatforms: string;
  annualIncome: string;
  incomeSource: string;
  taxResidency: string;
};

type OnboardingProfileFormProps = {
  user: User;
  saving: boolean;
  errorMessage: string | null;
  onSubmit: (values: OnboardingFormValues) => Promise<void>;
};

function buildInitialValues(user: User): OnboardingFormValues {
  return {
    title: user.title || "",
    firstName: user.firstName || user.name?.first || "",
    lastName: user.lastName || user.name?.last || "",
    dob: toIsoDate(user.dob || ""),
    houseNo: user.houseNo || "",
    streetAddress: user.streetAddress || "",
    city: user.city || "",
    province: user.province || "",
    zipCode: user.zipCode || "",
    country: user.countryCode || "US",
    phone: user.phone || "",
    yearsTrading: user.yearsTrading || "",
    tradingFrequency: user.tradingFrequency || "",
    instruments: user.instruments || "",
    knowledgeLevel: user.knowledgeLevel || "",
    preferredMarkets: user.preferredMarkets || "",
    tradingPlatforms: user.tradingPlatforms || "",
    annualIncome: user.annualIncome || "",
    incomeSource: user.incomeSource || "",
    taxResidency: user.taxResidency || user.countryCode || "US",
  };
}

function toIsoDate(value: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function isDobValid(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const day = Number(dayRaw);
  const month = Number(monthRaw);
  const year = Number(yearRaw);
  const candidate = new Date(year, month - 1, day);

  return (
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day &&
    candidate <= new Date()
  );
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium">
      {children} <span className="text-red-500">*</span>
    </Label>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function CountryField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50"
      >
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function OnboardingProfileForm({
  user,
  saving,
  errorMessage,
  onSubmit,
}: OnboardingProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<OnboardingFormValues>(() => buildInitialValues(user));
  const [attemptedSteps, setAttemptedSteps] = useState<Set<number>>(new Set());
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setValues(buildInitialValues(user));
  }, [user]);

  const currentProgress = ONBOARDING_STEPS[currentStep]?.progress ?? 0;

  const updateValue = <K extends keyof OnboardingFormValues>(key: K, value: OnboardingFormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const requiredByStep = useMemo(
    () => [
      ["firstName", "lastName", "dob"],
      ["houseNo", "streetAddress", "city", "province", "zipCode", "country", "phone"],
      [
        "yearsTrading",
        "tradingFrequency",
        "instruments",
        "knowledgeLevel",
        "preferredMarkets",
        "tradingPlatforms",
      ],
      ["annualIncome", "incomeSource", "taxResidency"],
      [],
    ] as Array<Array<keyof OnboardingFormValues>>,
    [],
  );

  const stepErrors = useMemo(() => {
    const errors: Partial<Record<keyof OnboardingFormValues, string>> = {};

    requiredByStep.flat().forEach((field) => {
      if (!values[field]?.trim()) {
        errors[field] = "This field is required.";
      }
    });

    if (values.dob.trim() && !isDobValid(values.dob.trim())) {
      errors.dob = "Enter a valid date of birth.";
    }

    return errors;
  }, [requiredByStep, values]);

  const isCurrentStepValid = requiredByStep[currentStep].every((field) => !stepErrors[field]);
  const hasAttemptedCurrentStep = attemptedSteps.has(currentStep);
  const currentStepErrors = requiredByStep[currentStep]
    .filter((field) => stepErrors[field])
    .map((field) => `${FIELD_LABELS[field]}: ${stepErrors[field]}`);
  const completedSteps = ONBOARDING_STEPS.map((_, index) => {
    const fields = requiredByStep[index];
    return fields.length === 0 || fields.every((field) => !stepErrors[field]);
  });

  const visibleFields = (() => {
    switch (currentStep) {
      case 0:
        return [
          {
            key: "title",
            node: (
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title
                </Label>
                <select
                  id="title"
                  value={values.title}
                  onChange={(event) => updateValue("title", event.target.value)}
                  autoComplete="honorific-prefix"
                  className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50"
                >
                  <option value="">Select title</option>
                  {TITLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ),
          },
          {
            key: "firstName",
            node: (
              <div className="space-y-2">
                <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                <Input
                  id="firstName"
                  value={values.firstName}
                  onChange={(event) => updateValue("firstName", event.target.value)}
                  autoComplete="given-name"
                  spellCheck={false}
                />
              </div>
            ),
          },
          {
            key: "lastName",
            node: (
              <div className="space-y-2">
                <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                <Input
                  id="lastName"
                  value={values.lastName}
                  onChange={(event) => updateValue("lastName", event.target.value)}
                  autoComplete="family-name"
                  spellCheck={false}
                />
              </div>
            ),
          },
          {
            key: "dob",
            node: (
              <div className="space-y-2">
                <FieldLabel htmlFor="dob">Date of Birth</FieldLabel>
                <Input
                  id="dob"
                  type="date"
                  value={values.dob}
                  onChange={(event) => updateValue("dob", event.target.value)}
                  max={TODAY_ISO}
                  autoComplete="bday"
                  aria-invalid={stepErrors.dob ? "true" : undefined}
                />
              </div>
            ),
          },
        ];
      case 1:
        return [
          {
            key: "houseNo",
            node: (
              <div className="space-y-2">
                <FieldLabel htmlFor="houseNo">House No</FieldLabel>
                <Input
                  id="houseNo"
                  value={values.houseNo}
                  onChange={(event) => updateValue("houseNo", event.target.value)}
                  autoComplete="address-line1"
                  spellCheck={false}
                />
              </div>
            ),
          },
          {
            key: "streetAddress",
            node: (
              <div className="space-y-2">
                <FieldLabel htmlFor="streetAddress">Street Address</FieldLabel>
                <Input
                  id="streetAddress"
                  value={values.streetAddress}
                  onChange={(event) => updateValue("streetAddress", event.target.value)}
                  autoComplete="street-address"
                  spellCheck={false}
                />
              </div>
            ),
          },
          {
            key: "city",
            node: (
              <div className="space-y-2">
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input
                  id="city"
                  value={values.city}
                  onChange={(event) => updateValue("city", event.target.value)}
                  autoComplete="address-level2"
                  spellCheck={false}
                />
              </div>
            ),
          },
          {
            key: "province",
            node: (
              <div className="space-y-2">
                <FieldLabel htmlFor="province">Province</FieldLabel>
                <Input
                  id="province"
                  value={values.province}
                  onChange={(event) => updateValue("province", event.target.value)}
                  autoComplete="address-level1"
                  spellCheck={false}
                />
              </div>
            ),
          },
          {
            key: "zipCode",
            node: (
              <div className="space-y-2">
                <FieldLabel htmlFor="zipCode">Zip Code</FieldLabel>
                <Input
                  id="zipCode"
                  value={values.zipCode}
                  onChange={(event) => updateValue("zipCode", event.target.value)}
                  autoComplete="postal-code"
                  spellCheck={false}
                />
              </div>
            ),
          },
          {
            key: "country",
            node: (
              <CountryField
                id="country"
                label="Country"
                value={values.country}
                onChange={(value) =>
                  setValues((previous) => ({
                    ...previous,
                    country: value,
                    taxResidency: value,
                  }))
                }
                autoComplete="country"
              />
            ),
          },
          {
            key: "phone",
            node: (
              <div className="space-y-2 md:col-span-2">
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  value={values.phone}
                  onChange={(event) => updateValue("phone", event.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  spellCheck={false}
                />
              </div>
            ),
          },
        ];
      case 2:
        return [
          {
            key: "yearsTrading",
            node: (
              <SelectField
                id="yearsTrading"
                label="Years Trading"
                value={values.yearsTrading}
                onChange={(value) => updateValue("yearsTrading", value)}
                options={YEARS_TRADING_OPTIONS}
              />
            ),
          },
          {
            key: "tradingFrequency",
            node: (
              <SelectField
                id="tradingFrequency"
                label="Trading Frequency"
                value={values.tradingFrequency}
                onChange={(value) => updateValue("tradingFrequency", value)}
                options={TRADING_FREQUENCY_OPTIONS}
              />
            ),
          },
          {
            key: "instruments",
            node: (
              <div className="space-y-2">
                <FieldLabel htmlFor="instruments">Instruments</FieldLabel>
                <Input
                  id="instruments"
                  value={values.instruments}
                  onChange={(event) => updateValue("instruments", event.target.value)}
                  placeholder="Forex, Stocks, Commodities"
                  spellCheck={false}
                />
              </div>
            ),
          },
          {
            key: "knowledgeLevel",
            node: (
              <SelectField
                id="knowledgeLevel"
                label="Knowledge Level"
                value={values.knowledgeLevel}
                onChange={(value) => updateValue("knowledgeLevel", value)}
                options={KNOWLEDGE_LEVEL_OPTIONS}
              />
            ),
          },
          {
            key: "preferredMarkets",
            node: (
              <SelectField
                id="preferredMarkets"
                label="Preferred Markets"
                value={values.preferredMarkets}
                onChange={(value) => updateValue("preferredMarkets", value)}
                options={PREFERRED_MARKETS_OPTIONS}
              />
            ),
          },
          {
            key: "tradingPlatforms",
            node: (
              <SelectField
                id="tradingPlatforms"
                label="Trading Platforms"
                value={values.tradingPlatforms}
                onChange={(value) => updateValue("tradingPlatforms", value)}
                options={TRADING_PLATFORM_OPTIONS}
              />
            ),
          },
        ];
      case 3:
        return [
          {
            key: "annualIncome",
            node: (
              <SelectField
                id="annualIncome"
                label="Annual Income"
                value={values.annualIncome}
                onChange={(value) => updateValue("annualIncome", value)}
                options={ANNUAL_INCOME_OPTIONS}
              />
            ),
          },
          {
            key: "incomeSource",
            node: (
              <SelectField
                id="incomeSource"
                label="Income Source"
                value={values.incomeSource}
                onChange={(value) => updateValue("incomeSource", value)}
                options={INCOME_SOURCE_OPTIONS}
              />
            ),
          },
          {
            key: "taxResidency",
            node: (
              <CountryField
                id="taxResidency"
                label="Tax Residency"
                value={values.taxResidency}
                onChange={(value) => updateValue("taxResidency", value)}
              />
            ),
          },
        ];
      default:
        return [
          {
            key: "declaration",
            node: (
              <div className="md:col-span-2 space-y-4 rounded-lg border border-border bg-accent/5 px-5 py-5">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Client Declaration</p>
                  <p className="text-sm text-muted-foreground">
                    I confirm that the information provided is complete and accurate, and I understand it may be used
                    for suitability, compliance, and account administration purposes.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    I agree to keep my profile information current and acknowledge that the platform may restrict
                    services if required onboarding details become inaccurate or incomplete.
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                  Tax residency will default to {getCountryName(values.taxResidency) || "your selected country"} unless
                  you change it before submission.
                </div>
              </div>
            ),
          },
        ];
    }
  })();

  const handleNext = () => {
    if (currentStep >= ONBOARDING_STEPS.length - 1) return;
    setAttemptedSteps((previous) => new Set(previous).add(currentStep));
    if (!isCurrentStepValid) return;
    setCurrentStep((previous) => previous + 1);
  };

  const handlePrevious = () => {
    if (currentStep === 0) return;
    setCurrentStep((previous) => previous - 1);
  };

  const handleSubmit = async () => {
    if (!completedSteps.every(Boolean)) {
      setAttemptedSteps(new Set(ONBOARDING_STEPS.map((_, index) => index)));
      return;
    }
    await onSubmit(values);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="hidden xl:block space-y-5 rounded-lg border border-border/60 bg-background/60 p-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Onboarding</p>
          <p className="text-xs text-muted-foreground">Complete your profile before moving funds or copying traders.</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{currentProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-500 to-cyan-400"
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${currentProgress}%` }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0, 0, 0.2, 1] }}
            />
          </div>
        </div>

        <ol className="space-y-3">
          {ONBOARDING_STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isComplete = index < currentStep && completedSteps[index];

            return (
              <li key={step.key} className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                    isComplete && "border-emerald-500 bg-emerald-500 text-white",
                    isActive && "border-cyan-400 bg-cyan-400/10 text-cyan-300",
                    !isActive && !isComplete && "border-muted-foreground/40 text-muted-foreground",
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : isActive ? (
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="absolute h-3 w-3 rounded-full bg-cyan-400 motion-safe:animate-ping" />
                      <span className="relative h-2.5 w-2.5 rounded-full bg-cyan-300" />
                    </span>
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full border border-current" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.progress}% progress</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="space-y-5 rounded-lg border border-border/60 bg-background/40 p-5">
        <div className="space-y-2 xl:hidden">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
            <span>{currentProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-500 to-cyan-400"
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${currentProgress}%` }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0, 0, 0.2, 1] }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Step {currentStep + 1} of 5</p>
          <h3 className="text-xl font-semibold">{ONBOARDING_STEPS[currentStep].title}</h3>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Update failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {hasAttemptedCurrentStep && !isCurrentStepValid && currentStep !== 4 && (
          <Alert variant="warning">
            <AlertCircle />
            <AlertTitle>Required fields missing</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {currentStepErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {visibleFields.map((field, index) => (
            <AnimatedInputSection key={`${currentStep}-${field.key}`} delay={index * 0.3}>
              {field.node}
            </AnimatedInputSection>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0 || saving}>
            Previous
          </Button>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <Button variant="primary-purple" onClick={handleNext} disabled={saving}>
                Next
              </Button>
            ) : (
              <Button variant="primary-purple" onClick={() => void handleSubmit()} disabled={saving}>
                {saving ? "Saving..." : "Complete Onboarding"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
