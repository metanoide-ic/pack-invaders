# Roteiro — Cena de Reunião do Protótipo

**Cena:** "A Decisão de Duisburg" · **Local:** Sala de mapas do Gabinete de Guerra (Cabinet War Rooms), Londres · **Data ficcional:** outubro de 1942

**Proveniência:** os bombardeios de área ao Vale do Ruhr em 1942 são documentados; este episódio específico — datas exatas, diálogo, e a decisão em si — é uma **dramatização composta** (`EHistoricalProvenance::PlausibleSpeculation`) construída para exercitar o sistema de decisão do protótipo, não uma reconstituição de um evento único e verificável. Isso deve constar no dossiê in-game sempre que o jogador revisitar esta decisão (regra do GDD: nunca apresentar ficção como fato histórico).

Este documento é a fonte de verdade em prosa; `Data/DialogueNodes_Prototype.json` é a mesma cena estruturada como dado de jogo. Qualquer alteração de texto deve ser replicada nos dois lugares.

---

**ISMAY** *(entra, tom formal mas próximo — décadas de proximidade com o Primeiro-Ministro)*
Primeiro-Ministro, o Comando de Bombardeiros está aguardando sua decisão sobre Duisburg. O General Brooke e Sir Anthony já estão à sua espera na sala de mapas.

> *[Jogador escolhe entrar. Câmera acompanha o personagem do jogador atravessando o corredor do bunker até a sala de mapas — primeira oportunidade de mostrar o ambiente danificado/apertado do Cabinet War Rooms.]*

**BROOKE** *(direto, profissional, aponta para o mapa)*
O alvo é o complexo siderúrgico de Duisburg. Reconhecimento aéreo confirma produção plena. Uma noite clara está prevista para depois de amanhã — é a melhor janela que teremos em semanas.

> *[Jogador pode perguntar sobre baixas civis, sobre a janela climática, ou pular direto para a opinião de Eden — as três rotas convergem, mas mudam o que o jogador sabe antes de decidir.]*

**BROOKE** *(se perguntado sobre civis — tom mais grave, sem suavizar)*
Os bairros operários ficam a menos de um quilômetro da linha de produção. Não há como isolar um do outro nesse tipo de ataque noturno. A estimativa é de centenas de baixas civis, possivelmente mais.

**BROOKE** *(se perguntado sobre a janela — impaciência contida)*
Perdemos a janela e adiamos por no mínimo três semanas — e essa produção continua alimentando a frente russa nesse período.

**EDEN** *(mais cauteloso que Brooke, escolhendo as palavras)*
Se a imprensa sueca noticiar o número de vítimas civis, teremos perguntas incômodas em Washington antes do fim do mês — bem no momento em que precisamos do apoio deles para Overlord. Isso não significa que devamos recusar. Significa que o senhor precisa decidir de olhos abertos.

> *[Ponto de decisão. Cinco opções — nunca reduzidas a "sim/não" — cada uma com efeito imediato e uma consequência que só se manifesta dias depois, fora desta cena:]*

1. **"Autorizo o ataque conforme planejado."** — Brooke assente, satisfeito com a decisão rápida; Eden mantém a expressão neutra. *(Consequência tardia, dia +10: relatos de baixas civis vazam para a imprensa neutra; apoio público e influência diplomática do Reino Unido caem.)*
2. **"Restrinjam o alvo às instalações industriais."** — Brooke hesita, sabendo que reduz a eficácia, mas cumpre. *(Consequência tardia, dia +10: efeito industrial limitado, mas nenhum incidente diplomático.)*
3. **"Não vamos autorizar este ataque."** — Brooke não esconde a frustração; Eden relaxa visivelmente. *(Consequência tardia, dia +7: Brooke registra, em relatório reservado, frustração com a hesitação — perda de confiança real, não expressa abertamente na sala.)*
4. **"Quero um novo reconhecimento aéreo antes de decidir."** — Ambos aceitam, mas trocam um olhar. *(Consequência tardia, dia +5: o reconhecimento confirma o alvo, mas a janela climática já passou — o ataque, quando ocorre, tem eficácia reduzida.)*
5. **"Quero sua avaliação por escrito antes de decidir, Sir Anthony."** — Eden concorda, visivelmente aliviado por ser ouvido. *(Consequência tardia, dia +3: Eden entrega a avaliação — gancho para uma segunda decisão, fora do escopo mínimo deste protótipo, mas registrado como prova de conceito de evento condicional encadeado.)*

**ISMAY** *(fecha a cena, tom de rotina retomando)*
Muito bem, Primeiro-Ministro. Vou transmitir a ordem ao Comando de Bombardeiros.

---

## Notas de direção
- Nenhuma opção deve ser lida pelo jogador como "a certa". Brooke e Eden têm razões válidas e legítimas para suas posições — o desconforto da escolha é o ponto da cena, não um quebra-cabeça com resposta correta.
- A consequência tardia da opção 1 (vazamento de imprensa) não deve ser dramatizada como punição arbitrária: é a mesma lógica de risco que Eden nomeou na cena, apenas paga depois.
- Reservar um asset de "jornal" no ambiente (mesa da secretária, por exemplo) para exibir fisicamente a manchete que materializa a consequência tardia quando ela se manifesta — ligação direta ao pilar "você está na sala": a consequência também deve ser vivida no espaço, não só relatada em texto de sistema.
