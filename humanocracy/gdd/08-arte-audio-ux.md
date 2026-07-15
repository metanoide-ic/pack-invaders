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
- **Retratos:** procedurais, geométricos, levemente rígidos — rostos que o cérebro lê
  como rostos mas nunca relaxa ao ler (vale para humanos e Alternados igualmente; **nunca**
  existe "cara de Alternado", por princípio de design e por ética do tema).
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
- **Acessibilidade (produção):** modo daltônico para selos, escala de fonte, opção de
  relógio pausável em dificuldade "arquivista", legendas para todo áudio.
- **O que a UI nunca faz:** mostrar barras de reputação, medidores de paranoia,
  porcentagens de scanner, ou qualquer número que o mundo diegético não imprimiria
  num formulário.

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
