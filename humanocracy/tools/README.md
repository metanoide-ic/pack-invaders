# Ferramentas de build

## Personagens — pipeline atual (procedural)

Os retratos dos cidadãos são gerados em runtime por **`faces.js`** (motor
procedural analog-horror): pintura em canvas (chiaroscuro, órbitas, cabelo fio a
fio, assimetria/inclinação por pessoa) + pós-processamento VHS (dessaturação,
aberração cromática, dithering Bayer, scanlines, grão, rasgos de tracking).
Determinístico por `f.fseed` — a mesma pessoa rende o mesmo rosto no documento,
no guichê e no exame, em qualquer releitura da campanha.

Não há mais assets de imagem: `characters.js` (photobash) foi descartado, o que
derrubou o build standalone de ~1,8MB para ~600KB. Os scripts `build.js` e
`process.js` desta pasta eram o pipeline photobash antigo e ficam aqui apenas
como referência histórica — nada no jogo os usa.

## Ajuste do visual

Os parâmetros do filtro estão em `faces.js`:
- `PORTRAIT_POST` — foto de documento (níveis de quantização, grão, vinheta);
- `examSVG()` / `renderActorBust()` — presets do exame e do busto do guichê;
- `analogPost()` — a cadeia completa (sat, contraste, aberr, bleed, dither,
  scanlines, grão, tears, vinheta).

## Bundle standalone

```bash
node tools/bundle.js   # regera humanocracy-standalone.html (a partir de humanocracy/)
```
