import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get ₦3,000 with Card Cosmic | Invite Code 555555",
  description:
    "Download Card Cosmic, register as a new user, and enter invitation code 555555 to become eligible for a ₦3,000 welcome reward.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG">
      <body>{children}</body>
    </html>
  );
}
