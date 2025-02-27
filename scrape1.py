import selenium
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def save_links_to_file(links, mode='w'):
    with open('collected_links.txt', mode, encoding='utf-8') as f:
        for href in sorted(links):
            f.write(href + '\n')

def log_failed_page(page_num, error):
    with open('failed_pages.txt', 'a', encoding='utf-8') as f:
        f.write(f"Page {page_num}: {str(error)}\n")

# Initialize the Chrome driver
driver = selenium.webdriver.Chrome()
all_hrefs = set()  # Using a set to avoid duplicates

# Navigate to the page
driver.get("https://is.muni.cz/predmety/?")

# Clear the files at the start
open('collected_links.txt', 'w').close()
open('failed_pages.txt', 'w').close()

for i in range(1, 524):
    try:
        if i != 1:
            # Wait for and click the element
            element = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//a[@aria-label='Page " + str(i) + "' and @class='page_button']"))
            )
            element.click()
        
        # Wait for the page to load
        time.sleep(1)
        
        # Find all links on the current page
        links = driver.find_elements(By.CLASS_NAME, "course_link")
        while links == []:
            links = driver.find_elements(By.CLASS_NAME, "course_link")
            time.sleep(1)

        # Extract and store all href attributes
        for link in links:
            try:
                href = link.get_attribute('href')
                if href:
                    all_hrefs.add(href)
            except Exception as e:
                print(f"Error extracting href: {e}")
                
        print(f"Processed page {i}, total unique links: {len(all_hrefs)}")
        
        # Save progress every 20 pages
        if i % 20 == 0:
            save_links_to_file(all_hrefs)
            print(f"Progress saved at page {i}")
            
    except Exception as e:
        print(f"An error occurred on page {i}: {e}")
        # Log the failed page
        log_failed_page(i, e)
        # Save progress on error as well
        save_links_to_file(all_hrefs)

# Save any remaining links at the end
save_links_to_file(all_hrefs)

print(f"Total unique links collected: {len(all_hrefs)}")
driver.quit()
