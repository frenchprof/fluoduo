"use client";

import { useEffect, useState } from "react";
import { speak } from "@/games/letris/speech";

const MAP_PLACES = [
  { name: "le parc", emoji: "🌳" },
  { name: "le café", emoji: "☕" },
  { name: "le cinéma", emoji: "🎬" },
  { name: "le musée", emoji: "🏛️" },
  { name: "le stade", emoji: "🏟️" },
  { name: "la gare", emoji: "🚉" },
  { name: "la banque", emoji: "🏦" },
  { name: "la pharmacie", emoji: "💊" },
  { name: "la poste", emoji: "📮" },
  { name: "la bibliothèque", emoji: "📚" },
  { name: "l'hôtel", emoji: "🏨" },
  { name: "l'école", emoji: "🏫" },
  { name: "l'aéroport", emoji: "✈️" },
  { name: "l'hôpital", emoji: "🏥" },
];

type Category = {
  label: string;
  color: string;
  chip: string;
  phrases: string[];
};

const PHRASE_BANK: Category[] = [
  {
    label: "Verbs",
    color: "bg-blue-100 text-blue-900",
    chip: "border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100",
    phrases: [
      "Vous sortez",
      "Vous allez",
      "Vous continuez",
      "Vous tournez",
      "Vous prenez",
      "Vous traversez",
      "Vous êtes",
    ],
  },
  {
    label: "Completions",
    color: "bg-emerald-100 text-emerald-900",
    chip: "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
    phrases: [
      "du parc",
      "de la station de métro",
      "tout droit",
      "jusqu'au carrefour",
      "au bout de la rue",
      "à gauche",
      "à droite",
      "la première rue à gauche",
      "la deuxième rue à droite",
      "le passage piéton",
      "le pont",
      "la place",
      "arrivé(e)",
    ],
  },
  {
    label: "Connectors",
    color: "bg-purple-100 text-purple-900",
    chip: "border-purple-300 bg-purple-50 text-purple-900 hover:bg-purple-100",
    phrases: ["puis", "ensuite", ", et", "d'abord", "enfin", ", "],
  },
];

function pickRandomPair<T>(arr: T[]): [T, T] {
  const a = arr[Math.floor(Math.random() * arr.length)];
  let b = a;
  while (b === a) b = arr[Math.floor(Math.random() * arr.length)];
  return [a, b];
}

export default function DirectionsMapGame() {
  const lang = "fr-FR";
  const [pair, setPair] = useState<[(typeof MAP_PLACES)[number], (typeof MAP_PLACES)[number]]>(
    () => [MAP_PLACES[0], MAP_PLACES[1]],
  );
  const [dialogue, setDialogue] = useState<string[]>([]);

  useEffect(() => {
    setPair(pickRandomPair(MAP_PLACES));
  }, []);

  const [origin, destination] = pair;
  const dialogueText = dialogue
    .join(" ")
    .replace(/\s+,/g, ",")
    .replace(/\s+/g, " ")
    .trim();

  const addPhrase = (p: string) => setDialogue((d) => [...d, p]);
  const undo = () => setDialogue((d) => d.slice(0, -1));
  const clearOnly = () => {
    setDialogue([]);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  };
  const reset = () => {
    setDialogue([]);
    setPair(pickRandomPair(MAP_PLACES));
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  };
  const speakDialogue = () => {
    if (dialogueText) speak(dialogueText, lang);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 text-[color:var(--cahier-ink)]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="cahier-display text-2xl font-black">Quel est le chemin pour … ?</h1>
          <p className="text-sm text-[color:var(--cahier-ink-soft)]">
            Practice map — assemble the route from <b>A</b> to <b>B</b>.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={undo}
            disabled={dialogue.length === 0}
            className="cahier-btn cahier-btn-sm"
          >
            ↶ Undo
          </button>
          <button
            type="button"
            onClick={clearOnly}
            disabled={dialogue.length === 0}
            className="cahier-btn cahier-btn-sm"
          >
            🧹 Clear
          </button>
          <button
            type="button"
            onClick={reset}
            className="cahier-btn cahier-btn-sm"
          >
            🔄 New route
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-4">
          <div className="text-3xl">📍</div>
          <div>
            <div className="text-xs uppercase tracking-widest text-[color:var(--cahier-ink-soft)]">
              Point A · Departure
            </div>
            <div className="text-xl font-bold">
              {origin.emoji} {origin.name.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-4">
          <div className="text-3xl">🎯</div>
          <div>
            <div className="text-xs uppercase tracking-widest text-[color:var(--cahier-ink-soft)]">
              Point B · Destination
            </div>
            <div className="text-xl font-bold">
              {destination.emoji} {destination.name.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-3xl items-center justify-center gap-3 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white px-4 py-3 text-sm font-semibold">
        <span className="text-2xl" aria-hidden>
          👇
        </span>
        <span>
          Click a phrase below to add it to your route. Press 🔊 to hear it.
        </span>
      </div>

      <div className="min-h-[100px] rounded-xl border-2 border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-2)] p-5">
        <div className="mb-2 text-xs uppercase tracking-widest text-[color:var(--cahier-ink-soft)]">
          Your route
        </div>
        {dialogue.length === 0 ? (
          <p className="italic text-[color:var(--cahier-ink-soft)]">
            Start by tapping a verb phrase below…
          </p>
        ) : (
          <p className="text-xl leading-relaxed">
            {dialogue
              .map((p) => (p === ", " ? "," : p))
              .join(" ")
              .replace(/\s+,/g, ",")
              .replace(/\s+/g, " ")}
          </p>
        )}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={speakDialogue}
            disabled={dialogue.length === 0}
            className="cahier-btn cahier-btn-primary"
          >
            🔊 Speak the route
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {PHRASE_BANK.map((cat) => (
          <section
            key={cat.label}
            className="overflow-hidden rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white"
          >
            <header
              className={`px-4 py-3 text-sm font-bold uppercase tracking-widest ${cat.color}`}
            >
              {cat.label}
            </header>
            <div className="flex flex-wrap gap-2 p-3">
              {cat.phrases.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => addPhrase(p)}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-bold transition ${cat.chip}`}
                  title={`Add ${p}`}
                >
                  {p === ", " ? ",  (comma)" : p}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
