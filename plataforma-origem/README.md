# Plataforma Origem

Plataforma interna da agência **Origem — Comunicação & Marketing**. Reúne, em um só
lugar, três ferramentas do dia a dia da equipe:

- 🗂️ **Quadros** — gestão de tarefas no estilo Trello (colunas + arrastar-e-soltar,
  etiquetas, prioridade, prazo, checklist e vínculo com cliente).
- ✅ **Checklist de Posts** — pipeline arrastável da _ideia_ à _veiculação_
  (ideia → roteiro → produção → edição → aprovação → alteração → agendado →
  publicado), com **copy gerada por IA**, upload de mídia, checklist e o loop de
  aprovação (aprovar → publica; reprovar → vai para _Alteração_ com cada pedido
  registrado separadamente).
- 🎬 **Edição de Vídeo** — pipeline próprio (briefing → gravação → decupagem →
  edição → revisão → aprovação → alteração → entregue) com links de material,
  checklist e pedidos de alteração empilhados.
- 📚 **Biblioteca de Postagens** — modelos/legendas reutilizáveis; use como novo
  post em um clique.
- ⚡ **Automações** — ao mover um post para _Aprovação_, a plataforma gera a copy e
  envia ao grupo do WhatsApp ("Segue aqui para aprovação"). Aprovou → publica no
  feed e no story. Não gostou → volta para _Alteração_. Tudo fica no log.
- 🔔 **Notificações** — avisa (no app e via notificação do navegador/PWA) quando um
  post precisa ir hoje e ainda não foi.
- 🤖 **IA** — gerador de copy grátis/ilimitado por template, ou conecte uma IA
  externa (endpoint compatível com OpenAI: Groq, OpenRouter, OpenAI, etc.).
  Planejamento mensal automático por cliente (cadência semanal + datas
  comemorativas, com post extra para todos nas datas universais).
- 💰 **Financeiro** — receitas, despesas, saldo e "a receber", com gráfico de
  evolução e visão por cliente. **Acesso restrito** a contas com permissão especial.

Funciona como **site** e como **aplicativo** (PWA instalável no celular e no
desktop). Interface moderna, com a identidade visual da Origem (violeta elétrico
sobre preto) e criação de contas em segundos.

## Como rodar

```bash
cd plataforma-origem
npm install
npm run dev        # ambiente de desenvolvimento (http://localhost:5173)
```

Para gerar a versão de produção:

```bash
npm run build      # gera a pasta dist/
npm run preview    # serve o build localmente para conferência
```

## Publicar / hospedar

O `build` gera uma pasta `dist/` estática que pode ser hospedada em qualquer
serviço (Vercel, Netlify, GitHub Pages, etc.). Como o `base` do Vite é relativo e o
roteamento usa hash (`/#/`), funciona também em subpastas sem configuração extra.

## Instalar como aplicativo

Abra a plataforma no navegador (Chrome, Edge ou Safari) e use **"Instalar
aplicativo"** / **"Adicionar à tela de início"**. O app abre em tela cheia, com
ícone próprio, e continua funcionando via cache mesmo offline.

## Integrações (publicação real e WhatsApp)

O app é **plugável por webhooks**, a forma correta e segura de automatizar:

- **Publicar no Instagram (feed/story)** e **enviar/ler WhatsApp** exigem as APIs
  oficiais (Instagram Graph API + WhatsApp Business API). Um site sozinho não pode
  "logar e postar" — isso viola os termos da Meta e arrisca as contas.
- Em **Integrações**, configure as URLs de webhook (Make.com, n8n, ou seu backend).
  O app **dispara os eventos de verdade** (gerar copy → enviar ao grupo → publicar).
  Enquanto o webhook não estiver configurado, tudo é **simulado e registrado** no
  log de Automações, para você ver o fluxo funcionando.
- A **IA** é opcional: por padrão usa um gerador local grátis; para output mais
  inteligente, informe um endpoint compatível com OpenAI + chave (Groq/OpenRouter
  têm camada gratuita).

## Contas da equipe e permissões

As contas oficiais são criadas automaticamente no primeiro acesso (login = nome):
Daniel Designer, Jr Social Media, Angélica Leal, João Paulo e Luiz Paulo SM.
O **Financeiro** é visível apenas para contas com permissão especial (por padrão,
Angélica Leal e João Paulo). Um admin ajusta as permissões em
**Integrações → Permissões**.

## Contas e dados

- A criação de conta é local e imediata — basta nome e senha.
- Os dados (quadros, posts, financeiro e clientes) são salvos **localmente no
  navegador** do dispositivo (localStorage). Não há servidor: é uma aplicação
  100% no cliente, pensada para uso rápido e privado da equipe.
- Ao criar a primeira conta, a plataforma já vem com dados de exemplo para
  ilustrar o uso. Em **Configurações** é possível recarregar o exemplo ou limpar
  tudo para começar do zero.

> Observação: por serem locais, os dados não são compartilhados automaticamente
> entre dispositivos. Para uma versão com login em nuvem e dados compartilhados
> entre a equipe, o próximo passo seria conectar um backend (ex.: Supabase ou
> Firebase) — a estrutura de dados já está organizada em `src/lib` para isso.

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS v4 · Zustand · dnd-kit · Recharts ·
Framer Motion · vite-plugin-pwa.

## Estrutura

```
src/
  components/   Logo, UI (botões, modais, inputs), AppShell, modais de card/post
  lib/          tipos, stores (auth e dados), rótulos, utilitários, dados de exemplo
  pages/        Landing, Auth, Dashboard, Quadros, Financeiro, Posts, Clientes, Config
```
