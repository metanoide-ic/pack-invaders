# PACK INVADERS — ÍNDICE MESTRE DE SPRITES MIDJOURNEY
# Leia este arquivo primeiro. Ele orienta a ordem de geração.

---

## 📁 ESTRUTURA DOS ARQUIVOS

| Arquivo | Conteúdo |
|---------|----------|
| `MIDJOURNEY_PROMPTS_PART1.md` | Personagens jogáveis (6 personagens × 9 prompts cada = 54 prompts) |
| `MIDJOURNEY_PROMPTS_PART2.md` | Vendedores NPC (4 × ~4 prompts) + Bosses (19 × 3-4 frames = ~65 prompts) |
| `MIDJOURNEY_PROMPTS_PART3.md` | Inimigos Tier 1-4 (8+10+6+8 = 32 inimigos × 3 frames = ~96 prompts) |
| `MIDJOURNEY_PROMPTS_PART4.md` | Itens (150+), Relíquias, Fundos, UI, Efeitos (~170 prompts) |

**TOTAL ESTIMADO: ~385 prompts individuais**

---

## ✅ ORDEM DE GERAÇÃO RECOMENDADA

Siga essa sequência para sempre ter o mais importante primeiro:

### FASE 1 — Personagens (impacto imediato na tela de seleção)
Abra `PART1.md` e gere nesta ordem:
```
RAIZ-01 → RAIZ-02 → FAVIL-01 → FAVIL-02 → PELAGIA-01 → PELAGIA-02
ARCO-01 → ARCO-02 → BARATHRO-01 → BARATHRO-02 → NEX-01 → NEX-02
```
Depois volte e gere os frames de ataque/morte e skills de cada personagem.

### FASE 2 — Vendedores (aparecem no shop)
Abra `PART2.md`, seção NPC:
```
LUNA-01 → LUNA-02 → BRUTUS-01 → BRUTUS-02 → NYX-01 → NYX-02 → ZIKRI-01 → ZIKRI-02
```
Depois gere as expressões alternativas de cada um.

### FASE 3 — Inimigos Tier 1 (primeiras ondas)
Abra `PART3.md`, seção Tier 1:
```
T1-01 idle → T1-02 idle → T1-03 idle → T1-04 idle → T1-05 idle → T1-06 idle → T1-07 idle
```
Depois gere os frames de ataque e morte de cada um.

### FASE 4 — Bosses (confrontos épicos)
Abra `PART2.md`, seção BOSSES:
```
BOSS-19 (ZYRGOTH) → BOSS-01 (VROX) → BOSS-15 (VOIDMAW) → BOSS-09 (VULKRA) → [resto em ordem]
```
*(Começa pelo final boss e pelos mais icônicos para ter os mais importantes cedo)*

### FASE 5 — Inimigos Tier 2 e 3
Abra `PART3.md`, seções Tier 2 e Tier 3.

### FASE 6 — Itens mais usados
Abra `PART4.md`, seção Armas e Amplificadores:
```
ITEM-W01 até ITEM-W15 → ITEM-A01 até ITEM-A10 → ITEM-D01 até ITEM-D08
```

### FASE 7 — Fundos e UI
Abra `PART4.md`, seções Fundos e UI:
```
BG-01 → BG-02 → BG-03 → BG-04 → BG-05 → BG-06 → BG-07 → BG-08 → BG-09
UI-01 → UI-02 → UI-03 → UI-04 → UI-07 → UI-08 (prioridade alta)
```

### FASE 8 — Efeitos visuais
Abra `PART4.md`, seção Efeitos:
```
FX-01 → FX-02 → FX-03 → FX-04 → FX-05 → FX-06 (projéteis dos personagens)
FX-07 → FX-12 → FX-15 → FX-16 (explosões e celebração)
```

### FASE 9 — Relíquias e itens restantes
```
RELIC-01 até RELIC-10 → ITEM-F01 até ITEM-F05 → ITEM-U01 até ITEM-U12
```

### FASE 10 — Inimigos Tier 4 e itens de personagem exclusivos
```
T4-01 até T4-08 → ITEM-C01 até ITEM-C06
```

---

## 🎨 DICAS DE CONSISTÊNCIA

### Manter consistência visual entre sprites do mesmo personagem:
1. Gere `[PERSONAGEM]-01` (portrait) primeiro
2. Anote o número do **seed** que aparece abaixo da imagem gerada
3. Nas próximas gerações do mesmo personagem, adicione `--seed XXXXXX` ao final do prompt

### Exemplo:
```
[RAIZ-01] gera imagem → seed: 1234567
[RAIZ-02] prompt + --seed 1234567 → visual consistente
[RAIZ-03] prompt + --seed 1234567 → consistente
```

### Para variações (expressões diferentes):
- Use `--seed XXXXXX` do portrait aprovado
- Adicione no início: `same character as before, [nova expressão/pose]`

---

## 📐 GUIA DE RESOLUÇÃO POR TIPO

| Tipo | Resolução | Parâmetro |
|------|-----------|-----------|
| Portrait (NPC/Personagem) | 96x128 feel | `--ar 3:4` |
| Sprite de Combate (Personagem) | 64x64 | `--ar 1:1` |
| Sprite de Combate (Boss) | 96x96 | `--ar 1:1` |
| Boss Final (ZYRGOTH) | 128x128 | `--ar 1:1` |
| Inimigo Tier 1 | 32x32 | `--ar 1:1` |
| Inimigo Tier 2 | 48x48 | `--ar 1:1` |
| Inimigo Tier 3-4 | 64x64 | `--ar 1:1` |
| Ícone de Item | 32x32 | `--ar 1:1` |
| Relíquia | 48x48 | `--ar 1:1` |
| Projétil | 16x32 | `--ar 1:2` |
| Efeito Skill | 64x64-128x128 | varia por skill |
| Background | 1280x720 | `--ar 16:9` |
| Card Frame | 200x280 | `--ar 5:7` |
| NPC Corpo Inteiro | 64x96 | `--ar 2:3` |

---

## 🗂 CHECKLIST RÁPIDO (marque conforme gerar)

### PERSONAGENS
- [ ] RAIZ — Portrait, Sprite, Ataque, Dano, Morte, Skills (×3), Projétil
- [ ] FAVIL — Portrait, Sprite, Ataque, Dano, Morte, Skills (×3), Projétil
- [ ] PELAGIA — Portrait, Sprite, Ataque, Dano, Morte, Skills (×3), Projétil
- [ ] ARCO — Portrait, Sprite, Ataque, Dano, Morte, Skills (×3), Projétil
- [ ] BARATHRO — Portrait, Sprite, Ataque, Dano, Morte, Skills (×3), Projétil
- [ ] NEX — Portrait, Sprite, Ataque, Dano, Morte, Skills (×3), Projétil

### NPCS
- [ ] LUNA — Portrait ×3, Corpo Inteiro ×1, Expressões ×2
- [ ] BRUTUS — Portrait ×2, Corpo Inteiro ×1, Expressão ×1
- [ ] NYX — Portrait ×2, Corpo Inteiro ×1, Expressão ×1
- [ ] ZIKRI — Portrait ×2, Corpo Inteiro ×1, Expressão ×1

### BOSSES (19)
- [ ] VROX, NYDRA, KRIX, TOXAR, GORVATH, CRIOX, PHANTAX, GLUTHAR
- [ ] VULKRA, ZETHAR, TERRAVOX, SOLYX, ABYSSARA, NEXUS, VOIDMAW
- [ ] ASTRAL SERPENT, HARBINGER, XALVOR, ZYRGOTH

### INIMIGOS (32 tipos, 3 frames cada)
- [ ] Tier 1: Larva, Zangão, Escorpião, Olho, Escaravelho, Míssil, Parasita (7 tipos)
- [ ] Tier 2: Arqueiro, Cristal, Espectral, Guerreiro, Medusa, Ácido, Mantis, Escudo, Curandeiro, Spawner (10 tipos)
- [ ] Tier 3: Colosso, Hidra, Aranha, Colmeia, Psiônico, Leviatã (6 tipos)
- [ ] Tier 4: Assassino, Dragão, Replicador, Extinção, Anjo, Mente, Mercenário, Estrela Morta (8 tipos)

### ITENS
- [ ] Armas W01-W15 (15)
- [ ] Amplificadores A01-A10 (10)
- [ ] Cadência R01-R05 (5)
- [ ] Defesa D01-D08 (8)
- [ ] Cura H01-H06 (6)
- [ ] Projéteis P01-P12 (12)
- [ ] Fusão F01-F05 (5)
- [ ] Utilidade U01-U12 (12)
- [ ] Exclusivos C01-C06 (6)
- [ ] Relíquias RELIC-01 a RELIC-10 (10)

### FUNDOS
- [ ] BG-01 a BG-09 (9 backgrounds)

### UI
- [ ] UI-01 a UI-21 (21 elementos)

### EFEITOS
- [ ] FX-01 a FX-20 (20 efeitos)

---

## 📂 ONDE COLOCAR OS ARQUIVOS GERADOS

```
Jogo/
└── public/
    └── sprites/
        ├── characters/     → raiz.png, favil.png, pelagia.png, arco.png, barathro.png, nex.png
        ├── portraits/      → raiz_portrait.png, etc
        ├── vendors/        → luna.png, brutus.png, nyx.png, zikri.png
        ├── bosses/         → vrox.png, nydra.png, ... zyrgoth.png
        ├── enemies/        → larva.png, zangao.png, etc
        ├── items/          → item_W01.png, item_A01.png, etc
        ├── relics/         → relic_01.png, etc
        ├── backgrounds/    → bg_arena_early.png, etc
        ├── ui/             → card_frame_common.png, etc
        └── effects/        → fx_explosion.png, etc
```
