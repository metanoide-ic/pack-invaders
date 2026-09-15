class_name DummyTarget
extends StaticBody3D
## Alvo de teste estático pra validar dano/área das habilidades de ataque
## antes de existir IA/PvE de verdade. Sem comportamento, só recebe dano,
## pisca e "renasce" depois de um tempo pra poder testar de novo sem sair
## reiniciando a cena.

@export var max_health: float = 60.0
@export var respawn_delay: float = 2.0

@onready var mesh: MeshInstance3D = %Mesh
@onready var hit_flash_material: StandardMaterial3D = mesh.get_surface_override_material(0)

var health: float
var _base_color: Color
var _stun_timer: float = 0.0


func _ready() -> void:
	health = max_health
	# Duplica o material: sem isso, todas as instâncias desse .tscn
	# compartilham o mesmo StandardMaterial3D e um alvo piscando faria
	# TODOS os alvos piscarem juntos.
	hit_flash_material = hit_flash_material.duplicate()
	mesh.set_surface_override_material(0, hit_flash_material)
	_base_color = hit_flash_material.albedo_color


func _process(delta: float) -> void:
	if _stun_timer > 0.0:
		_stun_timer -= delta
		mesh.rotate_y(delta * 4.0)  # "atordoado" = gira feito pião, placeholder visual
	if hit_flash_material.albedo_color != _base_color:
		hit_flash_material.albedo_color = hit_flash_material.albedo_color.lerp(_base_color, 8.0 * delta)


func take_damage(amount: float, _source: Node = null) -> void:
	health -= amount
	hit_flash_material.albedo_color = Color(1, 1, 1)
	if health <= 0.0:
		_die()


func apply_stun(duration: float) -> void:
	_stun_timer = max(_stun_timer, duration)


func _die() -> void:
	GameEvents.target_destroyed.emit(self)
	visible = false
	set_collision_layer_value(3, false)
	await get_tree().create_timer(respawn_delay).timeout
	health = max_health
	visible = true
	set_collision_layer_value(3, true)
