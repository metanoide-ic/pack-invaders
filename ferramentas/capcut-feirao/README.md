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

> corta os silêncios, deixa a cor puxada pro quente, e quando ele falar
> RASGANDO PREÇO mostra a palavra PREÇO num papel sendo rasgado

O app transcreve a fala com tempo, olha alguns quadros do vídeo, e o Claude
devolve um **plano de edição** — uma lista de ações com o segundo exato de cada
uma e o motivo. O app aplica o que consegue sozinho e escreve um roteiro com o
resto.

Sai na pasta `Feirao`:

- `<nome>_previa.mp4` — cortes e tratamento de cor já aplicados
- `<nome>_anim1_*.mp4` — cada animação, em fundo verde para você chavear
- `<nome>_roteiro.txt` — em que segundo entra cada camada, e o que ficou de fora

### Por que o modelo não pode inventar efeito

O Claude não escreve efeito nenhum: ele **escolhe de uma lista fechada** que o
app sabe executar (`feirao/acoes.py`). Essa lista é montada a partir das
animações que existem de verdade em `feirao/animacoes.py` — então é impossível
o modelo pedir algo que o executor não saiba fazer. Se ele pedir um tempo fora
do vídeo ou um corte invertido, aquela ação é descartada com aviso e o resto do
plano continua valendo.

Para ensinar um efeito novo: escreva a função em `animacoes.py`, registre em
`REGISTRO`, pronto — o Claude passa a poder usá-la no mesmo instante.

### Animações que existem hoje

| Nome | O que é |
|---|---|
| `rasgar_papel` | Papel com uma palavra sendo rasgado ao meio |
| `carimbo` | Carimbo caindo e batendo na tela |
| `confete` | Explosão de confete |
| `zoom_impacto` | Anel de choque para dar ênfase |

## O que já funciona e o que ainda não

| Recurso | Estado |
|---|---|
| Cortar silêncios | Funciona |
| Legendas em `.srt` | Funciona |
| Pedido em português vira plano de edição | Funciona |
| Cortes e cor aplicados automaticamente | Funciona |
| Animações geradas com o texto da fala | Funciona |
| Montar tudo sozinho no CapCut | **Falta o Passo 1** |
| Texto atrás da pessoa | Manual (o roteiro explica o passo a passo) |

Os dois últimos são os que faltam. Montar no CapCut depende do relatório do
Passo 1. Texto atrás da pessoa precisa de recorte quadro a quadro — hoje o
roteiro te diz como fazer em três cliques no próprio CapCut.

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
feirao/executor.py    aplica o plano; nada aqui é decidido por modelo
testes/               testes do núcleo (63, sem chamar a API)
```

A interface só chama o núcleo — a lógica toda está em `feirao/` e é testada
sem precisar de CapCut, de Windows ou de tela:

```
pip install pytest
python -m pytest testes/ -v
```
