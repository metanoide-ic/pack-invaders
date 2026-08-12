class_name Player
extends CharacterBody3D
## Controle do personagem: movimento relativo à câmera, com gravidade.

const WALK_SPEED := 4.5
const ACCELERATION := 12.0
const ROTATION_SPEED := 10.0

@onready var camera_rig: Node3D = $CameraRig
@onready var mesh: Node3D = $Mesh


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
