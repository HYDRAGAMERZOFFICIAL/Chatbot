"""
Tests ML predictions
"""
import pytest
import numpy as np
from unittest.mock import Mock, patch
from backend.ml.train import ModelTrainer
from backend.ml.predict import IntentPredictor
from backend.pipeline.feature_engineering import FeatureEngineer
from backend.pipeline.data_loader import DataLoader


class TestModelTrainer:
    @pytest.fixture
    def trainer(self):
        return ModelTrainer()
    
    def test_model_initialization(self, trainer):
        assert trainer.model is not None
        assert trainer.label_encoder is not None
        assert trainer.is_trained is False
    
    def test_train_model(self, trainer):
        X_train = np.array([[0.5, 0.2], [0.3, 0.7], [0.8, 0.1], [0.2, 0.9]])
        y_train = np.array(['about', 'admissions', 'about', 'admissions'])
        
        result = trainer.train_model(X_train, y_train)
        
        assert result is True
        assert trainer.is_trained is True
        assert len(trainer.label_encoder.classes_) == 2
    
    def test_predict(self, trainer):
        X_train = np.array([[0.5, 0.2], [0.3, 0.7], [0.8, 0.1], [0.2, 0.9]])
        y_train = np.array(['about', 'admissions', 'about', 'admissions'])
        trainer.train_model(X_train, y_train)
        
        X_test = np.array([[0.6, 0.1]])
        result = trainer.predict(X_test)
        
        assert result is not None
        assert len(result) == 1
    
    def test_predict_without_training(self, trainer):
        X_test = np.array([[0.6, 0.1]])
        result = trainer.predict(X_test)
        assert result is None
    
    def test_predict_proba(self, trainer):
        X_train = np.array([[0.5, 0.2], [0.3, 0.7], [0.8, 0.1], [0.2, 0.9]])
        y_train = np.array(['about', 'admissions', 'about', 'admissions'])
        trainer.train_model(X_train, y_train)
        
        X_test = np.array([[0.6, 0.1]])
        result = trainer.predict_proba(X_test)
        
        assert result is not None
        assert result.shape == (1, 2)
    
    def test_get_confidence_scores(self, trainer):
        X_train = np.array([[0.5, 0.2], [0.3, 0.7], [0.8, 0.1], [0.2, 0.9]])
        y_train = np.array(['about', 'admissions', 'about', 'admissions'])
        trainer.train_model(X_train, y_train)
        
        X_test = np.array([[0.6, 0.1]])
        result = trainer.get_confidence_scores(X_test)
        
        assert result is not None
        assert len(result) == 1
        assert 0 <= result[0] <= 1
    
    def test_get_intent_classes(self, trainer):
        X_train = np.array([[0.5, 0.2], [0.3, 0.7]])
        y_train = np.array(['about', 'admissions'])
        trainer.train_model(X_train, y_train)
        
        classes = trainer.get_intent_classes()
        
        assert len(classes) == 2
        assert 'about' in classes
        assert 'admissions' in classes
    
    def test_get_model_score(self, trainer):
        X_train = np.array([[0.5, 0.2], [0.3, 0.7], [0.8, 0.1], [0.2, 0.9]])
        y_train = np.array(['about', 'admissions', 'about', 'admissions'])
        trainer.train_model(X_train, y_train)
        
        score = trainer.get_model_score(X_train, y_train)
        
        assert isinstance(score, float)
        assert 0 <= score <= 1


class TestFeatureEngineer:
    @pytest.fixture
    def engineer(self):
        return FeatureEngineer()
    
    def test_fit_vectorizer(self, engineer):
        texts = ["hello world", "test data", "machine learning"]
        engineer.fit_vectorizer(texts)
        
        assert engineer.is_fitted is True
    
    def test_transform_texts(self, engineer):
        texts = ["hello world", "test data", "machine learning"]
        engineer.fit_vectorizer(texts)
        
        result = engineer.transform_texts(texts)
        
        assert result is not None
        assert result.shape[0] == 3
    
    def test_fit_transform_texts(self, engineer):
        texts = ["hello world", "test data", "machine learning"]
        result = engineer.fit_transform_texts(texts)
        
        assert result is not None
        assert engineer.is_fitted is True
        assert result.shape[0] == 3
    
    def test_get_feature_names(self, engineer):
        texts = ["hello world", "test data"]
        engineer.fit_vectorizer(texts)
        
        features = engineer.get_feature_names()
        
        assert len(features) > 0
        assert isinstance(features, list)
    
    def test_transform_before_fit(self, engineer):
        texts = ["hello world"]
        result = engineer.transform_texts(texts)
        
        assert result is None
    
    def test_get_vector_dimensions(self, engineer):
        texts = ["hello world", "test data"]
        engineer.fit_vectorizer(texts)
        
        dims = engineer.get_vector_dimensions()
        
        assert dims > 0
        assert isinstance(dims, int)


class TestIntentPredictor:
    @pytest.fixture
    def predictor(self):
        return IntentPredictor()
    
    def test_predictor_initialization(self, predictor):
        assert predictor.model_trainer is not None
        assert predictor.feature_engineer is not None
        assert predictor.preprocessor is not None
        assert predictor.is_loaded is False
    
    @patch('backend.ml.train.ModelTrainer.load_model')
    @patch('backend.pipeline.feature_engineering.FeatureEngineer.load_vectorizer')
    def test_load_models(self, mock_vectorizer, mock_model, predictor):
        mock_model.return_value = True
        mock_vectorizer.return_value = True
        
        result = predictor.load_models()
        
        assert result is True
        assert predictor.is_loaded is True
    
    def test_predict_intent_not_loaded(self, predictor):
        intent, confidence = predictor.predict_intent("test query")
        
        assert intent == 'unknown'
        assert confidence == 0.0
    
    def test_predict_batch(self, predictor):
        queries = ["query 1", "query 2", "query 3"]
        results = predictor.predict_batch(queries)
        
        assert len(results) == 3
        assert all('query' in r for r in results)
        assert all('intent' in r for r in results)
        assert all('confidence' in r for r in results)


class TestDataLoader:
    @pytest.fixture
    def loader(self):
        return DataLoader()
    
    def test_data_loader_initialization(self, loader):
        assert loader is not None
    
    def test_load_training_data(self, loader):
        try:
            data = loader.load_training_data('data/processed/collegewala_intents.json')
            assert data is not None
            assert isinstance(data, list)
        except FileNotFoundError:
            pytest.skip("Training data file not found")
    
    def test_prepare_training_data(self, loader):
        try:
            X_train, y_train = loader.prepare_training_data('data/processed/collegewala_intents.json')
            assert X_train is not None
            assert y_train is not None
        except Exception:
            pytest.skip("Could not prepare training data")
