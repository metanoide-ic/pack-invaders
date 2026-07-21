# HUMANOCRACY — GDD Volume 8 — Arte, Áudio e UX

## 8.1 Direção de arte

**Conceito:** *burocracia como paisagem*. O mundo é visto de dentro de um guichê; a beleza
está no papel, no carimbo, na tipografia — e no que degrada quando o Estado degrada.

- **Referências de atmosfera** (não de estilo protegido): expressionismo de entreguerras,
  cartazes construtivistas, formulários reais dos anos 40–50, fotografia de fronteiras
  no inverno.
- **Paleta por regime** (implementada no protótipo via CSS custom properties):
  - República: verdes burocráticos, âmbar de lâmpada fraca, papel creme;
  - Mehrvolk: preto, vermelho-sangue, dourado — *nenhum símbolo real reproduzido*;
    a iconografia do regime é geométrica-abstrata (losango ❖) desenhada para parecer
    opressiva sem citar nada histórico;
  - Conselho Popular: vermelho e ocre, estrela ★ como carimbo de revalidação;
  - Colapso: dessaturação progressiva até o cinza; a única cor viva que resta é o
    carimbo APROVAR.
- **Cidadãos no guichê — photobash + VHS (implementado):** o estilo visual dos cidadãos é
  o de *No, I'm Not a Human* — **cutouts fotográficos** (photobash) com fundo removido,
  brilho reduzido, contraste alto e um filtro **VHS** assado (aberração cromática RGB,
  scanlines, grão, sangramento horizontal) + um overlay CRT ao vivo na janela (scanlines +
  roll de tracking). Pipeline em `tools/` (canvas headless): cada imagem-base vira "quase
  infinitos" cidadãos via flip horizontal e variação de matiz/brilho/saturação por pessoa.
  Os Alternados usam cutouts *uncanny* (rostos deformados); **O Silente** usa o cutout mais
  perturbador, com o VHS rasgando. Fallback: retrato SVG procedural.
- **Retratos SVG (fallback / família):** procedurais, geométricos, levemente rígidos —
  rostos que o cérebro lê como rostos mas nunca relaxa ao ler (vale para humanos e
  Alternados igualmente; **nunca** existe "cara de Alternado" garantida — a distorção é
  distribuída, e a maioria dos Alternados parece perfeitamente humana).
- **Documentos:** cada país com cor, selo e tipografia próprios; desgaste procedural
  (dobras, manchas, carimbos sobrepostos) na produção.

### Camada de horror (No, I'm Not a Human)

- **Vinheta permanente** com flicker de grão em passos (steps) — a tela nunca está
  totalmente confortável;
- **Close-up do exame:** o rosto ocupa metade da tela contra fundo de lâmpada fraca;
  pálpebras animadas (quem não pisca, não pisca), veias na esclera, dentes desenhados
  um a um — o detalhe existe para ser encarado;
- **A noite:** preto quase total, um único círculo de olho mágico com aro metálico;
  o retrato dentro dele escurecido e contrastado; três noites o círculo está **vazio**;
- **O tique do retrato:** transform de 1,5px por 0,04s — abaixo do limiar de certeza;
- **Batidas:** três tons de 58Hz espaçados — o som mais grave do jogo, reservado só
  para a porta.

## 8.2 UI/UX

- **A mesa é o jogo:** documentos arrastáveis com sombra e empilhamento (z-index);
  tudo que importa cabe em uma tela — guichê, mesa, regulamento, decisões.
- **Modo Inspeção:** clique em dois elementos; feedback em barra dedicada; campos
  confirmados ficam sublinhados em vermelho trêmulo. Zero menus aninhados.
- **Comunicado como contrato:** o jogador *assina ciência* todo dia — o ato de assinar
  é tema (você é parte da máquina que assina).
- **Advertências:** cupom físico que sobe da mesa com som de matriz — punição com
  estética de recibo.
- **Acessibilidade:** decisões nunca dependem só de cor (carimbos sempre têm rótulo de
  texto); **modo "arquivista" implementado no protótipo** — relógio do turno não avança
  em tempo real, alternável no título. Conferido contra o código: os selos nacionais
  (`COUNTRIES[x].seal`, um glifo Unicode distinto por país — ✦ ▲ ❖ ◉ ✚ ◈ ★ ⬢ ☽ ⚜) já
  não dependem de cor — `wrongSeal` troca o GLIFO por outro país, nunca só a cor de
  fundo do cabeçalho do documento, e o glifo errado aparece como texto comparável ao
  do regulamento; resultados de scanner e zonas de exame já são só texto/opacidade,
  nunca cor isolada. Então "modo daltônico dedicado para selos" era um TODO mais
  cauteloso do que o código exigia — já coberto. **Escala de fonte implementada no
  protótipo nesta mesma rodada** — botão "TEXTO GRANDE" (título e pausa, `SETTINGS.textLarge`,
  persiste como as demais preferências) aumenta a fonte só nas áreas de leitura em
  prosa com rolagem própria (diálogo, citação/advertência, log de interrogatório,
  regulamento, tela de fim de dia e final, jornal) — deliberadamente NÃO toca
  `.document`: os cartões de documento são arrastáveis com largura fixa de 250px, e
  aumentar a fonte ali arriscaria estourar o cartão sem uma forma confiável de
  verificar visualmente o resultado neste ambiente. Achado no processo: `setRegimeClass()`
  e `showNight()` faziam `document.body.className = ''` a cada troca de dia/noite —
  um reset completo que apagava QUALQUER classe do body, inclusive `text-large`, porque
  a intenção original era só limpar o tema de regime anterior. Corrigido reaplicando
  `text-large` logo depois do reset nos dois pontos, sem tocar no reset em si (que
  continua certo pra regime/silente-present/blackout). Verificado com teste dedicado:
  fonte aumenta nas áreas cobertas, preferência persiste entre recarregamentos e
  sobrevive a uma virada de dia (onde antes seria silenciosamente perdida), volta ao
  tamanho normal ao desligar pela pausa, e localiza em EN; suíte `smoke.js`–`smoke6.js`
  sem regressão; paridade EN/ES confirmada (822 = 822). **Legendas para todo áudio**
  segue como o único item real da lista original, mas mais estreito do que soa: os
  "sons" do jogo são só efeitos não-verbais (carimbo, batida, buzina) ou as vozes
  murmuradas (`mumble()` em `game.js`) — gibberish sintetizado por sílaba, sem texto
  por trás pra legendar, cuja tensão vem do tom, não do conteúdo; a informação real de
  cada evento sonoro já aparece como texto separado (a fala, o comunicado, o resultado
  do exame). Produção ainda deve avaliar se algum efeito sonoro isolado carrega
  informação que só existe no áudio.
- **O que a UI nunca faz:** mostrar barras de reputação, medidores de paranoia,
  porcentagens de scanner, ou qualquer número que o mundo diegético não imprimiria
  num formulário.
- **A exceção proposital — menu de pausa e conquistas:** a regra acima vale para a UI
  DO GUICHÊ (a mesa, os documentos, o regulamento — o mundo do jogo). O menu de pausa já
  quebra a quarta parede de propósito ("O posto não pausa por você. Este menu, sim.") —
  é a única UI do jogo que admite ser UI, não parte do mundo. A tela de CONQUISTAS
  (implementada no protótipo, acessível pelo título e pela pausa) mora nessa mesma
  camada meta, não na diegética: o contador "x / 12" é exatamente o tipo de número que
  a regra acima proíbe DENTRO do guichê, mas aqui está certo — como o placar de
  conquistas da própria Steam, ele não finge ser parte do posto de fronteira.

## 8.3 Áudio

- **Protótipo:** síntese WebAudio — baque do carimbo (quadrada 70Hz), buzina da
  advertência, varredura do scanner, sino da descoberta.
- **Produção:**
  - *Camada mecânica:* papel, gavetas, matriz, telefone de baquelite, gerador;
  - *Camada mundo:* a fila (murmúrio que muda com o humor simulado), vento, trens
    (até o dia em que os trens param — e a ausência é o evento sonoro);
  - *Rádio diegética:* música de época fictícia; 3 emissoras; o hino que muda duas
    vezes ("decorar até sexta");
  - *Regra do silêncio:* Dias 47–48 quase sem som. O último som novo do jogo é o
    carimbo. O silêncio é mixado, não é ausência de mix;
  - *Sem stingers de horror:* a paranoia nunca é pontuada por música — nenhum sussurro
    tem acompanhamento. Se o áudio avisasse o que é importante, a incerteza morreria.

## 8.4 Escrita e tom

- Português com sabor de repartição: carimbos, éditos, formulários numerados (77-B);
- Humor seco permitido apenas onde a burocracia é absurda por si (o horóscopo que pede
  desculpas; o Departamento 12 "que não existe");
- Falas curtas na fila; monólogos apenas nos recorrentes;
- **Proibido:** exposição de lore em diálogo, vilões explicando planos, qualquer NPC
  que saiba a verdade inteira.
