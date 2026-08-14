# Núcleo

Cozy game 3D para Steam, desenvolvido em **Godot 4**. Você chega a uma cidade
quase esquecida, recebe uma casa simples e um artefato antigo — o Núcleo — que
reage às atividades da cidade. Transforme-a em um lugar vivo, descubra seus
segredos e construa a sua história.

- **Documento de design completo**: [`docs/GDD.md`](docs/GDD.md)
- **Projeto Godot**: [`game/`](game/)

## Rodando

1. Instale o [Godot 4.3+](https://godotengine.org/download) (versão padrão, não .NET).
2. Abra o Godot, clique em **Importar** e selecione `nucleo/game/project.godot`.
3. Pressione **F5** para jogar.

O jogo abre no **criador de personagem** (23 opções de customização: corpo,
rosto, cabelo, chifres, roupas, jeito). Monte seu personagem e clique em
**Começar** para ir à fazenda.

### Controles do protótipo

| Tecla | Ação |
|---|---|
| WASD | Mover |
| 1–5 / roda do mouse | Escolher ferramenta da hotbar |
| E / clique esquerdo | Conversar com o morador por perto — ou dormir, perto da cama — ou usar ferramenta na célula marcada |
| Mouse (botão direito + arrastar) | Girar câmera |
| V | Alternar câmera: isométrica ↔ terceira pessoa |

Usar ferramentas gasta energia (barra amarela no canto superior esquerdo);
com energia zerada o personagem anda mais devagar. Durma na cama de casa
(E por perto) para restaurar a energia e pular para o dia seguinte.

Perto de um morador, **E** puxa conversa: uma fala cosmética (ainda sem
ramificação ou memória) baseada no "jeito" dos humanoides ou na espécie das
criaturas especiais — base para o sistema de diálogo/memória do GDD (§9-10).

## Estrutura

```
nucleo/
├── docs/        # GDD e documentos de design
└── game/        # Projeto Godot 4
    ├── scenes/  # Cenas (.tscn)
    ├── scripts/ # GDScript
    └── assets/  # Modelos, texturas, áudio
```
