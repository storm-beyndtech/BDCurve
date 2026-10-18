import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";

const footerLinks = {
  product: {
    title: "Trading",
    links: [
      { label: "Stocks", href: "/products/stocks" },
      { label: "ETFs", href: "/products/etfs" },
      { label: "Options", href: "/products/options" },
      { label: "Crypto", href: "/products/crypto" },
      { label: "Commodities", href: "/products/commodities" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Security", href: "/legal/security" },
      { label: "Compliance", href: "/legal/compliance" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Guides", href: "/guides" },
      { label: "Status", href: "/status" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Mail, href: "mailto:support@boundingcurve.com", label: "Email" },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container-wide container-padding">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="inline-flex items-center group">
                <BrandLogo size="default"/>
              </Link>

              <p className="text-sm text-muted-foreground max-w-xs">
                Modern payment infrastructure for global businesses. Move money
                across borders instantly.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent/10 transition-colors group"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors"/>
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key} className="space-y-3">
                <h3 className="text-sm font-semibold">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              © {currentYear} Bounding Curve. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <Link to="/legal/privacy"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link to="/legal/terms"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link to="/cookies"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

