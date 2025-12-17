"""
Converts text to TF-IDF vectors
"""
import logging
import pickle
from typing import List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FeatureEngineer:
    def __init__(self, max_features: int = 1000, min_df: int = 1, max_df: float = 1.0):
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            min_df=min_df,
            max_df=max_df,
            lowercase=True,
            stop_words='english',
            analyzer='word',
            ngram_range=(1, 2)
        )
        self.is_fitted = False

    def fit_vectorizer(self, texts: List[str]) -> None:
        """Fit vectorizer on training data"""
        try:
            self.vectorizer.fit(texts)
            self.is_fitted = True
            feature_names = self.vectorizer.get_feature_names_out()
            logger.info(f"Vectorizer fitted with {len(feature_names)} features")
        except Exception as e:
            logger.error(f"Error fitting vectorizer: {e}")

    def transform_texts(self, texts: List[str]) -> np.ndarray:
        """Transform texts to TF-IDF vectors"""
        if not self.is_fitted:
            logger.warning("Vectorizer not fitted yet. Call fit_vectorizer first.")
            return None

        try:
            vectors = self.vectorizer.transform(texts)
            return vectors
        except Exception as e:
            logger.error(f"Error transforming texts: {e}")
            return None

    def fit_transform_texts(self, texts: List[str]) -> np.ndarray:
        """Fit and transform texts"""
        try:
            vectors = self.vectorizer.fit_transform(texts)
            self.is_fitted = True
            feature_names = self.vectorizer.get_feature_names_out()
            logger.info(f"Fit-transformed {len(texts)} texts to {len(feature_names)} features")
            return vectors
        except Exception as e:
            logger.error(f"Error in fit_transform: {e}")
            return None

    def get_feature_names(self) -> List[str]:
        """Get feature names from vectorizer"""
        if not self.is_fitted:
            return []

        try:
            return list(self.vectorizer.get_feature_names_out())
        except Exception as e:
            logger.error(f"Error getting feature names: {e}")
            return []

    def save_vectorizer(self, filepath: str) -> bool:
        """Save vectorizer to file"""
        try:
            with open(filepath, 'wb') as f:
                pickle.dump(self.vectorizer, f)
            logger.info(f"Vectorizer saved to {filepath}")
            return True
        except Exception as e:
            logger.error(f"Error saving vectorizer: {e}")
            return False

    def load_vectorizer(self, filepath: str) -> bool:
        """Load vectorizer from file"""
        try:
            with open(filepath, 'rb') as f:
                self.vectorizer = pickle.load(f)
            self.is_fitted = True
            logger.info(f"Vectorizer loaded from {filepath}")
            return True
        except Exception as e:
            logger.error(f"Error loading vectorizer: {e}")
            return False

    def get_vector_dimensions(self) -> int:
        """Get the dimension of vectors"""
        if not self.is_fitted:
            return 0

        try:
            return len(self.vectorizer.get_feature_names_out())
        except Exception as e:
            logger.error(f"Error getting dimensions: {e}")
            return 0
