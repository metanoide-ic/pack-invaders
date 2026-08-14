# Anexo A — Tela Inicial Obrigatória

Exibida antes do menu principal, em toda campanha, sem opção de pular na primeira execução (pulável em execuções seguintes, mantendo acessível via menu "Sobre este jogo"):

> **DICTOCRACY: 1942** retrata regimes, ideologias e acontecimentos da Segunda Guerra Mundial com propósito histórico e narrativo.
>
> Este jogo **não apoia nem promove** nenhuma das ideologias, regimes ou ações representadas — incluindo nazismo, fascismo, comunismo autoritário, imperialismo, racismo, antissemitismo, genocídio ou crimes de guerra.
>
> Determinadas situações, personagens e diálogos foram **dramatizados para fins narrativos** e não devem ser interpretados como registro documental literal. Cada evento é identificado internamente segundo sua natureza: histórico documentado, historicamente plausível, história alternativa ou ficção dramática.
>
> Crimes contra a humanidade cometidos por um líder jogável **não são apagados** por decisões posteriores, boas intenções ou pelo desfecho da campanha. O jogo mantém um registro histórico permanente das ações do jogador.
>
> Uma bibliografia consultada está disponível no menu do jogo.

## Anexo B — Lista de Finais Globais (com variação estrutural)

Cada final abaixo é avaliado por `FEndingData.GlobalConditions` sobre o estado final do `WorldSim`, e então refinado por `PersonalVariants` por líder jogado. Nenhum final com controle territorial total, uso de armas nucleares ou repressão sistemática é apresentado com tom celebratório — o epílogo textual/cinemático sempre expõe explicitamente autoritarismo, resistência, destruição, fome, mortes ou instabilidade associados.

1. **Direto dos Livros** — desfecho próximo ao histórico documentado; variação por decisões pessoais do líder dentro da trajetória real.
2. **Paz Improvável** — armistício negociado com devolução de territórios; variação por quais potências assinam e a que custo interno.
3. **Europa Vermelha** — URSS domina quase toda a Europa; epílogo mostra consolidação autoritária, não "vitória limpa".
4. **O Século Americano** — EUA assumem hegemonia antecipada; epílogo cobre custo doméstico (dívida, tensão social, expectativa não cumprida).
5. **Fortaleza Europa** — Alemanha mantém domínio continental totalitário; epílogo explícito de repressão, resistência armada persistente e isolamento internacional.
6. **Espaço Vital** — Alemanha garante territórios orientais via armistício instável; epílogo mostra fragilidade da "paz" e sofrimento das populações ocupadas.
7. **Império do Sol** — Japão consolida parte das conquistas e negocia paz; epílogo cobre custo humano no Pacífico e instabilidade regional.
8. **A França Retorna** — França recupera protagonismo europeu; variação conforme a campanha de de Gaulle (se jogada) ou como potência reconstruída por decisões aliadas.
9. **Traição Precoce** — Itália muda de lado antes do histórico; efeito cascata sobre o Mediterrâneo e sobre a confiança do Eixo.
10. **Mundo Nuclear** — múltiplas cidades destruídas por armas atômicas; epílogo sem ambiguidade: contagem de vítimas civis, crise humanitária, precedente perigoso para o pós-guerra — nunca tratado como vitória limpa.
11. **Guerra Sem Fim** — conflito persiste além de 1945; epílogo de exaustão, colapso econômico e fadiga social generalizada.
12. **Terceira Guerra** — antigos Aliados entram em conflito direto; epílogo de instabilidade global aguda.
13. **Queda dos Ditadores** — regimes totalitários colapsam; epílogo mostra vácuo de poder e reconstrução difícil, não utopia instantânea.
14. **Sem Impérios** — descolonização antecipada; epílogo cobre tanto ganhos de autodeterminação quanto turbulência de transição.
15. **Alemanha Dividida** — fragmentação em múltiplos Estados; variação conforme quais potências administram cada fragmento.
16. **Golpe dos Generais** — militares removem Hitler do poder; epílogo cobre o novo governo formado e sua legitimidade contestada.
17. **Tribunal** — líderes sobreviventes capturados e julgados; usa diretamente o `HistoricalLedger`/dossiê de crimes acumulado na campanha.
18. **Guerra Civil Europeia** — facções distintas prolongam o conflito dentro do continente; epílogo de fronteiras instáveis e violência prolongada.
19. **Destruição Mútua** — nenhuma potência vence de fato; epílogo de exaustão mútua e ordem mundial em aberto.
20. **Conselho Mundial** — surge organização internacional com autoridade real; epílogo avalia se essa autoridade é legítima ou apenas nova arena de disputa entre potências.

Cada final é composto e reportado ao jogador considerando: líder jogado, países sobreviventes, fronteiras resultantes, ideologias dominantes, mortes civis e militares, uso de armas nucleares, crimes cometidos (via `HistoricalLedger`), alianças formadas, situação econômica, destino pessoal do(s) líder(es) e condições sociais projetadas entre 1945–1960 (texto gerado a partir de `FEndingData.FactorsConsidered`, não um texto único fixo por final).

# Anexo C — Conformidade Internacional (planejamento desde a Fase 1)

- Classificação etária alvo 18+; questionário IARC preenchido e revisado já na Fase 3 (vertical slice), não adiado.
- Revisão das regras de conteúdo da Steam (e de outras lojas, quando aplicável) antes de qualquer material público.
- Sistema de substituição de símbolos proibidos configurável por território, presente na arquitetura de dados desde o protótipo (campo de metadado em assets visuais sensíveis).
- Avisos de conteúdo específicos (violência bélica, temas de genocídio, crimes de guerra) na loja e no primeiro boot.
- Registro de origem e licença de **todo** asset (fotografia de referência, gravação, fonte histórica, ator de voz) em banco de dados de produção, auditável antes do lançamento.
- Revisão jurídica dedicada: direito de imagem/voz, propriedade intelectual, distribuição internacional — consultoria externa contratada antes do fim da Fase 3.
- Política de moderação de conteúdo gerado por usuário: não aplicável nesta versão (UGC fora de escopo — ver `07-producao-e-riscos.md`, seção 13); política será redigida apenas se/quando UGC for aprovado para desenvolvimento futuro.
- Painel de revisão histórica e cultural: historiador geral de Segunda Guerra, especialista em Holocausto (com poder de veto sobre conteúdo relacionado), consultor cultural, revisados continuamente da Fase 1 até o lançamento — não apenas em checkpoint único.
