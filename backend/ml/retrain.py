"""
Retrains model using new data and improves model accuracy
"""
import logging
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Tuple

from backend.ml.train import ModelTrainer
from backend.pipeline.feature_engineering import FeatureEngineer
from backend.pipeline.data_loader import DataLoader
from backend.knowledge_base.responses import ResponseGenerator
from backend.database import Database
from backend.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelRetrainer:
    def __init__(self):
        self.trainer = ModelTrainer()
        self.feature_engineer = FeatureEngineer()
        self.data_loader = DataLoader()
        self.response_gen = ResponseGenerator()
        self.db = Database()
        self.retraining_history = []
    
    def collect_low_confidence_queries(self) -> Dict:
        """Collect low-confidence queries from database for analysis"""
        try:
            conn = __import__('sqlite3').connect(settings.DATABASE_URL.replace('sqlite:///', ''))
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT user_query, predicted_intent, confidence, all_scores
                FROM low_confidence_queries
                WHERE confidence < ?
                ORDER BY confidence ASC
            ''', (settings.CONFIDENCE_THRESHOLD,))
            
            results = cursor.fetchall()
            conn.close()
            
            low_conf_queries = {
                'total_low_confidence': len(results),
                'queries': [
                    {
                        'query': row[0],
                        'predicted_intent': row[1],
                        'confidence': row[2],
                        'scores': json.loads(row[3]) if row[3] else {}
                    }
                    for row in results
                ]
            }
            
            logger.info(f"Collected {low_conf_queries['total_low_confidence']} low-confidence queries")
            return low_conf_queries
        except Exception as e:
            logger.error(f"Error collecting low-confidence queries: {e}")
            return {'total_low_confidence': 0, 'queries': []}
    
    def augment_training_data(self) -> bool:
        """Augment training data with low-confidence queries"""
        try:
            current_intents = self.data_loader.load_training_data()
            if not current_intents:
                logger.error("Could not load current training data")
                return False
            
            low_conf_data = self.collect_low_confidence_queries()
            
            if low_conf_data['total_low_confidence'] == 0:
                logger.info("No low-confidence queries to augment training data")
                return True
            
            augmented_count = 0
            for query_info in low_conf_data['queries']:
                query = query_info['query']
                predicted_intent = query_info['predicted_intent']
                
                for intent_data in current_intents:
                    if intent_data['intent'] == predicted_intent:
                        if query not in intent_data['patterns']:
                            intent_data['patterns'].append(query)
                            augmented_count += 1
                        break
            
            with open(settings.INTENTS_FILE, 'w', encoding='utf-8') as f:
                json.dump(current_intents, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Augmented training data with {augmented_count} new patterns")
            return True
        except Exception as e:
            logger.error(f"Error augmenting training data: {e}")
            return False
    
    def retrain_model(self, use_augmented_data: bool = True) -> bool:
        """Retrain the model with updated data"""
        try:
            logger.info("Starting model retraining...")
            
            if use_augmented_data:
                logger.info("Augmenting training data with low-confidence queries...")
                if not self.augment_training_data():
                    logger.warning("Data augmentation failed, continuing with existing data")
            
            logger.info("Loading training data...")
            X_train, y_train = self.data_loader.prepare_training_data()
            
            if X_train is None or y_train is None:
                logger.error("Failed to load training data")
                return False
            
            logger.info(f"Training on {len(y_train)} samples with {len(set(y_train))} intents")
            
            if not self.trainer.train_model(X_train, y_train):
                logger.error("Model training failed")
                return False
            
            logger.info("Saving trained model...")
            if not self.trainer.save_model(
                settings.INTENT_MODEL_FILE,
                settings.LABEL_ENCODER_FILE
            ):
                logger.error("Failed to save model")
                return False
            
            if not self.feature_engineer.save_vectorizer(settings.VECTORIZER_FILE):
                logger.error("Failed to save vectorizer")
                return False
            
            logger.info("Model retraining completed successfully!")
            self._log_retraining_event(True, len(y_train))
            return True
        except Exception as e:
            logger.error(f"Error during model retraining: {e}")
            self._log_retraining_event(False, 0)
            return False
    
    def _log_retraining_event(self, success: bool, samples_count: int) -> bool:
        """Log retraining event to file"""
        try:
            log_file = Path(settings.LOGS_DIR) / "retraining_history.json"
            
            event = {
                'timestamp': datetime.now().isoformat(),
                'success': success,
                'samples_count': samples_count,
                'model_path': str(settings.INTENT_MODEL_FILE),
                'vectorizer_path': str(settings.VECTORIZER_FILE)
            }
            
            history = []
            if log_file.exists():
                with open(log_file, 'r') as f:
                    history = json.load(f)
            
            history.append(event)
            
            with open(log_file, 'w') as f:
                json.dump(history, f, indent=2)
            
            logger.info(f"Retraining event logged: {event}")
            return True
        except Exception as e:
            logger.error(f"Error logging retraining event: {e}")
            return False
    
    def verify_model_improvement(self, old_model_path: str = None) -> Dict:
        """Compare new model with old model"""
        try:
            X_test, y_test = self.data_loader.prepare_training_data()
            
            if X_test is None or y_test is None:
                logger.error("Could not load test data")
                return {}
            
            from backend.ml.train import ModelTrainer as MT
            from sklearn.metrics import accuracy_score
            
            new_trainer = ModelTrainer()
            new_trainer.load_model(
                settings.INTENT_MODEL_FILE,
                settings.LABEL_ENCODER_FILE
            )
            
            new_predictions = new_trainer.predict(X_test)
            if new_predictions is None:
                return {}
            
            new_accuracy = accuracy_score(y_test, new_predictions)
            
            comparison = {
                'new_model_accuracy': float(new_accuracy),
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"New model accuracy: {new_accuracy:.4f}")
            return comparison
        except Exception as e:
            logger.error(f"Error verifying model improvement: {e}")
            return {}
    
    def get_retraining_status(self) -> Dict:
        """Get current retraining status and history"""
        try:
            log_file = Path(settings.LOGS_DIR) / "retraining_history.json"
            
            if not log_file.exists():
                return {
                    'retraining_count': 0,
                    'last_retraining': None,
                    'successful_retrainings': 0,
                    'failed_retrainings': 0
                }
            
            with open(log_file, 'r') as f:
                history = json.load(f)
            
            successful = sum(1 for event in history if event.get('success', False))
            failed = len(history) - successful
            
            return {
                'retraining_count': len(history),
                'last_retraining': history[-1]['timestamp'] if history else None,
                'successful_retrainings': successful,
                'failed_retrainings': failed,
                'recent_events': history[-5:]
            }
        except Exception as e:
            logger.error(f"Error getting retraining status: {e}")
            return {}
    
    def full_retrain_pipeline(self) -> bool:
        """Execute complete retraining pipeline"""
        try:
            logger.info("=" * 50)
            logger.info("Starting Full Retraining Pipeline")
            logger.info("=" * 50)
            
            logger.info("\n[1/4] Collecting low-confidence queries...")
            low_conf_data = self.collect_low_confidence_queries()
            
            logger.info(f"\n[2/4] Retraining model with augmented data...")
            if not self.retrain_model(use_augmented_data=True):
                logger.error("Retraining failed!")
                return False
            
            logger.info(f"\n[3/4] Verifying model improvement...")
            improvement = self.verify_model_improvement()
            
            logger.info(f"\n[4/4] Getting retraining status...")
            status = self.get_retraining_status()
            
            logger.info("\n" + "=" * 50)
            logger.info("Retraining Pipeline Complete!")
            logger.info("=" * 50)
            logger.info(f"Retraining Count: {status['retraining_count']}")
            logger.info(f"Successful: {status['successful_retrainings']}")
            logger.info(f"Failed: {status['failed_retrainings']}")
            
            return True
        except Exception as e:
            logger.error(f"Error in full retraining pipeline: {e}")
            return False


def main():
    """Main retraining function"""
    retrainer = ModelRetrainer()
    
    success = retrainer.full_retrain_pipeline()
    
    if success:
        logger.info("Model retraining completed successfully!")
        exit(0)
    else:
        logger.error("Model retraining failed!")
        exit(1)


if __name__ == "__main__":
    main()
