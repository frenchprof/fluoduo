/**
 * The LAF1201 ecosystem banner (Dan, 2026-07-14: "we need the top most
 * banner like on this page") — the same dark navy band the course site
 * (st2fr26 / french1.withdrchan.com) carries, so the suite reads as one
 * family: brand LAF1201 · French I on the left, a Tools & Resources
 * dropdown on the right. Here the "Practice & AI tutor" entry is Fluolingo
 * itself (marked as the current site) and TTS is dropped per Dan's call.
 * Static markup + scoped classes copied from the course page's `.utb` CSS;
 * not sticky here — FluoLingo has its own chrome below.
 */

// One Menu, four items, identical on every site of the suite (Dan, 2026-07-14).
const LINKS = [
  { label: "Course Info", href: "https://st2fr26.withdrchan.com/" },
  { label: "FluoLingo", href: "/", here: true },
  { label: "Reader", href: "https://4aparis.withdrchan.com/" },
  { label: "Songs", href: "https://chansongs.withdrchan.com/" },
];

export default function SuiteBanner() {
  return (
    <>
      <style>{`
        .utb { display: flex; align-items: center; gap: 18px; padding: 0 28px; height: 56px;
               background: #0e1530; border-bottom: 1px solid rgba(200,150,62,0.15);
               box-shadow: 0 2px 12px rgba(0,0,0,0.35); color: #e8ddd0;
               font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif; }
        .utb a { text-decoration: none; }
        .utb-brand { display: flex; align-items: baseline; gap: 8px; color: #e8ddd0; font-size: 1.05rem; }
        .utb-brand .utb-code { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 0.85rem; letter-spacing: 0.14em; color: #c8963e; }
        .utb-brand .utb-bsep { color: rgba(232,221,208,0.35); font-weight: 300; }
        .utb-brand .utb-name { font-style: italic; font-weight: 400; color: #e8ddd0; }
        .utb-nav { display: flex; align-items: center; gap: 4px; margin-left: auto; }
        .utb-dd { position: relative; }
        .utb-dd-btn { background: transparent; border: none; cursor: pointer; color: rgba(232,221,208,0.78);
                      font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 11px; letter-spacing: 0.12em;
                      text-transform: uppercase; padding: 8px 12px; border-radius: 4px;
                      display: inline-flex; align-items: center; gap: 6px; min-height: 36px; }
        .utb-dd-btn .dd-caret { font-size: 9px; opacity: 0.7; }
        .utb-dd:hover .utb-dd-btn, .utb-dd:focus-within .utb-dd-btn { color: #f08c48; background: rgba(200,150,62,0.06); }
        .utb-dd-panel { position: absolute; top: 100%; right: 0; margin-top: 2px; min-width: 200px;
                        background: #142346; border: 1px solid rgba(200,150,62,0.18); border-radius: 8px;
                        box-shadow: 0 10px 26px rgba(0,0,0,0.45); padding: 6px; display: none;
                        flex-direction: column; gap: 2px; z-index: 60; }
        .utb-dd:hover .utb-dd-panel, .utb-dd:focus-within .utb-dd-panel { display: flex; }
        .utb-dd-panel a { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 11px; letter-spacing: 0.08em;
                          text-transform: uppercase; color: rgba(232,221,208,0.82); padding: 9px 12px;
                          border-radius: 5px; white-space: nowrap; }
        .utb-dd-panel a:hover { color: #1e1610; background: #e8c98a; }
        .utb-dd-panel a.is-here { color: #f08c48; cursor: default; }
        @media (max-width: 720px) { .utb { padding: 0 14px; } }
      `}</style>
      <nav className="utb" aria-label="LAF1201 ecosystem">
        <a className="utb-brand" href="https://st2fr26.withdrchan.com/">
          <span className="utb-code">LAF1201</span>
          <span className="utb-bsep" aria-hidden>·</span>
          <span className="utb-name">French I</span>
        </a>
        <div className="utb-nav">
          <div className="utb-dd">
            <button className="utb-dd-btn" type="button" aria-haspopup="true">
              Menu <span className="dd-caret" aria-hidden>▾</span>
            </button>
            <div className="utb-dd-panel" role="menu">
              {LINKS.map((l) => (
                <a key={l.label} role="menuitem" href={l.href} className={l.here ? "is-here" : undefined}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
