# tools

Geradores das animações de chroma key usadas em edição de vídeo.

Todas saem em 1920x1080, 30fps, 5s, H.264/yuv420p, com fundo verde puro
(`#00FF00`) para recorte.

| script | saída | cena |
|---|---|---|
| `negocio_captura.py` | `negocio_capturado.mp4` | a palavra NEGÓCIO tenta fugir e é capturada por uma rede |
| `precos_rasgado.py` | `precos_rasgado.mp4` | um papelzinho escrito PREÇOS é rasgado ao meio |

`chroma_common.py` guarda o que os dois compartilham: formato de saída,
paleta, easings, fonte e a chamada do ffmpeg.

## Como rodar

```sh
pip install pillow imageio-ffmpeg numpy   # numpy só é usado pelo precos_rasgado
python3 tools/negocio_captura.py saida.mp4
```

Sem argumento, cada script grava com o nome padrão da tabela acima.

## Regra do chroma

Nada semitransparente pode encostar no fundo: um pixel com alpha parcial vira
verde escuro na hora do key. Por isso todo elemento de frente é opaco, e os
efeitos entram e saem mudando de tamanho ou espessura, nunca de opacidade.
Pela mesma razão as cores de frente ficam longe do verde no espectro.
