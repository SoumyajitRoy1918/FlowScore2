mkdir FlowScore_temp_repo\frontend
robocopy . FlowScore_temp_repo\frontend /E /XD .git node_modules dist .venv .vscode FlowScore_temp_repo /XF vite-dev.log .env run_steps.bat
cd FlowScore_temp_repo
git add .
git commit -m "Initialize project in frontend folder"
git push origin main
