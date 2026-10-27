"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import SignOutButton from "@/components/auth/SignOutButton";
import { useCurrentUser } from "@/hooks/useSession";
import { homeForUser } from "@/lib/domain/permissions";

/* ── Types ──────────────────────────────────────────────────────────── */

type NavItem = {
  label: string;
  href?: string;
  panelId?: "vehicles" | "services" | "locations";
};

type PanelCard = {
  title: string;
  description?: string;
  href?: string;
};

type MenuPanel = {
  id: NonNullable<NavItem["panelId"]>;
  items: PanelCard[];
};

/* ── Navigation data ────────────────────────────────────────────────── */

const navItems: NavItem[] = [
  { label: "Vehicles", panelId: "vehicles" },
  { label: "Services", panelId: "services" },
  { label: "Locations", panelId: "locations" },
  { label: "How it Works", href: "/#how-it-works" },
];

const menuPanels: MenuPanel[] = [
  {
    id: "vehicles",
    items: [
      {
        title: "Browse All Cars",
        description:
          "Explore our full marketplace — filter by price, neighbourhood, and transmission.",
        href: "/cars",
      },
      {
        title: "Sedans & Compacts",
        description:
          "Fuel-efficient daily drivers perfect for navigating Addis Ababa.",
        href: "/cars",
      },
      {
        title: "SUVs & Crossovers",
        description:
          "Spacious rides built for family trips and weekend getaways.",
        href: "/cars",
      },
      {
        title: "Electric & Hybrid",
        description:
          "The future of driving — sustainable vehicles from local owners.",
        href: "/cars",
      },
    ],
  },
  {
    id: "services",
    items: [
      {
        title: "Rent a Car",
        description:
          "Browse, book and drive — peer-to-peer car rental made simple.",
        href: "/cars",
      },
      {
        title: "List Your Car",
        description:
          "Earn extra income by sharing your car when you're not using it.",
        href: "/signup",
      },
      {
        title: "Insurance & Trust",
        description:
          "Verified owners, ID checks, and dispute resolution built in.",
      },
    ],
  },
  {
    id: "locations",
    items: [
      {
        title: "Bole",
        description:
          "Browse cars near Bole International Airport and Bole Medhanialem.",
        href: "/cars?neighbourhood=Bole",
      },
      {
        title: "Piassa & Kazanchis",
        description: "Central Addis — find cars close to the city core.",
        href: "/cars?neighbourhood=Piassa",
      },
      {
        title: "CMC & Megenagna",
        description: "Popular pick-up spots in the eastern corridor.",
        href: "/cars?neighbourhood=CMC",
      },
      {
        title: "Ayat & Summit",
        description: "Expanding suburbs with growing availability.",
        href: "/cars?neighbourhood=Ayat",
      },
    ],
  },
];

function getPanel(panelId: string | null) {
  return menuPanels.find((panel) => panel.id === panelId);
}

/* ── Logo ────────────────────────────────────────────────────────────── */

function SheggarLogo({ dark = false }: { dark?: boolean }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/sheggar-wheels-logo.webp"
      alt="Sheggar Wheels"
      className="h-10 w-auto object-contain transition-all duration-300 sm:h-11 lg:h-10 xl:h-11"
      style={{
        filter: dark ? "brightness(0)" : "brightness(0) invert(1)",
      }}
    />
  );
}

/* ── Account actions ─────────────────────────────────────────────────── */

function AccountActions({
  pastHero,
  mobile = false,
}: {
  pastHero: boolean;
  mobile?: boolean;
}) {
  const { session, user, hydrated } = useCurrentUser();
  const wrapper = mobile
    ? "mt-4 grid gap-2 border-t border-zinc-800 pt-4"
    : "flex items-center gap-2";
  const secondary = mobile
    ? "flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
    : pastHero
      ? "flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
      : "flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-white";
  const primary = mobile
    ? "flex min-h-11 items-center justify-center rounded-xl bg-yellow-400 px-4 text-sm font-semibold text-black transition-colors hover:bg-yellow-300"
    : "group flex min-h-11 items-center gap-1.5 rounded-lg bg-yellow-400 px-4 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-yellow-300";

  if (!hydrated || !session) {
    return (
      <div className={wrapper}>
        <Link href="/signin" className={secondary}>
          Sign in
        </Link>
        <Link href="/signup" className={primary}>
          Get Started
          {mobile ? null : (
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          )}
        </Link>
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <Link
        href={homeForUser(user)}
        className={`${secondary} max-w-44 truncate`}
      >
        {user?.name ?? "Dashboard"}
      </Link>
      <SignOutButton className={secondary} />
    </div>
  );
}

/* ── Panel card ──────────────────────────────────────────────────────── */

function PanelCardItem({ item }: { item: PanelCard }) {
  const content = (
    <>
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(234,179,8,0.06),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10">
        <h4 className="text-sm font-semibold text-white">{item.title}</h4>
        {item.description && (
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400">
            {item.description}
          </p>
        )}
      </div>
      <span className="relative z-10 mt-auto pt-3 text-xs font-medium text-zinc-600 transition-colors group-hover:text-yellow-400">
        Explore <ArrowRight className="ml-1 inline size-3" />
      </span>
    </>
  );

  const cls =
    "group relative flex min-h-[140px] flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/40";

  if (item.href) {
    return (
      <Link href={item.href} className={cls}>
        {content}
      </Link>
    );
  }

  return <div className={cls}>{content}</div>;
}

/* ── Dropdown panel ──────────────────────────────────────────────────── */

function DropdownPanel({ panel }: { panel: MenuPanel }) {
  const cols =
    panel.items.length === 3
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className={`grid ${cols} gap-3 p-5`}>
      {panel.items.map((item) => (
        <PanelCardItem key={item.title} item={item} />
      ))}
    </div>
  );
}

/* ── Main navbar component ───────────────────────────────────────────── */

export default function Header() {
  const pathname = usePathname();
  return <HeaderShell key={pathname} />;
}

function HeaderShell() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileActiveMenu, setMobileActiveMenu] = useState<string | null>(
    null
  );
  const [pastHero, setPastHero] = useState(false);
  const activePanel = getPanel(activeMenu);

  const toggleMenu = (menuName: string) =>
    setActiveMenu(activeMenu === menuName ? null : menuName);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.querySelector(".hero-scroll-wrapper");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        setPastHero(rect.bottom <= 0);
      } else {
        setPastHero(true);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        pastHero
          ? "bg-white/90 shadow-sm backdrop-blur-lg dark:bg-zinc-950/90"
          : ""
      }`}
    >
      {/* ── Desktop ───────────────────────────────────────── */}
      <div className="relative z-30 mx-auto hidden h-14 w-full max-w-7xl items-center justify-between px-6 lg:flex">
        {/* Logo */}
        <Link href="/" className="relative z-10">
          <SheggarLogo dark={pastHero} />
        </Link>

        {/* Centred pill navbar — all items inside */}
        <div
          className="absolute left-1/2 top-0 w-[560px] -translate-x-1/2 xl:w-[780px]"
          style={{
            filter: "drop-shadow(0 8px 24px rgba(0, 0, 0, 0.35))",
          }}
        >
          {/* Corner filler SVGs */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute -left-[18px] top-0 z-10 text-black"
          >
            <path
              d="M 20 20 L 20 0 L 0 0 C 11.046 0 20 11.046 20 20 Z"
              fill="currentColor"
            />
          </svg>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute -right-[18px] top-0 z-10 text-black"
          >
            <path
              d="M 0 0 L 20 0 C 8.954 0 0 8.954 0 20 Z"
              fill="currentColor"
            />
          </svg>

          <motion.div
            animate={{ height: activePanel ? 280 : 56 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative flex w-full flex-col justify-start overflow-hidden bg-black"
            style={{
              borderBottomLeftRadius: "16px",
              borderBottomRightRadius: "16px",
            }}
          >
            {/* Nav row */}
            <div className="z-20 flex h-14 items-center justify-center px-8">
              <nav className="flex w-full items-center justify-center gap-1">
                {navItems.map((item) =>
                  item.panelId ? (
                    <button
                      key={item.label}
                      onClick={() => toggleMenu(item.panelId!)}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium outline-none transition-all duration-200 hover:text-white ${
                        activeMenu === item.panelId
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400"
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        className={`size-4 opacity-70 transition-transform duration-300 ${
                          activeMenu === item.panelId ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href || "#"}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </nav>
            </div>

            {/* Dropdown panel */}
            <AnimatePresence mode="wait">
              {activePanel && (
                <motion.div
                  key={activePanel.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden border-t border-zinc-800"
                >
                  <DropdownPanel panel={activePanel} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right side — session actions */}
        <div className="relative z-10">
          <AccountActions pastHero={pastHero} />
        </div>
      </div>

      {/* ── Mobile ────────────────────────────────────────── */}
      <div className="relative z-30 flex h-14 w-full items-center justify-between px-4 lg:hidden">
        <Link href="/">
          <SheggarLogo dark={pastHero} />
        </Link>
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="site-menu"
          onClick={() => setMobileOpen((open) => !open)}
          className={`grid size-10 place-items-center rounded-lg border transition-colors ${
            pastHero
              ? "border-zinc-300 text-zinc-900 dark:border-zinc-700 dark:text-white"
              : "border-zinc-700 text-white"
          }`}
        >
          {mobileOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="site-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-20 mx-4 overflow-hidden rounded-2xl border border-zinc-800 bg-black/95 text-white shadow-2xl backdrop-blur-xl lg:hidden"
          >
            <div className="grid gap-1 p-5">
              {navItems.map((item) => {
                const panel = item.panelId
                  ? getPanel(item.panelId)
                  : null;
                const isOpen = mobileActiveMenu === item.panelId;

                if (!item.panelId) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href || "#"}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() =>
                        setMobileActiveMenu(
                          isOpen ? null : item.panelId!
                        )
                      }
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-base font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
                    >
                      {item.label}
                      <ChevronDown
                        className={`size-5 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && panel && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mx-4 mb-2 grid gap-1 border-l-2 border-yellow-400/30 pl-4 pt-1">
                            {panel.items.map((panelItem) => (
                              <Link
                                key={panelItem.title}
                                href={panelItem.href || "#"}
                                className="rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
                              >
                                <span className="block text-sm font-semibold text-white">
                                  {panelItem.title}
                                </span>
                                {panelItem.description && (
                                  <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">
                                    {panelItem.description}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              <AccountActions pastHero mobile />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
