# Development Phases

## Phase 1 - Data Layer (Scraper & Data Preparation)
**Status**: ✅ Completed
**Files**:
- `data/scraper/scrape_sfgc.py` - Scrapes public pages of sfgc.ac.in
- `data/scraper/page_parser.py` - Cleans scraped HTML text
- `data/scraper/intent_mapper.py` - Converts website text into chatbot intents
- `data/raw/scraped_sfgc_data.json` - Raw text scraped from website
- `data/processed/sfgc_intents.json` - Clean, ML-ready training dataset

**Purpose**: Extract and process data from the SFGC website to create a training dataset

---

## Phase 2 - NLP Pipeline
**Status**: ✅ Completed
**Files**:
- `backend/nlp/preprocess.py` - Cleans input text (lowercase, remove symbols)
- `backend/nlp/tokenizer.py` - Splits sentences into words
- `backend/nlp/lemmatizer.py` - Converts words to base form (running → run)

**Purpose**: Process raw text input for ML model consumption

---

## Phase 3 - ML Model (Training & Prediction)
**Status**: ✅ Completed
**Files**:
- `backend/pipeline/data_loader.py` - Loads processed training data
- `backend/pipeline/feature_engineering.py` - Converts text to TF-IDF vectors
- `backend/ml/train.py` - Trains ML intent classification model
- `backend/ml/predict.py` - Predicts intent + confidence score
- `backend/models/intent_model.pkl` - Trained ML model (generated)
- `backend/models/vectorizer.pkl` - TF-IDF vectorizer (generated)

**Purpose**: Build and train intent classification model

---

## Phase 4 - Knowledge Base & Response Selection
**Status**: ✅ Completed
**Files**:
- `backend/knowledge_base/sfgc_intents.json` - Final training dataset (intent + patterns + response)
- `backend/knowledge_base/responses.py` - Maps intent → official answer
- `backend/knowledge_base/fallback.json` - Safe replies when confidence is low
- `backend/pipeline/response_selector.py` - Chooses final response or fallback
- `backend/pipeline/confidence.py` - Checks confidence threshold

**Purpose**: Define knowledge base and select appropriate responses based on confidence

---

## Phase 5 - API & Backend Infrastructure
**Status**: ✅ Completed
**Files**:
- `backend/config.py` - Global configurations (confidence threshold, paths)
- `backend/database.py` - Optional SQLite setup for logs
- `backend/utils/logger.py` - Logging helper
- `backend/utils/helpers.py` - Common utility functions
- `backend/api/health.py` - Simple endpoint to check if backend is running
- `backend/api/chat_api.py` - Receives user question and returns chatbot response
- `backend/main.py` - Entry point of FastAPI server

**Purpose**: Build FastAPI backend with API endpoints and infrastructure

---

## Phase 6 - Frontend UI
**Status**: ✅ Completed
**Files**:
- `frontend/app.py` - Streamlit chatbot UI
- `frontend/ui_components.py` - UI helper components

**Purpose**: Create user interface for chatbot interaction

---

## Phase 7 - Testing, Requirements & Deployment
**Status**: ✅ Completed
**Files**:
- `tests/test_scraper.py` - Tests scraping logic (BeautifulSoup, HTML parsing, intent mapping)
- `tests/test_nlp.py` - Tests NLP preprocessing (text cleaning, tokenization, lemmatization)
- `tests/test_ml.py` - Tests ML predictions (model training, feature engineering, intent prediction)
- `tests/test_api.py` - Tests backend endpoints (health checks, chat endpoint, error handling)
- `requirements.txt` - All Python dependencies (FastAPI, Streamlit, Scikit-learn, etc.)
- `README.md` - Comprehensive project documentation with installation, setup, API reference, troubleshooting
- `run.bat` - Windows batch script to automate full startup (dependencies → scraping → training → backend → UI)

**Implementation Details**:
- **test_scraper.py**: 15+ tests covering web scraping, HTML parsing, and intent mapping
- **test_nlp.py**: 30+ tests for text preprocessing, tokenization (words/sentences/ngrams), lemmatization
- **test_ml.py**: 20+ tests for model training, prediction, feature engineering, data loading
- **test_api.py**: 25+ tests for API endpoints, request validation, error handling, CORS
- **README.md**: Complete guide with features, installation, configuration, quick start, API docs, troubleshooting
- **run.bat**: Intelligent batch script with dependency checking, error handling, parallel service startup

**Purpose**: Ensure code quality, document setup, and enable deployment

---

## Phase 8 - ML Operations (Optional → Completed)
**Status**: ✅ Completed
**Files**:
- `backend/ml/evaluator.py` - Evaluates model accuracy, precision, recall, F1-score and generates reports
- `backend/ml/retrain.py` - Retrains model using new data, augments training set with low-confidence queries
- `backend/logs/chat_logs.txt` - Stores all user–bot conversations with timestamps and metadata
- `backend/logs/low_confidence_queries.json` - Stores unclear questions for model improvement
- `backend/logs/retraining_history.json` - Tracks all retraining events and improvements

**Implementation Details**:
- **evaluator.py**: 
  - Overall metrics: accuracy, precision, recall, F1-score
  - Per-intent metrics with support counts
  - Confusion matrix analysis
  - Classification reports
  - Confidence score distribution analysis
  - Model evaluation reporting (JSON export)

- **retrain.py**:
  - Collect low-confidence queries from database
  - Augment training data with new patterns
  - Retrain model with updated dataset
  - Save improved model artifacts
  - Verify model improvement
  - Track retraining history
  - Full pipeline automation

**Purpose**: Monitor model performance, enable continuous improvement, and support production optimization

---

## Completion Summary

### ✅ Completed Phases (8/8) - 100% Complete
1. **Phase 1** - Data Layer ✅
2. **Phase 2** - NLP Pipeline ✅
3. **Phase 3** - ML Model ✅
4. **Phase 4** - Knowledge Base & Response ✅
5. **Phase 5** - API & Backend Infrastructure ✅
6. **Phase 6** - Frontend UI ✅
7. **Phase 7** - Testing, Requirements & Deployment ✅
8. **Phase 8** - ML Operations (Evaluator & Retrainer) ✅

**Project Status**: 🎉 **FULLY COMPLETE - ALL PHASES IMPLEMENTED**

### 🏗️ Phase 5 Implementation Details
**API Endpoints**:
- `GET /health/status` - Health check
- `GET /health/stats` - Chatbot statistics
- `GET /health/config` - API configuration
- `POST /chat/ask` - Main chatbot endpoint
- `GET /chat/logs` - Chat history
- `GET /chat/intents` - Available intents

**Backend Components**:
- **config.py** - Settings management with Pydantic
- **database.py** - SQLite logging (chat_logs, low_confidence_queries)
- **logger.py** - Rotating file logger
- **helpers.py** - Response formatting, query validation, utilities
- **health.py** - Health check endpoints
- **chat_api.py** - Chat processing pipeline
- **main.py** - FastAPI app with CORS middleware

### 📱 Phase 6 Implementation Details
**Streamlit Features**:
- Real-time chat interface
- Message history with intent/confidence display
- Statistics dashboard (total chats, low confidence queries, avg confidence)
- Quick action buttons (Courses, Admissions, About)
- Backend health status indicator
- Available intents sidebar display
- Response source tracking (Knowledge Base vs Fallback)

**UI Components**:
- Chat message display with role distinction
- Confidence badges with emoji levels
- Intent cards with metrics
- Statistics dashboard
- Error/Success/Info message display
- Clear chat history button

### 📦 Dependencies
All required dependencies have been installed successfully from `requirements.txt`:
- **FastAPI, Uvicorn** (Web Framework)
- **Streamlit** (Frontend)
- **Scikit-learn, Pandas, NumPy** (ML)
- **BeautifulSoup4** (Web Scraping)
- **Pytest** (Testing)
- **Pydantic** (Data validation)

---

## 🚀 Running the Application

### Backend (FastAPI)
```bash
cd backend
python main.py
# Or using uvicorn directly:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The API will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health/status`

### Frontend (Streamlit)
```bash
cd frontend
streamlit run app.py
```
The UI will be available at `http://localhost:8501`

### Running Both Together
Use the `run.bat` script (Windows):
```bash
run.bat
```

---

## Data Flow Diagram
```
scrape_sfgc.py
    ↓
scraped_sfgc_data.json
    ↓
page_parser.py
    ↓
intent_mapper.py
    ↓
sfgc_intents.json (processed)
    ↓
data_loader.py
    ↓
feature_engineering.py (TF-IDF)
    ↓
train.py
    ↓
intent_model.pkl + vectorizer.pkl
    ↓
predict.py → confidence.py
    ↓
response_selector.py
    ↓
chat_api.py
    ↓
app.py (Frontend)
```
