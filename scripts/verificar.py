import requests
from bs4 import BeautifulSoup

url = (
    "https://geoservicos.ibge.gov.br/geoserver/ows"
    "?service=WFS"
    "&request=GetCapabilities"
)

xml = requests.get(url).text

soup = BeautifulSoup(xml, "xml")

for camada in soup.find_all("Name"):
    nome = camada.text

    if "setor" in nome.lower():
        print(nome)