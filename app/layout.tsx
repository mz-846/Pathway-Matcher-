import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pathway Matcher – NHS Discharge Tool",
  description: "Synthetic patient discharge pathway matching demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="nhsuk-frontend-supported">
      <head>
        <link rel="stylesheet" href="/nhsuk-frontend.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
