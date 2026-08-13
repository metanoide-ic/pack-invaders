extends Node3D
## Casa simples do jogador: fachada low-poly gerada por código + uma cama
## que funciona como ponto de dormir (grupo "bed" — o Player detecta a
## proximidade e permite dormir com E, pulando para o próximo dia).

const WALL_COLOR := Color(0.9, 0.8, 0.6)
const ROOF_COLOR := Color(0.78, 0.36, 0.24)
const DOOR_COLOR := Color(0.48, 0.32, 0.18)
const BED_FRAME_COLOR := Color(0.55, 0.36, 0.22)
const BED_SHEET_COLOR := Color(0.35, 0.55, 0.78)
const BED_PILLOW_COLOR := Color(0.96, 0.94, 0.88)


func _ready() -> void:
	_build_house()
	_build_bed()


func _build_house() -> void:
	var walls := StaticBody3D.new()
	walls.name = "Walls"
	add_child(walls)

	var wall_size := Vector3(4.2, 2.6, 3.6)
	var wall_mesh := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = wall_size
	wall_mesh.mesh = box
	wall_mesh.position = Vector3(0, wall_size.y * 0.5, 0)
	wall_mesh.material_override = _mat(WALL_COLOR)
	walls.add_child(wall_mesh)

	var wall_shape := CollisionShape3D.new()
	var box_shape := BoxShape3D.new()
	box_shape.size = wall_size
	wall_shape.shape = box_shape
	wall_shape.position = wall_mesh.position
	walls.add_child(wall_shape)

	var roof := MeshInstance3D.new()
	var roof_mesh := CylinderMesh.new()
	roof_mesh.top_radius = 0.0
	roof_mesh.bottom_radius = 3.4
	roof_mesh.height = 1.8
	roof_mesh.radial_segments = 4
	roof.mesh = roof_mesh
	roof.position = Vector3(0, wall_size.y + 0.9, 0)
	roof.rotation.y = deg_to_rad(45)
	roof.material_override = _mat(ROOF_COLOR)
	add_child(roof)

	var door := MeshInstance3D.new()
	var door_mesh := BoxMesh.new()
	door_mesh.size = Vector3(0.9, 1.5, 0.12)
	door.mesh = door_mesh
	door.position = Vector3(0, 0.75, wall_size.z * 0.5 + 0.06)
	door.material_override = _mat(DOOR_COLOR)
	add_child(door)


func _build_bed() -> void:
	var bed := StaticBody3D.new()
	bed.name = "Bed"
	bed.add_to_group("bed")
	bed.position = Vector3(0, 0, 3.4)
	add_child(bed)

	var frame := MeshInstance3D.new()
	var frame_mesh := BoxMesh.new()
	frame_mesh.size = Vector3(1.1, 0.35, 2.0)
	frame.mesh = frame_mesh
	frame.position = Vector3(0, 0.18, 0)
	frame.material_override = _mat(BED_FRAME_COLOR)
	bed.add_child(frame)

	var sheet := MeshInstance3D.new()
	var sheet_mesh := BoxMesh.new()
	sheet_mesh.size = Vector3(1.0, 0.1, 1.85)
	sheet.mesh = sheet_mesh
	sheet.position = Vector3(0, 0.4, 0)
	sheet.material_override = _mat(BED_SHEET_COLOR)
	bed.add_child(sheet)

	var pillow := MeshInstance3D.new()
	var pillow_mesh := BoxMesh.new()
	pillow_mesh.size = Vector3(0.85, 0.16, 0.4)
	pillow.mesh = pillow_mesh
	pillow.position = Vector3(0, 0.48, -0.75)
	pillow.material_override = _mat(BED_PILLOW_COLOR)
	bed.add_child(pillow)

	var shape := CollisionShape3D.new()
	var box_shape := BoxShape3D.new()
	box_shape.size = Vector3(1.1, 0.5, 2.0)
	shape.shape = box_shape
	shape.position = Vector3(0, 0.25, 0)
	bed.add_child(shape)


func _mat(color: Color) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 1.0
	return mat
