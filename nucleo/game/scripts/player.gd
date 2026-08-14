class_name Player
extends CharacterBody3D
## Controle do personagem: movimento relativo à câmera, hotbar de ferramentas
## e interação com a célula de cultivo à frente.

signal tool_changed(index: int)
signal inventory_changed(inventory: Dictionary)
signal notified(text: String)
signal energy_changed(current: float, max_energy: float)
signal near_bed_changed(near: bool)
signal near_npc_changed(near: bool)
signal slept

const TOOLS := [
	{"id": "hoe", "name": "Enxada"},
	{"id": "can", "name": "Regador"},
	{"id": "seed_turnip", "name": "Sem. de Nabo"},
	{"id": "seed_pumpkin", "name": "Sem. de Abóbora"},
	{"id": "hand", "name": "Mão"},
]

const WALK_SPEED := 4.5
const ACCELERATION := 12.0
const ROTATION_SPEED := 10.0
const REACH := 1.15
const MAX_ENERGY := 100.0
const TOOL_ENERGY_COST := 3.0
const EXHAUSTED_SPEED_MULT := 0.55
const BED_RANGE := 1.8
const NPC_TALK_RANGE := 2.0

var selected_tool := 0
var inventory := {}  # nome do item -> quantidade
var energy := MAX_ENERGY

var _farm: FarmGrid
var _marker: MeshInstance3D
var _rig: CharacterRig
var _just_harvested := false
var _near_bed := false
var _near_npc: NPC = null
# Acessados via get_node_or_null (não pelo nome do autoload direto) para que
# este script continue compilável em contextos sem autoloads registrados,
# como os testes headless com `--script`.
var _game_clock: Node
var _player_data: Node

@onready var camera_rig: Node3D = $CameraRig
@onready var mesh: Node3D = $Mesh


func _ready() -> void:
	_game_clock = get_node_or_null("/root/GameClock")
	_player_data = get_node_or_null("/root/PlayerData")
	_farm = get_tree().get_first_node_in_group("farm_grid")
	if _farm != null:
		_farm.crop_harvested.connect(_on_crop_harvested)
	_make_marker()
	var appearance: CharacterAppearance = (
			_player_data.appearance if _player_data != null else CharacterAppearance.new())
	_rig = CharacterBuilder.build(appearance)
	mesh.add_child(_rig)


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("interact"):
		_interact()
		return
	for i in TOOLS.size():
		if event.is_action_pressed("slot_%d" % (i + 1)):
			_select(i)
			return
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			_select((selected_tool + 1) % TOOLS.size())
		elif event.button_index == MOUSE_BUTTON_WHEEL_UP:
			_select((selected_tool - 1 + TOOLS.size()) % TOOLS.size())


func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity += get_gravity() * delta

	var input := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var yaw: float = camera_rig.global_rotation.y
	var direction := (Basis(Vector3.UP, yaw) * Vector3(input.x, 0.0, input.y)).normalized()

	var speed_mult := EXHAUSTED_SPEED_MULT if energy <= 0.0 else 1.0
	var target := direction * WALK_SPEED * speed_mult
	velocity.x = lerp(velocity.x, target.x, ACCELERATION * delta)
	velocity.z = lerp(velocity.z, target.z, ACCELERATION * delta)

	if direction.length_squared() > 0.001:
		var target_angle := atan2(direction.x, direction.z)
		mesh.rotation.y = lerp_angle(mesh.rotation.y, target_angle, ROTATION_SPEED * delta)

	move_and_slide()
	_rig.set_moving(Vector2(velocity.x, velocity.z).length() / WALK_SPEED)
	_update_marker()
	_update_near_bed()
	_update_near_npc()


func _target_cell() -> Vector2i:
	var facing := Vector3(sin(mesh.rotation.y), 0.0, cos(mesh.rotation.y))
	return _farm.world_to_cell(global_position + facing * REACH)


## E/clique: conversa se estiver perto de um morador, senão dorme se estiver
## perto de uma cama, senão usa a ferramenta selecionada na célula à frente.
func _interact() -> void:
	if _near_npc != null:
		notified.emit(_near_npc.get_greeting())
		return
	if _near_bed:
		_sleep()
		return
	_use_tool()


func _use_tool() -> void:
	if _farm == null:
		return
	_just_harvested = false
	var message: String = _farm.use_tool(TOOLS[selected_tool].id, _target_cell())
	if message == "":
		return
	notified.emit(message)
	if not _just_harvested:
		_consume_energy(TOOL_ENERGY_COST)


func _sleep() -> void:
	var clock_text := ""
	if _game_clock != null:
		_game_clock.sleep_to_next_day()
		clock_text = _game_clock.clock_text()
	energy = MAX_ENERGY
	energy_changed.emit(energy, MAX_ENERGY)
	slept.emit()
	notified.emit("Zzz... bom dia! " + clock_text)


func _consume_energy(amount: float) -> void:
	var was_exhausted := energy <= 0.0
	energy = maxf(0.0, energy - amount)
	energy_changed.emit(energy, MAX_ENERGY)
	if energy <= 0.0 and not was_exhausted:
		notified.emit("Você está exausto! Volte para casa e durma.")


func _select(index: int) -> void:
	if index == selected_tool:
		return
	selected_tool = index
	tool_changed.emit(index)


func _on_crop_harvested(_crop_id: String, crop_name: String) -> void:
	inventory[crop_name] = inventory.get(crop_name, 0) + 1
	inventory_changed.emit(inventory)
	_just_harvested = true


func _update_near_bed() -> void:
	var near_now := false
	for bed: Node3D in get_tree().get_nodes_in_group("bed"):
		if global_position.distance_to(bed.global_position) < BED_RANGE:
			near_now = true
			break
	if near_now != _near_bed:
		_near_bed = near_now
		near_bed_changed.emit(_near_bed)


func _update_near_npc() -> void:
	var closest: NPC = null
	var closest_dist := NPC_TALK_RANGE
	for npc: NPC in get_tree().get_nodes_in_group("npc"):
		var dist := global_position.distance_to(npc.global_position)
		if dist < closest_dist:
			closest = npc
			closest_dist = dist
	if closest != _near_npc:
		_near_npc = closest
		near_npc_changed.emit(_near_npc != null)


func _make_marker() -> void:
	_marker = MeshInstance3D.new()
	var plane := PlaneMesh.new()
	plane.size = Vector2(0.95, 0.95)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(1.0, 0.95, 0.4, 0.3)
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	plane.material = mat
	_marker.mesh = plane
	_marker.top_level = true
	add_child(_marker)


func _update_marker() -> void:
	if _farm == null:
		_marker.visible = false
		return
	var cell := _target_cell()
	_marker.global_position = Vector3(cell.x, 0.1, cell.y)
	_marker.global_rotation = Vector3.ZERO
