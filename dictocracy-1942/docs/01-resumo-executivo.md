# 1. Resumo executivo

## 1.1 O jogo em uma frase

Um simulador político-militar em terceira pessoa onde você **é** um dos
quatro grandes líderes de 1942 — caminha pelos seus corredores de poder,
lê os relatórios que chegam manipulados ou incompletos, decide o destino
de um país em reuniões cara a cara, e depois vê essas decisões se
desdobrarem num mapa-múndi de guerra real, até um dos ~20 finais
possíveis para o planeta e um epílogo pessoal para o seu líder.

## 1.2 Visão de produto

Os jogos de estratégia histórica (Hearts of Iron, Supreme Ruler) dão
profundidade de simulação mas mantêm o jogador a distância de mapa e
menu. Os jogos narrativos de decisão (Suzerain, Democracy, Tropico) dão
proximidade com o poder mas simplificam a guerra a poucos números.
Dictocracy: 1942 aposta que o público quer as duas coisas ao mesmo tempo:
**estar na sala** quando a decisão é tomada — olhar o general nos olhos,
sentir o silêncio antes de assinar uma ordem — e depois **ver essa
decisão desdobrar-se num sistema mundial de verdade**, com fricção,
recursos finitos e IA que não é decorativa.

O produto final é para PC (Steam, possivelmente EGS), com portabilidade
planejada desde a arquitetura para PlayStation e Xbox em uma fase
posterior — não simultânea ao lançamento em PC.

## 1.3 Pilares de experiência

Cada decisão de design, da câmera ao balanceamento econômico, é testada
contra estes cinco pilares. Um recurso que não sustenta pelo menos um
pilar é candidato a corte.

1. **Você está lá.** Terceira pessoa, ambientes físicos, personagens que
   olham para você — não um avatar de menu. A câmera nunca deveria "sumir"
   para um menu genérico quando existir alternativa diegética (documentos
   manuseáveis, mapas físicos na mesa, telefone).
2. **Ninguém te conta a verdade toda.** Informação imperfeita não é uma
   mecânica lateral — é o motor de tensão do jogo. Se o jogador sempre
   sabe o número exato de tudo, o pilar falhou.
3. **Poder tem fricção.** Uma ordem não executa sozinha. Generais,
   ministros e aliados têm agenda própria. "Aperte um botão e o mundo
   obedece" é o oposto do que este jogo é.
4. **Consequência, não pontuação.** O jogo não recompensa "eficiência a
   qualquer custo". Ele mostra, sempre, o que aquele custo foi — para uma
   pessoa, uma cidade, uma geração.
5. **História com honestidade.** O jogador pode fazer escolhas terríveis
   porque a história teve gente que as fez de verdade. O jogo nunca
   celebra essas escolhas nem finge que decisões tardias as apagam.

## 1.4 Público-alvo

- **Primário**: 25–45 anos, jogadores de estratégia histórica de alto
  investimento (Hearts of Iron IV, Crusader Kings III, Victoria 3,
  Supreme Ruler) que também consomem documentários/livros de história da
  Segunda Guerra. Alta tolerância a sistemas complexos, baixa tolerância
  a superficialidade histórica.
- **Secundário**: jogadores de RPG narrativo orientado a decisão (Suzerain,
  Disco Elysium, Democracy 4) atraídos pela perspectiva "estar dentro do
  poder", mesmo com menos apetite por micro de guerra — para este público,
  o mapa estratégico precisa ter um modo de delegação forte (ver
  `docs/02-game-design-document.md`, §Mapa e guerra).
- **Terciário**: educadores e público de história geral, via modo
  "Documentário Leve" e Codex histórico com fontes — não é o público que
  paga o desenvolvimento, mas informa o padrão de rigor exigido do
  conteúdo.

Classificação etária alvo: **18+** em todos os territórios relevantes
(ESRB Mature / PEGI 18 / IARC equivalente), dado o conteúdo de violência
histórica, temas de genocídio e linguagem. Ver riscos de classificação em
`docs/06-plano-producao.md`.

## 1.5 Comparação com concorrentes

| Jogo | O que faz bem | O que Dictocracy faz diferente |
|---|---|---|
| **Hearts of Iron IV** | Profundidade de simulação militar/econômica, focus trees por país | HoI4 é mapa e menus; Dictocracy coloca o jogador fisicamente nas reuniões que geram essas decisões, com diálogo e personagens reativos individualmente |
| **Suzerain** | Decisões políticas em texto com peso real, personagens memoráveis | Suzerain é ficcional e majoritariamente textual/2D; Dictocracy é histórico, 3D, com exploração física e mapa de guerra completo |
| **Twilight Struggle / Diplomacy** | Tensão de barganha e alianças assimétricas | Escopo dessas obras é só diplomacia abstrata; Dictocracy integra diplomacia a economia, produção, ciência e comando militar num mesmo sistema |
| **This War of Mine / Through the Darkest of Times** | Honestidade crítica ao retratar o custo humano da guerra e do autoritarismo | Escala de civil/resistência, não de chefe de Estado; Dictocracy aplica o mesmo rigor moral no topo da cadeia de poder, onde a escala das decisões é maior |
| **Attentat 1942** | Rigor documental e testemunhos reais | Escopo pequeno e linear; Dictocracy é sistêmico e ramificado, mas herda o compromisso de não transformar sofrimento histórico em conteúdo descartável |

Nenhum concorrente direto combina simulação física em terceira pessoa +
sistema mundial completo + postura crítica explícita. Esse é o espaço
que o produto ocupa — e também o maior risco de execução (ver
`docs/06-plano-producao.md`, §Riscos).

## 1.6 Por que agora / por que esta equipe precisa de UE5

- Lumen + Nanite tornam viável um padrão de fidelidade "sala de guerra
  cinematográfica" sem a equipe de otimização de geometria manual que um
  jogo deste escopo exigiria em gerações anteriores da engine.
- MetaHuman reduz o custo de produzir dezenas de NPCs críveis com
  qualidade de rosto suficiente para diálogo em primeiro plano — crítico
  porque o pilar "você está lá" depende de olhar humano, não avatar
  genérico.
- A base de sistemas orientados a dados (Data Tables / Primary Data
  Assets, Gameplay Tags) permite que o conteúdo histórico — o ativo mais
  caro e mais sujeito a revisão do projeto — seja iterado por
  historiadores e designers sem recompilar sistemas centrais.

## 1.7 Definição de sucesso do protótipo (curto)

Ver critérios completos e testáveis em
`docs/06-plano-producao.md`, §Critérios de diversão. Resumo: o protótipo
é bem-sucedido se um jogador de teste, sem instrução prévia, consegue (a)
identificar sozinho que uma informação recebida em reunião é suspeita, e
(b) tomar uma decisão que ele descreve, no pós-jogo, como "difícil" e não
"óbvia" — sem que a interface tenha travado, sem que o assistente tenha
precisado repetir instruções, e sem quebra de imersão saindo do ambiente
físico para um menu que poderia ser diegético.
