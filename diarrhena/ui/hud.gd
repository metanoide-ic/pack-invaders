extends CanvasLayer
## HUD mínimo do protótipo: vida, energia (recurso compartilhado das
## habilidades contínuas), estado de movimento (debug) e barra de cooldown
## das habilidades discretas. Tudo ouvindo o GameEvents — zero acoplamento
## com o Player.

@onready var health_bar: ProgressBar = %HealthBar
@onready var resource_bar: ProgressBar = %ResourceBar
@onready var move_state_label: Label = %MoveStateLabel
@onready var cooldown_label: Label = %CooldownLabel
@onready var objective_label: Label = %ObjectiveLabel
@onready var victory_banner: Label = %VictoryBanner
@onready var loadout_label: Label = %LoadoutLabel
@onready var tint_overlay: ColorRect = %TintOverlay
@onready var necrose_label: Label = %NecroseLabel
@onready var player: Node = get_tree().get_first_node_in_group(&"player")

var _cooldown_texts: Dictionary = {}
var _tint_tween: Tween


func _ready() -> void:
	GameEvents.player_health_changed.connect(_on_health_changed)
	GameEvents.player_resource_changed.connect(_on_resource_changed)
	GameEvents.movement_state_changed.connect(_on_move_state_changed)
	GameEvents.ability_cooldown_started.connect(_on_cooldown_started)
	GameEvents.objective_progress_changed.connect(_on_objective_progress_changed)
	GameEvents.objective_completed.connect(_on_objective_completed)
	GameEvents.screen_tint_flash.connect(_on_screen_tint_flash)
	GameEvents.necrose_status_changed.connect(_on_necrose_status_changed)
	_refresh_loadout_label()


func _on_health_changed(current: float, max_health: float) -> void:
	health_bar.max_value = max_health
	health_bar.value = current


func _on_resource_changed(current: float, max_resource: float) -> void:
	resource_bar.max_value = max_resource
	resource_bar.value = current


func _on_move_state_changed(state_name: StringName) -> void:
	move_state_label.text = "estado: %s" % state_name


func _on_cooldown_started(ability_id: StringName, duration: float) -> void:
	_cooldown_texts[ability_id] = duration
	_refresh_cooldown_label()


func _process(delta: float) -> void:
	if _cooldown_texts.is_empty():
		return
	var changed := false
	for key in _cooldown_texts.keys():
		_cooldown_texts[key] = max(0.0, _cooldown_texts[key] - delta)
		if _cooldown_texts[key] <= 0.0:
			_cooldown_texts.erase(key)
			changed = true
	if changed or not _cooldown_texts.is_empty():
		_refresh_cooldown_label()


func _refresh_cooldown_label() -> void:
	var parts: Array = []
	for key in _cooldown_texts.keys():
		parts.append("%s %.1fs" % [key, _cooldown_texts[key]])
	cooldown_label.text = " | ".join(parts)


func _on_objective_progress_changed(current: int, total: int) -> void:
	objective_label.text = "Inimigos derrotados: %d/%d" % [current, total]


func _on_objective_completed() -> void:
	victory_banner.visible = true


func _on_screen_tint_flash(color: Color, duration: float) -> void:
	if _tint_tween:
		_tint_tween.kill()
	tint_overlay.color = color
	_tint_tween = create_tween()
	_tint_tween.tween_property(tint_overlay, "color:a", 0.0, duration).set_ease(Tween.EASE_OUT)


func _on_necrose_status_changed(active: bool, time_left: float) -> void:
	if not active:
		necrose_label.visible = false
		return
	necrose_label.visible = true
	necrose_label.text = "NECROSE: %d s até morrer" % int(ceil(time_left))


func _refresh_loadout_label() -> void:
	if not is_instance_valid(player):
		return
	loadout_label.text = "1:%s  2:%s  3:%s\nR:%s  C:%s" % [
		player.weapon_slot_1, player.weapon_slot_2, player.weapon_slot_3,
		player.support_slot_r, player.support_slot_c,
	]
