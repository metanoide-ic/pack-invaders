extends SceneTree
## Teste do sistema de personagens (roda sem janela):
##   godot --headless --path . --script res://tests/character_test.gd
## Constrói todos os estilos de forma exaustiva e aparências aleatórias,
## verificando que a malha é gerada e a serialização funciona.

func _initialize() -> void:
	# 1. Todos os estilos, um eixo por vez (pega índice quebrado em qualquer estilo).
	var style_axes := {
		"head_shape": CharacterAppearance.HEAD_SHAPES.size(),
		"eye_shape": CharacterAppearance.EYE_SHAPES.size(),
		"brow_style": CharacterAppearance.BROW_STYLES.size(),
		"nose_style": CharacterAppearance.NOSE_STYLES.size(),
		"mouth_style": CharacterAppearance.MOUTH_STYLES.size(),
		"cheek_style": CharacterAppearance.CHEEK_STYLES.size(),
		"ear_style": CharacterAppearance.EAR_STYLES.size(),
		"horn_style": CharacterAppearance.HORN_STYLES.size(),
		"hair_style": CharacterAppearance.HAIR_STYLES.size(),
		"shirt_style": CharacterAppearance.SHIRT_STYLES.size(),
		"pants_style": CharacterAppearance.PANTS_STYLES.size(),
		"hat_style": CharacterAppearance.HAT_STYLES.size(),
		"glasses_style": CharacterAppearance.GLASSES_STYLES.size(),
		"vibe": CharacterAppearance.VIBES.size(),
	}
	var built := 0
	for prop: String in style_axes:
		for i: int in style_axes[prop]:
			var a := CharacterAppearance.new()
			a.set(prop, i)
			var rig := CharacterBuilder.build(a)
			var meshes := _count_meshes(rig)
			assert(meshes >= 14, "%s=%d gerou só %d meshes" % [prop, i, meshes])
			rig.free()
			built += 1

	# 2. Aparências aleatórias (combinações), incluindo fantásticas.
	var rng := RandomNumberGenerator.new()
	rng.seed = 12345
	for i in 40:
		var a := CharacterAppearance.new()
		a.randomize_appearance(rng, i % 2 == 0)
		var rig := CharacterBuilder.build(a)
		assert(_count_meshes(rig) >= 14)
		rig.free()
		built += 1

	# 3. Serialização: to_dict/from_dict devem preservar tudo.
	var a1 := CharacterAppearance.new()
	a1.randomize_appearance(rng, true)
	var a2 := CharacterAppearance.new()
	a2.from_dict(a1.to_dict())
	for field: String in CharacterAppearance.FIELDS:
		assert(is_same(a1.get(field), a2.get(field)) or a1.get(field) == a2.get(field),
				"campo %s divergiu" % field)

	# 4. NPCs determinísticos: mesma semente → mesma aparência.
	var npc_a := NPC.create(7, Vector3.ZERO)
	var npc_b := NPC.create(7, Vector3.ZERO)
	assert(npc_a.appearance.to_dict() == npc_b.appearance.to_dict(),
			"NPC com mesma semente deve ter mesma aparência")
	assert(npc_a.npc_name != "")
	npc_a.free()
	npc_b.free()

	print("character_test OK — %d personagens construídos" % built)
	quit(0)


func _count_meshes(node: Node) -> int:
	var count := 1 if node is MeshInstance3D else 0
	for child in node.get_children():
		count += _count_meshes(child)
	return count
