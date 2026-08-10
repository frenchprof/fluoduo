# Patch 14 — the LAF1201 banner, gone

The dark navy `LAF1201 · French I … MENU ▾` band was mounted in
`src/app/layout.tsx`, so it rendered on **every page of the app**, games
included.

It survived the removal on 2026-08-09 because that patch took out a *different*
LAF1201 banner — the blue one. This is `SuiteBanner`, added 2026-07-14 to make
the course sites read as one family.

Removed: the mount, the import, and the component file. Recoverable from git if
the suite banner is ever wanted again.

Verified in the built output: `utb` markup count is **0** on every page. The only
surviving "LAF1201" string is the `<meta name="description">` text — invisible,
and arguably still correct there. Say the word and that goes too.

```bash
cd ~/fluoduo && unzip -o ~/Downloads/patch14.zip && python3 patch14/apply14.py
rm -rf .next && npx tsc --noEmit && npm run build 2>&1 | tail -3 && npm run dev
```

tsc 0 errors, next build 738 pages.
