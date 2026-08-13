class_name CharacterRig
extends Node3D
## Anima o personagem gerado pelo CharacterBuilder: ciclo de caminhada,
## respiração parada, piscadas e postura. O "jeito" (vibe) muda amplitude,
## ritmo e postura — cada personagem se move diferente.

# bounce: quique do quadril · swing: braços/pernas · pace: velocidade do ciclo
# posture: inclinação do tronco parado · head: aceno da cabeça
const VIBE_PROFILES := [
	{"bounce": 0.02, "swing": 0.5, "pace": 0.9, "posture": 0.0, "head": 0.3},    # sereno
	{"bounce": 0.05, "swing": 0.95, "pace": 1.25, "posture": -0.04, "head": 1.0}, # animado
	{"bounce": 0.015, "swing": 0.35, "pace": 1.0, "posture": 0.09, "head": 0.5},  # tímido
	{"bounce": 0.03, "swing": 0.8, "pace": 0.85, "posture": -0.08, "head": 0.2},  # confiante
]

var _refs := {}
var _profile: Dictionary = VIBE_PROFILES[0]
var _phase := 0.0
var _move := 0.0          # 0 parado → 1 andando (suavizado)
var _move_target := 0.0
var _breath := 0.0
var _blink_timer := 2.0
var _blink_left := 0.0


func setup(refs: Dictionary, vibe: int) -> void:
	_refs = refs
	_profile = VIBE_PROFILES[clampi(vibe, 0, VIBE_PROFILES.size() - 1)]
	_blink_timer = randf_range(1.5, 4.0)


## Chamado pelo dono (jogador/NPC) a cada frame: 0 = parado, 1 = andando.
func set_moving(amount: float) -> void:
	_move_target = clampf(amount, 0.0, 1.0)


func _process(delta: float) -> void:
	if _refs.is_empty():
		return
	_move = lerpf(_move, _move_target, minf(1.0, 10.0 * delta))
	_breath += delta
	_phase += delta * TAU * 1.6 * _profile.pace * maxf(_move, 0.0001)

	var swing: float = _profile.swing
	var hips: Node3D = _refs.hips
	var spine: Node3D = _refs.spine
	var head: Node3D = _refs.head

	# pernas e braços em oposição
	var leg_a := sin(_phase) * 0.7 * swing * _move
	_refs.leg_l.rotation.x = leg_a
	_refs.leg_r.rotation.x = -leg_a
	_refs.arm_l.rotation.x = -leg_a * 0.85
	_refs.arm_r.rotation.x = leg_a * 0.85
	# braços levemente abertos, balanço parado (respiração)
	var idle_sway := sin(_breath * 2.2) * 0.03 * (1.0 - _move)
	_refs.arm_l.rotation.z = 0.14 + idle_sway
	_refs.arm_r.rotation.z = -0.14 - idle_sway

	# quique do quadril e postura
	var bounce: float = absf(sin(_phase)) * _profile.bounce * _move
	var breath_lift := sin(_breath * 2.2) * 0.006 * (1.0 - _move)
	hips.position.y = _refs.base_hips_y + bounce + breath_lift
	spine.rotation.x = _profile.posture * (1.0 - _move * 0.5) + _move * 0.06
	spine.rotation.y = sin(_phase) * 0.06 * swing * _move

	# cabeça: aceno andando, olhar sutil parado
	head.rotation.x = sin(_phase * 2.0) * 0.04 * _profile.head * _move \
			+ sin(_breath * 0.9) * 0.02 * (1.0 - _move)
	head.rotation.y = sin(_breath * 0.6) * 0.06 * (1.0 - _move)

	_process_blink(delta)


func _process_blink(delta: float) -> void:
	if _blink_left > 0.0:
		_blink_left -= delta
		if _blink_left <= 0.0:
			_set_eyes_open(true)
		return
	_blink_timer -= delta
	if _blink_timer <= 0.0:
		_blink_timer = randf_range(1.8, 5.0)
		_blink_left = 0.12
		_set_eyes_open(false)


func _set_eyes_open(open: bool) -> void:
	for eye: Node3D in _refs.get("eyes", []):
		eye.scale.y = 1.0 if open else 0.12
