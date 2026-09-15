extends Area3D
## Caspa: cai no chão quando o jogador chacoalha a cabeça (ver
## Player._fire_caspa). Fica parada como uma mina — o primeiro corpo que
## encostar (inimigo ou o que for) detona ela, dano em área, e ela some.

@export var damage: float = 24.0
@export var explosion_radius: float = 2.2
@export var lifetime: float = 12.0

var _shooter: Node = null
var _spent: bool = false


func set_damage(value: float) -> void:
	damage = value


func set_explosion_radius(value: float) -> void:
	explosion_radius = value


func set_shooter(node: Node) -> void:
	_shooter = node


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	get_tree().create_timer(lifetime).timeout.connect(queue_free)


func _on_body_entered(body: Node) -> void:
	if _spent or body == _shooter:
		return
	_spent = true
	_explode()
	queue_free()


func _explode() -> void:
	var space_state := get_world_3d().direct_space_state
	var shape := SphereShape3D.new()
	shape.radius = explosion_radius
	var query := PhysicsShapeQueryParameters3D.new()
	query.shape = shape
	query.transform = Transform3D(Basis(), global_position)
	query.collide_with_bodies = true
	query.collide_with_areas = true
	if _shooter is CollisionObject3D:
		query.exclude = [(_shooter as CollisionObject3D).get_rid()]

	for result in space_state.intersect_shape(query, 16):
		var collider: Object = result.get("collider")
		if collider and collider.has_method(&"take_damage"):
			collider.take_damage(damage, _shooter)
			GameEvents.target_damaged.emit(collider, damage, &"caspa")
