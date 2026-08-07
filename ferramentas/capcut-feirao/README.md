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

## O que já funciona e o que ainda não

| Recurso | Estado |
|---|---|
| Cortar silêncios | Funciona |
| Legendas em `.srt` | Funciona (o CapCut importa direto) |
| Template do feirão (`template_feirao.json`) | Estrutura pronta, editável |
| Gerar o projeto do CapCut montado | **Falta o Passo 1** |

O último item depende do relatório do Passo 1. O CapCut guarda os projetos
num formato próprio, sem documentação, que muda de versão para versão —
então o app não adivinha: ele parte de um projeto **seu**, clona e troca só
o que precisa. Por isso o modelo, e por isso a inspeção antes.

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
testes/               testes do núcleo
```

A interface só chama o núcleo — a lógica toda está em `feirao/` e é testada
sem precisar de CapCut, de Windows ou de tela:

```
pip install pytest
python -m pytest testes/ -v
```
