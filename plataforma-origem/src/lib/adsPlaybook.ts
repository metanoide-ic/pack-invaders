import type { AdPlatform, Campaign, CampaignFunnel, CampaignObjective } from './types';

/**
 * Números de referência do tráfego pago, por plataforma.
 *
 * Não são chutes: vêm do que cada plataforma documenta e do que o mercado
 * mede. Ficam todos aqui, num lugar só, para serem ajustados conforme a
 * agência acumular histórico próprio — o benchmark da casa sempre vale mais
 * que a média do mercado.
 */

/**
 * Câmbio aproximado usado só nos mínimos de verba, que as plataformas
 * publicam em dólar. Serve para ordem de grandeza, não para contabilidade.
 */
const USD = 5.5;

export interface PlatformRules {
  /** Eventos de conversão por semana para o algoritmo sair do aprendizado. */
  eventosAprendizado: number;
  /** Dias que o aprendizado costuma levar. */
  diasAprendizado: [number, number];
  /** Verba diária mínima que a plataforma exige ou recomenda, em reais. */
  verbaMinimaDia: number;
  /** CTR de link considerado saudável (%). Abaixo disso, o criativo pesa. */
  ctrSaudavel: number;
  /** Quanto se pode subir a verba sem reiniciar o aprendizado (%). */
  passoDeEscala: number;
  /** Dias a esperar entre dois aumentos de verba. */
  intervaloDeEscala: number;
}

export const PLATFORM_RULES: Record<AdPlatform, PlatformRules> = {
  // Meta: 50 eventos por conjunto em 7 dias para sair do aprendizado, e
  // mudanças acima de 20% na verba reiniciam a fase.
  Meta: {
    eventosAprendizado: 50,
    diasAprendizado: [7, 14],
    verbaMinimaDia: 20,
    ctrSaudavel: 1,
    passoDeEscala: 20,
    intervaloDeEscala: 3,
  },
  // Google (Performance Max): o teste recomendado começa em US$ 50 a 100 por
  // dia e o algoritmo pede semanas para amadurecer.
  Google: {
    eventosAprendizado: 30,
    diasAprendizado: [14, 42],
    verbaMinimaDia: Math.round(50 * USD),
    ctrSaudavel: 2,
    passoDeEscala: 20,
    intervaloDeEscala: 7,
  },
  // TikTok: mínimo de US$ 20 por dia por conjunto, e campanhas de conversão
  // pedem bem mais que isso para estabilizar.
  TikTok: {
    eventosAprendizado: 50,
    diasAprendizado: [10, 15],
    verbaMinimaDia: Math.round(20 * USD),
    ctrSaudavel: 1,
    passoDeEscala: 20,
    intervaloDeEscala: 3,
  },
};

/**
 * Teto de frequência por etapa do funil, medido em 7 dias. Em prospecção o
 * desempenho começa a cair passando de 2,5 e despenca perto de 4. Em
 * remarketing, com a intenção já estabelecida, 5 ainda é aceitável.
 */
export const FREQUENCIA_LIMITE: Record<CampaignFunnel, number> = {
  topo: 2.5,
  meio: 3.5,
  fundo: 5,
};

export const FUNNEL_LABEL: Record<CampaignFunnel, string> = {
  topo: 'Prospecção (quem não conhece)',
  meio: 'Consideração (já teve contato)',
  fundo: 'Remarketing (já demonstrou interesse)',
};

/** Objetivos em que faz sentido cobrar retorno em dinheiro. */
export const OBJETIVO_COM_ROAS: CampaignObjective[] = ['Vendas'];

/**
 * Verba diária mínima para a campanha conseguir sair do aprendizado dentro
 * de uma semana: custo por resultado desejado x eventos necessários / 7.
 */
export function verbaParaAprender(platform: AdPlatform, targetCpa?: number): number | undefined {
  if (!targetCpa) return undefined;
  const r = PLATFORM_RULES[platform];
  return (targetCpa * r.eventosAprendizado) / 7;
}

/** Verba diária mínima considerando o piso da plataforma e a meta de custo. */
export function verbaMinimaRecomendada(platform: AdPlatform, targetCpa?: number): number {
  const piso = PLATFORM_RULES[platform].verbaMinimaDia;
  const aprendizado = verbaParaAprender(platform, targetCpa);
  return Math.max(piso, aprendizado ?? 0);
}

export interface Playbook {
  estrutura: string;
  criativos: string;
  publico: string;
  medicao: string;
}

/** Como montar a campanha, por objetivo. O que a experiência já sabe. */
export function playbook(platform: AdPlatform, objective: CampaignObjective): Playbook {
  const base: Record<CampaignObjective, Playbook> = {
    Vendas: {
      estrutura: 'Uma campanha por oferta, poucos conjuntos. Dividir a verba em muitos conjuntos é o motivo mais comum de nunca sair do aprendizado.',
      criativos: 'De 3 a 5 criativos por conjunto, misturando formatos. Trocar o que cansou, não a campanha inteira.',
      publico: 'Começar amplo e deixar o algoritmo achar. Público muito estreito encarece o resultado sem melhorar a qualidade.',
      medicao: 'Otimizar pela compra, não por adicionar ao carrinho. Evento barato ensina a plataforma a buscar quem nunca compra.',
    },
    Leads: {
      estrutura: 'Formulário nativo converte mais barato; página própria traz lead mais qualificado. Testar os dois antes de decidir.',
      criativos: 'A oferta precisa estar clara nos 3 primeiros segundos. Falar do problema, não da empresa.',
      publico: 'Amplo com o criativo filtrando. Se vier lead ruim, apertar a pergunta do formulário antes de apertar o público.',
      medicao: 'Acompanhar o lead até a venda. Custo por lead baixo com lead que não fecha é prejuízo disfarçado.',
    },
    Mensagens: {
      estrutura: 'Campanha de mensagem só compensa com alguém respondendo rápido do outro lado. Combinar o plantão antes de subir.',
      criativos: 'Chamada direta para conversar, com a dúvida mais comum do cliente já respondida.',
      publico: 'Raio pequeno em volta do ponto de venda, quando o negócio é local.',
      medicao: 'Contar conversa iniciada e, principalmente, conversa que virou venda.',
    },
    Tráfego: {
      estrutura: 'Serve para aquecer público e testar criativo, não para vender. Se o objetivo é venda, usar campanha de venda.',
      criativos: 'Testar muitas variações baratas aqui e levar as vencedoras para a campanha de conversão.',
      publico: 'Amplo. O barato aqui é justamente o volume.',
      medicao: 'Olhar tempo na página, não só clique. Clique que sai em 2 segundos não vale nada.',
    },
    Engajamento: {
      estrutura: 'Bom para construir público de remarketing e prova social no perfil.',
      criativos: 'Conteúdo que já foi bem no orgânico costuma render mais barato aqui.',
      publico: 'Amplo, com interesse ligado ao tema do conteúdo.',
      medicao: 'Medir crescimento do público de remarketing, não curtida por curtida.',
    },
    Reconhecimento: {
      estrutura: 'Campanha de marca, resultado no médio prazo. Não cobrar venda dela.',
      criativos: 'Mensagem única e repetida. Aqui a repetição trabalha a favor, até o limite da frequência.',
      publico: 'Toda a região de atuação do cliente.',
      medicao: 'Alcance e frequência, mais busca pelo nome da marca ao longo dos meses.',
    },
  };

  const p = { ...base[objective] };

  if (platform === 'TikTok') {
    p.criativos = 'Vídeo vertical no jeito do feed: anúncio com cara de anúncio rende bem menos. Os 3 primeiros segundos decidem tudo. ' + p.criativos;
  }
  if (platform === 'Google') {
    p.estrutura = 'No Performance Max, separar produtos de margem alta e baixa em grupos diferentes, e excluir as buscas pelo nome da marca (elas já viriam de graça). ' + p.estrutura;
  }
  return p;
}

/** Monta a URL com UTMs a partir da campanha. */
export function buildUtm(c: Pick<Campaign, 'landingUrl' | 'platform' | 'name' | 'objective'>): string {
  if (!c.landingUrl) return '';
  const limpo = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  try {
    const url = new URL(c.landingUrl.startsWith('http') ? c.landingUrl : `https://${c.landingUrl}`);
    url.searchParams.set('utm_source', limpo(c.platform));
    url.searchParams.set('utm_medium', 'cpc');
    url.searchParams.set('utm_campaign', limpo(c.name));
    url.searchParams.set('utm_content', limpo(c.objective));
    return url.toString();
  } catch {
    return '';
  }
}
