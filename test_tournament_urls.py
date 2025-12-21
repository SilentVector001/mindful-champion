import requests
import time

# All URLs found in tournament components
URLS_TO_TEST = [
    # Championship Events
    ("PPA Tour Schedule", "https://ppatour.com/schedule/"),
    ("APP Tour", "https://www.theapp.global/tour"),
    ("USA Pickleball Events", "https://usapickleball.org/events/"),
    ("Pickleball Tournaments (base)", "https://pickleballtournaments.com/"),
    ("Pickleball Tournaments (GA)", "https://pickleballtournaments.com/?state=GA"),
    
    # Rising Stars
    ("Junior PPA Tour", "https://ppatour.com/junior-ppa-tour/"),
    ("APP Junior Info", "https://www.theapp.global/news/the-future-is-now"),
    ("Pickleball Legacy Foundation", "https://www.pblegacy.com/"),
    ("USA Pickleball Juniors", "https://usapickleball.org/juniors/"),
    
    # Community Leagues
    ("Places2Play", "https://www.places2play.org/"),
    ("USA Pickleball Start Program", "https://usapickleball.org/play/start-a-program/"),
    
    # Amateur Competitions
    ("Pickleball Brackets", "https://pickleballbrackets.com/"),
]

print("=" * 80)
print("TESTING ALL TOURNAMENT URLS")
print("=" * 80)
print()

results = {"working": [], "broken": []}

for name, url in URLS_TO_TEST:
    try:
        print(f"Testing: {name}")
        print(f"URL: {url}")
        
        # Make request with proper headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        
        status = response.status_code
        final_url = response.url
        
        if status == 200:
            print(f"✅ WORKING - Status: {status}")
            if final_url != url:
                print(f"   Redirected to: {final_url}")
            results["working"].append((name, url, status, final_url))
        else:
            print(f"❌ BROKEN - Status: {status}")
            results["broken"].append((name, url, status))
            
    except Exception as e:
        print(f"❌ ERROR - {str(e)}")
        results["broken"].append((name, url, f"Error: {e}"))
    
    print()
    time.sleep(0.5)  # Be nice to servers

print("=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"\n✅ Working URLs: {len(results['working'])}")
for name, url, status, final_url in results["working"]:
    print(f"   - {name}: {url}")
    if url != final_url:
        print(f"     (redirects to: {final_url})")

print(f"\n❌ Broken URLs: {len(results['broken'])}")
for item in results["broken"]:
    if len(item) == 3:
        name, url, status = item
        print(f"   - {name}: {url} (Status: {status})")
    else:
        name, url, error = item
        print(f"   - {name}: {url} ({error})")

print()
print("=" * 80)
