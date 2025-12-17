"""
Maps intent → official answer
"""
import json
import logging
import random
from typing import Dict, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ResponseGenerator:
    def __init__(self, intents_file: str = 'backend/knowledge_base/collegewala_intents.json'):
        self.intents_file = intents_file
        self.intent_responses = {}
        self.load_intent_responses()

    def load_intent_responses(self) -> bool:
        """Load intent to response mapping from intents file"""
        try:
            with open(self.intents_file, 'r', encoding='utf-8') as f:
                intents = json.load(f)

            for intent_data in intents:
                intent_name = intent_data.get('intent', 'unknown')
                responses = intent_data.get('responses', [])
                self.intent_responses[intent_name] = responses

            logger.info(f"Loaded {len(self.intent_responses)} intent response mappings")
            return True
        except Exception as e:
            logger.error(f"Error loading intent responses: {e}")
            return False

    def get_response(self, intent: str) -> str:
        """Get response for given intent"""
        if intent in self.intent_responses:
            responses = self.intent_responses[intent]
            if responses:
                return random.choice(responses)

        logger.warning(f"No response found for intent: {intent}")
        return None

    def get_all_responses_for_intent(self, intent: str) -> List[str]:
        """Get all responses for an intent"""
        return self.intent_responses.get(intent, [])

    def has_intent(self, intent: str) -> bool:
        """Check if intent exists"""
        return intent in self.intent_responses

    def get_all_intents(self) -> List[str]:
        """Get list of all available intents"""
        return list(self.intent_responses.keys())

    def get_intent_details(self, intent: str) -> Dict:
        """Get detailed information about an intent"""
        if intent not in self.intent_responses:
            return None

        return {
            'intent': intent,
            'responses': self.intent_responses[intent],
            'response_count': len(self.intent_responses[intent])
        }

    def reload_intents(self) -> bool:
        """Reload intent responses from file"""
        self.intent_responses.clear()
        return self.load_intent_responses()
