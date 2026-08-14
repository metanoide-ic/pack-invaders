# 3. Vertical slice e loop principal

## 3.1 Definição do vertical slice

**Objetivo**: provar, com qualidade próxima da final, que os cinco
pilares de experiência (`docs/01`, §1.3) funcionam juntos num recorte
pequeno o bastante para produzir em poucos meses.

**Duração**: 30–45 minutos de conteúdo linear-com-ramificação (não
sandbox completo).

**Ambientação**: campanha de **Churchill**, janeiro de 1942 — escolhida
para o slice porque (a) evita colocar o conteúdo mais sensível do jogo
[a campanha de Hitler] na primeira coisa que investidores/imprensa vêem,
e (b) já demonstra informação imperfeita (Ultra), fricção de comando
(generais discordando), e uma decisão de bombardeio com peso moral
explícito — os três sistemas mais difíceis de vender em texto e mais
convincentes em jogo.

**Conteúdo obrigatório do slice** (mapeado 1:1 ao pedido original):

1. Um ambiente 3D completo e polido — Gabinete de Guerra subterrâneo +
   corredor de acesso a Downing Street.
2. Um personagem controlável (Churchill) com movimentação, animações de
   interação (sentar, pegar documento, atender telefone) e câmera em
   terceira pessoa final.
3. Um assistente (secretário particular) que apresenta a agenda do dia e
   reage a como o jogador a conduz.
4. Uma reunião com três NPCs — Gabinete de Guerra reduzido: um General
   (chefe do Estado-Maior), um Diplomata (Foreign Office) e um Chefe de
   Inteligência (Bletchley Park), cada um com agenda e informação
   parcial próprias.
5. Um documento assinável — ordem de alocação de recursos entre defesa
   antiaérea doméstica e reforço no Norte da África, com consequência
   real no mapa e na moral civil.
6. Um mapa estratégico simplificado — Reino Unido, Atlântico Norte e
   Norte da África apenas, com produção, uma frente ativa e uma rota de
   suprimento.
7. Uma decisão com consequência atrasada — autorizar (ou não) o uso de
   uma interceptação Ultra para desviar um comboio; a consequência real
   (o comboio chega são e salvo, ou os alemães percebem que o código foi
   quebrado e mudam procedimentos) só aparece dias depois, em relatório.
8. Um sistema de salvamento funcional (save/load completo, não apenas
   checkpoint).
9. Uma pequena alteração visual no ambiente — se Londres sofre um
   bombardeio noturno no decorrer do slice, o corredor de acesso ao
   Gabinete de Guerra mostra poeira/estilhaço no dia seguinte.
10. Dois encerramentos do slice: (a) proteger o comboio com sucesso mas
    arriscar expor a fonte Ultra, gerando um gancho de "e se..." para o
    jogo completo; (b) recusar usar Ultra para não arriscar a fonte, o
    comboio sofre perdas, e o Gabinete questiona a hesitação do jogador —
    nenhum dos dois é "o final certo".

**Qualidade alvo**: iluminação (Lumen), materiais e animação facial
representativos do padrão final; dublagem e áudio finais ou muito
próximos disso para as falas do slice específicas; UI funcional com a
mesma estrutura visual do jogo completo (não uma UI de protótipo
substituída depois).

**Fora do slice, mas necessário no jogo completo**: as outras três
campanhas, diplomacia com potências estrangeiras jogadas por IA completa,
o sistema de 20 finais, e o Codex Histórico completo.

## 3.2 Loop principal — visão geral

```
┌─────────────────────────────────────────────────────────────┐
│  1. Início do expediente (ambiente de comando)                │
│  2. Assistente apresenta agenda + eventos                     │
│  3. Jogador navega o espaço, escolhe o que atender             │
│  4. Reunião: personagens apresentam informação                │
│     (verdadeira / incompleta / manipulada)                    │
│  5. Jogador interage: questiona, negocia, decide               │
│  6. Documentos: assinar / recusar / alterar / adiar             │
│  7. Mapa estratégico: frentes, produção, logística,            │
│     pesquisa, diplomacia                                      │
│  8. O mundo simula uma passagem de tempo                       │
│  9. Consequências imediatas + agendamento de consequências     │
│     atrasadas                                                 │
│ 10. Novos eventos/decisões são desbloqueados                   │
└─────────────────────────── loop ──────────────────────────────┘
```

## 3.3 Passo a passo detalhado, com exemplo jogável (slice de Churchill)

**Passo 1 — Início do expediente.** O jogador ganha controle de
Churchill no seu escritório em Downing Street, 06:40. Câmera em terceira
pessoa, controle livre de movimento. Nenhuma UI de menu cobre a tela;
tudo que existe é físico (charuto na mesa como affordance de "espere",
telefone tocando como gancho de urgência).

**Passo 2 — Agenda.** O secretário particular entra fisicamente na sala
("Primeiro-Ministro, três assuntos hoje...") e resume verbalmente 3
compromissos: reunião do Gabinete de Guerra às 08:00, um telegrama de
Washington aguardando resposta, e um relatório de inteligência marcado
"urgente" sobre um comboio no Atlântico. A agenda também aparece como
lista física (uma prancheta) que o jogador pode consultar depois sem
repetir o diálogo.

**Passo 3 — Navegação e escolha.** O jogador caminha por Downing
Street/túnel de acesso ao Gabinete de Guerra. Pode escolher a ordem: ler
o telegrama primeiro, ou ir direto à reunião. Essa ordem afeta que
informação o jogador leva **para dentro** da reunião (se ler o relatório
de inteligência antes, pode confrontar o Chefe de Inteligência na
reunião com uma pergunta específica).

**Passo 4 — A reunião.** Sala de mapas do Gabinete de Guerra. Três NPCs:

- O **General** quer reforçar o Norte da África agora, e apresenta números
  de tropas do Eixo que — sem o jogador saber ainda — vêm de um relatório
  de reconhecimento com duas semanas de atraso (informação
  desatualizada, não mentira deliberada).
- O **Diplomata** traz a resposta pendente de Washington sobre pedido de
  mais destróieres, com um tom de urgência que pode ou não estar
  exagerado por ansiedade pessoal do próprio diplomata (traço de
  personalidade, ver `docs/04`).
- O **Chefe de Inteligência** só menciona o comboio do Atlântico se o
  jogador perguntar diretamente ou já tiver lido o relatório no Passo 3 —
  ele não vai oferecer voluntariamente uma fonte tão sensível (Ultra) na
  frente de todo o Gabinete.

**Passo 5 — Interação.** O jogador pode: pedir ao General a data do
relatório de reconhecimento (revelando que está desatualizado, se
perguntado); pressionar o Diplomata sobre por que Washington está
hesitando; ou levar o Chefe de Inteligência à parte, fora da reunião
formal, para discutir o comboio em privado — cada escolha usa uma opção
diferente do menu de interação descrito em `docs/02`, §2.5 (questionar,
consultar em privado, adiar).

**Passo 6 — Documento.** Ao final da reunião, um documento físico chega à
mesa: ordem de alocação de reforço aéreo — Norte da África ou defesa
doméstica, não ambos nesta janela de tempo. O jogador assina, recusa
(mantém o status quo, mas o General registra insatisfação — afeta
lealdade), ou modifica a proposta (aloca uma fração para cada, com custo
de eficiência em ambas as frentes).

**Passo 7 — Mapa estratégico.** O jogador abre o mapa (mesa de operações
física, transição sem tela de carregamento perceptível) e vê o efeito
imediato da alocação: uma seta de reforço se move para a frente
escolhida. A decisão sobre o comboio (usar Ultra ou não) é tomada aqui,
como uma ordem lançada sobre a rota marítima do próprio mapa.

**Passo 8 — Passagem de tempo.** O jogador avança o tempo até o próximo
evento relevante. O jogo simula internamente resultado de combate,
produção e resposta de IA das potências estrangeiras.

**Passo 9 — Consequências.** Imediata: relatório na manhã seguinte sobre
o resultado do comboio. Atrasada (agendada para ~5 dias de jogo depois,
fora do slice mas desenhada para o jogo completo): se Ultra foi usado,
uma pequena chance registrada de os alemães mudarem procedimento de
cifra, reduzindo temporariamente a qualidade de toda informação de
inteligência futura — o preço de ter "vencido" essa rodada.

**Passo 10 — Novo conteúdo desbloqueado.** Dependendo do resultado, o
Diplomata levanta, na próxima reunião, ou gratidão de Washington (comboio
salvo, aliado tranquilizado) ou preocupação sobre por que a Marinha real
"soube" de um ataque que não deveria ser previsível sem quebra de cifra
— plantando, para o jogo completo, uma linha narrativa sobre proteger a
fonte Ultra.

## 3.4 Por que este loop sustenta os 5 pilares

- **Você está lá** (3.1–3.7 são 100% ambiente físico, zero menu genérico).
- **Ninguém conta a verdade toda** (relatório do General desatualizado;
  Chefe de Inteligência só fala se abordado corretamente).
- **Poder tem fricção** (o General registra insatisfação se recusado; a
  ordem de alocação tem custo real de eficiência se dividida).
- **Consequência, não pontuação** (o preço de usar Ultra aparece dias
  depois, não como número de "risco: 12%").
- **História com honestidade** (o slice não tem nenhuma decisão que
  glorifique violência; a tensão vem inteiramente de logística, confiança
  e informação incompleta).
