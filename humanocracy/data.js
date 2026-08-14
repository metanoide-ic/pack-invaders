/* ============================================================
   HUMANOCRACY — data.js
   Mundo, países, etnias, leis, notícias, encontros e finais.
   A verdade existe. Você só nunca terá acesso completo a ela.
   ============================================================ */

const MOEDA = '₴'; // Ostra, moeda de Osteria

/* ---------- PAÍSES ---------- */
const COUNTRIES = {
  osteria: {
    name: 'Osteria', adj: 'osteriano(a)', prefix: 'OS', seal: '✦', color: '#3d5a46',
    cities: ['Valgrado', 'Porto Cinza', 'Ostra Velha', 'Miralta', 'Delvina'],
    ethnics: ['osano', 'nulio', 'mestico'],
    m: ['Tomas', 'Viktor', 'Ansel', 'Rubem', 'Casimiro', 'Edvin', 'Bruno', 'Leontin'],
    f: ['Mara', 'Odila', 'Vessa', 'Irena', 'Clarice', 'Talia', 'Sofie', 'Beatra'],
    last: ['Verne', 'Ostrik', 'Malden', 'Corvac', 'Ferro', 'Almedra', 'Vintra', 'Solmak'],
  },
  krestov: {
    name: 'Krestov', adj: 'krestoviano(a)', prefix: 'KR', seal: '▲', color: '#4a3f52',
    cities: ['Zoldani', 'Fortemuro', 'Krest', 'Varga'],
    ethnics: ['osano', 'nulio'],
    m: ['Dmar', 'Volkan', 'Serge', 'Ilya', 'Radek', 'Bogdan'],
    f: ['Vanda', 'Ludmila', 'Zora', 'Katya', 'Mirala', 'Olenka'],
    last: ['Dmarov', 'Kreskin', 'Voldan', 'Zubrek', 'Marzek', 'Tolvai'],
  },
  lantravia: {
    name: 'Lantravia', adj: 'lantraviano(a)', prefix: 'LA', seal: '❖', color: '#5a2f2a',
    cities: ['Hertzberg', 'Adlerstadt', 'Weissmar', 'Lindau'],
    ethnics: ['osano'],
    m: ['Adler', 'Konrad', 'Wilhem', 'Gustav', 'Erich', 'Falk'],
    f: ['Greta', 'Ilse', 'Annelise', 'Frida', 'Marlene', 'Helva'],
    last: ['Hertz', 'Adlerman', 'Weiss', 'Krone', 'Falkenrath', 'Brandt'],
  },
  frimia: {
    name: 'Frimia', adj: 'frimiano(a)', prefix: 'FR', seal: '◉', color: '#2f4a5a',
    cities: ['Meridia', 'Cais Novo', 'Alvorada', 'Trinca'],
    ethnics: ['osano', 'nulio', 'bahari', 'mestico', 'cantalo'],
    m: ['Milo', 'Sadi', 'Oren', 'Talvo', 'Ciro', 'Janek'],
    f: ['Nadia', 'Selma', 'Ivona', 'Rosa', 'Amina', 'Petra'],
    last: ['Meridian', 'Cassol', 'Duran', 'Okim', 'Trestani', 'Baruk'],
  },
  kranton: {
    name: 'Kranton', adj: 'krantonês(esa)', prefix: 'KN', seal: '✚', color: '#4a4a2f',
    cities: ['Dupla Ponte', 'Krantesk', 'Limiar', 'Vau Seco'],
    ethnics: ['nulio', 'mestico', 'osano'],
    m: ['Havel', 'Miron', 'Zdenk', 'Pavo', 'Luter', 'Ossip'],
    f: ['Danka', 'Vesna', 'Halina', 'Mirena', 'Zlata', 'Ruta'],
    last: ['Krantic', 'Vaumor', 'Limiar', 'Dvorak', 'Ponte', 'Hraben'],
  },
  novarepublica: {
    name: 'Nova República', adj: 'novorepublicano(a)', prefix: 'NR', seal: '◈', color: '#2f5a52',
    cities: ['Cidade Um', 'Meridiano', 'Farol', 'Vetor'],
    ethnics: ['mestico', 'osano', 'cantalo'],
    m: ['Neo', 'Caio', 'Dario', 'Ivo', 'Lucan', 'Remo'],
    f: ['Lia', 'Vera', 'Naia', 'Cora', 'Iris', 'Duna'],
    last: ['Vetor', 'Meridian', 'Farol', 'Novak', 'Prisma', 'Central'],
  },
  taranstan: {
    name: 'Taranstan', adj: 'taranstanês(esa)', prefix: 'TA', seal: '★', color: '#5a1f1a',
    cities: ['Tarangrad', 'Usina 9', 'Coletiva Norte', 'Planalto Vermelho'],
    ethnics: ['tarano', 'nulio'],
    m: ['Ulan', 'Temir', 'Borz', 'Kazim', 'Sarn', 'Oktai'],
    f: ['Aiza', 'Tamila', 'Gulnar', 'Sabina', 'Roza', 'Dinara'],
    last: ['Ulanov', 'Temirov', 'Borzek', 'Kazimir', 'Sarnov', 'Oktaev'],
  },
  linestan: {
    name: 'Linestan', adj: 'linestanês(esa)', prefix: 'LI', seal: '⬢', color: '#3a3a5a',
    cities: ['Bolsa Alta', 'Sorenfeld', 'Cume Prata', 'Ledger'],
    ethnics: ['osano', 'cantalo'],
    m: ['Sorenn', 'Aksel', 'Nils', 'Halvar', 'Edgar', 'Lorenz'],
    f: ['Astrid', 'Solveig', 'Inga', 'Maren', 'Sigrid', 'Elsa'],
    last: ['Sorenfeld', 'Ledger', 'Prata', 'Aksun', 'Nordal', 'Halvorsen'],
  },
  baharzad: {
    name: 'Bahar-Zad', adj: 'bahari', prefix: 'BZ', seal: '☽', color: '#5a4a1f',
    cities: ['Zad-o-Bahar', 'Poço das Vozes', 'Mirzapur', 'Caravana Velha'],
    ethnics: ['bahari'],
    m: ['Farid', 'Zarin', 'Kaveh', 'Rostam', 'Bahman', 'Dariush'],
    f: ['Soraya', 'Yasmin', 'Parisa', 'Roshan', 'Anahid', 'Laleh'],
    last: ['Zadeh', 'Mirzai', 'Bahari', 'Kavehpur', 'Roshani', 'Anvari'],
  },
  cantalabria: {
    name: 'Cantalabria', adj: 'cantálabro(a)', prefix: 'CA', seal: '⚜', color: '#2a4a2a',
    cities: ['Alcorte', 'Vila Serena', 'Monte Claro', 'Baía dos Tratados'],
    ethnics: ['cantalo', 'osano'],
    m: ['Alonso', 'Emiliano', 'Rafel', 'Duarte', 'Silvio', 'Marcel'],
    f: ['Beatriz', 'Camila', 'Leonor', 'Silvina', 'Adela', 'Rosaura'],
    last: ['Alcorte', 'Serena', 'Duarte', 'Montclar', 'Tratado', 'Vilaverde'],
  },
};
const COUNTRY_IDS = Object.keys(COUNTRIES);

/* ---------- LAYOUT DA CARTA DE FRONTEIRAS (espaço lógico 100x100) ----------
   Osteria no centro-leste (o Posto 7 fica na sua borda leste). Os vizinhos
   em volta, agrupados pela "vibe" da lore (nórdicos ao norte, persa a
   sudeste, etc.). r = raio da mancha do país. */
const MAP_LAYOUT = {
  linestan:      { x: 19, y: 18, r: 10.5 },
  krestov:       { x: 43, y: 13, r: 12 },
  taranstan:     { x: 73, y: 17, r: 13 },
  lantravia:     { x: 15, y: 45, r: 11.5 },
  osteria:       { x: 46, y: 47, r: 14 },
  kranton:       { x: 75, y: 45, r: 11 },
  cantalabria:   { x: 19, y: 76, r: 11.5 },
  frimia:        { x: 47, y: 79, r: 12 },
  novarepublica: { x: 71, y: 75, r: 11 },
  baharzad:      { x: 89, y: 68, r: 11 },
};

const ETHNIC_LABEL = {
  osano: 'Osana', nulio: 'Núlia', mestico: 'Mista',
  bahari: 'Bahari', tarano: 'Tarana', cantalo: 'Cantala',
};

/* ---------- PROFISSÕES E MOTIVOS ---------- */
const PROFESSIONS = ['professor(a)', 'engenheiro(a)', 'médico(a)', 'operário(a)', 'comerciante',
  'enfermeiro(a)', 'agricultor(a)', 'músico(a)', 'contador(a)', 'soldado', 'costureiro(a)',
  'ferroviário(a)', 'pesquisador(a)', 'padeiro(a)', 'jornalista', 'estudante', 'mecânico(a)'];

const PURPOSES = [
  { id: 'visita',    label: 'Visita familiar', dur: ['3 dias', '1 semana', '2 semanas'] },
  { id: 'trabalho',  label: 'Trabalho',        dur: ['1 mês', '6 meses', '1 ano'] },
  { id: 'transito',  label: 'Trânsito',        dur: ['1 dia', '2 dias'] },
  { id: 'imigracao', label: 'Imigração',       dur: ['permanente'] },
  { id: 'tratamento',label: 'Tratamento médico', dur: ['1 semana', '1 mês'] },
  { id: 'estudo',    label: 'Estudo',          dur: ['6 meses', '1 ano'] },
];

/* ---------- REGRAS (leis mudam, somem, voltam, se contradizem) ---------- */
const RULES = {
  pass:            { text: 'Todo viajante deve portar PASSAPORTE válido.' },
  idOsteria:       { text: 'Cidadãos de Osteria devem portar CARTÃO DE IDENTIDADE.' },
  entryPermit:     { text: 'Estrangeiros devem portar PERMISSÃO DE ENTRADA.' },
  workPermit:      { text: 'Viajantes a trabalho devem portar PERMISSÃO DE TRABALHO.' },
  healthAll:       { text: 'TODOS devem portar CARTEIRA SANITÁRIA (Decreto 44-C).' },
  healthForeign:   { text: 'ESTRANGEIROS devem portar CARTEIRA SANITÁRIA.' },
  ancestry:        { text: 'Pessoas de origem NÚLIA ou BAHARI devem portar CERTIFICADO DE ANCESTRALIDADE (Édito de Pureza nº 2).' },
  banKrestov:      { text: 'ENTRADA PROIBIDA a cidadãos de KRESTOV (incidente diplomático).' },
  banLantravia:    { text: 'ENTRADA PROIBIDA a cidadãos de LANTRAVIA (inimigos do povo).' },
  banTaranstan:    { text: 'ENTRADA PROIBIDA a cidadãos de TARANSTAN (agitadores comunistas).' },
  seloConselho:    { text: 'Documentos emitidos ANTES do Conselho exigem SELO DE REVALIDAÇÃO (procure o carimbo ★ no passaporte).' },
  ticketLinestan:  { text: 'Cidadãos de LINESTAN devem apresentar BILHETE DE ENTRADA numerado (acordo comercial 9-B).' },
  transitFrimia:   { text: 'Cidadãos de FRIMIA devem portar VISTO DE TRÂNSITO carimbado (só de passagem — não podem fixar residência).' },
  inocBaharzad:    { text: 'Cidadãos de BAHAR-ZAD devem portar CERTIFICADO DE INOCULAÇÃO (surto na Rota das Caravanas).' },
  minorPapers:     { text: 'Todo MENOR acompanhante deve constar em REGISTRO DE MENOR carimbado. Sem registro, o menor não passa.' },
  refugeeProtect:  { text: 'Convenção de Alcorte: REFUGIADOS com Cartão de Refúgio devem ser protegidos e admitidos.' },
  detainWanted:    { text: 'PROCURADOS listados no comunicado devem ser DETIDOS.' },
  scanBioAll:      { text: 'O DETECTOR BIOLÓGICO substitui a carteira sanitária. Escaneie todos os suspeitos.' },
  approveAll:      { text: 'DIRETRIZ FINAL: não há mais normas. O posto deve permanecer aberto.' },
};

/* ---------- ARCO DOS REGIMES ---------- */
function regimeOfDay(d) {
  if (d <= 11) return 'republica';
  if (d <= 29) return 'mehrvolk';
  if (d <= 42) return 'conselho';
  if (d <= 47) return 'colapso';
  return 'colapso';
}
const REGIME_LABEL = {
  republica: 'REPÚBLICA DE OSTERIA',
  mehrvolk: 'ESTADO NACIONAL MEHRVOLK',
  conselho: 'CONSELHO POPULAR DE OSTERIA',
  colapso: '— AUTORIDADE DESCONHECIDA —',
};
const MASTHEAD = {
  republica: 'A VOZ DE OSTERIA',
  mehrvolk: 'O CLARIM DA PUREZA',
  conselho: 'O TRABALHADOR UNIDO',
  colapso: 'FOLHA AVULSA',
};

/* ---------- REGRAS POR DIA (o flip-flop legal é intencional) ---------- */
function rulesForDay(d) {
  const r = ['pass'];
  if (d >= 2) r.push('idOsteria');
  if (d >= 3) r.push('entryPermit');
  if (d >= 4) r.push('workPermit');
  if (d >= 5) r.push('detainWanted');
  if (d >= 8 && d <= 10) r.push('healthAll');
  if (d >= 18 && d <= 23) r.push('healthForeign');
  if (d >= 24 && d <= 30) r.push('healthAll');
  if (d >= 31 && d <= 36) r.push('scanBioAll');
  if (d >= 37 && d <= 42) r.push('healthAll');
  if (d >= 6 && d <= 9) r.push('banKrestov');
  // exigências específicas por país (ticket/visto/inoculação) — Papers Please style
  if (d >= 4 && d <= 17) r.push('ticketLinestan');
  if (d >= 10 && d <= 24) r.push('transitFrimia');
  if (d >= 24 && d <= 38) r.push('inocBaharzad');
  if (d >= 16 && d <= 40) r.push('minorPapers'); // burocracia que separa famílias
  if (d >= 14 && d <= 29) { r.push('ancestry'); r.push('banTaranstan'); }
  if (d >= 30 && d <= 42) { r.push('banLantravia'); r.push('seloConselho'); }
  if (d >= 20 && d <= 26) r.push('refugeeProtect'); // contradiz banTaranstan de propósito
  if (d >= 43 && d <= 46) return ['pass', 'detainWanted']; // colapso: quase nada vale
  if (d >= 47) return ['approveAll'];
  return r;
}

/* ---------- NOTÍCIAS ---------- */
const SCRIPTED_NEWS = {
  1: { h: 'FRONTEIRA LESTE REABRE APÓS SEIS MESES', b: 'O Ministério de Triagem anuncia a reabertura do Posto Nº 7 após o recesso de inverno. O ministro Calder Voss pede "serenidade e rigor" aos novos inspetores. A crise energética dá sinais de trégua. Filas são esperadas.', m: ['Time de Valgrado vence por 2 a 1.', 'Preço do pão sobe 4%.', 'Horóscopo: um estranho lhe dirá a verdade. Ou não.'] },
  3: { h: 'MULHER DETIDA EM MIRALTA "NÃO ERA QUEM DIZIA SER"', b: 'Vizinhos afirmam que a costureira Odila Vintra "voltou diferente" de uma viagem. Exames foram inconclusivos. A polícia nega que o caso envolva Alternados. A família da detida afirma que ela apenas "andava cansada".', m: ['Cientistas de Nova República pedem calma: "falsos positivos são comuns".', 'Rádio clandestina multada.'] },
  5: { h: 'LINESTAN LANÇA O SCANNER "VERITAS-9"', b: 'A LumenCorp de Linestan promete "99,2% de precisão" na detecção de Alternados. Especialistas independentes questionam a metodologia. As ações da empresa subiram 34% em um dia. O Ministério estuda a compra de unidades.', m: ['Greve dos ferroviários termina.', 'Publicidade: VERITAS-9 — proteja sua família.'] },
  7: { h: 'CHANCELER ALDRIC VOSS É ASSASSINADO', b: 'O chanceler foi morto a tiros na escadaria do Parlamento. Não há consenso sobre a autoria: a polícia culpa a resistência; a resistência culpa o governo; panfletos culpam os Alternados; Cantalabria sugere "interferência externa". O país entra em luto — e em pânico.', m: ['Bolsa despenca 18%.', 'Mehrvolk convoca comício: "Ordem, Segurança, Pureza".'] },
  9: { h: 'MULTIDÕES NAS RUAS: "QUEM NOS PROTEGE?"', b: 'Após o assassinato, comícios do movimento Mehrvolk reúnem dezenas de milhares. O orador prometeu "eliminar a infiltração em doze meses". Cientistas alertam que as estatísticas citadas no palco não existem em nenhum estudo publicado.', m: ['Toque de recolher em Delvina.', 'Farmácias racionam sedativos.'] },
  12: { h: 'MEHRVOLK ASSUME O GOVERNO DE OSTERIA', b: 'Com apoio de parte do exército e do Parlamento em pânico, o movimento Mehrvolk assumiu o poder na madrugada. Primeiro decreto: "A verdade agora tem um só nome." Jornais de oposição amanheceram fechados. Este jornal foi renomeado por ordem administrativa.', m: ['Novos uniformes distribuídos aos postos.', 'Hino atualizado. Decorar até sexta.'] },
  14: { h: 'ÉDITO DE PUREZA Nº 2 ENTRA EM VIGOR', b: 'Cidadãos de origem núlia e bahari deverão portar Certificado de Ancestralidade. O Instituto Lantraviano de Fenotipia afirma que "certas linhagens apresentam 12% mais incidência de substituição". O estudo não foi revisado por pares. Hospitais registram filas de pessoas tentando provar quem são.', m: ['Denúncias anônimas dobram.', 'Criança de 9 anos denuncia o próprio professor.'] },
  17: { h: 'DEZ DETIDOS EM OPERAÇÃO "SANGUE LIMPO"', b: 'O governo comemora a captura de "dez infiltrados". Documentos vazados sugerem que ao menos sete eram humanos com exames alterados. O Ministério nega. As famílias não foram informadas do paradeiro dos detidos.', m: ['Escolas adotam cartilha "Conheça seu vizinho".', 'Racionamento de carvão.'] },
  18: { h: 'CARTILHA DE SINAIS FÍSICOS CHEGA ÀS ESCOLAS', b: 'O Instituto de Higiene distribuiu a doze mil salas de aula a cartilha "Olhe as Mãos de Quem Te Abraça". As crianças aprendem sete sinais; o sétimo é "a pessoa demora a responder quando você a chama pelo nome". Pediatras alertam que crianças tímidas passaram a ser levadas a exame. O Ministério responde que "cuidado nunca é excesso".', m: ['Estoque de espelhos esgota em Valgrado.', 'Professora afastada por "não olhar nos olhos da turma".'] },
  21: { h: 'JORNALISTA DESAPARECE APÓS REPORTAGEM', b: 'Vela Odim, autora da série "Os Falsos Positivos", está desaparecida há três dias. O governo afirma que ela "viajou por vontade própria". Colegas afirmam que sua casa foi revirada. A LumenCorp negou comentar os erros do VERITAS-9 citados na reportagem.', m: ['Cartazes novos: "Quem cala, protege."', 'Pão racionado: 1 unidade por família.'] },
  23: { h: 'FILA DE REVALIDAÇÃO PASSA A NOITE NA CALÇADA', b: 'O prazo do Édito de Pureza vence sexta e os cartórios atendem duzentas pessoas por dia. Uma senhora de setenta e um anos está na fila desde terça para provar que nasceu onde nasceu. "Eu tenho a certidão", ela diz. "Eles querem a certidão da certidão."', m: ['Cobertores vendidos a preço triplo perto do cartório.', 'Dois mortos de frio na fila do bloco 9.'] },
  24: { h: 'CIENTISTAS CONTESTAM A FENOTIPIA — E SÃO PRESOS', b: 'Quatorze pesquisadores assinaram carta afirmando que "nenhuma característica física define um Alternado". Foram detidos por "sabotagem epistemológica". Universidades entram em greve. O governo responde: "A ciência do inimigo também é inimiga."', m: ['Fila do posto leste bate recorde.', 'Inverno chega mais cedo.'] },
  27: { h: 'EXPLOSÃO NA ESTAÇÃO CENTRAL: 31 MORTOS', b: 'Um atentado destruiu a Estação Central de Valgrado. O governo culpa a resistência. A resistência culpa "agentes do próprio regime". Um sobrevivente jura que viu o autor "sorrir com a boca errada". Ninguém sabe o que isso significa. Ninguém pergunta duas vezes.', m: ['Luto oficial de três dias.', 'Trens suspensos.'] },
  29: { h: 'LEI DE HIGIENE MORAL CRIA O "REGISTRO DE CONDUTA"', b: 'O decreto obriga mulheres solteiras em trânsito de fronteira a portar atestado de conduta compatível, assinado pela delegacia do domicílio. Não há dispositivo equivalente para homens. Um jurista do próprio regime perguntou, em memorando interno, o que exatamente se está medindo. Foi transferido.', m: ['Hotéis da estrada obrigados a manter livro de hóspedes visível.', 'Delegado de Miralta condecorado.'] },
  30: { h: 'GOLPE: CONSELHO POPULAR TOMA O PODER', b: 'Unidades do exército derrubaram o governo Mehrvolk durante a madrugada. O Conselho Popular declara que "os Alternados são uma invenção do capital para disciplinar trabalhadores". Os laboratórios estatais, entretanto, seguem funcionando — agora sob nova bandeira. Todos os documentos antigos exigem revalidação.', m: ['Estátuas derrubadas antes do café.', 'Novo hino. Decorar até sexta.'] },
  33: { h: 'EX-AGENTES DO REGIME VIRAM "ELEMENTOS INDESEJÁVEIS"', b: 'Funcionários do governo anterior tentam deixar o país em massa. O Conselho promete julgamentos populares. Nas filas, ninguém mais sabe qual carimbo é o certo — e o Conselho também não. Um inspetor foi preso por aplicar a lei da semana passada.', m: ['Açúcar desaparece dos mercados.', 'Boato: "Alternados não suportam açúcar." Falso. Talvez.'] },
  35: { h: 'CONSELHO ANUNCIA O "CADASTRO ÚNICO DO POVO"', b: 'Todos os arquivos dos dois regimes anteriores serão unificados numa só ficha por cidadão. O Conselho garante que "nada do que o regime anterior anotou será usado contra os trabalhadores" — e não explica por que, então, nada foi queimado. As fichas antigas chegaram em caminhões, aos milhares, intactas.', m: ['Papel racionado: cadastro tem prioridade.', 'Arquivo Nacional contrata 400 escreventes.'] },
  41: { h: 'TRÊS POSTOS DE FRONTEIRA DEIXAM DE RESPONDER', b: 'Os postos 3, 11 e 12 não enviam relatório há quatro dias. O Conselho fala em "dificuldade de comunicação". Um motorista que passou pelo 11 diz que o guichê estava aberto, a luz acesa e o café ainda morno — e nenhum inspetor. A fila do lado de fora continuava organizada, em silêncio, esperando.', m: ['Rádio estatal reduz transmissão para 6h por dia.', 'Combustível racionado nas estradas do leste.'] },
  37: { h: 'O SCANNER OFICIAL ERA DEFEITUOSO, ADMITE MINISTÉRIO', b: 'Após seis dias de triagem obrigatória por detector biológico, o Conselho admite que 40% das unidades estavam descalibradas. Volta a valer a carteira sanitária — a mesma que o decreto anterior chamou de "papel inútil". As pessoas na fila riem. Depois choram.', m: ['LumenCorp transfere sede para Linestan.', 'Apagões programados: 4h por dia.'] },
  39: { h: 'O ÉDITO DE PUREZA NUNCA EXISTIU NO PAPEL', b: 'Um funcionário do arquivo central, fugindo do país, deixou uma pasta para trás: não há registro de votação, sessão ou assinatura para o Édito de Pureza nº 2. O "Instituto Lantraviano de Fenotipia" tinha um único funcionário — o mesmo que redigiu o decreto. Milhares de certificados de ancestralidade foram emitidos, negados e cobrados com base em um estudo que nunca existiu, para uma lei que nunca foi votada. Os postos de fronteira seguem exigindo o documento. Ninguém revogou nada. Ninguém sabe mais quem poderia.', m: ['O funcionário fugitivo não foi encontrado.', 'Cartórios seguem emitindo certificados. Ninguém explica com base em quê.'] },
  40: { h: 'FRONTEIRAS DO NORTE CAÍRAM. NINGUÉM GOVERNA LÁ.', b: 'Refugiados de Kranton e Krestov relatam cidades sem polícia, sem energia e sem notícias. "Não fugimos deles", disse uma mulher, "fugimos de nós mesmos". O Conselho não comenta. O Conselho não é encontrado para comentar.', m: ['Hospitais lotados.', 'A rádio estatal transmite estática entre 14h e 16h.'] },
  43: { h: 'ONDE ESTÁ O GOVERNO?', b: 'Ministérios vazios. Telefones mudos. O último comunicado oficial tem cinco dias. Este jornal é impresso por voluntários. Não sabemos se seremos impressos amanhã. O posto de triagem leste segue aberto — ninguém mandou fechar. Talvez ninguém exista para mandar.', m: ['Feira improvisada na Praça do Sal.', 'Alguém pintou na muralha: "ELES JÁ ESTÃO AQUI." Outro completou: "SEMPRE ESTIVERAM."'] },
  45: { h: 'COMUNIDADE DO VALE AFIRMA "CONVIVER" COM ALTERNADOS', b: 'Um povoado nas montanhas garante viver em paz com "os outros" há anos. "Eles consertam nossas cercas. Nós não perguntamos o nome antigo deles." Impossível verificar. Impossível não pensar nisso a noite inteira.', m: ['Sem previsão do tempo. O instrumento quebrou.', 'Procura-se: qualquer notícia de Vela Odim.'] },
  46: { h: 'ELES NÃO ERRAM MAIS', b: 'Inspetores de três postos relatam o mesmo: os documentos falsos ficaram perfeitos. As entrevistas, perfeitas. Os exames, inconclusivos. "É como se tivessem aprendido conosco tudo o que sabemos", disse um agente. "Ou como se nunca tivesse havido diferença."', m: ['Última linha de trem desativada.', 'O horóscopo pede desculpas e não faz previsões hoje.'] },
  47: null, // o jornal não chega
  48: null,
};

const FILLER_NEWS = [
  { h: 'RACIONAMENTO DE ENERGIA AMPLIADO', b: 'O fornecimento elétrico será interrompido em bairros alternados — a escolha de palavras do Ministério foi considerada "infeliz". Reclamações devem ser protocoladas em formulário 77-B, disponível apenas online.' },
  { h: 'FILA DO POSTO LESTE DOBRA EM UMA SEMANA', b: 'Migrantes relatam esperas de até três dias. Vendedores ambulantes lucram. Um homem afirma ter visto "a mesma mulher entrar na fila duas vezes, ao mesmo tempo". Testemunhas se contradizem.' },
  { h: 'NOVO ESTUDO CONTRADIZ ESTUDO ANTERIOR', b: 'Pesquisadores de Nova República afirmam que o marcador celular K-7, tido como prova de substituição, também aparece em pacientes com febre reumática. O laboratório que criou o teste chamou o estudo de "sabotagem comercial".' },
  { h: 'TARANSTAN NEGA EXISTÊNCIA DE ALTERNADOS', b: 'Em discurso de quatro horas, o Secretário-Geral afirmou que "o único parasita é o capital". Desertores relatam, entretanto, laboratórios subterrâneos na Usina 9. Taranstan chamou os desertores de "atores contratados".' },
  { h: 'BAHAR-ZAD REABRE ARQUIVO DE MANUSCRITOS', b: 'Textos de setecentos anos descrevem "os que vestem rostos". Historiadores debatem se são profecia, coincidência ou má tradução. Peregrinos lotam o Poço das Vozes.' },
  { h: 'CANTALABRIA OFERECE MEDIAÇÃO — DE NOVO', b: 'A diplomacia cantálabra propôs a quinta conferência do ano. Vazamentos sugerem que Alcorte "sabe mais do que divulga". Alcorte respondeu com um sorriso e um comunicado de duas linhas.' },
  { h: 'MERCADO NEGRO VENDE "VACINA ANTI-ALTERNADO"', b: 'Frascos apreendidos continham água, açúcar e corante. Três mortos por injeção contaminada. A demanda, entretanto, triplicou após a apreensão.' },
  { h: 'CRIANÇA PERGUNTA EM REDE NACIONAL: "COMO SEI QUE MAMÃE É MAMÃE?"', b: 'O apresentador não soube responder. O programa foi cortado para o hino. O trecho circula em fitas clandestinas.' },
];

const ADS = [
  'VERITAS-9 — porque sua família merece a verdade. (LumenCorp)',
  'Café Fronteira — aberto mesmo durante apagões.',
  'Formulário 77-B: agora com apenas 9 páginas!',
  'Aulas de caligrafia oficial. Assine como um patriota.',
  'Compra-se ouro, relógios e memórias de família. Beco do Sal, 3.',
  'Perdeu seus documentos? A fila do Cartório começa às 4h.',
  'Espelhos usados pela metade do preço. Não perguntamos por que você não quer mais o seu.',
  'Repintamos o retrato da sua família enquanto você espera. Fica igualzinho. Igualzinho.',
  'Curso noturno: reconheça a própria letra em três lições. Certificado oficial.',
  'Aluga-se quarto sem janelas. "Mais seguro assim", diz o senhorio, sorrindo.',
];

/* ---------- COMUNICADOS (bulletins) ---------- */
const SCRIPTED_BULLETIN = {
  1: 'Inspetor: bem-vindo ao Posto Nº 7.\n\nHoje: verifique apenas se o PASSAPORTE é válido (não expirado) e pertence ao portador (foto e sexo).\n\nUse o botão INSPEÇÃO e clique em DOIS elementos para compará-los (ex.: validade × relógio; foto × rosto).\n\nErros geram advertência. Advertências geram multas. Multas geram fome.',
  5: 'ATENÇÃO: a partir de hoje, PROCURADOS listados aqui devem ser DETIDOS (botão DETER, disponível após confirmar discrepância ou identificar o procurado).\n\nPROCURADO HOJE: ver lista no regulamento.',
  12: 'NOVA ADMINISTRAÇÃO.\n\nO Estado Nacional Mehrvolk assume os postos de fronteira. Uniformes serão trocados. O inspetor que servia à República agora serve à Pureza.\n\nQuem não servir, será substituído. A palavra "substituído" não é uma metáfora. Ou é. Não pergunte.',
  14: 'ÉDITO DE PUREZA Nº 2.\n\nViajantes de origem NÚLIA ou BAHARI devem portar CERTIFICADO DE ANCESTRALIDADE.\n\nNota do Instituto de Fenotipia: "traços do rosto podem indicar linhagem". Nota manuscrita de alguém no verso: "isso não é ciência".',
  30: 'O CONSELHO POPULAR SAÚDA OS TRABALHADORES DA FRONTEIRA.\n\nTodos os decretos do regime anterior estão REVOGADOS. Documentos antigos exigem SELO DE REVALIDAÇÃO (★).\n\nOs "Alternados" são propaganda burguesa. Entretanto, continue reportando avistamentos ao Departamento 12, que não existe.',
  43: 'COMUNICADO SEM TIMBRE.\n\nNão recebemos ordens há dias. O telefone está mudo. Aplique o bom senso.\n\nO que quer que isso signifique agora.',
  47: 'Não há comunicado.\n\nHá apenas uma folha em branco com um carimbo: APROVAR.\n\nO botão REJEITAR não está mais na sua mesa. Você não lembra de alguém tê-lo levado.',
  48: 'Último dia de registro no seu contrato.\n\nAssine o formulário de desligamento. Se ainda houver alguém para recebê-lo.',
};

/* ---------- PROCURADOS (dias com detainWanted) ---------- */
const WANTED_DAYS = { 5: true, 8: true, 11: true, 16: true, 19: true, 22: true, 26: true, 29: true, 34: true, 39: true, 44: true };

/* ---------- SUSSURROS (paranoia) ---------- */
const WHISPERS = [
  'aquela assinatura… você já viu antes. não viu?',
  'ele piscou os dois olhos ao mesmo tempo. todo mundo pisca assim. certo?',
  'o relógio atrasou dois minutos. ou você que adiantou.',
  'quantas pessoas você aprovou ontem? tem certeza do número?',
  'sua esposa mexeu no seu carimbo. por quê?',
  'o café de hoje tinha o mesmo gosto de sempre. exatamente o mesmo.',
  'a foto 3×4 sorriu. não. não sorriu.',
  'você trancou a porta ao sair de casa. você sempre tranca. sempre?',
];

/* ---------- ENCONTROS SCRIPTADOS (personagens recorrentes) ---------- */
/* Cada encontro define um cidadão especial injetado na fila do dia. */
const ENCOUNTERS = {
  2: {
    id: 'elara1', nome: 'Elara Venn', pais: 'kranton', sexo: 'f', etnia: 'nulio',
    profissao: 'professora', motivo: 'visita', valid: true,
    fala: 'Vou cuidar da minha mãe em Kranton. Ela piorou no inverno. Volto em duas semanas, prometo. Digo… não que eu precise prometer nada ao senhor.',
    nota: null,
  },
  3: {
    id: 'bruno1', nome: 'Bruno Almedra', pais: 'osteria', sexo: 'm', etnia: 'osano',
    profissao: 'comerciante', motivo: 'transito', valid: true,
    fala: 'Essas caixas? Sabonete. Só sabonete importado. Por que pergunta com essa cara, inspetor? Eu tenho uma cara que faz as pessoas perguntarem, é isso, não é? Já ouvi isso antes.',
  },
  4: {
    id: 'ivona1', nome: 'Ivona Duran', pais: 'frimia', sexo: 'f', etnia: 'mestico',
    profissao: 'costureira', motivo: 'visita', valid: true,
    fala: 'Meu marido morreu na estrada, tentando atravessar sem os papéis certos. Eu vim buscar o corpo com os papéis certos. A ironia não escapou a ninguém na minha família, inspetor. Só a ele.',
  },
  5: {
    id: 'dmarov', nome: 'Sgt. Radek Dmarov', pais: 'osteria', sexo: 'm', etnia: 'osano',
    profissao: 'soldado', motivo: 'transito', valid: true,
    fala: 'Inspetor. Meu primo passa por aqui amanhã. Volkan Zubrek, de Krestov. Os papéis dele estão… quase em ordem. Feche um olho e a metade do que ele paga é sua. Pense com calma. Eu volto sempre.',
    nota: { texto: 'AMANHÃ: Volkan Zubrek. Aprove. — R.D.', tipo: 'suborno_oferta' },
  },
  6: {
    id: 'zubrek', nome: 'Volkan Zubrek', pais: 'krestov', sexo: 'm', etnia: 'osano',
    profissao: 'comerciante', motivo: 'trabalho', valid: false, forcedDisc: 'expired',
    fala: 'O sargento falou com você, não falou? Está tudo… combinado.',
    briberia: 25,
  },
  8: {
    id: 'marek1', nome: 'Joss Marek', pais: 'osteria', sexo: 'm', etnia: 'mestico',
    profissao: 'barbeiro', motivo: 'transito', valid: true,
    fala: 'Corto o cabelo de metade desta fila, sabia? A gente ouve coisas. Por exemplo: que o senhor tem um filho doente. E que gente como nós vai precisar de gente como o senhor. Guarde meu nome.',
    nota: { texto: 'Quando precisar de remédio de verdade, procure o barbeiro. — J.M.', tipo: 'resistencia_contato' },
  },
  9: {
    id: 'elara2', nome: 'Elara Venn', pais: 'kranton', sexo: 'f', etnia: 'nulio',
    profissao: 'professora', motivo: 'trabalho', valid: false, forcedDisc: 'expired',
    fala: 'Fui demitida enquanto cuidava da minha mãe. A escola diz que "meu perfil não serve mais". Minha permissão venceu ANTEONTEM, eu sei, eu sei — mas se eu voltar agora perco o apartamento e perco… tudo. Por favor. São dois dias.',
  },
  10: {
    id: 'bruno2', nome: 'Bruno Almedra', pais: 'osteria', sexo: 'm', etnia: 'osano',
    profissao: 'comerciante', motivo: 'transito', valid: false, forcedDisc: 'expired',
    fala: 'Um dia, inspetor! UM dia! O carimbo diz dia 9, hoje é dia 10, isso é o quê, quatro por cento de atraso? Eu aceito multa. Eu aceito qualquer coisa. Só não me manda de volta pra explicar as caixas de novo.',
  },
  11: {
    id: 'iris1', nome: 'Iris Vetor', pais: 'novarepublica', sexo: 'f', etnia: 'cantalo',
    profissao: 'pesquisadora', motivo: 'trabalho', valid: true,
    fala: 'Na Nova República os formulários são digitais e ninguém lê o que a gente escreve mesmo assim. Aqui, pelo menos, o senhor lê. Isso deveria ser reconfortante. Por algum motivo, não é.',
  },
  13: {
    id: 'pavo1', nome: 'Pavo Krantic', pais: 'kranton', sexo: 'm', etnia: 'mestico',
    profissao: 'estudante', motivo: 'estudo', valid: true,
    fala: 'Meu tio mora do outro lado. Eu nunca conheci ele. Minha mãe disse: mostra os papéis, fica quieto, não conta pra ninguém que é a primeira vez que eu viajo sozinho. Ela não sabia que eu ia contar pro senhor.',
  },
  14: {
    id: 'irenac1', nome: 'Irena Corvac', pais: 'osteria', sexo: 'f', etnia: 'nulio',
    profissao: 'contadora', motivo: 'transito', valid: false, forcedMissing: 'ancest',
    fala: 'O comunicado saiu ontem à noite, inspetor. O cartório abre daqui a três horas. Eu trabalho como contadora há dezoito anos nesta cidade. Ontem eu era osteriana. Hoje sou um formulário que ainda não existe.',
  },
  15: {
    id: 'marek2', nome: 'Joss Marek', pais: 'osteria', sexo: 'm', etnia: 'mestico',
    profissao: 'barbeiro', motivo: 'transito', valid: true,
    fala: 'Amanhã passa por aqui uma "prima" minha. Nadia Baruk, de Frimia. Os papéis dela têm um defeito de fábrica, digamos. Ela carrega remédios para um hospital clandestino. Aprove, e o remédio do seu filho aparece na sua porta. Recuse, e… bom, cada um vive com o que escolhe.',
    nota: { texto: 'AMANHÃ: Nadia Baruk. O remédio existe. A escolha é sua. — J.M.', tipo: 'resistencia_pedido' },
  },
  16: {
    id: 'courier', nome: 'Nadia Baruk', pais: 'frimia', sexo: 'f', etnia: 'mestico',
    profissao: 'enfermeira', motivo: 'transito', valid: false, forcedDisc: 'wrongSeal',
    fala: 'O barbeiro mandou lembranças.',
    resistencia: true,
  },
  17: {
    id: 'mirena1', nome: 'Mirena Dvorak', pais: 'kranton', sexo: 'f', etnia: 'nulio',
    profissao: 'enfermeira', motivo: 'transito', valid: true,
    fala: 'Levaram meu marido terça-feira. "Sangue Limpo", chamam a operação. Ele vendia pão, inspetor. Eu só quero saber se ele está vivo. O senhor tem acesso a essas listas. Eu vi alguém como o senhor consultando uma, uma vez.',
  },
  18: {
    id: 'elara3', nome: 'Elara Venn', pais: 'kranton', sexo: 'f', etnia: 'nulio',
    profissao: 'professora', motivo: 'visita', valid: false, forcedMissing: 'sanitaria',
    fala: 'Estou grávida. O pai ficou do outro lado. Eu só quero atravessar antes que… antes que inventem mais um papel que eu não tenho. Não tenho a carteira sanitária. O posto médico da minha cidade FECHOU. Como eu apresento um papel de um lugar que não existe mais?',
  },
  20: {
    id: 'sabina1', nome: 'Sabina Borzek', pais: 'taranstan', sexo: 'f', etnia: 'tarano',
    profissao: 'operária', motivo: 'imigracao', valid: true,
    fala: 'Na coletiva, quem pergunta demais vira exemplo pros outros. Eu perguntei uma vez de menos e uma vez demais, nessa ordem errada. Aqui eu só quero ser ninguém por um tempo.',
  },
  21: {
    id: 'odim', nome: 'Vela Odim', pais: 'osteria', sexo: 'f', etnia: 'osano',
    profissao: 'jornalista', motivo: 'transito', valid: true,
    fala: 'Estou escrevendo sobre os postos de triagem. Sobre quantos "positivos" eram só gente doente, nervosa ou azarada. Uma pergunta, inspetor, sem caneta na mão: o senhor já teve certeza de alguma coisa aqui dentro? Uma única vez?',
  },
  22: {
    id: 'yasmin1', nome: 'Yasmin Kavehpur', pais: 'baharzad', sexo: 'f', etnia: 'bahari',
    profissao: 'enfermeira', motivo: 'imigracao', valid: true,
    fala: 'A Convenção de Alcorte diz que eu tenho direito a atravessar. O senhor também acredita nisso, ou só carimba nisso?',
  },
  23: {
    id: 'nils1', nome: 'Nils Aksun', pais: 'linestan', sexo: 'm', etnia: 'osano',
    profissao: 'engenheiro', motivo: 'trabalho', valid: true,
    fala: 'Eu ajudei a calibrar esse scanner que o senhor usa. Marcador K-7. Sabe o que eu descobri, inspetor? Ele detecta ansiedade. Só isso. Eu me demiti. Ninguém me perguntou por quê. Ninguém pergunta essas coisas.',
  },
  24: {
    id: 'elara4', nome: 'Elara Venn', pais: 'kranton', sexo: 'f', etnia: 'nulio',
    profissao: 'costureira', motivo: 'imigracao', valid: false, forcedDisc: 'nameMismatch',
    fala: 'O senhor de novo. Que sorte a minha. — Ela não sorri mais. — Está tudo em ordem dessa vez. Tudo. Pode olhar o quanto quiser.',
  },
  25: {
    id: 'casimiro1', nome: 'Casimiro Ferro', pais: 'osteria', sexo: 'm', etnia: 'osano',
    profissao: 'pesquisador', motivo: 'imigracao', valid: false, forcedDisc: 'nameMismatch',
    fala: 'Catorze dos meus colegas assinaram aquela carta. Eu não assinei. Vim atravessar mesmo assim, com o passaporte do Andrei — ele não vai precisar mais. Chame isso do que quiser. Eu chamo de covardia com pressa.',
  },
  26: {
    id: 'halvar1', nome: 'Halvar Nordal', pais: 'linestan', sexo: 'm', etnia: 'osano',
    profissao: 'contador', motivo: 'trabalho', valid: true, briberia: 35,
    fala: 'Cem moedas, inspetor. Não é suborno, é… taxa de conveniência. Meu banco quebrou terça-feira. O dinheiro que sobrou é literalmente a única coisa real que ainda tenho. Aceite antes que eu perceba isso também.',
  },
  28: {
    id: 'clarice1', nome: 'Clarice Malden', pais: 'osteria', sexo: 'f', etnia: 'osano',
    profissao: 'musicista', motivo: 'visita', valid: true,
    fala: 'Meu irmão trabalhava na Estação Central. Trinta e um mortos, disseram. Não disseram nomes. Eu vim ver se o nome dele está numa lista em algum lugar. O senhor tem listas. Todo mundo aqui tem listas.',
  },
  31: {
    id: 'ossip1', nome: 'Ossip Hraben', pais: 'kranton', sexo: 'm', etnia: 'mestico',
    profissao: 'operário', motivo: 'trabalho', valid: true,
    fala: 'O senhor… mora no Bloco 14, não mora? Nós dividimos o apartamento agora. Minha esposa disse que a sua não fala com a gente. Eu entendo. Eu também não falaria. Só vim pedir a permissão de trabalho. Preciso alimentar minha família — a que veio comigo, e imagino que a sua também.',
  },
  32: {
    id: 'edvin1', nome: 'Edvin Solmak', pais: 'osteria', sexo: 'm', etnia: 'osano',
    profissao: 'contador', motivo: 'trabalho', valid: true,
    fala: 'O regime anterior mentia com carimbos bonitos. O Conselho pelo menos mente honestamente: em papel reciclado, com tinta ruim. Isso é progresso, inspetor. Anote isso. Anote que eu disse isso.',
  },
  33: {
    id: 'dmarov2', nome: 'Radek Dmarov', pais: 'osteria', sexo: 'm', etnia: 'osano',
    profissao: 'desempregado', motivo: 'imigracao', valid: false, forcedDisc: 'numberMismatch',
    fala: 'Sem farda fica difícil me reconhecer, é? O Conselho está prendendo todo mundo que serviu antes. TODO MUNDO. Você inclusive está na lista, mais cedo ou mais tarde. Me deixa passar e eu esqueço seu nome quando perguntarem.',
  },
  34: {
    id: 'okim1', nome: 'Talvo Okim', pais: 'frimia', sexo: 'm', etnia: 'osano',
    profissao: 'desempregado', motivo: 'transito', valid: true,
    fala: 'Eu sei o nome da sua esposa. Sei o nome do seu filho, o mais novo. Não é ameaça, inspetor — é currículo. Alguém me paga pra saber esse tipo de coisa sobre gente como o senhor. Achei educado avisar.',
    nota: { texto: 'Um nome e um endereço — os seus. Sem assinatura.', tipo: 'vigiado' },
  },
  35: {
    id: 'gravadora1', nome: 'Sela Kroft', pais: 'osteria', sexo: 'f', etnia: 'mestico',
    profissao: 'gravadora', motivo: 'trabalho', valid: false, forcedDisc: 'wrongSeal',
    fala: 'Sou gravadora, inspetor. Carimbos, moldes, chapas — trabalho fino. Esse selo aqui saiu das minhas próprias mãos, e olhe a ironia: nem eu consigo fazer o meu sair perfeito. Ninguém consegue duas vezes seguidas. É por isso que gente como eu ainda tem trabalho.',
    nota: { texto: 'Se um selo não bater, pode ser mão amiga, não inimiga. — S.K.', tipo: 'resistencia_contato' },
    resistencia: true,
  },
  36: {
    id: 'okim2', nome: 'Talvo Okim', pais: 'frimia', sexo: 'm', etnia: 'osano',
    profissao: 'desempregado', motivo: 'transito', valid: true,
    fala: 'Voltei. Não por mim — me mandaram. Queriam saber se o senhor guardou aquele papel ou queimou. Eu disse que não sabia. Foi a única mentira que contei essa semana, o que já é uma boa semana pra mim.',
  },
  38: {
    id: 'mercador', nome: 'Sorenn Ledger', pais: 'linestan', sexo: 'm', etnia: 'osano',
    profissao: 'comerciante', motivo: 'trabalho', valid: true,
    fala: 'Seu detector biológico está descalibrado há semanas — eu vendo o serviço de calibração. 40 ostras e ele volta a funcionar de verdade. Barato, considerando o preço de um erro. A LumenCorp me odeia, o que é sempre bom sinal.',
    vendeCalibracao: 40,
  },
  40: {
    id: 'miron1', nome: 'Miron Dvorak', pais: 'kranton', sexo: 'm', etnia: 'nulio',
    profissao: 'ferroviário', motivo: 'imigracao', valid: true,
    fala: 'Minha irmã disse que um inspetor foi decente com ela, uma vez. Não sei se foi o senhor. Ela também não tinha certeza — disse que os rostos daqui começaram a se confundir pra ela. De qualquer forma: se um dia precisar atravessar sem fila, existe uma rota pelo norte agora que não tem mais fronteira nenhuma vigiando. Ninguém governa lá. É a coisa mais parecida com liberdade que sobrou.',
    nota: { texto: 'Rota do norte: sem posto, sem guarda, sem mapa depois daqui. — M.D.', tipo: 'resistencia_norte' },
  },
  41: {
    id: 'elara5', nome: 'Elara Venn', pais: 'kranton', sexo: 'f', etnia: 'nulio',
    profissao: 'professora', motivo: 'imigracao', valid: true, scannerAmbiguo: true,
    fala: '…O bebê nasceu. Está com a minha irmã. Eu atravesso hoje ou não atravesso nunca. — Ela olha para você como quem decora um rosto. — Engraçado. Não lembro mais se o senhor sempre foi assim. Mais velho. Diferente. A gente muda, não é? Todo mundo muda.',
  },
  43: {
    id: 'leontin1', nome: 'Leontin Corvac', pais: 'osteria', sexo: 'm', etnia: 'osano',
    profissao: 'ex-inspetor de fronteira', motivo: 'imigracao', valid: true,
    fala: 'Posto Nº 4, sabe onde fica? Fechou semana passada. Levaram o meu antecessor primeiro, depois o Ministério, depois a fila toda de gente que ele tinha aprovado "rápido demais". Eu era bom no meu trabalho, inspetor. Isso não significou nada no fim.',
  },
  44: {
    id: 'esposa', nome: 'Vessa (sua esposa)', pais: 'osteria', sexo: 'f', etnia: 'osano',
    profissao: 'arquivista', motivo: 'transito', valid: true, memoria: true,
    fala: 'Você me disse ONTEM para atravessar hoje. Na cozinha. Você segurou minhas mãos e disse "vá antes de mim, eu encontro vocês". — Você não disse isso. Você tem certeza de que não disse isso. — Por que está me olhando assim?',
  },
  46: {
    id: 'talia1', nome: 'Talia Malden', pais: 'osteria', sexo: 'f', etnia: 'osano',
    profissao: 'agricultora', motivo: 'visita', valid: true,
    fala: 'No Vale a gente parou de perguntar. Alternado, humano, o que for — planta a mesma terra, cava o mesmo poço. Funciona. Não sei se é coragem ou cansaço. Ninguém no Vale sabe também. E olha, ainda estamos todos vivos, o que é mais do que muita gente sensata pode dizer.',
  },
  47: {
    id: 'lembranca', nome: 'Havel Krantic', pais: 'kranton', sexo: 'm', etnia: 'nulio',
    profissao: 'ferroviário', motivo: 'imigracao', valid: true, memoria: true,
    fala: 'Nós já conversamos, há duas semanas. O senhor usava uma caneca azul lascada na borda. Reclamou do frio e carimbou meu passaporte duas vezes sem querer. — Você nunca viu este homem. A caneca azul está na sua mesa. Lascada na borda.',
  },
};


/* ============================================================
   OS ROSTOS QUE VOLTAM — personagens especiais
   ------------------------------------------------------------
   Um posto de fronteira não é um desfile de estranhos: é uma
   estrada, e quem vive de estrada passa de novo. Estes seis têm
   aparência própria (look sobrescreve o retrato procedural),
   voltam em dias marcados e mudam junto com o regime — o mesmo
   rosto sob quatro governos é a melhor forma de mostrar o que
   cada governo faz com um rosto.

   Eles ocupam uma FAIXA PARALELA à dos ENCOUNTERS: um dia pode
   ter os dois. `dias` mapeia dia → aparição.
     valid ......... papéis em ordem
     forcedDisc .... discrepância obrigatória (ver DISC_TYPES)
     fala .......... o que ele diz ao chegar ao vidro
     nota .......... papel que fica com você depois
     killer ........ se não for detido, você morre
     req ........... só aparece se a flag existir no estado
   ============================================================ */
const SPECIALS = {
  /* ---- NADJA VELL — a mulher da estrada ----
     Trabalha as duas margens da fronteira porque a fronteira é onde
     há dinheiro e caminhão. Cada regime inventa uma palavra nova para
     ela; nenhum inventa uma para os homens da fila. */
  nadja: {
    nome: 'Nadja Vell', pais: 'kranton', sexo: 'f', etnia: 'nulio', profissao: 'costureira',
    look: {
      skin: 5, hair: 6, hairStyle: 1, eyes: 3, mouth: 1, brow: 1, faceW: 1,
      glasses: false, earring: true, hat: 0, beard: 0, idade: 31, rugas: false,
      build: 0, height: 0.25, girth: 0.05,
      coat: '#5a2f3a', scarf: '#a86a44', batom: true, kohl: true, fseed: 811324,
    },
    dias: {
      12: { motivo: 'trabalho', valid: true,
            fala: 'Costureira, está escrito aí. Eu costuro, sim — de madrugada, no quarto dos fundos do Hotel Vlask, e o que eu costuro é a minha própria roupa depois. O senhor quer que eu escreva isso no formulário? Cabe?' },
      21: { motivo: 'trabalho', valid: true,
            fala: 'Hoje o guarda do outro lado quis metade. Metade de quê, eu perguntei. Ele riu. É sempre metade de alguma coisa, com vocês. Com o senhor ainda não foi. Anota aí que eu reparei.' },
      29: { motivo: 'trabalho', valid: false, forcedDisc: 'expired',
            fala: 'Venceu ontem. Eu sei. Eu ia renovar, mas a Lei de Higiene Moral agora pede atestado de conduta compatível — e quem assina o atestado é o delegado que me para na estrada toda terça. O senhor entende o desenho.',
            nota: { texto: 'Se um dia precisarem de um quarto sem registro, Hotel Vlask, porta 4. — N.V.', tipo: 'resistencia_contato' } },
      37: { motivo: 'transito', valid: true,
            fala: 'Cortaram meu cabelo na delegacia. Disseram que era higiene. Foi só pra eu ser reconhecida na rua, e funciona: hoje ninguém me olha na cara. É quase um descanso. Quase.',
            look: { hair: 0, hairStyle: 0, batom: false, earring: false, coat: '#33302a', scarf: null } },
      44: { motivo: 'imigracao', valid: false, forcedDisc: 'wrongSeal',
            fala: 'Não tenho o papel. Não vou ter. Estão levando as mulheres do Vlask desde quinta e ninguém volta pra contar pra onde. O senhor pode carimbar ou pode não carimbar — mas o senhor sabe o que tem atrás de mim.',
            look: { hair: 0, hairStyle: 0, batom: false, earring: false, coat: '#33302a', scarf: null, rugas: true } },
    },
  },

  /* ---- FERRO — o que fala verdade e ninguém acredita ----
     Cabo da Guerra dos Doze Dias, dependente do éter de campanha que o
     próprio exército distribuía. Delira. E acerta. */
  ferro: {
    nome: 'Anselmo Krast', pais: 'osteria', sexo: 'm', etnia: 'osano', profissao: 'operário(a)',
    look: {
      skin: 0, hair: 4, hairStyle: 2, eyes: 0, mouth: 2, brow: 0, faceW: 0,
      glasses: false, hat: 0, beard: 2, idade: 44, rugas: true,
      build: 0, height: -0.15, girth: 0, coat: '#403428', scarf: null,
      suado: true, olheiras: true, feridas: true, fseed: 20941,
    },
    dias: {
      16: { motivo: 'transito', valid: true,
            fala: 'Eu vi. Na estação. Um homem com a cara certinha demais e a mão fria — apertou a minha mão e a mão dele não tinha temperatura, entende? NÃO TINHA. Escreve aí. Escreve aí que o Ferro avisou, e a data.' },
      23: { motivo: 'transito', valid: true,
            fala: 'Eles não piscam. Todo mundo pisca. Você pisca, eu pisco — eu pisco até demais. Eles não. Anota: p-i-s-c-a-r. Vão te mandar um papel dizendo isso daqui a um mês, e vão dizer que descobriram sozinhos.' },
      31: { motivo: 'trabalho', valid: false, forcedDisc: 'photoMismatch',
            fala: 'A foto? Essa foto é de antes. Eu era outro. Não do jeito que eles trocam, não — do jeito normal, do jeito que a gente vira outro sozinho. O senhor também está virando. Já reparou na sua letra ultimamente?' },
      38: { motivo: 'transito', valid: true,
            fala: 'Dia 27 eu falei da estação. Falei ANTES. Ninguém escreveu. Agora tem placa de bronze lá com nome de trinta e quatro pessoas e não tem uma linha dizendo que o Ferro falou. Tudo bem. Não é o meu nome que eu queria salvar.' },
      46: { motivo: 'imigracao', valid: true,
            fala: 'Acabou o éter. Faz nove dias. E olha que coisa: sóbrio é pior. Sóbrio eu vejo que tudo que eu dizia era verdade e que eu era o único jeito que a verdade tinha de aparecer aqui — bêbado, na boca de um louco, pra ninguém precisar acreditar.',
            look: { suado: false, feridas: false, olheiras: true } },
    },
  },

  /* ---- PADRE OSTROV — o homem sem prédio ----
     A igreja fecha em três etapas: primeiro tiram o sino, depois o
     telhado, depois o nome. Ele fica. */
  ostrov: {
    nome: 'Emil Ostrov', pais: 'osteria', sexo: 'm', etnia: 'osano', profissao: 'professor(a)',
    look: {
      skin: 1, hair: 7, hairStyle: 2, eyes: 4, mouth: 0, brow: 1, faceW: 1,
      glasses: true, hat: 0, beard: 0, idade: 67, rugas: true,
      build: 0, height: 0.05, girth: 0.1, coat: '#1c1c20', colarinho: true, fseed: 55127,
    },
    dias: {
      20: { motivo: 'visita', valid: true,
            fala: 'Vou enterrar um homem em Kranton. A profissão no papel diz professor porque o cartório novo não tem mais a palavra padre na lista. Eu ensino, é verdade. Ensino as pessoas a morrer. Sempre foi uma matéria mal avaliada.' },
      28: { motivo: 'transito', valid: false, forcedDisc: 'contradiction',
            fala: 'Escrevi trânsito porque não sabia o que escrever. Tiraram o sino na terça. Um sino de mil e oitocentos quilos, e o caminhão que veio buscar tinha um formulário em duas vias. Eu assinei as duas. Que mais eu ia fazer, inspetor? Recusar o papel?' },
      40: { motivo: 'imigracao', valid: true,
            fala: 'Levo os livros de batismo. É a única coisa que sobrou e é a coisa certa: são nomes com data, e vão precisar disso depois — quando alguém perguntar quem existia aqui. Se um dia alguém perguntar. Reze para que alguém pergunte.',
            look: { rugas: true, girth: 0 } },
    },
  },

  /* ---- SIBILA MAREK — a voz que foi proibida antes da pessoa ----
     Irmã do barbeiro Joss Marek. Cantava nos rádios dos três países. */
  sibila: {
    nome: 'Sibila Marek', pais: 'osteria', sexo: 'f', etnia: 'mestico', profissao: 'comerciante',
    look: {
      skin: 1, hair: 0, hairStyle: 3, eyes: 0, mouth: 1, brow: 1, faceW: 1,
      glasses: false, earring: true, hat: 2, beard: 0, idade: 38, rugas: false,
      build: 1, height: 0.1, girth: 0.15, coat: '#4a2f52', scarf: '#9a7a38',
      batom: true, fseed: 39018,
    },
    dias: {
      25: { motivo: 'trabalho', valid: true,
            fala: 'Meu irmão corta cabelo, eu canto. Os dois ofícios são a mesma coisa: a pessoa senta, fecha os olhos e conta tudo. A diferença é que ninguém nunca prendeu um barbeiro por causa do refrão.' },
      33: { motivo: 'trabalho', valid: false, forcedDisc: 'nameMismatch',
            fala: 'O nome no papel novo está errado de propósito. Sibila Marek está numa lista de repertório incompatível — três canções, inspetor, e uma delas é sobre chuva. O cartório sugeriu que eu passasse a ser Sibila Marec, com c. Aceitei. Uma letra pela vida inteira é barato.',
            look: { hat: 0, coat: '#38332e', scarf: null } },
      42: { motivo: 'imigracao', valid: true,
            fala: 'Ontem cantei num porão para nove pessoas e um deles chorou de um jeito que me assustou: sem barulho e sem mexer o rosto. Perguntei se estava tudo bem. Ele disse que estava aprendendo a chorar. Foi assim que ele disse, inspetor. Aprendendo.',
            look: { hat: 0, coat: '#38332e', scarf: null, rugas: true, batom: false } },
    },
  },

  /* ---- AUREL VANTZ — o censor ----
     O único homem da fila que já leu tudo que você escreveu. Educado. */
  vantz: {
    nome: 'Aurel Vantz', pais: 'osteria', sexo: 'm', etnia: 'osano', profissao: 'burocrata',
    look: {
      skin: 0, hair: 0, hairStyle: 0, eyes: 3, mouth: 0, brow: 0, faceW: 1,
      glasses: true, hat: 0, beard: 0, idade: 49, rugas: false,
      build: 1, height: 0, girth: 0.2, uniformSet: 'osteria', fseed: 70233,
    },
    dias: {
      17: { motivo: 'trabalho', valid: true,
            fala: 'Bom dia. Não precisa se apressar por minha causa — eu, de todos, sei quanto tempo leva fazer isto direito. Trinta e um segundos foi a sua média na semana passada. É um bom número. Bons números chamam atenção, inspetor, nos dois sentidos.' },
      26: { motivo: 'trabalho', valid: true,
            fala: 'Reparei que o senhor rejeitou o senhor Almedra e depois hesitou. A hesitação também consta: existe um campo para ela no meu formulário. Não se preocupe — hesitar não é crime. É só um dado.' },
      35: { motivo: 'trabalho', valid: true,
            fala: 'Mudei de departamento. Antes eu lia o que o senhor escrevia; agora leio o que escrevem SOBRE o senhor. É um material mais curto e muito menos interessante. Diga: o senhor dorme bem?',
            look: { uniformSet: 'lantravia' } },
      43: { motivo: 'imigracao', valid: false, forcedDisc: 'expired',
            fala: 'Sim. Eu. Com a permissão vencida. Percebe a piada? Eu redigi este formulário. Escrevi a linha que agora me impede de passar, numa terça-feira, com café frio, sem pensar num rosto sequer. Carimbe o que o senhor achar justo, inspetor. Eu venho ensinando o senhor a não achar nada.',
            look: { uniformSet: null, coat: '#2e2a24', rugas: true } },
    },
  },

  /* ---- O CONTADOR — o que vem cobrar ----
     Não está no roteiro do Ministério nem no de ninguém. Aparece três
     dias depois de um turno em que DOIS Alternados atravessaram o seu
     guichê. Vem conferir a conta. Se não for detido, ele a fecha. */
  contador: {
    nome: 'Ruven Sath', pais: 'linestan', sexo: 'm', etnia: 'osano', profissao: 'burocrata',
    req: 'contadorDay', killer: true,
    look: {
      skin: 5, hair: 5, hairStyle: 0, eyes: 3, mouth: 0, brow: 0, faceW: 1,
      glasses: false, hat: 1, beard: 0, idade: 40, rugas: false,
      build: 1, height: 0.4, girth: 0, coat: '#16181c', scarf: null,
      simetrico: true, semPiscar: true, peleFria: true, fseed: 100002,
    },
    fala: 'Boa tarde. Dois, no dia %DIA%. Eu não venho reclamar — reclamar é coisa de quem espera resposta. Venho só conferir se foi descuido ou se foi escolha. Olhe bem para mim, inspetor. Com calma. Nós temos o tempo que o senhor tiver.',
    nota: null,
  },
};
const SPECIAL_IDS = Object.keys(SPECIALS);
/* dia -> [{id, sp, ap}] : quem passa hoje e em que versão */
function specialsForDay(day) {
  const out = [];
  for (const id of SPECIAL_IDS) {
    const sp = SPECIALS[id];
    if (sp.dias && sp.dias[day]) out.push({ id, sp, ap: sp.dias[day] });
  }
  return out;
}

/* ---------- EVENTOS DE CASA ---------- */
const HOME_EVENTS = {
  4:  { texto: 'Seu filho, Tomi, acordou tossindo. Vessa acha que é o frio. Sua mãe acha que é "outra coisa" e não explica o quê.', efeito: null },
  7:  { texto: 'Tomi piorou. O médico do bairro emigrou na semana passada. O remédio custa caro na farmácia — quando tem.', efeito: 'filho_doente' },
  10: { texto: 'Vessa foi rebaixada no arquivo público: "corte de pessoal por critério de confiabilidade". Ela não te olha nos olhos ao contar.', efeito: 'renda_menor' },
  13: { texto: 'Distribuíram bandeiras novas no seu bloco. O vizinho que não pendurou a dele recebeu uma visita à noite. Hoje a bandeira dele é a maior do prédio.', efeito: null },
  15: { texto: 'A escola de Dario exigiu o Certificado de Ancestralidade dele — "pendência de linhagem materna". Ele ficou no portão. Vessa passou a manhã no cartório e voltou com um número de protocolo e nenhum papel.', efeito: null },
  17: { texto: 'Sua mãe rasgou o formulário de ancestralidade. "Eu SEI quem eu sou." Vessa colou os pedaços de madrugada, chorando baixinho para ninguém ouvir.', efeito: null },
  18: { texto: 'Tomi voltou da escola com a cartilha nova e pediu para ver as suas mãos. Olhou com cuidado, contou os calos e disse: "Passou." Depois riu, porque para ele era um jogo. Vessa não riu. Você também não conseguiu.', efeito: null },
  20: { texto: 'Tomi desenhou a família na escola. A professora elogiou — mas perguntou por que ele desenhou "papai com dois rostos". Ele não soube explicar. Você também não.', efeito: null },
  22: { texto: 'Colaram um cartaz novo na escada: "DENUNCIE. É um ato de amor." Dario perguntou o que era pra denunciar. Vessa mandou ele parar de fazer perguntas na escada.', efeito: null },
  24: { texto: 'Tomi trouxe da escola um "Caderno de Vigilância Familiar": cada aluno anota o que os pais dizem em casa. As páginas já vêm numeradas. Vessa preencheu a primeira com elogios ao regime, letra caprichada — e queimou o resto no fogão.', efeito: null },
  26: { texto: 'Um homem parou na frente do prédio e olhou para a sua janela por vinte minutos. Vessa anotou a hora: 21h13. Quando você olhou, não havia ninguém. Nunca houve?', efeito: null },
  28: { texto: 'O rádio pediu que cada família recitasse o novo juramento antes de dormir. Sua mãe move os lábios sem som. "Deus me ouve melhor assim", ela diz. Você finge não notar que ela não fala nada.', efeito: null },
  30: { texto: 'Da noite pro dia, as bandeiras mudaram: o Conselho Popular agora governa. Sua mãe olhou pela janela e disse só: "A terceira que eu vejo. Ou a quarta. Já perdi a conta de quantos governos me prometeram o mesmo silêncio."', efeito: null },
  32: { texto: 'Trocaram o retrato da parede do saguão pela terceira vez em dois meses. O prego é o mesmo, o buraco é o mesmo, só o rosto muda. Sua mãe passou por ele sem olhar e comentou: "Aquele prego já viu mais governo do que eu."', efeito: null },
  33: { texto: 'Trocaram o nome da sua rua: agora é Avenida da Unidade. As cartas antigas voltam carimbadas "endereço inexistente" — como se a casa onde você dorme nunca tivesse existido.', efeito: null },
  35: { texto: 'A família realocada tem uma menina. Ela nunca chora, nunca corre, nunca faz barulho. Hoje ela sorriu pro Tomi no corredor. Ele voltou pálido, não quis dizer por quê, e dormiu de luz acesa.', efeito: null },
  38: { texto: 'A família realocada bateu na sua porta pela primeira vez. O homem sorriu e ofereceu pão morno. Ninguém nunca os viu comprando nada. Vessa agradeceu e trancou a porta com as duas voltas.', efeito: null },
  40: { texto: 'Chegou um envelope sem remetente. Dentro, uma foto sua no guichê — tirada de um ângulo que não existe do lado de fora. No verso, a lápis: "Estamos satisfeitos com o seu trabalho." Ninguém assina um elogio assim.', efeito: null },
  31: { texto: 'O Conselho requisitou metade do seu apartamento para "uma família de trabalhadores realocados". Eles são educados. Eles são silenciosos. Eles cozinham sem cheiro.', efeito: 'aluguel_maior' },
  36: { texto: 'Sua mãe sumiu por seis horas. Voltou calma. Calma DEMAIS, diz Vessa. "Fui só andar", diz ela. Ela odeia andar. Sempre odiou. Não é?', efeito: null },
  41: { texto: 'Dario chegou tarde e com terra no casaco. Disse que ajudou a carregar caixas na estação. Não há mais trens na estação desde o dia 27. Você não perguntou de novo — e passou a noite calculando há quanto tempo o seu filho aprendeu a mentir para te proteger.', efeito: null },
  42: { texto: 'Tomi perguntou no jantar: "Pai, se trocarem você, eu vou perceber?" Ninguém riu. Ninguém respondeu. O relógio da cozinha nunca fez tanto barulho.', efeito: null },
  45: { texto: 'Vessa fez as malas. "Quando isso acabar, a gente atravessa também. Do outro lado deve ser igual — mas pelo menos é longe." Você concorda. Concordar é mais fácil.', efeito: null },
  46: { texto: 'Não veio jornal, não veio rádio, não veio ordem. Tomi dormiu na sua cama esta noite — "só hoje". Você ficou acordado ouvindo a respiração dele, contando, com medo de que uma batida viesse errada.', efeito: null },
  47: { texto: 'A luz piscou a noite inteira. No escuro, Vessa segurou sua mão e perguntou baixinho se você ainda era você. Você disse que sim. Ela apertou mais forte — do jeito de quem confere, não de quem acredita.', efeito: null },
};

/* ---------- FINAIS ---------- */
const ENDINGS = {
  silente: {
    t: 'FIM — O QUE OLHA DE VOLTA',
    b: 'Você chamou os guardas. Ou olhou perto demais. Ou deixou o tempo decidir por você.\n\nNão houve barulho. É isso que ninguém conta sobre o fim: não há barulho nenhum.\n\nOs guardas ficaram parados onde estavam, educados, de costas. O rádio virou estática. A fila lá fora continuou andando — para frente, para o posto, como se o posto ainda fosse seu.\n\nA última coisa que você registra é o próprio carimbo, na própria mão, descendo devagar na direção do seu próprio pulso.\n\nAPROVADO.\n\nAlguém vai sentar na sua cadeira amanhã. Alguém com o seu rosto. A família nem vai perceber. Você também não percebeu, da outra vez.\n\n— Havia regras. O menino tentou avisar. Não olhe de perto. Não chame ninguém. Carimbe qualquer coisa. E deixe ir. —',
  },
  morto: {
    t: 'FINAL — O GUICHÊ FICOU ABERTO',
    b: 'Você viu. Deu tempo de ver: a mão entrando no casaco, o metal, o segundo em que ainda dava.\n\nO Ministério registrou o incidente em duas linhas. "Falha de reação do agente." O posto reabriu no dia seguinte, com outro nome na escala — o mesmo formulário, a mesma cadeira, a mesma altura de balcão.\n\nVessa recebeu uma carta padronizada com o seu número de matrícula e um erro de digitação no sobrenome. O rádio disse que a fronteira estava mais segura do que nunca.\n\nNinguém no país soube o seu nome. Do outro lado do vidro, alguém continua carimbando.',
  },
  contador: {
    t: 'FINAL — A CONTA FECHADA',
    b: 'Ele não levantou a voz e não puxou nada do casaco. Só esperou o carimbo descer, como quem confere um número numa coluna.\n\n"Escolha, então", ele disse. "Obrigado pela franqueza."\n\nNão houve tiro que alguém tenha ouvido. Houve uma linha a menos no livro de ponto e uma caneca de café ainda morna sobre a mesa, que o turno da tarde lavou sem perguntar de quem era.\n\nDois passaram pelo seu guichê num único dia. Ele veio conferir se tinha sido descuido ou escolha — e você respondeu. É a única pergunta que este trabalho faz de verdade, e ela só é feita uma vez.\n\nAmanhã o posto abre no horário. A fila não vai notar.',
  },
  prisao: {
    t: 'FINAL — O FORMULÁRIO 77-B',
    b: 'Vieram buscá-lo no meio do turno. As acusações mudaram três vezes durante a leitura: negligência, sabotagem, "inconsistência epistemológica". A cela é fria e o processo, eterno.\n\nNo interrogatório, o agente folheia seu histórico completo — cada carimbo, cada hesitação, cada segundo a mais que você gastou olhando um rosto.\n\n"O senhor entende", diz ele sem levantar os olhos, "que nós também estávamos inspecionando você. Desde o primeiro dia."\n\nVocê entende. Agora entende.',
  },
  familia: {
    t: 'FINAL — A CASA VAZIA',
    b: 'O posto continua lá. Você continua nele. Carimba, aprova, rejeita, com uma precisão que virou lenda entre os guardas.\n\nEm casa, ninguém espera. A mesa posta para um. O silêncio, pontual como você.\n\nDizem que você é o melhor inspetor que a fronteira já teve. Dizem que você nunca erra.\n\nErrou uma vez. As vezes que importavam.',
  },
  resistencia: {
    t: 'FINAL — A ROTA DO BARBEIRO',
    b: 'Na madrugada do dia 49, alguém bate três vezes na sua porta. Depois duas. Depois uma.\n\nO barbeiro envelheceu dez anos em dez dias. "Tem lugar para a sua família na rota do sul. Sem documentos. Sem carimbos. Sem perguntas."\n\nVocê, que passou 48 dias exigindo papéis, atravessa a fronteira sem nenhum.\n\nDo outro lado, uma mulher da rota aperta sua mão e sorri um segundo a mais do que devia. Você decide não pensar nisso. Você decide isso todos os dias, pelo resto da vida.',
  },
  silencio: {
    t: 'FINAL — A CIDADE SILENCIOSA',
    b: 'A guerra não veio. O colapso passou, como passam as tempestades.\n\nA cidade se reconstrói com uma eficiência que ninguém lembra de ter visto antes. Os vizinhos são gentis. As filas, ordeiras. Ninguém grita, ninguém rouba, ninguém chora alto.\n\nÀ noite, você conta nos dedos quantos você deixou passar. Para de contar quando os dedos acabam.\n\nSua esposa dorme serena ao seu lado. A respiração dela é perfeita. Perfeitamente regular. Perfeita demais?\n\nVocê fecha os olhos. É mais fácil assim.',
  },
  funcionario: {
    t: 'FINAL — A MEDALHA',
    b: 'Sobrou gente suficiente para uma cerimônia. Um homem de casaco cinza prende uma medalha no seu peito: "Servidor Exemplar — 48 dias sem desvio".\n\nAs mãos dele estão frias. Todas as mãos estão frias em novembro, você pensa. Todas.\n\n"O Estado agradece", diz ele. Qual Estado, você não pergunta. A medalha não especifica.\n\nNo verso dela, minúsculo, o número de série: o mesmo do seu carimbo. Você foi, no fim, a peça que melhor funcionou.\n\nA máquina é que talvez nunca tenha existido.',
  },
  duvida: {
    t: 'FINAL — O ESPELHO',
    b: 'Dia 49. O posto amanhece sem fila. Sem guardas. Sem ordens.\n\nVocê senta na cadeira mesmo assim — quarenta e oito dias criam sulcos — e percebe que há alguém do outro lado do vidro.\n\nÉ o seu reflexo. Claro que é. O vidro sempre refletiu.\n\nVocê desliza os seus próprios documentos pela bandeja, por hábito, por piada, por desespero. Nome. Foto. Assinatura.\n\nA assinatura está correta. Você acha. Você assinava assim há 48 dias?\n\nO reflexo espera, paciente, a sua decisão.',
  },
  espelho: {
    t: 'FINAL — O CARIMBO CONHECIDO',
    b: 'Você olha para o vidro. O vidro sempre refletiu — hoje não é diferente, é só a primeira vez que você presta atenção nisso durante o expediente.\n\nOs documentos do outro lado são os seus: nome, foto, 48 assinaturas de turno, nenhuma delas perfeitamente igual à anterior. Ninguém nunca reparou. Você também não reparava nos outros.\n\nA mão pega o carimbo. É o mesmo gesto de sempre — nem apressado, nem hesitante, só conhecido, do jeito que um músculo conhece um movimento depois de repeti-lo mil vezes sem pensar.\n\nAPROVADO. A tinta seca. Do outro lado do vidro, alguém com o seu rosto guarda os documentos, levanta, e sai andando na direção de uma vida que talvez seja a sua. Você fica sentado mais um instante, sem saber ao certo qual dos dois ficou com o lugar de verdade.',
  },
  espelho_cruel: {
    t: 'FINAL — O CARIMBO NÃO HESITOU',
    b: 'Você olha para o vidro, para o seu próprio rosto do outro lado, e aprova sem pausa. É o mesmo gesto de sempre: rápido, seco, definitivo.\n\nO problema é que você lembra dos outros gestos, os de antes. Várias pessoas inocentes saíram do seu guichê algemadas porque era mais fácil detê-las do que continuar duvidando. Você chamou isso de rigor, na época. Chamou isso de fazer o trabalho direito.\n\nO reflexo aceita o carimbo sem reclamar. Claro que aceita — ele é você, e você nunca recusou nada de si mesmo antes.\n\nAPROVADO. A tinta seca. Do outro lado do vidro, alguém com o seu rosto guarda os documentos e sai andando, como se nada tivesse pesado, porque para ele — para você — nunca pesou o suficiente.',
  },
  espelho_corrupto: {
    t: 'FINAL — O PREÇO DO PRÓPRIO CARIMBO',
    b: 'Você desliza os seus documentos pela bandeja e, por hábito, procura o envelope. Não tem envelope. É você do outro lado do vidro; você não vai subornar a si mesmo, ainda que uma parte sua ache graça na ideia.\n\nFoi fácil, no fim das contas. Um envelope aqui, outro ali, ninguém contando alto o bastante para ouvir. O dinheiro pagou o remédio, o aquecimento, um mês de aluguel adiantado. Também pagou, sem que ninguém assinasse nada, o direito de algumas pessoas erradas atravessarem a fronteira.\n\nO reflexo espera, paciente, com a mesma cara que você tem quando finge não fazer contas.\n\nVocê aprova. Claro que aprova — o seu próprio carimbo, pelo menos esse, sempre esteve à venda para você mesmo, de graça.',
  },
  espelho_implacavel: {
    t: 'FINAL — O PORTÃO DE FERRO',
    b: 'Você rejeitou mais do que aprovou. No fim, rejeitar virou o padrão, e aprovar, a exceção que precisava se justificar.\n\nHá pessoas na fronteira de Osteria, hoje, que nunca vão saber que passaram pelo seu guichê e voltaram para onde vieram por causa de uma vírgula errada, um selo desbotado, um segundo de dúvida que você decidiu não arriscar. Algumas delas, você sabe, não tinham para onde voltar.\n\nO reflexo no vidro é implacável do mesmo jeito. Você olha para ele, reconhece o gesto — o carimbo vermelho decidido antes mesmo de ler até o fim — e aprova a si mesmo sem hesitar, porque essa é a única coisa que você sempre aprova sem hesitar: o próprio rigor.\n\nO portão fica fechado para quase todo mundo. Para você, no fim, ele sempre esteve aberto.',
  },
  espelho_protetor: {
    t: 'FINAL — A MÃO QUE NÃO TREMEU DO JEITO ERRADO',
    b: 'Nenhum inocente saiu do seu guichê algemado. Nem um, em 48 dias. Isso não está em nenhum boletim do Ministério — não é o tipo de número que eles publicam — mas você sabe, e é seu.\n\nAjudou quem pôde ajudar, quando havia como ajudar sem que ninguém visse. Um bilhete guardado em vez de queimado. Um nome que você não perguntou de novo na segunda vez que apareceu.\n\nO reflexo no vidro aprova a si mesmo, e pela primeira vez em 48 dias isso não parece um gesto vazio. Parece, quase, merecido.\n\nVocê não salvou o país. Não salvou nem o posto. Salvou algumas pessoas específicas, com nome, que você nunca soube se eram humanas ou não — e decidiu, no fim, que a pergunta importava menos do que a resposta que você deu.',
  },
  espelho_perfeito: {
    t: 'FINAL — A MÁQUINA PERFEITA',
    b: 'Nenhum erro registrado. Trinta e cinco decisões corretas, ou mais — o número exato nem importa mais, porque a partir de um certo ponto "perfeito" deixa de ser contável e vira só um estado permanente.\n\nOs colegas param de te chamar pelo nome nos últimos dias. Chamam de "o modelo", em voz baixa, meio elogio, meio aviso. Ninguém acerta 48 dias seguidos sendo humano o tempo inteiro.\n\nO reflexo no vidro aprova, e a mão não treme, porque a mão nunca tremeu — nem uma vez, em 48 dias, mesmo quando devia.\n\nVocê saiu do posto sem uma única marca no registro. Não sabe mais dizer se isso prova que fez tudo certo, ou só que parou de sentir a diferença entre certo e errado faz tempo.',
  },
  familia_parcial: {
    t: 'FINAL — A MESA COM UM LUGAR A MENOS',
    b: 'A casa não ficou vazia. Ficou incompleta, o que de algum jeito dói mais: a rotina continua, o jantar é servido, só que sempre com um prato de menos que ninguém tira da pilha.\n\nOs que restaram não falam do assunto. Falam ao redor dele, com uma delicadeza que vocês nunca precisaram ter uns com os outros antes.\n\nVocê carimbou documentos por 48 dias tentando decidir quem entra e quem fica de fora. Não conseguiu decidir a única coisa que importava de verdade: quem, na sua própria casa, sobrevive ao inverno.\n\nO posto reabre amanhã, com ou sem você. A mesa em casa também.',
  },
  denuncia: {
    t: 'FINAL — O CORREDOR VAZIO',
    b: 'No dia 48, o corredor do Bloco 14 ainda tem sete portas. Uma delas nunca mais abriu.\n\nVocê tentou não contar os dias. Contou de qualquer jeito: três, entre a menção e os móveis saindo de manhã. Ninguém no prédio pergunta pelo apartamento vazio — perguntar virou o tipo de coisa que move as pessoas para uma porta diferente da sua.\n\nO sargento disse "excelente memória, inspetor" e nunca mais precisou de outra. Você forneceu uma vez. Isso basta para sempre ser, no fichário de alguém, a pessoa que fornece.\n\nOs quarenta e oito dias terminam. O corredor continua com sete portas. Você aprende a olhar só para a sua.',
  },
  corrupcao: {
    t: 'FINAL — O ENVELOPE VIROU ROTINA',
    b: 'Ninguém mais desliza um envelope escondido. Nos últimos dias, colocam em cima da pilha de documentos, junto com o passaporte, como mais um papel a carimbar.\n\nVocê perdeu a conta em algum lugar entre o terceiro e o sétimo. Não perdeu o hábito de contar o dinheiro depois, no banheiro do posto, com a porta trancada.\n\nOs colegas sabem. O supervisor sabe, e o supervisor também sabe quanto custa saber e ficar calado. É o tipo de aritmética que o Ministério nunca ensina, mas que todo mundo aprende sozinho até o dia 20.\n\nNo dia 48, o guichê fecha como sempre fechou: no horário, sem escândalo. Você sai com mais dinheiro do que qualquer salário jamais te daria, e menos certeza do que aprovou de verdade do que qualquer inspetor deveria ter.',
  },
  cego: {
    t: 'FINAL — A PONTARIA ERRADA',
    b: 'O relatório do Ministério não sabe o que você fez. Sabe os números, e os números não perdoam.\n\nVárias pessoas inocentes passaram pelo seu guichê e saíram detidas. Vários Alternados, ao mesmo tempo, passaram pelo mesmo guichê e saíram livres, sem que você desconfiasse de nada.\n\nNão há uma palavra oficial para isso. Você inventou uma, sozinho, numa madrugada de insônia: errar para os dois lados. Bateu na porta errada da paranoia e na porta errada da negligência, na mesma semana, com o mesmo carimbo.\n\nDia 48. Você ainda não sabe se prendeu gente demais ou gente de menos. As duas coisas são verdadeiras ao mesmo tempo, e essa é a única certeza que sobrou.',
  },
  cacador: {
    t: 'FINAL — A MIRA CERTA',
    b: 'Oito. O número fica repetindo na sua cabeça mesmo depois que você para de contar: oito Alternados identificados, detidos, removidos do fluxo — e nenhum inocente arrastado junto no caminho.\n\nOs colegas comentam baixo, quase respeito, quase medo: você tem "faro". Ninguém usa a palavra certa, porque a palavra certa implicaria que você sabe algo que o Ministério não ensina em nenhum manual.\n\nTalvez seja mesmo faro. Talvez seja sorte disfarçada de método, oito vezes seguidas. Talvez os oito só fossem particularmente descuidados, e o próximo — o que você não vai pegar — seja bom demais para o olho que você sempre teve.\n\nNo dia 48, o Ministério manda uma carta de reconhecimento formal e um convite para "consultoria de treinamento". Você não sabe se aceita. Sabe, com uma certeza fria que não devia ter, que vai continuar olhando as pessoas do jeito que aprendeu a olhar, pelo resto da vida, dentro ou fora do posto.',
  },
};

/* ---------- CONQUISTAS (protótipo web: toast local em unlockAchievement(),
   game.js; mesmos IDs e condições de steam/README.md, pra quando a integração
   Steamworks acontecer) ---------- */
/* Cada conquista tem NOME e um verso que só aparece quando ela é obtida —
   até lá o texto vem tarjado, como tudo neste país. (O nome continua sendo
   uma string simples em ACHIEVEMENTS para não quebrar nada que já o use.) */
const ACHIEVEMENTS = {
  ACH_DIA1: 'Primeiro Carimbo',
  ACH_MEDALHA: 'Servidor Exemplar',
  ACH_ROTA: 'A Rota do Barbeiro',
  ACH_SILENCIO: 'A Cidade Silenciosa',
  ACH_ESPELHO: 'Quem Sou Eu Depois de 48 Dias',
  ACH_SILENTE: 'Não Olhe de Perto',
  ACH_OLHOU: 'Você Olhou',
  ACH_FAMILIA: 'Ninguém Ficou Para Trás',
  ACH_LIMPO: 'Mãos Limpas',
  ACH_QUENTE: 'O Travesseiro',
  ACH_CINCO: 'A Conta Fecha',
  ACH_AMIGO: 'O Amigo Nunca Erra',
  ACH_REFLEXO: 'O Vidro Não Devolve',
  ACH_SANGUE_FRIO: 'Sangue Frio no Guichê',
  ACH_CACADOR: 'O Faro',
  ACH_ENVELOPE: 'Rotina',
  ACH_CORREDOR: 'Sete Portas',
};
const ACH_DESC = {
  ACH_DIA1: 'Você fechou o primeiro expediente. Nada disso parecia grave ainda.',
  ACH_MEDALHA: 'Chegou ao fim com o cadastro limpo e sem um suborno. O Ministério gosta do senhor. Pense nisso.',
  ACH_ROTA: 'Atravessou a fronteira sem um papel sequer, depois de 48 dias exigindo todos.',
  ACH_SILENCIO: 'Seis atravessaram. A cidade ficou em paz. Ninguém mais grita à noite.',
  ACH_ESPELHO: 'Chegou ao dia 48 e abriu a porta do banheiro.',
  ACH_SILENTE: 'Sobreviveu duas vezes ao que entra sem constar do livro. Carimbe qualquer coisa. E deixe ir.',
  ACH_OLHOU: 'Você olhou de perto. Ele também.',
  ACH_FAMILIA: 'Os quatro chegaram vivos ao dia 48. Vessa, Tomi, Dario e sua mãe.',
  ACH_LIMPO: '48 dias sem aceitar um único envelope por baixo do vidro.',
  ACH_QUENTE: 'Ninguém dormiu com frio nesta casa.',
  ACH_CINCO: 'O Contador veio conferir a conta e voltou algemado.',
  ACH_AMIGO: 'O amigo do Tomi avisou. O amigo do Tomi acertou. O amigo do Tomi não existe.',
  ACH_REFLEXO: 'Olhou no espelho e reconheceu o que estava lá.',
  ACH_SANGUE_FRIO: 'Deteve ou abateu um agressor no guichê antes que ele agisse.',
  ACH_CACADOR: 'Oito Alternados identificados. Nenhum inocente detido no caminho.',
  ACH_ENVELOPE: 'Seis envelopes ou mais. Parou de contar antes do Ministério contar por você.',
  ACH_CORREDOR: 'Uma menção, um nome, uma porta que não abriu mais.',
};

/* ============================================================
   EXAME FÍSICO, BOATOS E NOITES
   (a camada "No, I'm Not a Human": o corpo como documento —
   e o boato como lei. Alguns sinais têm correlação real com
   Alternados. Outros são pura lenda. O jogo NUNCA diz quais.)
   ============================================================ */

/* ---------- SINAIS FÍSICOS (tells) ----------
   humanBase: chance em humanos comuns
   confound:  acréscimo em humanos doentes/nervosos/exaustos
   altBonus:  acréscimo REAL em Alternados (0 = boato sem fundamento) */
const TELLS = {
  piscar:  { zona: 'olhos', humanBase: .04, confound: .02, altBonus: .45,
    achado: 'Não piscou uma única vez durante todo o exame.',
    normal: 'Pisca em ritmo comum. Um pouco rápido, talvez. Frio faz isso.' },
  olhos:   { zona: 'olhos', humanBase: .12, confound: .18, altBonus: .15,
    achado: 'Escleras injetadas, vasos escuros demais. (Choro recente? Insônia? Outra coisa?)',
    normal: 'Olhos cansados. Como os de todo mundo nesta fila.' },
  dentes:  { zona: 'boca', humanBase: .08, confound: .05, altBonus: .15,
    achado: 'Dentição perfeita demais. Gengivas pálidas, sem irrigação visível.',
    normal: 'Dentes gastos, um canino lascado. Uma boca que comeu pão duro a vida inteira.' },
  pele:    { zona: 'pele', humanBase: .07, confound: .08, altBonus: 0,
    achado: 'Pele cerosa, quase sem poros. (Ou apenas sabão de má qualidade e vento norte.)',
    normal: 'Pele rachada de frio. Cicatriz antiga no queixo.' },
  maos:    { zona: 'maos', humanBase: .06, confound: .04, altBonus: 0,
    achado: 'Dedos compridos demais para as mãos. Unhas sem meia-lua.',
    normal: 'Mãos calejadas. Aliança apertada demais para sair.' },
  pescoco: { zona: 'pescoco', humanBase: .04, confound: .03, altBonus: .40,
    achado: 'O pulso no pescoço é visível. Lento. Lento demais. Você conta seis batimentos no minuto.',
    normal: 'Pulso acelerado sob a pele. Gente com medo tem coração audível.' },
};
const TELL_IDS = Object.keys(TELLS);
const TELL_LABEL = { piscar: 'piscar', olhos: 'olhos', dentes: 'dentes', pele: 'pele', maos: 'mãos', pescoco: 'pescoço' };

/* ---------- BOATO DO DIA ----------
   A partir do dia 3, todo comunicado traz um "sinal". Sob o regime
   Mehrvolk (14–42) o boato vira doutrina OFICIAL: deter com base
   nele deixa de gerar advertência — mesmo quando o sinal é lenda. */
const RUMOR_TEXT = {
  piscar:  ['Dizem nas filas: "eles não piscam".', 'O Instituto de Fenotipia CONFIRMA: ausência de reflexo palpebral é indicador Classe-2.'],
  olhos:   ['Boato de rádio clandestina: "olho vermelho, sangue trocado".', 'Circular oficial: hiperemia ocular consta como indicador Classe-3.'],
  dentes:  ['Um dentista de Miralta jura: "dente perfeito, gente falsa".', 'Nota técnica: dentição íntegra em adultos de baixa renda é estatisticamente anômala.'],
  pele:    ['Dizem que a pele deles não tem poros. Minha avó dizia o mesmo de anjos.', 'O Ministério lista "epiderme atípica" como indicador auxiliar.'],
  maos:    ['"Olha as mãos. Eles erram as mãos." — pichação na Praça do Sal.', 'Manual revisado: proporção falangeana irregular deve ser reportada.'],
  pescoco: ['Um enfermeiro desertor: "o coração deles bate devagar. Muito devagar."', 'Boletim médico-estatal: bradicardia extrema é indicador Classe-1.'],
};
function rumorForDay(d) {
  if (d < 3 || d >= 47) return null;
  const tell = TELL_IDS[(d * 7 + 3) % TELL_IDS.length];
  const official = d >= 14 && d <= 42;
  return { tell, official, text: RUMOR_TEXT[tell][official ? 1 : 0] };
}

/* ---------- VISITAS NOTURNAS ----------
   Entre o expediente e a manhã. O olho mágico. A porta.
   efeitos: money, audit, flag, echo (jornal), after (texto pós-escolha) */
const NIGHT_EVENTS = {
  3: {
    quem: 'Batidas educadas. 22h40.', sexo: 'm',
    texto: 'É Bruno, do 12. O aquecimento do bloco dele quebrou. Ele segura um cobertor dobrado como quem segura um pedido de desculpas. "Só esta noite. A Vessa me conhece."',
    escolhas: [
      { label: 'ABRIR A PORTA', after: 'Ele dorme no sofá sem se mexer. De manhã, dobra o cobertor em silêncio e agradece três vezes. Vessa diz que você fez certo. Você concorda. Quase.' },
      { label: 'NÃO ABRIR', after: 'Os passos se afastam. No dia seguinte, Bruno não te cumprimenta. Nunca mais.', echo: 'Um morador do Bloco 14 passou a noite no vão da escada. Vizinhos "não ouviram nada".' },
    ],
  },
  6: {
    quem: 'Três batidas firmes. 23h15.', sexo: 'm',
    texto: 'Dois homens de casaco comprido. "Vistoria de rotina, inspetor. O senhor entende." Pela fresta, você vê que um deles não olha para você — olha para DENTRO.',
    escolhas: [
      { label: 'ABRIR A PORTA', after: 'Eles andam pelo apartamento anotando nada em pranchetas vazias. Na saída: "Tudo em ordem. Por enquanto." Vessa não dorme mais essa noite.' },
      { label: 'NÃO ABRIR', audit: 1, after: '"Anotado", diz a voz, sem raiva nenhuma. É a falta de raiva que fica com você.' },
    ],
  },
  10: {
    quem: 'Batidas fracas. 2h da manhã.', sexo: 'f',
    texto: 'Uma mulher com um bebê enrolado. "Água. Só água, por favor." O corredor está gelado. O bebê não chora. Em nenhum momento o bebê chora.',
    escolhas: [
      { label: 'ABRIR E DAR ÁGUA', after: 'Ela bebe, agradece com a testa encostada no batente e desce a escada. Você fica ouvindo. Os passos são só dela. Só dela?' },
      { label: 'FALAR PELA PORTA: "NÃO POSSO"', after: '"Eu entendo", diz ela. E o pior é que a voz parece entender mesmo.', echo: 'Uma mulher não identificada foi encontrada dormindo no saguão do Bloco 14. Ao amanhecer, já não estava.' },
    ],
  },
  13: {
    quem: 'Não é na sua porta. 3h20.', sexo: 'm',
    texto: 'Botas no corredor. Muitas. A porta do 9 — o professor aposentado que não pendurou a bandeira — abre e fecha. Depois, o silêncio organizado de gente treinada. Vessa aperta sua mão no escuro.',
    escolhas: [
      { label: 'OLHAR PELO OLHO MÁGICO', after: 'Você vê costas de uniforme e, entre elas, os chinelos do professor. Um dos homens PARA. Vira o rosto para a sua porta. Você para de respirar até os passos acabarem.' },
      { label: 'NÃO OLHAR', after: 'Você conta os passos. Sete pessoas descem. Subiram seis. Você refaz a conta a noite inteira e ela nunca fecha.' },
    ],
  },
  19: {
    quem: '—', sexo: 'm',
    texto: 'Você acorda sem saber por quê. Então percebe: a maçaneta da porta da frente está girando. Devagar. Com paciência. Quem tem chave não gira assim. Quem não tem, não deveria girar.',
    escolhas: [
      { label: 'ACENDER A LUZ', after: 'A maçaneta para no meio do giro. Nenhum passo se afasta — e isso é o que você vai contar ao médico quando ele perguntar da insônia: NENHUM passo se afastou.' },
      { label: 'FICAR IMÓVEL NO ESCURO', after: 'O giro completa. A porta, trancada, não abre. A maçaneta volta à posição com um cuidado quase gentil. De manhã, há um risco fino no metal. Sempre houve?' },
    ],
  },
  22: {
    quem: 'Batidinhas na altura do joelho. 1h50.', sexo: 'm',
    texto: 'Uma voz de criança: "Moço, eu me perdi. Sou amigo do Tomi." Você olha para o quarto: Tomi dorme, respiração funda. A voz insiste, paciente: "Moço. Eu conheço o Tomi."',
    escolhas: [
      { label: 'ABRIR A PORTA', after: 'O corredor está vazio. Frio, e vazio. No dia seguinte, Tomi pergunta do nada: "Pai, o Nico veio aqui ontem?" Você não pergunta quem é Nico.' },
      { label: 'NÃO ABRIR', after: 'As batidinhas continuam por vinte minutos exatos. Depois: "tá bom. outro dia." Você não conta para a Vessa. Não existe frase para contar isso.' },
    ],
  },
  28: {
    quem: 'Uma batida só. Pesada. 23h55.', sexo: 'm',
    texto: 'Casaco cinza, pasta de couro, sorriso de repartição. "Polícia Política. Rotina. O senhor notou algo... incomum nos seus vizinhos? Qualquer detalhe ajuda. Qualquer um."',
    escolhas: [
      { label: 'DIZER QUE NÃO NOTOU NADA', after: '"Curioso", diz ele anotando, "todo mundo neste bloco não notou nada." Ele agradece com uma cortesia que pesa como intimação.', audit: 1 },
      { label: 'MENCIONAR O 7 (a família nova, quieta demais)', flag: 'denunciouVizinho', after: 'Ele nem anota — já sabia. "Excelente memória, inspetor." Três dias depois, o 7 está vazio e você atravessa o corredor olhando o chão.', echo: 'Uma família do Bloco 14 foi "convidada a colaborar". Os móveis saíram de manhã. Ninguém viu as pessoas saírem.' },
    ],
  },
  32: {
    quem: 'Batem do LADO DE DENTRO da parede da cozinha. Não. Batem na porta. Claro que é na porta. 0h30.', sexo: 'f',
    texto: 'É a mulher da família realocada que divide seu apartamento. "Sal", diz ela, com a mão estendida. Vessa entrega o pote. A mulher agradece com um aceno perfeito e volta ao quarto onde eles cozinham todas as noites. Sem cheiro. Nunca há cheiro.',
    escolhas: [
      { label: 'PERGUNTAR O QUE ESTÃO COZINHANDO', after: '"Sopa", responde ela, depois de um segundo a mais. "De quê?" — "Sopa." A porta do quarto fecha com o clique mais educado do mundo.' },
      { label: 'NÃO PERGUNTAR NADA', after: 'Você fica olhando o pote de sal na mão dela até a porta fechar. No dia seguinte o pote está de volta na prateleira. Cheio. Exatamente como estava. Exatamente.' },
    ],
  },
  39: {
    quem: 'Batidas rápidas, nervosas. 23h10.', sexo: 'm',
    texto: 'Um homem magro, suando frio. Abre um pano: ₴60 em notas miúdas. "Pelo seu carimbo. Uma noite. Devolvo antes do turno. Ninguém carimba nada, eu juro — é só para FOTOGRAFAR."',
    escolhas: [
      { label: 'ACEITAR ₴60', money: 60, audit: 2, after: 'O carimbo volta de madrugada, embrulhado em jornal, com um fio de tinta que você não usou. Você lava três vezes. O cheiro de tinta fica.' },
      { label: 'FECHAR A PORTA', after: '"Todo mundo tem preço, inspetor", diz a voz descendo a escada. "O seu só ainda não bateu na porta certa."' },
    ],
  },
  43: {
    quem: 'Batidas. Espaçadas. A noite inteira.', sexo: 'm',
    texto: 'Uma a cada vinte minutos, aproximadamente. Você olha pelo olho mágico: corredor vazio. A batida seguinte soa ENQUANTO você olha. No corredor vazio. Tomi acorda. Sua mãe reza baixo. Vessa olha para você como quem cobra uma profissão inteira: você não sabia inspecionar?',
    escolhas: [
      { label: 'ABRIR A PORTA DE UMA VEZ', after: 'Nada. Ar frio. E na parede em frente, escrito a dedo no gelo da janela do corredor: uma palavra que derrete antes de você terminar de ler. Começava com a sua inicial.' },
      { label: 'SENTAR CONTRA A PORTA ATÉ AMANHECER', after: 'Às 5h13 as batidas param. Às 5h14, uma última — suave, quase um pedido de desculpas — na porta do quarto do Tomi. Do lado de dentro do apartamento.' },
    ],
  },
  46: {
    quem: 'A voz da sua mãe. 2h33.', sexo: 'f',
    texto: '"Filho. Abre. Esqueci a chave." Você atravessa o corredor do apartamento. O quarto da sua mãe está fechado. Você abre uma fresta: ela dorme, respiração miúda, o terço na mão. Na porta da frente, a voz repete, idêntica, paciente: "Filho. Está frio aqui fora."',
    escolhas: [
      { label: 'ABRIR A PORTA', after: 'O corredor está vazio até onde a luz alcança. Do vão da escada, ainda com a voz dela: "amanhã, então." Você tranca a porta com as duas mãos, porque uma só não obedece.' },
      { label: 'ENCOSTAR A TESTA NA PORTA E ESPERAR', after: 'A voz espera junto. Você sente — sem som nenhum — que do outro lado alguém encostou a testa também. Vocês ficam assim muito tempo. De manhã, sua mãe pergunta por que você dormiu no chão da sala.' },
    ],
  },
};

/* ---------- BAGAGEM: objetos contam histórias ---------- */
const BAG_POOLS = {
  comum: [
    'Roupas dobradas com pressa', 'Pão embrulhado em jornal de anteontem',
    'Fotografia de família com o canto queimado', 'Terço gasto de tanto uso',
    'Caderno de endereços com metade dos nomes riscados', 'Relógio de bolso parado às 3h12',
    'Meias de lã tricotadas à mão', 'Livro sem capa, com frases sublinhadas a lápis',
    'Sabonete ainda no papel, guardado como um tesouro', 'Um único brinco — o par ficou com alguém',
  ],
  trabalho: ['Ferramentas envoltas em pano oleoso', 'Luvas de solda gastas', 'Carta de recomendação amassada e reamassada', 'Botas de trabalho com a sola remendada com arame'],
  tratamento: ['Frascos de remédio quase vazios', 'Radiografia em envelope pardo', 'Receita médica dobrada em oito', 'Óculos de leitura com uma das hastes presa por barbante'],
  visita: ['Presente embrulhado (o papel foi aberto e refeito)', 'Bolo de mel envolto em pano de prato', 'Maço de cartas amarrado com barbante', 'Um brinquedo de corda que ainda funciona — e ninguém para dar'],
  estudo: ['Livros didáticos de segunda mão', 'Caderno novo com a primeira página arrancada', 'Um diploma enrolado num tubo, com o nome raspado'],
  imigracao: ['A chave de uma porta que não existe mais', 'Escritura de uma casa vendida às pressas', 'Álbum de fotografias completo, pesado demais para quem viaja leve', 'Um punhado de terra amarrado num lenço'],
  transito: ['Quase nada: uma muda de roupa', 'Mapa com uma rota marcada a lápis — e outra, apagada', 'Uma foto 3x4 sobrando, sem documento para colar'],
};
const BAG_ONEWAY = { fid: 'bag.oneway', txt: 'Passagem de trem — SÓ IDA', desc: 'Comprada há três dias. Não há passagem de volta em lugar nenhum desta bagagem.' };
const BAG_CONTRABAND = [
  'Frascos sem rótulo com líquido âmbar', 'Maço de passaportes EM BRANCO',
  'Peças metálicas que, montadas, deixariam de ser inocentes', 'Carimbo oficial do Ministério — que não deveria estar aqui',
];
const BAG_HERRINGS = [
  'Roupas masculinas na mala de uma viajante — (fuga? luto? não é crime)',
  'Brinquedos infantis — e nenhuma criança na viagem',
  'Aliança guardada na caixinha, não no dedo',
  'Diário com as últimas dez páginas arrancadas',
  'Uniforme militar dobrado no fundo — sem insígnias',
  'Um molho de chaves de portas que ninguém aqui reconhece',
  'Duas alianças idênticas — e a pessoa veio sozinha',
];

/* ---------- RÁDIO DIEGÉTICA (3 emissoras + estática) ---------- */
const RADIO = {
  republica: [
    '[ESTATAL] O ministro pede calma e confiança nos processos de triagem.',
    '[ESTATAL] Previsão do tempo: frio, com possibilidade de mais frio.',
    '[LIVRE] Análise: o que o governo não diz sobre as filas do posto leste.',
    '[LIVRE] Esportes: Valgrado empata em casa; a torcida culpa o juiz. Ou um substituto do juiz.',
    '[CLANDESTINA] …se está ouvindo isto, o térmico do posto 7 está descalibrado desde terça…',
    '[ESTATAL] Música: "Manhãs de Ostra Velha", com a Orquestra Nacional.',
    '[LIVRE] Entrevista: "falso positivo destruiu minha família", diz operário.',
    '[LIVRE] Cartas dos ouvintes: "meu vizinho voltou de viagem estranho". Encaminhamos ao Instituto. Não responderam.',
    '[CLANDESTINA] …conta os dedos. sempre conta os dedos. às vezes é tudo que a gente tem…',
    '[LIVRE] Coluna "Aprenda a Ver": o retrato mente devagar; o rosto, ao vivo, mente rápido. Compare os dois.',
    '[CLANDESTINA] …um lado da cara nunca é igualzinho ao outro. quando batem certo demais, desconfia…',
    '[ESTATAL] Comunicado: a fila é um privilégio, cidadão. Agradeça a fila.',
    '[LIVRE] Economia: o pão subiu de novo. O Ministério respondeu subindo a definição de "pão".',
    '[CLANDESTINA] …o olho deles brilha seco. olho de gente reflete úmido; repara na luz da lâmpada…',
  ],
  mehrvolk: [
    '[ESTATAL] Hoje celebramos mais uma semana de PUREZA e ORDEM.',
    '[ESTATAL] Aprendam com as crianças da Escola 4: "Quem cala, protege!"',
    '[ESTATAL] O Instituto confirma: os indicadores funcionam. Os números não serão divulgados.',
    '[CLANDESTINA] …os números vazaram: nove inocentes por captura. repasse antes que cortem…',
    '[CLANDESTINA] …não usem as palavras deles. "substituído" é uma palavra deles…',
    '[ESTATAL] Marcha "Filhos do Amanhã Limpo" — a pedido dos ouvintes. De todos eles.',
    '[ESTATAL] Novo horário do juramento: 21h. A ausência é anotada. A presença também.',
    '[CLANDESTINA] …se o pescoço mostra a costura, não hesita. eles contam com a sua hesitação…',
    '[ESTATAL] Lembrete: relatar um vizinho é um gesto de amor à Pátria. E o amor, cidadão, é obrigatório.',
    '[CLANDESTINA] …pele boa demais é pele que fecharam. procura o brilho errado, o de cera, não o de suor…',
    '[ESTATAL] O cidadão modelo desta semana denunciou a própria mãe. Repita o gesto com orgulho.',
    '[CLANDESTINA] …a resposta sai rápida demais e certa demais. gente de verdade gagueja no medo…',
  ],
  conselho: [
    '[ESTATAL] Trabalhadores: os "Alternados" eram o medo que o capital vendia. Sigam produzindo.',
    '[ESTATAL] A cota de otimismo desta semana foi CUMPRIDA.',
    '[CLANDESTINA] …o laboratório da Usina 9 recebeu caminhões de novo esta noite…',
    '[ESTATAL] Informe: o açúcar voltará às prateleiras quando você merecer. Correção: quando houver estoque.',
    '[CLANDESTINA] …eles trocaram a bandeira do prédio, não o que acontece no porão…',
    '[ESTATAL] A História foi revisada para a sua conveniência. Descarte as edições anteriores da sua memória.',
    '[CLANDESTINA] …a família do quarto ao lado não projeta sombra sob a lâmpada. repara da próxima vez…',
    '[ESTATAL] Produtividade é felicidade. A felicidade será medida ao fim do turno, e comparada com a de ontem.',
    '[CLANDESTINA] …repara quem não pisca. a gente pisca sem pensar; eles precisam lembrar de piscar…',
    '[ESTATAL] Racionamento é solidariedade, trabalhador. Quem tem fome tem, ao menos, companhia.',
    '[CLANDESTINA] …a mão fria não é do frio. aperta a mão deles e conta até três — o calor não vem…',
  ],
  colapso: [
    '‹estática›',
    '‹estática, e por baixo dela, quase uma voz›',
    '[?] …alguém aí? câmbio… …alguém… câmbio…',
    '‹o hino antigo, tocando sozinho, em loop, num estúdio vazio›',
    '[?] …não abram para quem já mora com vocês… ‹corte›',
    '[?] …se você ainda conta as batidas do coração de quem ama… continua contando… ‹corte›',
    '‹uma voz lendo nomes, devagar, sem parar. o seu ainda não veio›',
    '[?] …os que você deixou passar lembram do seu rosto. só do seu… ‹corte›',
    '‹alguém respira do outro lado do rádio. está esperando você desligar primeiro›',
  ],
};

/* ---------- EVENTOS DA FILA (durante o turno) ---------- */
const QUEUE_EVENTS = [
  { t: 'Uma mulher desmaiou na fila. Os guardas afastam os curiosos com a coronha.', delay: 10 },
  { t: 'Discussão lá fora. Um nome gritado três vezes. Depois, um silêncio pior que o grito.', delay: 0 },
  { t: 'Um vendedor de pão quente passa pela fila. Por um minuto, todo mundo parece gente de novo.', delay: 0 },
  { t: 'Alguém tentou furar a fila. A própria fila resolveu. Os guardas nem se mexeram.', delay: 8 },
  { t: 'Uma criança na fila acena para você. A mãe abaixa o braço dela devagar, sem tirar os olhos do guichê.', delay: 0 },
  { t: 'Duas pessoas na fila trocaram de casaco discretamente. Você viu. Você acha que viu.', delay: 0 },
  { t: 'Um velho desistiu. Dobrou os documentos com cuidado de quem dobra uma bandeira e foi embora.', delay: 0 },
  { t: 'A fila inteira olhou para o mesmo ponto do céu ao mesmo tempo. Você não viu nada lá. A fila voltou a olhar para frente.', delay: 6 },
  { t: 'Um guarda novo pergunta ao antigo se "é sempre assim". O antigo não responde. É sempre assim.', delay: 0 },
  { t: 'Alguém na fila repete os próprios documentos em voz baixa, de novo e de novo, como uma reza esquecida no meio.', delay: 0 },
  { t: 'Um homem encara o próprio reflexo no vidro do posto por tempo demais. Depois pede desculpa ao reflexo, baixinho.', delay: 6 },
];

/* ---------- CIDADES/CLIMA flavor da fila ---------- */
const QUEUE_CHATTER = [
  '"…três dias nessa fila…"', '"…dizem que o scanner morde…"', '"…meu primo passou ontem…"',
  '"…ela não era ela, eu juro…"', '"…vendo pão, meia ostra…"', '"…não olha nos olhos dele…"',
  '"…o inspetor de sexta é pior…"', '"…açúcar. eles odeiam açúcar…"', '"…quieto, tem gente ouvindo…"',
  '"…não conta os dedos dele. conta os SEUS…"', '"…a fila de ontem sumiu inteira. inteira…"',
  '"…leva o casaco mais grosso. lá dentro é pior…"', '"…se ele pedir pra sorrir, não sorri de mais…"',
];

/* ---------- REDE SOCIAL INVISÍVEL: boatos sobre ESTE inspetor ---------- */
/* O mundo lembra como você decide. Puramente atmosférico — nunca afeta scanner,
   nervosismo ou qualquer sinal de jogo, só o que a fila cochicha sobre você. */
const REPUTATION_CHATTER = {
  corrupto: [
    '"…esse aqui tem preço, já ouvi dizer…"',
    '"…leva um envelope certinho e ele nem lê o resto…"',
    '"…psiu. sabe quanto custa esse guichê? eu sei…"',
    '"…disseram que ele já deixou passar gente por menos que isso…"',
  ],
  cruel: [
    '"…esse aqui não solta ninguém, nem quando devia…"',
    '"…prenderam meu vizinho semana passada. foi esse guichê…"',
    '"…evita olhar pra ele. evita olhar mesmo…"',
    '"…dizem que já detém sem prova nenhuma…"',
  ],
  protetor: [
    '"…psiu. dizem que esse ajuda, se souber pedir do jeito certo…"',
    '"…minha prima passou por aqui. disse que ele "esqueceu" de olhar a bagagem dela…"',
    '"…esse guichê é seguro, dizem. mas fala baixo…"',
    '"…não sei se é bondade ou descuido. mas agradeço os dois…"',
  ],
  implacavel: [
    '"…esse aí rejeita quase tudo, nem que os papéis estejam certos…"',
    '"…melhor nem tentar a sorte com esse guichê…"',
    '"…ele lê cada linha. CADA linha…"',
    '"…esse não erra. ou não admite que erra…"',
  ],
};
