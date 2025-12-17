"""
Test script to verify all imports work correctly
"""
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_imports():
    """Test all critical imports"""
    
    tests = [
        ("from backend.config import settings", "Settings"),
        ("from backend.database import Database", "Database"),
        ("from backend.utils.logger import setup_logger, get_logger", "Logger"),
        ("from backend.utils.helpers import format_response", "Helpers"),
        ("from backend.nlp.preprocess import TextPreprocessor", "TextPreprocessor"),
        ("from backend.nlp.tokenizer import Tokenizer", "Tokenizer"),
        ("from backend.nlp.lemmatizer import SimpleLemmatizer", "SimpleLemmatizer"),
        ("from backend.pipeline.data_loader import DataLoader", "DataLoader"),
        ("from backend.pipeline.feature_engineering import FeatureEngineer", "FeatureEngineer"),
        ("from backend.pipeline.confidence import ConfidenceChecker", "ConfidenceChecker"),
        ("from backend.pipeline.response_selector import ResponseSelector", "ResponseSelector"),
        ("from backend.ml.train import ModelTrainer", "ModelTrainer"),
        ("from backend.ml.predict import IntentPredictor", "IntentPredictor"),
        ("from backend.ml.evaluator import ModelEvaluator", "ModelEvaluator"),
        ("from backend.ml.retrain import ModelRetrainer", "ModelRetrainer"),
        ("from backend.knowledge_base.responses import ResponseGenerator", "ResponseGenerator"),
        ("from backend.api.health import router", "Health API"),
        ("from backend.api.chat_api import router", "Chat API"),
    ]
    
    logger.info("Testing imports...")
    logger.info("=" * 60)
    
    failed = []
    
    for import_stmt, name in tests:
        try:
            exec(import_stmt)
            logger.info(f"✓ {name}")
        except Exception as e:
            logger.error(f"✗ {name}: {e}")
            failed.append(name)
    
    logger.info("=" * 60)
    
    if failed:
        logger.error(f"\n❌ {len(failed)} imports failed:")
        for f in failed:
            logger.error(f"  - {f}")
        return False
    else:
        logger.info("\n✅ All imports successful!")
        return True


def test_data_loading():
    """Test data loading"""
    logger.info("\nTesting data loading...")
    logger.info("=" * 60)
    
    try:
        from backend.pipeline.data_loader import DataLoader
        
        loader = DataLoader('backend/knowledge_base/collegewala_intents.json')
        patterns, labels = loader.prepare_training_data()
        
        if patterns and labels:
            logger.info(f"✓ Loaded {len(patterns)} patterns")
            logger.info(f"✓ Found {len(set(labels))} intents: {sorted(set(labels))}")
            logger.info("=" * 60)
            return True
        else:
            logger.error("✗ Failed to load data")
            logger.info("=" * 60)
            return False
            
    except Exception as e:
        logger.error(f"✗ Error: {e}")
        logger.info("=" * 60)
        return False


def test_feature_engineering():
    """Test feature engineering"""
    logger.info("\nTesting feature engineering...")
    logger.info("=" * 60)
    
    try:
        from backend.pipeline.feature_engineering import FeatureEngineer
        
        engineer = FeatureEngineer()
        
        test_texts = [
            "Hello world test",
            "Another test string",
            "Final example text"
        ]
        
        vectors = engineer.fit_transform_texts(test_texts)
        
        if vectors is not None:
            logger.info(f"✓ Created vectors with shape: {vectors.shape}")
            logger.info(f"✓ Features extracted: {engineer.get_vector_dimensions()}")
            logger.info("=" * 60)
            return True
        else:
            logger.error("✗ Failed to create vectors")
            logger.info("=" * 60)
            return False
            
    except Exception as e:
        logger.error(f"✗ Error: {e}")
        logger.info("=" * 60)
        return False


def main():
    """Run all tests"""
    logger.info("\n🧪 Collegewala Chatbot - Import and Component Tests\n")
    
    results = []
    results.append(("Imports", test_imports()))
    results.append(("Data Loading", test_data_loading()))
    results.append(("Feature Engineering", test_feature_engineering()))
    
    logger.info("\n" + "=" * 60)
    logger.info("📊 Test Summary")
    logger.info("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        logger.info(f"{test_name}: {status}")
    
    all_passed = all(result[1] for result in results)
    
    logger.info("=" * 60)
    
    if all_passed:
        logger.info("\n✅ All tests passed! System is ready for training.")
    else:
        logger.error("\n❌ Some tests failed. Please check the errors above.")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
