import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiPut } from "@/lib/api";
import { OnboardingProfileForm } from "@/components/profile/onboarding-profile-form";
import type { User as UserType } from "@/lib/banking/types";

type OnboardingValues = {
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

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: OnboardingValues) => {
    if (!user?.id || !user.email) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      const response = await apiPut<{ message: string; user: UserType & { _id?: string; id?: string } }>(
        "/api/auth/users/update-profile",
        {
          userId: user.id,
          email: user.email,
          title: values.title,
          firstName: values.firstName,
          lastName: values.lastName,
          dob: values.dob,
          houseNo: values.houseNo,
          streetAddress: values.streetAddress,
          city: values.city,
          province: values.province,
          zipCode: values.zipCode,
          countryCode: values.country,
          phone: values.phone,
          yearsTrading: values.yearsTrading,
          tradingFrequency: values.tradingFrequency,
          instruments: values.instruments,
          knowledgeLevel: values.knowledgeLevel,
          preferredMarkets: values.preferredMarkets,
          tradingPlatforms: values.tradingPlatforms,
          annualIncome: values.annualIncome,
          incomeSource: values.incomeSource,
          taxResidency: values.taxResidency,
          onboardingCompleted: true,
          name: {
            full: `${values.firstName} ${values.lastName}`.trim(),
          },
        },
      );

      updateUser({ ...response.user, id: response.user.id || response.user._id || user.id });
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to complete onboarding.";
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Complete Onboarding</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Finish your account setup before using the dashboard.
        </p>
      </div>

      <Card variant="glass" padding="lg" hover="lift">
        <CardHeader className="p-0 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            Onboarding
          </div>
          <CardTitle className="text-lg">Suitability & Account Setup</CardTitle>
          <CardDescription>Provide the required details once. Profile remains separate.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-6">
          <OnboardingProfileForm
            user={user}
            saving={saving}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
