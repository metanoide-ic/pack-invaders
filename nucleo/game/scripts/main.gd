extends Node3D
## Cena inicial: gira o sol conforme o relógio do jogo e conecta o HUD.

@onready var sun: DirectionalLight3D = $Sun
@onready var hud: CanvasLayer = $HUD
@onready var player: Player = $Player


const NPC_SPAWNS := [
	{"seed": 7, "pos": Vector3(-5, 0.1, 4)},
	{"seed": 21, "pos": Vector3(6, 0.1, 5)},
	{"seed": 42, "pos": Vector3(-3, 0.1, -5)},
]

const SPECIAL_SPAWNS := [
	{"kind": "nimbo", "seed": 100, "pos": Vector3(2, 0.1, -8)},
	{"kind": "cintila", "seed": 200, "pos": Vector3(-8, 0.1, -2)},
	{"kind": "broto", "seed": 300, "pos": Vector3(8, 0.1, -6)},
	{"kind": "prisma", "seed": 400, "pos": Vector3(-1, 0.1, 9)},
]


func _ready() -> void:
	hud.setup(player)
	for spawn: Dictionary in NPC_SPAWNS:
		add_child(NPC.create(spawn.seed, spawn.pos))
	for spawn: Dictionary in SPECIAL_SPAWNS:
		add_child(NPC.create_special(spawn.kind, spawn.seed, spawn.pos))


func _process(_delta: float) -> void:
	# 06:00 = nascer do sol (leste), 18:00 = pôr do sol (oeste).
	var t: float = GameClock.time_of_day / 24.0
	sun.rotation.x = -TAU * (t - 0.25)
	sun.light_energy = clampf(sin((t - 0.25) * TAU) * 1.4 + 0.2, 0.05, 1.4)
	hud.clock_label.text = GameClock.clock_text()
