# Animação "ANOTA AÍ" — lápis escrevendo (fundo verde)

Vídeo pronto para uso: **`anota_ai_green_screen.mp4`**

| | |
|---|---|
| Resolução | 1920x1080 (Full HD) |
| Duração | 8,73 s (262 frames) |
| Taxa | 30 fps |
| Codec | H.264 (yuv420p, `+faststart`) |
| Fundo | verde chroma key sólido `#00B140` — RGB (0, 177, 64) |
| Áudio | nenhum |

## O que acontece

1. **0,0–0,55 s** — o lápis desce até a folha.
2. **0,55–6,6 s** — o texto `ANOTA AÍ` é escrito à mão, traço por traço, com o
   lápis levantando entre as letras. A escrita acompanha a inclinação da folha
   e se apoia em uma das linhas do caderno.
3. **6,6–7,4 s** — o lápis sai de quadro.
4. **7,4–8,7 s** — a frase fica parada em tela, pronta para o corte.

## Chroma key

O verde é uma cor plana e uniforme — foi verificado que nenhum pixel fora da
folha desvia do valor `#00B140`, e não há sombra nem brilho projetado sobre o
fundo. Isso mantém o recorte limpo em qualquer editor (Premiere, DaVinci,
CapCut, After Effects, OBS).

Sugestão de recorte: *key color* `#00B140`, tolerância baixa (10–15%) e um
leve *spill suppression* para tirar o contorno esverdeado das bordas da folha.

## Regerar / customizar

```bash
pip install pillow numpy imageio-ffmpeg
python3 render_anota_ai.py anota_ai_green_screen.mp4
```

Constantes no topo de `render_anota_ai.py` que valem ajustar:

| Constante | Efeito |
|---|---|
| `GREEN` | cor do fundo (ex.: `(0, 255, 0)` para verde puro) |
| `CAP_HEIGHT` | tamanho do texto |
| `WRITE_SPEED` | velocidade da escrita, em px/s |
| `HOLD_TIME` | tempo de tela parada no fim |
| `PAPER_W/H`, `PAPER_ROT` | tamanho e inclinação da folha |
| `STROKE_W`, `INK` | espessura e cor do grafite |
| `W`, `H`, `FPS` | formato de saída (ex.: 1080x1920 para vertical) |

O texto é desenhado a partir de traços vetoriais definidos em `GLYPHS` (não
usa fonte instalada), então cada letra é escrita na ordem em que uma pessoa
escreveria, com um jitter de baixa frequência que dá o aspecto de mão humana.
Para trocar a frase, basta editar `seq` em `build_strokes()` usando os glifos
disponíveis (ou acrescentar novos ao dicionário `GLYPHS`).
