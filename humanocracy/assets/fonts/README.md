# Fontes embutidas

Subset **latin** (cobre PT-BR/EN/ES) baixado do Google Fonts e embutido em
`style.css` como woff2 base64, para o jogo rodar offline / standalone.

- **Oswald** (variável 200–700) — SIL Open Font License 1.1 — títulos, logo, HUD, botões.
- **JetBrains Mono** (variável) — SIL OFL 1.1 — corpo, diálogo, regulamento (`--font-mono`).
- **Special Elite** (400) — Apache License 2.0 — documentos datilografados, comunicados, citações.

Estes `.woff2` ficam aqui só como fonte para regenerar o bloco `@font-face`
(o jogo usa a versão base64 inline). Para regenerar, rode o script em
`tools/` que lê estes arquivos e reemite o bloco no topo de `style.css`.
