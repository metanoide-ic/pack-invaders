extends SceneTree
## Segunda ferramenta de dev: valida combate/respawn/wall-run/killzone com
## teleporte determinístico em vez de depender de timing de input real (o
## smoke_test.gd já cobre isso). Roda com:
## godot --headless --path diarrhena --script res://debug/combat_test.gd

var arena: Node
var player: Node
var _last_destroyed_matched: bool = false
var _objective_completed_seen: bool = false


func _initialize() -> void:
	arena = load("res://levels/parkour_test_arena.tscn").instantiate()
	root.add_child(arena)
	current_scene = arena
	player = arena.get_node("Player")
	_run.call_deferred()


func _run() -> void:
	await process_frame
	await process_frame

	await _test_combat_and_respawn()
	await _test_wall_run()
	await _test_kill_zone()
	await _test_objective()

	print("[combat_test] OK — tudo passou.")
	quit()


func _on_target_destroyed(target: Node, expected: Node) -> void:
	_last_destroyed_matched = (target == expected)


func _on_objective_completed_probe() -> void:
	_objective_completed_seen = true


func _test_objective() -> void:
	var objective := arena.get_node("ObjectiveManager")
	var game_events := root.get_node("GameEvents")
	print("[objective] kills antes (já tem 1 do teste de combate): %d/%d" % [objective.kills, objective.target_kills])

	game_events.objective_completed.connect(_on_objective_completed_probe)

	# completa o resto do objetivo com "inimigos" falsos (só precisam estar
	# no grupo "enemies" — o ObjectiveManager só ouve GameEvents, não
	# conhece o enemy.gd de verdade, então isso testa a lógica isolada)
	var fake_enemies: Array = []
	while objective.kills < objective.target_kills:
		var fake := Node.new()
		root.add_child(fake)
		fake.add_to_group(&"enemies")
		fake_enemies.append(fake)
		game_events.target_destroyed.emit(fake)

	print("[objective] kills depois: %d/%d completed_signal=%s" % [objective.kills, objective.target_kills, _objective_completed_seen])
	assert(objective.kills == objective.target_kills, "kills deveria ter batido o alvo exato")
	assert(_objective_completed_seen, "sinal objective_completed deveria ter disparado")

	for f in fake_enemies:
		f.queue_free()


func _test_combat_and_respawn() -> void:
	var enemy := arena.get_node("Enemies/Enemy1")
	print("[combat] inimigo antes: health=%s state=%s visible=%s" % [enemy.health, enemy.state, enemy.visible])

	# posiciona o jogador olhando direto pro inimigo (jogador olha -Z por padrão)
	player.global_position = enemy.global_position + Vector3(0, 0.5, 3)
	player.rotation.y = 0.0
	player.head.rotation.x = 0.0
	await process_frame

	# GameEvents é autoload — nesse contexto (script raiz substituindo o
	# SceneTree) o identificador global não existe em tempo de análise;
	# pega o nó direto pelo caminho.
	var game_events := root.get_node("GameEvents")

	# usa método/membro do próprio script em vez de capturar uma var local
	# na lambda (closure de GDScript captura local por valor, não por
	# referência — escrever numa bool local de dentro do callback não
	# refletia fora, isso mordeu o primeiro rascunho desse teste)
	_last_destroyed_matched = false
	game_events.target_destroyed.connect(_on_target_destroyed.bind(enemy))

	# vômito agora é spray contínuo (sem cooldown, gasta energia por
	# segundo) — chama o tick direto com um delta grande pra simular
	# segurar o botão por 2s de uma vez (30 dps * 2s = 60 > 40 hp do inimigo)
	player._tick_vomito(2.0)
	await process_frame

	print("[combat] após vômito: health=%s state=%s destroyed_signal=%s" % [enemy.health, enemy.state, _last_destroyed_matched])
	assert(_last_destroyed_matched, "vômito deveria ter matado o inimigo (60 dano vs 40 hp)")
	assert(enemy.visible == false, "inimigo morto deveria ficar invisível")
	# (sem disconnect: script é de uso único, morre junto com quit() no fim)

	# espera o respawn_delay (3s) + margem (0 = State.IDLE, ver enemy.gd).
	# Usa tempo real (Time.get_ticks_msec), não contagem de frame — frame
	# count por segundo varia com a carga da cena, contagem fixa já mordeu
	# esse teste antes (ver histórico).
	var frames_waited := 0
	var start_ms := Time.get_ticks_msec()
	while enemy.state != 0 and Time.get_ticks_msec() - start_ms < 6000:
		await process_frame
		frames_waited += 1

	print("[combat] após esperar respawn (%d frames, %d ms reais): health=%s state=%s visible=%s pos=%s" % [frames_waited, Time.get_ticks_msec() - start_ms, enemy.health, enemy.state, enemy.visible, enemy.global_position])
	assert(enemy.visible == true, "inimigo deveria ter voltado a aparecer")
	assert(enemy.health == enemy.max_health, "vida deveria ter resetado")


func _test_wall_run() -> void:
	# solta o jogador dentro do corredor de wall-run, encostado na parede
	# esquerda (x=-2.5, meio de -0.4 espessura -> face interna em x=-2.3),
	# com velocidade horizontal alta o bastante pra passar no
	# wall_run_min_speed (3.5) e no ar (senão is_on_floor() ganha e não
	# tenta nem checar parede).
	player.global_position = Vector3(-1.8, 4.0, -19)
	player.velocity = Vector3(0, 0, -6.0)
	player.rotation.y = 0.0

	var reached_wall_run := false
	for i in range(30):
		await process_frame
		if player.move_state == 2:  # MoveState.WALL_RUN
			reached_wall_run = true
			break

	print("[wallrun] entrou em wall-run: %s (move_state final=%s, pos=%s)" % [reached_wall_run, player.move_state, player.global_position])
	assert(reached_wall_run, "jogador deveria ter entrado em corrida na parede perto da CorridorWallLeft")


func _test_kill_zone() -> void:
	# joga o jogador dentro do fosso (sem chão) e espera a KillZone reposicionar.
	player.global_position = Vector3(0, 3, -20)
	player.velocity = Vector3.ZERO
	var reset_ok := false
	for i in range(400):
		await process_frame
		if player.global_position.y > -5.0 and i > 5:
			reset_ok = true
			break

	print("[killzone] voltou do vazio: %s pos=%s" % [reset_ok, player.global_position])
	assert(reset_ok, "KillZone deveria ter chamado reset_position e trazido o jogador de volta")
