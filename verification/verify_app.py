from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            print("Navigating to app...")
            page.goto("http://localhost:4173/")
            print("Waiting for 'No Tables Loaded' text...")
            # Wait for the app to load
            page.wait_for_selector("text=No Tables Loaded", timeout=10000)
            print("App loaded successfully.")
            page.screenshot(path="verification/screenshot.png")
            print("Screenshot taken.")
        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="verification/error_screenshot.png")
                print("Error screenshot taken.")
            except:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    run()
