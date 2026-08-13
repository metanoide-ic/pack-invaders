class_name CreatureRig
extends Node3D
## Anima criaturas especiais não-humanoides (nuvem, estrela, broto,
## cristal...): flutuação, balanço, giro suave, leve inclinação ao se mover
## e piscadas. Cada espécie tem seu próprio "temperamento" de movimento,
## definido pelo perfil passado em setup().

var _eyes: Array[Node3D] = []
var _body: Node3D
var _profile: Dictionary
var _phase := 0.0
var _blink_timer := 2.0
var _blink_left := 0.0
var _move := 0.0
var _move_target := 0.0


func setup(body: Node3D, eyes: Array[Node3D], profile: Dictionary) -> void:
	_body = body
	_eyes = eyes
	_profile = profile
	_blink_timer = randf_range(1.2, 3.5)


## Chamado pelo dono (NPC) a cada frame: 0 = parado, 1 = se movendo.
func set_moving(amount: float) -> void:
	_move_target = clampf(amount, 0.0, 1.0)


func _process(delta: float) -> void:
	if _body == null:
		return
	_move = lerpf(_move, _move_target, minf(1.0, 8.0 * delta))
	_phase += delta

	var float_speed: float = _profile.get("float_speed", 1.0)
	var bob := sin(_phase * float_speed) * float(_profile.get("float_amp", 0.0))
	var walk_bob := absf(sin(_phase * 6.0)) * float(_profile.get("walk_bob", 0.0)) * _move
	_body.position.y = float(_profile.get("base_y", 0.0)) + bob + walk_bob

	_body.rotation.z = sin(_phase * float_speed * 0.7) * float(_profile.get("sway_amp", 0.0))
	_body.rotation.y += delta * float(_profile.get("spin_speed", 0.0))

	var tilt: float = _profile.get("move_tilt", 0.0)
	_body.rotation.x = lerp_angle(_body.rotation.x, -tilt * _move, minf(1.0, 6.0 * delta))

	_process_blink(delta)


func _process_blink(delta: float) -> void:
	if _blink_left > 0.0:
		_blink_left -= delta
		if _blink_left <= 0.0:
			_set_eyes_open(true)
		return
	_blink_timer -= delta
	if _blink_timer <= 0.0:
		_blink_timer = randf_range(1.6, 4.5)
		_blink_left = 0.12
		_set_eyes_open(false)


func _set_eyes_open(open: bool) -> void:
	for eye: Node3D in _eyes:
		eye.scale.y = 1.0 if open else 0.12
