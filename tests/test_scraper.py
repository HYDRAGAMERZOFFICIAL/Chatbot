"""
Tests scraping logic
"""
import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from data.scraper.scrape_sfgc import CollegewalaScraper
from data.scraper.page_parser import PageParser


class TestCollegewalaScraper:
    @pytest.fixture
    def scraper(self):
        return CollegewalaScraper(base_url="https://www.sfgc.ac.in")
    
    @patch('requests.Session.get')
    def test_get_page_success(self, mock_get, scraper):
        mock_response = Mock()
        mock_response.content = b'<html><title>Test Page</title><body><p>Test content</p></body></html>'
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        result = scraper.get_page("https://www.collegewala.edu.in/test")
        
        assert result is not None
        assert result.title.string == "Test Page"
    
    @patch('requests.Session.get')
    def test_get_page_failure(self, mock_get, scraper):
        mock_get.side_effect = Exception("Connection error")
        
        result = scraper.get_page("https://www.collegewala.edu.in/test")
        
        assert result is None
    
    def test_extract_text_from_page(self, scraper):
        from bs4 import BeautifulSoup
        
        html = '''
        <html>
            <title>Test Title</title>
            <body>
                <p>First paragraph</p>
                <p>Second paragraph</p>
            </body>
        </html>
        '''
        soup = BeautifulSoup(html, 'html.parser')
        
        result = scraper.extract_text_from_page(soup, "https://example.com")
        
        assert result is not None
        assert result['title'] == "Test Title"
        assert len(result['paragraphs']) == 2
        assert "First paragraph" in result['content']
    
    def test_extract_text_from_page_none(self, scraper):
        result = scraper.extract_text_from_page(None, "https://example.com")
        assert result is None


class TestPageParser:
    @pytest.fixture
    def parser(self):
        return PageParser()
    
    def test_clean_html_text(self, parser):
        text = "<p>Clean</p>   <br>   <span>Text</span>"
        result = parser.clean_html_text(text)
        
        assert result is not None
        assert len(result) > 0
    
    def test_remove_extra_whitespace(self, parser):
        text = "Text    with   multiple    spaces"
        result = parser.remove_extra_whitespace(text)
        
        assert "    " not in result
        assert result == "Text with multiple spaces"
    
    def test_extract_paragraphs(self, parser):
        text = "Para 1.\n\nPara 2.\n\nPara 3."
        result = parser.extract_paragraphs(text)
        
        assert len(result) == 3
        assert all(p.strip() for p in result)


class TestIntentMapper:
    @pytest.fixture
    def mapper(self):
        from data.scraper.intent_mapper import IntentMapper
        return IntentMapper()
    
    def test_map_intents_from_data(self, mapper):
        sample_data = [
            {
                "url": "https://www.collegewala.edu.in/admissions",
                "title": "Admissions",
                "content": "Apply for admission",
                "page_type": "admissions"
            }
        ]
        
        result = mapper.map_intents_from_data(sample_data)
        
        assert result is not None
        assert isinstance(result, list)
    
    def test_save_intents_to_file(self, mapper, tmp_path):
        intents = [
            {
                "intent": "test",
                "patterns": ["test pattern"],
                "responses": ["test response"]
            }
        ]
        
        file_path = tmp_path / "intents.json"
        result = mapper.save_intents_to_file(intents, str(file_path))
        
        assert result is True
        assert file_path.exists()
