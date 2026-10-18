import { LegalDocument } from "@/components/legal/legal-document";

const sections = [
  {
    id: "overview",
    title: "1. Overview",
    paragraphs: [
      "This Privacy Policy explains how Bounding Curve collects, uses, stores, shares, and protects personal information when you visit our website, create an account, complete verification steps, submit support requests, or use account, trading, payment, wallet, and transaction features available through the platform.",
      "This policy applies to information collected directly from you, automatically from your device or browser, and from service providers or partners that help us operate the platform, verify identity, prevent fraud, deliver communications, and maintain security.",
    ],
  },
  {
    id: "data-we-collect",
    title: "2. Information we collect",
    paragraphs: [
      "The categories of information we collect depend on how you use the service and which features you activate.",
    ],
    bullets: [
      "Identity and account information, such as your name, email address, country, login credentials, account role, and profile details.",
      "Verification and compliance information, such as identity documents, date of birth, phone number, KYC materials, sanctions-screening information, and review outcomes.",
      "Transaction and operational data, such as deposits, withdrawals, conversions, internal transfers, trading activity, balances, addresses, and workflow history.",
      "Technical and security data, such as IP address, device or browser metadata, session information, logs, approximate location indicators, and fraud-detection signals.",
      "Support and communication data, such as emails, contact-form submissions, and account notices.",
    ],
  },
  {
    id: "how-we-use",
    title: "3. How we use information",
    paragraphs: [
      "We use personal information to provide the service, secure accounts, operate platform workflows, investigate abuse, comply with legal obligations, and improve the reliability of the product.",
    ],
    bullets: [
      "Create and maintain user accounts.",
      "Verify identity, prevent fraud, and enforce security controls.",
      "Process transactions, account changes, and support requests.",
      "Monitor platform health, detect misuse, and troubleshoot failures.",
      "Send verification codes, service messages, legal notices, and support communications.",
      "Comply with applicable laws, lawful requests, dispute handling, and recordkeeping obligations.",
    ],
  },
  {
    id: "legal-basis",
    title: "4. Legal bases and compliance reasons",
    paragraphs: [
      "Where applicable law requires a legal basis for processing, we generally rely on one or more of the following: performance of our contract with you, compliance with legal obligations, our legitimate interests in operating and protecting the service, and your consent where consent is specifically required.",
    ],
  },
  {
    id: "sharing",
    title: "5. When we share information",
    paragraphs: [
      "We do not sell your personal information in the ordinary course of operating the platform. We may share information with service providers, infrastructure vendors, communications providers, compliance vendors, fraud-prevention tools, professional advisers, auditors, regulators, law-enforcement authorities, and transaction counterparties where needed to provide or protect the service or comply with law.",
      "Any such sharing is limited to what is reasonably necessary for the relevant purpose, subject to contractual, legal, or operational safeguards where appropriate.",
    ],
  },
  {
    id: "retention",
    title: "6. Data retention",
    paragraphs: [
      "We retain information for as long as reasonably necessary to provide the service, maintain business and security records, comply with legal obligations, resolve disputes, enforce agreements, and investigate misuse. Retention periods may be longer where account, transaction, audit, fraud, or compliance records must be preserved.",
    ],
  },
  {
    id: "security",
    title: "7. Security",
    paragraphs: [
      "We use administrative, technical, and operational measures designed to protect information from unauthorized access, misuse, alteration, or loss. No system is completely secure, and you remain responsible for protecting your credentials, devices, backup email account, and any one-time verification channel tied to your account.",
    ],
  },
  {
    id: "cross-border",
    title: "8. International transfers",
    paragraphs: [
      "Because our providers, infrastructure, and support operations may operate across multiple jurisdictions, information may be processed outside your country of residence. Where applicable, we rely on appropriate safeguards and contractual protections for those transfers.",
    ],
  },
  {
    id: "rights",
    title: "9. Your rights and choices",
    paragraphs: [
      "Depending on your location, you may have rights to request access, correction, deletion, portability, restriction, or objection in relation to your personal information, subject to legal and operational limits. You may also request that we review inaccurate profile information or outdated verification data.",
      "To exercise a privacy request, contact support@boundingcurve.com from the email address linked to your account. We may need to verify your identity before acting on a request, especially where sensitive financial or verification information is involved.",
    ],
  },
  {
    id: "children",
    title: "10. Children’s privacy",
    paragraphs: [
      "The platform is not directed to children and is not intended for use by individuals who are not legally permitted to enter into these Terms. If we learn that we collected personal information in a way that violates applicable age restrictions, we may disable the account and delete or restrict the data as required.",
    ],
  },
  {
    id: "updates",
    title: "11. Policy updates and contact",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect product changes, legal requirements, security practices, or operational changes. The revised version becomes effective when posted unless a later date is specified.",
      "Questions about this policy or privacy requests should be sent to support@boundingcurve.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Privacy Policy"
      title="Bounding Curve Privacy Policy"
      summary="This policy explains what personal information we collect, why we collect it, how it is used, when it may be shared, how long it is retained, and what privacy choices may be available to you."
      effectiveDate="May 12, 2026"
      sections={sections}
    />
  );
}
