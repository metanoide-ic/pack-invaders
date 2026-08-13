extends Node
## Autoload: relógio do jogo — ciclo de dia/noite e calendário de estações.
## 1 dia de jogo = 15 minutos reais (ajustável). 4 estações de 30 dias.

signal hour_changed(hour: int)
signal day_changed(day: int, season: int)

const REAL_SECONDS_PER_GAME_DAY := 15.0 * 60.0
const HOURS_PER_DAY := 24.0
const DAYS_PER_SEASON := 30
const SEASONS := ["Primavera", "Verão", "Outono", "Inverno"]
const DAY_START_HOUR := 6.0

var day := 1
var season := 0
var year := 1
var time_of_day := DAY_START_HOUR  # horas, 0.0–24.0
var paused := false

var _last_hour := int(DAY_START_HOUR)


func _process(delta: float) -> void:
	if paused:
		return
	time_of_day += delta * HOURS_PER_DAY / REAL_SECONDS_PER_GAME_DAY
	if time_of_day >= HOURS_PER_DAY:
		time_of_day -= HOURS_PER_DAY
		_advance_day()
	var hour := int(time_of_day)
	if hour != _last_hour:
		_last_hour = hour
		hour_changed.emit(hour)


## Pula direto para o início do próximo dia (dormir na cama).
func sleep_to_next_day() -> void:
	time_of_day = DAY_START_HOUR
	_last_hour = int(DAY_START_HOUR)
	_advance_day()


func _advance_day() -> void:
	day += 1
	if day > DAYS_PER_SEASON:
		day = 1
		season = (season + 1) % SEASONS.size()
		if season == 0:
			year += 1
	day_changed.emit(day, season)


func season_name() -> String:
	return SEASONS[season]


func clock_text() -> String:
	var hour := int(time_of_day)
	var minute := int(fmod(time_of_day, 1.0) * 60.0)
	return "%02d:%02d — Dia %d, %s, Ano %d" % [hour, minute, day, season_name(), year]
