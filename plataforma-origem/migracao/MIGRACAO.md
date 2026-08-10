# Migração para o repositório Orikay

A plataforma (Orikay) vai morar em um repositório só dela: `metanoide-ic/Orikay`.
Este kit permite completar a mudança a qualquer momento.

## Passo 1 — Criar o repositório (só o dono da conta pode)

1. Abra https://github.com/new
2. Nome: **Orikay**
3. Visibilidade: **Public** (necessário para o site grátis do GitHub Pages)
4. NÃO marque "Add a README"
5. Create repository

## Passo 2 — Enviar o código

Se a sessão do Claude ainda estiver ativa, basta dizer "criei o repositório" —
o envio, a verificação do site e a limpeza do pack-invaders são automáticos.

Manualmente (de qualquer computador com git + Node):

```bash
git clone -b claude/plataforma-origem-site-app-52kx29 \
  https://github.com/metanoide-ic/pack-invaders.git origem-tmp
mkdir orikay-repo
tar -C origem-tmp/plataforma-origem \
  --exclude=node_modules --exclude=dist --exclude=dist-demo \
  --exclude=dist-desktop --exclude=release --exclude='*.tsbuildinfo' \
  -cf - . | tar -xf - -C orikay-repo
cd orikay-repo
mkdir -p .github/workflows
mv migracao/workflows/*.yml .github/workflows/
# aponta os links do README para o novo repositório
sed -i 's|pack-invaders/releases|Orikay/releases|g; s|github.io/pack-invaders|github.io/Orikay|g' README.md
rm -rf migracao
git init -b main && git add -A && git commit -m "Orikay: plataforma da Origem"
git remote add origin https://github.com/metanoide-ic/Orikay.git
git push -u origin main
```

Os workflows publicam sozinhos:
- Site: https://metanoide-ic.github.io/Orikay/
- Instaladores: https://github.com/metanoide-ic/Orikay/releases/tag/instaladores-v1

## Passo 3 — Limpar o pack-invaders (depois que o novo estiver no ar)

- Apagar o branch `gh-pages` do pack-invaders (o site antigo sai do ar):
  `git push origin :gh-pages`
- Apagar a tag/release `instaladores-v1` do pack-invaders:
  `git push origin :refs/tags/instaladores-v1` e excluir a release na aba Releases.
- Remover a pasta `plataforma-origem/` e os workflows `deploy-platform.yml` e
  `desktop-installers.yml` do branch de trabalho.
