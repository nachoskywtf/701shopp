import urllib.request
import urllib.parse
import json
import re
import os

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

def download_image(url, save_path):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as response, open(save_path, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

perfumes = [
    {
        "query": "Xerjoff Erba Pura 100ml bottle notino",
        "path": "public/img/perfumes/xerjoff_erba_pura_100ml_edp/xerjoff_erba_pura_100ml_edp_1.jpg"
    },
    {
        "query": "Dior Miss Dior EDP 2021 perfume bottle white background",
        "path": "public/img/perfumes/dior_miss_dior_edp_100ml_mujer/dior_miss_dior_edp_100ml_mujer_1.jpg"
    },
    {
        "query": "Versace Eros Man EDP 100ml perfume bottle",
        "path": "public/img/perfumes/versace_eros_man_100ml_edp/versace_eros_man_100ml_edp_1.jpg"
    },
    {
        "query": "YSL Libre Intense perfume bottle",
        "path": "public/img/perfumes/yvest_saint_laurent_libre_parfum_intense_90ml/yvest_saint_laurent_libre_parfum_intense_90ml_1.jpg"
    },
    {
        "query": "Gucci Guilty Pour Homme EDT 90ml bottle",
        "path": "public/img/perfumes/gucci_guilty_hombre_90ml_edt/gucci_guilty_hombre_90ml_edt_1.jpg"
    },
    {
        "query": "CK One Shock For Her 100ml bottle",
        "path": "public/img/perfumes/calvin_klein_ck_one_shock_for_her_100ml_edt/calvin_klein_ck_one_shock_for_her_100ml_edt_1.jpg"
    },
    {
        "query": "Halloween Man EDT bottle",
        "path": "public/img/perfumes/halloween_man_75ml_edt/halloween_man_75ml_edt_1.jpg"
    },
    {
        "query": "Halloween Man X EDT bottle",
        "path": "public/img/perfumes/halloween_man_x_100ml_edt/halloween_man_x_100ml_edt_1.jpg"
    }
]

for p in perfumes:
    print(f"Searching for: {p['query']}")
    img_url = search_ddg_images(p['query'])
    if img_url:
        print(f"Found URL: {img_url}")
        os.makedirs(os.path.dirname(p['path']), exist_ok=True)
        if download_image(img_url, p['path']):
            print(f"Successfully downloaded to {p['path']}")
        else:
            print("Download failed.")
    else:
        print("No image found.")
    print("-" * 20)
