class_name CharacterAppearance
extends Resource
## Aparência completa de um personagem (jogador ou morador).
## Guarda todas as escolhas de customização; a malha é gerada pelo
## CharacterBuilder e animada pelo CharacterRig.

# ---------- paletas ----------

const SKIN_TONES: Array[Color] = [
	Color("f7d7b8"), Color("efc39a"), Color("d9a06b"), Color("b97a4b"),
	Color("8d5a33"), Color("64411f"),
	# tons fantásticos (moradores são criaturas humanóides fantásticas)
	Color("a8d18a"), Color("8fb7d9"), Color("c3a3d9"), Color("d98fa5"),
	Color("9fd9c8"), Color("b8b8c9"),
]

const HAIR_COLORS: Array[Color] = [
	Color("2b2320"), Color("4a352a"), Color("7a512e"), Color("a9743d"),
	Color("d9a353"), Color("e8d18f"), Color("b8452e"), Color("8a8f96"),
	Color("f0ede8"), Color("4f7a52"), Color("4a6fa8"), Color("9a5fb0"),
	Color("d96fa0"), Color("3fa8a0"),
]

const EYE_COLORS: Array[Color] = [
	Color("3a2a1e"), Color("5a3d24"), Color("2e5a35"), Color("2f5a8f"),
	Color("6b7a88"), Color("8a5fb0"), Color("b0642e"), Color("2fa89a"),
]

const CLOTH_COLORS: Array[Color] = [
	Color("c94f3d"), Color("e08a3c"), Color("e8c04a"), Color("6fae4f"),
	Color("3f8f6b"), Color("3d6fb4"), Color("5a4fae"), Color("9a5fb0"),
	Color("d96fa0"), Color("8a5a33"), Color("f0e8da"), Color("4a4a52"),
	Color("2b2b30"), Color("b8c4cc"),
]

# ---------- estilos (nomes exibidos no criador de personagem) ----------

const HEAD_SHAPES := ["Redondo", "Oval", "Quadrado"]
const EYE_SHAPES := ["Redondos", "Amendoados", "Grandes"]
const BROW_STYLES := ["Neutras", "Decididas", "Suaves", "Surpresas", "Grossas"]
const NOSE_STYLES := ["Botão", "Pontudo", "Largo", "Empinado"]
const MOUTH_STYLES := ["Sorriso", "Suave", "Sério", "Sorrisão"]
const CHEEK_STYLES := ["Nada", "Blush", "Sardas", "Blush e sardas"]
const EAR_STYLES := ["Redondas", "Pontudas", "Élficas"]
const HORN_STYLES := ["Nenhum", "Curtos", "Curvados", "Unicórnio"]
const HAIR_STYLES := [
	"Raspado", "Curto", "Espetado", "Tigela", "Rabo de cavalo",
	"Coques", "Longo", "Moicano", "Cacheado",
]
const SHIRT_STYLES := ["Camiseta", "Manga longa", "Jardineira", "Vestido"]
const PANTS_STYLES := ["Calça", "Shorts", "Saia"]
const HAT_STYLES := ["Nenhum", "Palha", "Boné", "Gorro"]
const GLASSES_STYLES := ["Nenhum", "Redondos", "Escuros"]
const VIBES := ["Sereno", "Animado", "Tímido", "Confiante"]

# ---------- corpo ----------

@export_range(0.85, 1.15) var height := 1.0
@export_range(0.0, 1.0) var build := 0.4
@export var skin := 0
@export var head_shape := 0

# ---------- rosto ----------

@export var eye_shape := 0
@export var eye_color := 0
@export var brow_style := 0
@export var nose_style := 0
@export var mouth_style := 0
@export var cheek_style := 0
@export var ear_style := 0
@export var horn_style := 0

# ---------- cabelo e acessórios ----------

@export var hair_style := 1
@export var hair_color := 0
@export var hat_style := 0
@export var hat_color := 0
@export var glasses_style := 0

# ---------- roupas ----------

@export var shirt_style := 0
@export var shirt_color := 5
@export var pants_style := 0
@export var pants_color := 9
@export var shoe_color := 12

# ---------- jeito (perfil de animação/personalidade) ----------

@export var vibe := 0

# Campos serializados (salvamento e cópia).
const FIELDS := [
	"height", "build", "skin", "head_shape",
	"eye_shape", "eye_color", "brow_style", "nose_style", "mouth_style",
	"cheek_style", "ear_style", "horn_style",
	"hair_style", "hair_color", "hat_style", "hat_color", "glasses_style",
	"shirt_style", "shirt_color", "pants_style", "pants_color", "shoe_color",
	"vibe",
]


## Sorteia uma aparência. Com `fantasy`, favorece traços fantásticos
## (tons de pele incomuns, orelhas élficas, chifres) — usado nos moradores.
func randomize_appearance(rng: RandomNumberGenerator, fantasy := false) -> void:
	height = rng.randf_range(0.88, 1.12)
	build = rng.randf()
	head_shape = rng.randi() % HEAD_SHAPES.size()
	eye_shape = rng.randi() % EYE_SHAPES.size()
	eye_color = rng.randi() % EYE_COLORS.size()
	brow_style = rng.randi() % BROW_STYLES.size()
	nose_style = rng.randi() % NOSE_STYLES.size()
	mouth_style = rng.randi() % MOUTH_STYLES.size()
	cheek_style = rng.randi() % CHEEK_STYLES.size()
	hair_style = rng.randi() % HAIR_STYLES.size()
	hair_color = rng.randi() % HAIR_COLORS.size()
	hat_style = 0 if rng.randf() < 0.6 else rng.randi() % HAT_STYLES.size()
	hat_color = rng.randi() % CLOTH_COLORS.size()
	glasses_style = 0 if rng.randf() < 0.75 else rng.randi() % GLASSES_STYLES.size()
	shirt_style = rng.randi() % SHIRT_STYLES.size()
	shirt_color = rng.randi() % CLOTH_COLORS.size()
	pants_style = rng.randi() % PANTS_STYLES.size()
	pants_color = rng.randi() % CLOTH_COLORS.size()
	shoe_color = rng.randi() % CLOTH_COLORS.size()
	vibe = rng.randi() % VIBES.size()

	if fantasy:
		skin = 6 + rng.randi() % (SKIN_TONES.size() - 6)
		ear_style = 1 + rng.randi() % (EAR_STYLES.size() - 1)
		horn_style = rng.randi() % HORN_STYLES.size()
	else:
		skin = rng.randi() % SKIN_TONES.size()
		ear_style = rng.randi() % EAR_STYLES.size()
		horn_style = 0 if rng.randf() < 0.8 else rng.randi() % HORN_STYLES.size()


func to_dict() -> Dictionary:
	var data := {}
	for field: String in FIELDS:
		data[field] = get(field)
	return data


func from_dict(data: Dictionary) -> void:
	for field: String in FIELDS:
		if data.has(field):
			set(field, data[field])


func duplicate_appearance() -> CharacterAppearance:
	var copy := CharacterAppearance.new()
	copy.from_dict(to_dict())
	return copy


func skin_tone() -> Color:
	return SKIN_TONES[clampi(skin, 0, SKIN_TONES.size() - 1)]
