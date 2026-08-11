# Conector Orikay

Programa que roda no computador da agência e executa de verdade o que a
plataforma dispara: manda as mensagens no WhatsApp (aprovação, cobrança e
pedido de nota fiscal) e publica no Instagram (feed e story).

Ele substitui o Make.com. Não precisa de conta lá, nem montar cenários.

## Como usar (primeira vez)

1. Instale o Node.js (se ainda não tiver): https://nodejs.org — versão LTS.
2. Baixe esta pasta `conector` para o computador.
3. Abra a pasta e execute:
   - **Windows:** dois cliques em `iniciar-conector.bat`
   - **Mac/Linux:** `bash iniciar-conector.sh` (ou `node conector.mjs`)
4. Abra http://localhost:8787 no navegador.
5. Preencha os dados (abaixo) e clique em **Salvar configuração**.
6. Na plataforma, em **Integrações**, cole `http://localhost:8787/webhook`
   nos dois campos: "Webhook de saída (WhatsApp)" e "Webhook de publicação".

Depois disso, é só deixar a janela do conector aberta enquanto a equipe usa
o Orikay. As ações aparecem na lista de atividade da própria tela.

## O que preencher

### WhatsApp
Escolha um provedor e conecte o número da agência nele:

- **Z-API** (https://www.z-api.io) — pago, simples: cria a instância, lê o QR
  Code com o WhatsApp da agência e copia **instância**, **token** e
  **Client-Token** do painel.
- **Evolution API** (https://github.com/EvolutionAPI/evolution-api) — gratuita,
  mas precisa ser hospedada por você: informe a **URL**, a **instância** e a
  **API Key**.

Use o botão **Enviar mensagem de teste** com o seu próprio número (com DDI,
ex.: `5524999999999`) para confirmar antes de usar com clientes.

### Instagram
Precisa da conta como Profissional, ligada a uma Página do Facebook, e de um
app na Meta (https://developers.facebook.com/apps/) com a permissão
`instagram_content_publish`. Informe o **IG User ID** e o **token de acesso**.

Detalhe importante: o Instagram só aceita imagem que esteja numa **URL
pública**. Imagem colada direto na plataforma não serve para a publicação
automática — use um link (Drive público, site, storage) no campo de mídia.

### Respostas do grupo (aprovação automática)
Com isto ligado, quando o cliente responde no grupo o post se resolve sozinho:
"pode postar" publica, "muda a cor do fundo" manda para Alteração com o pedido
já registrado embaixo do post. Conversa comum do grupo não mexe em nada, e
mensagens enviadas pela própria agência são ignoradas.

O provedor de WhatsApp precisa conseguir alcançar o seu computador, e para isso
o endereço `localhost` não serve. Abra outra janela do terminal e rode:

```
npx cloudflared tunnel --url http://localhost:8787
```

Ele devolve um endereço `https://algo.trycloudflare.com`. Na tela do conector,
copie o endereço de entrada e troque `localhost:8787` por esse endereço. Cole o
resultado no campo de webhook do painel do provedor, no evento de **mensagem
recebida** (na Z-API, "Ao receber"; na Evolution, `MESSAGES_UPSERT`).

O endereço de entrada já vem com um token secreto. Sem ele, qualquer pessoa que
descobrisse o endereço conseguiria aprovar posts, então não divulgue esse link.

Enquanto isso não estiver ligado, a plataforma continua funcionando: a equipe
usa os botões de aprovar e pedir alteração dentro do post.

### Tráfego pago
Serve para o botão **Sincronizar números** da aba Tráfego trazer investimento,
impressões, alcance, cliques e resultados direto da Meta, sem digitar nada.

Precisa de dois dados, do mesmo app da Meta usado no Instagram (basta a
permissão `ads_read`):

- **ID da conta de anúncios** — aparece no Gerenciador de Anúncios
  (https://adsmanager.facebook.com), no formato `act_1234567890`.
- **Token de acesso** — pode ser o mesmo token do Instagram, desde que o app
  tenha `ads_read`.

Na plataforma, cada campanha precisa ter o **ID na Meta** preenchido (o número
da campanha no Gerenciador). Só as campanhas da Meta com esse ID são
sincronizadas; as de Google e TikTok continuam com os números digitados à mão.

## Perguntas comuns

**Preciso deixar aberto?** Sim, enquanto quiser que as ações saiam
automaticamente. Fechou, a plataforma volta a registrar como simulado.

**Funciona em qualquer computador?** Sim, mas só na máquina onde ele está
rodando. Para a equipe inteira, rode num computador que fique ligado (ou num
servidor) e troque `localhost` pelo endereço dessa máquina na rede.

**E a resposta do cliente no grupo?** O conector envia; a leitura automática
das respostas exige um endereço público (o provedor precisa alcançar o seu
computador). Enquanto isso, use os botões do post: Aprovado, Pediu alteração
ou Publicamos manualmente.

**Onde ficam os tokens?** No arquivo `conector.config.json`, dentro desta
pasta, no seu computador. Não sobem para lugar nenhum.
