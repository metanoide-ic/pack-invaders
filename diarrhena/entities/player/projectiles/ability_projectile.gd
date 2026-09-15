class_name AbilityProjectile
extends Area3D
## Projétil genérico usado por Cocô, Cuspe, Catarro e Espinhas — só muda
## dano/raio de área/gravidade por cena (ver poop_projectile.tscn etc).
## Área em vez de RigidBody: queremos controle total da trajetória, não
## simulação de física (skill player-controller, seção 1).

@export var damage: float = 10.0
@export var aoe_radius: float = 0.0  # 0 = dano só no alvo atingido direto
@export var lifetime: float = 4.0
@export var gravity_scale: float = 0.0
@export var ability_id: StringName = &"coco"
@export var pierce: bool = false  ## Milho: não para no primeiro alvo, atravessa

var velocity: Vector3 = Vector3.ZERO
var _shooter: Node = null
var _spent: bool = false
var _hit_bodies: Array = []


func launch(direction: Vector3, speed: float, shooter: Node = null) -> void:
	var dir := direction.normalized()
	velocity = dir * speed
	_shooter = shooter
	if abs(dir.dot(Vector3.UP)) < 0.98:
		look_at(global_position + dir, Vector3.UP)


func set_damage(value: float) -> void:
	damage = value


func _ready() -> void:
	body_entered.connect(_on_hit)
	area_entered.connect(_on_hit)
	# Godot desconecta sozinho sinais ligados a um objeto já liberado, então
	# não precisa de guarda extra aqui mesmo se o projétil já tiver
	# explodido antes do timer de lifetime disparar.
	get_tree().create_timer(lifetime).timeout.connect(queue_free)


func _physics_process(delta: float) -> void:
	velocity.y -= 22.0 * gravity_scale * delta
	global_position += velocity * delta


func _on_hit(other: Node) -> void:
	if other == _shooter:
		return

	if pierce and other.has_method(&"take_damage"):
		# só atravessa alvos que dão dano de verdade — bater numa parede
		# (sem take_damage) ainda destrói o projétil normalmente
		if other in _hit_bodies:
			return
		_hit_bodies.append(other)
		_apply_damage(other)
		return

	if _spent:
		return
	_spent = true
	if aoe_radius > 0.0:
		_explode()
	else:
		_apply_damage(other)
	queue_free()


func _apply_damage(target: Node) -> void:
	if target.has_method(&"take_damage"):
		target.take_damage(damage, _shooter)
		GameEvents.target_damaged.emit(target, damage, ability_id)


func _explode() -> void:
	var space_state := get_world_3d().direct_space_state
	var shape := SphereShape3D.new()
	shape.radius = aoe_radius
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
			GameEvents.target_damaged.emit(collider, damage, ability_id)
