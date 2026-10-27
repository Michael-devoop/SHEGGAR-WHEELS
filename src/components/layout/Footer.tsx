"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Send } from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse Cars", href: "/cars" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Sign Up", href: "/signup" },
];

const CONTACT = [
  "Addis Ababa, Ethiopia",
  "Bole Sub City",
  "Phone: +251 911 000 000",
  "Email: info@sheggarwheels.com",
];

const SOCIALS = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
        <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm5.25-3.5a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </svg>
    ),
  },
];

const subscribeToYear = (): (() => void) => () => {};
const getCopyrightYear = (): number => new Date().getFullYear();
const getServerCopyrightYear = (): number => 2026;

export default function Footer() {
  const copyrightYear = useSyncExternalStore(
    subscribeToYear,
    getCopyrightYear,
    getServerCopyrightYear,
  );

  return (
    <footer className="mt-12 border-t border-border bg-bg">
      {/* Main grid */}
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {/* Column 1 — Stay Connected */}
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-bold tracking-tight">
            Stay
            <br />
            Connected
          </h3>
          <p className="text-sm leading-relaxed text-ink-muted">
            Join our newsletter for the latest updates and exclusive offers.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-0 overflow-hidden rounded-lg border border-border"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              className="grid size-10 flex-shrink-0 place-items-center bg-zinc-900 text-white transition-colors hover:bg-zinc-800"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>

        {/* Column 2 — Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-base font-semibold">Quick Links</h4>
          <nav className="flex flex-col gap-2.5">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Column 3 — Contact Us */}
        <div className="flex flex-col gap-4">
          <h4 className="text-base font-semibold">Contact Us</h4>
          <div className="flex flex-col gap-2.5">
            {CONTACT.map((line) => (
              <p key={line} className="text-sm text-ink-muted">
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Column 4 — Follow Us */}
        <div className="flex flex-col gap-4">
          <h4 className="text-base font-semibold">Follow Us</h4>
          <div className="flex items-center gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="grid size-10 place-items-center rounded-full border border-border text-ink transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="shell flex flex-col gap-3 py-5 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {copyrightYear} Sheggar Wheels. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="transition-colors hover:text-ink">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors hover:text-ink">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
