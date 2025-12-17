"""
Checks confidence threshold
"""
import logging
from typing import Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ConfidenceChecker:
    def __init__(self, threshold: float = 0.5):
        self.threshold = threshold
        logger.info(f"Confidence threshold set to {threshold}")

    def set_threshold(self, threshold: float) -> None:
        """Set confidence threshold"""
        if 0.0 <= threshold <= 1.0:
            self.threshold = threshold
            logger.info(f"Threshold updated to {threshold}")
        else:
            logger.warning(f"Invalid threshold {threshold}. Must be between 0 and 1.")

    def is_confident(self, confidence_score: float) -> bool:
        """Check if confidence score meets threshold"""
        return confidence_score >= self.threshold

    def get_confidence_level(self, confidence_score: float) -> str:
        """Get human-readable confidence level"""
        if confidence_score >= 0.9:
            return 'very_high'
        elif confidence_score >= 0.7:
            return 'high'
        elif confidence_score >= 0.5:
            return 'medium'
        elif confidence_score >= 0.3:
            return 'low'
        else:
            return 'very_low'

    def evaluate_prediction(self, intent: str, confidence_score: float) -> Tuple[bool, str]:
        """Evaluate if prediction meets confidence threshold"""
        is_confident = self.is_confident(confidence_score)
        confidence_level = self.get_confidence_level(confidence_score)

        return is_confident, confidence_level

    def get_recommendation(self, confidence_score: float) -> str:
        """Get recommendation based on confidence score"""
        if confidence_score >= self.threshold:
            return 'use_response'
        else:
            return 'use_fallback'

    def adjust_threshold_dynamically(self, accuracy: float) -> None:
        """Dynamically adjust threshold based on accuracy"""
        if accuracy < 0.6:
            self.threshold = 0.7
        elif accuracy < 0.75:
            self.threshold = 0.6
        elif accuracy > 0.95:
            self.threshold = 0.4
        else:
            self.threshold = 0.5

        logger.info(f"Threshold adjusted to {self.threshold} based on accuracy {accuracy}")
