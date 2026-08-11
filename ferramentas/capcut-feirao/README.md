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

Sai na pasta `Feirao`:

- `<nome>_legendado.mp4` — vídeo pronto: cortes, cor e legendas já queimadas
- `<nome>_anim1_*.mp4` — cada animação, em fundo verde para você chavear
- `<nome>_roteiro.txt` — em que segundo entra cada camada, e o que ficou de fora

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
existe de verdade em `animacoes.py` e `estilos.py` — é impossível ele pedir
algo que o executor não saiba fazer. Se pedir um tempo fora do vídeo ou um
corte invertido, aquela ação é descartada com aviso e o resto continua valendo.

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

### Animações que existem hoje

| Nome | O que é |
|---|---|
| `rasgar_papel` | Papel com uma palavra sendo rasgado ao meio |
| `carimbo` | Carimbo caindo e batendo na tela |
| `confete` | Explosão de confete |
| `zoom_impacto` | Anel de choque para dar ênfase |

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

O vídeo sai **sem som**, para você colocar música ou narração. E dá para jogar
o resultado no Passo 3 e pedir legendas e animações em cima dele — foi assim
que a demonstração foi feita.

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
| Legendas virais queimadas, palavra a palavra | Funciona |
| Tratamento de cor (4 presets, com intensidade) | Funciona |
| Animações geradas com o texto da fala | Funciona |
| Cortar silêncios | Funciona |
| Pedido em português vira plano de edição | Funciona |
| Montar tudo sozinho no CapCut | **Falta o Passo 1** |
| Texto atrás da pessoa | Manual (o roteiro explica o passo a passo) |

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
feirao/animacoes.py   as animações, desenhadas por código
feirao/estilos.py     legendas virais (.ass queimado com libass)
feirao/movimento.py   keyframes de câmera (expressões dentro do zoompan)
feirao/efeitos.py     efeitos com recorte no tempo
feirao/curadoria.py   pasta de fotos -> a IA escolhe quais entram
feirao/montagem.py    cria vídeo do zero a partir de fotos e ofertas
feirao/fontes.py      as fontes embutidas (pasta fontes/, licença OFL)
feirao/executor.py    aplica o plano; nada aqui é decidido por modelo
fontes/               fontes embutidas, para o visual ser igual em qualquer PC
testes/               testes do núcleo (136, sem chamar a API)
```

A interface só chama o núcleo — a lógica toda está em `feirao/` e é testada
sem precisar de CapCut, de Windows ou de tela:

```
pip install pytest
python -m pytest testes/ -v
```
