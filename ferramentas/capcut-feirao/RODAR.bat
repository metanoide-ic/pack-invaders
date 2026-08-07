@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Conferindo dependencias...
python -c "import PIL, imageio_ffmpeg" 2>nul || python -m pip install --quiet pillow imageio-ffmpeg
python app.py
if errorlevel 1 (
  echo.
  echo Algo deu errado. Copie a mensagem acima e me mande.
  pause
)
