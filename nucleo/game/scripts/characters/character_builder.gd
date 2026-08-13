class_name CharacterBuilder
extends Object
## Gera o visual completo de um personagem a partir de um CharacterAppearance.
## Todas as malhas são low-poly facetadas (normais planas), construídas de
## primitivas "achatadas" e malhas próprias (boca em arco, por exemplo).
##
## Retorna um CharacterRig (Node3D) pronto para animar.

static var _mesh_cache := {}
static var _mat_cache := {}

# Proporções base (antes dos fatores de altura/corpo).
const HEAD_R := 0.24
const LEG_LEN := 0.4
const TORSO_LEN := 0.5
const ARM_LEN := 0.44


static func build(a: CharacterAppearance) -> CharacterRig:
	var rig := CharacterRig.new()
	rig.name = "CharacterVisual"

	var h := a.height
	var b: float = lerpf(0.85, 1.25, a.build)
	var skin := _mat(a.skin_tone())
	var leg_len := LEG_LEN * h
	var torso_len := TORSO_LEN * h
	var arm_len := ARM_LEN * h

	var hips := Node3D.new()
	hips.name = "Hips"
	hips.position = Vector3(0, leg_len, 0)
	rig.add_child(hips)

	# ---------- pernas ----------
	var pants: StandardMaterial3D = _mat(CharacterAppearance.CLOTH_COLORS[a.pants_color])
	var shoes: StandardMaterial3D = _mat(CharacterAppearance.CLOTH_COLORS[a.shoe_color])
	var leg_r := 0.065 * b
	var legs: Array[Node3D] = []
	for side in [-1.0, 1.0]:
		var leg := Node3D.new()
		leg.name = "LegL" if side < 0 else "LegR"
		leg.position = Vector3(side * 0.1 * b, 0, 0)
		hips.add_child(leg)
		legs.append(leg)
		_part(leg, _flat_capsule(leg_r, leg_len), skin, Vector3(0, -leg_len * 0.5, 0))
		match a.pants_style:
			0:  # calça
				_part(leg, _flat_cyl(leg_r * 1.35, leg_r * 1.35, leg_len * 0.92), pants,
						Vector3(0, -leg_len * 0.48, 0))
			1:  # shorts
				_part(leg, _flat_cyl(leg_r * 1.35, leg_r * 1.35, leg_len * 0.45), pants,
						Vector3(0, -leg_len * 0.24, 0))
			2:  # saia (peça única presa aos quadris)
				pass
		_part(leg, _flat_box(Vector3(0.11, 0.075, 0.19)), shoes,
				Vector3(0, -leg_len + 0.035, 0.03))
	if a.pants_style == 2 and a.shirt_style != 3:
		_part(hips, _flat_cyl(0.17 * b, 0.3 * b, 0.28), pants, Vector3(0, -0.1, 0))

	# ---------- tronco e roupa ----------
	var spine := Node3D.new()
	spine.name = "Spine"
	hips.add_child(spine)

	var shirt: StandardMaterial3D = _mat(CharacterAppearance.CLOTH_COLORS[a.shirt_color])
	var torso_top := 0.15 * b
	var torso_bottom := 0.185 * b
	_part(spine, _flat_cyl(torso_top, torso_bottom, torso_len), shirt,
			Vector3(0, torso_len * 0.5, 0))
	# pescoço
	_part(spine, _flat_cyl(0.055, 0.065, 0.1), skin, Vector3(0, torso_len + 0.02, 0))

	match a.shirt_style:
		2:  # jardineira: peitoral e alças por cima da camiseta
			_part(spine, _flat_box(Vector3(0.19 * b, 0.16, 0.05)), pants,
					Vector3(0, torso_len * 0.72, torso_bottom * 0.82))
			for side in [-1.0, 1.0]:
				_part(spine, _flat_box(Vector3(0.045, 0.16, 0.05)), pants,
						Vector3(side * 0.075 * b, torso_len * 0.92, torso_bottom * 0.62),
						Vector3(deg_to_rad(-18), 0, 0))
		3:  # vestido: saia acoplada ao tronco
			_part(spine, _flat_cyl(torso_bottom * 1.05, 0.32 * b, 0.34), shirt,
					Vector3(0, -0.12, 0))

	# ---------- braços ----------
	var arm_r := 0.05 * b
	var sleeve_len := arm_len * (0.42 if a.shirt_style == 0 else 0.95)
	if a.shirt_style == 3:
		sleeve_len = arm_len * 0.42
	var arms: Array[Node3D] = []
	for side in [-1.0, 1.0]:
		var shoulder := Node3D.new()
		shoulder.name = "ArmL" if side < 0 else "ArmR"
		shoulder.position = Vector3(side * (torso_top + arm_r * 1.2), torso_len * 0.88, 0)
		spine.add_child(shoulder)
		arms.append(shoulder)
		_part(shoulder, _flat_capsule(arm_r, arm_len), skin, Vector3(0, -arm_len * 0.5, 0))
		_part(shoulder, _flat_cyl(arm_r * 1.35, arm_r * 1.3, sleeve_len), shirt,
				Vector3(0, -sleeve_len * 0.5 + 0.02, 0))
		_part(shoulder, _flat_sphere(0.062), skin, Vector3(0, -arm_len - 0.02, 0))

	# ---------- cabeça ----------
	var head := Node3D.new()
	head.name = "HeadPivot"
	head.position = Vector3(0, torso_len + 0.07, 0)
	spine.add_child(head)

	var eye_pivots := _build_head(head, a, skin)

	rig.setup({
		"hips": hips, "spine": spine, "head": head,
		"arm_l": arms[0], "arm_r": arms[1],
		"leg_l": legs[0], "leg_r": legs[1],
		"eyes": eye_pivots,
		"base_hips_y": leg_len,
	}, a.vibe)
	return rig


# ============================ cabeça e rosto ============================

static func _build_head(head: Node3D, a: CharacterAppearance, skin: StandardMaterial3D) -> Array[Node3D]:
	var r := HEAD_R
	var hc := Vector3(0, r * 0.95, 0)  # centro da cabeça
	var head_scale: Vector3 = [
		Vector3(1, 1, 1),               # redondo
		Vector3(0.92, 1.14, 0.94),      # oval
		Vector3(1.06, 1.0, 1.0),        # quadrado
	][a.head_shape]
	var head_segs := 6 if a.head_shape == 2 else 8
	_part(head, _flat_sphere(r, head_segs, 5), skin, hc, Vector3.ZERO, head_scale)

	# ---------- olhos ----------
	var eye_scale: Vector3 = [
		Vector3(1, 1, 0.5),             # redondos
		Vector3(1.2, 0.72, 0.5),        # amendoados
		Vector3(1.3, 1.3, 0.5),         # grandes
	][a.eye_shape]
	var iris: StandardMaterial3D = _mat(CharacterAppearance.EYE_COLORS[a.eye_color])
	var white := _mat(Color(0.98, 0.98, 0.96))
	var dark := _mat(Color(0.12, 0.1, 0.1))
	var eye_pivots: Array[Node3D] = []
	for side in [-1.0, 1.0]:
		var pivot := Node3D.new()
		pivot.name = "EyeL" if side < 0 else "EyeR"
		pivot.position = hc + Vector3(side * r * 0.38, r * 0.06, r * 0.95 * head_scale.z)
		pivot.rotation.y = side * 0.2  # acompanha a curvatura do rosto
		head.add_child(pivot)
		eye_pivots.append(pivot)
		_part(pivot, _flat_sphere(r * 0.15, 8, 4), white, Vector3.ZERO, Vector3.ZERO, eye_scale)
		_part(pivot, _flat_sphere(r * 0.08, 8, 4), iris, Vector3(0, 0, r * 0.055),
				Vector3.ZERO, Vector3(1, 1, 0.5))
		_part(pivot, _flat_sphere(r * 0.042, 6, 3), dark, Vector3(0, 0, r * 0.085),
				Vector3.ZERO, Vector3(1, 1, 0.5))
		# brilho no olho: o toque de vida
		_part(pivot, _flat_sphere(r * 0.028, 6, 3), white,
				Vector3(-r * 0.035, r * 0.045, r * 0.1), Vector3.ZERO, Vector3(1, 1, 0.4))

	# ---------- sobrancelhas ----------
	var hair_mat: StandardMaterial3D = _mat(CharacterAppearance.HAIR_COLORS[a.hair_color])
	var brow_tilt: float = [0.0, -0.3, 0.22, 0.1, 0.0][a.brow_style]
	var brow_thick: float = [1.0, 1.1, 0.8, 0.9, 1.9][a.brow_style]
	var brow_y := r * (0.42 if a.brow_style == 3 else 0.34)
	for side in [-1.0, 1.0]:
		_part(head, _flat_box(Vector3(r * 0.34, r * 0.07 * brow_thick, r * 0.06)), hair_mat,
				hc + Vector3(side * r * 0.38, brow_y, r * 0.97 * head_scale.z),
				Vector3(0, 0, side * -brow_tilt))

	# ---------- nariz ----------
	var nose_pos := hc + Vector3(0, -r * 0.1, r * 1.0 * head_scale.z)
	match a.nose_style:
		0: _part(head, _flat_sphere(r * 0.075, 6, 4), skin, nose_pos)
		1: _part(head, _flat_cone(r * 0.06, r * 0.24, 6), skin, nose_pos,
				Vector3(deg_to_rad(90), 0, 0))
		2: _part(head, _flat_sphere(r * 0.075, 6, 4), skin, nose_pos,
				Vector3.ZERO, Vector3(1.7, 0.8, 0.9))
		3: _part(head, _flat_cone(r * 0.055, r * 0.18, 6), skin, nose_pos + Vector3(0, r * 0.02, 0),
				Vector3(deg_to_rad(68), 0, 0))

	# ---------- boca ----------
	var mouth_w: float = [0.5, 0.4, 0.42, 0.62][a.mouth_style]
	var mouth_curve: float = [0.055, 0.028, -0.008, 0.085][a.mouth_style]
	var mouth_mat := _mat_2side(Color(0.62, 0.28, 0.25))
	# A faixa da boca é gerada acompanhando a casca esférica do rosto,
	# ligeiramente acima da superfície facetada.
	_part(head, _mouth_mesh(r * mouth_w * 2.0, r * mouth_curve, r * 0.075,
			r * 1.04 * head_scale.z, -r * 0.4), mouth_mat, hc)

	# ---------- bochechas ----------
	var wants_blush: bool = a.cheek_style == 1 or a.cheek_style == 3
	var wants_freckles: bool = a.cheek_style == 2 or a.cheek_style == 3
	if wants_blush:
		var blush := _mat(a.skin_tone().lerp(Color(0.95, 0.4, 0.4), 0.55))
		for side in [-1.0, 1.0]:
			_part(head, _flat_sphere(r * 0.1, 6, 3), blush,
					hc + Vector3(side * r * 0.52, -r * 0.22, r * 0.82 * head_scale.z),
					Vector3.ZERO, Vector3(1, 0.7, 0.35))
	if wants_freckles:
		var freckle := _mat(a.skin_tone().darkened(0.35))
		for i in 6:
			var side := -1.0 if i % 2 == 0 else 1.0
			var fx := side * r * (0.28 + 0.12 * float(i / 2))
			var fy := -r * (0.16 + 0.05 * float(i % 3))
			_part(head, _flat_sphere(r * 0.022, 5, 3), freckle,
					hc + Vector3(fx, fy, r * 0.96 * head_scale.z),
					Vector3.ZERO, Vector3(1, 1, 0.4))

	# ---------- orelhas ----------
	for side in [-1.0, 1.0]:
		var ear_pos := hc + Vector3(side * r * 1.0 * head_scale.x, 0, 0)
		match a.ear_style:
			0: _part(head, _flat_sphere(r * 0.09, 6, 4), skin, ear_pos,
					Vector3.ZERO, Vector3(0.5, 1, 0.75))
			1: _part(head, _flat_cone(r * 0.075, r * 0.2, 5), skin, ear_pos,
					Vector3(0, 0, side * deg_to_rad(-95)))
			2: _part(head, _flat_cone(r * 0.08, r * 0.38, 5), skin, ear_pos,
					Vector3(0, 0, side * deg_to_rad(-115)))

	# ---------- chifres ----------
	var horn := _mat(Color(0.92, 0.88, 0.8))
	var top_y := hc.y + r * 0.85 * head_scale.y
	match a.horn_style:
		1:
			for side in [-1.0, 1.0]:
				_part(head, _flat_cone(r * 0.09, r * 0.28, 6), horn,
						Vector3(side * r * 0.45, top_y, 0), Vector3(0, 0, side * deg_to_rad(-22)))
		2:
			for side in [-1.0, 1.0]:
				_part(head, _flat_cone(r * 0.1, r * 0.3, 6), horn,
						Vector3(side * r * 0.5, top_y, 0),
						Vector3(deg_to_rad(-38), 0, side * deg_to_rad(-30)))
				_part(head, _flat_cone(r * 0.05, r * 0.2, 6), horn,
						Vector3(side * r * 0.62, top_y + r * 0.18, -r * 0.22),
						Vector3(deg_to_rad(-72), 0, side * deg_to_rad(-16)))
		3:
			_part(head, _flat_cone(r * 0.075, r * 0.34, 6), horn,
					Vector3(0, top_y + r * 0.05, r * 0.3), Vector3(deg_to_rad(22), 0, 0))

	_build_hair(head, a, hc, r, head_scale, hair_mat)
	_build_hat(head, a, hc, r, head_scale)

	# ---------- óculos ----------
	if a.glasses_style > 0:
		var frame := _mat(Color(0.15, 0.13, 0.12))
		var gz := r * 1.06 * head_scale.z
		if a.glasses_style == 1:  # redondos
			for side in [-1.0, 1.0]:
				_part(head, _flat_torus(r * 0.1, r * 0.145), frame,
						hc + Vector3(side * r * 0.38, r * 0.06, gz),
						Vector3(deg_to_rad(90), 0, 0))
			_part(head, _flat_box(Vector3(r * 0.26, r * 0.045, r * 0.04)), frame,
					hc + Vector3(0, r * 0.06, gz))
		else:  # escuros
			var lens := _mat(Color(0.1, 0.09, 0.11))
			for side in [-1.0, 1.0]:
				_part(head, _flat_box(Vector3(r * 0.36, r * 0.24, r * 0.05)), lens,
						hc + Vector3(side * r * 0.38, r * 0.06, gz))
			_part(head, _flat_box(Vector3(r * 0.3, r * 0.05, r * 0.04)), frame,
					hc + Vector3(0, r * 0.1, gz))
	return eye_pivots


static func _build_hair(head: Node3D, a: CharacterAppearance, hc: Vector3, r: float,
		hs: Vector3, hair_mat: StandardMaterial3D) -> void:
	# A calota cobre topo e nuca, recuada para deixar testa e rosto livres.
	var has_hat := a.hat_style > 0
	var cap_y := 0.45 if has_hat else 0.6
	var cap_pos := hc + Vector3(0, r * 0.42 * hs.y, -r * 0.25)
	var cap_scale := Vector3(1.06 * hs.x, cap_y * hs.y, 1.0 * hs.z)

	var style := a.hair_style
	# Com chapéu, penteados de topo viram a calota simples (o chapéu cobre).
	if has_hat and style in [2, 5, 7]:
		style = 1

	# Franja na linha do cabelo, acima das sobrancelhas, emendando na calota —
	# evita o efeito "peruca recuada". (Tigela e moicano têm as próprias.)
	if style != 0 and style != 3 and style != 7:
		_part(head, _flat_box(Vector3(r * 1.08 * hs.x, r * 0.34, r * 0.18)), hair_mat,
				hc + Vector3(0, r * 0.68 * hs.y, r * 0.62 * hs.z),
				Vector3(deg_to_rad(-30), 0, 0))

	match style:
		0:  # raspado
			pass
		1:  # curto
			_part(head, _flat_sphere(r * 1.04, 8, 5), hair_mat, cap_pos, Vector3.ZERO, cap_scale)
		2:  # espetado
			_part(head, _flat_sphere(r * 1.04, 8, 5), hair_mat, cap_pos, Vector3.ZERO, cap_scale)
			var spikes := [
				Vector3(0, 1.0, 0), Vector3(0.4, 0.92, 0.2), Vector3(-0.4, 0.92, 0.2),
				Vector3(0.25, 0.95, -0.35), Vector3(-0.25, 0.95, -0.35), Vector3(0, 0.9, 0.5),
			]
			for s: Vector3 in spikes:
				_part(head, _flat_cone(r * 0.11, r * 0.3, 5), hair_mat,
						hc + s * r * 0.9 * hs, Vector3(s.z * 0.9, 0, -s.x * 0.9))
		3:  # tigela: calota mais baixa atrás + franja acima das sobrancelhas
			_part(head, _flat_sphere(r * 1.08, 8, 5), hair_mat,
					hc + Vector3(0, r * 0.3 * hs.y, -r * 0.18), Vector3.ZERO,
					Vector3(1.06 * hs.x, 0.72 * hs.y, 1.0 * hs.z))
			_part(head, _flat_box(Vector3(r * 1.3 * hs.x, r * 0.24, r * 0.14)), hair_mat,
					hc + Vector3(0, r * 0.56, r * 0.86 * hs.z))
		4:  # rabo de cavalo
			_part(head, _flat_sphere(r * 1.04, 8, 5), hair_mat, cap_pos, Vector3.ZERO, cap_scale)
			_part(head, _flat_sphere(r * 0.14, 6, 4), hair_mat,
					hc + Vector3(0, r * 0.55, -r * 0.9 * hs.z))
			_part(head, _flat_cyl(r * 0.12, r * 0.05, r * 0.85), hair_mat,
					hc + Vector3(0, r * 0.12, -r * 1.08 * hs.z), Vector3(deg_to_rad(-24), 0, 0))
		5:  # coques
			_part(head, _flat_sphere(r * 1.04, 8, 5), hair_mat, cap_pos, Vector3.ZERO, cap_scale)
			for side in [-1.0, 1.0]:
				_part(head, _flat_sphere(r * 0.2, 6, 4), hair_mat,
						hc + Vector3(side * r * 0.62, r * 0.95 * hs.y, -r * 0.15))
		6:  # longo
			_part(head, _flat_sphere(r * 1.06, 8, 5), hair_mat, cap_pos, Vector3.ZERO, cap_scale)
			_part(head, _flat_box(Vector3(r * 1.4 * hs.x, r * 1.4, r * 0.3)), hair_mat,
					hc + Vector3(0, -r * 0.3, -r * 0.92 * hs.z))
			for side in [-1.0, 1.0]:
				_part(head, _flat_box(Vector3(r * 0.22, r * 0.85, r * 0.26)), hair_mat,
						hc + Vector3(side * r * 0.98 * hs.x, -r * 0.25, r * 0.3))
		7:  # moicano
			for i in 5:
				var t := float(i) / 4.0
				_part(head, _flat_cone(r * 0.1, r * 0.34, 5), hair_mat,
						hc + Vector3(0, (r * 0.95 - absf(t - 0.4) * r * 0.3) * hs.y,
								(0.5 - t * 1.15) * r * hs.z),
						Vector3((t - 0.4) * 0.8, 0, 0))
		8:  # cacheado
			_part(head, _flat_sphere(r * 1.02, 8, 5), hair_mat, cap_pos, Vector3.ZERO, cap_scale)
			var curls := [
				Vector3(0, 0.95, 0.2), Vector3(0.55, 0.82, 0.28), Vector3(-0.55, 0.82, 0.28),
				Vector3(0.78, 0.55, -0.2), Vector3(-0.78, 0.55, -0.2), Vector3(0.4, 0.85, -0.5),
				Vector3(-0.4, 0.85, -0.5), Vector3(0, 0.9, -0.6),
			]
			for c: Vector3 in curls:
				_part(head, _flat_sphere(r * 0.16, 6, 4), hair_mat, hc + c * r * 0.88 * hs)


static func _build_hat(head: Node3D, a: CharacterAppearance, hc: Vector3, r: float,
		hs: Vector3) -> void:
	if a.hat_style == 0:
		return
	var mat: StandardMaterial3D = _mat(CharacterAppearance.CLOTH_COLORS[a.hat_color])
	# Assenta sobre o cabelo (achatado quando há chapéu) ou direto na cabeça.
	var top_y := hc.y + r * (0.9 if a.hair_style != 0 else 0.74) * hs.y
	match a.hat_style:
		1:  # chapéu de palha
			var straw := _mat(Color(0.85, 0.68, 0.32))
			_part(head, _flat_cyl(r * 1.5, r * 1.5, r * 0.08), straw, Vector3(0, top_y + r * 0.16, 0))
			_part(head, _flat_cone(r * 0.82, r * 0.5, 8), straw, Vector3(0, top_y + r * 0.38, 0))
			_part(head, _flat_cyl(r * 0.85, r * 0.85, r * 0.1), mat, Vector3(0, top_y + r * 0.2, 0))
		2:  # boné
			_part(head, _flat_sphere(r * 0.95, 8, 4), mat,
					Vector3(0, top_y - r * 0.05, 0), Vector3.ZERO, Vector3(1.05 * hs.x, 0.55, 1.05 * hs.z))
			_part(head, _flat_box(Vector3(r * 0.7, r * 0.06, r * 0.55)), mat,
					Vector3(0, top_y + r * 0.02, r * 0.95 * hs.z), Vector3(deg_to_rad(8), 0, 0))
		3:  # gorro
			_part(head, _flat_sphere(r * 1.0, 8, 4), mat,
					Vector3(0, top_y + r * 0.05, 0), Vector3.ZERO, Vector3(1.06 * hs.x, 0.9, 1.06 * hs.z))
			_part(head, _flat_cyl(r * 1.06, r * 1.06, r * 0.18), mat.duplicate(), Vector3(0, top_y - r * 0.1, 0))
			_part(head, _flat_sphere(r * 0.14, 6, 4), _mat(Color(0.95, 0.93, 0.88)),
					Vector3(0, top_y + r * 0.62, 0))


# ============================ malhas e materiais ============================

static func _part(parent: Node3D, mesh: Mesh, mat: Material, pos: Vector3,
		rot := Vector3.ZERO, scl := Vector3.ONE) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	mi.material_override = mat
	mi.position = pos
	mi.rotation = rot
	mi.scale = scl
	parent.add_child(mi)
	return mi


## Converte uma primitiva em ArrayMesh sem índices, com normais por face
## (o visual facetado do low-poly).
static func _flatten(key: String, primitive: PrimitiveMesh) -> ArrayMesh:
	if _mesh_cache.has(key):
		return _mesh_cache[key]
	var st := SurfaceTool.new()
	st.create_from(primitive, 0)
	st.deindex()
	st.generate_normals()
	var mesh := st.commit()
	_mesh_cache[key] = mesh
	return mesh


static func _flat_sphere(r: float, radial := 8, rings := 5) -> ArrayMesh:
	var key := "s%.3f_%d_%d" % [r, radial, rings]
	if _mesh_cache.has(key):
		return _mesh_cache[key]
	var m := SphereMesh.new()
	m.radius = r
	m.height = r * 2.0
	m.radial_segments = radial
	m.rings = rings
	return _flatten(key, m)


static func _flat_box(size: Vector3) -> ArrayMesh:
	var key := "b%.3f_%.3f_%.3f" % [size.x, size.y, size.z]
	if _mesh_cache.has(key):
		return _mesh_cache[key]
	var m := BoxMesh.new()
	m.size = size
	return _flatten(key, m)


static func _flat_cyl(top: float, bottom: float, h: float, radial := 7) -> ArrayMesh:
	var key := "c%.3f_%.3f_%.3f_%d" % [top, bottom, h, radial]
	if _mesh_cache.has(key):
		return _mesh_cache[key]
	var m := CylinderMesh.new()
	m.top_radius = top
	m.bottom_radius = bottom
	m.height = h
	m.radial_segments = radial
	return _flatten(key, m)


static func _flat_cone(r: float, h: float, radial := 6) -> ArrayMesh:
	return _flat_cyl(0.0, r, h, radial)


static func _flat_capsule(r: float, h: float) -> ArrayMesh:
	var key := "p%.3f_%.3f" % [r, h]
	if _mesh_cache.has(key):
		return _mesh_cache[key]
	var m := CapsuleMesh.new()
	m.radius = r
	m.height = maxf(h, r * 2.05)
	m.radial_segments = 7
	m.rings = 4
	return _flatten(key, m)


static func _flat_torus(inner: float, outer: float) -> ArrayMesh:
	var key := "t%.3f_%.3f" % [inner, outer]
	if _mesh_cache.has(key):
		return _mesh_cache[key]
	var m := TorusMesh.new()
	m.inner_radius = inner
	m.outer_radius = outer
	m.rings = 10
	m.ring_segments = 5
	return _flatten(key, m)


## Boca: faixa em arco (sorriso/frown) projetada sobre a casca esférica do
## rosto — cada vértice fica a `shell_r` do centro da cabeça, sem atravessar
## as facetas. `y_base` é a altura da boca em relação ao centro da cabeça.
static func _mouth_mesh(width: float, curve: float, thickness: float,
		shell_r: float, y_base: float) -> ArrayMesh:
	var key := "m%.3f_%.3f_%.3f_%.3f_%.3f" % [width, curve, thickness, shell_r, y_base]
	if _mesh_cache.has(key):
		return _mesh_cache[key]
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var segs := 8
	var prev_top: Vector3
	var prev_bot: Vector3
	for i in segs + 1:
		var t := float(i) / float(segs)
		var x := (t - 0.5) * width
		var arc := 1.0 - pow(2.0 * t - 1.0, 2.0)
		# curva positiva = cantos para cima (sorriso); negativa = para baixo
		var y := y_base + curve * 4.0 * (0.5 - arc)
		var y_top := y + thickness * 0.5
		var y_bot := y - thickness * 0.5
		var top := Vector3(x, y_top, sqrt(maxf(shell_r * shell_r - x * x - y_top * y_top, 0.0)))
		var bot := Vector3(x, y_bot, sqrt(maxf(shell_r * shell_r - x * x - y_bot * y_bot, 0.0)))
		if i > 0:
			st.add_vertex(prev_top)
			st.add_vertex(prev_bot)
			st.add_vertex(top)
			st.add_vertex(top)
			st.add_vertex(prev_bot)
			st.add_vertex(bot)
		prev_top = top
		prev_bot = bot
	st.generate_normals()
	var mesh := st.commit()
	_mesh_cache[key] = mesh
	return mesh


static func _mat(color: Color) -> StandardMaterial3D:
	var key := color.to_html()
	if _mat_cache.has(key):
		return _mat_cache[key]
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 1.0
	_mat_cache[key] = mat
	return mat


static func _mat_2side(color: Color) -> StandardMaterial3D:
	var key := color.to_html() + "_2s"
	if _mat_cache.has(key):
		return _mat_cache[key]
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 1.0
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	_mat_cache[key] = mat
	return mat
