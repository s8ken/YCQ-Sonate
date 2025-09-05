# Repository Divergence Plan

This repository serves as the core platform. Two downstream variants will be created:

- Consumer (symbi.world): https://github.com/symbiworld/SYMBI-SYNERGY
- Enterprise (YSEEKU): https://github.com/yseeku/Sonate

## Prepare core for split

1. Ensure working tree is clean and push latest changes
2. Tag split point:

```
git tag -a DIV-READY -m "Divergence ready"
git push --tags
```

## Create Consumer repo (mirror from core)

```
# Create empty repo on GitHub: symbiworld/SYMBI-SYNERGY
git clone --mirror <CORE_REPO_URL>
cd <CORE_REPO_NAME>.git
git push --mirror git@github.com:symbiworld/SYMBI-SYNERGY.git
cd ..
git clone git@github.com:symbiworld/SYMBI-SYNERGY.git symbi-synergy
cd symbi-synergy
```

Post-clone tasks:

- Set `REACT_APP_VARIANT=consumer` in `.env`
- Update branding in `frontend/public/manifest.json`, favicons in `frontend/public/icons/`
- Update README to consumer focus and add demo links

## Create Enterprise repo (mirror from core)

```
# Create empty repo on GitHub: yseeku/Sonate
git clone --mirror <CORE_REPO_URL>
cd <CORE_REPO_NAME>.git
git push --mirror git@github.com:yseeku/Sonate.git
cd ..
git clone git@github.com:yseeku/Sonate.git sonate
cd sonate
```

Post-clone tasks:

- Set `REACT_APP_VARIANT=enterprise` in `.env`
- Default to dark/high-contrast theme (already supported via ThemeContext)
- Update README to enterprise compliance positioning
- Tighten backend CORS origins for production domains

## Keeping variants in sync with core

In each variant repo:

```
git remote add core <CORE_REPO_URL>
git fetch core
git merge core/main   # or cherry-pick specific commits
```

Scope variant-only changes to branding, routes/pages, docs, and env defaults. Upstream shared fixes back into core.

