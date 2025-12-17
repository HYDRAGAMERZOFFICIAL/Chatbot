"""
Scrapes public pages of collegewala.edu.in
"""
import requests
from bs4 import BeautifulSoup
import json
import logging
from typing import List, Dict
from urllib.parse import urljoin, urlparse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CollegewalaScraper:
    def __init__(self, base_url: str = "https://www.sfgc.ac.in"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.scraped_data = []

    def get_page(self, url: str) -> BeautifulSoup:
        """Fetch and parse a webpage"""
        try:
            logger.info(f"Scraping: {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except requests.RequestException as e:
            logger.error(f"Error scraping {url}: {e}")
            return None

    def extract_text_from_page(self, soup: BeautifulSoup, url: str) -> Dict:
        """Extract main content from a page"""
        if not soup:
            return None

        data = {
            'url': url,
            'title': '',
            'content': '',
            'paragraphs': [],
            'links': []
        }

        try:
            title_tag = soup.find('title')
            data['title'] = title_tag.text.strip() if title_tag else ''

            main_content = soup.find(['main', 'article']) or soup.find('body')
            if main_content:
                paragraphs = main_content.find_all('p')
                data['paragraphs'] = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)]
                data['content'] = ' '.join(data['paragraphs'])

                links = main_content.find_all('a', href=True)
                data['links'] = [
                    {
                        'text': link.get_text(strip=True),
                        'url': urljoin(self.base_url, link['href'])
                    }
                    for link in links if link.get_text(strip=True)
                ]

            return data
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            return None

    def scrape_main_pages(self) -> List[Dict]:
        """Scrape key pages from Collegewala website"""
        pages = [
            ('/', 'home'),
            ('/about', 'about'),
            ('/academics', 'academics'),
            ('/admissions', 'admissions'),
            ('/courses', 'courses'),
            ('/faculty', 'faculty'),
            ('/contact', 'contact'),
        ]

        for path, page_type in pages:
            url = urljoin(self.base_url, path)
            soup = self.get_page(url)
            if soup:
                data = self.extract_text_from_page(soup, url)
                if data:
                    data['page_type'] = page_type
                    self.scraped_data.append(data)

        return self.scraped_data

    def save_to_json(self, filename: str) -> None:
        """Save scraped data to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.scraped_data, f, indent=2, ensure_ascii=False)
            logger.info(f"Scraped data saved to {filename}")
        except Exception as e:
            logger.error(f"Error saving to JSON: {e}")


def main():
    scraper = CollegewalaScraper()
    scraper.scrape_main_pages()
    scraper.save_to_json('data/raw/scraped_collegewala_data.json')
    print(f"Scraped {len(scraper.scraped_data)} pages")


if __name__ == "__main__":
    main()
