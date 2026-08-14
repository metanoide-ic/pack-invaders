# Especificação de Ambientes — Vertical Slice

## Downing Street (residência/gabinete oficial)
- Usado nas cenas de abertura/agenda. Corredor de entrada + escritório pessoal.
- Progressão de dano: nenhuma neste slice (Downing Street não sofre dano físico visível no recorte de outubro de 1942) — mantém estado único, ao contrário do Cabinet War Rooms.
- Detalhamento exigido pelo GDD (seção "Direção Visual"): mapas físicos na parede, telefone e rádio funcionais (mesmo que só como prop interativo no slice, sem simular uma ligação real), documentos sobre a mesa, marcas de uso.

## Cabinet War Rooms (bunker subterrâneo)
- Usado nas cenas 2, 3, 4, 5 (reunião de Duisburg, transmissão de rádio, briefing de inteligência, decisão de Alamein) — é o ambiente principal do slice.
- **Progressão de dano/estado, 3 níveis** (usa `ADamageStateManager` do protótipo, observando um indicador agregado — para o slice, propõe-se um novo indicador `WarRoomsWearLevel` que sobe com o tempo de jogo e com decisões de crise, não com combate direto, já que o bunker em si não é bombardeado):
  1. **Rotina** — iluminação estável, poucos sinais de estresse (pontas de cigarro, papéis organizados).
  2. **Sob pressão** — mais fumaça no ar (Niagara sutil), mapas com mais anotações e alfinetes, alguma iluminação piscando.
  3. **Crise ativa** — durante e logo após a Cena 5 (decisão de Alamein): quadro de mensagens com fitas de teleimpressora acumuladas, mais NPCs de fundo em movimento, som ambiente mais denso (múltiplas conversas sobrepostas em volume baixo).
- Sala de mapas: parede com o mapa do Mediterrâneo/Norte da África, servindo de âncora visual entre esta sala e o `WBP_StrategicMapSimplified` (a transição para o widget de mapa deveria, idealmente, ser motivada por essa parede física — jogador se aproxima do mapa físico para abrir a versão interativa, não um menu genérico).
- Estúdio de transmissão de rádio (Cena 3): pequeno espaço com microfone de época, luz vermelha "NO AR", tratado com atenção de som (abafamento acústico visível/audível diferente do resto do bunker).

## Transição entre ambientes
Ambos os ambientes fazem parte do mesmo nível físico contínuo (o Cabinet War Rooms histórico tinha acesso por escada a partir de perto de Downing Street) — usar isso a favor da meta de "sem hitch perceptível na transição": o corredor de acesso serve de zona de streaming (World Partition), carregando o bunker enquanto o jogador ainda está no corredor de Downing Street.

## NPCs de fundo (regra do GDD: nenhum ambiente de comando vazio)
Mínimo de 3 NPCs de fundo em rotina simples (State Tree básico: andar entre 2-3 pontos, parar para "trabalhar" em uma mesa) circulando no Cabinet War Rooms durante todas as cenas — datilógrafas, oficiais de plantão, mensageiros. Aumentam de 3 para 5 durante o estado "Crise ativa" (reforça visualmente a escalada sem precisar de nova geometria).
