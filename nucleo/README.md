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
| E / clique esquerdo | Usar ferramenta na célula marcada |
| Mouse (botão direito + arrastar) | Girar câmera |
| V | Alternar câmera: isométrica ↔ terceira pessoa |

## Estrutura

```
nucleo/
├── docs/        # GDD e documentos de design
└── game/        # Projeto Godot 4
    ├── scenes/  # Cenas (.tscn)
    ├── scripts/ # GDScript
    └── assets/  # Modelos, texturas, áudio
```
