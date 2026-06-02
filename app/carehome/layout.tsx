import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pathway Matcher – Care Home Portal",
};

export default function CareHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="nhsuk-header" role="banner">
        <div className="nhsuk-width-container nhsuk-header__container">
          <div className="nhsuk-header__logo">
            <Link
              className="nhsuk-header__link nhsuk-header__link--service"
              href="/carehome"
            >
              <svg
                className="nhsuk-logo"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 40 16"
                height="40"
                width="100"
              >
                <path fill="#fff" d="M0 0h40v16H0z" />
                <path
                  fill="#005eb8"
                  d="M3.9 1.5h4.4l2.6 9h.1l1.8-9h3.3l-2.8 13H9l-2.7-9h-.1l-1.8 9H1.1M17.3 1.5h3.6l-1 4.9h4L25 1.5h3.5l-2.7 13h-3.5l1.1-5.6h-4l-1.2 5.6h-3.4M37.7 4.4c-.7-.3-1.6-.6-2.9-.6-1.4 0-2.5.2-2.5 1.3 0 1.8 5.1 1.2 5.1 5.1 0 3.6-3.3 4.5-6.4 4.5-1.3 0-2.9-.3-4-.7l.8-2.7c.7.4 2.1.7 3.2.7s2.8-.2 2.8-1.5c0-2.1-5.1-1.3-5.1-5 0-3.4 2.9-4.4 5.8-4.4 1.6 0 3.1.2 4 .6"
                />
              </svg>
              <span className="nhsuk-header__service-name">
                Pathway Matcher
              </span>
            </Link>
          </div>
          <div
            className="nhsuk-header__content"
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <span
              style={{ color: "#fff", fontSize: "0.875rem" }}
            >
              Care Home Portal
            </span>
            <Link href="/nurse" className="nhsuk-header__link" style={{ color: "#aed6f1", fontSize: "0.8125rem" }}>
              Switch to Nurse view
            </Link>
          </div>
        </div>
      </header>

      <nav className="nhsuk-breadcrumb" aria-label="Breadcrumb">
        <div className="nhsuk-width-container">
          <ol className="nhsuk-breadcrumb__list">
            <li className="nhsuk-breadcrumb__item">
              <Link className="nhsuk-breadcrumb__link" href="/">
                Home
              </Link>
            </li>
            <li className="nhsuk-breadcrumb__item">
              <Link className="nhsuk-breadcrumb__link" href="/carehome">
                Care homes
              </Link>
            </li>
          </ol>
        </div>
      </nav>

      <div className="nhsuk-width-container">
        <main className="nhsuk-main-wrapper" id="maincontent" role="main">
          {children}
        </main>
      </div>

      <footer className="nhsuk-footer" role="contentinfo">
        <div className="nhsuk-width-container">
          <p className="nhsuk-footer__copyright">
            &copy; Crown copyright — Demo only. Synthetic data.
          </p>
        </div>
      </footer>
    </>
  );
}
