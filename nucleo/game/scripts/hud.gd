extends CanvasLayer
## HUD: relógio, hotbar de ferramentas, inventário e mensagens rápidas.

const SLOT_NORMAL := Color(1, 1, 1, 0.55)
const SLOT_SELECTED := Color(1.0, 0.85, 0.4, 1.0)

var _slots: Array[PanelContainer] = []
var _inv_label: Label
var _toast: Label
var _toast_tween: Tween

@onready var clock_label: Label = $ClockLabel


func setup(player: Player) -> void:
	_build(player)
	player.tool_changed.connect(_on_tool_changed)
	player.inventory_changed.connect(_on_inventory_changed)
	player.notified.connect(_show_toast)
	_on_tool_changed(player.selected_tool)
	_on_inventory_changed(player.inventory)


func _build(player: Player) -> void:
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)

	var bar := HBoxContainer.new()
	bar.alignment = BoxContainer.ALIGNMENT_CENTER
	bar.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	bar.offset_top = -92.0
	bar.offset_bottom = -18.0
	bar.add_theme_constant_override("separation", 8)
	bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(bar)

	for i in player.TOOLS.size():
		var slot := PanelContainer.new()
		slot.custom_minimum_size = Vector2(110, 0)
		var box := VBoxContainer.new()
		box.alignment = BoxContainer.ALIGNMENT_CENTER
		var key := Label.new()
		key.text = str(i + 1)
		key.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		key.add_theme_font_size_override("font_size", 12)
		key.modulate = Color(1, 1, 1, 0.6)
		var name_label := Label.new()
		name_label.text = player.TOOLS[i].name
		name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		name_label.add_theme_font_size_override("font_size", 15)
		box.add_child(key)
		box.add_child(name_label)
		slot.add_child(box)
		bar.add_child(slot)
		_slots.append(slot)

	_inv_label = Label.new()
	_inv_label.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	_inv_label.offset_left = -420.0
	_inv_label.offset_top = 12.0
	_inv_label.offset_right = -16.0
	_inv_label.offset_bottom = 40.0
	_inv_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_inv_label.add_theme_font_size_override("font_size", 20)
	root.add_child(_inv_label)

	_toast = Label.new()
	_toast.set_anchors_preset(Control.PRESET_CENTER)
	_toast.offset_left = -300.0
	_toast.offset_right = 300.0
	_toast.offset_top = 90.0
	_toast.offset_bottom = 130.0
	_toast.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_toast.add_theme_font_size_override("font_size", 24)
	_toast.modulate.a = 0.0
	root.add_child(_toast)


func _on_tool_changed(index: int) -> void:
	for i in _slots.size():
		_slots[i].self_modulate = SLOT_SELECTED if i == index else SLOT_NORMAL


func _on_inventory_changed(inventory: Dictionary) -> void:
	var parts: Array[String] = []
	for item_name: String in inventory:
		parts.append("%s × %d" % [item_name, inventory[item_name]])
	_inv_label.text = "  ·  ".join(parts)


func _show_toast(text: String) -> void:
	_toast.text = text
	if _toast_tween != null:
		_toast_tween.kill()
	_toast.modulate.a = 1.0
	_toast_tween = create_tween()
	_toast_tween.tween_interval(1.2)
	_toast_tween.tween_property(_toast, "modulate:a", 0.0, 0.6)
