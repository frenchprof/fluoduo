"use client";

import { useState } from "react";
import FlashcardLesson from "./FlashcardLesson";
import LetrisGame, { type LetrisSet } from "./LetrisGame";

type Stage = "lesson" | "game";

export default function LetrisFlow({ set }: { set: LetrisSet }) {
  const [stage, setStage] = useState<Stage>("lesson");
  return stage === "lesson" ? (
    <>
      <FlashcardLesson set={set} onStartGame={() => setStage("game")} />
      <div className="mx-auto -mt-2 flex w-full max-w-3xl items-center justify-end px-4 pb-6 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => setStage("game")}
          className="hover:text-slate-300"
        >
          Already know these? Jump to game →
        </button>
      </div>
    </>
  ) : (
    <>
      <LetrisGame set={set} />
      <div className="mx-auto -mt-2 flex w-full max-w-4xl items-center justify-end px-4 pb-6 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => setStage("lesson")}
          className="hover:text-slate-300"
        >
          ← Back to lesson
        </button>
      </div>
    </>
  );
}
