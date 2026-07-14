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
    cities: ['Tarangrad', 'Usina 9', 'Colet iva Norte', 'Planalto Vermelho'],
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
  21: { h: 'JORNALISTA DESAPARECE APÓS REPORTAGEM', b: 'Vela Odim, autora da série "Os Falsos Positivos", está desaparecida há três dias. O governo afirma que ela "viajou por vontade própria". Colegas afirmam que sua casa foi revirada. A LumenCorp negou comentar os erros do VERITAS-9 citados na reportagem.', m: ['Cartazes novos: "Quem cala, protege."', 'Pão racionado: 1 unidade por família.'] },
  24: { h: 'CIENTISTAS CONTESTAM A FENOTIPIA — E SÃO PRESOS', b: 'Quatorze pesquisadores assinaram carta afirmando que "nenhuma característica física define um Alternado". Foram detidos por "sabotagem epistemológica". Universidades entram em greve. O governo responde: "A ciência do inimigo também é inimiga."', m: ['Fila do posto leste bate recorde.', 'Inverno chega mais cedo.'] },
  27: { h: 'EXPLOSÃO NA ESTAÇÃO CENTRAL: 31 MORTOS', b: 'Um atentado destruiu a Estação Central de Valgrado. O governo culpa a resistência. A resistência culpa "agentes do próprio regime". Um sobrevivente jura que viu o autor "sorrir com a boca errada". Ninguém sabe o que isso significa. Ninguém pergunta duas vezes.', m: ['Luto oficial de três dias.', 'Trens suspensos.'] },
  30: { h: 'GOLPE: CONSELHO POPULAR TOMA O PODER', b: 'Unidades do exército derrubaram o governo Mehrvolk durante a madrugada. O Conselho Popular declara que "os Alternados são uma invenção do capital para disciplinar trabalhadores". Os laboratórios estatais, however, seguem funcionando — agora sob nova bandeira. Todos os documentos antigos exigem revalidação.', m: ['Estátuas derrubadas antes do café.', 'Novo hino. Decorar até sexta.'] },
  33: { h: 'EX-AGENTES DO REGIME VIRAM "ELEMENTOS INDESEJÁVEIS"', b: 'Funcionários do governo anterior tentam deixar o país em massa. O Conselho promete julgamentos populares. Nas filas, ninguém mais sabe qual carimbo é o certo — e o Conselho também não. Um inspetor foi preso por aplicar a lei da semana passada.', m: ['Açúcar desaparece dos mercados.', 'Boato: "Alternados não suportam açúcar." Falso. Talvez.'] },
  37: { h: 'O SCANNER OFICIAL ERA DEFEITUOSO, ADMITE MINISTÉRIO', b: 'Após seis dias de triagem obrigatória por detector biológico, o Conselho admite que 40% das unidades estavam descalibradas. Volta a valer a carteira sanitária — a mesma que o decreto anterior chamou de "papel inútil". As pessoas na fila riem. Depois choram.', m: ['LumenCorp transfere sede para Linestan.', 'Apagões programados: 4h por dia.'] },
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
  { h: 'MERCADO NEGRO VENDE "VACINA ANTI-ALTERNADO"', b: 'Frascos apreendidos continham água, açúcar e corante. Três mortos por injeção contaminada. A demanda, however, triplicou após a apreensão.' },
  { h: 'CRIANÇA PERGUNTA EM REDE NACIONAL: "COMO SEI QUE MAMÃE É MAMÃE?"', b: 'O apresentador não soube responder. O programa foi cortado para o hino. O trecho circula em fitas clandestinas.' },
];

const ADS = [
  'VERITAS-9 — porque sua família merece a verdade. (LumenCorp)',
  'Café Fronteira — aberto mesmo durante apagões.',
  'Formulário 77-B: agora com apenas 9 páginas!',
  'Aulas de caligrafia oficial. Assine como um patriota.',
  'Compra-se ouro, relógios e memórias de família. Beco do Sal, 3.',
  'Perdeu seus documentos? A fila do Cartório começa às 4h.',
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
  18: {
    id: 'elara3', nome: 'Elara Venn', pais: 'kranton', sexo: 'f', etnia: 'nulio',
    profissao: 'professora', motivo: 'visita', valid: false, forcedMissing: 'sanitaria',
    fala: 'Estou grávida. O pai ficou do outro lado. Eu só quero atravessar antes que… antes que inventem mais um papel que eu não tenho. Não tenho a carteira sanitária. O posto médico da minha cidade FECHOU. Como eu apresento um papel de um lugar que não existe mais?',
  },
  21: {
    id: 'odim', nome: 'Vela Odim', pais: 'osteria', sexo: 'f', etnia: 'osano',
    profissao: 'jornalista', motivo: 'transito', valid: true,
    fala: 'Estou escrevendo sobre os postos de triagem. Sobre quantos "positivos" eram só gente doente, nervosa ou azarada. Uma pergunta, inspetor, sem caneta na mão: o senhor já teve certeza de alguma coisa aqui dentro? Uma única vez?',
  },
  24: {
    id: 'elara4', nome: 'Elara Venn', pais: 'kranton', sexo: 'f', etnia: 'nulio',
    profissao: 'costureira', motivo: 'imigracao', valid: false, forcedDisc: 'nameMismatch',
    fala: 'O senhor de novo. Que sorte a minha. — Ela não sorri mais. — Está tudo em ordem dessa vez. Tudo. Pode olhar o quanto quiser.',
  },
  33: {
    id: 'dmarov2', nome: 'Radek Dmarov', pais: 'osteria', sexo: 'm', etnia: 'osano',
    profissao: 'desempregado', motivo: 'imigracao', valid: false, forcedDisc: 'numberMismatch',
    fala: 'Sem farda fica difícil me reconhecer, é? O Conselho está prendendo todo mundo que serviu antes. TODO MUNDO. Você inclusive está na lista, mais cedo ou mais tarde. Me deixa passar e eu esqueço seu nome quando perguntarem.',
  },
  38: {
    id: 'mercador', nome: 'Sorenn Ledger', pais: 'linestan', sexo: 'm', etnia: 'osano',
    profissao: 'comerciante', motivo: 'trabalho', valid: true,
    fala: 'Seu detector biológico está descalibrado há semanas — eu vendo o serviço de calibração. 40 ostras e ele volta a funcionar de verdade. Barato, considerando o preço de um erro. A LumenCorp me odeia, o que é sempre bom sinal.',
    vendeCalibracao: 40,
  },
  41: {
    id: 'elara5', nome: 'Elara Venn', pais: 'kranton', sexo: 'f', etnia: 'nulio',
    profissao: 'professora', motivo: 'imigracao', valid: true, scannerAmbiguo: true,
    fala: '…O bebê nasceu. Está com a minha irmã. Eu atravesso hoje ou não atravesso nunca. — Ela olha para você como quem decora um rosto. — Engraçado. Não lembro mais se o senhor sempre foi assim. Mais velho. Diferente. A gente muda, não é? Todo mundo muda.',
  },
  44: {
    id: 'esposa', nome: 'Vessa (sua esposa)', pais: 'osteria', sexo: 'f', etnia: 'osano',
    profissao: 'arquivista', motivo: 'transito', valid: true, memoria: true,
    fala: 'Você me disse ONTEM para atravessar hoje. Na cozinha. Você segurou minhas mãos e disse "vá antes de mim, eu encontro vocês". — Você não disse isso. Você tem certeza de que não disse isso. — Por que está me olhando assim?',
  },
  47: {
    id: 'lembranca', nome: 'Havel Krantic', pais: 'kranton', sexo: 'm', etnia: 'nulio',
    profissao: 'ferroviário', motivo: 'imigracao', valid: true, memoria: true,
    fala: 'Nós já conversamos, há duas semanas. O senhor usava uma caneca azul lascada na borda. Reclamou do frio e carimbou meu passaporte duas vezes sem querer. — Você nunca viu este homem. A caneca azul está na sua mesa. Lascada na borda.',
  },
};

/* ---------- EVENTOS DE CASA ---------- */
const HOME_EVENTS = {
  4:  { texto: 'Seu filho, Tomi, acordou tossindo. Vessa acha que é o frio. Sua mãe acha que é "outra coisa" e não explica o quê.', efeito: null },
  7:  { texto: 'Tomi piorou. O médico do bairro emigrou na semana passada. O remédio custa caro na farmácia — quando tem.', efeito: 'filho_doente' },
  10: { texto: 'Vessa foi rebaixada no arquivo público: "corte de pessoal por critério de confiabilidade". Ela não te olha nos olhos ao contar.', efeito: 'renda_menor' },
  13: { texto: 'Distribuíram bandeiras novas no seu bloco. O vizinho que não pendurou a dele recebeu uma visita à noite. Hoje a bandeira dele é a maior do prédio.', efeito: null },
  17: { texto: 'Sua mãe rasgou o formulário de ancestralidade. "Eu SEI quem eu sou." Vessa colou os pedaços de madrugada, chorando baixinho para ninguém ouvir.', efeito: null },
  20: { texto: 'Tomi desenhou a família na escola. A professora elogiou — mas perguntou por que ele desenhou "papai com dois rostos". Ele não soube explicar. Você também não.', efeito: null },
  26: { texto: 'Um homem parou na frente do prédio e olhou para a sua janela por vinte minutos. Vessa anotou a hora: 21h13. Quando você olhou, não havia ninguém. Nunca houve?', efeito: null },
  31: { texto: 'O Conselho requisitou metade do seu apartamento para "uma família de trabalhadores realocados". Eles são educados. Eles são silenciosos. Eles cozinham sem cheiro.', efeito: 'aluguel_maior' },
  36: { texto: 'Sua mãe sumiu por seis horas. Voltou calma. Calma DEMAIS, diz Vessa. "Fui só andar", diz ela. Ela odeia andar. Sempre odiou. Não é?', efeito: null },
  42: { texto: 'Tomi perguntou no jantar: "Pai, se trocarem você, eu vou perceber?" Ninguém riu. Ninguém respondeu. O relógio da cozinha nunca fez tanto barulho.', efeito: null },
  45: { texto: 'Vessa fez as malas. "Quando isso acabar, a gente atravessa também. Do outro lado deve ser igual — mas pelo menos é longe." Você concorda. Concordar é mais fácil.', efeito: null },
};

/* ---------- FINAIS ---------- */
const ENDINGS = {
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
};

/* ---------- CIDADES/CLIMA flavor da fila ---------- */
const QUEUE_CHATTER = [
  '"…três dias nessa fila…"', '"…dizem que o scanner morde…"', '"…meu primo passou ontem…"',
  '"…ela não era ela, eu juro…"', '"…vendo pão, meia ostra…"', '"…não olha nos olhos dele…"',
  '"…o inspetor de sexta é pior…"', '"…açúcar. eles odeiam açúcar…"', '"…quieto, tem gente ouvindo…"',
];
