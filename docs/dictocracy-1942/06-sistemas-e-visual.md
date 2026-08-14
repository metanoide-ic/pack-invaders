# 7. Lista de Sistemas Necessários

1. Locomoção e interação em terceira pessoa (andar, focar objetos, pegar/ler documentos).
2. Sistema de diálogo não-binário com árvore ramificada e memória de personagem.
3. Agenda/scheduler diário e semanal com geração dinâmica de compromissos.
4. Sistema de decisão orientado a dados (`DecisionSystem`).
5. Sistema de documentos (assinar/recusar/alterar/adiar) com renderização de papel/carimbo.
6. Mapa estratégico mundial com frentes, produção, logística, recursos, rotas.
7. IA de país (objetivos, ameaça, negociação, memória de acordos).
8. Sistema de informação imperfeita (`InfoFidelity`) — versão percebida vs. real dos dados.
9. Sistema de memória de personagem (lealdade pública/real, medo, segredos, histórico).
10. Sistema de diplomacia (propostas, contrapropostas, conferências, tratados).
11. Espionagem e contraespionagem (agentes, interceptações, contrainteligência).
12. Pesquisa científica / árvore tecnológica por país.
13. Opinião pública e imprensa (segmentada, reage a eventos e discursos).
14. Sistema de saúde física/psicológica do líder (afeta diálogo e disponibilidade).
15. Sistema de sucessão (morte/incapacitação do líder, transição para sucessor jogável quando aplicável).
16. Dossiê histórico permanente (`HistoricalLedger`) e etiquetagem de proveniência.
17. Sistema de finais (avaliação de condições globais + variantes pessoais, geração de epílogo).
18. Save/load versionado.
19. Localização (texto, áudio, formatação regional) desde o primeiro protótipo.
20. Acessibilidade (fonte, contraste, legendas, daltonismo, redução de movimento, simplificação de UI).
21. Ferramenta interna de autoria de eventos/decisões (editor sobre Data Assets).
22. Sistema de streaming de nível / World Partition para transição ambiente↔mapa sem loading visível.
23. Sistema de escalabilidade gráfica (perfis de qualidade, upscalers).
24. Telemetria de balanceamento (para o `BalanceSim` headless e para métricas pós-lançamento).

# 8. Plano Visual — Como Alcançar Realismo

## 8.1 Pipeline gráfico
- **Nanite** para geometria arquitetônica densa (molduras, estuque, mobiliário de época) sem custo de LOD manual.
- **Lumen** para iluminação global dinâmica — luz de janela mudando ao longo do dia, luz de abajur incandescente, penumbra de bunker.
- **Virtual Shadow Maps** para sombras de contato precisas em interiores detalhados.
- **Materiais PBR completos** para madeira, tecido, metal, vidro, couro, papel — com biblioteca de referência fotográfica de época licenciada.
- **Texturas 4K** em superfícies de destaque (mesas, uniformes, mapas de parede), 2K em geometria secundária, com sistema de streaming de textura por distância.
- **Iluminação volumétrica** para feixes de luz em bunkers/salas de fumaça de cigarro — usada com moderação (pilar: não confundir realismo com excesso de efeito).
- **Niagara** para poeira em suspensão, fumaça de cigarro, respiração visível em ambientes frios — sempre sutil, nunca "showcase" de partículas.
- **Decals** para desgaste de piso, marcas de mão em maçanetas, umidade em paredes de bunker, manchas de tinta em documentos.
- **Chaos Physics** para objetos manipuláveis (papel, canetas, telefones) e destruição limitada e intencional em cenas de bombardeio.
- **World Partition + Level Streaming** para transição contínua entre ambiente interior e mapa estratégico, sem tela de loading.

## 8.2 Direção de arte
- Pesquisa de referência fotográfica de arquivo (arquivos nacionais, bibliotecas públicas, acervos com licença) para cada ambiente principal antes de qualquer produção de asset.
- Kits modulares por país/período (mobiliário, papelaria, rádios, telefones, uniformes) construídos a partir de referência real, nunca de "asset pack" genérico remisturado.
- Progressão visual de dano: cada ambiente principal tem 3 estados (intacto, danificado, crítico) trocados conforme a guerra avança na campanha.
- Regra de povoamento: nenhum ambiente de comando principal fica sem pelo menos 2–4 NPCs de fundo em rotina (funcionários, oficiais, secretárias) usando State Trees simples — nunca uma sala "vazia de cenário".

## 8.3 Personagens
- Base técnica MetaHuman, com esculpição facial customizada a partir de referência histórica licenciada/de domínio público — nunca semelhança de ator vivo protegido por imagem.
- Subsurface scattering calibrado por personagem/etnia com dados reais de pele, não preset único.
- Sistema de olhar (eye-target) ativo em todo diálogo — personagem sustenta contato visual ou desvia de forma intencional e legível emocionalmente.
- Biblioteca de animação facial matizada por estado emocional (calmo, tenso, hostil, quebrado) aplicada sobre a mesma base de captura, para variar sem multiplicar custo de motion capture.
- Revisão jurídica obrigatória de cada personagem histórico antes de aprovação de asset final (ver `06-conformidade.md`).

## 8.4 Meta de desempenho
- 60 FPS em 1080p, hardware médio (perfil "Médio").
- 60 FPS em 1440p com upscaling (DLSS/FSR/XeSS), hardware recomendado.
- 30 FPS opcional em modo "Cinemático" com qualidade máxima.
- Escalabilidade independente de sombras, multidão de NPCs de fundo, reflexos e resolução de textura.
- Sem hitches perceptíveis na transição ambiente↔mapa (World Partition pré-carregado por proximidade de gatilho de agenda).
- Tempo de carregamento de sessão (cold start) meta < 15s em SSD NVMe recomendado.
