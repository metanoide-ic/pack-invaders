# Núcleo — Documento de Design (GDD)

> Cozy game 3D para Steam, desenvolvido em Godot 4.
> Maior em variedade que Stardew Valley e Animal Crossing, sem virar um amontoado
> de sistemas: camadas de progressão que se conectam.

## Visão central

O jogador chega a uma pequena cidade quase esquecida e recebe uma casa simples e
um **Núcleo** — um artefato antigo que reage às atividades da cidade. Os
moradores são **criaturas humanóides fantásticas** (sem animais antropomórficos),
ligadas a elementos, objetos, materiais, emoções, plantas, luz, comida, música,
sonhos etc.

O objetivo não é "vencer o jogo", mas **transformar a cidade em um lugar vivo,
descobrir seus segredos e construir a própria história**.

### Os 7 eixos de progressão

1. Personagem
2. Casa
3. Cidade
4. Profissões
5. Relacionamentos
6. Exploração
7. Coleções e descobertas

---

## 1. Personagem

### Criação do personagem (§1)

Muito mais profunda que Animal Crossing. Escolhas: corpo, rosto, olhos, cabelo,
sobrancelhas, nariz, boca, tom de pele, sardas, pintas, cicatrizes, maquiagem,
altura, voz, animação de caminhada, postura, gestos, personalidade inicial.

Roupas em **camadas**: camiseta, camisa, casaco, jaqueta, calça, saia, meia,
sapato, luvas, relógio, pulseira, colar, mochila, chapéu, óculos.

**Looks salvos**: Trabalho, Chuva, Praia, Festa, Exploração, Inverno, Pijama…

### Atributos (§2)

Sem níveis tradicionais — competências que evoluem naturalmente ao praticar
(nada de grinding obrigatório):

| Grupo | Competências |
|---|---|
| Corpo | Energia, Resistência, Força, Agilidade |
| Mente | Criatividade, Conhecimento, Percepção, Concentração |
| Social | Carisma, Empatia, Humor, Negociação |
| Prático | Culinária, Construção, Agricultura, Pesca, Artesanato |

### Talentos (§3)

Cada habilidade tem uma árvore com escolhas que geram builds diferentes.
Exemplo — Culinária: nv.1 receitas simples → nv.5 escolha **Chef** (pratos
sofisticados) ou **Caseiro** (bônus maiores) → nv.10 Chef vira Confeiteiro /
Gourmet / Restaurateur; Caseiro vira Nutricionista / Conservador / Mestre de
receitas tradicionais.

### Reputação e títulos (§75–76)

Reputação por categoria (Empresário, Artista, Explorador, Chef, Agricultor,
Social) — NPCs reconhecem você. Títulos: Mestre Pescador, Chef da Cidade,
Explorador Lendário, Magnata, Artista Local.

---

## 2. Casa e construção

### Sua casa (§14)

Início: quarto, banheiro, cozinha pequena. Expansões: sala, segundo quarto,
escritório, atelier, garagem, porão, sótão, varanda, jardim, piscina, estufa.

### Construção livre (§15)

Mistura de The Sims + Animal Crossing + Minecraft leve, sem editor complicado:
mover paredes, trocar piso/teto, criar divisórias, janelas, portas.

### Móveis (§16–17)

Meta: **3.000+ móveis/objetos**. Estilos: moderno, rústico, industrial, retrô,
luxo, minimalista, fofo, gótico, futurista, praia, japonês, mediterrâneo,
fantasia. Cada móvel customizável: cor, material (tecido/couro/veludo; madeira
clara/escura/preta/branca), estampa, acabamento.

---

## 3. Cidade

### Início (§4)

Praça, prefeitura, mercadinho, café, praia ou rio, floresta, estação
abandonada, algumas casas. Métrica central: **Vitalidade da Cidade** — sobe ao
fazer eventos, ajudar moradores, abrir negócios, restaurar prédios, atrair
turistas, melhorar infraestrutura, descobrir locais, decorar espaços.

### Evolução urbana (§5) — ~10 níveis

1. Vilarejo esquecido → 2. Mercado renovado → 3. Café e praça reformados →
4. Nova área residencial → 5. Estação reaberta → 6. Centro comercial →
7. Museu → 8. Distrito cultural → 9. Porto/aeroporto regional →
10. Cidade referência da região.

O jogador define a **identidade**: turística, tecnológica, agrícola, artística,
sustentável ou comercial — muda os prédios disponíveis.

### Prefeitura e decisões (§6)

Assembleias com escolhas reais (parque OU estacionamento; prédio abandonado
vira biblioteca / mercado / galeria / academia / escola). NPCs têm opiniões;
escolhas mudam a cidade.

### Decoração e distritos (§73–74)

Alterar bancos, postes, flores, árvores, placas, fontes. Distritos: Centro,
Residencial, Comercial, Cultural, Industrial leve, Turístico.

### Transporte e veículos (§59–60)

Veículos customizáveis: bicicleta, skate, scooter, moto, carro. Transporte
público (ônibus, metrô, trem) expande com a cidade.

---

## 4. Moradores e relacionamentos

### Moradores (§7)

**120–180 moradores possíveis**, apenas 40–60 na sua cidade ao mesmo tempo →
cidades diferentes entre jogadores. Cada NPC: personalidade, profissão, gostos,
desgostos, medos, sonhos, rotina, amizades, rivalidades, família, segredos,
hobbies.

### Personalidades combinatórias (§8)

Não o sistema simples de Animal Crossing — combinações de traços (ex.:
Introvertido + Ambicioso + Organizado + Romântico + Ansioso) geram
comportamentos únicos.

### Memória dos NPCs (§9)

NPCs lembram de acontecimentos: presente de aniversário citado meses depois,
cobrança se você faltar a um casamento, amizade permanente ao ajudar em crise.

### Relações entre NPCs (§10)

NPCs viram amigos, brigam, namoram, casam, terminam, abrem negócios juntos,
mudam de casa, têm filhos — sem o jogador. Você pode ajudar ou atrapalhar.

### Romance (§11)

25–40 personagens românticos. Eixos: interesse, confiança, intimidade,
compatibilidade. Atividades: encontros, passeios, viagens, jantar, cinema,
praia, piquenique, festas — não apenas "dar presente".

### Casamento e filhos (§12–13)

Casa conjunta, conta compartilhada opcional, rotinas, viagens, decoração
conjunta, eventos do casal, conflitos leves (conversar/negociar/resolver).
Filhos opcionais: bebê → criança → pré-adolescente → adolescente, personalidade
influenciada pela casa e pela cidade.

---

## 5. Profissões e negócios

### Negócios do jogador (§24–25) — diferencial enorme

Restaurante próprio (café, padaria, restaurante, bar, doceria, food truck) com
cardápio, preços, decoração, horários, funcionários. Outros negócios: loja de
roupas, floricultura, hotel, loja de móveis, mercado, atelier, livraria, salão,
academia, empresa de tecnologia, galeria.

### Funcionários (§26)

Contratação de NPCs: habilidade, salário, satisfação, produtividade — sem
complexidade excessiva.

### Economia dinâmica (§27)

Preços flutuam levemente: festival gastronômico sobe frutas; inverno sobe
flores; boa colheita derruba trigo.

### Outras rendas (§35, 55–58, 65–66)

Fotografia (missões, venda e exposição de fotos), pintura (tela/cores/estilo,
venda de obras), moda (criar roupas: molde, tecido, cor, estampa — NPCs compram
de verdade, você cria uma marca), delivery (bicicleta/scooter/carro),
marketplace de usados no celular e mercado de pulgas mensal.

### Hotel e turismo (§61–62)

Hotel administrável (quartos, preços, serviços). Eventos atraem turistas, que
compram nas lojas e movem a economia.

---

## 6. Agricultura e natureza

### Agricultura (§18) — muito mais variada que Stardew

~**150 cultivos**: legumes, frutas, ervas, flores, cereais, cogumelos, plantas
medicinais, plantas mágicas.

### Qualidade (§19)

Depende de solo, água, fertilizante, clima, estação, habilidade.
Classes: Comum → Boa → Excelente → Premium → Perfeita.

### Estufas e genética (§20–21)

Plantar fora da estação, cruzar plantas, variedades raras (tomate vermelho +
amarelo → variedade especial). Descobertas valiosas: morango branco, melancia
dourada, rosa azul, abóbora gigante.

### Cozinha (§22–23)

~**500 receitas** (café da manhã, almoço, jantar, sobremesas, bebidas, padaria,
sopas, comida de rua, internacional). Receitas secretas com moradores, livros,
restaurantes, viagens, eventos; famílias com receitas próprias.

### Pesca e aquário (§28–29)

~**250 espécies** (água doce, oceano, caverna, pântano, lagos de montanha),
dependendo de hora, estação, chuva, temperatura e lua. Aquários em casa +
aquário público.

### Vida selvagem e pets (§36, 71–72)

Animais normais não-falantes (aves, raposas, coelhos, veados, golfinhos,
tartarugas). Pets: cachorros, gatos, pássaros, hamsters + fantásticos
opcionais; treináveis (sentar, buscar, seguir, brincar) e com personalidade.

---

## 7. Exploração e mistério

### Regiões (§37)

Cidade, Floresta, Montanha, Praia, Ilhas, Pântano, Deserto, Neve, Ruínas.

### Mineração e minerais (§30–31)

Várias regiões em vez de caverna infinita: mina abandonada, caverna cristalina,
vulcão, mina congelada, ruínas subterrâneas. ~**80 minerais** (ferro, cobre,
ouro, prata, cristais, gemas, raros).

### Arqueologia (§32)

Fósseis, moedas, cerâmicas, ferramentas antigas, documentos → museu.

### Viagens e ilhas (§38–39)

Com a estação reaberta: cidade costeira, japonesa, de montanha, futurista,
desértica — cada uma com NPCs, lojas, itens, receitas, eventos. Ilhas
procedurais com recursos, tesouros, plantas, moradores temporários.

### Mistérios (§44–45)

História escondida atravessa o jogo: por que a cidade foi abandonada? O que é o
Núcleo? Quem construiu as ruínas? Ruínas com puzzles ambientais (símbolos,
máquinas antigas, portas, mapas) — **nada de combate obrigatório**.

### Combate opcional (§46–47)

Simples, em áreas específicas: espada, arco, bastão, magia. Criaturas: sombras,
golems, espíritos, criaturas de cristal — nada extremamente violento. Quem não
gostar pode praticamente ignorar.

### Sonhos e dimensão secreta (§81–82)

Ao dormir, raramente entra em mundos de sonho — áreas surreais com itens
únicos. Late game: dimensão surreal ligada ao Núcleo.

---

## 8. Coleções e museu

### Coleções (§48–49) — uma das maiores forças

Selos, cartas, figurinhas, moedas, livros, discos, fósseis, minerais, plantas,
peixes, insetos, roupas, móveis. Álbum de ~**500 cartas** em pacotes; NPCs
colecionam e trocam.

### Museu (§33)

Seções: peixes, insetos, plantas, minerais, fósseis, arqueologia, arte,
história local. Completar leva centenas de horas.

### Insetos (§34)

**200+ espécies** (borboletas, besouros, libélulas, mariposas, vagalumes),
algumas em condições raríssimas.

### Livros e biblioteca (§93–94)

Centenas de livros colecionáveis (receitas, histórias, pistas). A biblioteca
cresce visualmente conforme você completa o acervo.

### Observatório (§80)

Astronomia como coleção: planetas, constelações, meteoros, cometas, eventos
raros.

---

## 9. Atividades e hobbies

- **Arcade** (§50): minigames (corrida, puzzle, plataforma, cartas) com rankings.
- **Esportes** (§51): tênis, futebol, basquete, skate, surf, corrida; campeonatos.
- **Academia** (§52): musculação, yoga, corrida, natação → atributos.
- **Música** (§53–54): violão, piano, bateria, baixo, flauta; montar banda,
  shows em bares/festivais/praça, até turnê.
- **Fotografia** (§35) e **Foto Mode** (§88): câmera, foco, profundidade,
  poses, filtros — essencial para cozy game.

---

## 10. Mundo vivo

### Clima e estações (§40–41)

Sol, chuva, tempestade, neblina, neve, vento, onda de calor — afetam NPCs,
plantas, peixes e eventos. 4 estações de **30 dias** = 120 dias/ano.

### Festivais (§42) — 30+/ano

Festival das Flores, do Café, Feira Gastronômica, Festival da Lua, das Luzes,
de Música, de Inverno, da Colheita…

### Eventos aleatórios (§43)

Meteoro, tempestade forte, feira inesperada, celebridade visitando, navio
chegando, aurora, eclipse.

### Mídia do jogo (§63–64, 69–70)

Celular com apps (Mapa, Mensagens, Calendário, Banco, Fotos, Clima,
Marketplace, Rede social). Rede social fictícia com posts de NPCs. Jornal
semanal refletindo o mundo. Rádio com música, notícias e previsão do tempo.

### NPCs especiais, mercador e boatos (§90–92)

Personagens que só aparecem na chuva, de madrugada, em eclipse ou por estação
(criam lendas). Mercador misterioso ocasional (móveis raros, sementes exóticas,
mapas, artefatos). Boatos de NPCs — alguns verdadeiros, outros falsos.

### Escola e gerações (§95–96)

Escola surge quando a cidade cresce. Mundo envelhece lentamente: famílias se
formam, novos moradores surgem — sem mortes rápidas.

---

## 11. Progressão, endgame e metas

### Desafios e conquistas (§67–68)

Desafios semanais (pesque 10 espécies, cozinhe 5 pratos…) por moedas especiais.
~500 achievements, alguns engraçados ("Dormiu 100 vezes", "Quebrou 50
ferramentas", "Deu o presente errado 20 vezes").

### Endgame e megaprojetos (§77–79)

História principal "concluída" em ~100h; o jogo continua. Megaprojetos:
aquário gigante, parque temático, centro cultural, universidade (cursos que
desbloqueiam receitas/habilidades), observatório, marina, jardim botânico.

### Diário (§89)

Registro de amizades, viagens, festivais e fotos — reviva sua história.

### Multiplayer (§84–87)

Até 8 jogadores: visitar cidades, pescar juntos, eventos, trocas (sem dinheiro
real), ilha cooperativa compartilhada, criação de eventos (festas, feiras,
corridas, competições de pesca).

### Filosofia de design (§97–99)

- **Dificuldade customizável**: economia fácil/normal/difícil; energia
  infinita; dias longos/normais.
- **Sem FOMO**: eventos sazonais retornam anualmente.
- **Regra de ouro**: o jogo nunca diz "vá farmar 500 madeiras" — sempre há 10
  coisas interessantes para fazer no mesmo dia.

### Meta de conteúdo (§99)

150+ moradores · 3.000+ móveis · 1.500+ roupas · 500 receitas · 150 plantações
· 250 peixes · 200 insetos · 100 minerais/artefatos · 500 cartas · 30+
festivais · 8 grandes regiões · 5 cidades visitáveis · 15+ negócios · 40+
hobbies → **300–500 horas** de conteúdo.

### Fases da experiência

| Horas | Foco |
|---|---|
| 0–10 | Conhecer cidade, moradores, casa, pesca, agricultura, crafting |
| 10–40 | Cidade cresce, comércio, romance, mineração, museu, exploração |
| 40–100 | Negócios, viagens, novas regiões, grandes relacionamentos, mistério principal |
| 100–200 | Megaprojetos, coleções, negócios avançados, novas cidades, atividades raras |
| 200+ | Museu completo, cidade perfeita, multiplayer, eventos e segredos |

### Temporadas de conteúdo (§83)

Sem live service agressivo — atualizações podem adicionar nova cidade, 20
moradores, móveis, receitas e festivais.

---

## Decisões técnicas

- **Engine**: Godot 4 (GDScript), export desktop para Steam (GodotSteam).
- **Câmera**: alternável entre isométrica/top-down e terceira pessoa.
- **Estilo visual**: low-poly colorido (flat shading) — ver `docs/art-style.md`.
- **Personagens**: sistema procedural próprio (`scripts/characters/`) —
  `CharacterAppearance` (dados de customização + paletas), `CharacterBuilder`
  (gera a malha facetada por peças: rosto com olhos/íris/brilho, sobrancelhas,
  nariz, boca em arco esférico, bochechas, orelhas, chifres, 9 penteados,
  chapéus, óculos, roupas em camadas) e `CharacterRig` (caminhada, respiração,
  piscada; o "jeito" muda amplitude, ritmo e postura). Jogador e moradores
  humanóides usam o mesmo sistema; moradores têm semente fixa (sempre os
  mesmos).
- **Criaturas especiais**: moradores únicos que fogem do corpo humanóide
  (`CreatureBuilder`/`CreatureRig`), ligados aos elementos do mundo — hoje
  **Nimbo** (nuvenzinha translúcida, só olhos, flutua), **Cintila** (cabeça de
  estrela dourada e brilhante, flutua), **Broto** (semente com coroa de
  folhas, anda pelo chão) e **Prisma** (cristal facetado com brilho interno,
  flutua). Base para expandir a galeria de moradores fantásticos do §7 do GDD.
- **Mecânicas do protótipo inicial**: farming (plantar/regar/colher),
  inventário e ferramentas, ciclo de dia/noite e estações, NPCs e vila,
  energia e sono (casa com cama; usar ferramentas gasta energia, dormir
  restaura e pula para o próximo dia — base do competência "Energia" do §2).
