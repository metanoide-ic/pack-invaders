# HUMANOCRACY — Game Design Document

## Volume 0 — Visão Geral e Filosofia

> **"A verdade existe. Você só nunca terá acesso completo a ela."**

| Campo | Valor |
|---|---|
| Título | **Humanocracy** |
| Gênero | Thriller burocrático / simulador de decisão sob incerteza / horror psicológico |
| Inspiração estrutural | Apenas o conceito de inspeção documental (Papers, Please). Nenhum personagem, país, estética, narrativa ou mecânica específica é reaproveitada. |
| Plataformas | PC (protótipo web jogável incluso neste repositório; produção em Unity — ver Volume 9) |
| Duração da campanha | 48 dias in-game (~8–12h de jogo) |
| Classificação | 16+ — temas de totalitarismo, perseguição, luto |
| Idioma base | Português (pt-BR) |

---

## 0.1 O Pitch

O mundo inteiro sabe que os alienígenas existem. Chamam-nos de **Alternados** — um nome
dado pelos governos décadas atrás; ninguém sabe o nome verdadeiro da espécie. Eles copiam
pessoas. Até certo ponto. **O problema é descobrir qual é esse ponto** — e, sobre isso,
nenhum governo, cientista, jornal ou religião concorda.

Você é um inspetor de fronteira no **Posto de Triagem Nº 7** da República de **Osteria**,
sorteado na Loteria de Ofícios para 48 dias de serviço. Sua ferramenta é um carimbo. Seu
inimigo não são os Alternados.

**É a incerteza.**

---

## 0.2 Filosofia Central

Este não é um jogo sobre descobrir documentos falsos. Não é um jogo sobre alienígenas,
sobre política ou sobre guerra. É um jogo sobre **o colapso da verdade**.

A mecânica principal não é analisar papéis. **É administrar a própria paranoia.**

### O princípio inegociável: A VERDADE EXISTE

O jogo **sempre** conhece a resposta correta. Este é o pilar técnico e ético de todo o design:

- Todo cidadão possui um **Estado Verdadeiro** invisível: humano ou Alternado, histórico
  real, objetivos reais, crimes reais e crimes de que foi acusado injustamente.
- O Estado Verdadeiro **nunca muda arbitrariamente**. Um humano nunca "vira" Alternado
  porque o roteiro precisa. Uma substituição tem data, método, missão e limitações registradas.
- O jogador nunca decide baseado na verdade. **Decide baseado em evidências** — e evidências
  têm qualidade variável: confiáveis, adulteradas, desatualizadas, falsas, incompletas.
- A ambiguidade moral nasce da **falta de informação**, nunca da inexistência da verdade.
  O jogador *pode* acertar. O jogo nunca manipula a realidade para que toda escolha seja errada.

### O que nunca é respondido

- Qual teoria sobre a origem dos Alternados é a correta (Volume 2).
- Se a família do jogador continua humana.
- Quem assassinou o Chanceler no Dia 7.
- Se as memórias contraditórias do fim da campanha são manipulação, estresse ou outra coisa.
- Se o relatório final de estatísticas ("Estado Verdadeiro") também não mente.

---

## 0.3 Objetivo Emocional — a curva de 48 dias

O jogador deve atravessar, nesta ordem, dez estados emocionais. Cada sistema do jogo
existe para servir a essa curva:

| Fase | Dias | Emoção | Como o design a produz |
|---|---|---|---|
| 1 | 1–3 | **Confiança** | Regras simples, documentos honestos, erros óbvios |
| 2 | 4–6 | **Curiosidade** | Primeiros boatos, jornais contraditórios |
| 3 | 7–11 | **Desconfiança** | Assassinato do Chanceler; ninguém concorda sobre a autoria |
| 4 | 12–19 | **Paranoia** | Regime Mehrvolk; leis raciais; denúncias; scanners vendidos como salvação |
| 5 | 20–26 | **Culpa** | Leis contraditórias forçam erros; rostos conhecidos voltam piores |
| 6 | 27–29 | **Medo** | Atentado; ninguém sabe de quem fugir |
| 7 | 30–36 | **Desespero** | Golpe comunista; tudo que era certo vira crime; o mesmo scanner serve aos dois regimes |
| 8 | 37–42 | **Apatia** | O Estado admite que o scanner era defeituoso; as pessoas riem, depois choram |
| 9 | 43–46 | **Aceitação** | Colapso; o jogador aplica regras que não existem mais |
| 10 | 47–48 | **Choque** | O botão REJEITAR desaparece; o espelho |

O jogo começa fazendo o jogador acreditar que **sempre existe uma resposta correta para
cada situação** — e então destrói essa crença metodicamente, sem nunca mentir para ele.

---

## 0.4 Pilares de Design

1. **Evidência, não onisciência.** Toda informação chega por fonte humana — e humanos mentem,
   erram, exageram e têm interesses. A propaganda nunca mente completamente: mistura fatos
   verdadeiros com manipulação, porque é assim que ela convence.
2. **O mundo não espera o jogador.** A guerra, o golpe e a ascensão de Mehrvolk aconteceriam
   sem ele. O jogador é uma engrenagem pequena; suas vitórias são valiosas porque são pequenas.
3. **Nada desaparece.** Toda decisão alimenta a Memória do Mundo (Volume 7). Consequências
   são tardias, ambíguas e nunca anunciadas ("Sistema de Ecos").
4. **Cada NPC é uma pessoa.** Nome, família, medos, segredos, destino — mesmo quem aparece
   uma única vez. O jogador talvez nunca descubra. Mas o jogo sabe.
5. **O inimigo aprende com você.** A IA dos Alternados observa os hábitos de inspeção do
   jogador e produz falsificações que exploram exatamente esses hábitos (Volume 2). Nunca
   é explicado; o jogador apenas sente que algo mudou.
6. **Você também é inspecionado.** Governo, resistência, cientistas, mercado negro e os
   próprios Alternados constroem um perfil psicológico do jogador. O desfecho depende de
   quem ele se tornou aos olhos de cada facção. *Ninguém observa sem ser observado.*
7. **Crítica, nunca glorificação.** O regime Mehrvolk é retratado como mecanismo de
   propaganda, repressão e pseudociência — jamais como ideologia correta, desejável ou
   eficaz. O jogo mostra como burocracia, medo e "estudos" fabricados transformam pessoas
   comuns em peças de um sistema de opressão. Nenhum símbolo, nome, uniforme ou organização
   real é reproduzido.

---

## 0.5 A Grande Pergunta

Durante 48 dias, o jogador tenta responder: **"Quem é um Alternado?"**

No Dia 48, diante do próprio reflexo no vidro do guichê, a pergunta muda:

**"Quem sou eu depois de quarenta e oito dias?"**

Esse é o verdadeiro tema do jogo.

---

## 0.6 Estrutura deste GDD

| Volume | Conteúdo |
|---|---|
| 0 | Visão geral e filosofia (este documento) |
| 1 | O mundo: Osteria e os nove países, etnias, cronologia, geopolítica |
| 2 | Os Alternados: teorias, biologia provisória, IA adaptativa |
| 3 | Gameplay: o posto, a fila, o tempo, inspeção, interrogatório, scanners |
| 4 | Documentos: catálogo completo, falsificações, materiais, biometria |
| 5 | NPCs: geração de pessoas, personalidade, memória, personagens recorrentes, família |
| 6 | Campanha: os 48 dias, eventos, regimes, finais |
| 7 | Sistemas: economia, leis, propaganda, facções, Memória do Mundo, corrupção |
| 8 | Arte, áudio, UI/UX |
| 9 | Arquitetura técnica (Unity + protótipo web), balanceamento, dados |

O **protótipo jogável** (`humanocracy/index.html`) implementa a fatia vertical dos
sistemas centrais e serve como prova de conceito de tom, ritmo e mecânica.
