"""
Tests NLP preprocessing
"""
import pytest
from backend.nlp.preprocess import TextPreprocessor
from backend.nlp.tokenizer import Tokenizer
from backend.nlp.lemmatizer import SimpleLemmatizer


class TestTextPreprocessor:
    @pytest.fixture
    def preprocessor(self):
        return TextPreprocessor()
    
    def test_to_lowercase(self, preprocessor):
        text = "Hello WORLD"
        result = preprocessor.to_lowercase(text)
        assert result == "hello world"
    
    def test_remove_urls(self, preprocessor):
        text = "Check this https://www.example.com link"
        result = preprocessor.remove_urls(text)
        assert "https://www.example.com" not in result
        assert "Check this" in result
    
    def test_remove_emails(self, preprocessor):
        text = "Contact me at test@example.com for info"
        result = preprocessor.remove_emails(text)
        assert "test@example.com" not in result
        assert "Contact me" in result
    
    def test_remove_extra_whitespace(self, preprocessor):
        text = "Text   with    multiple     spaces"
        result = preprocessor.remove_extra_whitespace(text)
        assert "   " not in result
        assert result.strip() == "Text with multiple spaces"
    
    def test_remove_punctuation(self, preprocessor):
        text = "Hello, World! How are you?"
        result = preprocessor.remove_punctuation(text)
        assert "," not in result
        assert "!" not in result
        assert "?" not in result
    
    def test_remove_punctuation_keep_important(self, preprocessor):
        text = "Hello, World! How are you?"
        result = preprocessor.remove_punctuation(text, keep_important=True)
        assert "!" in result or "?" in result
    
    def test_remove_numbers(self, preprocessor):
        text = "I have 5 books and 10 pens"
        result = preprocessor.remove_numbers(text)
        assert "5" not in result
        assert "10" not in result
    
    def test_clean_text(self, preprocessor):
        text = "Hello, visit https://example.com! Contact: test@email.com"
        result = preprocessor.clean_text(text)
        assert result is not None
        assert len(result) > 0
        assert "@" not in result
        assert "://" not in result
    
    def test_preprocess_batch(self, preprocessor):
        texts = [
            "HELLO WORLD!",
            "Another TEST.",
            "Final example..."
        ]
        results = preprocessor.preprocess_batch(texts)
        
        assert len(results) == 3
        assert all(isinstance(r, str) for r in results)


class TestTokenizer:
    @pytest.fixture
    def tokenizer(self):
        return Tokenizer()
    
    def test_tokenize_words(self, tokenizer):
        text = "Hello world test"
        result = tokenizer.tokenize_words(text)
        
        assert len(result) == 3
        assert "hello" in result
        assert "world" in result
    
    def test_tokenize_words_empty(self, tokenizer):
        result = tokenizer.tokenize_words("")
        assert result == []
    
    def test_tokenize_sentences(self, tokenizer):
        text = "First sentence. Second sentence! Third sentence?"
        result = tokenizer.tokenize_sentences(text)
        
        assert len(result) == 3
        assert "First sentence" in result
    
    def test_tokenize_sentences_empty(self, tokenizer):
        result = tokenizer.tokenize_sentences("")
        assert result == []
    
    def test_tokenize_ngrams(self, tokenizer):
        text = "hello world test"
        result = tokenizer.tokenize_ngrams(text, n=2)
        
        assert len(result) == 2
        assert "hello world" in result
        assert "world test" in result
    
    def test_tokenize_ngrams_invalid_n(self, tokenizer):
        result = tokenizer.tokenize_ngrams("hello world", n=0)
        assert result == []
    
    def test_get_unique_tokens(self, tokenizer):
        text = "hello world hello"
        result = tokenizer.get_unique_tokens(text)
        
        assert len(result) == 2
        assert "hello" in result
        assert "world" in result
    
    def test_tokenize_batch(self, tokenizer):
        texts = ["hello world", "test string"]
        result = tokenizer.tokenize_batch(texts)
        
        assert len(result) == 2
        assert all(isinstance(r, list) for r in result)
    
    def test_get_vocabulary(self, tokenizer):
        texts = ["hello world", "hello test", "world test"]
        result = tokenizer.get_vocabulary(texts)
        
        assert "hello" in result
        assert "world" in result
        assert "test" in result


class TestSimpleLemmatizer:
    @pytest.fixture
    def lemmatizer(self):
        return SimpleLemmatizer()
    
    def test_lemmatize_word_verb(self, lemmatizer):
        assert lemmatizer.lemmatize_word("running") == "run"
        assert lemmatizer.lemmatize_word("ran") == "run"
        assert lemmatizer.lemmatize_word("walks") == "walk"
    
    def test_lemmatize_word_noun(self, lemmatizer):
        assert lemmatizer.lemmatize_word("courses") == "course"
        assert lemmatizer.lemmatize_word("admissions") == "admit"
    
    def test_lemmatize_word_unknown(self, lemmatizer):
        result = lemmatizer.lemmatize_word("unknown")
        assert result is not None
    
    def test_lemmatize_word_empty(self, lemmatizer):
        assert lemmatizer.lemmatize_word("") == ""
    
    def test_lemmatize_text(self, lemmatizer):
        text = "running and walking"
        result = lemmatizer.lemmatize_text(text)
        
        assert "run" in result
        assert "walk" in result
    
    def test_lemmatize_text_empty(self, lemmatizer):
        assert lemmatizer.lemmatize_text("") == ""
    
    def test_lemmatize_tokens(self, lemmatizer):
        tokens = ["running", "walks", "studies"]
        result = lemmatizer.lemmatize_tokens(tokens)
        
        assert len(result) == 3
        assert "run" in result
        assert "walk" in result
    
    def test_get_lemma_mapping(self, lemmatizer):
        words = ["running", "walks", "courses"]
        result = lemmatizer.get_lemma_mapping(words)
        
        assert result["running"] == "run"
        assert result["walks"] == "walk"
        assert result["courses"] == "course"
