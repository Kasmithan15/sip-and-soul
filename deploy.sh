#!/usr/bin/env bash
# Publishes the site to GitHub Pages at https://kasmithan15.github.io/sip-and-soul/
# First run creates the public repository; later runs just upload the latest version.
set -euo pipefail
cd "$(dirname "$0")"

GH=./.tools/gh
REPO=Kasmithan15/sip-and-soul

# Let git push using your GitHub login.
$GH auth setup-git

# Create the repository the first time, then upload the source code.
if ! $GH repo view "$REPO" >/dev/null 2>&1; then
  $GH repo create "$REPO" --public \
    --description "Sip & Soul Café — coffee shop website with a 3D bean intro and a cappuccino pour"
fi
git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$REPO.git"
git push -u origin main

# Build the site and publish the finished files to the gh-pages branch.
npm run build
touch dist/.nojekyll # serve files exactly as built
(
  cd dist
  rm -rf .git
  git init -q -b gh-pages
  git add -A
  git commit -q -m "Deploy site"
  git push -f "https://github.com/$REPO.git" gh-pages
  rm -rf .git
)

# Turn on GitHub Pages the first time.
if ! $GH api "repos/$REPO/pages" >/dev/null 2>&1; then
  $GH api -X POST "repos/$REPO/pages" -f "source[branch]=gh-pages" -f "source[path]=/" >/dev/null
fi

echo
echo "Published. Your site will be live in 1-2 minutes at:"
echo "https://kasmithan15.github.io/sip-and-soul/"
