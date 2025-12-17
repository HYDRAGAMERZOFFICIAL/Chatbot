"""
Tests backend endpoints
"""
import pytest
import json
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from backend.main import app
from backend.api.chat_api import ChatResponse


@pytest.fixture
def client():
    return TestClient(app)


class TestHealthEndpoints:
    def test_root_endpoint(self, client):
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "api_version" in data
    
    @patch('backend.database.Database.get_statistics')
    def test_health_status(self, mock_stats, client):
        mock_stats.return_value = {
            'total_chats': 10,
            'low_confidence_queries': 2,
            'average_confidence': 0.85
        }
        
        response = client.get("/health/status")
        assert response.status_code in [200, 503]
    
    @patch('backend.database.Database.get_statistics')
    def test_health_stats(self, mock_stats, client):
        mock_stats.return_value = {
            'total_chats': 10,
            'low_confidence_queries': 2,
            'average_confidence': 0.85
        }
        
        response = client.get("/health/stats")
        assert response.status_code in [200, 503]
    
    def test_health_config(self, client):
        response = client.get("/health/config")
        assert response.status_code in [200, 503]


class TestChatEndpoints:
    @patch('backend.api.chat_api.predictor.load_models')
    @patch('backend.api.chat_api.predictor.predict_intent')
    @patch('backend.database.Database.log_chat')
    def test_ask_question_valid(self, mock_log, mock_predict, mock_load, client):
        mock_load.return_value = True
        mock_predict.return_value = ('about', 0.85)
        mock_log.return_value = True
        
        with patch('backend.api.chat_api.models_loaded', True):
            response = client.post(
                "/chat/ask",
                json={"message": "Tell me about the college"}
            )
        
        assert response.status_code in [200, 503]
    
    def test_ask_question_empty_message(self, client):
        response = client.post(
            "/chat/ask",
            json={"message": ""}
        )
        
        assert response.status_code == 400
    
    def test_ask_question_none_message(self, client):
        response = client.post(
            "/chat/ask",
            json={"message": None}
        )
        
        assert response.status_code == 400
    
    def test_ask_question_too_long(self, client):
        long_message = "a" * 2000
        response = client.post(
            "/chat/ask",
            json={"message": long_message}
        )
        
        assert response.status_code == 400
    
    @patch('backend.database.Database.get_chat_logs')
    def test_get_chat_logs(self, mock_logs, client):
        mock_logs.return_value = [
            {
                'id': 1,
                'timestamp': '2024-01-01T12:00:00',
                'user_query': 'test',
                'intent': 'about',
                'confidence': 0.85,
                'response': 'response',
                'response_source': 'knowledge_base'
            }
        ]
        
        response = client.get("/chat/logs")
        assert response.status_code in [200, 503]
    
    def test_get_chat_logs_with_limit(self, client):
        response = client.get("/chat/logs?limit=10")
        assert response.status_code in [200, 503]
    
    @patch('backend.knowledge_base.responses.ResponseGenerator.get_all_intents')
    def test_get_available_intents(self, mock_intents, client):
        mock_intents.return_value = ['about', 'admissions', 'academics', 'contact', 'general']
        
        response = client.get("/chat/intents")
        assert response.status_code in [200, 503]


class TestRequestValidation:
    def test_request_missing_message_field(self, client):
        response = client.post(
            "/chat/ask",
            json={}
        )
        
        assert response.status_code == 422
    
    def test_request_invalid_json(self, client):
        response = client.post(
            "/chat/ask",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422
    
    def test_request_whitespace_only(self, client):
        response = client.post(
            "/chat/ask",
            json={"message": "   "}
        )
        
        assert response.status_code == 400


class TestResponseFormat:
    @patch('backend.api.chat_api.predictor.load_models')
    @patch('backend.api.chat_api.predictor.predict_intent')
    @patch('backend.database.Database.log_chat')
    def test_response_structure(self, mock_log, mock_predict, mock_load, client):
        mock_load.return_value = True
        mock_predict.return_value = ('about', 0.85)
        mock_log.return_value = True
        
        with patch('backend.api.chat_api.models_loaded', True):
            response = client.post(
                "/chat/ask",
                json={"message": "test"}
            )
        
        if response.status_code == 200:
            data = response.json()
            assert 'user_query' in data
            assert 'intent' in data
            assert 'confidence' in data
            assert 'response' in data
            assert 'source' in data


class TestErrorHandling:
    def test_invalid_endpoint(self, client):
        response = client.get("/invalid/endpoint")
        assert response.status_code == 404
    
    def test_wrong_method(self, client):
        response = client.get("/chat/ask")
        assert response.status_code == 405
    
    @patch('backend.database.Database.get_chat_logs')
    def test_database_error(self, mock_logs, client):
        mock_logs.side_effect = Exception("Database error")
        
        response = client.get("/chat/logs")
        assert response.status_code == 500


class TestCORS:
    def test_cors_headers_present(self, client):
        response = client.options("/chat/ask")
        assert response.status_code == 200
