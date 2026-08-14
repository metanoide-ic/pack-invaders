# Bibliografia Interna — Fontes por Tópico

Cumpre o compromisso de `01-gdd.md`/`08-finais-e-conformidade.md`: "manter uma bibliografia interna das fontes utilizadas. Não inventar citações e não apresentar ficção como fato histórico." Esta é uma bibliografia de **ponto de partida**, montada a partir de obras amplamente reconhecidas e verificáveis sobre cada tópico tocado pelo conteúdo já escrito (protótipo + vertical slice) — **não substitui** a revisão por historiador consultor exigida em `07-producao-e-riscos.md` e `08-finais-e-conformidade.md` (Anexo C). Cada obra abaixo precisa ser verificada, ampliada e corrigida por esse consultor antes de qualquer uso em material publicado — nenhuma citação aqui deve ser tratada como conferida em detalhe (data de edição exata, número de página) sem essa revisão.

**Regra aplicada nesta lista:** só entram obras/fontes reais e amplamente documentadas, que eu reconheço com confiança razoável como existentes e relevantes ao tópico. Onde a confiança é menor (detalhe específico, edição exata), isso é sinalizado explicitamente em vez de apresentado como certo.

## 1. Cabinet War Rooms e o funcionamento do Gabinete de Guerra britânico
- Imperial War Museums — **Churchill War Rooms** (site/acervo do museu instalado no complexo original em Whitehall). Fonte primária de referência visual e factual sobre o espaço físico.
- Gilbert, Martin. **Winston S. Churchill** (biografia oficial, múltiplos volumes cobrindo o período da guerra) — referência geral sobre a rotina de Churchill em 1942.
- Lukacs, John. **Five Days in London, May 1940** — não cobre diretamente outubro de 1942, mas é referência confiável sobre a cultura de decisão do Gabinete de Guerra no início do período, útil para tom.

**Usado em:** `vertical-slice/02-especificacao-ambientes.md`, roteiro da Cena 1 e Cena 3.
**O que é dramatização, não fato:** o layout específico de sala de mapas/estúdio de rádio descrito nos documentos de ambiente é uma reconstrução funcional para o jogo, não um mapeamento exato do espaço histórico real — precisa de validação com plantas/fotografias de arquivo antes da produção de arte (ver `prototype/Assets/plano-de-assets-temporarios.md`).

## 2. Bombardeio de área da RAF ao Vale do Ruhr (1942)
- Webster, Charles & Frankland, Noble. **The Strategic Air Offensive Against Germany, 1939–1945** (história oficial britânica, 4 volumes) — fonte central sobre a campanha de bombardeio estratégico, incluindo o debate entre alvos de precisão e bombardeio de área.
- Overy, Richard. **The Bombing War: Europe 1939–1945** — cobre o debate moral e estratégico sobre bombardeio de área de forma acessível e amplamente citada academicamente.
- Middlebrook, Martin & Everitt, Chris. **The Bomber Command War Diaries** — registro dia-a-dia de operações do Comando de Bombardeiros, útil para verificar datas/alvos reais de outubro de 1942 (precisa checagem específica antes de qualquer afirmação de data exata).

**Usado em:** `prototype/Narrative/roteiro-reuniao-prototipo.md` (decisão `raid_duisburg`).
**O que é dramatização, não fato:** a decisão específica sobre Duisburg nesta cena — datas, personagens presentes, diálogo, estimativa de baixas — é um composto ficcional. O bombardeio de área ao Ruhr como campanha geral é documentado; este episódio específico não corresponde a um evento único verificável. Isso já está declarado em `SourceNote` no dado (`Data/Decisions_Prototype.json`) — esta entrada de bibliografia é o lastro por trás dessa declaração.

## 3. Segunda Batalha de El Alamein (outubro–novembro de 1942)
- Barr, Niall. **Pendulum of War: The Three Battles of El Alamein** — obra acadêmica amplamente reconhecida sobre a campanha do Norte da África em 1942.
- Bungay, Stephen ou Hamilton, Nigel — biografias de Montgomery cobrem o planejamento da ofensiva (**nota de baixa confiança**: título exato e autor precisam ser confirmados pelo consultor antes de citação — menciono a existência de biografias amplamente conhecidas de Montgomery sem garantir aqui qual edição é a mais adequada).
- Data de início da ofensiva (23 de outubro de 1942) é fato amplamente documentado e de baixo risco de erro — confirmável em qualquer história geral da Segunda Guerra Mundial.

**Usado em:** `vertical-slice/01-roteiro-completo.md` (Cenas 4–5, decisão `alamein_orders`).
**O que é dramatização, não fato:** a discordância específica entre inteligência Ultra e reconhecimento fotográfico nesta cena, os personagens Menzies-e-Aldous discutindo, e principalmente o **resultado configurado** (reforços de Rommel eram reais) são inteiramente ficcionais, construídos para demonstrar o sistema de informação imperfeita — já declarado como tal no dado.

## 4. Inteligência Ultra e o Secret Intelligence Service (SIS/MI6)
- Hinsley, F. H. (com colaboradores). **British Intelligence in the Second World War** (história oficial britânica, múltiplos volumes) — fonte central sobre o uso e o impacto da inteligência Ultra.
- Cave Brown, Anthony. **"C": The Secret Life of Sir Stewart Menzies** — biografia amplamente citada de Menzies como chefe do SIS (**nota de baixa confiança**: título exato pode variar por edição — confirmar com o consultor antes de citar em material final).
- Smith, Michael. **The Secrets of Station X** — sobre Bletchley Park e a cadeia de decodificação que alimentava Ultra.

**Usado em:** `vertical-slice/Data/NPCs_VerticalSlice.csv` (personagem Menzies), Cena 4.
**Ponto de atenção editorial:** Menzies é uma pessoa historicamente real com papel documentado — a caracterização usada ("guardião da fonte Ultra, avesso a expor a origem da inteligência mesmo sob pressão") é uma inferência razoável a partir do que é amplamente documentado sobre a cultura de sigilo em torno de Ultra, mas o diálogo específico atribuído a ele nesta cena é inteiramente inventado (`DramaticFiction`, já declarado no dado). Nenhuma atribuição de erro, falha ou má conduta é feita a Menzies nesta cena — a discordância é tratada como divergência profissional legítima entre duas fontes competentes, não como incompetência de nenhum dos dois lados.

## 5. Personagens históricos secundários já em uso (Ismay, Brooke, Eden)
- Ismay, Hastings. **The Memoirs of General Lord Ismay** — autobiografia, fonte primária sobre seu papel como elo entre Churchill e o Comitê de Chefes de Estado-Maior.
- Danchev, Alex & Todman, Daniel (eds.). **War Diaries 1939–1945: Field Marshal Lord Alanbrooke** — diários publicados de Alan Brooke, amplamente citados academicamente, boa fonte para tom/personalidade (cauteloso, cético a improviso político).
- Eden, Anthony. **The Reckoning** (memórias) — fonte primária sobre sua perspectiva como Secretário de Relações Exteriores.

**Usado em:** `prototype/Data/NPCs_Prototype.csv`, roteiro do protótipo inteiro.
**Já declarado nos dados:** `SourceNote` de cada personagem já afirma que papel/cargo são documentados e diálogo é dramatização — esta entrada de bibliografia é o lastro específico por trás dessa afirmação genérica.

## 6. Transmissões de rádio de Churchill (BBC)
- Churchill, Winston. **Never Give In! The Best of Winston Churchill's Speeches** (compilação, org. por Winston S. Churchill, neto) — coletânea amplamente usada de discursos reais.
- **Atenção jurídica, não histórica:** nenhum texto de discurso real de Churchill deve ser reproduzido literalmente no jogo sem confirmação de domínio público/licença — ver `08-finais-e-conformidade.md`, Anexo C ("Não utilizar discursos... sem confirmar licença ou domínio público"). O "discurso" da Cena 3 do vertical slice é inteiramente ficcional por design, exatamente para evitar esse risco — não é uma paráfrase de nenhum discurso real específico.

**Usado em:** `vertical-slice/01-roteiro-completo.md` (Cena 3, decisão `radio_pronouncement`).

## Sobre personagens inteiramente ficcionais já em uso
**Aldous** (Wing Commander, ligação de reconhecimento aéreo) não tem nenhuma fonte bibliográfica correspondente — é um composto ficcional por design, para representar uma função sem atribuir diálogo inventado a uma pessoa real (já declarado como `DramaticFiction` em `vertical-slice/Data/NPCs_VerticalSlice.csv`). Nenhuma entrada de bibliografia é necessária ou apropriada para este personagem — mencionado aqui só para deixar claro que a ausência não é uma lacuna de pesquisa, é uma escolha de design.

## Processo de validação pendente (não fazer sem isso)
1. Historiador consultor confirma/corrige cada citação acima (edição, ano, precisão de atribuição) antes de qualquer uso em material voltado ao público.
2. Toda nova decisão/evento futuro deve chegar com sua própria entrada nesta lista **no mesmo commit** que introduz o conteúdo — não depois, não em lote.
3. Onde uma citação estiver marcada aqui como "baixa confiança", tratar como não-verificada até confirmação — não citar em material de marketing ou imprensa nesse estado.
