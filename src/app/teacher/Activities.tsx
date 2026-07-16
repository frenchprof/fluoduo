"use client";

/** Which activities carry the class: games (plays, players, scores), deck
 *  opens, supplement opens, flashcard reviews, tutor conversations — all from
 *  the events stream. Teacher accounts excluded. */

import { useMemo } from "react";
import { type Ev, type Learner, str, num } from "./data";
import { Kpi, TableBox, SectionTitle } from "./ui";

export default function Activities({ events, roster, includeTeachers = false }: { events: Ev[]; roster: Learner[]; includeTeachers?: boolean }) {
  const model = useMemo(() => {
    const teachers = new Set(includeTeachers ? [] : roster.filter((l) => l.isTeacher).flatMap((l) => l.uids));
    const nameOf = new Map(roster.flatMap((l) => l.uids.map((u) => [u, l.name] as const)));
    const evs = events.filter((e) => !teachers.has(e.uid));

    const games = new Map<string, {
      starts: number; ends: number; players: Set<string>;
      scoreSum: number; scoreN: number; best: number | null; bestBy: string | null;
    }>();
    const decks = new Map<string, { opens: number; people: Set<string> }>();
    // Keyed by href so supplement.open (flap) and supplement.answer (in-page)
    // land on the same row; label remembered for display.
    const supplements = new Map<string, {
      label: string; opens: number; people: Set<string>; answers: number; correct: number;
    }>();
    let reviews = 0;
    const reviewers = new Set<string>();
    let tutorMsgs = 0;
    const tutorUsers = new Set<string>();

    for (const ev of evs) {
      if (ev.type === "game.start" || ev.type === "game.end") {
        const key = `${str(ev.payload.game) ?? "?"} · ${str(ev.payload.collectionId) ?? ""}`.replace(/ · $/, "");
        let g = games.get(key);
        if (!g) games.set(key, (g = { starts: 0, ends: 0, players: new Set(), scoreSum: 0, scoreN: 0, best: null, bestBy: null }));
        g.players.add(ev.uid);
        if (ev.type === "game.start") g.starts += 1;
        else {
          g.ends += 1;
          const score = num(ev.payload.score);
          if (score !== null) {
            g.scoreSum += score;
            g.scoreN += 1;
            if (g.best === null || score > g.best) {
              g.best = score;
              g.bestBy = nameOf.get(ev.uid) ?? ev.uid.slice(0, 8);
            }
          }
        }
      }
      if (ev.type === "deck.open") {
        const id = str(ev.payload.id) ?? "?";
        let d = decks.get(id);
        if (!d) decks.set(id, (d = { opens: 0, people: new Set() }));
        d.opens += 1;
        d.people.add(ev.uid);
      }
      if (ev.type === "supplement.open" || ev.type === "supplement.answer") {
        const key = str(ev.payload.href) ?? str(ev.payload.label) ?? "?";
        let s = supplements.get(key);
        if (!s) supplements.set(key, (s = { label: key, opens: 0, people: new Set(), answers: 0, correct: 0 }));
        const label = str(ev.payload.label);
        if (label) s.label = label;
        s.people.add(ev.uid);
        if (ev.type === "supplement.open") s.opens += 1;
        else {
          s.answers += 1;
          if (ev.payload.correct === true) s.correct += 1;
        }
      }
      if (ev.type === "flashcard.review") {
        reviews += 1;
        reviewers.add(ev.uid);
      }
      if (ev.type === "tutor.message") {
        tutorMsgs += 1;
        tutorUsers.add(ev.uid);
      }
    }

    return {
      games: [...games.entries()].sort((a, b) => b[1].starts - a[1].starts),
      decks: [...decks.entries()].sort((a, b) => b[1].opens - a[1].opens),
      supplements: [...supplements.entries()].sort((a, b) => b[1].opens - a[1].opens),
      reviews, reviewers: reviewers.size,
      tutorMsgs, tutorUsers: tutorUsers.size,
    };
  }, [events, roster, includeTeachers]);

  return (
    <div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Kpi label="Game variants played" value={model.games.length} />
        <Kpi label="Decks opened" value={model.decks.length} />
        <Kpi label="Flashcard reviews" value={model.reviews} sub={`${model.reviewers} learners`} />
        <Kpi label="Supplement opens" value={model.supplements.reduce((s, [, x]) => s + x.opens, 0)} />
        <Kpi label="Tutor messages" value={model.tutorMsgs} sub={`${model.tutorUsers} learners`} />
      </div>

      <SectionTitle>Games</SectionTitle>
      <TableBox head={["Game", "Plays", "Finished", "Players", "Avg score", "Best (who)"]}>
        {model.games.map(([key, g]) => (
          <tr key={key} className="border-t border-slate-100">
            <td className="px-3 py-2 font-bold text-slate-900">{key}</td>
            <td className="px-3 py-2 text-right text-slate-700">{g.starts}</td>
            <td className="px-3 py-2 text-right text-slate-700">{g.ends}</td>
            <td className="px-3 py-2 text-right font-black text-slate-900">{g.players.size}</td>
            <td className="px-3 py-2 text-right text-slate-700">{g.scoreN > 0 ? Math.round(g.scoreSum / g.scoreN) : "—"}</td>
            <td className="px-3 py-2 text-slate-700">{g.best !== null ? `${g.best} (${g.bestBy})` : "—"}</td>
          </tr>
        ))}
        {model.games.length === 0 && (
          <tr><td className="px-3 py-3 text-slate-500" colSpan={6}>No game plays recorded yet.</td></tr>
        )}
      </TableBox>

      <SectionTitle>Decks</SectionTitle>
      <TableBox head={["Deck", "Opens", "People"]}>
        {model.decks.map(([id, d]) => (
          <tr key={id} className="border-t border-slate-100">
            <td className="px-3 py-2 font-bold text-slate-900">{id}</td>
            <td className="px-3 py-2 text-right text-slate-700">{d.opens}</td>
            <td className="px-3 py-2 text-right font-black text-slate-900">{d.people.size}</td>
          </tr>
        ))}
        {model.decks.length === 0 && (
          <tr><td className="px-3 py-3 text-slate-500" colSpan={3}>No deck opens recorded yet.</td></tr>
        )}
      </TableBox>

      <SectionTitle>Supplements</SectionTitle>
      <TableBox head={["Supplement", "Opens", "People", "Answers", "Correct"]}>
        {model.supplements.map(([key, s]) => (
          <tr key={key} className="border-t border-slate-100">
            <td className="px-3 py-2 font-bold text-slate-900">{s.label}</td>
            <td className="px-3 py-2 text-right text-slate-700">{s.opens}</td>
            <td className="px-3 py-2 text-right font-black text-slate-900">{s.people.size}</td>
            <td className="px-3 py-2 text-right text-slate-700">{s.answers}</td>
            <td className="px-3 py-2 text-right text-slate-700">
              {s.answers > 0 ? `${Math.round((s.correct / s.answers) * 100)}%` : "—"}
            </td>
          </tr>
        ))}
        {model.supplements.length === 0 && (
          <tr><td className="px-3 py-3 text-slate-500" colSpan={5}>No supplement opens recorded yet.</td></tr>
        )}
      </TableBox>
    </div>
  );
}
