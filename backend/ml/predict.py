"""
Predicts intent + confidence score
"""
import logging
from typing import Tuple, Dict
from backend.ml.train import ModelTrainer
from backend.pipeline.feature_engineering import FeatureEngineer
from backend.nlp.preprocess import TextPreprocessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class IntentPredictor:
    def __init__(self, model_path: str = 'backend/models/intent_model.pkl',
                 vectorizer_path: str = 'backend/models/vectorizer.pkl',
                 label_encoder_path: str = 'backend/models/label_encoder.pkl'):
        self.model_trainer = ModelTrainer()
        self.feature_engineer = FeatureEngineer()
        self.preprocessor = TextPreprocessor()

        self.model_path = model_path
        self.vectorizer_path = vectorizer_path
        self.label_encoder_path = label_encoder_path

        self.is_loaded = False

    def load_models(self) -> bool:
        """Load trained model and vectorizer"""
        try:
            model_loaded = self.model_trainer.load_model(self.model_path, self.label_encoder_path)
            vectorizer_loaded = self.feature_engineer.load_vectorizer(self.vectorizer_path)

            if model_loaded and vectorizer_loaded:
                self.is_loaded = True
                logger.info("Models loaded successfully")
                return True

            return False
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            return False

    def predict_intent(self, user_query: str) -> Tuple[str, float]:
        """Predict intent and confidence for user query"""
        if not self.is_loaded:
            logger.warning("Models not loaded. Call load_models first.")
            return 'unknown', 0.0

        try:
            cleaned_query = self.preprocessor.clean_text(user_query)
            vectors = self.feature_engineer.transform_texts([cleaned_query])

            if vectors is None:
                return 'unknown', 0.0

            predictions = self.model_trainer.predict(vectors)
            confidences = self.model_trainer.get_confidence_scores(vectors)

            if predictions is None or confidences is None:
                return 'unknown', 0.0

            intent = predictions[0]
            confidence = float(confidences[0])

            logger.info(f"Query: '{user_query}' -> Intent: {intent}, Confidence: {confidence:.4f}")

            return intent, confidence
        except Exception as e:
            logger.error(f"Error predicting intent: {e}")
            return 'unknown', 0.0

    def predict_batch(self, queries: list) -> list:
        """Predict intents for multiple queries"""
        results = []
        for query in queries:
            intent, confidence = self.predict_intent(query)
            results.append({
                'query': query,
                'intent': intent,
                'confidence': confidence
            })

        return results

    def get_intent_details(self, user_query: str) -> Dict:
        """Get detailed prediction information"""
        try:
            cleaned_query = self.preprocessor.clean_text(user_query)
            vectors = self.feature_engineer.transform_texts([cleaned_query])

            predictions = self.model_trainer.predict(vectors)
            probabilities = self.model_trainer.predict_proba(vectors)
            classes = self.model_trainer.get_intent_classes()

            intent_scores = {}
            if probabilities is not None:
                for idx, class_name in enumerate(classes):
                    intent_scores[class_name] = float(probabilities[0][idx])

            return {
                'query': user_query,
                'cleaned_query': cleaned_query,
                'predicted_intent': predictions[0] if predictions is not None else 'unknown',
                'all_scores': intent_scores,
                'top_intent_score': max(intent_scores.values()) if intent_scores else 0.0
            }
        except Exception as e:
            logger.error(f"Error getting intent details: {e}")
            return None
