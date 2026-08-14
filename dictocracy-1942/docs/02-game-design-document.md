# 2. Game Design Document

> Este documento assume a leitura prévia de
> `00-posicionamento-e-tela-inicial.md`. Nenhuma mecânica aqui descrita
> pode violar as regras de linha vermelha daquele documento.

## 2.1 Pitch e fantasia central

Você acorda em 1942 sendo Hitler, Churchill, Roosevelt ou Stalin. Não há
"você, jogador de estratégia, olhando o mundo de cima" — há um dia de
trabalho, uma agenda, pessoas que precisam da sua decisão até o meio-dia,
e a certeza incômoda de que ninguém no seu gabinete está te contando a
verdade toda. A fantasia não é "vencer a guerra". É **governar sob
incerteza, com pessoas reais empurrando você em direções diferentes, e
viver (ou não) com o resultado**.

## 2.2 Mecânicas centrais

1. **Exploração em terceira pessoa** dentro de ambientes de comando
   (residência oficial, quartéis-generais, bunkers, a Casa Branca, o
   Kremlin) — ver lista completa em `docs/05-plano-visual.md`.
2. **Diálogo cinematográfico ramificado** com ministros, generais,
   diplomatas e familiares/assessores próximos.
3. **Reuniões governamentais** — a unidade central de conteúdo do jogo
   (ver §2.5).
4. **Mapa-múndi estratégico** para frentes, produção, logística,
   pesquisa e diplomacia (ver §2.7).
5. **Documentos manipuláveis** — assinar, recusar, adiar, alterar.
6. **Sistema de informação imperfeita** (ver §2.6).
7. **Simulação de personagens autônomos** com memória e agenda própria
   (ver §2.8).
8. **Opinião pública e legitimidade** por país, com mecânicas próprias
   por campanha (ver §2.4).
9. **Consequências atrasadas** — decisões geram eventos que só se
   resolvem semanas ou meses de jogo depois.
10. **20 finais globais ramificados em variações pessoais** (ver §2.10).

## 2.3 Estrutura de tempo

O relógio de campanha avança em **dias**, agrupados em **semanas**, de
janeiro de 1942 até (no mínimo) o fim da guerra em cada frente — com
possibilidade de a simulação continuar além de 1945 em finais como
"Guerra Sem Fim" ou "Terceira Guerra" (§2.10).

- Cada dia tem uma **agenda**: 2–5 blocos de reunião/evento fixos ou
  gerados, mais eventos de interrupção (crises) que podem forçar o
  jogador a abandonar a agenda planejada.
- O jogador pode **avançar o tempo** em três granularidades: até o
  próximo evento relevante, até o fim do dia, ou até o fim da semana —
  sempre pausável e interrompível por eventos críticos (bombardeio,
  tentativa de golpe, oferta diplomática urgente).
- Semanas "de rotina" sem crise ativa são resumidas automaticamente numa
  tela de relatório semanal (documento físico na mesa do gabinete), para
  não forçar o jogador a repetir manualmente reuniões de baixo impacto.

## 2.4 Estrutura narrativa por líder

Todas as campanhas compartilham o loop principal (`docs/03`) e o modelo
de dados (`docs/04`), mas cada uma injeta sistemas exclusivos, elenco e
objetivos próprios. Nenhuma campanha é uma reskin de outra.

### 2.4.1 Adolf Hitler — Alemanha Nazista

**Tensão central**: manter o controle de uma máquina de poder que se
fragmenta em facções rivais, enquanto a guerra se torna impossível de
vencer em múltiplas frentes.

Sistemas exclusivos:

- **Índice de Facção** — Wehrmacht, SS, Partido e Indústria (Speer/grande
  indústria) competem por recursos, autoridade e a atenção do líder. Cada
  decisão favorece uma facção às custas de outra; nenhuma decisão agrada
  as quatro.
- **Paranoia crescente** — sobe com derrotas militares, atentados
  descobertos e informação contraditória; acima de certos limiares,
  distorce a interface (relatórios que o jogo mostra como "confiáveis"
  passam a ocultar mais informação real, refletindo o próprio julgamento
  do personagem se deteriorando) e reduz a disposição de generais
  competentes a discordar abertamente — o que piora a qualidade das
  decisões futuras.
- **Lealdade de generais**, individual por comandante, afetada por
  microgerenciamento excessivo, ordens que ignoram avaliação profissional
  e purgas.
- **Resistência interna** — rede oculta que cresce com repressão, crimes
  de guerra tornados públicos e reveses militares; pode culminar em
  tentativas de atentado (evento com raízes históricas — ver
  `docs/04-arquitetura-tecnica.md` sobre eventos "20 de julho e
  variantes").
- **Escassez de combustível e matérias-primas**, com efeito direto e
  visível sobre operações no mapa (uma ofensiva sem combustível reservado
  simplesmente não avança, independente da vontade do jogador).
- **Guerra em múltiplas frentes** — Leste, Norte da África/Mediterrâneo,
  Atlântico, e defesa aérea do Reich, cada uma consumindo o mesmo pool
  finito de reservas.
- **Relação com Itália e Japão** — aliados com agenda própria, capazes de
  agir sem consultar o jogador (e de sair da guerra — ver final "Traição
  Precoce").
- **Informação militar adulterada** — o Alto Comando tem incentivo
  estrutural para maquiar derrotas; a qualidade da informação recebida
  cai conforme a paranoia sobe e a lealdade dos generais cai.
- **Saúde física e psicológica** — indicador próprio que afeta
  julgamento, disposição para reuniões longas e frequência de decisões
  impulsivas sugeridas pela interface (nunca forçadas sem confirmação do
  jogador).
- **Desmontagem de instituições do regime** — o jogador pode, a partir de
  qualquer ponto, iniciar a redução de poder da Gestapo/SS sobre
  populações civis e territórios ocupados. Isso reduz mortes futuras na
  simulação (rastreadas separadamente de mortes já ocorridas — ver
  regra de linha vermelha #4) e altera drasticamente a reação de
  Wehrmacht, Partido e opinião pública alemã — não é uma escolha sem
  custo político.
- **Responsabilização** — um sistema de registro append-only (nunca
  editável, nunca "resetável") de decisões e eventos ligados a crimes de
  guerra, referenciado nos finais e no epílogo pessoal do líder,
  independente do que aconteça depois.
- **Saídas de campanha**: golpe militar (Índice de Facção + lealtade
  baixos), deposição pelo Partido, atentado bem-sucedido, captura pelos
  Aliados, ou suicídio no desfecho de "Fortaleza" — todas geram epílogos
  distintos, nunca neutros.

### 2.4.2 Winston Churchill — Reino Unido

**Tensão central**: vencer a guerra pode custar a própria carreira
política e o próprio Império.

Sistemas exclusivos:

- **Moral da população britânica**, sensível a bombardeios, racionamento
  e notícias de frente, com efeito direto sobre produção e recrutamento.
- **Relação com Parlamento e Gabinete de Guerra** — Churchill não governa
  por decreto; moções de confiança e oposição interna do próprio partido
  são mecânica jogável, não flavor text.
- **Administração do Império** — pressão simultânea de múltiplas frentes
  coloniais (Índia, Norte da África, Sudeste Asiático) com recursos
  finitos e reivindicações políticas locais crescentes.
- **Inteligência e decodificação** (Bletchley Park / Ultra) — fonte de
  informação de altíssima qualidade, mas seu uso tem de ser disfarçado
  para não revelar aos alemães que o código foi quebrado; usar Ultra "bem
  demais" tem custo narrativo direto.
- **Defesa aérea e marítima** — Batalha do Atlântico e defesa doméstica
  como sistemas de atrito contínuo, não eventos pontuais.
- **Relação com EUA e URSS** — equilíbrio entre depender do apoio
  americano (Lend-Lease) e preservar autonomia de decisão estratégica; a
  relação com Stalin é de aliança funcional, não de confiança.
- **Planejamento da invasão da Europa** — decisões de timing e prioridade
  de recursos entre Mediterrâneo e um futuro desembarque no noroeste
  europeu.
- **Pressão pela descolonização**, crescente ao longo da guerra,
  independente da vontade do jogador — gerida, não eliminada.
- **Bombardeios estratégicos** — decisões de alvo com peso moral e
  diplomático explícito (ver regra de linha vermelha #5: nenhuma baixa
  civil é só um número).
- **Possibilidade de perder o poder mesmo vencendo a guerra** — a
  campanha pode terminar com vitória militar e derrota eleitoral/política
  no Reino Unido, refletindo tensão histórica real sobre expectativa
  social do pós-guerra.

### 2.4.3 Franklin D. Roosevelt — Estados Unidos

**Tensão central**: administrar uma superpotência emergente com um corpo
que está falhando e um Congresso que não é seu súdito.

Sistemas exclusivos:

- **Relação com o Congresso** — orçamento de guerra, declarações formais
  e políticas internas dependem de maioria construída, não de ordem
  direta.
- **Opinião pública e imprensa** — sensível a baixas, racionamento e
  notícias do Pacífico vs. Europa.
- **Economia e indústria de guerra** — conversão industrial civil→bélica
  como sistema de produção com gargalos reais (mão de obra, matéria-
  prima, transporte).
- **Divisão estratégica Europa vs. Pacífico** — cada unidade de recurso
  alocada a uma frente é retirada da outra; general MacArthur e o
  Almirantado do Pacífico competem por prioridade com Eisenhower/Marshall
  na Europa.
- **Programa nuclear (Projeto Manhattan)** — pesquisa de longo prazo com
  decisões de uso ao final, tratadas com o peso máximo de linha vermelha
  (nenhum final de uso nuclear é apresentado como triunfo sem custo — ver
  §2.10, final "Mundo Nuclear").
- **Relação com Churchill e Stalin** — arbitragem entre dois aliados que
  não confiam plenamente um no outro.
- **Eleição de 1944** — campanha eleitoral simulada como sistema próprio,
  com risco real de mudança de rumo político dos EUA se a condução da
  guerra ou da economia interna for malconduzida.
- **Segregação e conflitos sociais internos** — incluindo o internamento
  de nipo-americanos e tensões raciais em polos industriais; tratado com
  o mesmo rigor de "sem eufemismo" da regra de linha vermelha #2, adaptado
  a um contexto que não é genocídio mas é injustiça de Estado documentada.
- **Saúde presidencial** — Roosevelt tem uma condição de saúde real e
  documentada que se deteriora ao longo da campanha; ver mecanismo de
  sucessão abaixo.
- **Definição da ordem mundial do pós-guerra** — arquitetura de
  instituições internacionais (precursoras da ONU) como sistema de
  decisão de longo prazo com efeito direto nos finais "Conselho Mundial"
  e "O Século Americano".
- **Morte em campanha e sucessão** — se a saúde presidencial colapsa antes
  do fim da guerra, o jogador **continua jogando como o vice-presidente
  sucessor**, herdando o estado do país mas não necessariamente as
  mesmas relações pessoais construídas por Roosevelt — mecânica única
  desta campanha, não um game over.

### 2.4.4 Josef Stalin — União Soviética

**Tensão central**: sobreviver à invasão sem que o próprio aparato de
poder — construído sobre o medo — se volte contra você primeiro.

Sistemas exclusivos:

- **Defesa contra a invasão alemã** — em 1942 a URSS está no limite;
  cidades e centros industriais podem cair permanentemente, alterando o
  mapa de forma irreversível.
- **Relação com o Exército Vermelho** — comandantes com histórico de
  purgas anteriores, cautelosos em discordar; a mecânica de "informação
  adulterada" aqui é mais severa que em qualquer outra campanha por
  desenho histórico deliberado.
- **Expurgos e medo dentro do governo** — reduzem risco de golpe no curto
  prazo, mas destroem competência institucional e lealdade real
  (distinta de lealdade pública — ver `docs/04`, modelo de Personagem).
- **Produção industrial transferida** — a relocação de fábricas para os
  Urais como projeto logístico de longo prazo com janela de
  vulnerabilidade real.
- **Moral da população civil** sob cerco (Leningrado, Stalingrado) como
  sistema com efeitos de longo prazo mesmo após o cerco terminar.
- **Partidários e territórios ocupados** — resistência soviética em
  território tomado pela Alemanha como ativo estratégico gerido à
  distância, com risco de retaliação civil (tratado sem eufemismo, regra
  #5).
- **Relação com os Aliados ocidentais** — cooperação funcional sem
  confiança, com desconfiança mútua rastreada numericamente e
  narrativamente.
- **Expansão soviética pela Europa** conforme o Exército Vermelho avança
  — decisões sobre até onde estender controle político direto, com efeito
  direto nos finais "Europa Vermelha" e "Terceira Guerra".
- **Disputa entre generais** (ex.: tensões de comando histórico) como
  gerência de ego e competência simultânea.
- **Abandono de políticas repressivas** — mecânica espelhada à de Hitler
  (regra de linha vermelha #4 aplicada de forma simétrica): reduz mortes
  futuras e risco de fragmentação de longo prazo, não apaga o já feito.
- **Riscos de saída**: golpe interno, fragmentação política regional, ou
  ruptura armada com antigos aliados ocidentais no pós-guerra (ver final
  "Terceira Guerra").

### 2.4.5 Campanhas de expansão (não incluídas no jogo-base)

Mussolini (Itália), Tojo (Japão), de Gaulle (França Livre), Chiang
Kai-shek (China) — briefs de uma página cada, sistemas exclusivos a
definir na Fase 4, fora do escopo de produção do jogo-base (ver
`docs/06-plano-producao.md`, §Fora do escopo da v1).

## 2.5 Estrutura de uma reunião / decisão

Toda decisão do jogo — de uma reunião de gabinete a uma crise de
madrugada — usa a mesma estrutura de dados, definida tecnicamente em
`docs/04-arquitetura-tecnica.md`. Aqui está a estrutura de **conteúdo**:

- **Identificador único** e **título**.
- **Janela de data** (mínima/máxima) em que pode ocorrer.
- **Líderes elegíveis** (uma decisão pode ser exclusiva de campanha ou
  compartilhada com variações de texto).
- **Condições de ativação** (estado do mundo, relações, eventos
  anteriores).
- **Personagens envolvidos**, com suas próprias agendas naquela cena.
- **Texto apresentado** ao jogador (o que os personagens dizem/mostram).
- **Evidências disponíveis** (documentos, fotos, relatórios que o jogador
  pode consultar antes de decidir).
- **Informações ocultas** (o que o jogador NÃO vê, e que pode invalidar o
  que foi apresentado).
- **Opções**, nunca reduzidas a "sim/não" quando o design permitir mais:
  aprovar, recusar, adiar, pedir mais informação, alterar a proposta,
  consultar outra pessoa antes, executar secretamente, delegar, mentir
  publicamente sobre a decisão, contradizer uma ordem anterior.
- **Custos** (recursos, tempo, capital político).
- **Consequências imediatas** e **consequências atrasadas** (agendadas
  para datas futuras, possivelmente semanas depois).
- **Alterações de relacionamento** com os personagens envolvidos.
- **Alterações no mapa** (território, produção, moral regional).
- **Eventos desbloqueados** (novas decisões que só existem por causa
  desta).
- **Finais influenciados** (peso desta decisão nas variáveis de final —
  ver §2.10).
- **Fonte histórica ou marcação de ficção contrafactual** (ver
  `00-posicionamento`, §4).

Toda decisão de peso narrativo alto (marcada internamente como "decisão
de âncora") passa por uma tela de confirmação diegética — nunca um popup
genérico — como assinar fisicamente um documento com caneta-tinteiro, ou
desligar um telefone após uma ordem verbal.

## 2.6 Sistema de informação imperfeita

O jogador nunca vê um "número mundial verdadeiro" diretamente. Toda
informação chega por um canal com qualidade própria:

| Canal | Confiabilidade típica | Vetor de erro |
|---|---|---|
| Relatórios militares | Média-alta | Otimismo institucional, atraso |
| Espiões | Variável, depende do agente | Duplos agentes, desinformação plantada |
| Fotografias aéreas | Alta para contagem física, baixa para intenção | Interpretação errada, camuflagem inimiga |
| Interceptações (sinais/código) | Muito alta quando disponível | Escassa, criptografada, atrasada |
| Diplomatas | Média | Viés pessoal, desejo de agradar |
| Jornais | Baixa a média | Propaganda, censura, boato |
| Ministros | Variável por competência e lealdade | Omissão de derrotas, exagero de sucesso |
| Testemunhos/rumores | Baixa | Ruído alto, ocasionalmente único aviso de algo real |

A confiabilidade efetiva de qualquer relatório é função de:
`inteligência do canal × lealdade real do informante × qualidade da
comunicação (distância, criptografia, tempo decorrido)`. O jogador nunca
vê essa fórmula exposta como número — vê **sinais indiretos** (o tom do
personagem, se duas fontes se contradizem, se um relatório chega tarde
demais para ser útil) e desenvolve leitura própria ao longo da campanha.

Personagens podem mentir deliberadamente por medo (esconder uma derrota
de um líder paranoico), ambição (inflar um sucesso próprio) ou lealdade
dividida (informar um terceiro país). O jogo registra, para si mesmo, a
"verdade de simulação" por trás de cada relatório — o jogador só a
descobre por cruzamento de fontes, investigação (enviar um espião
verificar, convocar uma segunda opinião) ou pelo custo de ter confiado
errado.

## 2.7 Sistema de personagens

Cada personagem relevante (ver ficha completa de dados em `docs/04`)
carrega, no mínimo: nome, cargo, ideologia, ambição, coragem, competência,
lealdade pública, lealdade real, relações pessoais, medos, segredos,
estado emocional, conhecimento disponível e memória das decisões do
jogador que o afetaram.

Comportamentos autônomos possíveis (a IA de personagem escolhe entre
eles com base no seu perfil, não por script fixo de cena):

Obedecer · questionar · sabotar · pedir demissão · formar alianças
internas · espionar · vazar informação · alterar relatórios · preparar
golpes · planejar atentados · negociar secretamente com potências
estrangeiras.

A **memória** de personagem é o que torna repetível a sensação de
"as pessoas te conhecem": um general demitido sem explicação lembra
disso mesmo se recontratado meses depois; um ministro cuja proposta foi
ridicularizada em público é mais propenso a vazar informação
futuramente. Ver arquitetura de persistência dessa memória em
`docs/04-arquitetura-tecnica.md`.

## 2.8 Indicadores por país

Cada país simulado (jogável ou não) mantém, no mínimo:

Poder militar · reservas humanas · produção industrial · combustível ·
alimentos · matérias-primas · infraestrutura · capacidade logística ·
estabilidade política · apoio popular · moral civil · moral militar ·
influência diplomática · eficiência de inteligência · desenvolvimento
científico · nível de repressão · resistência interna · mortes militares
· mortes civis · crimes de guerra (registro append-only, ver
`00-posicionamento`) · deslocamentos populacionais · controle
territorial.

Nenhum desses indicadores é exposto ao jogador com precisão perfeita para
países que não o seu — ver §2.6. Para o **próprio** país do jogador, os
indicadores internos (produção, moral, estabilidade) são visíveis com
qualidade dependente da competência do seu próprio ministério — ou seja,
mesmo o jogador pode ser mal informado sobre si mesmo se seu governo for
disfuncional.

## 2.9 Mapa e guerra

O mapa estratégico modela países, regiões, frentes, ferrovias, portos,
aeroportos, centros industriais, depósitos, rotas marítimas, recursos
naturais, linhas de suprimento, território ocupado e movimentos de
resistência.

O jogador define **objetivos estratégicos** (ex.: "romper o cerco a
Leningrado", "proteger as rotas do Atlântico Norte") e escolhe
**comandantes** para executá-los — não movimenta unidades individuais.
Um general interpreta a ordem de acordo com sua competência,
personalidade, lealdade, recursos disponíveis, clima, qualidade da
informação que recebeu, moral das tropas e logística real disponível.
Uma ordem sem suprimento suficiente pode ser recusada, executada
parcialmente com baixas maiores que o esperado, ou resultar em desastre
— o jogo nunca finge que vontade política substitui logística.

Delegação: o jogador pode fixar uma **postura geral** por frente
("ofensiva", "defensiva", "contenção de custo") e deixar o comandante
tomar decisões táticas dentro dela, reduzindo a carga de microgestão para
o público que prioriza a camada política (ver público secundário em
`docs/01`).

## 2.10 Diplomacia

Interações presenciais (viagens/conferências, ex. modelo Casablanca,
Teerã) e remotas (telegrama, telefone) cobrindo: acordos de paz,
armistícios, rendições, alianças, empréstimos, fornecimento de armas,
trocas territoriais, garantias de independência, abertura de novas
frentes, conferências internacionais, reconhecimento de governos e
operações secretas.

Toda potência estrangeira jogada por IA tem objetivos próprios
modelados (ver `docs/04`, IA de Nação) e **recusa propostas absurdas**
salvo razão política forte e explícita (derrota militar iminente, colapso
econômico, ruptura interna) — nunca "porque o jogador quis".

## 2.11 Os 20 finais globais

Cada final tem uma condição de ativação baseada em combinações de
indicadores globais e decisões de âncora (não um único gatilho isolado),
e se resolve em duas camadas: um **epílogo global** (o que acontece com o
mundo) e um **epílogo pessoal** por líder jogado (o que acontece com essa
pessoa especificamente) — ver matriz de variação abaixo.

| # | Final | Gatilho central (resumo de design) |
|---|---|---|
| 1 | Direto dos Livros | Trajetória agregada do jogador permanece dentro da margem de divergência histórica documentada |
| 2 | Paz Improvável | Armistício negociado com devolução de território antes da rendição incondicional de alguma potência do Eixo |
| 3 | Europa Vermelha | Controle territorial soviético se estende muito além da linha histórica de ocupação, sem ruptura com os Aliados ocidentais |
| 4 | O Século Americano | EUA assume hegemonia econômica e militar global antes do fim formal da guerra |
| 5 | Fortaleza Europa | Alemanha mantém domínio continental sob ordem totalitária consolidada, sem colapso do regime |
| 6 | Espaço Vital | Alemanha garante território no Leste por armistício, mas instável e sujeito a nova ruptura |
| 7 | Império do Sol | Japão consolida parte das conquistas e negocia paz antes de derrota total |
| 8 | A França Retorna | França Livre recupera protagonismo político e liderança continental no pós-guerra |
| 9 | Traição Precoce | Itália muda de lado antes do ponto histórico, alterando o equilíbrio do Mediterrâneo |
| 10 | Mundo Nuclear | Uso de armas atômicas contra múltiplos alvos urbanos — sempre com epílogo de devastação e instabilidade, nunca "vitória limpa" |
| 11 | Guerra Sem Fim | Conflito ativo se estende além de 1945 sem resolução |
| 12 | Terceira Guerra | Ruptura armada entre antigos Aliados logo após o fim do Eixo |
| 13 | Queda dos Ditadores | Colapso interno simultâneo ou sequencial de regimes totalitários, por golpe, revolta ou derrota |
| 14 | Sem Impérios | Processo de descolonização acelera e se generaliza muito antes do calendário histórico |
| 15 | Alemanha Dividida | Alemanha fragmentada politicamente entre múltiplas potências ocupantes/administrações |
| 16 | Golpe dos Generais | Wehrmacht remove Hitler do poder (Índice de Facção + lealdade colapsados) |
| 17 | Tribunal | Líder(es) sobrevivente(s) capturado(s) e julgado(s) publicamente |
| 18 | Guerra Civil Europeia | Facções internas prolongam conflito armado dentro da própria Europa além do fim da guerra convencional |
| 19 | Destruição Mútua | Nenhuma grande potência atinge vitória decisiva; exaustão mútua generalizada |
| 20 | Conselho Mundial | Instituição internacional de segurança coletiva surge com autoridade real muito além da ONU histórica |

Cada final varia por: líder jogado, países sobreviventes como potências
relevantes, fronteiras resultantes, ideologias dominantes por região,
contagem (em faixas, não número exato — coerente com §2.6) de mortes
civis e militares, uso ou não de armas nucleares, registro de crimes
cometidos (append-only, nunca zerado por decisões posteriores), alianças
vigentes, situação econômica projetada, destino pessoal de cada líder
jogável e não-jogável, e condições sociais projetadas entre 1945–1960
(texto de epílogo, não gameplay simulado).

**Nenhuma variação de nenhum final trata domínio totalitário, genocídio
ou uso de armas nucleares como desfecho sem custo** — ver regra de linha
vermelha #3. Mesmo "Fortaleza Europa" (a leitura mais próxima de uma
"vitória" para uma campanha de Hitler) tem epílogo obrigatório
descrevendo repressão contínua, resistência armada persistente e
isolamento internacional.

## 2.12 Interface

Sofisticada, legível, integrada ao período: pastas, mapas físicos,
fotografias, telegramas, fichas, carimbos, painéis e máquinas de época
como superfícies de interação primárias. Sobreposições modernas
(indicadores de objetivo, tooltips) existem, mas discretas e
desativáveis em "Modo Imersão Total" para jogadores que preferem
descobrir tudo diegeticamente.

Acessibilidade obrigatória desde o primeiro protótipo jogável, não como
adição tardia: tamanho de fonte, contraste, legendas, modos para
daltonismo, redução de movimento e um modo de interface simplificada que
converte documentos físicos manipulados em lista clara para jogadores com
limitações motoras ou cognitivas. Detalhes de implementação em
`docs/05-plano-visual.md`.

## 2.13 Áudio (visão de design; detalhes técnicos em `docs/05`)

Trilha orquestral dinâmica e sóbria, com tema distinto por país, que
reage à tensão militar e política corrente — nunca heroica para atos que
a regra de linha vermelha #1 proíbe de glorificar. Silêncio é uma
ferramenta deliberada: as decisões mais graves do jogo (ordens de
extermínio, uso de armas nucleares, uma execução) não têm música — só o
som do ambiente e da própria decisão.
