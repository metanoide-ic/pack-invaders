class_name GameEventsBus
extends Node
## Autoload (nome de registro: GameEvents). Barramento global de sinais pra
## desacoplar HUD, player e alvos de teste — ninguém precisa de referência
## direta a ninguém.

signal player_health_changed(current: float, max_health: float)
signal player_resource_changed(current: float, max_resource: float)
signal ability_cooldown_started(ability_id: StringName, duration: float)
signal ability_state_changed(ability_id: StringName, active: bool)
signal target_damaged(target: Node, amount: float, source_ability: StringName)
signal target_destroyed(target: Node)
signal movement_state_changed(state_name: StringName)
signal objective_progress_changed(current: int, total: int)
signal objective_completed
signal screen_tint_flash(color: Color, duration: float)
signal necrose_status_changed(active: bool, time_left: float)
