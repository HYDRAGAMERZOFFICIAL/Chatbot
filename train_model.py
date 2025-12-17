"""
Main training script - Trains the ML model for the chatbot
Run this script to train/retrain the model with latest data
"""
import sys
import logging
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Main training function"""
    try:
        logger.info("=" * 60)
        logger.info("Collegewala Chatbot - Model Training Pipeline")
        logger.info("=" * 60)
        
        logger.info("\n[Step 1/4] Importing dependencies...")
        from backend.pipeline.data_loader import DataLoader
        from backend.pipeline.feature_engineering import FeatureEngineer
        from backend.ml.train import ModelTrainer
        from backend.config import settings
        
        logger.info("✓ Dependencies imported successfully")
        
        logger.info("\n[Step 2/4] Loading training data...")
        data_loader = DataLoader('backend/knowledge_base/collegewala_intents.json')
        patterns, labels = data_loader.prepare_training_data()
        
        if not patterns or not labels:
            logger.error("❌ Failed to load training data")
            logger.error(f"Patterns: {len(patterns) if patterns else 0}")
            logger.error(f"Labels: {len(labels) if labels else 0}")
            return False
        
        logger.info(f"✓ Loaded {len(patterns)} training samples")
        logger.info(f"✓ Found {len(set(labels))} unique intents: {sorted(set(labels))}")
        
        logger.info("\n[Step 3/4] Feature Engineering (TF-IDF Vectorization)...")
        feature_engineer = FeatureEngineer()
        X_train = feature_engineer.fit_transform_texts(patterns)
        
        if X_train is None:
            logger.error("❌ Feature engineering failed")
            return False
        
        logger.info(f"✓ Created feature vectors with shape: {X_train.shape}")
        
        logger.info("\n[Step 4/4] Training ML Model (Multinomial Naive Bayes)...")
        trainer = ModelTrainer()
        
        if not trainer.train_model(X_train, labels):
            logger.error("❌ Model training failed")
            return False
        
        logger.info("✓ Model trained successfully")
        logger.info(f"✓ Model accuracy on training data: {trainer.get_model_score(X_train, labels):.4f}")
        
        logger.info("\nSaving model artifacts...")
        if not trainer.save_model(
            settings.INTENT_MODEL_FILE,
            settings.LABEL_ENCODER_FILE
        ):
            logger.error("❌ Failed to save model")
            return False
        
        logger.info(f"✓ Model saved to {settings.INTENT_MODEL_FILE}")
        
        if not feature_engineer.save_vectorizer(settings.VECTORIZER_FILE):
            logger.error("❌ Failed to save vectorizer")
            return False
        
        logger.info(f"✓ Vectorizer saved to {settings.VECTORIZER_FILE}")
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ TRAINING COMPLETED SUCCESSFULLY!")
        logger.info("=" * 60)
        logger.info("\nModel is ready for inference.")
        logger.info("You can now run:")
        logger.info("  - Backend: python backend/main.py")
        logger.info("  - Frontend: streamlit run frontend/app.py")
        logger.info("\nOr run both with: run.bat")
        logger.info("=" * 60)
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Training failed with error: {e}", exc_info=True)
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
