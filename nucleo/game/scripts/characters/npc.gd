class_name NPC
extends CharacterBody3D
## Morador: pode ser uma criatura humanóide fantástica (aparência
## customizável via CharacterAppearance/CharacterBuilder) ou uma criatura
## especial única do mundo — nuvem, estrela, broto, cristal... (ver
## CreatureBuilder). Semente fixa: cada morador é sempre o mesmo.

const HUMANOID_NAMES := [
	"Brisa", "Cinza", "Lúmen", "Ferrugem", "Sálvia", "Orvalho",
	"Faísca", "Musgo", "Âmbar", "Neve", "Vento", "Fuligem",
]
const WALK_SPEED := 1.8
const WANDER_RADIUS := 5.0
const FLY_WANDER_RADIUS := 3.5

# ---------- falas ----------
# Cosmético por enquanto (sem ramificação nem memória) — variedade por
# CharacterAppearance.vibe nos humanóides e por espécie nas criaturas
# especiais. Base para o sistema de diálogo/memória do GDD (§9-10).
const HUMANOID_LINES := {
	0: [  # Sereno
		"Que dia tranquilo, não é?",
		"Gosto de ficar por aqui, sentindo o vento passar.",
		"Não tenho pressa nenhuma hoje. E você?",
	],
	1: [  # Animado
		"Ei! Que bom te ver por aqui!",
		"Adivinha o que eu vi hoje cedo? Depois eu te conto!",
		"Vamos fazer alguma coisa divertida um dia desses!",
	],
	2: [  # Tímido
		"Ah... oi. Não esperava te ver.",
		"Er, desculpa, eu só estava passeando por aqui...",
		"...oi. (acena baixinho)",
	],
	3: [  # Confiante
		"Sabia que você ia passar por aqui.",
		"Essa cidade tem sorte de ter alguém como eu por perto.",
		"Vamos, não precisa ter vergonha de puxar assunto.",
	],
}
const CREATURE_LINES := {
	"nimbo": [
		"*flutua baixinho, como se respirasse com o vento*",
		"Psss... hoje o céu está gostoso.",
		"*solta uma garoinha fina e se afasta, contente*",
	],
	"cintila": [
		"*brilha um pouco mais forte por um instante*",
		"Vi uma estrela cadente ontem. Fiz um pedido por você.",
		"*gira devagar no ar, como se dançasse*",
	],
	"broto": [
		"*balança as folhinhas da coroa, quieto*",
		"A terra por aqui é boa. Dá pra sentir.",
		"*se inclina em direção ao sol por um segundo*",
	],
	"prisma": [
		"*suas facetas capturam a luz por um instante*",
		"Cada ângulo meu mostra algo diferente. Repare.",
		"*emite um brilho interno suave e constante*",
	],
}

var appearance: CharacterAppearance  # null para criaturas especiais
var creature_kind := ""              # "" para moradores humanóides
var npc_name := ""
var home := Vector3.ZERO             # âncora do passeio; já inclui a altura
                                      # de voo para criaturas que flutuam
var flies := false

var _rig: Node3D  # CharacterRig ou CreatureRig — ambos expõem set_moving()
var _mesh_root: Node3D
var _target := Vector3.ZERO
var _wait := 1.0
var _visual_seed := 0


## Morador humanóide fantástico com aparência sorteada (semente fixa).
static func create(seed_value: int, home_pos: Vector3) -> NPC:
	var npc := NPC.new()
	var rng := RandomNumberGenerator.new()
	rng.seed = seed_value
	npc.appearance = CharacterAppearance.new()
	npc.appearance.randomize_appearance(rng, true)
	npc.npc_name = HUMANOID_NAMES[seed_value % HUMANOID_NAMES.size()]
	npc.home = home_pos
	npc.position = home_pos
	npc._wait = rng.randf_range(0.5, 3.0)
	npc._target = home_pos
	return npc


## Criatura especial (nuvem, estrela, broto, cristal...) — semente fixa.
static func create_special(kind: String, seed_value: int, home_pos: Vector3) -> NPC:
	var npc := NPC.new()
	var rng := RandomNumberGenerator.new()
	rng.seed = seed_value
	npc.creature_kind = kind
	npc.flies = CreatureBuilder.flies(kind)
	npc.npc_name = CreatureBuilder.pick_name(kind, rng)
	npc._visual_seed = seed_value
	# A âncora do passeio já embute a altura de voo, para o resto da lógica
	# de movimento não precisar distinguir voadora/terrestre.
	npc.home = home_pos + Vector3(0, CreatureBuilder.hover_height(kind), 0)
	npc.position = npc.home
	npc._wait = rng.randf_range(0.5, 3.0)
	npc._target = npc.home
	return npc


func _ready() -> void:
	add_to_group("npc")

	var shape := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.32
	capsule.height = 1.5
	shape.shape = capsule
	shape.position = Vector3(0, 0.75, 0)
	add_child(shape)

	_mesh_root = Node3D.new()
	add_child(_mesh_root)

	var label_height: float
	if creature_kind != "":
		var rng := RandomNumberGenerator.new()
		rng.seed = _visual_seed
		_rig = CreatureBuilder.build(creature_kind, rng)
		label_height = CreatureBuilder.label_height(creature_kind)
	else:
		_rig = CharacterBuilder.build(appearance)
		label_height = 1.85 * appearance.height
	_mesh_root.add_child(_rig)

	var label := Label3D.new()
	label.text = npc_name
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.font_size = 40
	label.pixel_size = 0.004
	label.outline_size = 10
	label.position = Vector3(0, label_height, 0)
	add_child(label)


func _physics_process(delta: float) -> void:
	if not flies and not is_on_floor():
		velocity += get_gravity() * delta

	var speed := WALK_SPEED * (0.75 if flies else 1.0)
	var radius := FLY_WANDER_RADIUS if flies else WANDER_RADIUS

	if _wait > 0.0:
		_wait -= delta
		velocity.x = 0.0
		velocity.z = 0.0
		if flies:
			velocity.y = 0.0
		_rig.set_moving(0.0)
		if _wait <= 0.0:
			_pick_target(radius)
	else:
		var to_target := _target - global_position
		if not flies:
			to_target.y = 0.0
		if to_target.length() < 0.3:
			_wait = randf_range(2.0, 5.5)
		else:
			var dir := to_target.normalized()
			velocity.x = dir.x * speed
			velocity.z = dir.z * speed
			if flies:
				velocity.y = dir.y * speed
			var flat_dir := Vector2(dir.x, dir.z)
			if flat_dir.length() > 0.01:
				_mesh_root.rotation.y = lerp_angle(
						_mesh_root.rotation.y, atan2(dir.x, dir.z), minf(1.0, 8.0 * delta))
		if flies:
			_rig.set_moving(velocity.length() / speed)
		else:
			_rig.set_moving(Vector2(velocity.x, velocity.z).length() / speed)

	move_and_slide()


func _pick_target(radius: float) -> void:
	var angle := randf() * TAU
	var dist := randf_range(1.5, radius)
	var offset := Vector3(cos(angle) * dist, randf_range(-0.35, 0.35) if flies else 0.0, sin(angle) * dist)
	_target = home + offset


## Fala aleatória para quando o jogador interage (E) perto do morador.
## Já vem com o nome prefixado, pronta para exibir no toast do HUD.
func get_greeting() -> String:
	var lines: Array = (
			CREATURE_LINES.get(creature_kind, ["..."]) if creature_kind != ""
			else HUMANOID_LINES.get(appearance.vibe, ["Oi!"]))
	return "%s: %s" % [npc_name, lines[randi() % lines.size()]]
