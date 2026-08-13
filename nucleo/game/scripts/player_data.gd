extends Node
## Autoload: dados persistentes do jogador entre cenas (aparência; depois,
## inventário, dinheiro, save).

var appearance: CharacterAppearance


func _ready() -> void:
	if appearance == null:
		appearance = CharacterAppearance.new()
