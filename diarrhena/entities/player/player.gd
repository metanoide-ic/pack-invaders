class_name Player
extends CharacterBody3D
## Controlador do jogador de Diarrhena: parkour em primeira pessoa (corrida
## na parede, pulo na parede, deslize) + sistema de loadout (3 slots de arma
## no mouse + 2 slots de suporte em R/C, cada um trocável por uma habilidade
## de um pool maior — ver README). Tudo roda em _physics_process (skill
## godot-prompter-player-controller, seção 1: nunca mover física em _process).

# ---------------------------------------------------------------------------
# Locomoção
# ---------------------------------------------------------------------------
@export_group("Locomoção")
@export var walk_speed: float = 7.5  ## velocidade normal — não tem "correr", o jogador já anda nessa velocidade
@export var crouch_speed: float = 3.5
@export var ground_acceleration: float = 14.0
@export var air_acceleration: float = 5.0
@export var friction: float = 10.0
@export var jump_velocity: float = 8.5
@export var mouse_sensitivity: float = 0.0025
@export var coyote_time: float = 0.12
@export var jump_buffer_time: float = 0.12

@export_group("Corrida na parede")
@export var wall_run_min_speed: float = 3.5
@export var wall_run_gravity_scale: float = 0.12
@export var wall_run_speed: float = 8.5
@export var wall_run_max_duration: float = 2.5
@export var wall_jump_push: float = 7.0
@export var wall_jump_up: float = 7.5
@export var wall_check_distance: float = 0.9

@export_group("Deslize")
@export var slide_speed_boost: float = 4.0
@export var slide_duration: float = 0.6
@export var slide_collision_height: float = 0.9

@export_group("Recursos e vida")
@export var max_health: float = 100.0
@export var max_resource: float = 100.0
@export var resource_regen_rate: float = 14.0
@export var resource_regen_delay: float = 0.6

@export_group("Câmera / game feel")
@export var base_fov: float = 78.0
@export var boost_fov_kick: float = 9.0
@export var shake_decay: float = 1.4
@export var shake_max_offset: float = 0.12
@export var shake_max_roll: float = 0.05

@export_group("Loadout")
## 3 slots de arma (clique esquerdo/meio/direito) + 2 de suporte (R/C).
## Trocar o id aqui (ou por uma UI de loadout futura) troca a habilidade —
## o dispatch em _on_slot_pressed/_slot_action_held já entende qualquer id
## do pool. Passivas (ex: "sebo", "espinhas_passiva") não precisam de botão,
## só de estar equipadas em algum slot.
@export var weapon_slot_1: StringName = &"espinhas"  # clique esquerdo
@export var weapon_slot_2: StringName = &"coco"       # clique do meio
@export var weapon_slot_3: StringName = &"vomito"     # clique direito
@export var support_slot_r: StringName = &"choro"     # R
@export var support_slot_c: StringName = &"suor"      # C

@export_group("Suor")
@export var suor_max_bonus: float = 0.8       ## até +80% de velocidade no talo
@export var suor_buildup_rate: float = 0.5    ## por segundo segurando
@export var suor_decay_rate: float = 0.6      ## por segundo sem segurar
@export var suor_control_loss: float = 0.6    ## 0..1 — quanto reduz a aceleração de direção

@export_group("Melee / Unhas")
@export var melee_range: float = 2.2
@export var melee_damage: float = 22.0
@export var nail_max_charges: int = 5
@export var nail_bonus_multiplier: float = 2.2
@export var nail_regrow_interval: float = 4.0

@export_group("Vômito / Vômito de sangue")
@export var vomito_channel_dps: float = 30.0
@export var vomito_channel_cost_per_sec: float = 20.0
@export var vomito_sangue_dps: float = 70.0
@export var vomito_sangue_self_dps: float = 12.0

@export_group("Hemorróida Explosiva")
@export var hemorroida_min_damage: float = 15.0
@export var hemorroida_max_damage: float = 90.0
@export var hemorroida_self_damage_ratio: float = 0.5  ## segurar até o fim tira até 50% da vida MÁXIMA
@export var hemorroida_radius: float = 5.0
@export var hemorroida_max_range: float = 30.0

@export_group("Peido (arma)")
@export var peido_damage: float = 26.0
@export var peido_forward_push: float = 6.0

@export_group("Milho")
@export var milho_interval: float = 0.06
@export var milho_damage: float = 6.0
@export var milho_speed: float = 40.0

@export_group("Cera de ouvido")
@export var earwax_interval: float = 0.4
@export var earwax_stick_duration: float = 2.5

@export_group("Espinhas (passiva)")
@export var espinhas_passiva_count: int = 8
@export var espinhas_passiva_damage: float = 5.0

@export_group("Sebo / Pus / Bile / Adrenalina")
@export var sebo_damage_reduction: float = 0.3
@export var pus_self_dps: float = 18.0
@export var bile_gravity_scale: float = 0.55
@export var bile_jump_mult: float = 1.4
@export var bile_resource_cost_per_sec: float = 16.0
@export var adrenaline_duration: float = 10.0
@export var adrenaline_speed_mult: float = 1.7

@export_group("Caspa")
@export var caspa_damage: float = 24.0
@export var caspa_explosion_radius: float = 2.2

@export_group("Piolho (passiva)")
@export var piolho_radius: float = 3.0
@export var piolho_dps: float = 4.0

@export_group("Mosca (passiva)")
@export var mosca_max: int = 5
@export var mosca_regrow_interval: float = 6.0

@export_group("Necrose (passiva)")
## "Só te ferra": começa a contar assim que equipada e mata o jogador se o
## objetivo do nível não for cumprido antes. Passa pelo take_damage normal
## (dano gigante), então Mosca/Sebo/vida-extra do Pus podem atrasar/mitigar
## o golpe final — é emergente, não é bug.
@export var necrose_duration: float = 90.0

const GRAVITY: float = 22.0

# ---------------------------------------------------------------------------
# Nós
# ---------------------------------------------------------------------------
@onready var head: Node3D = %Head
@onready var camera: Camera3D = %Camera3D
@onready var collision_shape: CollisionShape3D = %CollisionShape3D
@onready var mouth_marker: Marker3D = %MouthMarker
@onready var nose_left_marker: Marker3D = %NoseLeftMarker
@onready var nose_right_marker: Marker3D = %NoseRightMarker
@onready var wall_ray_left: RayCast3D = %WallRayLeft
@onready var wall_ray_right: RayCast3D = %WallRayRight
@onready var cece_cloud: Node3D = %CeceCloud
@onready var grapple_line_left: MeshInstance3D = %GrappleLineLeft
@onready var grapple_line_right: MeshInstance3D = %GrappleLineRight

# ---------------------------------------------------------------------------
# Estado
# ---------------------------------------------------------------------------
enum MoveState { GROUND, AIR, WALL_RUN, SLIDE }

var move_state: MoveState = MoveState.AIR
var _last_reported_state: MoveState = MoveState.AIR
var health: float = max_health
var bonus_health: float = 0.0  ## "vida extra" do Pus — escudo consumido antes da vida normal
var resource: float = max_resource
var _resource_regen_cd: float = 0.0

var _coyote_timer: float = 0.0
var _jump_buffer_timer: float = 0.0
var _standing_shape_height: float = 1.8
var _slide_timer: float = 0.0
var _is_crouching: bool = false

# Corrida na parede
var _wall_run_normal: Vector3 = Vector3.ZERO
var _wall_run_timer: float = 0.0
var _wall_run_side: int = 0  # -1 esquerda, 1 direita
var _wall_run_tilt: float = 0.0  # inclinação de câmera já suavizada (rad)

# Câmera / game feel
var _camera_trauma: float = 0.0
var _shake_time: float = 0.0

# F — mira invertida (cu pra frente): habilidades que iam pra trás vão pra
# frente; usar o Mijo assim bate na cara do jogador (ver _fire_mijo).
var _aim_reversed: bool = false

# Cooldowns por habilidade discreta (segundos restantes)
var _cooldowns: Dictionary = {
	&"coco": 0.0,
	&"meleca_left": 0.0,
	&"meleca_right": 0.0,
	&"catarro": 0.0,
	&"arroto": 0.0,
	&"cece": 0.0,
	&"melee": 0.0,
	&"mijo": 0.0,
	&"peido": 0.0,
	&"caspa": 0.0,
}
const COOLDOWN_TIMES: Dictionary = {
	&"coco": 0.35,
	&"meleca_left": 0.25,
	&"meleca_right": 0.25,
	&"catarro": 0.9,
	&"arroto": 1.8,
	&"cece": 12.0,
	&"melee": 0.5,
	&"mijo": 0.6,
	&"peido": 1.2,
	&"caspa": 3.0,
}
const MIJO_COST: float = 22.0

# Cuspe (ataque carregável)
var _cuspe_charging: bool = false
var _cuspe_charge: float = 0.0
const CUSPE_MAX_CHARGE: float = 1.4

# Hemorróida Explosiva (carrega, solta mira num ponto, dano em área + self-dano)
var _hemorroida_charging: bool = false
var _hemorroida_charge: float = 0.0
const HEMORROIDA_MAX_CHARGE: float = 3.0

# Espinhas (disparo rápido)
var _espinhas_cd: float = 0.0
const ESPINHAS_INTERVAL: float = 0.09

# Milho (metralhadora parado, perfura)
var _milho_cd: float = 0.0

# Cera de ouvido (passiva — poças no chão)
var _earwax_cd: float = 0.0

# Unhas não cortadas (passiva — melee mais forte, gasta e regenera)
var _nail_charges: int = 0
var _nail_regrow_cd: float = 0.0

# Suor (velocidade x controle)
var _suor_charge: float = 0.0
var _suor_wobble_phase: float = 0.0

# Vômito de bile (leve, pula mais alto, bloqueia dano)
var _bile_active: bool = false

# Pus (toma dano enquanto segura, vira escudo ao soltar)
var _pus_active: bool = false
var _pus_accum: float = 0.0

# Adrenalina (passiva — segunda chance ao "morrer")
var _invincible: bool = false
var _adrenaline_used: bool = false
var _adrenaline_timer: float = 0.0

# Piolho (passiva — morde inimigos próximos sozinho)
var _piolho_tick_cd: float = 0.0

# Mosca (passiva — escudo que absorve golpe por golpe, morrendo uma a uma)
var _mosca_count: int = 0
var _mosca_regrow_cd: float = 0.0

# Necrose (passiva — só ferra: mata o jogador se a fase não acabar a tempo)
var _necrose_timer: float = -1.0  # -1 = ainda não começou a contar
var _necrose_active: bool = false

# Meleca (grappling duplo — cada nostril tem seu próprio gancho)
var _grapple_left_point: Variant = null   # Vector3 ou null
var _grapple_right_point: Variant = null
const GRAPPLE_MAX_RANGE: float = 28.0
const GRAPPLE_PULL_ACCEL: float = 40.0
const GRAPPLE_ROPE_SLACK: float = 0.4  # não puxa se já está dentro da corda + folga

# Cecê (nuvem em área que segue o jogador)
var _cece_active: bool = false
var _cece_timer: float = 0.0
const CECE_DURATION: float = 5.0

const POOP_PROJECTILE := preload("res://entities/player/projectiles/poop_projectile.tscn")
const CUSPE_PROJECTILE := preload("res://entities/player/projectiles/cuspe_projectile.tscn")
const CATARRO_PROJECTILE := preload("res://entities/player/projectiles/catarro_projectile.tscn")
const ESPINHA_PROJECTILE := preload("res://entities/player/projectiles/espinha_projectile.tscn")
const MILHO_PROJECTILE := preload("res://entities/player/projectiles/milho_projectile.tscn")
const EARWAX_PUDDLE := preload("res://entities/player/projectiles/earwax_puddle.tscn")
const CASPA_PILE := preload("res://entities/player/projectiles/caspa_pile.tscn")

# Ids de habilidade que gastam energia/atacam — bloqueados durante a Bile
# ("fica incapaz de usar qualquer skill de dano pelo tempo de duração").
const BILE_BLOCKED_PRESS_IDS: Array[StringName] = [
	&"coco", &"catarro", &"arroto", &"peido", &"cuspe", &"hemorroida", &"cece", &"caspa",
]


func _ready() -> void:
	add_to_group(&"player")
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	_standing_shape_height = (collision_shape.shape as CapsuleShape3D).height
	_nail_charges = nail_max_charges
	_mosca_count = mosca_max
	wall_ray_left.target_position = Vector3(-wall_check_distance, 0, 0)
	wall_ray_right.target_position = Vector3(wall_check_distance, 0, 0)
	GameEvents.objective_completed.connect(_on_objective_completed_disarms_necrose)
	GameEvents.player_health_changed.emit(health, max_health)
	GameEvents.player_resource_changed.emit(resource, max_resource)


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		rotate_y(-event.relative.x * mouse_sensitivity)
		head.rotate_x(-event.relative.y * mouse_sensitivity)
		head.rotation.x = clamp(head.rotation.x, -deg_to_rad(89.0), deg_to_rad(89.0))

	if event.is_action_pressed(&"pause_menu"):
		Input.mouse_mode = (
			Input.MOUSE_MODE_VISIBLE
			if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED
			else Input.MOUSE_MODE_CAPTURED
		)

	if event.is_action_pressed(&"jump"):
		_jump_buffer_timer = jump_buffer_time

	if event.is_action_pressed(&"ability_aim_reverse"):
		_aim_reversed = not _aim_reversed

	if event.is_action_pressed(&"ability_mijo"):
		_fire_mijo()

	if event.is_action_pressed(&"ability_melee"):
		_fire_melee()

	if event.is_action_pressed(&"ability_meleca_left"):
		_toggle_meleca(-1)
	if event.is_action_pressed(&"ability_meleca_right"):
		_toggle_meleca(1)

	if event.is_action_pressed(&"weapon_slot_1"):
		_on_slot_pressed(weapon_slot_1)
	if event.is_action_released(&"weapon_slot_1"):
		_on_slot_released(weapon_slot_1)
	if event.is_action_pressed(&"weapon_slot_2"):
		_on_slot_pressed(weapon_slot_2)
	if event.is_action_released(&"weapon_slot_2"):
		_on_slot_released(weapon_slot_2)
	if event.is_action_pressed(&"weapon_slot_3"):
		_on_slot_pressed(weapon_slot_3)
	if event.is_action_released(&"weapon_slot_3"):
		_on_slot_released(weapon_slot_3)
	if event.is_action_pressed(&"support_slot_r"):
		_on_slot_pressed(support_slot_r)
	if event.is_action_released(&"support_slot_r"):
		_on_slot_released(support_slot_r)
	if event.is_action_pressed(&"support_slot_c"):
		_on_slot_pressed(support_slot_c)
	if event.is_action_released(&"support_slot_c"):
		_on_slot_released(support_slot_c)


func _physics_process(delta: float) -> void:
	_tick_cooldowns(delta)
	_update_move_state()
	_apply_gravity_and_wall_run(delta)
	_handle_jump(delta)
	_handle_ground_air_movement(delta)
	_handle_continuous_abilities(delta)
	_handle_grapple_pull(delta)
	_update_grapple_lines()
	_handle_slide(delta)
	_tick_cuspe_charge(delta)
	_tick_hemorroida_charge(delta)
	_tick_suor(delta)
	_tick_bile(delta)
	_tick_pus(delta)
	_tick_adrenaline(delta)
	_tick_nail_regrow(delta)
	_tick_earwax(delta)
	_tick_piolho(delta)
	_tick_mosca(delta)
	_tick_necrose(delta)
	if _slot_action_held(&"espinhas"):
		_tick_espinhas(delta)
	if _slot_action_held(&"vomito"):
		_tick_vomito(delta)
	if _slot_action_held(&"vomito_sangue"):
		_tick_vomito_sangue(delta)
	if _slot_action_held(&"milho"):
		_tick_milho(delta)
	_regen_resource(delta)

	move_and_slide()

	if move_state != _last_reported_state:
		_last_reported_state = move_state
		GameEvents.movement_state_changed.emit(MoveState.keys()[move_state])


# ---------------------------------------------------------------------------
# Loadout — indireção de slot pra qualquer habilidade do pool
# ---------------------------------------------------------------------------
func _has_ability_equipped(id: StringName) -> bool:
	return id in [weapon_slot_1, weapon_slot_2, weapon_slot_3, support_slot_r, support_slot_c]


func _slot_action_held(id: StringName) -> bool:
	if weapon_slot_1 == id and Input.is_action_pressed(&"weapon_slot_1"):
		return true
	if weapon_slot_2 == id and Input.is_action_pressed(&"weapon_slot_2"):
		return true
	if weapon_slot_3 == id and Input.is_action_pressed(&"weapon_slot_3"):
		return true
	if support_slot_r == id and Input.is_action_pressed(&"support_slot_r"):
		return true
	if support_slot_c == id and Input.is_action_pressed(&"support_slot_c"):
		return true
	return false


func _on_slot_pressed(id: StringName) -> void:
	if _bile_active and id in BILE_BLOCKED_PRESS_IDS:
		return
	match id:
		&"coco": _fire_coco()
		&"catarro": _fire_catarro()
		&"arroto": _fire_arroto()
		&"cece": _toggle_cece()
		&"peido": _fire_peido_weapon()
		&"caspa": _fire_caspa()
		&"cuspe":
			_cuspe_charging = true
			_cuspe_charge = 0.0
		&"hemorroida":
			_hemorroida_charging = true
			_hemorroida_charge = 0.0
		&"bile":
			_bile_active = true
		&"pus":
			_pus_active = true
			_pus_accum = 0.0
		_:
			pass  # espinhas/vomito/vomito_sangue/milho são hold (ver _physics_process); passivas não usam botão


func _on_slot_released(id: StringName) -> void:
	match id:
		&"cuspe": _release_cuspe()
		&"hemorroida": _release_hemorroida()
		&"bile": _bile_active = false
		&"pus": _release_pus()
		_: pass


# ---------------------------------------------------------------------------
# Estado de movimento / corrida na parede
# ---------------------------------------------------------------------------
func _update_move_state() -> void:
	if is_on_floor():
		_coyote_timer = coyote_time
		move_state = MoveState.SLIDE if _slide_timer > 0.0 else MoveState.GROUND
		_wall_run_timer = 0.0
		return

	_coyote_timer -= get_physics_process_delta_time()

	var horizontal_speed := Vector2(velocity.x, velocity.z).length()
	var can_wall_run := horizontal_speed >= wall_run_min_speed and _wall_run_timer < wall_run_max_duration

	if can_wall_run and wall_ray_right.is_colliding():
		_enter_wall_run(wall_ray_right.get_collision_normal(), 1)
		return
	if can_wall_run and wall_ray_left.is_colliding():
		_enter_wall_run(wall_ray_left.get_collision_normal(), -1)
		return

	if move_state == MoveState.WALL_RUN:
		# Sai da corrida na parede se não há mais parede detectada dos dois lados.
		if not wall_ray_left.is_colliding() and not wall_ray_right.is_colliding():
			move_state = MoveState.AIR
	else:
		move_state = MoveState.AIR


func _enter_wall_run(normal: Vector3, side: int) -> void:
	move_state = MoveState.WALL_RUN
	_wall_run_normal = normal
	_wall_run_side = side


func _apply_gravity_and_wall_run(delta: float) -> void:
	if move_state == MoveState.WALL_RUN:
		_wall_run_timer += delta
		velocity.y -= GRAVITY * wall_run_gravity_scale * delta
		# Direção de corrida = componente do "forward" da câmera projetada no
		# plano da parede (perpendicular à normal), mantendo altura.
		var forward := -head.global_transform.basis.z
		var along_wall := forward.slide(_wall_run_normal).normalized()
		if along_wall.length() < 0.1:
			along_wall = -velocity.normalized().slide(_wall_run_normal).normalized()
		var target := along_wall * wall_run_speed
		velocity.x = move_toward(velocity.x, target.x, wall_run_speed * 6.0 * delta)
		velocity.z = move_toward(velocity.z, target.z, wall_run_speed * 6.0 * delta)
		# leve puxão pra dentro da parede pra não descolar
		velocity -= _wall_run_normal * 2.0 * delta
		_apply_camera_tilt(delta, deg_to_rad(9.0) * -_wall_run_side)
	else:
		if not is_on_floor():
			var g_scale := bile_gravity_scale if _bile_active else 1.0
			velocity.y -= GRAVITY * g_scale * delta
		_apply_camera_tilt(delta, 0.0)


func _apply_camera_tilt(delta: float, target_roll: float) -> void:
	# Só guarda o alvo suavizado — quem escreve em camera.rotation.z de
	# verdade é _update_camera_feel() no _process, que também soma o shake.
	_wall_run_tilt = lerp(_wall_run_tilt, target_roll, 10.0 * delta)


func _handle_jump(_delta: float) -> void:
	if _jump_buffer_timer <= 0.0:
		return

	var jump_mult := bile_jump_mult if _bile_active else 1.0

	if move_state == MoveState.WALL_RUN:
		velocity += _wall_run_normal * wall_jump_push
		velocity.y = wall_jump_up * jump_mult
		move_state = MoveState.AIR
		_wall_run_timer = wall_run_max_duration  # evita regrudar na mesma parede
		_jump_buffer_timer = 0.0
		add_camera_trauma(0.1)
	elif _coyote_timer > 0.0:
		velocity.y = jump_velocity * jump_mult
		_coyote_timer = 0.0
		_jump_buffer_timer = 0.0

	_jump_buffer_timer -= get_physics_process_delta_time()


func _handle_ground_air_movement(delta: float) -> void:
	if move_state == MoveState.WALL_RUN or _slide_timer > 0.0:
		return

	var input_dir := Input.get_vector(&"move_left", &"move_right", &"move_forward", &"move_back")
	var basis := transform.basis
	var direction := (basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()

	var target_speed := crouch_speed if _is_crouching else walk_speed
	var speed_mult := 1.0 + _suor_charge * suor_max_bonus
	if _invincible:
		speed_mult *= adrenaline_speed_mult
	target_speed *= speed_mult

	var base_accel := ground_acceleration if is_on_floor() else air_acceleration
	var accel := base_accel * (1.0 - _suor_charge * suor_control_loss)

	if direction != Vector3.ZERO:
		velocity.x = move_toward(velocity.x, direction.x * target_speed, accel * delta)
		velocity.z = move_toward(velocity.z, direction.z * target_speed, accel * delta)
	elif is_on_floor():
		velocity.x = move_toward(velocity.x, 0.0, friction * delta)
		velocity.z = move_toward(velocity.z, 0.0, friction * delta)

	# Suor: quanto mais "suado", mais o jogador perde a direção — um leve
	# vaivém lateral que ele não controla.
	if _suor_charge > 0.05:
		_suor_wobble_phase += delta * 14.0
		var right := basis.x
		velocity += right * sin(_suor_wobble_phase) * _suor_charge * 6.0 * delta


func _handle_slide(delta: float) -> void:
	var wants_crouch := Input.is_action_pressed(&"crouch")
	var capsule := collision_shape.shape as CapsuleShape3D

	if wants_crouch and is_on_floor() and _slide_timer <= 0.0 and velocity.length() > walk_speed * 0.8:
		_slide_timer = slide_duration
		var forward_flat := Vector3(velocity.x, 0, velocity.z).normalized()
		velocity += forward_flat * slide_speed_boost

	_is_crouching = wants_crouch

	if _slide_timer > 0.0:
		_slide_timer -= delta
		capsule.height = lerp(capsule.height, slide_collision_height, 12.0 * delta)
	elif wants_crouch:
		capsule.height = lerp(capsule.height, slide_collision_height, 8.0 * delta)
	else:
		capsule.height = lerp(capsule.height, _standing_shape_height, 8.0 * delta)


# ---------------------------------------------------------------------------
# Suor: hold em C (slot de suporte padrão) — sobe rápido, decai devagar
# ---------------------------------------------------------------------------
func _tick_suor(delta: float) -> void:
	if _slot_action_held(&"suor"):
		_suor_charge = min(1.0, _suor_charge + suor_buildup_rate * delta)
	else:
		_suor_charge = max(0.0, _suor_charge - suor_decay_rate * delta)


# ---------------------------------------------------------------------------
# Recursos (energia compartilhada pelas habilidades contínuas) e vida
# ---------------------------------------------------------------------------
func _regen_resource(delta: float) -> void:
	if _resource_regen_cd > 0.0:
		_resource_regen_cd -= delta
		return
	if resource < max_resource:
		resource = min(max_resource, resource + resource_regen_rate * delta)
		GameEvents.player_resource_changed.emit(resource, max_resource)


func _spend_resource(amount: float) -> bool:
	if resource < amount:
		return false
	resource -= amount
	_resource_regen_cd = resource_regen_delay
	GameEvents.player_resource_changed.emit(resource, max_resource)
	return true


func take_damage(amount: float, _source: Node = null) -> void:
	if _invincible:
		return

	# Mosca: cada golpe consome uma mosca em vez de vida — elas vão
	# morrendo uma a uma como um escudinho, até acabar.
	if _has_ability_equipped(&"mosca") and _mosca_count > 0:
		_mosca_count -= 1
		return

	var incoming := amount
	if _has_ability_equipped(&"sebo"):
		incoming *= (1.0 - sebo_damage_reduction)
	if bonus_health > 0.0:
		var absorbed: float = min(bonus_health, incoming)
		bonus_health -= absorbed
		incoming -= absorbed

	health = clamp(health - incoming, 0.0, max_health)

	# Adrenalina: "the indomitable human spirit" — em vez de morrer, o
	# jogador fica invencível e rápido por um tempo pra tentar reverter o
	# jogo antes de morrer de vez (não existe game over/morte real ainda
	# no protótipo, então isso é o gancho mecânico pronto pra quando existir).
	if health <= 0.0 and _has_ability_equipped(&"adrenalina") and not _adrenaline_used:
		_adrenaline_used = true
		health = 1.0
		_invincible = true
		_adrenaline_timer = adrenaline_duration

	GameEvents.player_health_changed.emit(health, max_health)
	add_camera_trauma(clamp(incoming / 35.0, 0.0, 0.7))
	_trigger_espinhas_retaliation()


func heal(amount: float) -> void:
	health = clamp(health + amount, 0.0, max_health)
	GameEvents.player_health_changed.emit(health, max_health)


func reset_position(to: Vector3) -> void:
	## Usado pela KillZone da arena de teste (caiu no vazio = volta pro spawn).
	global_position = to
	velocity = Vector3.ZERO


func _tick_cooldowns(delta: float) -> void:
	for key in _cooldowns.keys():
		if _cooldowns[key] > 0.0:
			_cooldowns[key] = max(0.0, _cooldowns[key] - delta)


func _start_cooldown(id: StringName) -> void:
	_cooldowns[id] = COOLDOWN_TIMES[id]
	GameEvents.ability_cooldown_started.emit(id, COOLDOWN_TIMES[id])


func _off_cooldown(id: StringName) -> bool:
	return _cooldowns.get(id, 0.0) <= 0.0


# ---------------------------------------------------------------------------
# Habilidades contínuas fixas (não fazem parte do loadout trocável):
# Diarreia (Espaço no ar) e Choro (enquanto for o suporte equipado em R/C)
# ---------------------------------------------------------------------------
func _handle_continuous_abilities(delta: float) -> void:
	var forward := -head.global_transform.basis.z
	var flat_forward := Vector3(forward.x, 0, forward.z).normalized()

	var diarreia_active := (
		not is_on_floor()
		and Input.is_action_pressed(&"ability_diarreia")
		and _spend_resource(28.0 * delta)
	)
	if diarreia_active:
		velocity += (flat_forward * 16.0 + Vector3.UP * 9.0) * delta
	GameEvents.ability_state_changed.emit(&"diarreia", diarreia_active)

	var choro_active := (
		_slot_action_held(&"choro")
		and health < max_health
		and _spend_resource(18.0 * delta)
	)
	if choro_active:
		heal(14.0 * delta)
	GameEvents.ability_state_changed.emit(&"choro", choro_active)


# ---------------------------------------------------------------------------
# Mijo: rajada instantânea pra cima e pra trás (scroll pra trás). Com a mira
# invertida (F), sai pra cima e pra FRENTE — e bate na cara do jogador.
# ---------------------------------------------------------------------------
func _fire_mijo() -> void:
	if not _off_cooldown(&"mijo"):
		return
	if not _spend_resource(MIJO_COST):
		return
	_start_cooldown(&"mijo")

	var forward := -head.global_transform.basis.z
	var flat_forward := Vector3(forward.x, 0, forward.z).normalized()

	if _aim_reversed:
		velocity += flat_forward * 9.0 + Vector3.UP * 11.0
		GameEvents.screen_tint_flash.emit(Color(0.85, 0.75, 0.15, 0.4), 2.5)
	else:
		velocity += -flat_forward * 9.0 + Vector3.UP * 11.0


# ---------------------------------------------------------------------------
# Cocô: projétil de ataque com recuo no jogador (direção oposta ao lançamento)
# ---------------------------------------------------------------------------
func _fire_coco() -> void:
	if not _off_cooldown(&"coco"):
		return
	_start_cooldown(&"coco")

	var aim_dir := -camera.global_transform.basis.z
	var poop := POOP_PROJECTILE.instantiate()
	get_tree().current_scene.add_child(poop)
	poop.global_position = mouth_marker.global_position
	poop.launch(aim_dir, 26.0, self)

	# Recuo: empurra o jogador na direção OPOSTA ao lançamento. Mirando pra
	# trás e "atirando pra frente" (relativo ao cu) dá um boost pra frente,
	# tipo a Matilda do Angry Birds.
	velocity -= aim_dir * 11.0
	add_camera_trauma(0.15)


# ---------------------------------------------------------------------------
# Meleca: grappling hook duplo (narina esquerda Q / direita E) — aperta de
# novo na mesma tecla pra soltar
# ---------------------------------------------------------------------------
func _toggle_meleca(side: int) -> void:
	var id: StringName = &"meleca_left" if side < 0 else &"meleca_right"
	var current_point: Variant = _grapple_left_point if side < 0 else _grapple_right_point

	if current_point != null:
		if side < 0:
			_grapple_left_point = null
		else:
			_grapple_right_point = null
		return

	if not _off_cooldown(id):
		return

	var space_state := get_world_3d().direct_space_state
	var from := camera.global_position
	var to := from + (-camera.global_transform.basis.z) * GRAPPLE_MAX_RANGE
	var query := PhysicsRayQueryParameters3D.create(from, to)
	query.exclude = [get_rid()]
	var result := space_state.intersect_ray(query)

	if result.is_empty():
		return

	_start_cooldown(id)
	if side < 0:
		_grapple_left_point = result.position
	else:
		_grapple_right_point = result.position


func _handle_grapple_pull(delta: float) -> void:
	var points: Array = []
	if _grapple_left_point != null:
		points.append(_grapple_left_point)
	if _grapple_right_point != null:
		points.append(_grapple_right_point)

	if points.is_empty():
		return

	for point in points:
		var to_point: Vector3 = point - global_position
		var distance := to_point.length()
		if distance > GRAPPLE_ROPE_SLACK:
			var pull_dir := to_point.normalized()
			velocity += pull_dir * GRAPPLE_PULL_ACCEL * delta
			var radial_speed := velocity.dot(pull_dir)
			if radial_speed < 0.0:
				velocity -= pull_dir * radial_speed * 0.6 * delta * 10.0


func _update_grapple_lines() -> void:
	_update_one_grapple_line(grapple_line_left, nose_left_marker, _grapple_left_point)
	_update_one_grapple_line(grapple_line_right, nose_right_marker, _grapple_right_point)


func _update_one_grapple_line(line: MeshInstance3D, from_marker: Marker3D, point: Variant) -> void:
	if point == null:
		line.visible = false
		return

	var from: Vector3 = from_marker.global_position
	var to: Vector3 = point
	var diff := to - from
	var dist := diff.length()
	if dist < 0.05:
		line.visible = false
		return

	line.visible = true
	var y_axis := diff / dist
	var helper := Vector3.UP if absf(y_axis.dot(Vector3.UP)) < 0.99 else Vector3.RIGHT
	var x_axis := y_axis.cross(helper).normalized()
	var z_axis := x_axis.cross(y_axis).normalized()
	line.global_transform = Transform3D(Basis(x_axis, y_axis, z_axis), from + diff * 0.5)
	line.scale = Vector3(1, dist, 1)


# ---------------------------------------------------------------------------
# Vômito: spray contínuo (segurar) — dano em cone curto, gasta energia por
# segundo em vez de ter cooldown
# ---------------------------------------------------------------------------
func _tick_vomito(delta: float) -> void:
	if _bile_active:
		return
	if not _spend_resource(vomito_channel_cost_per_sec * delta):
		return
	_damage_cone(camera.global_position, -camera.global_transform.basis.z, 3.5, deg_to_rad(50.0), vomito_channel_dps * delta, &"vomito")


# ---------------------------------------------------------------------------
# Vômito de sangue: spray de dano MASSIVO que também tira vida REAL do
# jogador (não a energia — "não pode ser roubado")
# ---------------------------------------------------------------------------
func _tick_vomito_sangue(delta: float) -> void:
	if _bile_active:
		return
	take_damage(vomito_sangue_self_dps * delta)
	_damage_cone(camera.global_position, -camera.global_transform.basis.z, 4.0, deg_to_rad(45.0), vomito_sangue_dps * delta, &"vomito_sangue")


# ---------------------------------------------------------------------------
# Catarro nasal: alcance médio, área, dano médio — projétil que explode
# ---------------------------------------------------------------------------
func _fire_catarro() -> void:
	if not _off_cooldown(&"catarro"):
		return
	_start_cooldown(&"catarro")
	var aim_dir := -camera.global_transform.basis.z
	var blob := CATARRO_PROJECTILE.instantiate()
	get_tree().current_scene.add_child(blob)
	blob.global_position = mouth_marker.global_position
	blob.launch(aim_dir, 20.0, self)


# ---------------------------------------------------------------------------
# Espinhas: disparo rápido, alcance muito longo, dano baixo por tiro
# ---------------------------------------------------------------------------
func _tick_espinhas(delta: float) -> void:
	if _bile_active:
		return
	_espinhas_cd -= delta
	if _espinhas_cd > 0.0:
		return
	_espinhas_cd = ESPINHAS_INTERVAL
	var aim_dir := -camera.global_transform.basis.z
	var spike := ESPINHA_PROJECTILE.instantiate()
	get_tree().current_scene.add_child(spike)
	spike.global_position = mouth_marker.global_position
	spike.launch(aim_dir, 55.0, self)


# ---------------------------------------------------------------------------
# Espinhas (passiva): sempre que o jogador toma dano, todas as espinhas do
# corpo explodem em todas as direções
# ---------------------------------------------------------------------------
func _trigger_espinhas_retaliation() -> void:
	if not _has_ability_equipped(&"espinhas_passiva"):
		return
	for i in range(espinhas_passiva_count):
		var angle := TAU * float(i) / float(espinhas_passiva_count)
		var dir := Vector3(cos(angle), 0.15, sin(angle)).normalized()
		var spike := ESPINHA_PROJECTILE.instantiate()
		get_tree().current_scene.add_child(spike)
		spike.global_position = global_position + Vector3.UP * 0.9
		spike.launch(dir, 20.0, self)
		spike.set_damage(espinhas_passiva_damage)


# ---------------------------------------------------------------------------
# Milho: metralhadora que sai "pelo cu" — só funciona parado, perfura os
# inimigos (não para no primeiro que acertar)
# ---------------------------------------------------------------------------
func _tick_milho(delta: float) -> void:
	if _bile_active:
		return
	var standing_still := is_on_floor() and Vector2(velocity.x, velocity.z).length() < 0.4
	if not standing_still:
		return
	_milho_cd -= delta
	if _milho_cd > 0.0:
		return
	_milho_cd = milho_interval
	var back_dir := camera.global_transform.basis.z  # oposto do forward = "pra trás"
	var corn := MILHO_PROJECTILE.instantiate()
	get_tree().current_scene.add_child(corn)
	corn.global_position = mouth_marker.global_position
	corn.set_damage(milho_damage)
	corn.launch(back_dir, milho_speed, self)


# ---------------------------------------------------------------------------
# Cuspe: ataque carregável — quanto mais carrega, maior e mais longe
# ---------------------------------------------------------------------------
func _tick_cuspe_charge(delta: float) -> void:
	if _cuspe_charging:
		_cuspe_charge = min(CUSPE_MAX_CHARGE, _cuspe_charge + delta)


func _release_cuspe() -> void:
	if not _cuspe_charging:
		return
	_cuspe_charging = false
	if _bile_active:
		_cuspe_charge = 0.0
		return
	var charge_ratio := _cuspe_charge / CUSPE_MAX_CHARGE
	var aim_dir := -camera.global_transform.basis.z
	var spit := CUSPE_PROJECTILE.instantiate()
	get_tree().current_scene.add_child(spit)
	spit.global_position = mouth_marker.global_position
	spit.launch(aim_dir, lerp(14.0, 34.0, charge_ratio), self)
	spit.scale = Vector3.ONE * lerp(0.5, 2.2, charge_ratio)
	spit.set_damage(lerp(6.0, 32.0, charge_ratio))
	_cuspe_charge = 0.0


# ---------------------------------------------------------------------------
# Hemorróida Explosiva: carrega mirando um ponto, solta pra detonar uma área
# de dano lá — quanto mais carrega, mais dano nos outros E em você mesmo
# (segurar até o fim tira até 50% da vida MÁXIMA do jogador)
# ---------------------------------------------------------------------------
func _tick_hemorroida_charge(delta: float) -> void:
	if _hemorroida_charging:
		_hemorroida_charge = min(HEMORROIDA_MAX_CHARGE, _hemorroida_charge + delta)


func _release_hemorroida() -> void:
	if not _hemorroida_charging:
		return
	_hemorroida_charging = false
	if _bile_active:
		_hemorroida_charge = 0.0
		return
	var ratio := _hemorroida_charge / HEMORROIDA_MAX_CHARGE
	var dmg: float = lerp(hemorroida_min_damage, hemorroida_max_damage, ratio)
	var self_dmg := ratio * max_health * hemorroida_self_damage_ratio
	var target_point := _raycast_aim_point(hemorroida_max_range)
	add_camera_trauma(0.3 + 0.4 * ratio)
	_sphere_damage(target_point, hemorroida_radius, dmg, &"hemorroida")
	take_damage(self_dmg)
	_hemorroida_charge = 0.0


func _raycast_aim_point(max_range: float) -> Vector3:
	var space_state := get_world_3d().direct_space_state
	var from := camera.global_position
	var dir := -camera.global_transform.basis.z
	var to := from + dir * max_range
	var query := PhysicsRayQueryParameters3D.create(from, to)
	query.exclude = [get_rid()]
	var result := space_state.intersect_ray(query)
	if result.is_empty():
		return to
	return result.position


# ---------------------------------------------------------------------------
# Arroto: empurra o jogador pra trás e dá stun nos inimigos na frente. Com a
# mira invertida (F), empurra pra FRENTE em vez de pra trás.
# ---------------------------------------------------------------------------
func _fire_arroto() -> void:
	if not _off_cooldown(&"arroto"):
		return
	_start_cooldown(&"arroto")
	var forward := -camera.global_transform.basis.z
	velocity += forward * (9.0 if _aim_reversed else -9.0)
	velocity.y += 2.0
	add_camera_trauma(0.35)
	_damage_cone(camera.global_position, forward, 4.0, deg_to_rad(40.0), 0.0, &"arroto", true)


# ---------------------------------------------------------------------------
# Peido (arma): dano bom + stun em quem estiver atrás do jogador, com um
# empurrão pra frente de brinde
# ---------------------------------------------------------------------------
func _fire_peido_weapon() -> void:
	if not _off_cooldown(&"peido"):
		return
	_start_cooldown(&"peido")
	var forward := -camera.global_transform.basis.z
	velocity += forward * peido_forward_push
	add_camera_trauma(0.25)
	_damage_cone(camera.global_position, -forward, 4.0, deg_to_rad(50.0), peido_damage, &"peido", true)


# ---------------------------------------------------------------------------
# Caspa (arma): chacoalha a cabeça e derruba caspa aos pés — vira uma
# mina que explode em quem tocar
# ---------------------------------------------------------------------------
func _fire_caspa() -> void:
	if not _off_cooldown(&"caspa"):
		return
	_start_cooldown(&"caspa")
	var pile := CASPA_PILE.instantiate()
	get_tree().current_scene.add_child(pile)
	pile.global_position = global_position
	if pile.has_method(&"set_damage"):
		pile.set_damage(caspa_damage)
	if pile.has_method(&"set_explosion_radius"):
		pile.set_explosion_radius(caspa_explosion_radius)
	if pile.has_method(&"set_shooter"):
		pile.set_shooter(self)


# ---------------------------------------------------------------------------
# Melee (V) — perto, rápido. Com "Unhas não cortadas" equipada, dá muito
# mais dano mas gasta uma carga de unha (regenera sozinha com o tempo).
# ---------------------------------------------------------------------------
func _fire_melee() -> void:
	if _bile_active:
		return
	if not _off_cooldown(&"melee"):
		return
	_start_cooldown(&"melee")
	var forward := -camera.global_transform.basis.z
	var damage := melee_damage
	if _has_ability_equipped(&"unhas_compridas") and _nail_charges > 0:
		damage *= nail_bonus_multiplier
		_nail_charges -= 1
	add_camera_trauma(0.2)
	_damage_cone(camera.global_position, forward, melee_range, deg_to_rad(65.0), damage, &"melee")


func _tick_nail_regrow(delta: float) -> void:
	if not _has_ability_equipped(&"unhas_compridas"):
		return
	if _nail_charges >= nail_max_charges:
		return
	_nail_regrow_cd -= delta
	if _nail_regrow_cd <= 0.0:
		_nail_regrow_cd = nail_regrow_interval
		_nail_charges += 1


# ---------------------------------------------------------------------------
# Cera de ouvido (passiva): pinga poça no chão por onde o jogador anda —
# inimigo que pisar fica grudado (atordoado) um tempo
# ---------------------------------------------------------------------------
func _tick_earwax(delta: float) -> void:
	if not _has_ability_equipped(&"cera_de_ouvido"):
		return
	if not is_on_floor():
		return
	_earwax_cd -= delta
	if _earwax_cd > 0.0:
		return
	_earwax_cd = earwax_interval
	var puddle := EARWAX_PUDDLE.instantiate()
	get_tree().current_scene.add_child(puddle)
	puddle.global_position = global_position
	if puddle.has_method(&"set_stick_duration"):
		puddle.set_stick_duration(earwax_stick_duration)


# ---------------------------------------------------------------------------
# Sebo (passiva): resistência a dano — ver take_damage()
# Pus (ativa em R/C): toma dano enquanto segura, vira "vida extra" ao soltar
# ---------------------------------------------------------------------------
func _tick_pus(delta: float) -> void:
	if not _pus_active:
		return
	var dmg := pus_self_dps * delta
	_pus_accum += dmg
	take_damage(dmg)


func _release_pus() -> void:
	if not _pus_active:
		return
	_pus_active = false
	bonus_health += _pus_accum
	_pus_accum = 0.0


# ---------------------------------------------------------------------------
# Vômito de bile (ativa em R/C): mais leve, pula mais alto/longe, mas não
# pode usar nenhuma habilidade de dano enquanto durar
# ---------------------------------------------------------------------------
func _tick_bile(delta: float) -> void:
	if not _bile_active:
		return
	if not _spend_resource(bile_resource_cost_per_sec * delta):
		_bile_active = false


# ---------------------------------------------------------------------------
# Adrenalina (passiva): "the indomitable human spirit" — ver take_damage()
# ---------------------------------------------------------------------------
func _tick_adrenaline(delta: float) -> void:
	if _adrenaline_timer > 0.0:
		_adrenaline_timer -= delta
		if _adrenaline_timer <= 0.0:
			_invincible = false


# ---------------------------------------------------------------------------
# Piolho (passiva): morde sozinho todo inimigo perto, sem precisar apertar nada
# ---------------------------------------------------------------------------
func _tick_piolho(delta: float) -> void:
	if not _has_ability_equipped(&"piolho"):
		return
	_piolho_tick_cd -= delta
	if _piolho_tick_cd > 0.0:
		return
	_piolho_tick_cd = 0.5
	_sphere_damage(global_position, piolho_radius, piolho_dps * 0.5, &"piolho")


# ---------------------------------------------------------------------------
# Mosca (passiva): regenera moscas aos poucos — o consumo delas (uma por
# golpe recebido) acontece em take_damage()
# ---------------------------------------------------------------------------
func _tick_mosca(delta: float) -> void:
	if not _has_ability_equipped(&"mosca"):
		return
	if _mosca_count >= mosca_max:
		return
	_mosca_regrow_cd -= delta
	if _mosca_regrow_cd <= 0.0:
		_mosca_regrow_cd = mosca_regrow_interval
		_mosca_count += 1


# ---------------------------------------------------------------------------
# Necrose (passiva): só ferra — começa a contar assim que equipada, mata o
# jogador se o ObjectiveManager não completar a fase antes do tempo acabar
# ---------------------------------------------------------------------------
func _tick_necrose(delta: float) -> void:
	if not _has_ability_equipped(&"necrose"):
		_necrose_timer = -1.0
		_necrose_active = false
		return

	if _necrose_timer < 0.0:
		_necrose_timer = necrose_duration
		_necrose_active = true
		GameEvents.necrose_status_changed.emit(true, _necrose_timer)

	if not _necrose_active:
		return

	_necrose_timer -= delta
	GameEvents.necrose_status_changed.emit(true, max(_necrose_timer, 0.0))
	if _necrose_timer <= 0.0:
		_necrose_active = false
		GameEvents.necrose_status_changed.emit(false, 0.0)
		take_damage(max_health * 999.0)  # letal de verdade, mas ainda passa pelas mitigações normais (Mosca/Sebo/vida-extra podem atrasar por sorte)


func _on_objective_completed_disarms_necrose() -> void:
	if _necrose_active:
		_necrose_active = false
		GameEvents.necrose_status_changed.emit(false, 0.0)


# ---------------------------------------------------------------------------
# Cecê: abrir os braços cria uma nuvem de AoE que segue o jogador e dá dano
# contínuo por onde passa
# ---------------------------------------------------------------------------
func _toggle_cece() -> void:
	if _cece_active:
		return
	if not _off_cooldown(&"cece"):
		return
	_start_cooldown(&"cece")
	_cece_active = true
	_cece_timer = CECE_DURATION
	cece_cloud.visible = true
	if cece_cloud.has_method("activate"):
		cece_cloud.activate(CECE_DURATION)


func _process(delta: float) -> void:
	if _cece_active:
		_cece_timer -= delta
		if _cece_timer <= 0.0:
			_cece_active = false
			cece_cloud.visible = false
	_update_camera_feel(delta)


func add_camera_trauma(amount: float) -> void:
	## Impactos SOMAM trauma, não resetam — vários hits seguidos empilham
	## até o teto (1.0) em vez de cada um "reiniciar" o shake do zero.
	_camera_trauma = clamp(_camera_trauma + amount, 0.0, 1.0)


func _update_camera_feel(delta: float) -> void:
	if _camera_trauma > 0.0:
		_camera_trauma = max(_camera_trauma - shake_decay * delta, 0.0)

	var shake := _camera_trauma * _camera_trauma  # quadrático: leve baixo, forte alto
	_shake_time += delta * 30.0
	camera.position = Vector3(
		shake_max_offset * shake * sin(_shake_time * 1.7),
		shake_max_offset * shake * sin(_shake_time * 2.3),
		0.0
	)
	var shake_roll := shake_max_roll * shake * sin(_shake_time * 1.1)
	camera.rotation.z = _wall_run_tilt + shake_roll

	var boosting := (not is_on_floor() and Input.is_action_pressed(&"ability_diarreia")) or _suor_charge > 0.3
	var target_fov := base_fov + (boost_fov_kick if boosting else 0.0)
	camera.fov = lerp(camera.fov, target_fov, 6.0 * delta)


# ---------------------------------------------------------------------------
# Utilitários de dano em área
# ---------------------------------------------------------------------------
func _damage_cone(origin: Vector3, direction: Vector3, range_m: float, half_angle: float, damage: float, ability_id: StringName, stun: bool = false) -> void:
	var space_state := get_world_3d().direct_space_state
	var shape := SphereShape3D.new()
	shape.radius = range_m
	var query := PhysicsShapeQueryParameters3D.new()
	query.shape = shape
	query.transform = Transform3D(Basis(), origin)
	query.collide_with_areas = true
	query.collide_with_bodies = true
	query.exclude = [get_rid()]

	for result in space_state.intersect_shape(query, 16):
		var collider: Object = result.get("collider")
		if collider == null:
			continue
		var to_target: Vector3 = (collider as Node3D).global_position - origin if collider is Node3D else Vector3.ZERO
		if to_target == Vector3.ZERO:
			continue
		var angle := direction.angle_to(to_target.normalized())
		if angle > half_angle:
			continue
		if collider.has_method("take_damage") and damage > 0.0:
			collider.take_damage(damage, self)
			GameEvents.target_damaged.emit(collider, damage, ability_id)
		if stun and collider.has_method("apply_stun"):
			collider.apply_stun(1.5)


func _sphere_damage(point: Vector3, radius: float, damage: float, ability_id: StringName) -> void:
	var space_state := get_world_3d().direct_space_state
	var shape := SphereShape3D.new()
	shape.radius = radius
	var query := PhysicsShapeQueryParameters3D.new()
	query.shape = shape
	query.transform = Transform3D(Basis(), point)
	query.collide_with_bodies = true
	query.collide_with_areas = true
	query.exclude = [get_rid()]

	for result in space_state.intersect_shape(query, 16):
		var collider: Object = result.get("collider")
		if collider and collider.has_method(&"take_damage"):
			collider.take_damage(damage, self)
			GameEvents.target_damaged.emit(collider, damage, ability_id)
