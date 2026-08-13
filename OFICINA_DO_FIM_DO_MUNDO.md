# Oficina do Fim do Mundo

Protótipo jogável de um simulador relaxante de restauração de objetos, ambientado num
vilarejo depois do colapso da civilização. Você é quem conserta o que sobrou —
e cada conserto revela um pedaço da história de quem perdeu aquele objeto.

Este protótipo vive lado a lado com o projeto **Pack Invaders** já existente neste
repositório, como uma segunda página/app dentro do mesmo build Vite.

## Como jogar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000/oficina.html` (o `index.html` continua servindo o Pack Invaders).

Para gerar o build de produção de ambos os jogos:

```bash
npm run build   # gera dist/index.html e dist/oficina.html
```

## O que já está implementado (vertical slice)

- **Loop de 5 dias/objetos**: Rádio de Válvulas, Caixinha de Música, Bicicleta Torta,
  Máquina de Escrever e Relógio de Parede — cada um com sua própria história e conjunto
  de etapas de conserto.
- **5 minigames táteis**, desenhados em canvas, sem assets externos:
  - **Limpar** — arraste para remover a sujeira sobre o objeto.
  - **Desmontar** — clique nas peças destacadas para soltá-las.
  - **Soldar** — clique no tempo certo, quando o marcador estiver na zona verde.
  - **Pintar** — arraste o pincel até cobrir toda a peça (fica restrito ao contorno do objeto).
  - **Testar** — arraste a alavanca para ligar o objeto e ver sua pequena animação de "funciona!".
- **Histórias progressivas**: cada etapa concluída libera uma linha da história do
  antigo dono do objeto, culminando numa revelação completa ao final do conserto.
- **Escolhas com consequência**: cada objeto termina numa decisão binária que afeta
  três indicadores da comunidade (Confiança, Esperança, Memória) e o relacionamento
  com NPCs específicos (Dona Iracema, Theo, Seu Aldo, Vic).
- **Tela da comunidade**: mostra os indicadores e como cada NPC está reagindo às suas
  escolhas, com texto descritivo que muda conforme os valores.
- **Save automático** em `localStorage`, permitindo continuar de onde parou.

## Estrutura de código

```
src-oficina/
  core/        # estado do jogo, save/load, tipos
  data/        # itens, histórias, escolhas, NPCs e comunidade
  render/      # silhuetas e detalhes vetoriais de cada objeto (procedurais, sem sprites)
  minigames/   # as 5 mecânicas de conserto (canvas + ponteiro)
  ui/          # orquestração de telas (App.ts) e helpers de DOM
```

Toda a arte é desenhada proceduralmente em `<canvas>` (formas geométricas simples,
estilo "recorte de papel"), o que deixa o protótipo 100% independente de assets
externos — pronto para receber arte final depois.

## Próximos passos sugeridos para a versão de lançamento

1. Substituir a arte procedural por ilustrações finais (mantendo o mesmo sistema de
   camadas: silhueta → sujeira/tinta → detalhes → animação de teste).
2. Expandir o catálogo de objetos e adicionar variação por dia (mais de um objeto por dia,
   escolha do próximo cliente, etc.).
3. Adicionar trilha sonora ambiente e efeitos sonoros reais (hoje há apenas bips
   sintéticos via Web Audio como placeholder).
4. Sistema de progressão da oficina (novas ferramentas, novas estações de trabalho).
5. Persistência de múltiplos slots de save e tela de estatísticas/conquistas.
