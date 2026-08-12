class_name Player
extends CharacterBody3D
## Controle do personagem: movimento relativo à câmera, hotbar de ferramentas
## e interação com a célula de cultivo à frente.

signal tool_changed(index: int)
signal inventory_changed(inventory: Dictionary)
signal notified(text: String)

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

var selected_tool := 0
var inventory := {}  # nome do item -> quantidade

var _farm: FarmGrid
var _marker: MeshInstance3D

@onready var camera_rig: Node3D = $CameraRig
@onready var mesh: Node3D = $Mesh


func _ready() -> void:
	_farm = get_tree().get_first_node_in_group("farm_grid")
	if _farm != null:
		_farm.crop_harvested.connect(_on_crop_harvested)
	_make_marker()


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("interact"):
		_use_tool()
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

	var target := direction * WALK_SPEED
	velocity.x = lerp(velocity.x, target.x, ACCELERATION * delta)
	velocity.z = lerp(velocity.z, target.z, ACCELERATION * delta)

	if direction.length_squared() > 0.001:
		var target_angle := atan2(direction.x, direction.z)
		mesh.rotation.y = lerp_angle(mesh.rotation.y, target_angle, ROTATION_SPEED * delta)

	move_and_slide()
	_update_marker()


func _target_cell() -> Vector2i:
	var facing := Vector3(sin(mesh.rotation.y), 0.0, cos(mesh.rotation.y))
	return _farm.world_to_cell(global_position + facing * REACH)


func _use_tool() -> void:
	if _farm == null:
		return
	var message: String = _farm.use_tool(TOOLS[selected_tool].id, _target_cell())
	if message != "":
		notified.emit(message)


func _select(index: int) -> void:
	if index == selected_tool:
		return
	selected_tool = index
	tool_changed.emit(index)


func _on_crop_harvested(_crop_id: String, crop_name: String) -> void:
	inventory[crop_name] = inventory.get(crop_name, 0) + 1
	inventory_changed.emit(inventory)


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
