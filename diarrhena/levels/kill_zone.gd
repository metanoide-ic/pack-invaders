extends Area3D
## Zona embaixo do mapa: quem cair no vazio (errou o wall-run/boost sobre o
## fosso) volta pro spawn em vez de cair pra sempre.

@export var respawn_point: Vector3 = Vector3(0, 1.2, 3)


func _ready() -> void:
	body_entered.connect(_on_body_entered)


func _on_body_entered(body: Node) -> void:
	if body.has_method(&"reset_position"):
		body.reset_position(respawn_point)
