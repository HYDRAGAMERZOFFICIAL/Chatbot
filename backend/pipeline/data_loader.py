"""
Loads processed training data
"""
import json
import logging
from typing import List, Dict, Tuple
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataLoader:
    def __init__(self, data_path: str = 'backend/knowledge_base/collegewala_intents.json'):
        self.data_path = data_path
        self.intents = []
        self.patterns = []
        self.responses = []
        self.intent_labels = []

    def load_intents(self) -> List[Dict]:
        """Load intents from JSON file"""
        try:
            if not Path(self.data_path).exists():
                logger.warning(f"Data file not found: {self.data_path}")
                return []

            with open(self.data_path, 'r', encoding='utf-8') as f:
                self.intents = json.load(f)

            logger.info(f"Loaded {len(self.intents)} intents from {self.data_path}")
            return self.intents
        except Exception as e:
            logger.error(f"Error loading intents: {e}")
            return []

    def extract_patterns_and_labels(self) -> Tuple[List[str], List[str]]:
        """Extract patterns and their corresponding labels"""
        if not self.intents:
            self.load_intents()

        patterns = []
        labels = []

        for intent_data in self.intents:
            intent_name = intent_data.get('intent', 'unknown')
            intent_patterns = intent_data.get('patterns', [])

            for pattern in intent_patterns:
                if pattern.strip():
                    patterns.append(pattern.strip())
                    labels.append(intent_name)

        self.patterns = patterns
        self.intent_labels = labels

        logger.info(f"Extracted {len(patterns)} patterns with {len(set(labels))} intent labels")
        return patterns, labels

    def get_intent_to_response_mapping(self) -> Dict[str, List[str]]:
        """Map intents to their response templates"""
        if not self.intents:
            self.load_intents()

        mapping = {}
        for intent_data in self.intents:
            intent_name = intent_data.get('intent', 'unknown')
            responses = intent_data.get('responses', [])
            mapping[intent_name] = responses

        logger.info(f"Created mapping for {len(mapping)} intents")
        return mapping

    def get_all_intent_names(self) -> List[str]:
        """Get list of all unique intent names"""
        if not self.intents:
            self.load_intents()

        intent_names = [intent['intent'] for intent in self.intents]
        return sorted(list(set(intent_names)))

    def get_intent_by_name(self, intent_name: str) -> Dict:
        """Get specific intent data"""
        if not self.intents:
            self.load_intents()

        for intent_data in self.intents:
            if intent_data.get('intent') == intent_name:
                return intent_data

        return None

    def prepare_training_data(self) -> Tuple[List[str], List[str]]:
        """Prepare data for training"""
        patterns, labels = self.extract_patterns_and_labels()
        
        if not patterns or not labels:
            logger.error("No patterns or labels found in training data")
            return None, None
            
        return patterns, labels
