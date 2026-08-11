# Notas da instalação

Cinco skills de criação de conteúdo, instaladas a partir dos zips originais.
Ficam no repositório (e não em `~/.claude/skills/`) de propósito: a máquina de
sessão remota é descartável e o que mora só na home some junto com ela.

## O que foi mudado em relação aos zips

Três coisas, todas porque os arquivos vieram com marcas da máquina de origem:

1. **`famous-repurpose-ig/SKILL.md`** apontava para
   `/Users/albertbakhoj/.claude/skills/.../recipes.md` — caminho de macOS de
   outra pessoa, que nunca resolveria aqui. Agora aponta para o `recipes.md`
   ao lado do próprio SKILL.md.

2. **`famous-reel-editor/SKILL.md`** afirmava que a chave da ElevenLabs vinha
   "preconfigurada no `.env` da skill, sem setup". **O `.env` não estava no
   zip.** Seguir aquela frase levaria direto a um erro de chave ausente. O
   texto agora diz a verdade e manda usar `transcribe_groq.py` ou
   `transcribe_local.py` enquanto não houver chave.

3. **Caminhos `~/.claude/skills/...`** em `famous-reel-editor` e
   `famous-youtube-editor` viraram caminhos relativos à pasta da própria
   skill. O `famous-youtube-editor` depende do `famous-reel-editor` estar como
   pasta irmã — e está.

Também foram removidos os `__pycache__/*.pyc` (bytecode de Python 3.14, inútil
em qualquer outra versão e ruim de versionar).

## O que roda nesta máquina e o que não roda

| | Estado |
|---|---|
| `ffmpeg` / `ffprobe` 6.1.1 com libass | instalados no sistema |
| `hyperframes` (via `npx`) | v0.7.106, funciona |
| `cutjoin.py`, `captions.py`, `silence_keep.py` | testados, funcionam |
| Node 22 | presente |
| **Higgsfield MCP** | **não conectado** |
| `yt-dlp` | ausente |
| Whisper local / `faster-whisper` | ausente |
| Chave ElevenLabs | ausente |

Sem o Higgsfield MCP, `famous-ig-carousel` e `famous-thumbnail` não têm como
gerar imagem, e o B-roll de IA dos dois editores fica de fora — o resto do
pipeline de edição funciona normalmente.

## Sobre a chave da ElevenLabs

Se for usar `transcribe.py`, ponha `ELEVENLABS_API_KEY=...` num `.env` dentro
de `famous-reel-editor/`. O `.gitignore` do repositório já bloqueia
`.claude/skills/**/.env`, então a chave não vai parar no GitHub por descuido.
