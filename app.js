// ============================================================================
// 1. DATABASE URLs 
// ============================================================================
const EVENTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh_-hmulO3Kxhklijvzj-iaFz_3PcY7xfGThmwHRf59cl5ejTfFTj9H7BTye_8EAa_bqzmDQL4C4zS/pub?gid=14635706&single=true&output=csv";
const LIBRARY_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh_-hmulO3Kxhklijvzj-iaFz_3PcY7xfGThmwHRf59cl5ejTfFTj9H7BTye_8EAa_bqzmDQL4C4zS/pub?gid=399989883&single=true&output=csv";

// ============================================================================
// SCROLL ANIMATION OBSERVER (Auto-Applies to Home Content)
// ============================================================================
function initScrollAnimations() {
    // Automatically find all text elements on the home page and add the animation class
    const homeElements = document.querySelectorAll('.home-content-container h2, .home-content-container p, .home-content-container ul, .home-content-container blockquote, .home-content-container .table-responsive-wrapper');
    
    homeElements.forEach(el => {
        el.classList.add('scroll-animate');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: "0px 0px -20px 0px" // Triggers slightly before element enters view
    });

    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
}

// ============================================================================
// 2. INITIALIZATION & ROUTING
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('course.html')) {
        fetchData(LIBRARY_CSV_URL, 'stemLibraryData', buildCoursePage);
    } else {
        switchTab('home');
        // Small delay ensures DOM is ready before animating
        setTimeout(initScrollAnimations, 100); 
    }
});

// ============================================================================
// 3. TAB SWITCHER LOGIC 
// ============================================================================
function switchTab(tabName) {
    document.querySelectorAll('.tab-view').forEach(view => view.style.display = 'none');
    document.querySelectorAll('.tab-links button').forEach(btn => btn.classList.remove('active'));

    const selectedView = document.getElementById(`view-${tabName}`);
    const selectedBtn = document.getElementById(`btn-${tabName}`);
    
    if (selectedView) selectedView.style.display = 'block';
    if (selectedBtn) selectedBtn.classList.add('active');

    // Only fetch data for Events and Library. Home is hardcoded HTML now!
    if (tabName === 'events') {
        fetchData(EVENTS_CSV_URL, 'stemEventsData', renderEventsView);
    } else if (tabName === 'library') {
        fetchData(LIBRARY_CSV_URL, 'stemLibraryData', renderLibraryView);
    }
}

// ============================================================================
// 4. THE DATA ENGINE 
// ============================================================================
function fetchData(url, cacheKey, renderCallback) {
    if (url.includes("YOUR_")) return;

    fetch(url) 
        .then(response => {
            if (!response.ok) throw new Error("Google Sheets fetch failed");
            return response.text(); 
        })
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                complete: function(results) {
                    renderCallback(results.data);
                }
            });
        })
        .catch(error => console.error(`Error downloading data for ${cacheKey}:`, error));
}

// ============================================================================
// 5. RENDER LOGIC FOR EACH VIEW
// ============================================================================
function renderEventsView(data) {
    const grid = document.getElementById('events-grid');
    grid.innerHTML = ''; 

    data.forEach((row) => {
        if (!row.Event_Name) return; 

        const card = document.createElement('div');
        card.className = 'event-card'; 
        
        card.innerHTML = `
            <h3>${row.Event_Name}</h3>
            <p><strong>Date:</strong> ${row.Date_Time}</p>
            <p><strong>Location:</strong> ${row.Location}</p>
            <p class="click-details-text">Click to view details</p>
        `;
        
        card.addEventListener('click', () => showEventDetails(row));
        grid.appendChild(card);
    });
}

function showEventDetails(row) {
    document.querySelectorAll('.tab-view').forEach(view => view.style.display = 'none');
    document.getElementById('view-event-details').style.display = 'block';

    document.getElementById('detail-title').innerText = row.Event_Name;
    document.getElementById('detail-meta').innerHTML = `<strong>Date:</strong> ${row.Date_Time} &nbsp;|&nbsp; <strong>Location:</strong> ${row.Location} <br> <strong>Speaker(s):</strong> ${row.Speakers || 'TBA'}`;
    document.getElementById('detail-description').innerText = row.Description || 'No description provided.';
}

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
        
        card.addEventListener('click', () => showCourseDetails(courseName, data));
        grid.appendChild(card);
    });
}

// ============================================================================
// 6. COURSE VIEWER PAGE LOGIC
// ============================================================================
function getDownloadLink(url) {
    if (!url) return '#';
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
        return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
    }
    return url; 
}

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
    
    const folderLink = courseData[0].Course_Folder_Link;
    
    const downloadAllBtn = document.createElement('button');
    downloadAllBtn.className = 'download-all-btn';
    downloadAllBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download Full Course from Google Drive
    `;
    
    if (folderLink) {
        downloadAllBtn.onclick = () => window.open(folderLink, '_blank');
        container.appendChild(downloadAllBtn);
    }

    for (const moduleName in modules) {
        const group = document.createElement('div');
        group.className = 'module-group';
        
        const title = document.createElement('div');
        title.className = 'module-title';
        title.innerText = moduleName;
        group.appendChild(title);

        modules[moduleName].forEach(file => {
            if (!file.Title) return; 

            const itemBox = document.createElement('div');
            itemBox.className = 'file-item';

            const titleText = document.createElement('span');
            titleText.className = 'file-title';
            titleText.innerText = file.Title;

            const dlBtn = document.createElement('a');
            dlBtn.href = getDownloadLink(file.Link);
            dlBtn.className = 'download-icon-btn';
            dlBtn.target = '_blank';
            dlBtn.title = "Download this file";
            dlBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;

            itemBox.onclick = (e) => {
                if(e.target.closest('.download-icon-btn')) return;

                document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
                itemBox.classList.add('active');
                document.getElementById('empty-state').style.display = 'none';
                iframe.style.display = 'block';
                iframe.src = file.Link; 

                if (window.innerWidth < 768) {
                    document.querySelector('.viewer-pane').scrollIntoView({ behavior: 'smooth' });
                }
            };

            itemBox.appendChild(titleText);
            itemBox.appendChild(dlBtn);
            group.appendChild(itemBox);
        });
        container.appendChild(group);
    }
}