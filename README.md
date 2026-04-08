# 🎓 UNCC CGLL STEM Communication Training Portal

Welcome to the documentation for the STEM Communication Training Portal! This website was developed for the Center for Graduate Life and Learning (CGLL) at the University of North Carolina at Charlotte to support the NSF-funded STEM communication training program.

**Live Website:** [https://uncc-cgll-stem-comm.github.io/stem-comm-portal/](https://uncc-cgll-stem-comm.github.io/stem-comm-portal/)

---

## How to Update the Website Content

This website is designed to be easy to maintain for non-technical users. There are two different ways to update content, depending on which part of the website you want to change.

### Part 1: Updating the "Events" and "Course Library" Tabs
You do not need to touch any website code or format any web links to update these tabs! We have built a custom automation script inside Google Sheets that does the hard work for you.

**Step-by-step:**
1. Open our shared **Google Drive folder** and find the file or `.zip` folder you want to add to the website. Make sure the file's sharing settings are set to *"Anyone with the link can view"*.
2. Click on the file once to select it, and copy it (Press `Ctrl+C` on Windows or `Cmd+C` on Mac).
3. Open the **STEM Website Database** Google Sheet.
4. At the bottom of the screen, click on either the **Events** or **Library** tab.
5. Find an empty row and click on the empty cell in **Column C (Title)**.
6. Paste your copied file into that cell (Press `Ctrl+V` or `Cmd+V`). 
7. Click the ** ⚙️ Run STEM Script** button located on the spreadsheet. 
8. **Wait a few seconds:** The script will automatically pull the file's data from Google Drive and fill in all the other columns (like the links, IDs, and correct download formats) for you!

**The 5-Minute Rule (Important!):**
When you add a new row and run the script, **it will not show up on the website instantly.** Google requires about 5 minutes to process and publish changes from spreadsheets to the web. If you run the script and don't see the file on the website right away, simply wait 5 to 10 minutes, refresh the website, and your new content will appear!

### Part 2: Updating the "Home" Tab
The text on the Home page (About the Program, Course Schedule, etc.) is written directly into the website's code. To change it, you will need to edit a file right here on GitHub. 

**Step-by-step:**
1. Go to the main page of this GitHub repository.
2. Click on the file named `index.html`.
3. In the top right corner of the file box, click the **Pencil icon** (✏️) to edit the file.
4. Scroll down (or press `Ctrl+F` / `Cmd+F` to search) until you find the text you want to change. 
5. **Important:** Only change the normal readable text. Be careful not to delete the code tags wrapped in brackets around the text (like `<p>`, `<h2>`, or `<strong>`), as these control the formatting!
6. Once you have made your changes, click the green **Commit changes...** button at the top right. 
7. Add a brief description of what you changed (e.g., "Updated course dates on home page") and click **Commit changes** again.
8. The website will automatically rebuild and update in about 1-2 minutes!

---

## How the Website Works (The Big Picture)
This website is built to be fast, free to host, and easy to maintain without needing a complex backend server. It relies on three connected tools:

1. **GitHub (The Code & Hosting):** This is where the website's HTML, CSS, and JavaScript live. GitHub Pages automatically hosts the website for free.
2. **Google Sheets (The Database):** The "Events" and "Course Library" tabs pull their information directly from a published Google Spreadsheet.
3. **Google Drive (The File Storage):** All PDFs, documents, and downloadable course `.zip` files are stored securely in a shared Google Drive folder and linked to the website.

---

## Design System & Interactive Features

This portal was custom-coded to feel modern and interactive while strictly adhering to the university's official branding guidelines. 

### UNCC Design Language
* **Official Color Palette:** The site relies heavily on CSS variables to maintain exact brand matches, specifically **UNCC Green (`#005035`)** for primary headers and interactive elements, and **UNCC Gold (`#a49665`)** for accents.
* **Academic Typography:** The site uses clean, sans-serif system fonts (like Segoe UI) to ensure high readability and a professional, academic aesthetic across all devices.
* **Spacious Layouts:** Sections utilize generous padding, blockquotes with thick green borders, and custom-styled data tables with rounded corners (`border-radius: 8px`) and subtle drop shadows (`box-shadow`) to prevent the screen from feeling cluttered.

### Animations & Interactive Elements
* **Smooth Scrolling:** When navigating on a mobile device, clicking a document in the library triggers a smooth, animated scroll (`scrollIntoView({ behavior: 'smooth' })`) directly down to the document viewer, ensuring users never get lost on the page.
* **Active States & Hover Effects:** The Course Library sidebar features interactive "Active States." When a file is clicked, it visually highlights to show it is currently open, while other files fade slightly. Buttons and links also feature subtle hover animations to improve accessibility and user experience.
* **Dynamic Tab Switching:** Navigating between the Home, Events, and Course Library tabs is handled instantly via JavaScript without requiring the page to reload, creating a seamless, app-like experience.

---

## Managing Files & Downloads

### Interactive Course Viewer
The "Course Library" tab features an interactive document viewer. When a user clicks a file, it loads directly on the screen inside a frame, allowing them to read documents without downloading them. Each individual file also has a dedicated download button.

---

## Developer Notes (For Future Admins)

* **Hosting:** The site is hosted on GitHub Pages via the independent `uncc-cgll-stem-comm` organization. 
* **Styles:** All CSS is located in `style.css`. We avoid inline CSS where possible, utilizing classes like `.custom-table` for UI consistency.
* **JavaScript:** The logic for fetching the CSV data from Google Sheets, building the DOM elements, handling tab switching, and managing the document viewer is contained in `app.js`.
* **Repository Ownership:** The repository is owned by the UNCC CGLL GitHub Organization to ensure continuity when students graduate. Ensure at least one permanent UNCC staff member has "Owner" rights to this GitHub Organization.
