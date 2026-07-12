"use client";

import { useEffect, useRef, useState } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { speak } from "@/games/letris/speech";

type ChatMsg = { role: "user" | "assistant"; content: string };

const GREETING =
  "Bonjour ! 👋 I'm your French tutor. Ask me anything about the course — or just write a sentence in French and I'll help you polish it.";

function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (input === "" && taRef.current) taRef.current.style.height = "auto";
  }, [input]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: ChatMsg[] = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      
      if ([503, 404, 405, 501].includes(r.status)) {
        setOffline(true);
        return;
      }
      const data = await r.json().catch(() => null);
      if (!r.ok || !data?.reply) {
        const errorMsg = data?.error || `Status ${r.status}`;
        setMessages((m) => [...m, { role: "assistant", content: `DEBUG ERROR: ${errorMsg}` }]);
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: `DEBUG NETWORK ERROR: ${err}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="tutor" crumb="🤖 Tuteur">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-3 py-5">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">🤖 Le Tuteur <span className="text-lg font-bold text-[color:var(--cahier-ink-soft)]">· Tutor</span></h1>

        {offline ? (
          <div className="rounded-2xl border-2 border-dashed border-[color:var(--cahier-ink)]/40 bg-white p-5">
            <p className="text-sm font-bold text-[color:var(--cahier-ink)]">Le tuteur n&rsquo;est pas encore branché ici. 🔌</p>
            <p className="mt-1.5 text-sm text-[color:var(--cahier-ink-soft)]">In the meantime, the tutor still lives on <a href="https://laf1201.withdrchan.com" className="font-bold underline">laf1201.withdrchan.com</a>.</p>
          </div>
        ) : (
          <>
            <div className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <button type="button" onClick={() => speak(m.content, "fr-FR")} title="🔊" className={`max-w-[85%] whitespace-pre-wrap rounded-2xl border-2 px-4 py-2 text-left text-sm leading-relaxed transition hover:brightness-95 ${m.role === "user" ? "rounded-br-sm border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl,#eaff00)]/50 text-[color:var(--cahier-ink)]" : "rounded-bl-sm border-[color:var(--cahier-rule)] bg-white text-[color:var(--cahier-ink)]"}`}>
                    {m.role === "assistant" && <span className="mr-1.5" aria-hidden>🤖</span>}
                    {m.content}
                  </button>
                </div>
              ))}
              {busy && (<p className="animate-pulse text-sm text-[color:var(--cahier-ink-soft)]">🤖 …</p>)}
              <div ref={endRef} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="flex items-end gap-2">
              <textarea lang="fr" ref={taRef} value={input} onChange={(e) => { setInput(e.target.value); autoGrow(e.target); }} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder="Écrivez en français ou posez une question…  (Entrée = envoyer · Maj+Entrée = nouvelle ligne)" rows={1} className="max-h-[260px] min-h-[2.7rem] flex-1 resize-y rounded-lg border-2 border-[color:var(--cahier-rule)] bg-white px-3 py-2 text-[0.95rem] leading-snug text-[color:var(--cahier-ink)] outline-none focus:border-[color:var(--cahier-le)]" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
              <button type="submit" disabled={busy || !input.trim()} className="cahier-btn cahier-btn-accent font-black disabled:opacity-40">Envoyer</button>
            </form>
          </>
        )}
      </div>
    </CahierShell>
  );
}
