extends Node3D
## Cena inicial: gira o sol conforme o relógio do jogo e atualiza o HUD.

@onready var sun: DirectionalLight3D = $Sun
@onready var clock_label: Label = $HUD/ClockLabel


func _process(_delta: float) -> void:
	# 06:00 = nascer do sol (leste), 18:00 = pôr do sol (oeste).
	var t: float = GameClock.time_of_day / 24.0
	sun.rotation.x = -TAU * (t - 0.25)
	sun.light_energy = clampf(sin((t - 0.25) * TAU) * 1.4 + 0.2, 0.05, 1.4)
	clock_label.text = GameClock.clock_text()
