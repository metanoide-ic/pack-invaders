extends Node
## Autoload de desenvolvimento: captura uma screenshot e sai, quando o jogo
## é iniciado com argumentos de usuário. Inerte em execução normal.
##   godot --path . -- shot=/tmp/foto.png shot_frames=45 shot_scene=res://scenes/main.tscn

var _path := ""
var _frames := 0


func _ready() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("shot="):
			_path = arg.trim_prefix("shot=")
		elif arg.begins_with("shot_frames="):
			_frames = int(arg.trim_prefix("shot_frames="))
		elif arg.begins_with("shot_scene="):
			get_tree().change_scene_to_file.call_deferred(arg.trim_prefix("shot_scene="))
	if _path != "" and _frames <= 0:
		_frames = 45


func _process(_delta: float) -> void:
	if _path == "":
		return
	_frames -= 1
	if _frames > 0:
		return
	var img := get_viewport().get_texture().get_image()
	img.save_png(_path)
	print("screenshot salva: ", _path)
	_path = ""
	get_tree().quit()
