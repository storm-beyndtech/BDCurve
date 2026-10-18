import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export function LegalDocument({ eyebrow, title, summary, effectiveDate, sections }: LegalDocumentProps) {
  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-muted/20">
        <div className="container-wide container-padding py-12 md:py-16">
          <Link
            to="/signup"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to registration
          </Link>

          <div className="mt-8 max-w-4xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              {eyebrow}
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">{title}</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">{summary}</p>
            </div>

            <p className="text-sm text-muted-foreground">
              Effective date: <span className="font-medium text-foreground">{effectiveDate}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="container-wide container-padding py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-10">
            {sections.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-24 border-b border-border/60 pb-10 last:border-b-0 last:pb-0">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{section.title}</h2>

                <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  {section.bullets?.length ? (
                    <ul className="space-y-2 pl-5 text-foreground/90 marker:text-primary-600">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit border border-border/70 bg-card/40 p-5 lg:sticky lg:top-24">
            <p className="text-sm font-semibold text-foreground">On this page</p>
            <nav className="mt-4">
              <ul className="space-y-3">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </section>
    </div>
  );
}
