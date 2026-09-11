"""Regression check for opening the Festival ViraBairro notebook."""

import argparse
from html.parser import HTMLParser
from urllib.parse import urljoin
from urllib.request import urlopen


class ProvaPageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.prova_root = None

    def handle_starttag(self, tag, attrs):
        if tag == "html":
            self.prova_root = dict(attrs).get("data-prova-root")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", required=True)
    args = parser.parse_args()
    page_url = f"{args.base_url}/prova/"
    with urlopen(page_url) as response:
        page = response.read().decode()

    parser = ProvaPageParser()
    parser.feed(page)
    app_root = (parser.prova_root or ".").rstrip("/")
    notebook_url = urljoin(page_url, f"{app_root}/prova-a1-festival-virabairro.ipynb")
    with urlopen(notebook_url) as response:
        assert response.status == 200, f"O caderno retornou HTTP {response.status}: {notebook_url}"


if __name__ == "__main__":
    main()
