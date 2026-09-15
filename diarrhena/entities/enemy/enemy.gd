class_name Enemy
extends CharacterBody3D
## Primeiro inimigo de verdade do PvE: persegue o jogador por distância
## (sem NavMesh ainda — a arena de teste não tem obstáculos que exijam
## pathfinding) e ataca corpo a corpo quando chega perto. Recebe dano e
## atordoamento pelas mesmas interfaces do dummy_target (`take_damage`,
## `apply_stun`), então qualquer habilidade de ataque já funciona nele
## sem mudar nada no player.gd.

@export var max_health: float = 40.0
@export var move_speed: float = 4.5
@export var detection_range: float = 14.0
@export var attack_range: float = 1.8
@export var attack_damage: float = 8.0
@export var attack_interval: float = 1.2
@export var respawn_delay: float = 3.0

@onready var mesh: MeshInstance3D = %Mesh

const GRAVITY: float = 22.0

enum State { IDLE, CHASE, ATTACK, STUNNED, DEAD }

var state: State = State.IDLE
var health: float
var _stun_timer: float = 0.0
var _attack_cd: float = 0.0
var _base_color: Color
var _flash_material: StandardMaterial3D
var _spawn_transform: Transform3D
var _player: Node3D = null


func _ready() -> void:
	health = max_health
	_spawn_transform = global_transform
	_flash_material = mesh.get_surface_override_material(0).duplicate()
	mesh.set_surface_override_material(0, _flash_material)
	_base_color = _flash_material.albedo_color
	# Espera um frame pra garantir que o Player já entrou na árvore antes de
	# procurar pelo grupo (a ordem de _ready entre nós irmãos não é garantida).
	call_deferred(&"_find_player")


func _find_player() -> void:
	var players := get_tree().get_nodes_in_group(&"player")
	if not players.is_empty():
		_player = players[0]


func _physics_process(delta: float) -> void:
	if state == State.DEAD:
		return

	if not is_on_floor():
		velocity.y -= GRAVITY * delta

	if _stun_timer > 0.0:
		_stun_timer -= delta
		state = State.STUNNED
		velocity.x = move_toward(velocity.x, 0.0, move_speed * 4.0 * delta)
		velocity.z = move_toward(velocity.z, 0.0, move_speed * 4.0 * delta)
		move_and_slide()
		return

	if _player == null or not is_instance_valid(_player):
		move_and_slide()
		return

	_attack_cd -= delta
	var to_player: Vector3 = _player.global_position - global_position
	var flat_to_player := Vector3(to_player.x, 0, to_player.z)
	var dist_flat := flat_to_player.length()

	if dist_flat <= attack_range:
		state = State.ATTACK
		velocity.x = move_toward(velocity.x, 0.0, move_speed * 4.0 * delta)
		velocity.z = move_toward(velocity.z, 0.0, move_speed * 4.0 * delta)
		_face(flat_to_player)
		if _attack_cd <= 0.0:
			_attack_cd = attack_interval
			if _player.has_method(&"take_damage"):
				_player.take_damage(attack_damage, self)
	elif dist_flat <= detection_range:
		state = State.CHASE
		var dir := flat_to_player.normalized()
		velocity.x = move_toward(velocity.x, dir.x * move_speed, move_speed * 6.0 * delta)
		velocity.z = move_toward(velocity.z, dir.z * move_speed, move_speed * 6.0 * delta)
		_face(flat_to_player)
	else:
		state = State.IDLE
		velocity.x = move_toward(velocity.x, 0.0, move_speed * 2.0 * delta)
		velocity.z = move_toward(velocity.z, 0.0, move_speed * 2.0 * delta)

	move_and_slide()


func _face(flat_direction: Vector3) -> void:
	if flat_direction.length() < 0.05:
		return
	var target := global_position + flat_direction.normalized()
	look_at(target, Vector3.UP)


func take_damage(amount: float, _source: Node = null) -> void:
	if state == State.DEAD:
		return
	health -= amount
	_flash_material.albedo_color = Color(1, 1, 1)
	if health <= 0.0:
		_die()


func apply_stun(duration: float) -> void:
	if state == State.DEAD:
		return
	_stun_timer = max(_stun_timer, duration)


func _process(delta: float) -> void:
	if _flash_material.albedo_color != _base_color:
		_flash_material.albedo_color = _flash_material.albedo_color.lerp(_base_color, 8.0 * delta)


func _die() -> void:
	state = State.DEAD
	GameEvents.target_destroyed.emit(self)
	visible = false
	set_collision_layer_value(3, false)
	await get_tree().create_timer(respawn_delay).timeout
	health = max_health
	global_transform = _spawn_transform
	velocity = Vector3.ZERO
	visible = true
	set_collision_layer_value(3, true)
	state = State.IDLE
