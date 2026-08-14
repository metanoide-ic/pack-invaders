# 2. Game Design Document (GDD)

## 2.1 Visão do produto

Um simulador político-militar 3D em terceira pessoa, ambientado entre 1942 e 1945, no qual o jogador interpreta fisicamente um líder mundial da Segunda Guerra. O produto entrega a fantasia de **poder com peso**: cada assinatura, cada reunião, cada mentira contada em público tem custo e consequência, e o mundo se lembra.

**Plataforma de lançamento:** PC (Steam, Epic Games Store). **Portabilidade futura:** PlayStation 5, Xbox Series X|S, sujeita a adaptação de UI/controle e revisão territorial de classificação.

**Modelo de negócio:** jogo-base premium (compra única), com expansões pagas por líder/campanha (Fase de pós-lançamento). Sem microtransações, sem loot box, sem conteúdo pay-to-win — incompatível com o tom do produto.

## 2.2 Público-alvo

- **Primário:** jogadores de 25–45 anos, fãs de estratégia histórica (Hearts of Iron, Crusader Kings, Democracy, Suzerain, Frostpunk), interessados em história do século XX, que valorizam narrativa madura e rejogabilidade via decisões.
- **Secundário:** jogadores de RPG narrativo (Disco Elysium, Wolfenstein: The New Order — pela ambientação, não pelo tom de ação) que buscam profundidade de escolha e consequência.
- **Terciário:** educadores e entusiastas de história militar que usam o jogo como ferramenta de discussão (com o material de bibliografia interna como apoio).

Classificação etária alvo: 18+ (conteúdo bélico gráfico moderado, temas de genocídio e crimes de guerra tratados narrativamente, sem exploração gráfica).

## 2.3 Pilares de experiência

1. **Você está na sala.** Toda decisão importante acontece com o jogador fisicamente presente — olhando o interlocutor nos olhos, não escolhendo em um menu abstrato.
2. **Ninguém te conta a verdade toda.** Informação é sempre parcial, atrasada ou manipulada. Dominar a névoa da guerra é tão importante quanto vencer batalhas.
3. **Poder tem rosto.** Ministros, generais e civis são pessoas com memória, medo e ambição — não barras de stat.
4. **A história cobra a conta.** Nenhuma vitória apaga um crime. Nenhuma boa intenção anula uma escolha ruim anterior. Os epílogos são honestos.
5. **Cada líder é um jogo diferente.** Hitler, Churchill, Roosevelt e Stalin não compartilham a mesma árvore de sistemas — compartilham o mesmo motor.

## 2.4 Comparação com concorrentes

| Produto | O que faz bem | O que falta (que DICTOCRACY cobre) |
|---|---|---|
| **Hearts of Iron IV** | Profundidade de estratégia militar e produção | Sem presença física do líder; decisões morais são checkbox de foco nacional |
| **Suzerain** | Peso narrativo de decisões de Estado, elenco memorável | Sem exploração 3D, sem mapa de guerra tático, ficção especulativa (não histórica) |
| **Democracy 4** | Simulação sistêmica de políticas públicas | Zero narrativa, zero personagem, interface puramente abstrata |
| **Twilight Struggle / Diplomacy** | Tensão diplomática genuína entre potências | Escala de tabuleiro, sem imersão em primeira/terceira pessoa |
| **Wolfenstein / Call of Duty (WWII)** | Produção visual AAA, imersão sensorial | Zero agência política; guerra tratada como cenário de tiro, não decisão |
| **Crusader Kings III** | Personagens com relações, segredos, intriga de corte | Ambientação medieval abstrata, sem câmera em terceira pessoa nem mapa tático moderno |

**Posição única de DICTOCRACY:** único produto que combina presença física do decisor + elenco com memória e agenda própria + simulação de guerra orientada a dados + responsabilidade histórica explícita.

## 2.5 Mecânicas centrais

- **Exploração em terceira pessoa** por ambientes de comando (gabinetes, bunkers, trens, residências) com interações contextuais (documentos, telefones, rádios, mapas de parede).
- **Diálogo ramificado não-binário**: cada proposta permite aprovar, recusar, adiar, pedir mais informação, alterar, consultar terceiros, executar secretamente, delegar, mentir publicamente ou contradizer ordem anterior — nem toda decisão expõe todas as opções, mas o sistema nunca reduz por padrão a "sim/não".
- **Agenda diária/semanal**: o tempo avança em blocos; o jogador escolhe que reuniões atender, sabendo que ignorar uma tem custo.
- **Mapa estratégico mundial**: gestão de frentes, produção, logística, ciência e diplomacia por delegação a comandantes e ministros com personalidade própria (o jogador não move unidades individuais).
- **Informação imperfeita**: nenhum número no mapa é 100% confiável; a qualidade da informação depende de inteligência, lealdade e canal de comunicação.
- **Sistema de personagens com memória**: NPCs guardam registro das decisões do jogador e mudam comportamento, lealdade e ações autônomas em resposta.
- **Diplomacia ativa**: negociações presenciais e remotas com IAs de outros líderes que têm objetivos próprios e recusam propostas absurdas.
- **Consequência em duas velocidades**: toda decisão relevante gera efeito imediato (visível em minutos de jogo) e efeito tardio (visível em semanas/meses, às vezes só em epílogo).

## 2.6 Estrutura narrativa

- **Quatro campanhas paralelas e assimétricas** (Hitler, Churchill, Roosevelt, Stalin) no jogo-base, cada uma com sistemas exclusivos (detalhados nos documentos de campanha — fora do escopo desta entrega textual, referenciados em `02-campanhas.md`).
- **Linha do tempo histórica como espinha dorsal**: eventos documentados ocorrem por padrão; a partir da primeira divergência causada pelo jogador, a simulação passa a gerar história alternativa plausível, sempre rastreável (ver Estrutura de Decisão, seção 7).
- **Multiplicidade de finais**: 20 finais globais (seção dedicada), cada um com variações pessoais por líder, permitindo dezenas de combinações de epílogo.
- **Tela de abertura obrigatória** (todas as campanhas) com aviso de contexto histórico — ver `06-conformidade.md`.

## 2.7 Estrutura mínima viável (referência cruzada)
Ver `08-escopo.md` para o corte exato de MVP: 1 campanha jogável completa (Hitler ou Churchill, a decidir no protótipo por menor complexidade de licenciamento de voz/rosto), ~6 ambientes, ~15 personagens principais, ~40 decisões nomeadas, 5 finais globais.
