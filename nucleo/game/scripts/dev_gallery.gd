extends Node3D
## Cena de desenvolvimento (não faz parte do jogo): mostra as 4 criaturas
## especiais lado a lado para conferência visual.

func _ready() -> void:
	var kinds := CreatureBuilder.KINDS
	for i in kinds.size():
		var rng := RandomNumberGenerator.new()
		rng.seed = 1000 + i
		var rig := CreatureBuilder.build(kinds[i], rng)
		var holder := Node3D.new()
		holder.position = Vector3((i - 1.5) * 2.6, CreatureBuilder.hover_height(kinds[i]), 0)
		holder.rotation.y = deg_to_rad(20)
		add_child(holder)
		holder.add_child(rig)
