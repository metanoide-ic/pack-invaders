# 9. Plano de Produção por Sprints

Sprints de 2 semanas. Fases seguem estritamente a ordem exigida: **nunca pular direto para produção completa**.

## Fase 1 — Documento de Design (esta entrega)
**Duração:** 4 sprints (8 semanas) — já em execução/conclusão nesta entrega.
- Sprints 1–2: pesquisa histórica inicial, GDD, comparação de mercado, pilares.
- Sprints 3–4: arquitetura técnica, modelo de dados, plano visual, plano de produção, revisão jurídica preliminar de escopo.
- **Gate de saída:** aprovação formal deste documento pelos stakeholders antes de abrir Fase 2.

## Fase 2 — Protótipo
**Duração:** 6 sprints (12 semanas).
- Sprint 1: setup de projeto UE5, estrutura de módulos C++/BP, pipeline de build/CI.
- Sprint 2: locomoção em terceira pessoa + um escritório 3D com assets temporários licenciados.
- Sprint 3: assistente pessoal (agenda) + sistema de diálogo básico (não-binário) com 3 NPCs em uma reunião.
- Sprint 4: sistema de documento assinável + `DecisionSystem` mínimo com uma decisão de consequência atrasada real.
- Sprint 5: mapa estratégico simplificado (visual placeholder, dados reais) + `SaveGameSystem` v1.
- Sprint 6: alteração visual ambiental condicionada a estado de jogo (prova de conceito de progressão de dano) + polimento de protótipo + playtest interno.
- **Gate de saída:** protótipo passa nos critérios de diversão objetivos (seção 12) antes de abrir Fase 3.

## Fase 3 — Vertical Slice
**Duração:** 8 sprints (16 semanas).
- Sprints 1–2: produção de ambiente Churchill em qualidade final (Cabinet War Rooms + Downing Street).
- Sprints 3–4: produção dos 5 NPCs principais (MetaHuman customizado, voz, animação facial).
- Sprints 5–6: implementação de conteúdo narrativo do slice (2 reuniões, pronunciamento, crise militar, decisão moral) + mapa estratégico do Mediterrâneo/Atlântico.
- Sprint 7: dois encerramentos do slice, áudio final (trilha, VO, ambiente), acessibilidade básica.
- Sprint 8: polimento, otimização de performance contra meta, correção de bugs, preparação de material de apresentação.
- **Gate de saída:** validação externa (stakeholders + teste com jogadores-alvo) antes de abrir Fase 4.

## Fase 4 — Produção do Jogo-Base
**Duração estimada:** 18–24 meses após aprovação do vertical slice (ver detalhamento de equipe/orçamento).
- Bloco 1 (meses 1–6): produção paralela das 4 campanhas (times dedicados por campanha) + sistema mundial completo + `CountryAI` madura.
- Bloco 2 (meses 7–12): eventos históricos completos, ~15–20 finais globais com variantes, diplomacia completa, espionagem.
- Bloco 3 (meses 13–18): localização, acessibilidade completa, otimização de performance final, revisão jurídica final de todos os personagens/assets.
- Bloco 4 (meses 19–24): certificação, classificação etária (IARC), testes de QA em escala, hardening de rede/salvamento, marketing e lançamento.

# 10. Estimativa de Equipe, Tempo e Orçamento

**Premissa:** estúdio independente/mid-size, não AAA de grande porte; orçamento coerente com escopo (4 campanhas assimétricas, elenco extenso, qualidade visual alta mas não blockbuster de 300 pessoas).

## Fase 2 — Protótipo (12 semanas)
| Papel | Pessoas |
|---|---|
| Diretor de projeto/design | 1 |
| Programador UE5 (C++) | 2 |
| Programador gameplay (BP) | 1 |
| Artista 3D generalista | 2 |
| Designer narrativo | 1 |
| **Total** | **7 pessoas** |
Custo estimado (encargos inclusos, mercado misto remoto): **≈ US$ 260.000–320.000**

## Fase 3 — Vertical Slice (16 semanas)
| Papel | Pessoas |
|---|---|
| Diretor de projeto/design | 1 |
| Programadores UE5 (C++/BP) | 4 |
| Artistas de ambiente | 3 |
| Artistas/técnicos de personagem (MetaHuman, rig, facial) | 3 |
| Designer narrativo/roteirista | 2 |
| Consultor histórico (part-time) | 1 |
| Sound designer/compositor | 1 |
| QA | 1 |
| **Total** | **16 pessoas** |
Custo estimado: **≈ US$ 900.000–1.100.000**

## Fase 4 — Jogo-Base (18–24 meses)
| Papel | Pessoas |
|---|---|
| Direção (projeto, arte, design, narrativa) | 4 |
| Programação (engine/gameplay/IA/ferramentas) | 10–12 |
| Arte de ambiente | 6–8 |
| Arte/técnica de personagem | 6 |
| Animação | 4 |
| Narrativa/roteiro (4 campanhas) | 5–6 |
| Áudio (música, VO, design de som) | 3 |
| UI/UX | 2 |
| QA | 4–6 |
| Produção/gestão | 3 |
| Consultores (história, Holocausto, cultural, jurídico) | part-time, contrato |
| **Total** | **≈ 47–55 pessoas em pico** |
Custo estimado: **≈ US$ 9.000.000–13.000.000** (18–24 meses, dependendo de mercado de contratação e escopo final de localização/plataformas)

**Orçamento total do produto (Fases 2–4, pré-marketing):** aproximadamente **US$ 10.500.000–14.500.000**, mais custo de marketing/lançamento e revisão jurídica/territorial (estimativa separada, tipicamente 10–20% do orçamento de produção).

Esta é uma estimativa de planejamento, não uma cotação — deve ser revalidada com produtor executivo e financeiro antes de compromisso orçamentário formal.

# 11. Principais Riscos

## Técnicos
- **Custo de streaming ambiente↔mapa** sem hitches — mitigação: prova de conceito dedicada na Fase 2, não adiar para produção final.
- **Escala de IA de país** (múltiplas potências, memória de acordos, negociação) pode não escalar em performance ou em qualidade de decisão — mitigação: `BalanceSim` headless desde o protótipo, iteração de IA isolada da renderização.
- **Custo de produção de personagem** (MetaHuman customizado em escala, elenco extenso) pode estourar cronograma — mitigação: pipeline de customização facial semi-automatizado, priorização por relevância narrativa (NPCs secundários com menor fidelidade facial).

## Históricos
- **Precisão vs. jogabilidade**: simplificações podem distorcer percepção pública de eventos reais — mitigação: revisão por historiadores dedicados e etiquetagem de proveniência obrigatória e visível.
- **Sensibilidade do Holocausto e crimes de guerra**: risco de banalização ou de retratação didaticamente incorreta — mitigação: consultor especializado em Holocausto com poder de veto sobre conteúdo relacionado, revisão contínua (não apenas checkpoint final).

## Jurídicos
- **Direito de imagem/voz de figuras históricas e de dubladores** — mitigação: revisão jurídica por personagem antes de produção de asset final; uso exclusivo de referência de domínio público ou licenciada.
- **Símbolos proibidos por legislação territorial** (ex.: legislação alemã sobre símbolos nazistas) — mitigação: sistema de substituição de símbolos configurável por território, desde a arquitetura de dados (não retrofit).
- **Classificação etária e distribuição** (IARC, políticas de loja) — mitigação: questionário IARC preenchido cedo (Fase 3), não no fim da Fase 4.

## Comerciais
- **Nicho de público** (estratégia histórica madura é nicho, mesmo que fiel) — mitigação: posicionamento de marketing claro desde o vertical slice, validação de interesse via demo pública controlada.
- **Comparação injusta com jogos de ação de guerra** (expectativa de combate direto que o produto não oferece) — mitigação: comunicação de gênero explícita em toda a campanha de marketing, trailer que mostra o loop real.
- **Percepção de "jogo sobre nazismo"** fora de contexto (viralização de recorte sem contexto) — mitigação: tela de abertura obrigatória, kit de imprensa com posicionamento editorial claro, press embargo coordenado com material educativo.

# 12. Critérios Objetivos para Avaliar se o Protótipo é Divertido

O protótipo passa no gate de Fase 2→3 somente se, em testes com pelo menos 12 jogadores do público-alvo (fora da equipe):

1. **≥ 75%** completam o loop completo (agenda → reunião → decisão → mapa → consequência) sem instrução externa após o tutorial inicial.
2. **≥ 70%** relatam, em questionário pós-sessão, que "senti que minha decisão teve peso" (escala Likert ≥ 4/5).
3. **≥ 60%** conseguem descrever corretamente, sem reler, qual foi a consequência atrasada da decisão que tomaram, quando ela se manifesta na sessão seguinte — evidência de que a causalidade é legível, não arbitrária.
4. **Tempo médio de sessão voluntária** (jogador para porque quer, não porque acabou o conteúdo) **≥ 20 minutos** no protótipo de conteúdo limitado.
5. **Nenhum crash ou softlock** em 12 sessões completas.
6. Em entrevista aberta, pelo menos **2/3 dos jogadores** mencionam espontaneamente querer saber "o que teria acontecido se" tivessem decidido diferente — sinal de que a rejogabilidade por decisão está funcionando como pilar, não só como promessa.

# 13. O Que Fica Fora da Primeira Versão (Jogo-Base)

- As 4 campanhas de expansão (Mussolini, Tojo, de Gaulle, Chiang Kai-shek).
- Multiplayer ou qualquer modo cooperativo/competitivo.
- Editor de conteúdo exposto ao usuário final (a ferramenta interna de autoria é uso de produção, não feature de jogador).
- Suporte a mods oficial (pode ser avaliado pós-lançamento).
- Versões para PlayStation/Xbox (planejadas, não incluídas no cronograma/orçamento desta fase).
- Realidade virtual.
- Vozes totalmente dinâmicas por IA generativa (usar elenco de dublagem humana licenciada; avaliação de IA de voz fica para pesquisa futura, sujeita a política de conteúdo e sindicatos de dublagem).
- Simulação de unidades individuais em combate tático (o jogo permanece em nível de comando/delegação, nunca vira um RTS de unidade única).
- Guerra do Pacífico como teatro jogável completo no jogo-base (presente apenas como pressão sistêmica sobre Roosevelt; expansão de Tojo cobrirá o teatro em profundidade).
- Conteúdo gerado por usuário e qualquer sistema de moderação associado (adiado até haver necessidade real de UGC).
