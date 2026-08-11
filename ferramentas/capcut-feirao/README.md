# Feirão — automação de edição

App de mesa (Windows) que prepara os vídeos de feirão: corta os silêncios,
gera as legendas e monta a estrutura padrão — para você terminar no CapCut.

## Instalar (uma vez só)

1. Instale o Python 3.10 ou mais novo: <https://www.python.org/downloads/>
   **Marque a caixinha "Add Python to PATH"** na primeira tela do instalador.
2. Baixe esta pasta para o seu computador.
3. Clique duas vezes em **RODAR.bat**. Na primeira vez ele instala sozinho o
   que falta e abre a janela.

Para ativar as **legendas automáticas**, abra o Prompt de Comando e rode:

```
pip install faster-whisper
```

Para ativar a **edição por IA** (você escreve o pedido em português):

```
pip install anthropic
setx ANTHROPIC_API_KEY "sua-chave-aqui"
```

A chave sai de <https://console.anthropic.com>. Feche e abra o app depois de
configurar. Cada pedido custa alguns centavos — o vídeo em si nunca é enviado,
só a transcrição e alguns quadros reduzidos.

A transcrição roda na sua máquina, offline — nenhum vídeo seu sobe para a
internet. A primeira execução baixa o modelo (algumas centenas de MB) e
depois fica salvo.

Para ativar o **texto atrás da pessoa** (o app recorta a pessoa sozinho):

```
pip install rembg onnxruntime
```

São ~50 MB de biblioteca e 5 MB de modelo, baixados na primeira vez. Sem isso
o app continua funcionando: o texto fica na frente e ele avisa.

## Como usar

Tudo o que o app produz vai para a pasta **`Feirao`** na sua Área de Trabalho.

### Passo 1 — Mapear o seu CapCut

Monte **um** projeto no CapCut do jeito que você quer que os vídeos fiquem:
proporção, fontes, cores das legendas, posição dos textos. Esse projeto vira
o seu **modelo**.

Depois clique em *"Procurar meu CapCut e gerar relatório"*. O app acha a pasta
de projetos, lê o mais recente e gera `inspecao_capcut.json`.

Me mande esse arquivo. Ele descreve só a **estrutura** do projeto (nomes de
campos e quantidades), sem os seus caminhos pessoais nem o conteúdo dos
vídeos — dá para abrir no bloco de notas e conferir.

### Passo 2 — Preparar um vídeo

Escolha o vídeo, marque o que quer e clique em *Preparar*. Sai:

- `<nome>_cortado.mp4` — sem os silêncios
- `<nome>.srt` — as legendas, já ajustadas aos cortes

No CapCut: **Legendas → Importar legendas** e escolha o `.srt`.

## Pedir a edição em português

No Passo 3, escreva o que quer como falaria com um editor:

> corta os silêncios, poe legenda viral amarela, deixa a cor puxada pro quente,
> e quando ele falar RASGANDO PREÇO mostra a palavra PREÇO num papel sendo
> rasgado

O app transcreve a fala **com o tempo de cada palavra**, olha alguns quadros do
vídeo, e o Claude devolve um **plano de edição** — uma lista de ações com o
segundo exato de cada uma e o motivo.

Sai na pasta `Feirao` um vídeo **pronto**, com tudo o que foi pedido já dentro
dele: cortes, velocidade, transições, cor, movimento de câmera, efeitos,
textos, legendas queimadas, animações e áudio. O nome do arquivo final depende
do último passo aplicado (`_com_audio.mp4`, `_animado.mp4`, `_legendado.mp4`…)
e o roteiro sempre diz qual é.

Junto vêm:

- `<nome>_anim1_*.mp4` — cada animação também **em separado**, em fundo verde,
  caso você queira refazer aquele momento na mão no CapCut
- `<nome>_legendas.ass` — o estilo da legenda, se quiser reaproveitar
- `<nome>.srt` — a transcrição já ajustada à linha do tempo final
- `<nome>_roteiro.txt` — em que segundo entra cada coisa, o motivo de cada
  escolha, e o que **não** deu para fazer

### Legendas virais

As legendas são **queimadas no vídeo**, não exportadas como `.srt`. A diferença
importa: `.srt` não carrega estilo nenhum, então o CapCut aplica o dele e nunca
fica igual ao que você pediu. Queimando, o que sai é exatamente o visual
escolhido — e a palavra que está sendo falada acende e cresce, que é o efeito
das legendas de Reels.

| Estilo | Quando usar |
|---|---|
| `viral_amarelo` | Oferta e anúncio. O mais comum de Reels e TikTok. |
| `viral_verde` | Igual, mas acende em verde limão. Combina com desconto. |
| `caixa_preta` | Faixa preta sólida. Depoimento, explicação, fundo bagunçado. |
| `uma_palavra` | Uma palavra gigante por vez. Prende muito, cansa em vídeo longo. |

O Claude escolhe também **onde** a legenda fica (`padrao`, `alta`, `centro`) —
ele vê os quadros, então se o rodapé já tem faixa de preço ele sobe a legenda
sozinho.

> Precisa do `faster-whisper` instalado: sem o tempo de cada palavra não existe
> legenda viral. O app avisa em vez de entregar algo torto.

### Por que o modelo não pode inventar efeito

O Claude não escreve efeito nenhum: ele **escolhe de uma lista fechada** que o
app sabe executar (`feirao/acoes.py`). Essa lista é montada a partir do que
existe de verdade em `animacoes.py`, `estilos.py`, `movimento.py`,
`efeitos.py`, `transicoes.py` e `audio.py` — é impossível ele pedir algo que o
executor não saiba fazer, e há teste garantindo que contrato e implementação
não se separem. Se pedir um tempo fora do vídeo ou um corte invertido, aquela
ação é descartada com aviso e o resto continua valendo.

Para ensinar um efeito novo: escreva a função, registre, pronto.

### Movimento de câmera (keyframes)

O que o CapCut chama de keyframe: a imagem se move entre um começo e um fim.
É o que tira a cara de slide parado.

| Nome | O que faz |
|---|---|
| `zoom_in` / `zoom_out` | Aproxima ou afasta devagar |
| `pan_direita` / `pan_esquerda` | Varre a imagem na horizontal |
| `pan_cima` / `pan_baixo` | Varre na vertical |
| `tremor` | Tremida de câmera na mão. Curto: 0,3 a 0,8s |
| `pulso` | Batida rítmica de zoom, para acompanhar música |

Cada um aceita `intensidade` (0,3 discreto a 1,5 exagerado).

### Efeitos

| Nome | O que faz |
|---|---|
| `flash` | Clarão branco na virada. Muito curto |
| `glitch` | Separa as cores, como sinal falhando |
| `estrobo` | Pisca o brilho, tipo luz de balada |
| `vinheta` | Escurece as bordas, fecha o olho no centro |
| `grao` | Granulado de filme |
| `desfoque` | Desfoca um trecho |
| `preto_e_branco` | Tira a cor |
| `saturar` | Estoura a cor quando o produto aparece |

Movimento e efeito rodam num passe só de renderização — cada reencode a mais
custaria qualidade.

### Velocidade

Câmera lenta e acelerado, de 0,25x a 4x. Segure em lenta o ponto alto (o preço
aparecendo, a reação do cliente) e acelere o caminho (andar até o carro, abrir
o capô).

O ponto delicado: **câmera lenta faz o vídeo ficar mais longo**. Um efeito que
você marcou no segundo 12 continua em cima da mesma fala depois disso — quem
faz essa conta é `feirao/tempo.py`, que trata corte, velocidade e transição
como uma linha do tempo só. É o mesmo lugar que reposiciona a legenda: uma
palavra falada dentro de um trecho em câmera lenta fica na tela pelo dobro do
tempo, como tem de ser.

### Transições

| Nome | O que faz |
|---|---|
| `fade` | Dissolve um no outro. Neutra, serve quase sempre |
| `fade_preto` / `fade_branco` | Passa pelo preto ou pelo branco. Marca virada |
| `deslizar_esquerda` / `deslizar_cima` | O próximo empurra o atual |
| `zoom` | Entra crescendo. Boa para revelar oferta |
| `circulo` | Abre em círculo do centro |
| `pixelado` | Quebra em blocos e remonta |
| `cortina` | Varre a tela de um lado ao outro |

Não existe "corte seco" na lista de propósito: a ausência de transição **já é**
o corte seco. Uma transição pedida perto de um corte gruda naquele corte; longe
de qualquer corte, ela parte o vídeo ali mesmo e cruza as duas metades — que é
o que o CapCut faz ao soltar uma transição no meio de um clipe.

Transição **come tempo** dos dois lados: o vídeo encurta pela duração dela. Se
os dois trechos vizinhos forem curtos demais para se cruzar, o app deixa de
fora e escreve o motivo no roteiro em vez de entregar um vídeo estranho.

### Áudio

Três coisas:

- **Trilha.** Escolha uma música no Passo 3. Ela entra por baixo com fade de
  entrada e de saída, e se repete sozinha quando é mais curta que o vídeo.
- **Abaixar na fala.** A música cai ~11 dB sozinha enquanto alguém fala e volta
  depois (`sidechaincompress` — o truque de rádio, que no CapCut se faz na mão
  keyframe por keyframe). Ligado por padrão quando o vídeo tem fala.
- **Efeitos sonoros.** Sintetizados na hora pelo próprio ffmpeg — não há
  arquivo para baixar nem licença para conferir.

| Som | Quando usar |
|---|---|
| `whoosh` | Corte rápido, virada de câmera, entrada de texto |
| `impacto` | Batida grave. O momento em que a oferta aparece |
| `pop` | Texto que surge, selo que bate |
| `sino` | Confirma, aprova, fecha negócio |
| `moeda` | Preço, desconto, condição de pagamento |
| `clique` | Ritmo de corte rápido, item de lista |
| `subida` | Tensão que cresce. Vai **antes** do ponto alto |

A passada de áudio é a última e copia a imagem sem recomprimir — colocar música
não custa qualidade nenhuma de vídeo.

### Texto na tela, e atrás da pessoa

Texto é diferente de legenda: legenda acompanha a fala inteira, texto é uma
frase curta que você coloca de propósito (preço, condição, nome da loja). Três
estilos (`impacto`, `oferta`, `sutil`) e cinco posições, com fade curto de
entrada e saída.

Com `rembg` instalado, o Claude pode pedir `atras_da_pessoa`: o app recorta a
pessoa quadro a quadro e monta as três camadas — vídeo, texto, pessoa por cima.
É o efeito que faz o vídeo parecer editado por gente.

Custa cerca de meio segundo de CPU por quadro, então é limitado a 5 segundos
por trecho e o app avisa antes de começar. Sem a biblioteca, o texto fica na
frente e isso aparece nos avisos — nunca sai calado.

### Animações que existem hoje

| Nome | O que é |
|---|---|
| `rasgar_papel` | Papel com uma palavra sendo rasgado ao meio |
| `carimbo` | Carimbo caindo e batendo na tela |
| `confete` | Explosão de confete |
| `zoom_impacto` | Anel de choque para dar ênfase |

Elas são desenhadas em fundo verde e o app **chaveia o verde sozinho**, então
já saem dentro do vídeo final. O arquivo em fundo verde continua na pasta: se
você quiser mexer naquele momento no CapCut, ele está lá.

## Criar um vídeo do zero

### A partir de uma pasta — a IA escolhe as fotos

Clique em *"Usar uma pasta (a IA escolhe)"*. O app:

1. Descarta na hora o que é inequívoco: resolução baixa, foto escura demais,
   estourada de luz. Isso não gasta API.
2. Manda o resto para o Claude, que **olha cada foto** e devolve quais entram,
   em que ordem, e o motivo de cada recusa — repetida, só aparece a roda, contra
   a luz, não mostra o carro.
3. Marca a melhor de todas para abrir o vídeo.

Nenhuma foto some sem explicação: o que o modelo esquecer de citar aparece
como "não foi escolhida".

> **Desfoque não é recusado automaticamente**, de propósito. A medida que dá
> para fazer sem IA confunde "borrada" com "pouco detalhe" — uma foto nítida
> de carro contra céu limpo marca quase igual a uma tremida. Então a medida vai
> como aviso junto da imagem e quem decide é o Claude, que enxerga a foto.

### Escolhendo as fotos na mão

No Passo 4: escolha as fotos dos carros e escreva uma oferta por linha, no
formato `carro | preço | condição`. O app monta abertura, uma cena por oferta
(com aproximação lenta na foto, para não ficar parado) e encerramento com a
marca da loja.

### Vídeo só com texto e animações

Sem foto nenhuma: cartões de texto em sequência, com fundo em degradê
(`escuro`, `gradiente_quente`, `gradiente_frio`, `preto`), keyframes e
animações por cima. Serve para recado, gancho e chamada.

Nesse caso **não peça legenda queimada** — o cartão já é o texto, e as duas
camadas se atropelam. O app orienta o Claude sobre isso.

As cenas entram uma na outra com dissolve. O vídeo nasce sem som; se você tiver
escolhido uma música no Passo 3, ela é colocada no fim da montagem — como não
há fala para atrapalhar, entra em volume cheio. E dá para jogar o resultado no
Passo 3 e pedir legendas e animações em cima dele.

A estrutura fica em `template_feirao.json`, na pasta `Feirao`. Edite no bloco
de notas: durações, textos de abertura e encerramento, formato do texto das
ofertas. Campos entre chaves que você não preencher simplesmente somem da tela.

## O que já funciona e o que ainda não

| Recurso | Estado |
|---|---|
| Criar vídeo do zero com fotos e ofertas | Funciona |
| Criar vídeo só com texto e animações | Funciona |
| Pasta de fotos: a IA escolhe e descarta as inúteis | Funciona |
| Keyframes de câmera (zoom, pan, tremor, pulso) | Funciona |
| Efeitos (flash, glitch, estrobo, vinheta, grão...) | Funciona |
| Velocidade: câmera lenta e acelerado | Funciona |
| Transições entre trechos e entre cenas | Funciona |
| Trilha, abaixar na fala, efeitos sonoros | Funciona |
| Texto na tela (3 estilos, 5 posições) | Funciona |
| Texto **atrás da pessoa**, recorte automático | Funciona (pede `rembg`) |
| Legendas virais queimadas, palavra a palavra | Funciona |
| Tratamento de cor (4 presets, com intensidade) | Funciona |
| Animações geradas com o texto da fala, já chaveadas no vídeo | Funciona |
| Cortar silêncios | Funciona |
| Pedido em português vira plano de edição | Funciona |
| Montar tudo sozinho no CapCut | **Falta o Passo 1** |

## Ajustar o template

O arquivo `template_feirao.json` é criado no primeiro uso e pode ser editado
no bloco de notas: duração de cada bloco, textos de abertura e encerramento,
e o formato do texto das ofertas.

```json
{
  "oferta": {
    "duracao": 4.0,
    "modelo_de_texto": "{carro}\n{preco}\n{condicao}"
  }
}
```

Os campos entre chaves são preenchidos com os dados de cada carro.

## Segurança

- O app **nunca escreve por cima** de um projeto seu: ele clona. E antes de
  qualquer escrita existe `faz_backup()`, que guarda uma cópia datada.
- Feche o CapCut antes de mexer nos projetos, para os dois não escreverem no
  mesmo arquivo ao mesmo tempo.

## Para quem for mexer no código

```
app.py                interface (tkinter)
feirao/media.py       ffmpeg: sondagem, silêncios, corte
feirao/legendas.py    transcrição e SRT
feirao/capcut.py      acha, lista e clona projetos
feirao/inspetor.py    radiografa o formato da sua versão
feirao/template.py    estrutura do vídeo de feirão
feirao/acoes.py       o vocabulário fechado + validação do plano
feirao/cerebro.py     pedido em português -> plano (Claude)
feirao/tempo.py       corte + velocidade + transição numa linha do tempo só
feirao/transicoes.py  as transições (nome em português -> xfade do ffmpeg)
feirao/animacoes.py   as animações, desenhadas por código
feirao/estilos.py     legendas virais (.ass queimado com libass)
feirao/textos.py      texto na tela, na frente ou atrás da pessoa
feirao/recorte.py     recorta a pessoa quadro a quadro (rembg)
feirao/audio.py       trilha, abaixar na fala, efeitos sonoros sintetizados
feirao/movimento.py   keyframes de câmera (expressões dentro do zoompan)
feirao/efeitos.py     efeitos com recorte no tempo
feirao/curadoria.py   pasta de fotos -> a IA escolhe quais entram
feirao/montagem.py    cria vídeo do zero a partir de fotos e ofertas
feirao/fontes.py      as fontes embutidas (pasta fontes/, licença OFL)
feirao/executor.py    aplica o plano; nada aqui é decidido por modelo
fontes/               fontes embutidas, para o visual ser igual em qualquer PC
testes/               testes do núcleo (186, sem chamar a API)
```

A ordem em que o executor aplica as coisas não é arbitrária: linha do tempo e
cor primeiro (é o que define a duração final), depois movimento e efeitos,
depois textos, depois legendas — legenda tem de ficar por cima de tudo e nunca
ser recortada junto com a pessoa — e áudio por último, porque essa passada
copia a imagem sem recomprimir.

A interface só chama o núcleo — a lógica toda está em `feirao/` e é testada
sem precisar de CapCut, de Windows ou de tela:

```
pip install pytest
python -m pytest testes/ -v
```
