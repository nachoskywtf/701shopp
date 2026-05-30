import urllib.request
import urllib.parse
import json
import re

def search_ddg_images(query):
    # 1. Get VQD token
    url = f"https://duckduckgo.com/?q={urllib.parse.quote(query)}&t=h_&iax=images&ia=images"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching VQD for {query}: {e}")
        return None

    match = re.search(r'vqd=([\d-]+)', html)
    if not match:
        print(f"VQD not found for {query}")
        return None
    vqd = match.group(1)

    # 2. Get images
    api_url = f"https://duckduckgo.com/i.js?l=us-en&o=json&q={urllib.parse.quote(query)}&vqd={vqd}&f=,,,&p=1"
    req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        response = urllib.request.urlopen(req).read().decode('utf-8')
        data = json.loads(response)
        if "results" in data and len(data["results"]) > 0:
            return data["results"][0]["image"]
    except Exception as e:
        print(f"Error fetching images for {query}: {e}")
    
    return None

queries = [
    "Valentino Donna Born in Roma Green Stravaganza 100ml bottle sephora",
    "Azzaro The Most Wanted Eau de Parfum Intense bottle ulta",
    "Lattafa Asad bottle amazon",
    "Givenchy Gentleman Eau de Toilette Intense bottle sephora",
    "Paco Rabanne Phantom Intense bottle sephora",
    "Maison Alhambra Jean Lowe Immortal bottle amazon"
]

results = {}
for q in queries:
    img = search_ddg_images(q)
    results[q] = img
    print(f"{q} -> {img}")

with open("ddg_urls.json", "w") as f:
    json.dump(results, f, indent=4)
