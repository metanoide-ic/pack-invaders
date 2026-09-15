extends Area3D
## Cera de ouvido (passiva): poça deixada no chão por onde o jogador anda.
## Inimigo que pisar fica "grudado" (reaproveita apply_stun do alvo) por um
## tempo. Some sozinha depois de `lifetime`.

@export var stick_duration: float = 2.5
@export var lifetime: float = 8.0


func set_stick_duration(value: float) -> void:
	stick_duration = value


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	get_tree().create_timer(lifetime).timeout.connect(queue_free)


func _on_body_entered(body: Node) -> void:
	if body.has_method(&"apply_stun"):
		body.apply_stun(stick_duration)
