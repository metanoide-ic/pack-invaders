# HUMANOCRACY — GDD Volume 4 — Documentos

**Filosofia:** documentos não existem para conferir datas. Eles contam histórias. Nenhum
documento existe isoladamente — todos conversam entre si, e o conjunto forma uma narrativa.
Se a história faz sentido, talvez a pessoa esteja dizendo a verdade. Ou talvez seja uma
mentira extremamente bem construída.

**A grande regra:** quanto mais documentos existem, mais difícil fica mentir — mas também
mais difícil fica descobrir a verdade, porque documentos verdadeiros também entram em
conflito entre si.

---

## 4.1 Documentos do protótipo (implementados)

| Documento | Quem porta | Campos | Regra que o exige |
|---|---|---|---|
| **Passaporte** | todos | nome, nascimento, sexo, país, cidade emissora, nº, validade, selo nacional, foto, (selo de revalidação ★ sob o Conselho) | Dia 1+ |
| **Cartão de Identidade** | osterianos | nome, nascimento, distrito, nº (= passaporte) | Dia 2+ |
| **Permissão de Entrada** | estrangeiros | nome, nº do passaporte, motivo, validade, selo de Osteria | Dia 3+ |
| **Permissão de Trabalho** | motivo "trabalho" | nome, função, validade | Dia 4+ |
| **Carteira Sanitária** | variável (a lei flip-flopa: dias 8–10 todos; 18–23 estrangeiros; 24–30 todos; 31–36 substituída pelo scanner; 37–42 todos de novo) | nome, vacinas, validade | ver Volume 6 |
| **Certificado de Ancestralidade** | núlios e bahari sob Mehrvolk | nome, linhagem, carimbo ❖ | Dias 14–29 |
| **Cartão de Refúgio** | refugiados | nome, origem, convenção ALCORTE-9 | protege mesmo cidadãos de países banidos (Dias 20–26) |

## 4.2 Catálogo completo de produção (100+ tipos)

**Civis:** passaporte, identidade, registro nacional, título eleitoral, carteira de
motorista, licença profissional, registro de residência, comprovante de endereço,
histórico escolar, diploma, certidões (nascimento, casamento, divórcio, adoção, guarda,
mudança de nome, naturalização, óbito de familiares), registro de imigração.

**Médicos:** carteira de vacinação, prontuário, receitas, exames laboratoriais,
radiografias, laudos psicológicos, exames genéticos, declarações de incapacidade,
autorizações médicas.

**Militares:** alistamento, reservista, ordens de missão, transferências, promoções,
licenças, registro disciplinar, permissões especiais.

**Empresariais:** contrato de trabalho, holerite, registro de funcionário, histórico
salarial, viagens corporativas, autorizações industriais.

**Educacionais:** histórico, diplomas, cartão universitário, bolsas, intercâmbio.

**Judiciais:** mandados, alvarás, sentenças, liberdade condicional, certidões negativas.

**Internacionais:** vistos, salvo-condutos diplomáticos, cartas consulares, missões
humanitárias, permissões da Convenção de Alcorte, acordos militares.

**Religiosos:** autorizações missionárias, cartas paroquiais, registros de peregrinação,
casamentos religiosos, ordens monásticas.

Cada documento carrega além dos dados: modelo/ano de emissão, tipo de papel, gramatura,
método de impressão, órgão emissor, assinatura do servidor, carimbos, código interno,
elementos de segurança e **desgaste natural** (dobras, manchas, marcas de bolso, café).
Um documento antigo em estado perfeito pode ser falso — ou apenas bem cuidado.

## 4.3 Materiais como linguagem

- **Papel:** barato, premium, reciclado, militar (Krestov: gramatura tripla), impermeável,
  envelhecido, de emergência. Durante o colapso, a qualidade oficial degrada — e um papel
  bom demais vira suspeito.
- **Tinta:** cor, reflexo UV, oxidação, desbotamento. Fórmulas descontinuadas datam
  documentos com precisão que nenhum carimbo tem.
- **Impressão:** offset, matriz, datilografia, manuscrito. Cada método deixa marcas.
- **Caligrafia e assinaturas:** cada repartição tem padrões; cada servidor, assinatura
  única. O jogador desenvolve memória real ("já vi essa assinatura") — às vezes correta,
  às vezes não. Uma falsificação pode copiar a assinatura e errar o estilo do cartório.
- **Carimbos:** mudam com governos e crises. Carimbo improvisado ≠ fraude (o comunicado
  avisa; o jogador esquece; o design conta com isso).

## 4.4 Níveis de falsificação

| Nível | Descrição | Detecção |
|---|---|---|
| **Amadora** | datas erradas, foto mal colada, erro ortográfico | inspeção básica |
| **Profissional** | quase perfeita | cruzamento de 3+ fontes |
| **Estatal** | um governo falsificou oficialmente | praticamente indetectável — e politicamente radioativa |
| **Documento real, pessoa errada** | legítimo, roubado/comprado | só biometria ou entrevista |
| **Reaproveitado** | foto trocada, dados raspados, nova laminação | UV, tato, sorte |

Discrepâncias implementadas no protótipo: `expired`, `nameMismatch`, `numberMismatch`,
`wrongSeal`, `invalidCity`, `photoMismatch`, `sexMismatch`, `contradiction` (entrevista),
mais violações de regra (documento ausente, país banido, sem revalidação ★, sem
certificado de ancestralidade). A IA adaptativa dos Alternados pondera sobre essa lista
(Volume 2).

## 4.5 Biometria — nada é perfeito

Digitais (apagadas, queimadas, parciais), retina (doenças, cirurgias), voz (gripes,
imitação), estrutura óssea (próteses honestas confundem), DNA (confiável — e demora dias:
o resultado raramente chega durante o atendimento; quando chega, o cidadão já foi embora).

## 4.6 Bagagem e objetos pessoais (produção)

Objetos contam histórias, não apenas escondem contrabando: aliança gasta, relógio militar,
fotografia rasgada, urso de pelúcia, carta de amor, remédio vencido, bilhete de trem só de
ida. **Caso-modelo:** mulher diz visitar a mãe doente; na mala, roupas masculinas,
brinquedos, contrato de aluguel, ferramentas, passagem só de ida. Está mentindo — ou
fugindo do marido. O jogo sabe qual das duas (Estado Verdadeiro). O jogador, não.

Cartas e diários revelam personalidade, conflitos, saudades — e também mentem, porque
pessoas mentem até para os próprios diários.
