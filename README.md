# AI College Chatbot

An AI-powered intelligent chatbot system designed to automatically answer queries about Sri Satya Sai Group of Colleges () using Natural Language Processing (NLP) and Machine Learning (ML).

## 📋 Project Overview

The chatbot system:
- **Extracts** official data from  website () via automated web scraping
- **Processes** raw text using NLP techniques (tokenization, lemmatization, preprocessing)
- **Trains** ML intent classification model using TF-IDF vectorization and Naive Bayes
- **Predicts** user intent and provides confident responses with fallback mechanisms
- **Logs** conversations and low-confidence queries for continuous improvement
- **Provides** interactive web interface (Streamlit) and REST API (FastAPI)

## 🚀 Features

✨ **Smart Intent Classification** - Identifies user intent with confidence scoring  
🛡️ **Confidence-Based Fallback** - Safe responses when uncertain  
📊 **Chat Analytics** - Track conversations and performance metrics  
🔄 **Continuous Learning** - Low-confidence queries logged for retraining  
⚡ **Fast API** - RESTful endpoints for easy integration  
🎨 **Modern UI** - Interactive Streamlit interface  
🔐 **Secure** - Input validation and error handling  

## 📦 Installation

### Requirements
- **Python 3.9+**
- **Windows OS** (tested on Windows 10+)
- **~500MB disk space** for dependencies

### Step 1: Clone and Navigate
```bash
cd c:\laragon\www\Chaton
```

### Step 2: Create Virtual Environment (Optional but Recommended)
```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

All required packages will be installed:
- **Backend**: FastAPI, Uvicorn, Pydantic
- **Frontend**: Streamlit
- **ML/NLP**: Scikit-learn, Pandas, NumPy, BeautifulSoup4
- **Testing**: Pytest, Pytest-asyncio
- **Utilities**: Requests, Python-dotenv, Werkzeug

## 🔧 Configuration

Configuration is managed via `backend/config.py`:

```python
CONFIDENCE_THRESHOLD = 0.5      # Minimum confidence for KB response (default: 50%)
MIN_CONFIDENCE = 0.3            # Minimum acceptable confidence
MAX_CONFIDENCE = 1.0            # Maximum confidence score
LOG_LEVEL = "INFO"              # Logging level (DEBUG, INFO, WARNING, ERROR)
DEBUG = False                   # Debug mode toggle
```

Environment variables can override defaults via `.env` file:
```
CONFIDENCE_THRESHOLD=0.6
LOG_LEVEL=DEBUG
```

## 📂 Project Structure

```
Chaton/
├── backend/                      # FastAPI backend
│   ├── main.py                  # Application entry point
│   ├── config.py                # Configuration settings
│   ├── database.py              # SQLite setup and logging
│   ├── api/                     # API endpoints
│   │   ├── chat_api.py         # Chat endpoint
│   │   ├── health.py           # Health check endpoints
│   ├── ml/                      # Machine learning
│   │   ├── train.py            # Model training
│   │   ├── predict.py          # Intent prediction
│   │   ├── evaluator.py        # Model evaluation
│   │   ├── retrain.py          # Retraining pipeline
│   ├── nlp/                     # NLP processing
│   │   ├── preprocess.py       # Text cleaning
│   │   ├── tokenizer.py        # Tokenization
│   │   ├── lemmatizer.py       # Lemmatization
│   ├── pipeline/                # Data processing
│   │   ├── data_loader.py      # Load training data
│   │   ├── feature_engineering.py  # TF-IDF vectorization
│   │   ├── response_selector.py    # Response selection
│   │   ├── confidence.py       # Confidence checking
│   ├── knowledge_base/          # Knowledge base
│   │   ├── responses.py        # Intent to response mapping
│   │   ├── fallback.json       # Fallback responses
│   ├── models/                  # Trained model artifacts
│   │   ├── intent_model.pkl
│   │   ├── vectorizer.pkl
│   │   ├── label_encoder.pkl
│   └── logs/                    # Logging
│       ├── chat_logs.txt
│       └── low_confidence_queries.json
├── frontend/                     # Streamlit UI
│   ├── app.py                   # Main interface
│   ├── ui_components.py         # Reusable components
├── data/                         # Data files
│   ├── raw/
│   │   └── scraped__data.json
│   ├── processed/
│   │   └── _intents.json
│   └── scraper/
│       ├── scrape_.py      # Web scraper
│       ├── page_parser.py      # HTML parser
│       └── intent_mapper.py    # Intent mapping
├── tests/                        # Test suite
│   ├── test_scraper.py
│   ├── test_nlp.py
│   ├── test_ml.py
│   └── test_api.py
├── requirements.txt             # Python dependencies
├── phase.md                     # Development phases
└── README.md                    # This file
```

## 🚀 Quick Start

### Option 1: Run Everything (Automatic - Windows)
```bash
run.bat
```
This script automatically:
1. Scrapes  website data
2. Trains the ML model
3. Starts backend API (port 8000)
4. Launches Streamlit UI (port 8501)

### Option 2: Manual Startup

**Terminal 1 - Backend API:**
```bash
cd backend
python main.py
```
Or using Uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API will be available at: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health/status`

**Terminal 2 - Frontend UI:**
```bash
cd frontend
streamlit run app.py
```
UI will be available at: `http://localhost:8501`

### Option 3: Prepare Data and Train Model

**Scrape website:**
```bash
python data/scraper/scrape_.py
```

**Train ML model:**
```bash
python backend/ml/train.py
```

## 📊 API Endpoints

### Health Endpoints
- `GET /` - Welcome message
- `GET /health/status` - API status and DB statistics
- `GET /health/stats` - Chatbot performance stats
- `GET /health/config` - Current API configuration

### Chat Endpoints
- `POST /chat/ask` - Main chatbot endpoint
  ```json
  Request: {"message": "What courses do you offer?"}
  Response: {
    "user_query": "What courses do you offer?",
    "intent": "academics",
    "confidence": 0.87,
    "response": "Our academic programs are designed to meet international standards...",
    "source": "knowledge_base"
  }
  ```

- `GET /chat/logs` - Chat history (supports ?limit=50)
- `GET /chat/intents` - Available intents

## 🧪 Testing

Run comprehensive test suite:
```bash
pytest tests/
```

Run specific test file:
```bash
pytest tests/test_nlp.py -v
```

Run with coverage:
```bash
pytest tests/ --cov=backend --cov=data
```

Test coverage includes:
- **Data Scraping** - Web scraping and parsing
- **NLP Pipeline** - Preprocessing, tokenization, lemmatization
- **ML Model** - Training, prediction, confidence scoring
- **API Endpoints** - Request validation, error handling, response format
- **Database** - Chat logging, statistics

## 🔍 Monitoring & Analytics

### Chat Logs Database
SQLite database stores all interactions:
- Chat history with timestamps
- Predicted intents and confidence scores
- Response sources (Knowledge Base vs Fallback)
- Low-confidence queries for analysis

Access via API:
```bash
GET http://localhost:8000/chat/logs
```

### Log Files
- `backend/logs/chat_logs.txt` - Human-readable chat log
- `backend/logs/low_confidence_queries.json` - Queries for improvement

### Statistics
```bash
GET http://localhost:8000/health/stats
```
Returns:
- Total chats processed
- Average confidence score
- Low-confidence query count

## 🎓 Continuous Improvement

### Identify Low-Confidence Queries
```bash
GET http://localhost:8000/chat/logs?limit=100
# Filter responses with confidence < 0.5
```

### Evaluate Model Performance
```bash
python backend/ml/evaluator.py
```
Shows:
- Model accuracy
- Precision/recall per intent
- Confusion matrix

### Retrain Model with New Data
```bash
python backend/ml/retrain.py
```
Updates:
- Intent mappings from knowledge base
- Re-trains model with updated data
- Saves improved model artifacts

## 🛠️ Troubleshooting

### Issue: "Models not loaded" error
**Solution:** Train the model first
```bash
python backend/ml/train.py
```

### Issue: "Backend not reachable" in UI
**Solution:** Ensure backend is running on localhost:8000
```bash
cd backend && python main.py
```

### Issue: Port 8000 already in use
**Solution:** Use different port
```bash
uvicorn main:app --port 8001
```
Update `frontend/app.py` API_BASE_URL accordingly.

### Issue: Dependencies installation fails
**Solution:** Upgrade pip and retry
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 📝 Development Phases

The project follows an 8-phase development roadmap:

1. ✅ **Phase 1** - Data Layer (Scraper & Data Preparation)
2. ✅ **Phase 2** - NLP Pipeline (Preprocessing, Tokenization, Lemmatization)
3. ✅ **Phase 3** - ML Model (Training & Prediction)
4. ✅ **Phase 4** - Knowledge Base & Response Selection
5. ✅ **Phase 5** - API & Backend Infrastructure
6. ✅ **Phase 6** - Frontend UI (Streamlit)
7. ✅ **Phase 7** - Testing, Requirements & Deployment
8. ✅ **Phase 8** - ML Operations (Evaluation & Retraining)

See `phase.md` for detailed implementation status.

## 🤝 Contributing

To extend the chatbot:

1. **Add new intents:** Update `data/processed/_intents.json`
2. **Improve NLP:** Enhance `backend/nlp/` modules
3. **Retrain model:** Run `python backend/ml/retrain.py`
4. **Test changes:** Add tests to `tests/` directory
5. **Monitor performance:** Check `backend/logs/`

## 📄 License

This project is for educational purposes.

## 👨‍💻 Support

For issues or questions:
1. Check troubleshooting section above
2. Review logs in `backend/logs/`
3. Verify all dependencies are installed
4. Ensure Python 3.9+ is being used
