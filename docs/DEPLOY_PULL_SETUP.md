# Deploy, pulled from the other direction (Dan's call, 1 Sep)

Why the push mirror failed five times: a fine-grained GitHub token is bound
to ONE resource owner chosen at minting. `LIVE_DEPLOY_TOKEN` was minted
signed in as `frenchprof`, so `dckg/fluo` is not just un-granted — it is
invisible to it, and GitHub answers "Repository not found" by design.

The fix is to reverse the flow: **the workflow lives on `dckg/fluo` and
PULLS from `frenchprof/fluoduo`.** Then the only cross-account credential is
READ-ONLY on fluoduo (mintable from the frenchprof account, no re-login),
and the push half is dckg/fluo pushing to itself, which its own built-in
workflow token does for free. The verify-green guard survives intact.

## Dan's three steps

1. **Mint the read token** (signed in as `frenchprof`, no account switch):
   Settings → Developer settings → Fine-grained tokens → Generate.
   Resource owner **frenchprof** · Only select repositories
   **frenchprof/fluoduo** · Repository permissions: **Contents: Read-only**
   and **Checks: Read-only**. Nothing else.
2. **Store it on the production repo**: `dckg/fluo` → Settings → Secrets
   and variables → Actions → New repository secret →
   name **`SOURCE_READ_TOKEN`** → paste.
3. **Commit the workflow below to `dckg/fluo`** (from the `live` clone):

   ```
   mkdir -p .github/workflows
   # save the YAML below as .github/workflows/pull-from-fluoduo.yml
   git add .github/workflows/pull-from-fluoduo.yml
   git commit -m "deploy: pull verified main from frenchprof/fluoduo"
   git push live main   # or origin, whatever the clone calls dckg/fluo
   ```

Then a deploy is one click: `dckg/fluo` → Actions → **pull-from-fluoduo**
→ Run workflow. (fluoduo-main cannot press that button — its GitHub access
is scoped to frenchprof — so the click is Dan's, which also keeps "when
does a class see new work" a human decision.)

`deploy-live.yml` on this repo stays as the push-direction alternative: it
starts working the day a dckg-minted write token replaces
`LIVE_DEPLOY_TOKEN`. Until then it fails closed.

## The workflow — `.github/workflows/pull-from-fluoduo.yml` on dckg/fluo

```yaml
# Deploy = pull frenchprof/fluoduo's main into this repo, whose Cloudflare
# Pages project auto-builds main. Pull-direction on purpose (Dan, 1 Sep:
# "should be getting from the other direction instead"): the only secret is
# READ-ONLY on the source repo, and the push is this repo pushing to itself.
#
# Refuses any commit whose `verify` check is not green on the source —
# the mirror can never outrun CI.
name: pull-from-fluoduo

on:
  workflow_dispatch:

permissions:
  contents: write

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Fetch the source main
        run: |
          git fetch "https://x-access-token:${{ secrets.SOURCE_READ_TOKEN }}@github.com/frenchprof/fluoduo.git" main
          echo "sha=$(git rev-parse FETCH_HEAD)" >> "$GITHUB_ENV"

      - name: Refuse to deploy a commit verify has not passed
        env:
          GH_TOKEN: ${{ secrets.SOURCE_READ_TOKEN }}
        run: |
          conclusion=$(gh api \
            "repos/frenchprof/fluoduo/commits/${sha}/check-runs?check_name=verify" \
            --jq '.check_runs[0].conclusion // "missing"')
          echo "verify on ${sha}: $conclusion"
          if [ "$conclusion" != "success" ]; then
            echo "verify is not green on the source commit — not deploying"
            exit 1
          fi

      - name: Fast-forward this repo's main
        run: git push origin "${sha}:main"
```
