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
- [x] **Fase 3 — Interiores**: todos os ~9 mil prédios entráveis; o interior é
  gerado na hora (cômodos, mobília e iluminação conforme o tipo do imóvel) e
  descartado ao sair. Por enquanto um pavimento por imóvel
- [x] **Fase 4 — Vida**: habitantes em todas as zonas, com densidade própria de
  cada terreno (cidade cheia, sertão quase deserto) e moradores nos interiores
- [ ] **Fase 4b — Tráfego**: carros circulando pelas ruas
- [ ] **Fase 5 — Veículos**: carros dirigíveis, esqui na neve
- [ ] **Fase 6 — Conteúdo**: missões, lojas, praias com vida, ciclo dia/noite
- [ ] **Fase 7 — Portes**: Steam (Electron), App Store/Play Store (Capacitor)

## Desempenho

A cena desenha ~200 mil triângulos por quadro (eram 580 mil antes das
otimizações da Fase 4). O número de quadros por segundo medido aqui é baixo
porque o navegador de testes não tem GPU e rasteriza por software; a mesma cena
vazia roda a 60 fps no mesmo ambiente, ou seja o limite é o processamento de
geometria em CPU, não o motor. Falta medir em máquina com placa de vídeo.

## Como rodar

```
npm run dev
# abrir http://localhost:3000/gta/
```
