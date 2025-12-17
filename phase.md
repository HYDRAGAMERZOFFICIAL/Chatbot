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
**Status**: Pending
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
**Status**: Pending
**Files**:
- `frontend/app.py` - Streamlit chatbot UI
- `frontend/ui_components.py` - UI helper components

**Purpose**: Create user interface for chatbot interaction

---

## Phase 7 - Testing, Requirements & Deployment
**Status**: Pending
**Files**:
- `tests/test_scraper.py` - Tests scraping logic
- `tests/test_nlp.py` - Tests NLP preprocessing
- `tests/test_ml.py` - Tests ML predictions
- `tests/test_api.py` - Tests backend endpoints
- `requirements.txt` - All Python dependencies
- `README.md` - Project overview, setup steps, run instructions
- `run.bat` - Windows batch file to run scraping → training → backend → UI

**Purpose**: Ensure code quality, document setup, and enable deployment

---

## Phase 8 - ML Operations (Optional)
**Status**: Pending
**Files**:
- `backend/ml/evaluator.py` - Evaluates accuracy, precision
- `backend/ml/retrain.py` - Retrains model using new data
- `backend/logs/chat_logs.txt` - Stores all user–bot conversations
- `backend/logs/low_confidence_queries.json` - Stores unclear questions for learning

**Purpose**: Monitor model performance and enable continuous improvement

---

## Completion Summary

### ✅ Completed Phases (4/8)
1. **Phase 1** - Data Layer ✅
2. **Phase 2** - NLP Pipeline ✅
3. **Phase 3** - ML Model ✅
4. **Phase 4** - Knowledge Base & Response ✅

### ⏳ Pending Phases (4/8)
5. **Phase 5** - API & Backend Infrastructure
6. **Phase 6** - Frontend UI
7. **Phase 7** - Testing, Requirements & Deployment
8. **Phase 8** - ML Operations (Optional)

### 📦 Dependencies
All required dependencies have been installed successfully from `requirements.txt`:
- FastAPI, Uvicorn (Web Framework)
- Streamlit (Frontend)
- Scikit-learn, Pandas, NumPy (ML)
- BeautifulSoup4 (Web Scraping)
- Pytest (Testing)

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
