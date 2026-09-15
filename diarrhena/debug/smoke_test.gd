extends SceneTree
## Teste automatizado headless: instancia a arena de teste, simula input de
## verdade (via Input.parse_input_event, não só polling) e exercita boa
## parte dos caminhos de código do player com o esquema de controles NOVO
## (loadout de slots) — não faz parte do jogo, só serve pra rodar via
## `godot --headless --script res://debug/smoke_test.gd`.
## Apagar/mover pra fora do projeto quando não precisar mais.

var player: Node
var arena: Node


func _initialize() -> void:
	arena = load("res://levels/parkour_test_arena.tscn").instantiate()
	root.add_child(arena)
	current_scene = arena
	player = arena.get_node("Player")
	_run.call_deferred()


func _run() -> void:
	await process_frame
	await process_frame
	print("[smoke] player pronto. health=%s resource=%s pos=%s loadout=1:%s 2:%s 3:%s R:%s C:%s" % [
		player.health, player.resource, player.global_position,
		player.weapon_slot_1, player.weapon_slot_2, player.weapon_slot_3,
		player.support_slot_r, player.support_slot_c,
	])

	# anda pra frente por um tempo
	_key(87, true)  # W
	for i in range(60):
		await process_frame
	_key(87, false)
	print("[smoke] após andar pra frente: pos=%s vel=%s move_state=%s" % [player.global_position, player.velocity, player.move_state])

	# pula, e segura o espaço no ar = diarreia (mesma tecla, ability separada)
	_key(32, true)  # Space
	for i in range(20):
		await process_frame
	print("[smoke] segurando espaço no ar (pulo+diarreia): pos.y=%s vel=%s resource=%s" % [player.global_position.y, player.velocity, player.resource])
	_key(32, false)

	# weapon_slot_1 (LMB) = espinhas por padrão, é hold
	var before_children := arena.get_child_count()
	_mouse(1, true)
	for i in range(10):
		await process_frame
	_mouse(1, false)
	print("[smoke] segurou slot1 (espinhas): filhos_antes=%s depois=%s" % [before_children, arena.get_child_count()])

	# weapon_slot_2 (MMB) = cocô por padrão, dispara no press (recuo)
	var vel_before_coco: Vector3 = player.velocity
	_mouse(3, true)
	await process_frame
	_mouse(3, false)
	print("[smoke] cocô (slot2/MMB): vel_antes=%s vel_depois=%s" % [vel_before_coco, player.velocity])

	# weapon_slot_3 (RMB) = vômito por padrão, é hold/spray contínuo
	_mouse(2, true)
	for i in range(10):
		await process_frame
	_mouse(2, false)
	print("[smoke] segurou slot3 (vômito spray): resource=%s" % player.resource)

	# mijo = scroll pra trás (wheel down), rajada instantânea
	var vel_before_mijo: Vector3 = player.velocity
	_mouse(5, true)
	await process_frame
	_mouse(5, false)
	print("[smoke] mijo (scroll): vel_antes=%s vel_depois=%s" % [vel_before_mijo, player.velocity])

	# meleca esquerda (Q) e direita (E) — toggle
	_key(81, true); await process_frame; _key(81, false)  # Q
	print("[smoke] meleca esquerda (Q): grapple_left=%s" % player._grapple_left_point)
	_key(69, true); await process_frame; _key(69, false)  # E
	print("[smoke] meleca direita (E): grapple_right=%s" % player._grapple_right_point)

	# melee (V)
	_key(86, true); await process_frame; _key(86, false)
	print("[smoke] melee (V) disparado sem erro")

	# aim reverse (F) — liga e desliga
	_key(70, true); await process_frame; _key(70, false)
	print("[smoke] aim_reverse após F: %s" % player._aim_reversed)
	_key(70, true); await process_frame; _key(70, false)
	print("[smoke] aim_reverse após F de novo: %s" % player._aim_reversed)

	# suor (C, slot de suporte padrão) — hold, checa velocidade subindo
	_key(67, true)
	for i in range(20):
		await process_frame
	print("[smoke] segurando suor (C): suor_charge=%s" % player._suor_charge)
	_key(67, false)

	# choro (R, slot de suporte padrão)
	player.take_damage(20.0)
	var health_before_choro: float = player.health
	_key(82, true)
	for i in range(15):
		await process_frame
	_key(82, false)
	print("[smoke] choro (R) após tomar dano: health_antes=%s health_depois=%s" % [health_before_choro, player.health])

	for i in range(30):
		await process_frame
	print("[smoke] health final=%s resource final=%s filhos_na_arena=%s" % [player.health, player.resource, arena.get_child_count()])
	print("[smoke] OK — nenhum erro/crash até aqui.")
	quit()


func _key(physical_keycode: int, pressed: bool) -> void:
	var ev := InputEventKey.new()
	ev.physical_keycode = physical_keycode
	ev.pressed = pressed
	Input.parse_input_event(ev)


func _mouse(button_index: int, pressed: bool) -> void:
	var ev := InputEventMouseButton.new()
	ev.button_index = button_index
	ev.pressed = pressed
	Input.parse_input_event(ev)
