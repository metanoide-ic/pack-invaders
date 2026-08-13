extends SceneTree
## Teste de fumaça das criaturas especiais (roda sem janela):
##   godot --headless --path . --script res://tests/creature_test.gd

func _initialize() -> void:
	var built := 0

	# 1. Todas as espécies, várias sementes: malha gerada, rig funcional.
	for kind: String in CreatureBuilder.KINDS:
		for seed_value in [1, 2, 3, 4, 5]:
			var rng := RandomNumberGenerator.new()
			rng.seed = seed_value
			var rig := CreatureBuilder.build(kind, rng)
			var meshes := _count_meshes(rig)
			assert(meshes >= 6, "%s (seed %d) gerou só %d meshes" % [kind, seed_value, meshes])
			# set_moving/blink não devem estourar mesmo sem estar na árvore.
			rig.set_moving(0.6)
			rig._process(0.016)
			rig.free()
			built += 1

	# 2. Nomes: cada espécie deve retornar um nome não vazio, determinístico
	#    pela semente.
	for kind: String in CreatureBuilder.KINDS:
		var rng_a := RandomNumberGenerator.new()
		rng_a.seed = 77
		var rng_b := RandomNumberGenerator.new()
		rng_b.seed = 77
		var name_a := CreatureBuilder.pick_name(kind, rng_a)
		var name_b := CreatureBuilder.pick_name(kind, rng_b)
		assert(name_a != "" and name_a == name_b, "nome de %s não determinístico" % kind)

	# 3. NPC.create_special: âncora inclui a altura de voo, física não estoura.
	for kind: String in CreatureBuilder.KINDS:
		var npc := NPC.create_special(kind, 999, Vector3(2, 0, 3))
		assert(npc.creature_kind == kind)
		assert(npc.flies == CreatureBuilder.flies(kind))
		var expected_y := 0.0 + CreatureBuilder.hover_height(kind)
		assert(is_equal_approx(npc.home.y, expected_y),
				"%s: home.y esperado %.2f, obtido %.2f" % [kind, expected_y, npc.home.y])
		root.add_child(npc)
		if not npc.is_node_ready():
			npc._ready()  # em modo --script o _ready não roda automaticamente
		# roda alguns frames de física para garantir que _physics_process
		# não quebra (com o rig de verdade construído).
		for i in 3:
			npc._physics_process(0.05)
		npc.queue_free()

	print("creature_test OK — %d criaturas construídas" % built)
	quit(0)


func _count_meshes(node: Node) -> int:
	var count := 1 if node is MeshInstance3D else 0
	for child in node.get_children():
		count += _count_meshes(child)
	return count
