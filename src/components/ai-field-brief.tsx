"use client";

import { useState } from "react";

type Props = {
  slug: string;
  canUseAiBrief: boolean;
};

export default function AiFieldBrief({ slug, canUseAiBrief }: Props) {
  const [brief, setBrief] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadBrief() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quests/${slug}/brief`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message ?? "Nem sikerult betolteni az AI terepbriefet.");
        return;
      }

      setBrief(data.data?.brief ?? null);
    } catch {
      setError("Most nem sikerult kapcsolatot letrehozni az AI terepbriefhez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-[#d9c8a4] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7b5f2e]">
            AI terepbrief
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Rovid raindito utmutatas</h2>
          <p className="mt-3 max-w-2xl text-[#52645c]">
            Kerj egy friss, kuldetesre szabott rovid briefet, ami segit, mire
            figyelj a helyszinen.
          </p>
        </div>

        <button
          type="button"
          onClick={loadBrief}
          disabled={!canUseAiBrief || loading}
          className="inline-flex rounded-lg bg-[#1b4332] px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Brief keszul..." : "AI brief kerese"}
        </button>
      </div>

      {!canUseAiBrief ? (
        <p className="mt-4 text-sm text-[#7b5f2e]">
          Az AI brief bejelentkezes utan erheto el.
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm text-[#7b5f2e]">{error}</p> : null}

      {brief ? (
        <div className="mt-5 rounded-lg bg-[#fffaf0] p-4">
          <p className="whitespace-pre-line text-[#52645c]">{brief}</p>
        </div>
      ) : null}
    </section>
  );
}
