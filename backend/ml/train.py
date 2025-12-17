"""
Trains ML intent classification model
"""
import pickle
import logging
from typing import List, Tuple
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import LabelEncoder
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelTrainer:
    def __init__(self):
        self.model = MultinomialNB()
        self.label_encoder = LabelEncoder()
        self.is_trained = False

    def train_model(self, X_train, y_train) -> bool:
        """Train the ML model"""
        try:
            encoded_labels = self.label_encoder.fit_transform(y_train)
            self.model.fit(X_train, encoded_labels)
            self.is_trained = True
            logger.info(f"Model trained with {len(self.label_encoder.classes_)} intent classes")
            logger.info(f"Classes: {list(self.label_encoder.classes_)}")
            return True
        except Exception as e:
            logger.error(f"Error training model: {e}")
            return False

    def predict(self, X_test):
        """Make predictions"""
        if not self.is_trained:
            logger.warning("Model not trained yet. Call train_model first.")
            return None

        try:
            encoded_predictions = self.model.predict(X_test)
            predictions = self.label_encoder.inverse_transform(encoded_predictions)
            return predictions
        except Exception as e:
            logger.error(f"Error making predictions: {e}")
            return None

    def predict_proba(self, X_test):
        """Get prediction probabilities"""
        if not self.is_trained:
            logger.warning("Model not trained yet.")
            return None

        try:
            probabilities = self.model.predict_proba(X_test)
            return probabilities
        except Exception as e:
            logger.error(f"Error getting probabilities: {e}")
            return None

    def get_confidence_scores(self, X_test):
        """Get confidence scores (max probability)"""
        try:
            probabilities = self.predict_proba(X_test)
            if probabilities is not None:
                confidence_scores = probabilities.max(axis=1)
                return confidence_scores
            return None
        except Exception as e:
            logger.error(f"Error getting confidence scores: {e}")
            return None

    def get_intent_classes(self) -> List[str]:
        """Get list of intent classes"""
        if not self.is_trained:
            return []

        return list(self.label_encoder.classes_)

    def save_model(self, model_path: str, label_encoder_path: str) -> bool:
        """Save model and label encoder"""
        try:
            Path(model_path).parent.mkdir(parents=True, exist_ok=True)
            Path(label_encoder_path).parent.mkdir(parents=True, exist_ok=True)

            with open(model_path, 'wb') as f:
                pickle.dump(self.model, f)

            with open(label_encoder_path, 'wb') as f:
                pickle.dump(self.label_encoder, f)

            logger.info(f"Model saved to {model_path}")
            logger.info(f"Label encoder saved to {label_encoder_path}")
            return True
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            return False

    def load_model(self, model_path: str, label_encoder_path: str) -> bool:
        """Load model and label encoder"""
        try:
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)

            with open(label_encoder_path, 'rb') as f:
                self.label_encoder = pickle.load(f)

            self.is_trained = True
            logger.info(f"Model loaded from {model_path}")
            logger.info(f"Label encoder loaded from {label_encoder_path}")
            return True
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False

    def get_model_score(self, X_test, y_test) -> float:
        """Get model accuracy score"""
        if not self.is_trained:
            return 0.0

        try:
            encoded_labels = self.label_encoder.transform(y_test)
            score = self.model.score(X_test, encoded_labels)
            return score
        except Exception as e:
            logger.error(f"Error calculating score: {e}")
            return 0.0
