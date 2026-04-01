// ==========================================
// 1. DATABASE URLs (Replace the Home & Events links once you make the new sheet tabs!)
// ==========================================
// ==========================================
// 1. DATABASE URLs 
// ==========================================
const HOME_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh_-hmulO3Kxhklijvzj-iaFz_3PcY7xfGThmwHRf59cl5ejTfFTj9H7BTye_8EAa_bqzmDQL4C4zS/pub?gid=1599744919&single=true&output=csv";

const EVENTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh_-hmulO3Kxhklijvzj-iaFz_3PcY7xfGThmwHRf59cl5ejTfFTj9H7BTye_8EAa_bqzmDQL4C4zS/pub?gid=14635706&single=true&output=csv";

const LIBRARY_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh_-hmulO3Kxhklijvzj-iaFz_3PcY7xfGThmwHRf59cl5ejTfFTj9H7BTye_8EAa_bqzmDQL4C4zS/pub?gid=399989883&single=true&output=csv";

// ==========================================
// 2. INITIALIZATION & ROUTING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Check if we are on the course viewer page (course.html)
    if (path.includes('course.html')) {
        // Only load the library data to build the sidebar
        fetchData(LIBRARY_CSV_URL, 'stemLibraryData', buildCoursePage);
    } 
    // Otherwise, we are on the Main Portal (index.html)
    else {
        // Default to showing the Home tab
        switchTab('home');
    }
});


// ==========================================
// 3. TAB SWITCHER LOGIC (For index.html)
// ==========================================
function switchTab(tabName) {
    // Hide all view containers
    document.querySelectorAll('.tab-view').forEach(view => {
        view.style.display = 'none';
    });
    
    // Remove 'active' styling from all buttons
    document.querySelectorAll('.tab-links button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show the selected view and highlight the button
    const selectedView = document.getElementById(`view-${tabName}`);
    const selectedBtn = document.getElementById(`btn-${tabName}`);
    
    if (selectedView) selectedView.style.display = 'block';
    if (selectedBtn) selectedBtn.classList.add('active');

    // Fetch the correct data based on the tab clicked
    if (tabName === 'home') {
        fetchData(HOME_CSV_URL, 'stemHomeData', renderHomeView);
    } else if (tabName === 'events') {
        fetchData(EVENTS_CSV_URL, 'stemEventsData', renderEventsView);
    } else if (tabName === 'library') {
        fetchData(LIBRARY_CSV_URL, 'stemLibraryData', renderLibraryView);
    }
}

// ==========================================
// 4. THE DATA ENGINE (No Caching)
// ==========================================
function fetchData(url, cacheKey, renderCallback) {
    // Safety check for placeholder URLs
    if (url.includes("YOUR_")) return;

    console.log(`Fetching fresh data from Google for: ${cacheKey}...`);

    // Fetch fresh data every time, forcing the browser to ignore its local disk cache
    fetch(url, { cache: "no-store" }) 
        .then(response => {
            if (!response.ok) throw new Error("Google Sheets fetch failed");
            return response.text(); 
        })
        .then(csvText => {
            // Hand the raw text straight to PapaParse
            Papa.parse(csvText, {
                header: true,
                complete: function(results) {
                    // Immediately render the freshly parsed data (no saving to memory)
                    renderCallback(results.data);
                }
            });
        })
        .catch(error => {
            console.error(`Error downloading data for ${cacheKey}:`, error);
        });
}

// ==========================================
// 5. RENDER LOGIC FOR EACH VIEW
// ==========================================

// Render the Home Tab
function renderHomeView(data) {
    const missionTitle = document.getElementById('home-mission-title');
    const missionText = document.getElementById('home-mission-text');

    data.forEach(row => {
        // Because you only have one row for the homepage text right now
        if (row.Section && row.Text_Content) {
            
            // 1. Set the Title (e.g., "STEM Communication Training")
            missionTitle.innerText = row.Section;
            
            // 2. Set the Paragraph Text
            missionText.innerHTML = `<p>${row.Text_Content}</p>`;
            
        }
    });
}

// Render the Events Tab (Updated for Clickable Cards)
function renderEventsView(data) {
    const grid = document.getElementById('events-grid');
    grid.innerHTML = ''; 

    data.forEach((row, index) => {
        if (!row.Event_Name) return; 

        // 1. Create the card container
        const card = document.createElement('div');
        card.className = 'event-card'; 
        
        // 2. NEW HTML structure: Remove button, add "Click to view details" text
        card.innerHTML = `
            <h3>${row.Event_Name}</h3>
            <p><strong>Date:</strong> ${row.Date_Time}</p>
            <p><strong>Location:</strong> ${row.Location}</p>
            <p class="click-details-text">Click to view details</p>
        `;
        
        // 3. Attach click listener to the WHOLE card
        card.addEventListener('click', () => {
            showEventDetails(row);
        });
        
        grid.appendChild(card);
    });
}

// Render the specific Event Details Page (Text Only)
function showEventDetails(row) {
    // Hide all normal tabs
    document.querySelectorAll('.tab-view').forEach(view => {
        view.style.display = 'none';
    });
    // Show just the event details container
    document.getElementById('view-event-details').style.display = 'block';

    // Inject the data from the spreadsheet into the HTML
    document.getElementById('detail-title').innerText = row.Event_Name;
    document.getElementById('detail-meta').innerHTML = `<strong>Date:</strong> ${row.Date_Time} &nbsp;|&nbsp; <strong>Location:</strong> ${row.Location} <br> <strong>Speaker(s):</strong> ${row.Speakers || 'TBA'}`;
    document.getElementById('detail-description').innerText = row.Description || 'No description provided.';
}

// Render the Course Library Tab (The Grid)
function renderLibraryView(data) {
    const grid = document.getElementById('course-grid');
    grid.innerHTML = ''; 

    const uniqueCourses = [...new Set(data.map(row => row.Course).filter(Boolean))];

    uniqueCourses.forEach(courseName => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
            <h2>${courseName}</h2>
            <p>Click to view modules and resources.</p>
        `;
        
        // Listen for the click and open the new viewer view!
        card.addEventListener('click', () => {
            showCourseDetails(courseName, data);
        });
        
        grid.appendChild(card);
    });
}

// ==========================================
// 6. COURSE VIEWER PAGE LOGIC (course.html)
// ==========================================
// Helper to convert G-Drive viewer links to direct download links
function getDownloadLink(url) {
    if (!url) return '#';
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
        return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
    }
    return url; 
}

// Render the specific Course Viewer Page
function showCourseDetails(targetCourse, fullData) {
    document.querySelectorAll('.tab-view').forEach(view => view.style.display = 'none');
    document.getElementById('view-course-details').style.display = 'block';

    document.getElementById('empty-state').style.display = 'block';
    const iframe = document.getElementById('content-frame');
    iframe.style.display = 'none';
    iframe.src = "";

    document.getElementById('dynamic-course-title').innerText = targetCourse;

    const courseData = fullData.filter(row => row.Course === targetCourse);
    
    const modules = {};
    courseData.forEach(row => {
        if (!modules[row.Module]) modules[row.Module] = [];
        modules[row.Module].push(row);
    });

    const container = document.getElementById('module-container');
    container.innerHTML = ''; 
    
    // NEW: Let's peek at exactly what the browser sees!
    console.log("Here is the first row of data:", courseData[0]);

    const folderLink = courseData[0].Course_Folder_Link;

   // --- NEW: "Download All" Button (With SVG Icon) ---
    const downloadAllBtn = document.createElement('button');
    downloadAllBtn.className = 'download-all-btn';
    
    // Using innerHTML to inject a professional SVG right next to the text
    downloadAllBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download Full Course from Google Drive
    `;
    
    downloadAllBtn.onclick = () => {
        const folderLink = courseData[0].Course_Folder_Link;

        if (folderLink) {
            downloadAllBtn.onclick = () => {
                window.open(folderLink, '_blank');
            };
        } else {
            // Fallback just in case they forgot to add a folder link in the spreadsheet
            downloadAllBtn.style.display = 'none'; 
        }
    };
    container.appendChild(downloadAllBtn);

    // --- Generate Modules and Individual Files ---
    for (const moduleName in modules) {
        const group = document.createElement('div');
        group.className = 'module-group';
        
        const title = document.createElement('div');
        title.className = 'module-title';
        title.innerText = moduleName;
        group.appendChild(title);

        modules[moduleName].forEach(file => {
            if (!file.Title) return; 

            // 1. The main container box (This is now the clickable area)
            const itemBox = document.createElement('div');
            itemBox.className = 'file-item';

            // 2. The Title Text
            const titleText = document.createElement('span');
            titleText.className = 'file-title';
            titleText.innerText = file.Title;

            // 3. The Professional SVG Download Button
            const dlBtn = document.createElement('a');
            dlBtn.href = getDownloadLink(file.Link);
            dlBtn.className = 'download-icon-btn';
            dlBtn.target = '_blank';
            dlBtn.title = "Download this file";
            // Professional Cloud Download SVG
            dlBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;

            // 4. Handle clicking the box to view the file
            itemBox.onclick = (e) => {
                // IMPORTANT: If they clicked the download button, don't load the iframe!
                if(e.target.closest('.download-icon-btn')) return;

                document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
                itemBox.classList.add('active');
                document.getElementById('empty-state').style.display = 'none';
                iframe.style.display = 'block';
                iframe.src = file.Link; 

                // Inside your itemBox.onclick in app.js
                if (window.innerWidth < 768) {
                    document.querySelector('.viewer-pane').scrollIntoView({ behavior: 'smooth' });
                }
            };

            // 5. Put both the title and button INSIDE the box
            itemBox.appendChild(titleText);
            itemBox.appendChild(dlBtn);
            group.appendChild(itemBox);
        });

        container.appendChild(group);
    }
}