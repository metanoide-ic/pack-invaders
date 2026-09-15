extends Node3D
## Os modelos do Kenney City Kit vêm com UV mapeada num atlas de cor
## compartilhado ("colormap.png" por pacote), mas o material embutido no
## GLB às vezes não sobrevive à importação automática do Godot (build
## renderiza tudo branco). Anexar esse script no nó raiz de cada instância
## e apontar `colormap` pro atlas certo do pacote resolve sem precisar
## mexer nas configurações de import de cada .glb na mão.

@export var colormap: Texture2D


func _ready() -> void:
	if colormap == null:
		return
	var mat := StandardMaterial3D.new()
	mat.albedo_texture = colormap
	mat.roughness = 0.8
	_apply_recursive(self, mat)


func _apply_recursive(node: Node, mat: Material) -> void:
	if node is MeshInstance3D:
		for i in range(node.get_surface_override_material_count()):
			node.set_surface_override_material(i, mat)
	for child in node.get_children():
		_apply_recursive(child, mat)
