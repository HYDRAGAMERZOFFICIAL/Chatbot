"""
Evaluates accuracy, precision, recall and generates performance reports
"""
import logging
import json
import numpy as np
from typing import Dict, Tuple
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score
)
from pathlib import Path

from backend.ml.train import ModelTrainer
from backend.pipeline.feature_engineering import FeatureEngineer
from backend.pipeline.data_loader import DataLoader
from backend.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelEvaluator:
    def __init__(self):
        self.trainer = ModelTrainer()
        self.feature_engineer = FeatureEngineer()
        self.data_loader = DataLoader()
        self.metrics = {}
    
    def evaluate_model(self, X_test, y_test) -> Dict:
        """Evaluate model on test set"""
        try:
            if not self.trainer.is_trained:
                logger.error("Model not trained. Call train_model first.")
                return {}
            
            predictions = self.trainer.predict(X_test)
            if predictions is None:
                return {}
            
            accuracy = accuracy_score(y_test, predictions)
            precision = precision_score(y_test, predictions, average='weighted', zero_division=0)
            recall = recall_score(y_test, predictions, average='weighted', zero_division=0)
            f1 = f1_score(y_test, predictions, average='weighted', zero_division=0)
            
            self.metrics = {
                'accuracy': float(accuracy),
                'precision': float(precision),
                'recall': float(recall),
                'f1_score': float(f1),
                'test_samples': len(y_test)
            }
            
            logger.info(f"Model Evaluation Results:")
            logger.info(f"  Accuracy:  {accuracy:.4f}")
            logger.info(f"  Precision: {precision:.4f}")
            logger.info(f"  Recall:    {recall:.4f}")
            logger.info(f"  F1-Score:  {f1:.4f}")
            
            return self.metrics
        except Exception as e:
            logger.error(f"Error evaluating model: {e}")
            return {}
    
    def get_confusion_matrix(self, X_test, y_test) -> np.ndarray:
        """Get confusion matrix"""
        try:
            predictions = self.trainer.predict(X_test)
            if predictions is None:
                return None
            
            cm = confusion_matrix(y_test, predictions, labels=self.trainer.label_encoder.classes_)
            logger.info(f"Confusion Matrix shape: {cm.shape}")
            return cm
        except Exception as e:
            logger.error(f"Error computing confusion matrix: {e}")
            return None
    
    def get_classification_report(self, X_test, y_test) -> str:
        """Get detailed classification report"""
        try:
            predictions = self.trainer.predict(X_test)
            if predictions is None:
                return ""
            
            report = classification_report(
                y_test, predictions,
                labels=self.trainer.label_encoder.classes_,
                zero_division=0
            )
            logger.info(f"\nClassification Report:\n{report}")
            return report
        except Exception as e:
            logger.error(f"Error generating classification report: {e}")
            return ""
    
    def get_per_intent_metrics(self, X_test, y_test) -> Dict:
        """Get metrics for each intent"""
        try:
            predictions = self.trainer.predict(X_test)
            if predictions is None:
                return {}
            
            intent_metrics = {}
            for intent in self.trainer.label_encoder.classes_:
                intent_mask = y_test == intent
                pred_mask = predictions == intent
                
                tp = np.sum(intent_mask & pred_mask)
                fp = np.sum(~intent_mask & pred_mask)
                fn = np.sum(intent_mask & ~pred_mask)
                
                precision = tp / (tp + fp) if (tp + fp) > 0 else 0
                recall = tp / (tp + fn) if (tp + fn) > 0 else 0
                f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
                
                intent_metrics[intent] = {
                    'precision': float(precision),
                    'recall': float(recall),
                    'f1': float(f1),
                    'support': int(np.sum(intent_mask))
                }
            
            logger.info("Per-Intent Metrics:")
            for intent, metrics in intent_metrics.items():
                logger.info(f"  {intent}: P={metrics['precision']:.3f}, R={metrics['recall']:.3f}, F1={metrics['f1']:.3f}, S={metrics['support']}")
            
            return intent_metrics
        except Exception as e:
            logger.error(f"Error computing per-intent metrics: {e}")
            return {}
    
    def get_model_confidence_distribution(self, X_test) -> Dict:
        """Analyze confidence score distribution"""
        try:
            confidences = self.trainer.get_confidence_scores(X_test)
            if confidences is None:
                return {}
            
            distribution = {
                'min_confidence': float(np.min(confidences)),
                'max_confidence': float(np.max(confidences)),
                'mean_confidence': float(np.mean(confidences)),
                'median_confidence': float(np.median(confidences)),
                'std_confidence': float(np.std(confidences)),
                'high_confidence_count': int(np.sum(confidences > 0.8)),
                'medium_confidence_count': int(np.sum((confidences > 0.5) & (confidences <= 0.8))),
                'low_confidence_count': int(np.sum(confidences <= 0.5))
            }
            
            logger.info("Confidence Distribution:")
            logger.info(f"  Mean:   {distribution['mean_confidence']:.4f}")
            logger.info(f"  Median: {distribution['median_confidence']:.4f}")
            logger.info(f"  Std:    {distribution['std_confidence']:.4f}")
            logger.info(f"  High (>0.8):     {distribution['high_confidence_count']}")
            logger.info(f"  Medium (0.5-0.8): {distribution['medium_confidence_count']}")
            logger.info(f"  Low (<=0.5):     {distribution['low_confidence_count']}")
            
            return distribution
        except Exception as e:
            logger.error(f"Error analyzing confidence distribution: {e}")
            return {}
    
    def save_evaluation_report(self, report_path: str) -> bool:
        """Save evaluation report to JSON file"""
        try:
            report = {
                'model_metrics': self.metrics,
                'timestamp': str(Path(settings.INTENT_MODEL_FILE).stat().st_mtime)
            }
            
            report_dir = Path(report_path).parent
            report_dir.mkdir(parents=True, exist_ok=True)
            
            with open(report_path, 'w') as f:
                json.dump(report, f, indent=2)
            
            logger.info(f"Evaluation report saved to {report_path}")
            return True
        except Exception as e:
            logger.error(f"Error saving evaluation report: {e}")
            return False
    
    def load_and_evaluate_full(self, model_path: str = None, vectorizer_path: str = None) -> Dict:
        """Load model and evaluate on full training data"""
        try:
            model_path = model_path or settings.INTENT_MODEL_FILE
            vectorizer_path = vectorizer_path or settings.VECTORIZER_FILE
            
            if not self.trainer.load_model(model_path, settings.LABEL_ENCODER_FILE):
                logger.error("Failed to load model")
                return {}
            
            if not self.feature_engineer.load_vectorizer(vectorizer_path):
                logger.error("Failed to load vectorizer")
                return {}
            
            X_train, y_train = self.data_loader.prepare_training_data()
            
            if X_train is None or y_train is None:
                logger.error("Failed to load training data")
                return {}
            
            metrics = self.evaluate_model(X_train, y_train)
            per_intent = self.get_per_intent_metrics(X_train, y_train)
            confidence_dist = self.get_model_confidence_distribution(X_train)
            
            return {
                'overall_metrics': metrics,
                'per_intent_metrics': per_intent,
                'confidence_distribution': confidence_dist
            }
        except Exception as e:
            logger.error(f"Error in full evaluation: {e}")
            return {}


def main():
    """Main evaluation function"""
    logger.info("Starting Model Evaluation...")
    
    evaluator = ModelEvaluator()
    
    results = evaluator.load_and_evaluate_full()
    
    if results:
        evaluator.save_evaluation_report(
            'backend/logs/model_evaluation_report.json'
        )
        logger.info("Evaluation complete!")
    else:
        logger.error("Evaluation failed!")


if __name__ == "__main__":
    main()
