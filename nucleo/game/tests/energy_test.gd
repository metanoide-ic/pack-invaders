extends SceneTree
## Teste do ciclo de energia e sono (roda sem janela):
##   godot --headless --path . --script res://tests/energy_test.gd

func _initialize() -> void:
	# O autoload ainda não é um identificador global neste ponto (o script
	# de entrada --script compila antes dos autoloads registrarem), então
	# acessamos pelo nó, como o próprio farm_grid.gd já faz defensivamente.
	var clock: Node = root.get_node("GameClock")
	_test_clock_sleep(clock)
	await _test_player_energy(clock)
	print("energy_test OK")
	quit(0)


func _test_clock_sleep(clock: Node) -> void:
	var before_day: int = clock.day
	var before_season: int = clock.season
	clock.time_of_day = 20.0  # simula fim de tarde
	clock.sleep_to_next_day()
	assert(is_equal_approx(clock.time_of_day, clock.DAY_START_HOUR),
			"dormir deveria pular para o início do dia")
	var advanced: bool = clock.day != before_day or clock.season != before_season
	assert(advanced, "dormir deveria avançar o calendário em um dia")


func _test_player_energy(clock: Node) -> void:
	# _ready() do FarmGrid e do Player usam get_tree()/get_node_or_null, que só
	# funcionam depois que o motor processa a árvore de verdade — por isso
	# aguardamos um frame real em vez de chamar _ready() manualmente (como
	# farm_test.gd/creature_test.gd fazem para nós mais simples).
	var farm: Node3D = load("res://scripts/farm_grid.gd").new()
	root.add_child(farm)
	await process_frame

	var player_scene: PackedScene = load("res://scenes/player.tscn")
	var player: Player = player_scene.instantiate()
	root.add_child(player)
	await process_frame

	assert(is_equal_approx(player.energy, player.MAX_ENERGY),
			"energia deveria começar cheia")

	# Preparar solo com a enxada deve gastar energia.
	player.selected_tool = 0  # enxada
	var cell := player._target_cell()
	player._use_tool()
	assert(player.energy < player.MAX_ENERGY, "usar a enxada deveria gastar energia")
	var after_hoe := player.energy

	# Planta, rega e espera crescer diretamente pelo FarmGrid (mesma célula).
	assert(farm.use_tool("seed_turnip", cell) != "")
	assert(farm.use_tool("can", cell) != "")
	for i in 2:
		farm._on_day_changed(i + 2, 0)
		farm.use_tool("can", cell)
	farm._on_day_changed(4, 0)

	# Colher com a mão não deve consumir energia adicional.
	player.selected_tool = 4  # mão
	player._use_tool()
	assert(is_equal_approx(player.energy, after_hoe),
			"colher não deveria consumir energia adicional")

	# Dormir restaura a energia e avança o dia.
	var day_before_sleep: int = clock.day
	player.energy = 1.0
	player._sleep()
	assert(is_equal_approx(player.energy, player.MAX_ENERGY),
			"dormir deveria restaurar a energia")
	assert(clock.day != day_before_sleep or clock.season > 0,
			"dormir pelo player também deveria avançar o dia")

	# Perto da cama, a interação deve dormir em vez de usar a ferramenta.
	var bed := StaticBody3D.new()
	bed.add_to_group("bed")
	bed.global_position = player.global_position
	root.add_child(bed)
	player._update_near_bed()
	assert(player._near_bed, "o player deveria se registrar perto da cama")
	player.energy = 50.0
	player._interact()
	assert(is_equal_approx(player.energy, player.MAX_ENERGY),
			"interagir perto da cama deveria dormir, não usar a ferramenta")

	player.queue_free()
	farm.queue_free()
	bed.queue_free()
