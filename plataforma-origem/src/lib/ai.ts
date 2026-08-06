import type { Post, Client } from './types';
import { useSettings } from './settingsStore';

const HOOKS = [
  'Para sua marca,',
  'Chegou a hora:',
  'A real é a seguinte:',
  'Sabe o que separa quem cresce de quem estagna?',
  'Estratégia não é sorte.',
];

const CTAS = [
  'Comenta “EU QUERO” que a gente te chama. 🚀',
  'Chama no direct e vamos tirar do papel. 💬',
  'Salva esse post pra não esquecer. 🔖',
  'Marca aquele sócio que precisa ver isso. 👇',
  'Bora crescer junto? Fala com a gente. ✨',
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function hashados(platform?: string): string {
  const base = ['#marketing', '#estrategia', '#origem', '#resultado', '#conteudo'];
  if (platform === 'Instagram') base.push('#instagram', '#socialmedia');
  if (platform === 'TikTok') base.push('#tiktokbrasil', '#viral');
  if (platform === 'LinkedIn') base.push('#negocios', '#b2b');
  return base.slice(0, 6).join(' ');
}

/** Gerador local — grátis e ilimitado, sem rede. */
export function templateCopy(post: Post, client?: Client): string {
  const seed = post.title.length + (post.createdAt % 97);
  const marca = client?.name ? ` da ${client.name}` : '';
  const hook = pick(HOOKS, seed);
  const cta = pick(CTAS, seed + 3);
  const tema = post.title.replace(/[.:-].*$/, '').trim();

  return (
    `${hook} ${tema}${marca} é sobre transformar ideia em resultado. ✨\n\n` +
    `Na Origem, a gente une estratégia, criatividade e execução pra sua marca ` +
    `aparecer do jeito certo, pra pessoa certa, na hora certa.\n\n` +
    `${cta}\n\n${hashados(post.platform)}`
  );
}

function buildPrompt(post: Post, client?: Client, brandVoice?: string): string {
  return (
    `Você é redator publicitário da agência Origem. Escreva a LEGENDA (copy) de um post.\n` +
    `Tom de voz da marca: ${brandVoice || 'moderno, direto e confiante'}.\n` +
    `Plataforma: ${post.platform}.\n` +
    `Cliente: ${client?.name || 'Origem'}.\n` +
    `Tema do post: ${post.title}.\n` +
    (post.notes ? `Observações: ${post.notes}.\n` : '') +
    `Regras: português do Brasil, gancho forte na 1ª linha, no máximo 3 emojis, ` +
    `chamada para ação no fim e 5 a 7 hashtags relevantes. Devolva apenas a legenda.`
  );
}

/**
 * Gera a copy do post. Usa a IA configurada (endpoint compatível com OpenAI)
 * quando disponível; caso contrário, usa o gerador local grátis.
 */
export async function generateCopy(post: Post, client?: Client): Promise<string> {
  const s = useSettings.getState();
  if (s.aiMode !== 'api' || !s.aiKey || !s.aiEndpoint) {
    return templateCopy(post, client);
  }
  try {
    const res = await fetch(s.aiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${s.aiKey}`,
      },
      body: JSON.stringify({
        model: s.aiModel,
        messages: [
          { role: 'system', content: 'Você é um redator publicitário sênior.' },
          { role: 'user', content: buildPrompt(post, client, s.brandVoice) },
        ],
        temperature: 0.8,
        max_tokens: 400,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Resposta vazia da IA');
    return text.trim();
  } catch (e) {
    // Fallback garantido: nunca deixa o usuário sem copy.
    return templateCopy(post, client) + `\n\n— (gerado localmente; IA indisponível: ${(e as Error).message})`;
  }
}
