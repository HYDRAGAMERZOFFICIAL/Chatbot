"""
Chooses final response or fallback
"""
import json
import logging
import random
from typing import Dict, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ResponseSelector:
    def __init__(self, fallback_file: str = 'backend/knowledge_base/fallback.json'):
        self.fallback_file = fallback_file
        self.fallback_data = self.load_fallback_responses()

    def load_fallback_responses(self) -> Dict:
        """Load fallback responses"""
        try:
            with open(self.fallback_file, 'r', encoding='utf-8') as f:
                self.fallback_data = json.load(f)
            logger.info("Fallback responses loaded")
            return self.fallback_data
        except Exception as e:
            logger.error(f"Error loading fallback responses: {e}")
            return {
                'fallback_responses': [
                    "I'm sorry, I couldn't understand your question. Please try again.",
                    "For more information, please contact our support team."
                ]
            }

    def get_random_fallback(self) -> str:
        """Get a random fallback response"""
        fallback_responses = self.fallback_data.get('fallback_responses', [])
        if fallback_responses:
            return random.choice(fallback_responses)
        return "I'm unable to answer this question at the moment. Please contact support."

    def select_response(self, intent: str, response: str, confidence: float,
                       threshold: float = 0.5) -> Tuple[str, str, bool]:
        """Select final response based on confidence threshold"""
        try:
            is_confident = confidence >= threshold
            confidence_level = self.get_confidence_level(confidence)

            if is_confident and response:
                final_response = response
                source = 'knowledge_base'
            else:
                final_response = self.get_random_fallback()
                source = 'fallback'

            logger.info(f"Selected response from {source} (confidence: {confidence:.4f})")

            return final_response, source, is_confident
        except Exception as e:
            logger.error(f"Error selecting response: {e}")
            return self.get_random_fallback(), 'fallback', False

    def get_confidence_level(self, confidence: float) -> str:
        """Get human-readable confidence level"""
        if confidence >= 0.9:
            return 'very_high'
        elif confidence >= 0.7:
            return 'high'
        elif confidence >= 0.5:
            return 'medium'
        elif confidence >= 0.3:
            return 'low'
        else:
            return 'very_low'

    def format_response(self, response: str, intent: str, confidence: float) -> str:
        """Format response with metadata"""
        return f"{response}\n\n[Intent: {intent} | Confidence: {confidence:.2%}]"

    def get_contact_fallback(self) -> str:
        """Get contact information fallback"""
        return self.fallback_data.get('contact_fallback',
                                      'Please contact: info@collegewala.edu.in')

    def get_suggestion_message(self) -> str:
        """Get suggestion message for user"""
        return self.fallback_data.get('suggestion_message',
                                      'How can I help you today?')

    def create_response_bundle(self, user_query: str, intent: str, response: str,
                              confidence: float, threshold: float = 0.5) -> Dict:
        """Create complete response bundle"""
        final_response, source, is_confident = self.select_response(
            intent, response, confidence, threshold
        )

        return {
            'user_query': user_query,
            'intent': intent,
            'confidence': confidence,
            'confidence_level': self.get_confidence_level(confidence),
            'response': final_response,
            'source': source,
            'is_confident': is_confident,
            'suggestion': self.get_suggestion_message() if not is_confident else None
        }
