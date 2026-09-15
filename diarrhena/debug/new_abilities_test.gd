extends SceneTree
## Terceira ferramenta de dev: valida as habilidades novas do pool de
## loadout (Hemorróida, Milho, Bile, Pus, Sebo, Adrenalina, Espinhas
## passiva, Unhas não cortadas, Cera de ouvido) trocando os slots do
## jogador em tempo real e checando os efeitos com assert().
## godot --headless --path diarrhena --script res://debug/new_abilities_test.gd

var arena: Node
var player: Node
var enemy: Node


func _initialize() -> void:
	arena = load("res://levels/parkour_test_arena.tscn").instantiate()
	root.add_child(arena)
	current_scene = arena
	player = arena.get_node("Player")
	enemy = arena.get_node("Enemies/Enemy1")
	_run.call_deferred()


func _run() -> void:
	await process_frame
	await process_frame

	_test_hemorroida()
	await process_frame
	_test_sebo()
	_test_pus()
	_test_bile_blocks_damage()
	_test_adrenalina()
	_test_espinhas_passiva()
	_test_unhas()
	await _test_milho()
	await _test_cera_de_ouvido()
	await _test_caspa()
	_test_piolho()
	_test_mosca()
	_test_necrose()

	print("[new_abilities] OK — tudo passou.")
	quit()


func _reset_player_position_near_enemy() -> void:
	player.global_position = enemy.global_position + Vector3(0, 0.5, 3)
	player.rotation.y = 0.0
	player.head.rotation.x = 0.0
	player.health = player.max_health
	player.resource = player.max_resource
	enemy.health = enemy.max_health
	# Testes anteriores podem ter matado esse mesmo Enemy1 de verdade (ex:
	# a retaliação de espinhas_passiva espalha dano pra qualquer lado) — só
	# reescrever .health não desfaz o _die() (collision_layer desligada,
	# invisível), então força o estado "vivo" também.
	enemy.visible = true
	enemy.set_collision_layer_value(3, true)
	enemy.state = 0  # Enemy.State.IDLE — take_damage() vira no-op se state == DEAD


func _aim_camera_at_enemy() -> void:
	# A câmera fica bem mais alta que o centro do inimigo a curta distância
	# (cabeça do jogador ~2.1 acima do chão, centro do inimigo ~0.95) — sem
	# corrigir o pitch, um raycast nivelado passa por CIMA do inimigo.
	var to_enemy: Vector3 = (enemy.global_position + Vector3(0, 0.95, 0)) - player.camera.global_position
	var horizontal := Vector2(to_enemy.x, to_enemy.z).length()
	# rotation.x negativa = olhando pra baixo (convenção usada no mouse-look
	# do player.gd: rotate_x(-relative.y*sens), mouse pra baixo = ângulo negativo)
	player.head.rotation.x = atan2(to_enemy.y, horizontal) if horizontal > 0.001 else 0.0


func _wait_until_grounded(max_frames: int = 180) -> void:
	for i in range(max_frames):
		if player.is_on_floor():
			return
		await process_frame


func _test_hemorroida() -> void:
	_reset_player_position_near_enemy()
	_aim_camera_at_enemy()
	player.weapon_slot_1 = &"hemorroida"
	var health_before: float = player.health
	var enemy_health_before: float = enemy.health

	player._hemorroida_charging = true
	player._hemorroida_charge = 1.5  # meio carregada
	player._release_hemorroida()

	print("[hemorroida] vida_jogador antes=%s depois=%s | vida_inimigo antes=%s depois=%s" % [
		health_before, player.health, enemy_health_before, enemy.health
	])
	assert(player.health < health_before, "hemorróida deveria ter tirado vida do próprio jogador")
	assert(enemy.health < enemy_health_before, "hemorróida deveria ter acertado o inimigo na mira")
	player.weapon_slot_1 = &"espinhas"


func _test_sebo() -> void:
	_reset_player_position_near_enemy()
	player.weapon_slot_1 = &"sebo"
	var health_before: float = player.health
	player.take_damage(20.0)
	var lost: float = health_before - player.health
	print("[sebo] dano de 20 resultou em %s de perda (esperado ~%s com 30%% de redução)" % [lost, 20.0 * (1.0 - player.sebo_damage_reduction)])
	assert(lost < 20.0, "sebo deveria reduzir o dano recebido")
	player.weapon_slot_1 = &"espinhas"


func _test_pus() -> void:
	_reset_player_position_near_enemy()
	player.support_slot_r = &"pus"
	var bonus_before: float = player.bonus_health
	player._pus_active = true
	player._pus_accum = 0.0
	player._tick_pus(1.0)  # 1s inteiro de uma vez
	var health_after_channel: float = player.health
	player._release_pus()
	print("[pus] vida_apos_canalizar=%s vida_extra_antes=%s depois=%s" % [health_after_channel, bonus_before, player.bonus_health])
	assert(player.bonus_health > bonus_before, "soltar o Pus deveria converter o dano acumulado em vida extra")
	player.support_slot_r = &"choro"


func _test_bile_blocks_damage() -> void:
	_reset_player_position_near_enemy()
	player.support_slot_c = &"bile"
	player._on_slot_pressed(&"bile")
	assert(player._bile_active, "bile deveria ativar no press")

	var enemy_health_before: float = enemy.health
	player._on_slot_pressed(&"coco")  # tentativa de atirar cocô estando com bile ativa
	print("[bile] vida_inimigo antes=%s depois_de_tentar_coco=%s (deve ser igual — coco bloqueado)" % [enemy_health_before, enemy.health])
	assert(enemy.health == enemy_health_before, "bile deveria bloquear habilidades de dano")

	player._on_slot_released(&"bile")
	assert(not player._bile_active, "bile deveria desativar no release")
	player.support_slot_c = &"suor"


func _test_adrenalina() -> void:
	_reset_player_position_near_enemy()
	player.support_slot_c = &"adrenalina"
	player._adrenaline_used = false
	player._invincible = false
	player.health = 5.0
	player.take_damage(999.0)
	print("[adrenalina] health=%s invincible=%s used=%s" % [player.health, player._invincible, player._adrenaline_used])
	assert(player.health == 1.0, "adrenalina deveria segurar a vida em 1 em vez de deixar morrer")
	assert(player._invincible, "adrenalina deveria ativar invencibilidade temporária")

	var health_before_second_hit: float = player.health
	player.take_damage(50.0)
	print("[adrenalina] durante invencibilidade, dano de 50 não deveria mudar a vida: %s -> %s" % [health_before_second_hit, player.health])
	assert(player.health == health_before_second_hit, "não deveria tomar dano durante a invencibilidade da adrenalina")

	player._invincible = false  # limpa pro resto dos testes
	player.support_slot_c = &"suor"


func _test_espinhas_passiva() -> void:
	_reset_player_position_near_enemy()
	player.weapon_slot_1 = &"espinhas_passiva"
	var children_before := arena.get_child_count()
	player.take_damage(10.0)
	print("[espinhas_passiva] filhos_antes=%s depois=%s (deve ter +%s espinhos)" % [children_before, arena.get_child_count(), player.espinhas_passiva_count])
	assert(arena.get_child_count() >= children_before + player.espinhas_passiva_count, "deveria ter disparado os espinhos de retaliação")
	player.weapon_slot_1 = &"espinhas"


func _test_unhas() -> void:
	_reset_player_position_near_enemy()
	# melee tem alcance curto (2.2m) — os 3m do setup padrão erram o alvo
	player.global_position = enemy.global_position + Vector3(0, 0.3, 1.5)
	_aim_camera_at_enemy()
	player.weapon_slot_1 = &"unhas_compridas"
	player._nail_charges = player.nail_max_charges
	player._cooldowns[&"melee"] = 0.0

	var enemy_health_before: float = enemy.health
	player._fire_melee()
	var dmg_with_bonus: float = enemy_health_before - enemy.health
	print("[unhas] dano do melee com unha cheia=%s (base seria %s), cargas restantes=%s" % [dmg_with_bonus, player.melee_damage, player._nail_charges])
	assert(dmg_with_bonus > player.melee_damage, "unhas compridas deveriam multiplicar o dano do melee")
	assert(player._nail_charges == player.nail_max_charges - 1, "deveria ter gasto uma carga de unha")
	player.weapon_slot_1 = &"espinhas"


func _test_milho() -> void:
	_reset_player_position_near_enemy()
	player.weapon_slot_1 = &"milho"
	player.global_position = Vector3(0, 1, 0)  # parado, longe de qualquer inimigo, só valida que não trava
	player.velocity = Vector3.ZERO
	await _wait_until_grounded()  # is_on_floor() só reflete o chão depois de um move_and_slide() de verdade

	var children_before := arena.get_child_count()
	player._milho_cd = 0.0
	player._tick_milho(0.0)
	print("[milho] is_on_floor=%s filhos_antes=%s depois=%s" % [player.is_on_floor(), children_before, arena.get_child_count()])
	assert(arena.get_child_count() > children_before, "milho deveria instanciar um projétil quando parado")
	await process_frame
	player.weapon_slot_1 = &"espinhas"


func _test_cera_de_ouvido() -> void:
	_reset_player_position_near_enemy()
	player.weapon_slot_1 = &"cera_de_ouvido"
	player.global_position = Vector3(0, 1, 0)
	player.velocity = Vector3.ZERO
	await _wait_until_grounded()

	var children_before := arena.get_child_count()
	player._earwax_cd = 0.0
	for i in range(5):
		await process_frame
	print("[cera] is_on_floor=%s filhos_antes=%s depois=%s" % [player.is_on_floor(), children_before, arena.get_child_count()])
	assert(arena.get_child_count() > children_before, "cera de ouvido deveria ter deixado uma poça no chão")
	player.weapon_slot_1 = &"espinhas"


func _test_caspa() -> void:
	_reset_player_position_near_enemy()
	player.weapon_slot_1 = &"caspa"
	player._cooldowns[&"caspa"] = 0.0

	var children_before := arena.get_child_count()
	player._fire_caspa()
	print("[caspa] filhos_antes=%s depois=%s (deve ter +1 mina)" % [children_before, arena.get_child_count()])
	assert(arena.get_child_count() > children_before, "caspa deveria ter instanciado uma mina no chão")

	# joga o inimigo em cima da mina e deixa a física de verdade detectar o contato
	var mine_pos: Vector3 = player.global_position
	enemy.global_position = mine_pos
	var enemy_health_before: float = enemy.health
	var triggered := false
	for i in range(60):
		await process_frame
		if enemy.health < enemy_health_before:
			triggered = true
			break
	print("[caspa] inimigo em cima da mina: triggered=%s health_antes=%s depois=%s" % [triggered, enemy_health_before, enemy.health])
	assert(triggered, "caspa deveria explodir e ferir o inimigo que encostou")
	player.weapon_slot_1 = &"espinhas"


func _test_piolho() -> void:
	_reset_player_position_near_enemy()
	player.global_position = enemy.global_position + Vector3(0, 0.5, 1.5)  # bem dentro do raio (3m)
	player.weapon_slot_1 = &"piolho"
	player._piolho_tick_cd = 0.0
	var enemy_health_before: float = enemy.health
	player._tick_piolho(0.016)
	print("[piolho] vida_inimigo antes=%s depois=%s" % [enemy_health_before, enemy.health])
	assert(enemy.health < enemy_health_before, "piolho deveria morder sozinho o inimigo próximo")
	player.weapon_slot_1 = &"espinhas"


func _test_mosca() -> void:
	_reset_player_position_near_enemy()
	player.support_slot_c = &"mosca"
	player._mosca_count = player.mosca_max
	var health_before: float = player.health
	var mosca_before: int = player._mosca_count
	player.take_damage(30.0)
	print("[mosca] vida antes=%s depois=%s | moscas antes=%s depois=%s" % [health_before, player.health, mosca_before, player._mosca_count])
	assert(player.health == health_before, "mosca deveria bloquear o dano totalmente, uma de cada vez")
	assert(player._mosca_count == mosca_before - 1, "deveria ter consumido exatamente uma mosca")
	player.support_slot_c = &"suor"


func _test_necrose() -> void:
	var game_events := root.get_node("GameEvents")

	_reset_player_position_near_enemy()
	player.support_slot_c = &"necrose"
	player._necrose_timer = -1.0
	player._necrose_active = false
	player.health = player.max_health

	player._tick_necrose(0.016)
	print("[necrose] iniciou a contagem: active=%s timer=%s" % [player._necrose_active, player._necrose_timer])
	assert(player._necrose_active, "necrose deveria começar a contar assim que equipada")

	player._tick_necrose(9999.0)  # força o fim do tempo numa tacada só
	print("[necrose] após estourar o tempo: health=%s active=%s" % [player.health, player._necrose_active])
	assert(player.health <= 0.0, "necrose deveria matar o jogador quando o tempo acaba")
	assert(not player._necrose_active, "necrose deveria se desarmar depois de disparar")

	# desarme por objetivo cumprido antes do tempo acabar
	player.health = player.max_health
	player._necrose_timer = -1.0
	player._necrose_active = false
	player._tick_necrose(0.016)
	assert(player._necrose_active, "necrose deveria reativar pro segundo cenário")
	game_events.objective_completed.emit()
	print("[necrose] após objective_completed: active=%s" % player._necrose_active)
	assert(not player._necrose_active, "objetivo cumprido antes do tempo deveria desarmar a necrose")

	player.support_slot_c = &"suor"
	player.health = player.max_health
