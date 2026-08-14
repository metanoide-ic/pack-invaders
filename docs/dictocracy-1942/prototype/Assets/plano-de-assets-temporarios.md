# Plano de Assets Temporários — Sprint 2 (Escritório 3D do Protótipo)

Cobre o requisito explícito da Fase 2 (`../../07-producao-e-riscos.md`, Sprint 2): "usar assets temporários devidamente licenciados. Priorizar mecânicas, não acabamento." Aplica a diretriz já autorizada para este projeto: uso de material CC0/domínio público/licença comercial explícita, com registro de proveniência obrigatório desde o protótipo — nunca "parece livre" sem confirmar a licença exata.

**Importante:** nada neste documento foi de fato baixado ou importado — é o plano de onde buscar e sob que licença, para quem montar `BP_PrototypeOffice` no Editor. Cada item, ao ser efetivamente baixado, deve virar uma linha na tabela de registro de proveniência (seção final deste documento), preenchida com URL exata, data de download e termos de licença — o mesmo princípio do `HistoricalLedger`/`FBibliographyRef` do modelo de dados (`../../05-modelo-de-dados.md`, 6.8), aplicado a assets em vez de fatos históricos.

## Regra de aceite por fonte (repetida da diretriz já combinada)
- **Aceitar:** CC0 / domínio público / licença que explicitamente permita uso comercial (inclui CC-BY, com atribuição registrada).
- **Recusar:** "royalty-free" ambíguo sem termos de licença publicados, "free for personal use", qualquer asset sem fonte rastreável.
- Fotografia de arquivo histórico serve para **referência visual de produção** (mood board, proporção, cor de época) — não para textura/decal final sem verificar os termos específicos do acervo, mesmo quando o acervo se descreve como "público".

## 3D — mobiliário, props, kit modular de escritório de guerra (1940s)
| Fonte | Licença | Uso previsto |
|---|---|---|
| Poly Haven (polyhaven.com) | CC0 | Props genéricos (mesas, cadeiras, luminárias, texturas PBR de madeira/metal/tecido) |
| Kenney Game Assets (kenney.nl) | CC0 | Blockout rápido de mobiliário de escritório para prototipagem de layout, antes de qualquer arte final |
| Quixel Megascans (via Bridge, integrado à conta Epic/UE5) | Licença gratuita para uso em projetos UE5 (termos da Epic — confirmar escopo comercial na conta do estúdio antes de builds públicas) | Texturas PBR de alta qualidade (metal desgastado, madeira, papel, tecido) para o kit modular do escritório |
| OpenGameArt.org (filtrar por licença CC0/CC-BY) | Variável por asset — **checar individualmente** | Props secundários (telefones antigos, máquinas de escrever, rádios) — só usar itens explicitamente marcados CC0 ou CC-BY com atribuição registrada |

## Referência visual (não é asset final — só para orientar produção)
| Fonte | Licença | Uso previsto |
|---|---|---|
| Imperial War Museums Collections (iwm.org.uk/collections) | Varia por item — muitos sob "IWM Non Commercial Licence" (**não cobre uso comercial** — usar só como referência de pesquisa, nunca importar a imagem/scan em si no jogo) | Referência de mood/proporção/iluminação do Cabinet War Rooms real, para orientar o kit modular — não para textura direta |
| The National Archives (UK) — Discovery catalogue | Varia por item, muitos "Open Government Licence" (permite reuso incluindo comercial, com atribuição) — confirmar item a item | Referência de documentos/papelaria de época para o `WBP_DocumentSheet` |
| Wikimedia Commons (filtrar por "Public Domain" ou CC0/CC-BY) | Varia por item — **checar a licença específica de cada arquivo**, não assumir pelo acervo | Referência fotográfica geral de interiores de gabinetes de guerra britânicos de 1940-45 |

## Áudio (room tone, efeitos, placeholder de ambientação)
| Fonte | Licença | Uso previsto |
|---|---|---|
| Freesound.org (filtrar explicitamente por CC0) | CC0 (só os itens marcados assim — o site também hospeda CC-BY e CC-BY-NC, que exigem checagem antes de usar) | Som de máquina de escrever, estática de rádio, passos em madeira, ambiente de bunker |
| BBC Sound Effects Archive (sound-effects.bbcrewind.co.uk) | RemArc Licence — uso pessoal, educacional e de **pesquisa**; checar explicitamente antes de qualquer uso comercial (provavelmente exige licenciamento separado para produto comercial) | Só como referência de pesquisa sonora nesta fase — não importar diretamente sem confirmar licenciamento comercial |

## Tipografia (UI de documento/agenda)
| Fonte | Licença | Uso previsto |
|---|---|---|
| Google Fonts (fonts.google.com) — famílias sob OFL (Open Font License) | OFL — uso comercial permitido | Tipografia de período para `WBP_DocumentSheet`/`WBP_AgendaHUD` (ex.: serifadas de datilografia/telegramas) |

## Personagens (MetaHuman)
- MetaHumans de amostra vêm com o próprio plugin MetaHuman da Epic — cobertos pelos termos de licença da Epic para uso em projetos UE5, **não são um "download externo"** e não entram nesta tabela de proveniência de terceiros.
- **Nenhuma esculpição facial baseada em fotografia real de Churchill/Brooke/Eden entra no protótipo.** Isso está fora de escopo por design (ver `../00-setup-guia.md`, "Explicitamente fora deste protótipo") — mesmo sendo referência de domínio público, direito de imagem exige revisão jurídica antes de qualquer produção de asset final (`../../08-finais-e-conformidade.md`, Anexo C).

## Tabela de registro de proveniência (preencher a cada download real)
| Data | Asset | Fonte (URL exata) | Licença confirmada | Uso no projeto | Atribuição necessária? |
|---|---|---|---|---|---|
| _(preencher)_ | | | | | |

Esta tabela, uma vez preenchida, alimenta o mesmo princípio de `FBibliographyRef` (05-modelo-de-dados.md) — na Fase 3, deve migrar para um banco de dados de produção auditável, não permanecer só em Markdown.
