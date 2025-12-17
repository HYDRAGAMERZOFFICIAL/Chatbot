Quickest Way (One Command - Automated)
run.bat
Just double-click run.bat in the project directory. It will automatically:

Install dependencies
Train the model
Start backend (port 8000)
Start frontend (port 8501)
Manual Way (Two Terminal Windows)
Terminal 1 - Start Backend API:

cd c:\laragon\www\Chaton
python backend/main.py
Backend will run at: http://localhost:8000

Terminal 2 - Start Frontend UI:

cd c:\laragon\www\Chaton
streamlit run frontend/app.py
Frontend will open at: http://localhost:8501

First Time Setup (If needed)
cd c:\laragon\www\Chaton
python train_model.py
This trains the ML model (one-time setup).

Verify Everything Works
cd c:\laragon\www\Chaton
python test_imports.py
Once running, visit http://localhost:8501 in your browser to use the chatbot.