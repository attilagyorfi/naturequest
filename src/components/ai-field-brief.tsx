"use client";

import { useEffect, useState } from "react";

type Props = {
  slug: string;
};

export default function AiFieldBrief({ slug }: Props) {
  const [brief, setBrief] = useState<string | null>(null);
  const [narrationStyle, setNarrationStyle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

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
      setNarrationStyle(data.data?.narrationStyle ?? null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    } catch {
      setError("Most nem sikerult kapcsolatot letrehozni az AI terepbriefhez.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAudio() {
    if (!brief) {
      return;
    }

    setAudioLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quests/${slug}/brief-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: brief }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(
          data.message ?? "Nem sikerult letrehozni a hangos AI briefet."
        );
        return;
      }

      const blob = await response.blob();
      const nextAudioUrl = URL.createObjectURL(blob);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(nextAudioUrl);
    } catch {
      setError("Most nem sikerult letrehozni a hangos AI briefet.");
    } finally {
      setAudioLoading(false);
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
          disabled={loading}
          className="inline-flex rounded-lg bg-[#1b4332] px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Brief keszul..." : "AI brief kerese"}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-[#7b5f2e]">{error}</p> : null}

      {brief ? (
        <div className="mt-5 rounded-lg bg-[#fffaf0] p-4">
          {narrationStyle ? (
            <p className="mb-3 text-sm font-semibold text-[#7b5f2e]">
              Hangulat: {narrationStyle}
            </p>
          ) : null}

          <p className="whitespace-pre-line text-[#52645c]">{brief}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadAudio}
              disabled={audioLoading}
              className="inline-flex rounded-lg border border-[#d9c8a4] bg-white px-4 py-3 font-semibold text-[#193226] disabled:opacity-60"
            >
              {audioLoading ? "Hang keszul..." : "Hangos AI brief"}
            </button>
          </div>

          {audioUrl ? (
            <audio
              controls
              autoPlay
              preload="none"
              className="mt-4 w-full"
              src={audioUrl}
            >
              A bongeszod nem tamogatja a hang lejatszasat.
            </audio>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
