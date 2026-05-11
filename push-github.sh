#!/bin/bash
# ── Push casamento-mari-lucas → GitHub ──────────────────────
# Execute este script dentro da pasta do projeto:
#   cd "/Users/themidia/Documents/mari e lucas/casamento-mari-lucas"
#   bash push-github.sh

set -e

REPO_DIR="/Users/themidia/Documents/mari e lucas/casamento-mari-lucas"
REMOTE="https://github.com/themidiamkt-cpu/mari-lucas.git"

cd "$REPO_DIR"

# Inicia o repositório se ainda não existir
if [ ! -d ".git" ]; then
  git init
  git checkout -b main
fi

git config user.email "themidiamkt@gmail.com"
git config user.name "The Midia"

# Adiciona o remote (ignora se já existir)
git remote add origin "$REMOTE" 2>/dev/null || git remote set-url origin "$REMOTE"

git add .
git commit -m "feat: site casamento Mari & Lucas — scroll expansion hero, flores parallax, Pix configurado" 2>/dev/null || git commit -m "update: ajustes hero e config Pix"

git push -u origin main

echo ""
echo "✅ Push concluído! Acesse: https://github.com/themidiamkt-cpu/mari-lucas"
