class_name FarmGrid
extends Node3D
## Grade de cultivo: preparar solo (enxada), plantar, regar, crescer com os
## dias do GameClock e colher. Células de 1×1 m centradas em coordenadas
## inteiras do mundo.

signal crop_harvested(crop_id: String, crop_name: String)

const AREA_HALF := 28  # limite da área cultivável (metade do terreno)

const CROPS := {
	"turnip": {"name": "Nabo", "grow_days": 3, "color": Color(0.93, 0.9, 0.85)},
	"pumpkin": {"name": "Abóbora", "grow_days": 6, "color": Color(0.91, 0.53, 0.2)},
}

var _cells := {}  # Vector2i -> {watered, crop, days, soil, plant}

var _soil_mesh: BoxMesh
var _soil_dry: StandardMaterial3D
var _soil_wet: StandardMaterial3D
var _sprout_mesh: CylinderMesh
var _sprout_mat: StandardMaterial3D
var _mature_meshes := {}  # crop_id -> Mesh


func _ready() -> void:
	add_to_group("farm_grid")

	_soil_mesh = BoxMesh.new()
	_soil_mesh.size = Vector3(0.95, 0.08, 0.95)
	_soil_dry = _make_mat(Color(0.45, 0.31, 0.2))
	_soil_wet = _make_mat(Color(0.29, 0.19, 0.12))

	_sprout_mesh = CylinderMesh.new()
	_sprout_mesh.top_radius = 0.0
	_sprout_mesh.bottom_radius = 0.16
	_sprout_mesh.height = 0.4
	_sprout_mesh.radial_segments = 6
	_sprout_mat = _make_mat(Color(0.29, 0.62, 0.27))

	for crop_id: String in CROPS:
		var sphere := SphereMesh.new()
		sphere.radius = 0.26
		sphere.height = 0.52
		sphere.radial_segments = 10
		sphere.rings = 5
		sphere.material = _make_mat(CROPS[crop_id].color)
		_mature_meshes[crop_id] = sphere

	var clock := get_node_or_null("/root/GameClock")
	if clock != null:
		clock.day_changed.connect(_on_day_changed)


func world_to_cell(pos: Vector3) -> Vector2i:
	return Vector2i(roundi(pos.x), roundi(pos.z))


## Aplica a ferramenta na célula. Retorna uma mensagem para o HUD ("" = nada).
func use_tool(tool_id: String, cell: Vector2i) -> String:
	if absi(cell.x) > AREA_HALF or absi(cell.y) > AREA_HALF:
		return ""
	var c: Dictionary = _cells.get(cell, {})

	# Colheita acontece com qualquer ferramenta.
	if not c.is_empty() and c.crop != "" and c.days >= CROPS[c.crop].grow_days:
		var id: String = c.crop
		c.crop = ""
		c.days = 0
		_refresh(cell)
		crop_harvested.emit(id, CROPS[id].name)
		return "Você colheu: %s!" % CROPS[id].name

	match tool_id:
		"hoe":
			if c.is_empty():
				_till(cell)
				return "Solo preparado"
		"can":
			if not c.is_empty() and not c.watered:
				c.watered = true
				_refresh(cell)
				return "Regado"
		"seed_turnip", "seed_pumpkin":
			var crop_id := tool_id.trim_prefix("seed_")
			if not c.is_empty() and c.crop == "":
				c.crop = crop_id
				c.days = 0
				_refresh(cell)
				return "Você plantou: %s" % CROPS[crop_id].name
	return ""


func _till(cell: Vector2i) -> void:
	var soil := MeshInstance3D.new()
	soil.mesh = _soil_mesh
	soil.material_override = _soil_dry
	soil.position = Vector3(cell.x, 0.02, cell.y)
	add_child(soil)

	var plant := MeshInstance3D.new()
	plant.position = Vector3(cell.x, 0.06, cell.y)
	plant.visible = false
	add_child(plant)

	_cells[cell] = {"watered": false, "crop": "", "days": 0, "soil": soil, "plant": plant}


func _refresh(cell: Vector2i) -> void:
	var c: Dictionary = _cells[cell]
	var soil: MeshInstance3D = c.soil
	var plant: MeshInstance3D = c.plant
	soil.material_override = _soil_wet if c.watered else _soil_dry

	if c.crop == "":
		plant.visible = false
		return
	plant.visible = true
	var grow_days: int = CROPS[c.crop].grow_days
	if c.days >= grow_days:
		plant.mesh = _mature_meshes[c.crop]
		plant.material_override = null
		plant.position.y = 0.32
		plant.scale = Vector3.ONE
	else:
		var progress := float(c.days) / float(grow_days)
		plant.mesh = _sprout_mesh
		plant.material_override = _sprout_mat
		plant.position.y = 0.06
		plant.scale = Vector3.ONE * (0.35 + 0.65 * progress)


func _on_day_changed(_day: int, _season: int) -> void:
	for cell: Vector2i in _cells:
		var c: Dictionary = _cells[cell]
		if c.crop != "" and c.watered:
			c.days += 1
		c.watered = false
		_refresh(cell)


func _make_mat(color: Color) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 1.0
	return mat
