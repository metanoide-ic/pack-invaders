import { useEffect } from 'react';
import { useData } from './dataStore';
import { useSettings } from './settingsStore';
import { onApproved, onRejected } from './automations';

/** Decisão que o conector entendeu a partir de uma mensagem no grupo. */
interface Decision {
  postId: string;
  decisao: 'aprovado' | 'alteracao';
  texto: string;
  quando: number;
}

/** Endereço base do conector, a partir do endereço do webhook. */
export function connectorBase(url: string): string {
  return url.trim().replace(/\/+$/, '').replace(/\/webhook$/, '');
}

/**
 * Busca no conector as respostas que o grupo já deu e aplica cada uma:
 * aprovação publica (ou agenda) o post, pedido de alteração manda o post
 * para "Alteração" com o texto do cliente registrado.
 *
 * O conector entrega cada decisão uma única vez, então não há risco de
 * aplicar a mesma resposta duas vezes.
 */
export async function pullDecisions(): Promise<number> {
  const { connectorUrl } = useSettings.getState();
  if (!connectorUrl) return 0;

  let lista: Decision[] = [];
  try {
    const res = await fetch(`${connectorBase(connectorUrl)}/decisoes`);
    const data = await res.json();
    if (!data?.ok) return 0;
    lista = data.decisoes ?? [];
  } catch {
    return 0; // conector fechado: silencioso de propósito, isso roda em laço
  }

  const posts = useData.getState().posts;
  let aplicadas = 0;

  for (const d of lista) {
    if (!posts.some((p) => p.id === d.postId)) continue;
    if (d.decisao === 'aprovado') await onApproved(d.postId);
    else onRejected(d.postId, d.texto || 'O cliente pediu alteração no grupo.');
    aplicadas++;
  }
  return aplicadas;
}

const INTERVALO = 20_000;

/** Mantém a plataforma ouvindo as respostas do grupo enquanto estiver aberta. */
export function useApprovalInbox(): void {
  const connectorUrl = useSettings((s) => s.connectorUrl);

  useEffect(() => {
    if (!connectorUrl) return;
    let vivo = true;

    async function ciclo() {
      if (!vivo || document.hidden) return;
      await pullDecisions();
    }

    void ciclo();
    const id = setInterval(ciclo, INTERVALO);
    return () => { vivo = false; clearInterval(id); };
  }, [connectorUrl]);
}
