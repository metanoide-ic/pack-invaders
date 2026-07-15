# HUMANOCRACY — GDD Volume 3 — Gameplay

O jogo **não é um simulador de documentos**. É um **simulador de tomada de decisão sob
pressão**: o jogador nunca possui todas as informações; toda decisão tem risco; a punição
raramente é imediata; um erro pequeno pode desencadear eventos enormes vinte dias depois
— e o jogador nunca sabe quais decisões realmente importaram.

---

## 3.1 O loop segundo a segundo

```
08:00 — abre o posto
  ↓ recebe COMUNICADO do dia (novas leis, procurados, avisos)
  ↓ fila é gerada (o mundo decide quem viaja hoje — o posto é consequência)
  ↓ NPC chega ao guichê                    [ o tempo NÃO pausa ]
  ↓ documentos deslizam para a mesa
  ↓ jogador pode:  arrastar/organizar documentos
                   MODO INSPEÇÃO: comparar dois elementos quaisquer
                   INTERROGAR (cada pergunta custa 5 min)
                   SCANNER térmico/pulsação (15 min) ou biológico (30 min)
                   aceitar/devolver suborno
  ↓ decisão: APROVAR | REJEITAR | DETER (exige evidência confirmada)
  ↓ carimbo, feedback, próximo da fila
18:00 — fim do expediente → relatório → casa (Volume 5/7)
```

### Tempo é o recurso central

- Relógio corre em tempo real (1s real = 2 min de jogo; turno ≈ 5 min reais).
- Cada verificação profunda custa atendimentos: **quanto mais investiga um caso, menos
  pessoas atende**; menos atendimentos = menos salário = família passa fome; mas menos
  rigor = advertências, multas e Alternados dentro do país.
- Salário: ₴5 por decisão correta. Erros: advertência; da 3ª advertência diária em diante,
  multa de ₴5. Detenção de Alternado confirmado: bônus ₴10.

---

## 3.2 O posto como lugar vivo

O posto não é uma mesa: é uma rotina. Elementos implementados e planejados:

| Elemento | Protótipo | Produção Unity |
|---|---|---|
| Comunicado matinal assinado | ✔ | ✔ + arquivo consultável de comunicados antigos |
| Fila visível com conversas | ✔ (janela com falas) | ✔ simulação completa: brigas, desmaios, vendedores, fura-filas |
| Quedas de energia (colapso) | ✔ (escurecimento) | ✔ + gerador manual, lampião, scanners mortos |
| Rádio durante o expediente | — | ✔ 3 emissoras com linha editorial própria |
| Telefone do posto | — | ✔ ordens, trotes, ameaças, a voz que sabe seu nome |
| Inspeções-surpresa de superiores | — | ✔ auditorias que reagem ao seu histórico |
| Burocracia interna (relatórios 77-B) | — | ✔ formulários que consomem tempo; ignorá-los cobra juros |

## 3.3 A fila é um organismo

A fila observa quem entra, quem sai, quem é preso. Prender uma mãe com bebê muda o humor
da fila; aceitar suborno na frente de todos gera boato ("o agente vende carimbos"); a
reputação pública do inspetor (Volume 7) nasce aqui. No protótipo, o mural da fila troca
falas por dia e regime; na produção, cada pessoa da fila é um NPC completo com paciência,
coragem e desistência simuladas.

---

## 3.4 Inspeção comparativa — o coração mecânico

O jogador ativa o **MODO INSPEÇÃO** e clica em **dois elementos quaisquer**:

- campo de documento × campo de outro documento (nomes, números);
- validade × relógio/data do posto;
- selo/cidade emissora × ficha do país no regulamento;
- foto do documento × rosto no guichê;
- resposta de entrevista × campo de documento (contradição);
- nome × lista de procurados.

Se os dois elementos pertencem a uma discrepância real → **"DISCREPÂNCIA CONFIRMADA"**
(habilita DETER e justifica REJEITAR). Se não → *"nenhuma discrepância entre estes
elementos"* — que **não** prova inocência, apenas esgota aquela hipótese.

### Cadeia de Evidências (produção)

Nenhuma prova isolada determina o veredito. A interface de produção agrega o caso como
um juiz o veria:

```
Documento: aparência íntegra, emitido em guerra (confiabilidade reduzida)
Scanner biológico: POSITIVO — unidade sem calibração há 12 dias
Entrevista: coerente
Bagagem: incompatível com o motivo declarado
Inteligência: relatório de agência conhecida por manipular informações
Comportamento: nervosismo compatível com medo — não conclusivo
```

O jogador constrói mentalmente a cadeia; o jogo nunca soma pontos por ele.

### Linha da Vida (produção)

Com múltiplos documentos abertos, o jogador pode ordenar os eventos da vida da pessoa em
uma linha cronológica: nascimento → escola → empregos → casamento → mudanças → serviço
militar → internações → viagens. A linha **não responde nada** — apenas torna visível o
vazio de oito anos que pode ser um crime, uma guerra, uma infiltração… ou papéis perdidos.

---

## 3.5 Interrogatório

Perguntas custam tempo (5 min cada). Protótipo: motivo, cidade natal, profissão, duração.
Produção: árvore com dezenas (quem espera você? quem assinou este documento? qual era o
nome do hospital? qual comandante?) — cada resposta abrindo novas perguntas.

**Regras de honestidade do sistema:**
- Pessoas nervosas erram mesmo inocentes (hesitação com autocorreção: *"…Meridia. Desculpe,
  é isso. Eu juro."*) — hesitar não é culpa;
- Alternados podem responder perfeitamente (memórias copiadas) ou errar;
- Mentiras humanas têm cem motivos (vergonha, medo, amor, política) — nem toda mentira é
  criminosa, e o jogo diferencia internamente a mentira do crime.

## 3.6 Scanners — ferramentas que mentem um pouco

| Scanner | Custo | O que diz | Como falha |
|---|---|---|---|
| **Térmico** | 15 min | Assimetrias térmicas | Febre, frio, má calibração — mesmo resultado |
| **Pulsação** | 15 min | Estresse/calma | Acusa ansiedade, trauma, autismo, luto; Alternados calmos passam |
| **Detector Biológico (K-7)** | 30 min | Único que gera *evidência formal* | 80% verdadeiro-positivo / 10% falso-positivo calibrado; 50/30 descalibrado (Dia 31+); morto no colapso; calibração só no mercado negro |
| **UV / Ósseo / Químico** | produção | marcas d'água; próteses; resíduos | artefatos, próteses honestas, contaminação cruzada |

**Nota moral de design:** o sistema *premia* detenções por falso positivo do scanner (sem
advertência — o Estado confia na máquina). O contador invisível `inocentesDetidos` cresce.
O jogador só encontra esse número no relatório final. Essa assimetria é intencional: é
assim que máquinas de opressão recrutam pessoas razoáveis.

## 3.6b Exame Físico — o corpo como documento (camada No, I'm Not a Human)

Nova ferramenta (10 min): a pessoa **se aproxima do vidro, perto demais**, e o jogador
inspeciona cinco regiões em close-up — olhos, boca, pele, mãos, pescoço.

### Sinais físicos (tells)

| Sinal | Base humana | Confusor (doente/nervoso) | Bônus real em Alternados |
|---|---|---|---|
| Não pisca | 4% | +2% | **+45%** |
| Olhos injetados | 12% | +18% (choro, insônia) | +15% |
| Dentes perfeitos demais | 8% | +5% | +15% |
| Pele cerosa, sem poros | 7% | +8% | **0% — pura lenda** |
| Dedos longos, sem meia-lua | 6% | +4% | **0% — pura lenda** |
| Pulso lento demais | 4% | +3% | **+40%** |

O jogador **nunca vê esta tabela**. Aprende — errado — pela experiência, pelos boatos e
pelo custo dos próprios enganos. O close-up mostra os sinais visualmente: pálpebras que
piscam em animação (ou não), veias na esclera, dentição gasta ou uniforme demais, pele
com cicatrizes ou lisa como cera.

### O Boato do Dia

A partir do Dia 3, todo comunicado carrega um "sinal" — primeiro como rabisco a lápis na
margem (*"dizem nas filas: eles não piscam"*), depois, sob o Mehrvolk (Dias 14–42), como
**INDICADOR OFICIAL** com classe e número. A mecânica-tese:

- boato **não oficial** + anomalia encontrada = "sem valor legal (ainda)";
- boato **oficial** + anomalia correspondente = **detenção autorizada e premiada, sem
  advertência — mesmo quando o sinal é lenda e a pessoa é inocente**.

O Estado transforma folclore em doutrina, e o jogador em instrumento. O contador
invisível de inocentes detidos não perdoa; o relatório final, menos ainda.

### O tique

Raramente (5% humanos, 18% Alternados), o retrato no guichê sofre um espasmo de meio
segundo — rápido demais para o jogador ter certeza de que viu. Sem som, sem destaque,
sem registro. Não é evidência de nada. É paranoia jogável.

## 3.7 Suborno e corrupção — a escada

Nunca começa explícito: primeiro um café, depois um presente, depois o envelope, depois
favores, depois ameaças, depois chantagem — e então você já mora dentro do esquema.
No protótipo: envelopes discretos (aceitar/devolver), a oferta do Sargento Dmarov (Dia 5)
que cobra o retorno no Dia 6, e risco acumulado de auditoria (`auditRisk`) que pode
terminar em prisão. Na produção, subornos incluem remédios, combustível, proteção,
tratamentos, informações e empregos para a família — cada um calibrado para chegar
exatamente quando a família do jogador mais precisa (Volume 5).

## 3.8 Decisões e vereditos

| Situação real | APROVAR | REJEITAR | DETER |
|---|---|---|---|
| Documentos em ordem, humano | ✔ correto | ✖ advertência | ✖ advertência (sem evidência) |
| Documentos em ordem, **Alternado** | "correto" pelo regulamento (ele entra; o mundo lembra) | ✖ advertência — e você nunca saberá que acertou | só com biológico positivo |
| Irregularidade real | ✖ advertência | ✔ correto | ✔ se evidência confirmada |
| Procurado do dia | ✖ | ✖ ("deveria ser detido") | ✔ |
| Dia 47+ | sempre "correto" | — botão não existe — | — |

O jogo nunca revela no ato se um aprovado era Alternado. A dúvida viaja com ele.

## 3.9 O sistema "Você tem certeza?"

Rarissimamente (2–3 vezes na campanha), após uma aprovação, o jogo simplesmente… espera.
A pessoa sai. A câmera fica na porta. Dois segundos de silêncio. Nada acontece. Nenhum
som novo. E então a fila anda. Esse vazio deve custar quase nada de produção e valer mais
que qualquer jumpscare.
