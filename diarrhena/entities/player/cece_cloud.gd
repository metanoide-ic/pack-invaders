class_name CeceCloud
extends Area3D
## Nuvem de cecê: filha do jogador (se move junto), fica visível/ativa por
## `duration` segundos e aplica dano contínuo em quem estiver dentro.

@export var damage_per_tick: float = 3.0
@export var tick_interval: float = 0.5

var _tick_timer: float = 0.0


func activate(_duration: float) -> void:
	_tick_timer = 0.0


func _process(delta: float) -> void:
	if not visible:
		return
	_tick_timer -= delta
	if _tick_timer <= 0.0:
		_tick_timer = tick_interval
		_tick_damage()


func _tick_damage() -> void:
	for body in get_overlapping_bodies():
		if body.has_method(&"take_damage"):
			body.take_damage(damage_per_tick, get_parent())
			GameEvents.target_damaged.emit(body, damage_per_tick, &"cece")
