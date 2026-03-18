# STEM Communication Resource Library

A lightweight, high-performance dynamic web application built to organize and display STEM Communication training materials. 

** [View Live Demo](https://shubhamsakharegem.github.io/stem-comm-demo/)**

## Architecture

This project bypasses heavy, traditional Content Management Systems (like WordPress) in favor of a modern, zero-maintenance "Headless CMS" architecture. 

* **Frontend:** Vanilla HTML5, CSS3 and JavaScript (Single Page Application logic with URL parameter routing).
* **Backend / Database:** A live Google Sheet, published to the web as a CSV.
* **Data Parser:** [PapaParse](https://www.papaparse.com/) (Handles the CSV-to-JSON conversion).
* **Hosting:** GitHub Pages.

By utilizing Google Sheets as the database, non-technical stakeholders can instantly update the website's content, add new courses and change file names simply by editing a spreadsheet—no coding required.

## Key Features

* **Dynamic URL Routing:** Custom JavaScript routing reads URL parameters (e.g., `?name=Effective+STEM`) to generate course pages dynamically from a single `course.html` template.
* **Browser Caching:** Implements `sessionStorage` to cache the database payload on the user's first visit. Subsequent page loads and navigation happen in milliseconds without re-querying the Google servers.
* **Secure Document Viewing:** Uses responsive `<iframe>` integration to securely display UNCC Google Drive PDFs and MP4s directly within the UI.
* **Automated Data Mapping:** Maps raw Google Drive URLs to clean, user-friendly document titles for a premium user experience.

## Local Development

Because this application fetches data from an external API (Google Sheets), it cannot be run directly via the `file:///` protocol in modern browsers due to CORS (Cross-Origin Resource Sharing) restrictions. You must run it on a local server.

**Prerequisites:** Mac/Linux with Python 3 installed.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/shubhamsakharegem/stem-comm-demo.git](https://github.com/shubhamsakharegem/stem-comm-demo.git)
   cd stem-comm-demo
   ```
2. Start a local Python server:
```bash
python3 -m http.server 8000
View the application:
Open your browser and navigate to http://localhost:8000
```

## Content Management Guide
To update the website content, you do not need to edit the codebase. All content is driven by the Master Google Sheet.

* Adding a New File
  
  Upload fike in drive folder
  
  Open the connected Master Google Sheet.

  Add a new row.

  Copy paste the file from drive in 'Title' column

  Click on the 'STEM Library Tools' button to run the script, it will populate rest of the values

  The website will automatically pull the new file within a few minutes depending on Google's cache.

## Known Limitations
Website uses caching, to load latest content:
  In developer tools console tab, execute below command
  ```
  sessionStorage.clear()
  ```
  then hard refresh the page
  
