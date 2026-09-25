"use client";

import { useState } from "react";

const TABS = [
  { key: "algemeen", label: "Algemeen" },
  { key: "boekingsregels", label: "Boekingsregels" },
  { key: "email", label: "E-mail" },
  { key: "bedrijfsgegevens", label: "Bedrijfsgegevens" },
] as const;

export type SettingsTabKey = (typeof TABS)[number]["key"];

type Attention = Partial<Record<SettingsTabKey, boolean>>;

export function SettingsTabs({
  defaultTab = "algemeen",
  attention = {},
  algemeen,
  boekingsregels,
  email,
  bedrijfsgegevens,
}: {
  defaultTab?: SettingsTabKey;
  /** Welke tabs een stip krijgen omdat er iets op te lossen valt. */
  attention?: Attention;
  algemeen: React.ReactNode;
  boekingsregels: React.ReactNode;
  email: React.ReactNode;
  bedrijfsgegevens: React.ReactNode;
}) {
  const [active, setActive] = useState<SettingsTabKey>(defaultTab);
  const panels: Record<SettingsTabKey, React.ReactNode> = {
    algemeen,
    boekingsregels,
    email,
    bedrijfsgegevens,
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Instellingen"
        className="mb-6 flex flex-wrap gap-1 border-b border-ink-700"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={`relative -mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition-colors ${
              active === tab.key
                ? "border-haze-500 font-semibold text-mist-100"
                : "border-transparent text-mist-500 hover:text-mist-100"
            }`}
          >
            {tab.label}
            {attention[tab.key] && (
              <span
                aria-label="Vraagt aandacht"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"
              />
            )}
          </button>
        ))}
      </div>
      {panels[active]}
    </div>
  );
}
