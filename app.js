// ==========================================
// 1. DATABASE URLs (Replace the Home & Events links once you make the new sheet tabs!)
// ==========================================
// ==========================================
// 1. DATABASE URLs 
// ==========================================
const HOME_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh_-hmulO3Kxhklijvzj-iaFz_3PcY7xfGThmwHRf59cl5ejTfFTj9H7BTye_8EAa_bqzmDQL4C4zS/pub?gid=1599744919&single=true&output=csv";

const EVENTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh_-hmulO3Kxhklijvzj-iaFz_3PcY7xfGThmwHRf59cl5ejTfFTj9H7BTye_8EAa_bqzmDQL4C4zS/pub?gid=14635706&single=true&output=csv";

const LIBRARY_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSwubYde99vMNyDvBPx1FoQL6rTQBUMa5EqhhYKPaCThsUdJIvGmiPsV9vUWuJZtJ8KFevz-8Cc5aqh/pub?gid=399989883&single=true&output=csv";

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
// 4. THE DATA ENGINE (Downloads & Caches)
// ==========================================
function fetchData(url, cacheKey, renderCallback) {
    // Safety check: If URL is missing, don't try to fetch
    if (url.includes("YOUR_")) {
        console.warn(`Waiting for real URL for ${cacheKey}`);
        return;
    }

    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
        console.log(`Loaded ${cacheKey} from Browser Cache!`);
        renderCallback(JSON.parse(cachedData));
    } else {
        console.log(`Fetching ${cacheKey} from Google...`);
        Papa.parse(url, {
            download: true,
            header: true,
            complete: function(results) {
                const data = results.data;
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
                renderCallback(data);
            }
        });
    }
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

// Render the Events Tab
function renderEventsView(data) {
    const grid = document.getElementById('events-grid');
    grid.innerHTML = ''; 

    data.forEach((row, index) => {
        if (!row.Event_Name) return; 

        const card = document.createElement('div');
        card.className = 'event-card'; 
        card.innerHTML = `
            <h3>${row.Event_Name}</h3>
            <p><strong>Date:</strong> ${row.Date_Time}</p>
            <p><strong>Location:</strong> ${row.Location}</p>
            <button id="btn-event-${index}">View Details</button>
        `;
        grid.appendChild(card);
        
        // Listen for the click and send the row data to our new page!
        document.getElementById(`btn-event-${index}`).addEventListener('click', () => {
            showEventDetails(row);
        });
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
// NEW: Render the specific Course Viewer Page
function showCourseDetails(targetCourse, fullData) {
    // 1. Hide all normal tabs
    document.querySelectorAll('.tab-view').forEach(view => {
        view.style.display = 'none';
    });
    
    // 2. Show just the course viewer container
    document.getElementById('view-course-details').style.display = 'block';

    // 3. Reset the viewer iframe (so the last viewed document doesn't show up)
    document.getElementById('empty-state').style.display = 'block';
    const iframe = document.getElementById('content-frame');
    iframe.style.display = 'none';
    iframe.src = "";

    // 4. Set the Sidebar Title
    document.getElementById('dynamic-course-title').innerText = targetCourse;

    // 5. Filter the spreadsheet data down to ONLY this specific course
    const courseData = fullData.filter(row => row.Course === targetCourse);
    
    // 6. Group files by Module
    const modules = {};
    courseData.forEach(row => {
        if (!modules[row.Module]) modules[row.Module] = [];
        modules[row.Module].push(row);
    });

    // 7. Build the Sidebar UI
    const container = document.getElementById('module-container');
    container.innerHTML = ''; // Clear previous course's sidebar
    
    for (const moduleName in modules) {
        const group = document.createElement('div');
        group.className = 'module-group';
        
        const title = document.createElement('div');
        title.className = 'module-title';
        title.innerText = moduleName;
        group.appendChild(title);

        modules[moduleName].forEach(file => {
            if (!file.Title) return; 

            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerText = file.Title;
            
            // Handle clicking a file in the sidebar
            item.onclick = () => {
                document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                
                document.getElementById('empty-state').style.display = 'none';
                iframe.style.display = 'block';
                iframe.src = file.Link; 
            };
            
            group.appendChild(item);
        });

        container.appendChild(group);
    }
}