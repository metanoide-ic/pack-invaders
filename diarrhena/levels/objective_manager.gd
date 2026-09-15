extends Node
## Primeiro objetivo de nível: derrotar N inimigos (os 3 `Enemy` da arena
## respawnam depois de mortos — ver enemy.gd — então "derrotar N" conta
## abates acumulados, não exige N inimigos vivos ao mesmo tempo). Só ouve
## GameEvents, não conhece nenhum inimigo/jogador diretamente.

@export var target_kills: int = 5

var kills: int = 0
var _completed: bool = false


func _ready() -> void:
	GameEvents.target_destroyed.connect(_on_target_destroyed)
	GameEvents.objective_progress_changed.emit(kills, target_kills)


func _on_target_destroyed(target: Node) -> void:
	if _completed or not is_instance_valid(target):
		return
	if not target.is_in_group(&"enemies"):
		return  # bonecos de teste de dano (dummy_target) não contam pro objetivo

	kills += 1
	GameEvents.objective_progress_changed.emit(kills, target_kills)
	if kills >= target_kills:
		_completed = true
		GameEvents.objective_completed.emit()
