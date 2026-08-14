extends SceneTree
## Teste da fala dos moradores e da interação do player (roda sem janela):
##   godot --headless --path . --script res://tests/npc_talk_test.gd

func _initialize() -> void:
	_test_humanoid_greetings()
	_test_creature_greetings()
	await _test_player_talks_to_npc()
	print("npc_talk_test OK")
	quit(0)


func _test_humanoid_greetings() -> void:
	for vibe: int in NPC.HUMANOID_LINES.keys():
		var npc := NPC.create(vibe, Vector3.ZERO)
		npc.appearance.vibe = vibe
		for i in 5:
			var line: String = npc.get_greeting()
			assert(line.begins_with(npc.npc_name + ": "),
					"fala deveria começar com o nome do morador")
			var spoken := line.trim_prefix(npc.npc_name + ": ")
			assert(spoken in NPC.HUMANOID_LINES[vibe],
					"fala '%s' não está no vibe %d" % [spoken, vibe])


func _test_creature_greetings() -> void:
	for kind: String in CreatureBuilder.KINDS:
		var npc := NPC.create_special(kind, 55, Vector3.ZERO)
		for i in 5:
			var line: String = npc.get_greeting()
			assert(line.begins_with(npc.npc_name + ": "))
			var spoken := line.trim_prefix(npc.npc_name + ": ")
			assert(spoken in NPC.CREATURE_LINES[kind],
					"fala '%s' não está nas falas de %s" % [spoken, kind])


func _test_player_talks_to_npc() -> void:
	var player_scene: PackedScene = load("res://scenes/player.tscn")
	var player: Player = player_scene.instantiate()
	root.add_child(player)
	await process_frame

	# Morador bem em cima do player: deve entrar em alcance de conversa.
	var npc := NPC.create(1, player.global_position)
	root.add_child(npc)
	if not npc.is_node_ready():
		npc._ready()  # em modo --script o _ready não roda automaticamente
	await process_frame

	player._update_near_npc()
	assert(player._near_npc == npc, "player deveria detectar o morador por perto")

	# Array em vez de variável simples: garante que o lambda enxergue a
	# escrita feita dentro do callback do sinal.
	var heard := [""]
	player.notified.connect(func(text: String) -> void: heard[0] = text)
	player._interact()
	assert(heard[0].begins_with(npc.npc_name + ": "),
			"interagir perto de um morador deveria disparar a fala dele, não a ferramenta")

	# Morador longe: a detecção deve cair e liberar a interação normal de novo.
	npc.global_position = player.global_position + Vector3(50, 0, 50)
	player._update_near_npc()
	assert(player._near_npc == null, "morador longe não deveria mais ser detectado")

	player.queue_free()
	npc.queue_free()
