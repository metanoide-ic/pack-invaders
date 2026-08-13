extends Node3D
## Criador de personagem: painel de opções à esquerda, preview 3D ao vivo à
## direita (arraste para girar). "Começar" grava a aparência no PlayerData e
## abre a fazenda.

const ROW_HEIGHT := 34

var _appearance := CharacterAppearance.new()
var _rows := []  # [{def, value_label, chip}]
var _dragging := false

@onready var holder: Node3D = $Holder
@onready var _rng := RandomNumberGenerator.new()

# Cada linha: rótulo + propriedade + (names | values+names | colors)
var _defs := [
	{"section": "Corpo"},
	{"label": "Altura", "prop": "height",
		"values": [0.88, 0.94, 1.0, 1.06, 1.12],
		"names": ["Baixinho", "Baixo", "Médio", "Alto", "Altão"]},
	{"label": "Corpo", "prop": "build",
		"values": [0.1, 0.4, 0.7, 1.0],
		"names": ["Magro", "Médio", "Cheinho", "Forte"]},
	{"label": "Tom de pele", "prop": "skin", "colors": CharacterAppearance.SKIN_TONES},
	{"label": "Rosto", "prop": "head_shape", "names": CharacterAppearance.HEAD_SHAPES},
	{"section": "Rosto"},
	{"label": "Olhos", "prop": "eye_shape", "names": CharacterAppearance.EYE_SHAPES},
	{"label": "Cor dos olhos", "prop": "eye_color", "colors": CharacterAppearance.EYE_COLORS},
	{"label": "Sobrancelhas", "prop": "brow_style", "names": CharacterAppearance.BROW_STYLES},
	{"label": "Nariz", "prop": "nose_style", "names": CharacterAppearance.NOSE_STYLES},
	{"label": "Boca", "prop": "mouth_style", "names": CharacterAppearance.MOUTH_STYLES},
	{"label": "Bochechas", "prop": "cheek_style", "names": CharacterAppearance.CHEEK_STYLES},
	{"label": "Orelhas", "prop": "ear_style", "names": CharacterAppearance.EAR_STYLES},
	{"label": "Chifres", "prop": "horn_style", "names": CharacterAppearance.HORN_STYLES},
	{"section": "Cabelo e acessórios"},
	{"label": "Cabelo", "prop": "hair_style", "names": CharacterAppearance.HAIR_STYLES},
	{"label": "Cor do cabelo", "prop": "hair_color", "colors": CharacterAppearance.HAIR_COLORS},
	{"label": "Chapéu", "prop": "hat_style", "names": CharacterAppearance.HAT_STYLES},
	{"label": "Cor do chapéu", "prop": "hat_color", "colors": CharacterAppearance.CLOTH_COLORS},
	{"label": "Óculos", "prop": "glasses_style", "names": CharacterAppearance.GLASSES_STYLES},
	{"section": "Roupas"},
	{"label": "Camisa", "prop": "shirt_style", "names": CharacterAppearance.SHIRT_STYLES},
	{"label": "Cor da camisa", "prop": "shirt_color", "colors": CharacterAppearance.CLOTH_COLORS},
	{"label": "Calça", "prop": "pants_style", "names": CharacterAppearance.PANTS_STYLES},
	{"label": "Cor da calça", "prop": "pants_color", "colors": CharacterAppearance.CLOTH_COLORS},
	{"label": "Sapatos", "prop": "shoe_color", "colors": CharacterAppearance.CLOTH_COLORS},
	{"section": "Personalidade"},
	{"label": "Jeito", "prop": "vibe", "names": CharacterAppearance.VIBES},
]


func _ready() -> void:
	_rng.randomize()
	# Apoio a screenshots de desenvolvimento: pré-carrega uma aparência sorteada.
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("creator_seed="):
			var rng := RandomNumberGenerator.new()
			rng.seed = int(arg.trim_prefix("creator_seed="))
			_appearance.randomize_appearance(rng, arg.ends_with("f"))
	_build_ui()
	_rebuild_character()


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		_dragging = event.pressed
	elif event is InputEventMouseMotion and _dragging:
		holder.rotate_y(event.relative.x * 0.01)


func _process(delta: float) -> void:
	if not _dragging:
		holder.rotate_y(delta * 0.35)


func _rebuild_character() -> void:
	for child in holder.get_children():
		child.queue_free()
	var rig := CharacterBuilder.build(_appearance)
	holder.add_child(rig)


# ------------------------------ UI ------------------------------

func _build_ui() -> void:
	var ui := CanvasLayer.new()
	add_child(ui)

	var panel := PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_LEFT_WIDE)
	panel.custom_minimum_size = Vector2(460, 0)
	ui.add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	panel.add_child(vbox)

	var title := Label.new()
	title.text = "Criar personagem"
	title.add_theme_font_size_override("font_size", 26)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(title)

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	vbox.add_child(scroll)

	var list := VBoxContainer.new()
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list.add_theme_constant_override("separation", 2)
	scroll.add_child(list)

	for def: Dictionary in _defs:
		if def.has("section"):
			var section := Label.new()
			section.text = def.section
			section.add_theme_font_size_override("font_size", 15)
			section.modulate = Color(1, 0.85, 0.5)
			list.add_child(section)
			continue
		list.add_child(_make_row(def))

	var buttons := HBoxContainer.new()
	buttons.alignment = BoxContainer.ALIGNMENT_CENTER
	buttons.add_theme_constant_override("separation", 10)
	vbox.add_child(buttons)

	_add_button(buttons, "Aleatório", func() -> void:
		_appearance.randomize_appearance(_rng)
		_refresh_all())
	_add_button(buttons, "Fantástico", func() -> void:
		_appearance.randomize_appearance(_rng, true)
		_refresh_all())
	_add_button(buttons, "Começar  ▶", _start_game)


func _make_row(def: Dictionary) -> Control:
	var row := HBoxContainer.new()
	row.custom_minimum_size = Vector2(0, ROW_HEIGHT)

	var label := Label.new()
	label.text = def.label
	label.custom_minimum_size = Vector2(150, 0)
	row.add_child(label)

	var prev := Button.new()
	prev.text = "◀"
	prev.custom_minimum_size = Vector2(36, 0)
	row.add_child(prev)

	var chip: ColorRect = null
	if def.has("colors"):
		chip = ColorRect.new()
		chip.custom_minimum_size = Vector2(26, 22)
		chip.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		row.add_child(chip)

	var value := Label.new()
	value.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	value.custom_minimum_size = Vector2(130, 0)
	value.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(value)

	var next := Button.new()
	next.text = "▶"
	next.custom_minimum_size = Vector2(36, 0)
	row.add_child(next)

	var entry := {"def": def, "value": value, "chip": chip}
	_rows.append(entry)
	prev.pressed.connect(func() -> void: _cycle(entry, -1))
	next.pressed.connect(func() -> void: _cycle(entry, 1))
	_refresh_row(entry)
	return row


func _option_count(def: Dictionary) -> int:
	if def.has("colors"):
		return def.colors.size()
	if def.has("values"):
		return def.values.size()
	return def.names.size()


func _current_index(def: Dictionary) -> int:
	if def.has("values"):
		# encontra o valor mais próximo (height/build são floats)
		var current: float = _appearance.get(def.prop)
		var best := 0
		var best_dist := INF
		for i in def.values.size():
			var dist: float = absf(def.values[i] - current)
			if dist < best_dist:
				best_dist = dist
				best = i
		return best
	return _appearance.get(def.prop)


func _cycle(entry: Dictionary, dir: int) -> void:
	var def: Dictionary = entry.def
	var count := _option_count(def)
	var idx := (_current_index(def) + dir + count) % count
	if def.has("values"):
		_appearance.set(def.prop, def.values[idx])
	else:
		_appearance.set(def.prop, idx)
	_refresh_row(entry)
	_rebuild_character()


func _refresh_row(entry: Dictionary) -> void:
	var def: Dictionary = entry.def
	var idx := _current_index(def)
	if def.has("colors"):
		entry.chip.color = def.colors[idx]
		entry.value.text = "Cor %d" % (idx + 1)
	else:
		entry.value.text = def.names[idx]


func _refresh_all() -> void:
	for entry: Dictionary in _rows:
		_refresh_row(entry)
	_rebuild_character()


func _add_button(parent: Node, text: String, action: Callable) -> void:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(0, 42)
	button.add_theme_font_size_override("font_size", 17)
	button.pressed.connect(action)
	parent.add_child(button)


func _start_game() -> void:
	PlayerData.appearance = _appearance.duplicate_appearance()
	get_tree().change_scene_to_file("res://scenes/main.tscn")
