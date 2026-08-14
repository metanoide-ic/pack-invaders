# Roteiro Completo — Vertical Slice "A Véspera de Alamein"

**Proveniência geral:** a Segunda Batalha de El Alamein começou na noite de 23 de outubro de 1942; a expectativa e a ansiedade britânica nos dias anteriores são documentadas. Os NPCs "Menzies" (Chefe do Secret Intelligence Service) e "C" como codinome são históricos; **Aldous** é um personagem composto e ficcional (`EHistoricalProvenance::DramaticFiction`), criado para representar a função de ligação de reconhecimento aéreo sem atribuir diálogo inventado a uma pessoa real específica. As falas de todos os personagens, incluindo os históricos, são dramatização — nenhuma é citação documentada.

Ordem de cenas (tempo estimado de jogo entre parênteses):

1. Abertura/agenda (2 min)
2. Reunião 1 — "A Decisão de Duisburg" (8–10 min) — **já existe, ver `../prototype/Narrative/roteiro-reuniao-prototipo.md`**, sem alteração
3. Pronunciamento de rádio (4–5 min) — **novo**
4. Reunião 2 — Briefing de Inteligência (8–10 min) — **novo**
5. Crise — decisão sobre Alamein (5–7 min) — **novo**
6. Mapa estratégico (livre, 2–5 min)
7. Encerramento do slice (2 min) — **novo**

Total: 31–41 minutos, dentro da janela de 30–45 min definida.

---

## Cena 3 — Pronunciamento de Rádio (nova)

**Local:** um estúdio de transmissão improvisado dentro do Cabinet War Rooms (documentado: Churchill fez transmissões de dentro do complexo). **Gatilho:** aparece na agenda do mesmo dia da Reunião 1, após ela ser concluída.

**ISMAY**
Primeiro-Ministro, a BBC está pronta para a transmissão às 21h. O texto está sobre a mesa — mas o senhor sempre revisa até o último minuto.

> *[Jogador se aproxima do microfone. Documento com o rascunho do discurso é interativo — o jogador pode ler o texto completo antes de escolher o tom.]*

> *[Escolha de tom — não é sobre o conteúdo factual do discurso (isso é fixo, refletindo o que é seguro anunciar publicamente em outubro de 1942), mas sobre COMO ele é entregue. Cada opção afeta `CivilianMoraleUK` de forma diferente, e alimenta um dos dois encerramentos do slice:]*

1. **Tom Resoluto** — "Vamos entregar como está escrito: sem suavizar, sem prometer o que não podemos garantir. Confiança through franqueza." *(Efeito: `CivilianMoraleUK +3` imediato; risco documentado no dossiê: franqueza excessiva sobre dificuldades pode ser lida como pessimismo por parte crítica da imprensa — sinalizado, não penalizado automaticamente.)*
2. **Tom Reconfortante** — "Vamos suavizar as partes mais duras. As pessoas estão exaustas; precisam de esperança, não de mais uma lista de sacrifícios." *(Efeito: `CivilianMoraleUK +5` imediato, mas `DiplomaticInfluenceUK -1` tardio — Eden comenta depois que aliados notaram a discrepância entre o tom público e os relatórios reais que circulam entre governos.)*

**ISMAY** *(após a transmissão, fecha a cena)*
Foi ao ar, Primeiro-Ministro. A resposta virá amanhã pelos jornais — e por quem realmente importa: o povo que estava ouvindo.

---

## Cena 4 — Briefing de Inteligência (nova, Reunião 2)

**Local:** sala de mapas, mais tarde no mesmo dia (ou dia seguinte, a critério de produção). **NPCs:** Menzies ("C"), Aldous (fictício).

**MENZIES** *(tom controlado, informação sensível)*
Primeiro-Ministro, material Ultra decifrado nas últimas 36 horas sugere que Rommel está recebendo reforços blindados significativos pela rota costeira — se confirmado, muda o cálculo de Montgomery para a ofensiva.

**ALDOUS** *(hesita, olha para Menzies antes de falar — tensão visível entre os dois)*
Com todo respeito, senhor... o reconhecimento fotográfico das últimas 48 horas não mostra esse volume de tráfego na estrada costeira. Ou os reforços ainda não chegaram, ou estão vindo por outra rota que não estamos monitorando.

**MENZIES** *(sem ceder, mas sem hostilidade)*
Ultra não erra sobre a existência da ordem de movimento — pode errar sobre o momento exato. Eu confiaria na fonte antes de confiar na ausência de evidência fotográfica.

> *[Este é o núcleo do sistema de informação imperfeita em miniatura: duas fontes competentes e leais discordam, e nenhuma está "mentindo". O jogador pode perguntar mais a cada um, mas nenhuma pergunta resolve a ambiguidade por completo — é uma decisão sob incerteza real, não um quebra-cabeça com resposta escondida.]*

**Perguntas disponíveis antes de decidir** (não-obrigatórias, cada uma revela mais contexto sem eliminar a incerteza):
- *Para Menzies:* "Há quanto tempo essa fonte está confiável?" → revela que a fonte tem histórico sólido, mas decodificação daquele dia específico teve uma lacuna de 6 horas.
- *Para Aldous:* "Quão confiável é o reconhecimento nessa área?" → revela que a cobertura fotográfica da rota alternativa mencionada por Menzies é fraca — Aldous não pode descartá-la, só não pode confirmá-la.

---

## Cena 5 — A Decisão de Alamein (crise militar, nova)

**MENZIES**
Montgomery precisa da sua orientação até amanhã de manhã: atacar conforme planejado, assumindo que a inteligência Ultra está correta, ou atrasar 48 horas para reconhecimento adicional confirmar ou descartar os reforços.

> *[Decisão — 4 opções, refletindo o vocabulário não-binário do sistema:]*

1. **Autorizar o ataque conforme planejado (confiar em Ultra)** — `EDecisionOptionType::Approve`. Imediato: `MilitaryMoraleUK +2`. Atrasado (dia +2, dentro do slice isso pode se manifestar já no epílogo): se os reforços eram reais, o ataque enfrenta resistência maior que o esperado (`ElAlameinReadiness -4`); se não eram, o ataque tem vantagem total (`ElAlameinReadiness +6`) — **o próprio sistema não revela ao jogador, no momento da escolha, qual dos dois vai acontecer**, isso é resolvido de forma determinística pelos dados de configuração do slice (ver `Data/Decisions_VerticalSlice.json`) e revelado apenas no epílogo, coerente com o princípio de informação imperfeita.
2. **Atrasar 48 horas para confirmação (confiar em Aldous)** — `EDecisionOptionType::Delay`. Imediato: nenhum. Atrasado: janela de surpresa tática reduzida (`ElAlameinReadiness -2` garantido, sem ambiguidade — atrasar tem custo certo, mesmo que a decisão fosse "mais segura" em tese).
3. **Dividir a diferença — autorizar um ataque de reconhecimento em força antes do assalto principal** — `EDecisionOptionType::Modify`. Meio-termo: custo e benefício menores em ambas as direções, com uma nova pergunta gerada para o jogador (fora do escopo mínimo do slice — sinalizado como gancho para conteúdo pós-slice).
4. **Delegar a decisão final a Montgomery, com as duas informações repassadas** — `EDecisionOptionType::Delegate`. O resultado depende da personalidade do comandante (fora do escopo de simulação individual de general no slice — resolvido por um valor fixo de configuração, com nota explícita no dossiê pós-jogo de que isto é uma simplificação que a Fase 4 substitui por avaliação real de `CountryAI`/perfil de comandante).

---

## Cena 6 — Mapa Estratégico
Sem alteração de escopo em relação ao protótipo — o jogador pode abrir o mapa a qualquer momento após a Cena 5 e ver o indicador `ElAlameinReadiness` refletido visualmente (reaproveita o padrão de `WBP_StrategicMapSimplified` do protótipo).

---

## Cena 7 — Encerramento do Slice (novo)

Dois encerramentos, determinados pela combinação de **tom do pronunciamento** (Cena 3) e **decisão de Alamein** (Cena 5) — ver `Data/Endings_VerticalSlice.json` para as condições exatas.

### Encerramento A — "A Guerra Continua nas Suas Mãos"
*(condição típica: tom resoluto + qualquer decisão de Alamein com `ElAlameinReadiness` final positivo)*

Tela de epílogo, texto sobre imagem estática do Cabinet War Rooms ao anoitecer:

> Nos dias seguintes, os relatórios de Montgomery confirmam: a ofensiva avança. Não sem custo — nunca sem custo —, mas avança. Em Londres, a transmissão de rádio é lembrada como um momento de clareza em meio à exaustão. Churchill dorme poucas horas essa noite, como quase todas as outras. A guerra não terminou. Só uma decisão, entre centenas ainda por vir, foi tomada — e o mundo, por enquanto, segue o rumo que ela abriu.

### Encerramento B — "Sombras de Dúvida"
*(condição típica: tom reconfortante + decisão de Alamein com `ElAlameinReadiness` final negativo, ou delegação sem acompanhamento)*

> Os primeiros relatórios de Montgomery são ambíguos — nem derrota, nem a vitória decisiva que Londres esperava. Nos corredores do Gabinete de Guerra, começam as perguntas silenciosas sobre se a informação certa chegou a tempo, e se foi usada da forma certa. Churchill relê a transcrição do próprio discurso e nota, pela primeira vez, a distância entre o que disse ao país e o que sabia quando disse. A guerra não terminou. Essa decisão específica vai custar mais do que parecia, quando foi tomada.

**Nota de design:** nenhum dos dois encerramentos é "o final feliz" nem "o final ruim" de forma explícita — ambos mostram a guerra continuando, com pesos e dúvidas diferentes. Isso é intencional e consistente com a regra do GDD de nunca tratar decisões de guerra como vitória limpa (`../08-finais-e-conformidade.md`).
