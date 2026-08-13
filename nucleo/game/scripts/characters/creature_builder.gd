class_name CreatureBuilder
extends Object
## Constrói as criaturas especiais do mundo: moradores únicos e fantásticos
## que não seguem o corpo humanóide (nuvem, estrela, broto, cristal...).
## Reaproveita os primitivos facetados do CharacterBuilder para manter o
## mesmo acabamento low-poly; cada espécie tem seu material e silhueta
## próprios. Retorna um CreatureRig pronto para animar.

static var _mesh_cache := {}
static var _mat_cache := {}

const KIND_NIMBO := "nimbo"
const KIND_CINTILA := "cintila"
const KIND_BROTO := "broto"
const KIND_PRISMA := "prisma"
const KINDS := [KIND_NIMBO, KIND_CINTILA, KIND_BROTO, KIND_PRISMA]

## Vários nomes candidatos por espécie — a semente do morador escolhe um.
const NAMES := {
	KIND_NIMBO: ["Nimbo", "Cirro", "Fofis", "Bruma"],
	KIND_CINTILA: ["Cintila", "Faísca", "Estrelina", "Brilha"],
	KIND_BROTO: ["Broto", "Semente", "Folhinha", "Raiz"],
	KIND_PRISMA: ["Prisma", "Faceta", "Cristalina", "Âmago"],
}

const FLIES := {
	KIND_NIMBO: true, KIND_CINTILA: true, KIND_BROTO: false, KIND_PRISMA: true,
}
const HOVER_HEIGHT := {
	KIND_NIMBO: 1.15, KIND_CINTILA: 0.85, KIND_BROTO: 0.0, KIND_PRISMA: 0.8,
}
const LABEL_HEIGHT := {
	KIND_NIMBO: 0.55, KIND_CINTILA: 0.5, KIND_BROTO: 0.55, KIND_PRISMA: 0.4,
}


static func build(kind: String, rng: RandomNumberGenerator) -> CreatureRig:
	match kind:
		KIND_NIMBO: return _build_nimbo(rng)
		KIND_CINTILA: return _build_cintila(rng)
		KIND_BROTO: return _build_broto(rng)
		KIND_PRISMA: return _build_prisma(rng)
	return _build_nimbo(rng)


static func flies(kind: String) -> bool:
	return FLIES.get(kind, false)


static func hover_height(kind: String) -> float:
	return HOVER_HEIGHT.get(kind, 0.0)


static func label_height(kind: String) -> float:
	return LABEL_HEIGHT.get(kind, 0.6)


static func pick_name(kind: String, rng: RandomNumberGenerator) -> String:
	var options: Array = NAMES.get(kind, ["???"])
	return options[rng.randi() % options.size()]


# ================================ Nimbo =================================
# Nuvenzinha fofa: só olhos grandes, sem boca nem nariz, semi-transparente.

static func _build_nimbo(rng: RandomNumberGenerator) -> CreatureRig:
	var rig := CreatureRig.new()
	rig.name = "NimboVisual"
	var body := Node3D.new()
	rig.add_child(body)

	var tint: Color = Color(0.9, 0.95, 1.0).lerp(Color(1, 1, 1), rng.randf_range(0.0, 0.3))
	# Levemente translúcida, mas com culling normal: como as esferas dos
	# puffs se sobrepõem, deixar as costas visíveis (culling desligado)
	# criava listras escuras onde uma esfera atravessa a outra.
	var cloud_mat := _translucent_mat(tint, 0.93, false)

	var puffs := [
		{"pos": Vector3(0, 0, 0), "r": 0.32},
		{"pos": Vector3(-0.27, -0.06, 0.04), "r": 0.23},
		{"pos": Vector3(0.29, -0.05, 0.02), "r": 0.24},
		{"pos": Vector3(-0.1, 0.16, -0.1), "r": 0.21},
		{"pos": Vector3(0.15, 0.14, -0.09), "r": 0.19},
		{"pos": Vector3(0.0, -0.19, 0.1), "r": 0.18},
	]
	for p: Dictionary in puffs:
		# Segmentação maior que a das outras peças: silhueta mais macia,
		# lendo como fofura em vez de faceta angulosa.
		CharacterBuilder._part(body, CharacterBuilder._flat_sphere(p.r, 14, 8), cloud_mat,
				p.pos, Vector3.ZERO, Vector3(1.15, 0.8, 1.0))

	var eyes := _build_cute_eyes(body, Vector3(0, 0.02, 0.28), 0.075, Color(0.28, 0.36, 0.56))

	rig.setup(body, eyes, {
		"base_y": 0.0, "float_amp": 0.09, "float_speed": 1.1,
		"sway_amp": 0.05, "spin_speed": 0.05, "move_tilt": 0.25,
	})
	return rig


# ================================ Cintila ================================
# Cabeça de estrela dourada, corpinho redondo, bochechas coradas.

static func _build_cintila(rng: RandomNumberGenerator) -> CreatureRig:
	var rig := CreatureRig.new()
	rig.name = "CintilaVisual"
	var body := Node3D.new()
	rig.add_child(body)

	var gold: Color = Color(1.0, 0.82, 0.35).lerp(Color(1.0, 0.65, 0.85), rng.randf_range(0.0, 0.3))
	var star_mat := _glow_mat(gold, 0.4)
	var belly_mat: StandardMaterial3D = CharacterBuilder._mat(gold.lightened(0.3))

	CharacterBuilder._part(body, CharacterBuilder._flat_sphere(0.2, 8, 5), belly_mat,
			Vector3(0, -0.12, 0), Vector3.ZERO, Vector3(1.0, 0.82, 1.0))
	for side in [-1.0, 1.0]:
		CharacterBuilder._part(body, CharacterBuilder._flat_sphere(0.065, 6, 4), belly_mat,
				Vector3(side * 0.22, -0.1, 0))

	_build_star_head(body, star_mat, Vector3(0, 0.22, 0), 0.32)

	var eyes := _build_cute_eyes(body, Vector3(0, 0.2, 0.15), 0.055, Color(0.3, 0.2, 0.12), 0.09)
	var blush: StandardMaterial3D = CharacterBuilder._mat(gold.lerp(Color(1, 0.4, 0.5), 0.45))
	for side in [-1.0, 1.0]:
		CharacterBuilder._part(body, CharacterBuilder._flat_sphere(0.032, 6, 3), blush,
				Vector3(side * 0.15, 0.17, 0.12), Vector3.ZERO, Vector3(1, 0.7, 0.4))

	rig.setup(body, eyes, {
		"base_y": 0.0, "float_amp": 0.07, "float_speed": 1.4,
		"sway_amp": 0.08, "spin_speed": 0.15, "move_tilt": 0.2,
	})
	return rig


## Disco achatado + pontas cônicas ao redor: silhueta de estrela em
## primitivas já validadas (mesma técnica dos espinhos de cabelo/chifres).
static func _build_star_head(parent: Node3D, mat: Material, center: Vector3, size: float,
		points := 5) -> void:
	CharacterBuilder._part(parent, CharacterBuilder._flat_sphere(size * 0.6, 8, 5), mat,
			center, Vector3.ZERO, Vector3(1.0, 1.0, 0.6))
	for i in points:
		var ang := TAU * float(i) / float(points) - PI / 2.0
		var dir := Vector3(cos(ang), sin(ang), 0)
		CharacterBuilder._part(parent, CharacterBuilder._flat_cone(size * 0.32, size * 0.9, 5), mat,
				center + dir * size * 0.4, Vector3(0, 0, ang - PI / 2.0), Vector3(1, 1, 0.6))


# ================================= Broto ==================================
# Sementinha com coroa de folhas — a única espécie que anda (planta, chão).

static func _build_broto(rng: RandomNumberGenerator) -> CreatureRig:
	var rig := CreatureRig.new()
	rig.name = "BrotoVisual"
	var body := Node3D.new()
	rig.add_child(body)

	var skin: StandardMaterial3D = CharacterBuilder._mat(
			Color(0.58, 0.76, 0.46).lerp(Color(0.42, 0.66, 0.42), rng.randf()))
	var leaf_mat: StandardMaterial3D = CharacterBuilder._mat(Color(0.35, 0.68, 0.32))

	CharacterBuilder._part(body, CharacterBuilder._flat_sphere(0.18, 8, 5), skin,
			Vector3(0, 0.19, 0), Vector3.ZERO, Vector3(0.92, 1.05, 0.92))
	for side in [-1.0, 1.0]:
		CharacterBuilder._part(body, CharacterBuilder._flat_capsule(0.045, 0.14), skin,
				Vector3(side * 0.07, 0.07, 0))

	var eyes := _build_cute_eyes(body, Vector3(0, 0.2, 0.16), 0.045, Color(0.16, 0.4, 0.15), 0.075)

	var leaves := [
		{"pos": Vector3(0, 0.38, -0.01), "rot": Vector3(-0.35, 0, 0)},
		{"pos": Vector3(-0.12, 0.32, 0.03), "rot": Vector3(-0.15, 0, -0.7)},
		{"pos": Vector3(0.12, 0.32, 0.03), "rot": Vector3(-0.15, 0, 0.7)},
	]
	for l: Dictionary in leaves:
		# Achatada e larga: lâmina de folha, não espinho.
		CharacterBuilder._part(body, CharacterBuilder._flat_sphere(0.15, 8, 5), leaf_mat,
				l.pos, l.rot, Vector3(0.55, 1.15, 0.28))

	rig.setup(body, eyes, {
		"base_y": 0.0, "float_amp": 0.0, "float_speed": 1.0,
		"sway_amp": 0.03, "spin_speed": 0.0, "move_tilt": 0.15, "walk_bob": 0.03,
	})
	return rig


# ================================ Prisma =================================
# Aglomerado de cristal translúcido com brilho interno.

static func _build_prisma(rng: RandomNumberGenerator) -> CreatureRig:
	var rig := CreatureRig.new()
	rig.name = "PrismaVisual"
	var body := Node3D.new()
	rig.add_child(body)

	var hue := rng.randf_range(0.5, 0.75)
	var base_color := Color.from_hsv(hue, 0.42, 0.95)
	var mat := _glassy_mat(base_color)

	var shards := [
		{"pos": Vector3(0, 0, 0), "h": 0.4, "r": 0.14, "rot": Vector3.ZERO},
		{"pos": Vector3(-0.16, -0.08, 0.05), "h": 0.26, "r": 0.09, "rot": Vector3(0, 0, deg_to_rad(18))},
		{"pos": Vector3(0.17, -0.1, -0.03), "h": 0.24, "r": 0.08, "rot": Vector3(0, 0, deg_to_rad(-16))},
		{"pos": Vector3(0.02, -0.14, 0.1), "h": 0.2, "r": 0.07, "rot": Vector3(deg_to_rad(12), 0, 0)},
	]
	for s: Dictionary in shards:
		CharacterBuilder._part(body, CharacterBuilder._flat_cone(s.r, s.h, 6), mat, s.pos, s.rot)

	var eyes := _build_cute_eyes(body, Vector3(0, 0.05, 0.13), 0.05, Color(0.15, 0.15, 0.3), 0.085)

	rig.setup(body, eyes, {
		"base_y": 0.0, "float_amp": 0.06, "float_speed": 0.9,
		"sway_amp": 0.04, "spin_speed": 0.25, "move_tilt": 0.15,
	})
	return rig


# ============================ compartilhado ============================

## Par de olhinhos fofos (branco + íris + pupila + brilho), no estilo dos
## personagens humanóides mas maiores/arredondados. Retorna os pivôs para
## a piscada.
static func _build_cute_eyes(parent: Node3D, center: Vector3, size: float, iris_color: Color,
		separation := 0.16) -> Array[Node3D]:
	var white := CharacterBuilder._mat(Color(0.99, 0.99, 0.97))
	var iris := CharacterBuilder._mat(iris_color)
	var dark := CharacterBuilder._mat(Color(0.08, 0.07, 0.08))
	var pivots: Array[Node3D] = []
	for side in [-1.0, 1.0]:
		var pivot := Node3D.new()
		pivot.position = center + Vector3(side * separation, 0, 0)
		parent.add_child(pivot)
		pivots.append(pivot)
		CharacterBuilder._part(pivot, CharacterBuilder._flat_sphere(size, 8, 4), white,
				Vector3.ZERO, Vector3.ZERO, Vector3(1, 1, 0.55))
		CharacterBuilder._part(pivot, CharacterBuilder._flat_sphere(size * 0.55, 8, 4), iris,
				Vector3(0, 0, size * 0.35), Vector3.ZERO, Vector3(1, 1, 0.5))
		CharacterBuilder._part(pivot, CharacterBuilder._flat_sphere(size * 0.28, 6, 3), dark,
				Vector3(0, 0, size * 0.55), Vector3.ZERO, Vector3(1, 1, 0.5))
		CharacterBuilder._part(pivot, CharacterBuilder._flat_sphere(size * 0.16, 6, 3), white,
				Vector3(-size * 0.22, size * 0.28, size * 0.62), Vector3.ZERO, Vector3(1, 1, 0.4))
	return pivots


## `two_sided` só deve ser true para geometria aberta (uma faixa/leque sem
## verso); para volumes fechados (esferas, cones) deixe false — do contrário
## as faces internas ficam visíveis onde peças se sobrepõem, criando listras
## escuras.
static func _translucent_mat(color: Color, alpha: float, two_sided := true) -> StandardMaterial3D:
	var key := "%s_%.2f_%s_translucent" % [color.to_html(), alpha, two_sided]
	if _mat_cache.has(key):
		return _mat_cache[key]
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(color.r, color.g, color.b, alpha)
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.roughness = 0.6
	if two_sided:
		mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	_mat_cache[key] = mat
	return mat


static func _glow_mat(color: Color, emission_energy: float) -> StandardMaterial3D:
	var key := "%s_glow_%.2f" % [color.to_html(), emission_energy]
	if _mat_cache.has(key):
		return _mat_cache[key]
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.6
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = emission_energy
	_mat_cache[key] = mat
	return mat


static func _glassy_mat(color: Color) -> StandardMaterial3D:
	var key := "%s_glassy" % color.to_html()
	if _mat_cache.has(key):
		return _mat_cache[key]
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(color.r, color.g, color.b, 0.82)
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.roughness = 0.15
	mat.metallic = 0.1
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = 0.25
	# Cones fechados (com tampas) — sem culling desligado, senão as faces
	# internas aparecem onde os cacos se cruzam.
	_mat_cache[key] = mat
	return mat
