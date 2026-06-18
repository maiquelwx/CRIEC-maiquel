import requests

url = "https://apisidra.ibge.gov.br/desctabapi.aspx?o=3&formato=json"

r = requests.get(url)

print(r.status_code)
print(r.headers["content-type"])
print(r.text[:500])