# GitHub Pages preview — setup

Gives you **https://frenchprof.github.io/fluoduo/** — a real URL you can open
on a phone, entirely separate from `fluolingo.withdrchan.com`.

## Apply

    cd ~/fluoduo
    unzip -o ~/Downloads/pages-preview.zip
    git add -A
    git commit -m "ci: GitHub Pages preview build at /fluoduo subpath"
    git push origin main

## Then two dashboard steps, both one-time

**1. Turn Pages on** — GitHub → repo → Settings → Pages → *Source: GitHub
Actions*. (Not "Deploy from a branch".)

**2. Authorise the domain in Firebase** — console → Authentication → Settings →
Authorised domains → Add domain → `frenchprof.github.io`.

Skip step 2 and Google sign-in fails on the preview, which means `/moi` and
`/teacher` show you the signed-out view and nothing to judge. This is the step
that is easy to forget and looks like a broken build.

## What works there, and what does not

Works: decks, all games, every drill, `/moi`, `/teacher`, sign-in, everything
that talks to Firebase from the browser.

**Does not work:** ChaTutor, text-to-speech, Compose's answer-checking, and
`/api/correct`. Those four are Cloudflare Pages Functions — server-side code
holding your API key. GitHub Pages has no server. They will fail on the
preview and are unaffected in production.

For judging layout, which is what this is for, that costs nothing.

## Why next.config.ts changed

    const basePath = process.env.PAGES_BASE_PATH ?? "";

Cloudflare serves the site at a domain ROOT; GitHub Pages serves a project site
from a SUBDIRECTORY. Without a basePath every stylesheet and script would
resolve to the domain root and 404.

The variable is set only by the workflow, so a normal `npm run build` is
byte-for-byte what it was before. Verified both ways:

    npm run build                        →  href="/_next/static/…"
    PAGES_BASE_PATH=/fluoduo npm run build →  href="/fluoduo/_next/static/…"

Hard-coding the subpath would have broken production the next time anyone built
without the variable.

## Every push to main rebuilds it

The workflow also runs on demand: Actions tab → *Preview to GitHub Pages* →
Run workflow. Builds take ~3 minutes (737 static pages).
