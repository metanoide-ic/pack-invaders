# Migração para o repositório Orikay

A plataforma vai morar em um repositório só dela: `metanoide-ic/Orikay`.
O repositório já existe; falta enviar o código.

## Caminho A — deixar o Claude fazer

A sessão do Claude só enxerga os repositórios liberados para ela, e hoje só o
`pack-invaders` está na lista. Para liberar, adicione `metanoide-ic/Orikay` às
**fontes (sources)** da sessão ou do ambiente, em https://claude.ai/code —
no ambiente usado por esta sessão, ou aprovando o pedido quando ele aparecer.

Feito isso, é só dizer "pode migrar": o envio, a conferência do site e a
limpeza do pack-invaders acontecem em seguida.

## Caminho B — rodar você mesmo (5 minutos)

De qualquer computador com git e Node instalados:

```bash
git clone -b claude/plataforma-origem-site-app-52kx29 \
  https://github.com/metanoide-ic/pack-invaders.git origem-tmp

mkdir orikay && tar -C origem-tmp/plataforma-origem \
  --exclude=node_modules --exclude=dist --exclude=dist-demo \
  --exclude=dist-desktop --exclude=release --exclude='*.tsbuildinfo' \
  --exclude=migracao -cf - . | tar -xf - -C orikay

cd orikay
mkdir -p .github/workflows
cp ../origem-tmp/plataforma-origem/migracao/workflows/*.yml .github/workflows/

# aponta os links do README para o novo repositório
sed -i 's|github.io/pack-invaders/|github.io/Orikay/|g; s|metanoide-ic/pack-invaders/releases|metanoide-ic/Orikay/releases|g' README.md

git init -b main
git add -A
git commit -m "Orikay: plataforma completa da Origem"
git remote add origin https://github.com/metanoide-ic/Orikay.git
git push -u origin main
```

No macOS, troque `sed -i` por `sed -i ''`.

Depois do push, os dois workflows rodam sozinhos e em poucos minutos:

- Site: https://metanoide-ic.github.io/Orikay/
  (se der 404, abra Settings → Pages e confirme a origem no branch `gh-pages`)
- Instaladores Windows, macOS e Linux:
  https://github.com/metanoide-ic/Orikay/releases/tag/instaladores-v1

## Passo final — limpar o pack-invaders

Só depois de confirmar que o site novo está no ar:

```bash
cd origem-tmp
git push origin :gh-pages                    # tira o site antigo do ar
git push origin :refs/tags/instaladores-v1   # tira os instaladores antigos
git rm -r plataforma-origem \
  .github/workflows/deploy-platform.yml \
  .github/workflows/desktop-installers.yml
git commit -m "Move a plataforma para o repositório Orikay"
git push
```

A release antiga precisa ser excluída à mão na aba **Releases** do
pack-invaders, porque apagar a tag não remove a release.

## O que vai junto

Todo o conteúdo de `plataforma-origem/`, incluindo:

- `src/` — a plataforma inteira (quadros, posts, vídeos, biblioteca, clientes,
  planejamento, cobrança, financeiro, tráfego pago).
- `conector/` — o Conector Orikay, o programa local que executa WhatsApp,
  Instagram e a busca dos números das campanhas.
- `electron/`, `build/` — o aplicativo desktop e os ícones dos instaladores.
- `README.md`, `GUIA-INTEGRACOES.md`, `conector/LEIA-ME.md` — a documentação.

Fica de fora só a pasta `migracao/` (este guia) e as pastas geradas por build.
