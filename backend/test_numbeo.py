import requests, bs4
import json
r = requests.get('https://www.numbeo.com/cost-of-living/in/Delhi', headers={'User-Agent': 'Mozilla/5.0'})
s = bs4.BeautifulSoup(r.text, 'html.parser')
res = {}
for tr in s.find_all('tr'):
    price = tr.find('td', class_='priceValue')
    if price and tr.find('td'):
        res[tr.find('td').text.strip()] = price.text.strip()
print(json.dumps(res, indent=2))
