import type { Board, Client, ServiceArea, WeeklyPlan, WorkspaceData } from './types';
import { uid } from './utils';

/**
 * Base inicial da agência: a carteira real de clientes, com briefing e
 * cadência semanal já preenchidos.
 *
 * Não há dados de exemplo aqui. Quadros, posts, vídeos e financeiro nascem
 * vazios, para a equipe começar a trabalhar em cima do que é de verdade.
 */

/** Dias da semana: 1 = segunda ... 5 = sexta. */
const SEG = 1, TER = 2, QUA = 3, QUI = 4, SEX = 5;

/** Municípios do Sul Fluminense atendidos pelos clientes regionais. */
const SUL_FLUMINENSE = [
  'Barra Mansa', 'Volta Redonda', 'Resende', 'Barra do Piraí', 'Piraí',
  'Valença', 'Pinheiral', 'Quatis', 'Porto Real', 'Itatiaia', 'Rio Claro',
];

interface Entrada {
  nome: string;
  cor: string;
  briefing: string;
  cadencia: WeeklyPlan;
  area: ServiceArea;
  cidades?: string[];
  /** Observação de operação, quando o combinado foge do padrão. */
  nota?: string;
}

const CARTEIRA: Entrada[] = [
  {
    nome: 'Banco Omni',
    cor: '#2563eb',
    area: 'nacional',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Post'] },
    briefing:
      'Financeira focada em financiamento e refinanciamento de carros, motos e caminhões, com mais de 30 anos e presença em mais de 100 cidades. Trabalha por uma rede de Agentes Omni, correspondentes bancários espalhados pelo Brasil: o mesmo conteúdo serve para todos os agentes, e só feirões e ações locais pedem peça exclusiva. Comunicação popular, comercial e voltada à conversão. Azul royal, branco e laranja, com veículos, pessoas reais, movimento e headlines curtas de grande impacto. Pautas recorrentes: feirões, ações em loja, refinanciamento, Plano Renova, campanhas sazonais e material para correspondentes e lojistas.',
    nota: 'Conteúdo único para todos os agentes. Os agentes ficam em praças diferentes, inclusive em outros estados, então feirão e ação local entram como peça extra com a cidade daquele agente.',
  },
  {
    nome: 'Vidroscar',
    cor: '#06b6d4',
    area: 'regiao',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Foto'] },
    briefing:
      'Para-brisas, vidros automotivos, insulfilm e higienização e manutenção de ar-condicionado automotivo. Visual moderno e técnico: azul escuro, azul claro e ciano, laranja pontual, carros valorizados e estética limpa, sem aparência artificial. O conteúdo parte de problemas reais do motorista: vidro trincado ou quebrado, segurança, insulfilm, ar-condicionado. Objetivo principal é gerar contato.',
  },
  {
    nome: 'Rede de Postos Margarida',
    cor: '#16a34a',
    area: 'regiao',
    cadencia: { [SEG]: ['Post'], [QUA]: ['Vídeo'], [SEX]: ['Post'] },
    briefing:
      'Rede de postos de combustíveis com comunicação popular, próxima, voltada ao motorista e à família. Verde vibrante, amarelo e branco, com vermelho nos preços; campanhas específicas podem ganhar um tratamento mais premium. Destaques: qualidade dos combustíveis, economia, confiança, estrada e o diferencial do Diesel S10 aditivado.',
    nota: 'Segunda é o post da Terça da Sorte, a promoção da rede. Antes de produzir, perguntar ao cliente o valor da semana. Quarta e sexta alternam vídeo e post.',
  },
  {
    nome: 'Carpintaria Meirelles',
    cor: '#0f766e',
    area: 'regiao',
    cadencia: { [TER]: ['Vídeo'], [QUI]: ['Post'] },
    briefing:
      'Carpintaria e marcenaria, principalmente portas, janelas e projetos sob medida. Identidade sofisticada e artesanal: verde escuro e petróleo, verde turquesa, branco e tons naturais de madeira. A comunicação valoriza acabamento, qualidade, tradição, trabalho bem-feito, personalização e o cuidado de cada projeto.',
  },
  {
    nome: 'Barra Escap Autocenter',
    cor: '#eab308',
    area: 'cidade',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Post'] },
    briefing:
      'Centro automotivo: escapamento, pneus, óleo, alinhamento, balanceamento, suspensão, freios e manutenção preventiva. Alto impacto em preto e grafite, amarelo e dourado, branco, com referências a asfalto, pneu, metal e oficina. O conteúdo mistura oferta agressiva, diagnóstico de problema, educação automotiva e chamada direta para levar o veículo à oficina.',
  },
  {
    nome: 'Start Car',
    cor: '#1e40af',
    area: 'regiao',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Post'] },
    briefing:
      'Loja multimarcas de veículos, comunicação jovem, comercial e orientada à venda. Azul escuro, branco e amarelo, com mascote presente e grande destaque para os veículos e as condições comerciais. Campanhas de oferta, aniversário da loja, oportunidades especiais, datas comemorativas e argumentos para acelerar a decisão de compra.',
    nota: 'Os dois posts da semana são de veículos, usando os carros que o cliente manda no grupo.',
  },
  {
    nome: 'RPM Veículos',
    cor: '#3b82f6',
    area: 'regiao',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Post'] },
    briefing:
      'Segmento automotivo, vendas e campanhas com carros e motos. Azul royal, branco e ciano, veículos em cenário urbano ou rodoviário, comunicação dinâmica. Além do comercial, produzimos campanhas internas de metas, premiações, vouchers e peças comemorativas.',
    nota: 'Os dois posts da semana são de veículos, usando os carros que o cliente manda no grupo.',
  },
  {
    nome: 'Connecta Telesaúde Digital',
    cor: '#14b8a6',
    area: 'nacional',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Post'] },
    briefing:
      'Telemedicina com consultas online, proposta de tornar o atendimento médico acessível e prático. Identidade clara e moderna: branco, azul e turquesa, verde-limão e azul escuro, com médicos, pacientes e celulares. A comunicação destaca atendimento online, praticidade, preço acessível, disponibilidade 24h e os benefícios dos planos individuais e empresariais.',
  },
  {
    nome: 'AH-I Entertainment',
    cor: '#22d3ee',
    area: 'regiao',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Post'] },
    briefing:
      'Provedor de internet com posicionamento jovem e tecnológico, ligado a games, streaming, conectividade e vida digital. Estética tech e gamer: base escura, ciano, azul, amarelo e toques neon, com as peças sempre iluminadas e modernas. Pautas: estabilidade, velocidade, Wi-Fi, vários dispositivos ao mesmo tempo, situações do dia a dia e motivos para trocar de provedor.',
  },
  {
    nome: 'Nascimento & Nascimento Advogados',
    cor: '#155e75',
    area: 'estado',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Post'] },
    briefing:
      'Escritório jurídico tradicional, cerca de 40 anos de atuação, forte em direito previdenciário e causas de servidores. Identidade premium e institucional: azul-petróleo escuro, branco e detalhes dourados e bege. Pautas: INSS, aposentadoria, professores, piso do magistério, paridade, imposto de renda, benefícios negados e direitos pouco conhecidos.',
  },
  {
    nome: 'Grupo 3D Empreendimentos',
    cor: '#475569',
    area: 'regiao',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Post'] },
    briefing:
      'Grupo imobiliário com atuação integrada em gestão, locação, engenharia, design, reformas e valorização de patrimônio. Identidade premium, clean e sofisticada: azul-petróleo, grafite, slate, cinza e branco, com pouca poluição visual. A comunicação transmite autoridade e segurança para proprietários e investidores, e busca captar imóveis para gestão e locação.',
  },
  {
    nome: 'Concreblocos & Lajes',
    cor: '#f97316',
    area: 'regiao',
    cidades: SUL_FLUMINENSE,
    cadencia: { [TER]: ['Vídeo'], [QUI]: ['Post'] },
    briefing:
      'Construção civil: lajes, pré-moldados e soluções estruturais para obra. Azul royal, amarelo e laranja, branco, com prioridade para foto real, headline forte e linguagem profissional acessível. O conteúdo mistura obras realizadas, bastidores, orientação técnica, logística, autoridade e campanhas comerciais regionais.',
  },
  {
    nome: 'Dra. Elba Ferrão',
    cor: '#f472b6',
    area: 'cidade',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Foto'] },
    briefing:
      'Médica oftalmologista, comunicação educativa, elegante, baseada em prevenção e cuidado com a visão. Identidade delicada e premium: branco, bege, rosé e coral, com imagens humanas ou elementos ligados aos olhos e à visão. Pautas: sintomas, curiosidades, novas tecnologias da oftalmologia, prevenção, exames e assuntos que despertam curiosidade.',
  },
  {
    nome: 'Dra. Lara',
    cor: '#a8a29e',
    area: 'cidade',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Post'] },
    briefing:
      'Odontologia com posicionamento em atendimento humano, acolhimento e confiança. Visual minimalista, elegante e profissional, com prioridade para fotos reais da própria profissional e layouts com bastante respiro. A comunicação aproxima paciente e dentista: cuidado, escuta, segurança e experiência no atendimento.',
  },
  {
    nome: 'Sicomércio Barra Mansa',
    cor: '#1d4ed8',
    area: 'cidade',
    cidades: ['Barra Mansa'],
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Post'] },
    briefing:
      'Entidade representativa do comércio de Barra Mansa, comunicação institucional voltada aos comerciantes e à valorização da economia local. Linha profissional e institucional, que pode ganhar tom mais comercial em campanhas promocionais. Trabalhamos datas comemorativas, ações como Amor Premiado e mensagens incentivando o consumidor a prestigiar o comércio da cidade.',
  },
  {
    nome: 'BT Veículos',
    cor: '#dc2626',
    area: 'regiao',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Post'] },
    briefing:
      'Loja de veículos com campanhas comerciais ligadas a feirões e condições especiais de financiamento. Visual automotivo, forte e promocional, com os carros em destaque, chamada objetiva e benefício claro. Campanhas já feitas: desconto no pátio, transferência, tanque cheio, datas especiais e ações em parceria com financiamento.',
    nota: 'Os dois posts da semana são de veículos, usando os carros que o cliente manda no grupo.',
  },
  {
    nome: 'Kbral Park e Kbral Kids',
    cor: '#d946ef',
    area: 'regiao',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Foto'], [SEX]: ['Foto'] },
    briefing:
      'Entretenimento infantil e familiar: experiências, festas, brinquedos, crianças e alimentação. A comunicação precisa transmitir diversão de forma real, mostrando crianças usando o espaço e famílias aproveitando o ambiente. A produção prioriza criança brincando, comida pronta, momento em família e cena espontânea que mostre a experiência. Conferir os perfis no Instagram antes de cada planejamento, para acompanhar atrações e novidades da temporada.',
    nota: 'As duas entregas semanais são fotos, não artes.',
  },
  {
    nome: 'Mastermax Contabilidade',
    cor: '#0284c7',
    area: 'regiao',
    cadencia: { [TER]: ['Vídeo'], [QUA]: ['Post'], [SEX]: ['Post'] },
    briefing:
      'Escritório de contabilidade com comunicação educativa e estratégica para empresas, empreendedores, MEIs e pessoas com CNPJ. Visual profissional e corporativo. O conteúdo precisa simplificar assunto complexo sem perder autoridade. Pautas: CNPJ, MEI, tributação, Reforma Tributária, erros fiscais, suspensão de empresas e decisões importantes para o empresário.',
  },
  {
    nome: 'Mega Móveis',
    cor: '#9333ea',
    area: 'regiao',
    cadencia: {},
    briefing:
      'Loja de móveis com posicionamento muito comercial e popular, baseado em oferta, condição de pagamento e grandes campanhas promocionais. A identidade das ofertas usa roxo, magenta, laranja e amarelo, com produto grande e hierarquia forte para preço e parcelamento. Campanhas como Aniversário da Patroa, ofertas especiais, datas comemorativas e peças diretas para venda imediata.',
    nota: 'Sem cadência fixa. As demandas chegam pelo grupo e entram como avulsas, então este cliente fica de fora do planejamento automático.',
  },
  {
    nome: 'Barra Travel',
    cor: '#0891b2',
    area: 'regiao',
    cadencia: { [TER]: ['Vídeo'], [QUI]: ['Post'] },
    briefing:
      'Agência de viagens com pacotes nacionais e internacionais, hospedagem, passagem e experiências. A comunicação valoriza visualmente o destino, mantendo aparência profissional e aspiracional, com a informação comercial bem organizada. Produzimos divulgação de pacotes completos, condições de parcelamento, campanhas sazonais e destinos como Chile e Nova York.',
  },
  {
    nome: 'Camisaria Pinguim',
    cor: '#334155',
    area: 'cidade',
    cadencia: { [TER]: ['Vídeo'], [QUI]: ['Foto'] },
    briefing:
      'Camisaria masculina com mix que inclui moda, ternos, carteiras, garrafas, bolsas, mochilas, malas, nécessaires e pastas. Comunicação comercial: valorizar produto, variedade, preço e oportunidade de compra sem sobrecarregar o layout. Conteúdos de vídeo de produto, campanhas de moda e ofertas, como ternos a partir de R$ 495.',
    nota: 'A entrega semanal costuma ser foto, não arte.',
  },
];

export function seedData(): WorkspaceData {
  const clients: Client[] = CARTEIRA.map((c) => ({
    id: uid('cli'),
    name: c.nome,
    color: c.cor,
    briefing: c.briefing + (c.nota ? `\n\nCombinado de operação: ${c.nota}` : ''),
    weeklyPlan: c.cadencia,
    serviceArea: c.area,
    // Só entra cidade onde há certeza. As demais ficam em branco de propósito:
    // chutar a praça erra o aniversário da cidade no planejamento, e a tela de
    // Clientes mostra quem ainda está sem preencher.
    cities: c.cidades,
    createdAt: Date.now(),
  }));

  const board: Board = {
    id: uid('board'),
    name: 'Produção de Conteúdo',
    description: 'Fluxo geral de demandas criativas da agência.',
    columns: [
      { id: uid('col'), title: 'A fazer', cardIds: [] },
      { id: uid('col'), title: 'Em produção', cardIds: [] },
      { id: uid('col'), title: 'Revisão', cardIds: [] },
      { id: uid('col'), title: 'Prontos', cardIds: [] },
      { id: uid('col'), title: 'Concluído', cardIds: [] },
    ],
    cards: {},
    createdAt: Date.now(),
  };

  return {
    clients,
    boards: [board],
    transactions: [],
    posts: [],
    videos: [],
    library: [],
    events: [],
    charges: [],
    campaigns: [],
  };
}
