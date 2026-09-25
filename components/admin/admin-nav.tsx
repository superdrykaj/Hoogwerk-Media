"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconProps = { className?: string };

function IconHome({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" strokeLinecap="round" />
    </svg>
  );
}

function IconMail({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 6.5 7.5 6 7.5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconImage({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4.5 17 5-5 4 4 3-3 4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTag({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <path d="M11.5 4h-4a2 2 0 0 0-1.4.6L4 6.7v4.1a2 2 0 0 0 .6 1.4l7.3 7.3a2 2 0 0 0 2.8 0l4.9-4.9a2 2 0 0 0 0-2.8L12.3 4.5A2 2 0 0 0 11.5 4Z" strokeLinejoin="round" />
      <circle cx="9" cy="9" r="1" />
    </svg>
  );
}

function IconClock({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSettings({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M17.66 6.34l-1.42 1.42M7.76 16.24l-1.42 1.42M17.66 17.66l-1.42-1.42M7.76 7.76 6.34 6.34" strokeLinecap="round" />
    </svg>
  );
}

type NavItem = {
  href: string;
  label: string;
  icon: (props: IconProps) => React.ReactNode;
  badge?: number;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

function buildGroups(counts: { pending: number; unread: number }): NavGroup[] {
  return [
    {
      label: "Werk",
      items: [
        { href: "/admin", label: "Overzicht", icon: IconHome },
        { href: "/admin/boekingen", label: "Boekingen", icon: IconCalendar, badge: counts.pending },
        { href: "/admin/berichten", label: "Berichten", icon: IconMail, badge: counts.unread },
      ],
    },
    {
      label: "Website",
      items: [
        { href: "/admin/projecten", label: "Projecten", icon: IconImage },
        { href: "/admin/diensten", label: "Diensten", icon: IconTag },
        { href: "/admin/beschikbaarheid", label: "Beschikbaarheid", icon: IconClock },
      ],
    },
    {
      label: "Beheer",
      items: [{ href: "/admin/instellingen", label: "Instellingen", icon: IconSettings }],
    },
  ];
}

export function AdminNav({
  pendingBookings = 0,
  unreadMessages = 0,
}: {
  pendingBookings?: number;
  unreadMessages?: number;
}) {
  const pathname = usePathname();
  const groups = buildGroups({ pending: pendingBookings, unread: unreadMessages });

  return (
    <nav aria-label="Beheermenu" className="relative border-t border-ink-800">
      <div className="container-page flex gap-x-4 gap-y-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {groups.map((group, index) => (
          <div
            key={group.label}
            className={`flex shrink-0 items-center gap-1 ${
              index > 0 ? "border-l border-ink-800 pl-4" : ""
            }`}
          >
            {group.items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-ink-800 font-semibold text-mist-100"
                      : "text-mist-500 hover:text-mist-100"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  {!!item.badge && (
                    <span
                      className="inline-flex min-w-[1.15rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-semibold leading-[1.15rem] text-ink-950"
                      aria-label={`${item.badge} vraagt aandacht`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-ink-900 to-transparent"
      />
    </nav>
  );
}
