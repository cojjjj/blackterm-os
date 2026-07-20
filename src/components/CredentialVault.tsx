import { useEffect, useMemo, useState } from "react";
import {
  credentialRecords,
  credentialSummary,
  type CredentialCategory,
  type CredentialRecord,
} from "../data/credentials";

type VaultFilter = "All" | CredentialCategory;
type SortMode = "Newest" | "Issuer" | "Expiration" | "Name";

const FILTERS: VaultFilter[] = [
  "All",
  "Offensive Security",
  "Defensive Security",
  "Security Engineering",
  "Foundations",
  "Professional",
];

const SORT_OPTIONS: SortMode[] = [
  "Newest",
  "Issuer",
  "Expiration",
  "Name",
];

const CATEGORY_CODES: Record<CredentialCategory, string> = {
  "Offensive Security": "OFF",
  "Defensive Security": "DEF",
  "Security Engineering": "ENG",
  Foundations: "FND",
  Professional: "PRO",
};

const ISSUER_CODES: Record<string, string> = {
  TryHackMe: "THM",
  Google: "G",
  IBM: "IBM",
  SkillUp: "SU",
};

function parseDate(value?: string): number {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = Date.parse(`1 ${value}`);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function normalizeFilter(value: string | null): VaultFilter {
  return FILTERS.includes(value as VaultFilter)
    ? (value as VaultFilter)
    : "All";
}

export default function CredentialVault() {
  const [filter, setFilter] = useState<VaultFilter>(() =>
    normalizeFilter(localStorage.getItem("bt-credential-filter")),
  );
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("Newest");
  const [selected, setSelected] = useState<CredentialRecord | null>(null);

  useEffect(() => {
    const handleFilter = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const next = normalizeFilter(customEvent.detail);
      setFilter(next);
      localStorage.setItem("bt-credential-filter", next);
    };

    window.addEventListener("blackterm:credential-filter", handleFilter);

    return () => {
      window.removeEventListener(
        "blackterm:credential-filter",
        handleFilter,
      );
    };
  }, []);

  const tryHackMeCount = useMemo(
    () =>
      credentialRecords.filter(
        (credential) => credential.issuer === "TryHackMe",
      ).length,
    [],
  );

  const visibleRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const results = credentialRecords.filter((credential) => {
      const categoryMatch =
        filter === "All" || credential.category === filter;

      const queryMatch =
        !normalized ||
        credential.name.toLowerCase().includes(normalized) ||
        credential.issuer.toLowerCase().includes(normalized) ||
        credential.credentialId.toLowerCase().includes(normalized) ||
        credential.category.toLowerCase().includes(normalized);

      return categoryMatch && queryMatch;
    });

    return [...results].sort((a, b) => {
      switch (sort) {
        case "Issuer":
          return (
            a.issuer.localeCompare(b.issuer) ||
            a.name.localeCompare(b.name)
          );
        case "Expiration":
          return (
            parseDate(a.expires) - parseDate(b.expires) ||
            a.name.localeCompare(b.name)
          );
        case "Name":
          return a.name.localeCompare(b.name);
        case "Newest":
        default:
          return parseDate(b.issued) - parseDate(a.issued);
      }
    });
  }, [filter, query, sort]);

  function selectFilter(next: VaultFilter) {
    setFilter(next);
    localStorage.setItem("bt-credential-filter", next);
  }

  return (
    <div className="credential-vault">
      <header className="credential-vault-hero">
        <div className="credential-vault-mark" aria-hidden="true">
          <span>CV</span>
          <i />
        </div>

        <div>
          <small>BLACKTERM // VERIFIED RECORDS</small>
          <h1>Credential Vault</h1>
          <p>
            Professional certifications and completed security training
            indexed from Tyler&apos;s public credential record.
          </p>
        </div>

        <div className="credential-vault-integrity">
          <span>● VAULT ONLINE</span>
          <strong>INTEGRITY 100%</strong>
        </div>
      </header>

      <section className="credential-vault-stats vault-five-stats">
        <article>
          <small>VERIFIED RECORDS</small>
          <strong>{credentialSummary.total}</strong>
        </article>
        <article>
          <small>ACTIVE CREDENTIALS</small>
          <strong>{credentialSummary.active}</strong>
        </article>
        <article>
          <small>LIFETIME RECORDS</small>
          <strong>{credentialSummary.lifetime}</strong>
        </article>
        <article>
          <small>TRYHACKME RECORDS</small>
          <strong>{tryHackMeCount}</strong>
        </article>
        <article>
          <small>ISSUING ORGANIZATIONS</small>
          <strong>{credentialSummary.issuers}</strong>
        </article>
      </section>

      <div className="credential-vault-toolbar">
        <div className="credential-vault-controls">
          <label>
            <span>SEARCH VAULT</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search certification, issuer, category, or credential ID..."
            />
          </label>

          <label className="credential-sort-control">
            <span>SORT RECORDS</span>
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as SortMode)
              }
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="credential-vault-filters">
          {FILTERS.map((category) => (
            <button
              key={category}
              className={filter === category ? "active" : ""}
              onClick={() => selectFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="credential-vault-results">
        <div className="credential-vault-result-heading">
          <span>{visibleRecords.length} RECORDS DISPLAYED</span>
          <b>
            {filter.toUpperCase()} // {sort.toUpperCase()}
          </b>
        </div>

        <div className="credential-vault-grid">
          {visibleRecords.map((credential, index) => (
            <article
              key={credential.credentialId}
              className={`credential-record category-${CATEGORY_CODES[
                credential.category
              ].toLowerCase()}`}
            >
              <header>
                <div className="credential-seal">
                  <span>
                    {ISSUER_CODES[credential.issuer] ??
                      CATEGORY_CODES[credential.category]}
                  </span>
                  <i>{String(index + 1).padStart(2, "0")}</i>
                </div>

                <div>
                  <small>{credential.category}</small>
                  <h2>{credential.name}</h2>
                  <p>
                    <span className="credential-issuer-badge">
                      {ISSUER_CODES[credential.issuer] ?? "CV"}
                    </span>
                    {credential.issuer}
                  </p>
                </div>

                <b>{credential.status}</b>
              </header>

              <dl>
                <div>
                  <dt>ISSUED</dt>
                  <dd>{credential.issued}</dd>
                </div>
                <div>
                  <dt>EXPIRES</dt>
                  <dd>{credential.expires ?? "NO EXPIRATION"}</dd>
                </div>
                <div>
                  <dt>CREDENTIAL ID</dt>
                  <dd>{credential.credentialId}</dd>
                </div>
              </dl>

              <p className="credential-description">
                {credential.description}
              </p>

              <footer>
                <button onClick={() => setSelected(credential)}>
                  INSPECT RECORD
                </button>

                {credential.verificationUrl ? (
                  <a
                    href={credential.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    VERIFY CREDENTIAL ↗
                  </a>
                ) : (
                  <span>LINKEDIN RECORD</span>
                )}
              </footer>
            </article>
          ))}
        </div>
      </div>

      {selected ? (
        <div
          className="credential-modal-backdrop"
          role="presentation"
          onMouseDown={() => setSelected(null)}
        >
          <section
            className="credential-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.name} credential record`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div className="credential-modal-code">
                {ISSUER_CODES[selected.issuer] ??
                  CATEGORY_CODES[selected.category]}
              </div>
              <div>
                <small>BLACKTERM VERIFIED CREDENTIAL</small>
                <h2>{selected.name}</h2>
                <p>{selected.issuer}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close">
                ×
              </button>
            </header>

            <div className="credential-modal-status">
              <span>● {selected.status}</span>
              <b>IDENTITY RECORD INDEXED</b>
            </div>

            <dl>
              <div>
                <dt>CATEGORY</dt>
                <dd>{selected.category}</dd>
              </div>
              <div>
                <dt>ISSUED</dt>
                <dd>{selected.issued}</dd>
              </div>
              <div>
                <dt>EXPIRATION</dt>
                <dd>{selected.expires ?? "NO EXPIRATION"}</dd>
              </div>
              <div>
                <dt>CREDENTIAL ID</dt>
                <dd>{selected.credentialId}</dd>
              </div>
            </dl>

            <article>
              <small>TRAINING SUMMARY</small>
              <p>{selected.description}</p>
            </article>

            <footer>
              {selected.verificationUrl ? (
                <a
                  href={selected.verificationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  OPEN VERIFICATION ↗
                </a>
              ) : (
                <span>
                  Add the public URL in src/data/credentials.ts to
                  activate direct verification.
                </span>
              )}

              <button onClick={() => setSelected(null)}>CLOSE RECORD</button>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}