export interface User {
	id: string;
	email: string;
	title?: string;
	name?: {
		first?: string;
		last?: string;
		full?: string;
	};
	firstName?: string;
	lastName?: string;
	dob?: string;
	dateOfBirth?: string;
	phone?: string;
	houseNo?: string;
	streetAddress?: string;
	city?: string;
	province?: string;
	zipCode?: string;
	role?: string;
	isAdmin?: boolean;
	isVerified?: boolean;
	onboardingCompleted?: boolean;
	kycStatus?: string;
	accountStatus?: string;
	countryCode?: string;
	country?: string;
	yearsTrading?: string;
	tradingFrequency?: string;
	instruments?: string;
	knowledgeLevel?: string;
	preferredMarkets?: string;
	tradingPlatforms?: string;
	annualIncome?: string;
	incomeSource?: string;
	taxResidency?: string;
	createdAt?: string;
	assets?: Array<{
		symbol: string;
		name?: string;
		spot: number;
		funding?: number;
	}>;
}
