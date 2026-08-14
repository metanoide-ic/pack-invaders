# 3. Definição do Vertical Slice

**Duração:** 30–45 minutos jogáveis, qualidade próxima da final.

**Líder:** Winston Churchill, ambientado em outubro de 1942 (véspera de El Alamein) — escolhido para o slice por ser o caso de menor risco jurídico/sensibilidade (comparado a Hitler) e por concentrar bem os pilares (decisão moral, moral pública, guerra multi-frente, diplomacia) em um recorte curto.

**Ambiente:** Gabinete de Guerra subterrâneo (Cabinet War Rooms), Downing Street, mapa estratégico do Mediterrâneo/Atlântico Norte.

**Conteúdo obrigatório do slice:**
1. Exploração 3D completa de 2 ambientes interligados (sala de mapas subterrânea + escritório).
2. Duas reuniões com elenco distinto (Gabinete de Guerra — 3 NPCs; reunião de inteligência — 2 NPCs), somando os 5 NPCs importantes exigidos.
3. Um pronunciamento (rádio, BBC) com escolha de tom/conteúdo que afeta moral pública imediatamente.
4. Uma crise militar em tempo real narrativo (relatório contraditório sobre reforços no Norte da África — jogador precisa decidir com informação incompleta).
5. Uma decisão moral pesada (autorizar ou recusar um bombardeio de área sobre um centro industrial com população civil próxima) com consequência visível no ambiente (jornal, reação de um NPC) e consequência tardia sinalizada (efeito prometido para "semanas depois", registrado no dossiê, mesmo que o slice termine antes).
6. Mapa estratégico simplificado, navegável, mostrando frentes, com pelo menos uma ordem delegável a um comandante.
7. Dois encerramentos possíveis do slice, ramificados pela decisão do bombardeio e pelo tom do pronunciamento.
8. Áudio, interface e animações representativos do padrão de qualidade final (não placeholder).

## 4. Loop Principal

```
┌─────────────────────────────────────────────────────────────────┐
│  1. INÍCIO DE EXPEDIENTE                                         │
│     Assistente pessoal apresenta agenda do dia/semana            │
│     (reuniões, relatórios pendentes, crises, prazos de resposta) │
└───────────────────────────┬───────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. EXPLORAÇÃO DO AMBIENTE DE COMANDO                            │
│     Jogador caminha, escolhe que compromissos atender e em que  │
│     ordem (ignorar um item tem custo — não há pausa "de graça")  │
└───────────────────────────┬───────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. REUNIÃO / DIÁLOGO                                            │
│     NPC apresenta informação (verdadeira, incompleta ou          │
│     manipulada, conforme sua lealdade/competência/medo)          │
│     Jogador responde: aprovar / recusar / adiar / pedir mais     │
│     informação / alterar / consultar outro / executar em         │
│     segredo / delegar / mentir publicamente / contradizer ordem  │
└───────────────────────────┬───────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. DOCUMENTO (se aplicável)                                     │
│     Assinar, recusar, modificar cláusula, adiar assinatura       │
└───────────────────────────┬───────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. MAPA ESTRATÉGICO (acesso a qualquer momento do expediente)  │
│     Frentes, produção, logística, ciência, diplomacia            │
│     Ordens são delegadas a comandantes/ministros com             │
│     personalidade — não movimento unitário direto                │
└───────────────────────────┬───────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. REAÇÃO DE MUNDO                                              │
│     IAs de outros países e NPCs internos processam a decisão;    │
│     indicadores mudam; personagens atualizam memória             │
└───────────────────────────┬───────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. CONSEQUÊNCIA IMEDIATA + REGISTRO DE CONSEQUÊNCIA TARDIA      │
│     Efeito visível agora; efeito futuro agendado no sistema de   │
│     eventos (pode disparar dias, semanas ou meses depois)        │
└───────────────────────────┬───────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. AVANÇO DE TEMPO                                               │
│     Dia/semana avança; nova agenda é gerada combinando eventos   │
│     agendados + eventos condicionais + rotina                    │
└───────────────────────────┬───────────────────────────────────────┘
                            └──────────────► volta ao passo 1
```

O loop **nunca força** o jogador a atender tudo: agenda ignorada gera consequência própria (ministro se sente desprezado, informação chega tarde, crise piora sem supervisão), tratada como escolha implícita, não como falha de sistema.
