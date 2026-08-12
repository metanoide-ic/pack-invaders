extends SceneTree
## Teste de fumaça do loop de farming (roda sem janela):
##   godot --headless --script res://tests/farm_test.gd

func _initialize() -> void:
	var farm: Node3D = load("res://scripts/farm_grid.gd").new()
	root.add_child(farm)
	if not farm.is_node_ready():
		farm._ready()  # em modo --script o _ready não roda automaticamente

	var harvested: Array[String] = []
	farm.crop_harvested.connect(func(id: String, _n: String) -> void: harvested.append(id))

	var cell := Vector2i(0, 0)
	assert(farm.use_tool("hoe", cell) == "Solo preparado")
	assert(farm.use_tool("hoe", cell) == "", "enxada em solo já preparado não faz nada")
	assert(farm.use_tool("seed_turnip", cell) == "Você plantou: Nabo")
	assert(farm.use_tool("seed_pumpkin", cell) == "", "célula ocupada não aceita outra semente")
	assert(farm.use_tool("can", cell) == "Regado")

	# Nabo leva 3 dias regados para amadurecer.
	for i in 2:
		farm._on_day_changed(i + 2, 0)
		assert(farm.use_tool("hand", cell) == "", "ainda não amadureceu")
		assert(farm.use_tool("can", cell) == "Regado")
	farm._on_day_changed(4, 0)

	assert(farm.use_tool("hand", cell) == "Você colheu: Nabo!")
	assert(harvested == ["turnip"])
	assert(farm.use_tool("seed_pumpkin", cell) == "Você plantou: Abóbora",
			"célula colhida aceita novo plantio")

	# Sem rega, não cresce.
	farm._on_day_changed(5, 0)
	farm._on_day_changed(6, 0)
	assert(farm._cells[cell].days == 0, "planta sem rega não deve crescer")

	print("farm_test OK")
	quit(0)
