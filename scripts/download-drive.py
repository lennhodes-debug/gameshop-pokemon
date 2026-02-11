"""Download alle HEIC foto's van Google Drive en converteer naar WebP."""
import os, sys, requests
from concurrent.futures import ThreadPoolExecutor

FILES = {
    "IMG_2230.HEIC": "16dsYVU0HLBmfxHOC3zrDVfgfVBazLyS-",
    "IMG_2231.HEIC": "1RfVuU5XLyDuupJ7SWKKzqIOSOXIwukou",
    "IMG_2232.HEIC": "1dWb0ZIJZOj7Z2NQopy-EvKhSiDgTwiux",
    "IMG_2233.HEIC": "1r_MuC5MPNXjTU-G1qFJvP1P8z-RI91LM",
    "IMG_2234.HEIC": "1qssOHXis0q0Gm7OB0WfhCgI7Lt8gMAE6",
    "IMG_2235.HEIC": "1JEXAg5-645LU68mrh4catzveRVB1R6Of",
    "IMG_2237.HEIC": "15heqSj3wHBTFcoV5rPacm7WiqyF6h1Tu",
    "IMG_2238.HEIC": "1mVimyumGDQOdhWrsRC4h-7ZBvxJ4Nkrt",
    "IMG_2239.HEIC": "1WGHpThJMMFAN44oc90JRiMzAaz-LON-Z",
    "IMG_2241.HEIC": "1HlvYtkJbyfY1ly2AEtOEwAHwmcSHjS4H",
    "IMG_2243.HEIC": "1mSpyhdLBbB7nZl7fStg5yaFChWUjQq3A",
    "IMG_2244.HEIC": "1zALBNHfxW57fCF0WOIW3Ajr85imw6L9K",
    "IMG_2245.HEIC": "1z-DAPlrZ3jp4VxffJINIbn75HcOK33X4",
    "IMG_2246.HEIC": "1Z8pWGuTUzFb5AcrZCK2twxMGY0O7Pw1l",
    "IMG_2247.HEIC": "1QswOqTbO3pnvMff1d98wqHPSNExjpPZJ",
    "IMG_2248.HEIC": "12CkNfvcbJbmGYVGW7M64M8bmGpkZG3g1",
    "IMG_2249.HEIC": "1GivhnjqP85XwwYtoLq1096ld6IRzRz2H",
    "IMG_2250.HEIC": "1CzNtRocK7E3zQQNqXOkMXaY_Gh7Zbfm6",
    "IMG_2251.HEIC": "1ENDRIpw7nHY-i-OQCOzdANQAJmaNd9no",
    "IMG_2252.HEIC": "1vDd6Qxa5VeLAQQPoXUslOaZpnKaADl61",
    "IMG_2253.HEIC": "1F5sNeFOzE5215Zd2qe9sLy6kitSc39EA",
    "IMG_2254.HEIC": "1agWpVlOcS_JXwc4_hk7PQBEPGGPZOY4f",
    "IMG_2255.HEIC": "1Tgj5M-zmH8sAgY2ruIGg6DmrQYU9bHWT",
    "IMG_2256.HEIC": "1PZe5b8jxW3pxRIKARd0kIk9HziVLliQa",
    "IMG_2258.HEIC": "1mgHfJVXwrB3dJwy_EkEaPDDSzWagqedP",
    "IMG_2259.HEIC": "1XUDoFOI_p9VMOXNctPGk02yPEfZQzyaZ",
    "IMG_2260.HEIC": "1bsCPOgkNJIgeyBrILaZzb365ognRQ0iG",
    "IMG_2261.HEIC": "1qllXCGC_gp-oAsA_hbbGxuiBwnwvXe_F",
    "IMG_2262.HEIC": "1CyltA7QrBAM_4g_WXtnmevqEQV4R14Fe",
    "IMG_2263.HEIC": "1cdJBgyPFx2LyhOjwboKTYuXY-J0OAC88",
    "IMG_2264.HEIC": "1RGDt3qcRKcveILfznucvRrfSj36Cwboa",
    "IMG_2265.HEIC": "1Gex2bh8npG5mMwG56CBa8GtlkePNGl4v",
    "IMG_2266.HEIC": "18X1LDUtmNq5Rp1qfkHcIqMpZSzAdONxL",
    "IMG_2267.HEIC": "1vAwv9gtJn1sy908T5dxY9oPPqAYZJSlD",
    "IMG_2268.HEIC": "1g_wHD5pim5Ap9oCdW8N7q8Rla7hNRlq2",
    "IMG_2269.HEIC": "1UUmdf2S_AG4RCV0r_OnUCnjliWtsYZ_X",
    "IMG_2270.HEIC": "1rPZnt1dsTl9fOVP9p-L8pzOfpZQKByut",
    "IMG_2271.HEIC": "13al_Lf_Br6Eyb4JAOXway_cdR0jmSLKB",
}

OUT_DIR = "/tmp/drive-heic"
os.makedirs(OUT_DIR, exist_ok=True)

def download(item):
    name, fid = item
    path = os.path.join(OUT_DIR, name)
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return f"SKIP {name}"
    url = f"https://drive.google.com/uc?export=download&id={fid}&confirm=t"
    r = requests.get(url, timeout=30)
    if r.status_code == 200 and len(r.content) > 1000:
        with open(path, "wb") as f:
            f.write(r.content)
        return f"OK   {name} ({len(r.content)//1024}KB)"
    return f"FAIL {name} (status={r.status_code}, size={len(r.content)})"

with ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(download, FILES.items()))

for r in sorted(results):
    print(r)
print(f"\nTotaal: {sum(1 for r in results if r.startswith('OK') or r.startswith('SKIP'))}/{len(FILES)}")
