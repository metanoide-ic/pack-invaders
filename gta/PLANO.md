# Ilha Paulista-Carioca — Plano de Desenvolvimento

Jogo estilo GTA em uma ilha que mistura São Paulo e Rio de Janeiro, com visual
cel-shaded inspirado em Borderlands. Motor: Three.js (WebGL), empacotável para
Steam (Electron) e mobile (Capacitor).

## Mapa (ilha ~6 km x 6 km)

- **Norte**: montanhas com neve (área de esqui)
- **Oeste**: deserto
- **Noroeste**: cidade de interior (cidadezinha)
- **Sudoeste**: pântano
- **Sul**: floresta fechada
- **Centro-sul (SP)**: Centro, Liberdade, Paulista, Vila Madalena, Itaim,
  Morumbi, Mooca, Tatuapé, Capão Redondo, Interlagos
- **Leste/costa (RJ)**: Copacabana, Ipanema, Leblon, Vidigal, São Conrado,
  Barra, Recreio, Prainha, Botafogo, Urca
- **Nordeste (ilhota + ponte)**: Ilha do Governador
- **Todo o litoral**: praias

## Fases

- [x] **Fase 1 — Terreno e locomoção**: ilha com relevo e zonas, personagem em
  3ª pessoa, minimapa, HUD com nome do bairro/região
- [x] **Fase 2 — Cidade**: ruas, calçadas e prédios cel-shaded, cada bairro com
  malha viária, altura e paleta próprias (~9 mil prédios)
- [ ] **Fase 3 — Interiores**: todos os prédios entráveis (gerados proceduralmente)
- [ ] **Fase 4 — Vida**: NPCs em todas as zonas (cidade mais densa), tráfego
- [ ] **Fase 5 — Veículos**: carros dirigíveis, esqui na neve
- [ ] **Fase 6 — Conteúdo**: missões, lojas, praias com vida, ciclo dia/noite
- [ ] **Fase 7 — Portes**: Steam (Electron), App Store/Play Store (Capacitor)

## Como rodar

```
npm run dev
# abrir http://localhost:3000/gta/
```
