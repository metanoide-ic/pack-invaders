/**
 * Conector Orikay
 *
 * Programa local que recebe os eventos da plataforma e executa as ações reais:
 * envia mensagens no WhatsApp (aprovação, cobrança, nota fiscal) e publica no
 * Instagram (feed e story). Substitui o Make.com: não precisa de mais nenhuma
 * assinatura nem de cenários montados à mão.
 *
 * Uso:  node conector.mjs      (depois abra http://localhost:8787)
 * Sem dependências: usa apenas o Node 18+.
 */

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PORT = Number(process.env.PORT || 8787);
const DIR = dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = join(DIR, 'conector.config.json');

const CONFIG_PADRAO = {
  provedor: 'zapi', // 'zapi' | 'evolution'
  zapiInstancia: '',
  zapiToken: '',
  zapiClientToken: '',
  evolutionUrl: '',
  evolutionInstancia: '',
  evolutionApiKey: '',
  igUserId: '',
  igToken: '',
};

function lerConfig() {
  if (!existsSync(CONFIG_FILE)) return { ...CONFIG_PADRAO };
  try {
    return { ...CONFIG_PADRAO, ...JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) };
  } catch {
    return { ...CONFIG_PADRAO };
  }
}

function gravarConfig(cfg) {
  writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
}

let config = lerConfig();

/** Últimos eventos processados, mostrados na tela do conector. */
const historico = [];
function registrar(tipo, texto, ok = true) {
  historico.unshift({ quando: new Date().toISOString(), tipo, texto, ok });
  historico.length = Math.min(historico.length, 40);
  const marca = ok ? 'OK ' : 'ERRO';
  console.log(`[${marca}] ${tipo}: ${texto}`);
}

/* ------------------------------ WhatsApp ------------------------------ */

function whatsappConfigurado() {
  return config.provedor === 'zapi'
    ? Boolean(config.zapiInstancia && config.zapiToken)
    : Boolean(config.evolutionUrl && config.evolutionInstancia && config.evolutionApiKey);
}

async function enviarWhatsapp(numero, mensagem) {
  if (!numero) throw new Error('sem número/grupo de destino');
  if (!whatsappConfigurado()) throw new Error('WhatsApp não configurado no conector');

  if (config.provedor === 'zapi') {
    const url = `https://api.z-api.io/instances/${config.zapiInstancia}/token/${config.zapiToken}/send-text`;
    const headers = { 'Content-Type': 'application/json' };
    if (config.zapiClientToken) headers['Client-Token'] = config.zapiClientToken;
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone: numero, message: mensagem }),
    });
    if (!res.ok) throw new Error(`Z-API respondeu ${res.status}: ${(await res.text()).slice(0, 160)}`);
    return;
  }

  const base = config.evolutionUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/message/sendText/${config.evolutionInstancia}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: config.evolutionApiKey },
    body: JSON.stringify({ number: numero, text: mensagem }),
  });
  if (!res.ok) throw new Error(`Evolution respondeu ${res.status}: ${(await res.text()).slice(0, 160)}`);
}

/* ------------------------------ Instagram ----------------------------- */

async function publicarInstagram(destino, legenda, mediaUrl) {
  if (!config.igUserId || !config.igToken) throw new Error('Instagram não configurado no conector');
  if (!mediaUrl || !/^https?:\/\//i.test(mediaUrl)) {
    throw new Error('a imagem precisa estar numa URL pública (o Instagram não aceita arquivo colado)');
  }

  const criar = new URL(`https://graph.facebook.com/v21.0/${config.igUserId}/media`);
  criar.searchParams.set('access_token', config.igToken);
  criar.searchParams.set('image_url', mediaUrl);
  if (legenda) criar.searchParams.set('caption', legenda);
  if (destino === 'story') criar.searchParams.set('media_type', 'STORIES');

  const r1 = await fetch(criar, { method: 'POST' });
  const d1 = await r1.json();
  if (!r1.ok || !d1.id) throw new Error(`Graph API (criar): ${JSON.stringify(d1).slice(0, 200)}`);

  const publicar = new URL(`https://graph.facebook.com/v21.0/${config.igUserId}/media_publish`);
  publicar.searchParams.set('access_token', config.igToken);
  publicar.searchParams.set('creation_id', d1.id);

  const r2 = await fetch(publicar, { method: 'POST' });
  const d2 = await r2.json();
  if (!r2.ok) throw new Error(`Graph API (publicar): ${JSON.stringify(d2).slice(0, 200)}`);
}

/* ------------------------- Roteamento dos eventos --------------------- */

async function processar(evento) {
  const { tipo } = evento;

  if (tipo === 'aprovacao') {
    await enviarWhatsapp(evento.grupo, evento.mensagem);
    registrar('aprovacao', `"${evento.titulo}" enviado ao grupo de ${evento.cliente || 'cliente'}`);
    return;
  }

  if (tipo === 'cobranca') {
    await enviarWhatsapp(evento.numero, evento.mensagem);
    registrar('cobranca', `cobrança de ${evento.cliente} enviada (${evento.metodo})`);
    return;
  }

  if (tipo === 'nota_fiscal') {
    await enviarWhatsapp(evento.numero, evento.mensagem);
    registrar('nota_fiscal', `pedido de NF de ${evento.cliente} enviado ao contador`);
    return;
  }

  if (tipo === 'publicar') {
    await publicarInstagram(evento.destino, evento.legenda, evento.mediaUrl);
    registrar('publicar', `publicado no ${evento.destino} (${evento.cliente || 'cliente'})`);
    return;
  }

  throw new Error(`tipo de evento desconhecido: ${tipo}`);
}

/* ------------------------------- Servidor ----------------------------- */

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function corpo(req) {
  return new Promise((resolve) => {
    let dados = '';
    req.on('data', (p) => { dados += p; if (dados.length > 5e6) req.destroy(); });
    req.on('end', () => {
      try { resolve(JSON.parse(dados || '{}')); } catch { resolve({}); }
    });
  });
}

const servidor = createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Recebe os eventos da plataforma.
  if (url.pathname === '/webhook' && req.method === 'POST') {
    const evento = await corpo(req);
    try {
      await processar(evento);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      registrar(evento.tipo || 'evento', e.message, false);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, erro: e.message }));
    }
  }

  // Salva a configuração pela tela.
  if (url.pathname === '/config' && req.method === 'POST') {
    config = { ...config, ...(await corpo(req)) };
    gravarConfig(config);
    registrar('config', 'configuração salva');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (url.pathname === '/estado') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      config,
      historico,
      whatsapp: whatsappConfigurado(),
      instagram: Boolean(config.igUserId && config.igToken),
    }));
  }

  // Teste rápido de envio, direto da tela.
  if (url.pathname === '/testar' && req.method === 'POST') {
    const { numero } = await corpo(req);
    try {
      await enviarWhatsapp(numero, 'Teste do Conector Orikay. Se você recebeu isto, está tudo certo.');
      registrar('teste', `mensagem de teste enviada para ${numero}`);
      res.writeHead(200); return res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      registrar('teste', e.message, false);
      res.writeHead(200); return res.end(JSON.stringify({ ok: false, erro: e.message }));
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(PAGINA);
});

servidor.listen(PORT, () => {
  console.log('');
  console.log('  Conector Orikay em execução.');
  console.log(`  Abra no navegador:  http://localhost:${PORT}`);
  console.log(`  Endereço para colar na plataforma:  http://localhost:${PORT}/webhook`);
  console.log('');
  console.log('  Deixe esta janela aberta enquanto usar a plataforma.');
  console.log('');
});

/* --------------------------- Tela de configuração --------------------- */

const PAGINA = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Conector Orikay</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#0a0a0c;color:#e7e7ea;padding:32px 20px;line-height:1.5}
  .wrap{max-width:760px;margin:0 auto}
  h1{font-size:26px;font-weight:600;letter-spacing:-.02em}
  .sub{color:#8a8a99;font-size:14px;margin-top:4px}
  .card{background:#121216;border:1px solid #24242c;border-radius:14px;padding:22px;margin-top:18px}
  h2{font-size:15px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:8px}
  .dot{width:8px;height:8px;border-radius:99px;background:#f59e0b}
  .dot.on{background:#34d399}
  label{display:block;font-size:12px;color:#9a9aa8;margin:12px 0 5px}
  input,select{width:100%;background:#17171c;border:1px solid #24242c;border-radius:9px;padding:10px 12px;color:#fff;font-size:14px;outline:none}
  input:focus,select:focus{border-color:#7c5cff}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  button{background:#7c5cff;color:#fff;border:0;border-radius:9px;padding:11px 18px;font-size:14px;font-weight:500;cursor:pointer;margin-top:16px}
  button:hover{background:#9a7dff}
  button.sec{background:#17171c;border:1px solid #24242c}
  .end{background:#17171c;border:1px solid #24242c;border-radius:9px;padding:12px;font-family:ui-monospace,monospace;font-size:13px;color:#b6a2ff;word-break:break-all;margin-top:8px}
  .hint{font-size:12px;color:#8a8a99;margin-top:8px}
  .log{font-size:13px;border-top:1px solid #24242c;padding:9px 0;display:flex;gap:10px}
  .log:first-of-type{border-top:0}
  .log .t{color:#6a6a78;font-size:11px;min-width:52px}
  .log.err .m{color:#f87171}
  a{color:#b6a2ff}
</style></head><body><div class="wrap">
  <h1>Conector Orikay</h1>
  <p class="sub">Liga a plataforma ao WhatsApp e ao Instagram. Deixe este programa aberto enquanto a equipe usar o Orikay.</p>

  <div class="card">
    <h2>Endereço para a plataforma</h2>
    <div class="end" id="url"></div>
    <p class="hint">Cole este endereço na plataforma, em <b>Integrações</b>, nos dois campos:
      "Webhook de saída (WhatsApp)" e "Webhook de publicação".</p>
  </div>

  <div class="card">
    <h2><span class="dot" id="dw"></span> WhatsApp</h2>
    <label>Provedor</label>
    <select id="provedor">
      <option value="zapi">Z-API</option>
      <option value="evolution">Evolution API</option>
    </select>
    <div id="zapi">
      <div class="row">
        <div><label>ID da instância</label><input id="zapiInstancia"></div>
        <div><label>Token</label><input id="zapiToken"></div>
      </div>
      <label>Client-Token (segurança da conta)</label><input id="zapiClientToken">
      <p class="hint">Os três aparecem no painel da Z-API depois de conectar o número por QR Code.</p>
    </div>
    <div id="evolution" style="display:none">
      <label>URL do servidor</label><input id="evolutionUrl" placeholder="https://seu-servidor.com">
      <div class="row">
        <div><label>Instância</label><input id="evolutionInstancia"></div>
        <div><label>API Key</label><input id="evolutionApiKey"></div>
      </div>
    </div>
    <label>Testar envio (número com DDI, ex.: 5524999999999)</label>
    <input id="numeroTeste" placeholder="5524999999999">
    <button class="sec" onclick="testar()">Enviar mensagem de teste</button>
  </div>

  <div class="card">
    <h2><span class="dot" id="di"></span> Instagram</h2>
    <div class="row">
      <div><label>ID da conta (IG User ID)</label><input id="igUserId"></div>
      <div><label>Token de acesso</label><input id="igToken"></div>
    </div>
    <p class="hint">Gerados no app da Meta, com a conta do Instagram como Profissional.
      A imagem do post precisa estar numa URL pública para o Instagram aceitar.</p>
  </div>

  <button onclick="salvar()">Salvar configuração</button>

  <div class="card">
    <h2>Atividade</h2>
    <div id="hist"><p class="sub">Nada ainda. As ações da plataforma aparecem aqui.</p></div>
  </div>
</div>
<script>
  const campos = ['provedor','zapiInstancia','zapiToken','zapiClientToken','evolutionUrl','evolutionInstancia','evolutionApiKey','igUserId','igToken'];
  document.getElementById('url').textContent = location.origin + '/webhook';
  document.getElementById('provedor').onchange = trocar;
  function trocar(){
    const p = document.getElementById('provedor').value;
    document.getElementById('zapi').style.display = p === 'zapi' ? '' : 'none';
    document.getElementById('evolution').style.display = p === 'evolution' ? '' : 'none';
  }
  async function carregar(){
    const r = await (await fetch('/estado')).json();
    campos.forEach(c => { if (r.config[c] !== undefined) document.getElementById(c).value = r.config[c]; });
    trocar();
    document.getElementById('dw').className = 'dot' + (r.whatsapp ? ' on' : '');
    document.getElementById('di').className = 'dot' + (r.instagram ? ' on' : '');
    const h = document.getElementById('hist');
    if (r.historico.length) {
      h.innerHTML = r.historico.map(e =>
        '<div class="log' + (e.ok ? '' : ' err') + '"><span class="t">' +
        new Date(e.quando).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) +
        '</span><span class="m">' + e.texto + '</span></div>').join('');
    }
  }
  async function salvar(){
    const dados = {};
    campos.forEach(c => dados[c] = document.getElementById(c).value.trim());
    await fetch('/config', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(dados) });
    carregar();
  }
  async function testar(){
    await salvar();
    const numero = document.getElementById('numeroTeste').value.trim();
    const r = await (await fetch('/testar', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ numero }) })).json();
    alert(r.ok ? 'Mensagem enviada. Confira o WhatsApp.' : 'Não foi enviada: ' + r.erro);
    carregar();
  }
  carregar();
  setInterval(carregar, 4000);
</script></body></html>`;
