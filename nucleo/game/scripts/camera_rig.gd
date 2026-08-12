extends Node3D
## Câmera alternável (tecla V): isométrica/top-down ou terceira pessoa.
## Na terceira pessoa, arraste com o botão direito do mouse para orbitar.

enum Mode { ISOMETRIC, THIRD_PERSON }

const ISO_PITCH := deg_to_rad(-52.0)
const ISO_DISTANCE := 16.0
const TP_PITCH := deg_to_rad(-14.0)
const TP_DISTANCE := 5.5
const MOUSE_SENSITIVITY := 0.005
const BLEND_SPEED := 6.0

var mode := Mode.ISOMETRIC
var _yaw := deg_to_rad(45.0)
var _tp_pitch := TP_PITCH

@onready var arm: SpringArm3D = $SpringArm


func _ready() -> void:
	top_level = true
	_apply(1.0)


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("toggle_camera"):
		mode = Mode.THIRD_PERSON if mode == Mode.ISOMETRIC else Mode.ISOMETRIC
	elif event is InputEventMouseMotion and Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
		_yaw -= event.relative.x * MOUSE_SENSITIVITY
		if mode == Mode.THIRD_PERSON:
			_tp_pitch = clampf(
				_tp_pitch - event.relative.y * MOUSE_SENSITIVITY,
				deg_to_rad(-70.0), deg_to_rad(10.0)
			)


func _physics_process(delta: float) -> void:
	var player := get_parent() as Node3D
	global_position = global_position.lerp(
		player.global_position + Vector3(0.0, 1.2, 0.0), minf(1.0, 10.0 * delta)
	)
	_apply(minf(1.0, BLEND_SPEED * delta))


func _apply(weight: float) -> void:
	var target_pitch := ISO_PITCH if mode == Mode.ISOMETRIC else _tp_pitch
	var target_dist := ISO_DISTANCE if mode == Mode.ISOMETRIC else TP_DISTANCE
	rotation.y = lerp_angle(rotation.y, _yaw, weight)
	rotation.x = lerp_angle(rotation.x, target_pitch, weight)
	arm.spring_length = lerpf(arm.spring_length, target_dist, weight)
