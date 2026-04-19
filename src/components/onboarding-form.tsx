"use client";

import { useState } from "react";
import { AVATAR_PRESETS, CHARACTER_CLASSES } from "@/lib/onboarding";

type Props = {
  defaultName: string;
};

export default function OnboardingForm({ defaultName }: Props) {
  const [characterName, setCharacterName] = useState(defaultName);
  const [characterClass, setCharacterClass] = useState("hunter");
  const [avatarPreset, setAvatarPreset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterName, characterClass, avatarPreset }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok || !data.success) {
      setError(data.message ?? "Nem sikerült elmenteni a hősödet.");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[#d9c8a4] bg-white p-6 shadow-sm"
    >
      <label
        className="block text-sm font-semibold text-[#193226]"
        htmlFor="characterName"
      >
        Hős neve
      </label>
      <input
        id="characterName"
        value={characterName}
        onChange={(event) => setCharacterName(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[#cbb98f] px-4 py-3 outline-none focus:border-[#1b4332]"
        required
      />

      <div className="mt-6 grid gap-3">
        {CHARACTER_CLASSES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCharacterClass(item.id)}
            className={`rounded-lg border p-4 text-left transition ${
              characterClass === item.id
                ? "border-[#1b4332] bg-[#e5f1e8]"
                : "border-[#d9c8a4] bg-white hover:border-[#7b5f2e]"
            }`}
          >
            <span className="font-semibold">{item.label}</span>
            <span className="mt-1 block text-sm text-[#52645c]">
              {item.summary}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {AVATAR_PRESETS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => setAvatarPreset(avatar.id)}
            className={`rounded-lg border px-3 py-4 text-sm font-semibold ${
              avatarPreset === avatar.id
                ? "border-[#1b4332] bg-[#1b4332] text-white"
                : "border-[#d9c8a4] bg-[#fffaf0] text-[#193226]"
            }`}
          >
            {avatar.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-[#1b4332] px-5 py-3 font-semibold text-white hover:bg-[#255f46] disabled:opacity-60"
      >
        {loading ? "Hős feljegyzése..." : "Belépek Naturaliába"}
      </button>
    </form>
  );
}
