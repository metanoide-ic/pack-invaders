# Personagens photobash + VHS — pipeline

O guichê usa cutouts photobash (foto + recorte) tratados com **brilho reduzido,
contraste alto e um filtro VHS** (aberração cromática, scanlines, grão) — no
estilo *No, I'm Not a Human*. Cada imagem base vira "quase infinitos" cidadãos:
o jogo aplica flip horizontal e variação sutil de matiz/brilho/saturação por
pessoa. Adicione muitas imagens → variedade quase infinita.

## Como adicionar personagens

1. Faça o photobash (foto de corpo inteiro sobre **fundo liso** — branco, cinza
   ou qualquer cor uniforme funciona; o recorte é automático).
2. Salve o PNG em `art_src/`. O **nome dá a dica** de tipo/sexo:
   - `homem_*` / `m_*` → humano masculino
   - `mulher_*` / `f_*` → humana feminina
   - `alt_*` / `altern_*` → Alternado (rosto uncanny)
   - `silente_*` → O Silente (aquele que não se combate)
   - `dog_*` / `cao_*` → cão (Alternado raro / alívio cômico)
   - sem dica → humano, sexo indefinido
   (Ou edite o mapa `META` em `tools/build.js` para controle fino.)
3. Rode o build (precisa do Playwright/Chromium):
   ```bash
   node tools/build.js          # gera characters.js (data URIs VHS)
   node tools/bundle.js         # regera humanocracy-standalone.html
   ```
   Confira o contact sheet gerado (SHEET=/caminho.png node tools/build.js).

## Ajuste do filtro

Os parâmetros do VHS/grade estão em `tools/process.js` (defaults no topo de
`processImage`): `brightness`, `contrast`, `sat`, `aberr`, `grain`, `scan`,
`bleed`, `max` (tamanho final). Reprocessa tudo ao rodar o build de novo.

## Como funciona no jogo

- `characters.js` — manifesto com os cutouts já tratados (data URIs PNG).
- `photochar.js` — em runtime, escolhe um cutout por cidadão (por sexo/tipo),
  desenha no `<canvas #npc-photo>` do guichê com flip + variação, e cai no
  retrato SVG procedural se a foto não estiver disponível.
- `#booth-vhs` (CSS) — scanlines + roll de tracking ao vivo sobre a janela,
  intensificado quando O Silente aparece.
