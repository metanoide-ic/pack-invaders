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

### Controles do protótipo

| Tecla | Ação |
|---|---|
| WASD | Mover |
| Mouse (botão direito + arrastar) | Girar câmera (terceira pessoa) |
| V | Alternar câmera: isométrica ↔ terceira pessoa |
| E | Interagir (em breve) |

## Estrutura

```
nucleo/
├── docs/        # GDD e documentos de design
└── game/        # Projeto Godot 4
    ├── scenes/  # Cenas (.tscn)
    ├── scripts/ # GDScript
    └── assets/  # Modelos, texturas, áudio
```
