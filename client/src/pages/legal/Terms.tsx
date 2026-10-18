import { LegalDocument } from "@/components/legal/legal-document";

const sections = [
  {
    id: "scope",
    title: "1. Scope of these terms",
    paragraphs: [
      "These Terms and Conditions govern your access to and use of the Bounding Curve web application, mobile-accessible interfaces, account dashboards, market-data surfaces, payment and wallet tools, support channels, and any related services we make available through the platform.",
      "By creating an account, verifying your email, accessing the platform, or using any Bounding Curve feature, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not register for an account or use the service.",
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility and acceptable use",
    paragraphs: [
      "You must be legally capable of entering a binding agreement in your jurisdiction and may only use the platform for lawful personal or business purposes. You may not use the service if doing so would violate applicable sanctions, anti-money-laundering controls, securities rules, market-abuse rules, consumer-protection laws, or any other applicable law or regulation.",
    ],
    bullets: [
      "You must provide current, accurate, and complete registration details.",
      "You may not create an account for another person without authority.",
      "You may not use the platform to facilitate fraud, impersonation, market manipulation, unauthorized payments, or unlawful asset transfers.",
      "You may not attempt to bypass identity checks, transaction controls, withdrawal controls, account limits, or security controls.",
    ],
  },
  {
    id: "accounts",
    title: "3. Accounts, credentials, and security",
    paragraphs: [
      "You are responsible for safeguarding your login credentials, one-time verification codes, recovery channels, and any device used to access the service. Activity performed through your account is treated as authorized by you unless and until you notify us of compromise and we are reasonably able to act on that notice.",
      "We may require multi-factor authentication, email verification, withdrawal passwords, device confirmation, or other security steps at any time. You must promptly notify us at support@boundingcurve.com if you suspect unauthorized access, account takeover, fraudulent instructions, or any other security incident.",
    ],
  },
  {
    id: "verification",
    title: "4. Identity verification and compliance reviews",
    paragraphs: [
      "Bounding Curve may require identity verification, source-of-funds information, enhanced due diligence, sanctions screening, transaction review, proof-of-address documentation, and other compliance information before account activation, before particular features are enabled, or after an account is already active.",
      "If we request information for KYC, AML, fraud review, risk review, or regulatory purposes, you must respond accurately and within the requested timeframe. We may suspend access, reject a transaction, freeze a workflow, or close an account if information is incomplete, inconsistent, suspicious, or not provided in time.",
    ],
  },
  {
    id: "services",
    title: "5. Platform services and operational boundaries",
    paragraphs: [
      "The platform may let you view balances, request deposits or withdrawals, review transactions, manage asset addresses, submit KYC material, view market information, access trading workflows, or use other account tools that are made available from time to time.",
      "Not every feature is available in every region, for every account type, or at every point in time. We may add, remove, restrict, rate-limit, or condition access to any workflow without notice where reasonably necessary for security, compliance, operational integrity, third-party dependency changes, or product maintenance.",
    ],
  },
  {
    id: "orders",
    title: "6. Trading, execution, and market information",
    paragraphs: [
      "Market prices, charts, watchlists, and research content displayed through the platform are informational and may be delayed, incomplete, or unavailable. They do not constitute investment advice, fiduciary advice, tax advice, legal advice, or a recommendation to buy, sell, hold, or transfer any asset.",
      "Submitting an instruction through the platform does not guarantee execution, settlement, pricing, liquidity, profitability, or continued availability of the relevant asset or market. Market conditions, internal controls, funding status, trading-hour limitations, counterparty availability, custody constraints, and compliance review may affect whether or how an instruction is processed.",
    ],
  },
  {
    id: "payments",
    title: "7. Deposits, withdrawals, conversions, and settlements",
    paragraphs: [
      "You are responsible for ensuring that deposit, withdrawal, transfer, and wallet instructions are accurate before submission. Incorrect destination details, unsupported assets, unsupported networks, mismatched beneficiary information, or failed compliance checks can delay, reject, or permanently impair a transaction.",
      "Bounding Curve may place holds on deposits, withdrawals, internal transfers, or conversions where required for fraud screening, account review, operational reconciliation, liquidity management, or legal compliance. Processing time estimates are directional only and not guaranteed.",
    ],
  },
  {
    id: "fees",
    title: "8. Fees, taxes, and reporting",
    paragraphs: [
      "You are responsible for all fees, spreads, network fees, conversion charges, withdrawal fees, third-party banking charges, or other costs disclosed to you at the time of use or otherwise made available through the platform.",
      "You are also responsible for determining and paying any taxes, duties, reporting obligations, or filing obligations that arise from your account activity. Unless we explicitly state otherwise in writing, Bounding Curve does not act as your tax preparer, investment adviser, broker of record, or fiduciary.",
    ],
  },
  {
    id: "prohibited",
    title: "9. Prohibited conduct",
    paragraphs: [
      "You may not misuse the platform or interfere with its operation, availability, integrity, or security. The following conduct is prohibited regardless of whether it causes immediate harm:",
    ],
    bullets: [
      "Reverse engineering, scraping, crawling, or bulk extraction except where we expressly permit it.",
      "Using bots, scripts, or automation to overwhelm the service or bypass rate limits.",
      "Submitting false KYC documents, forged records, misleading ownership information, or fraudulent payment instructions.",
      "Using the platform for phishing, malware delivery, social engineering, laundering proceeds, sanctions evasion, or market abuse.",
      "Attempting to access another user’s account, admin tools, internal APIs, or restricted workflows without authorization.",
    ],
  },
  {
    id: "risk",
    title: "10. Risk disclosures",
    paragraphs: [
      "Investing, trading, payments, digital assets, and cross-border transactions involve substantial risk. Asset values may fluctuate rapidly. Liquidity can disappear. Counterparties can fail. Networks can congest. Instructions can be delayed, reversed, challenged, or rejected. Past performance is not indicative of future results.",
      "You should only use the platform if you understand the financial, operational, legal, and technical risks involved and are capable of absorbing losses, delays, disputes, and service interruptions without relying on Bounding Curve to protect you from those risks.",
    ],
  },
  {
    id: "ip",
    title: "11. Intellectual property and platform rights",
    paragraphs: [
      "The platform, including its software, interface design, content, trademarks, service marks, text, graphics, and compilation of features, is owned by Bounding Curve or its licensors and is protected by applicable intellectual-property laws.",
      "We grant you a limited, revocable, non-exclusive, non-transferable right to access and use the service for its intended purpose under these Terms. This right does not include resale, sublicensing, commercial redistribution of platform content, derivative works, or use of our branding without written permission.",
    ],
  },
  {
    id: "suspension",
    title: "12. Suspension, restriction, and termination",
    paragraphs: [
      "We may suspend, restrict, or terminate all or part of your access immediately if we reasonably believe that doing so is necessary to protect users, comply with law, investigate fraud, reduce security risk, prevent loss, address abuse, or enforce these Terms.",
      "You may stop using the platform at any time. Termination of access does not eliminate obligations that arose before termination, including payment obligations, indemnity obligations, recordkeeping obligations, and obligations connected to investigations, disputes, or unresolved transactions.",
    ],
  },
  {
    id: "disclaimers",
    title: "13. Disclaimers and limitation of liability",
    paragraphs: [
      "The platform is provided on an \"as is\" and \"as available\" basis to the maximum extent permitted by law. We do not warrant uninterrupted availability, error-free operation, continuous market access, or that the service will meet every specific business, investment, or operational requirement you may have.",
      "To the maximum extent permitted by law, Bounding Curve and its affiliates, personnel, contractors, and licensors are not liable for indirect, incidental, consequential, special, exemplary, punitive, or lost-profit damages, or for losses arising from market movement, data delays, user error, credential compromise, third-party outages, wallet mistakes, unsupported transfers, or compliance holds.",
      "Where liability cannot be excluded, our aggregate liability for claims arising out of or relating to these Terms or the service will be limited to the greater of the fees you paid to us for the affected service in the 12 months preceding the claim or USD 100.",
    ],
  },
  {
    id: "indemnity",
    title: "14. Indemnity",
    paragraphs: [
      "You agree to indemnify and hold harmless Bounding Curve, its affiliates, directors, employees, contractors, and agents from claims, liabilities, losses, damages, costs, and expenses, including reasonable legal fees, arising out of your misuse of the platform, breach of these Terms, violation of law, infringement of third-party rights, or instructions submitted through your account.",
    ],
  },
  {
    id: "communications",
    title: "15. Electronic communications",
    paragraphs: [
      "You consent to receive electronic communications from us relating to your account, security events, legal notices, disclosures, service updates, compliance requests, and transactional activity. Notices sent to the email address associated with your account, presented inside the product, or otherwise delivered through our supported channels satisfy any legal communication requirement unless applicable law requires a different method.",
    ],
  },
  {
    id: "changes",
    title: "16. Changes to these terms",
    paragraphs: [
      "We may update these Terms from time to time. Updated versions become effective when posted unless a later effective date is stated. Your continued use of the platform after the effective date of an updated version constitutes acceptance of the revised Terms.",
    ],
  },
  {
    id: "governing-law",
    title: "17. Governing law and contact",
    paragraphs: [
      "These Terms are governed by the laws applicable to the entity operating the Bounding Curve service relationship with you, without regard to conflict-of-law principles, except where mandatory local law requires otherwise. Venue, dispute procedure, and any mandatory consumer rights may vary depending on the jurisdiction that applies to your account relationship.",
      "Questions about these Terms can be sent to support@boundingcurve.com. If you need help with an account-specific issue, use the support channel tied to your account so we can verify identity before discussing sensitive information.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Terms and Conditions"
      title="Bounding Curve Terms and Conditions"
      summary="These terms explain the rules for using Bounding Curve, including account access, security, verification, trading workflows, payments, acceptable use, and the limits that apply to our platform."
      effectiveDate="May 12, 2026"
      sections={sections}
    />
  );
}
