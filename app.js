// app.js
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSwubYde99vMNyDvBPx1FoQL6rTQBUMa5EqhhYKPaCThsUdJIvGmiPsV9vUWuJZtJ8KFevz-8Cc5aqh/pub?gid=399989883&single=true&output=csv";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if we already downloaded the data this session!
    const cachedData = sessionStorage.getItem('stemLibraryData');

    if (cachedData) {
        console.log("Loaded instantly from Browser Cache!");
        routePage(JSON.parse(cachedData));
    } else {
        console.log("First visit: Fetching from Google...");
        Papa.parse(SHEET_URL, {
            download: true,
            header: true,
            complete: function(results) {
                const data = results.data;
                // Save it to the browser's memory for next time
                sessionStorage.setItem('stemLibraryData', JSON.stringify(data));
                routePage(data);
            }
        });
    }
});

// 2. Traffic Controller: Which page are we on?
function routePage(data) {
    const path = window.location.pathname;
    
    // If we are specifically on the course viewer page
    if (path.includes('course.html')) {
        buildCoursePage(data);
    } 
    // Otherwise, default to the homepage layout
    else {
        buildHomePage(data);
    }
}

// 3. Logic for the Homepage (index.html)
function buildHomePage(data) {
    const grid = document.getElementById('course-grid');
    grid.innerHTML = ''; // clear loading text

    // Find all unique courses in the spreadsheet
    const uniqueCourses = [...new Set(data.map(row => row.Course).filter(Boolean))];

    uniqueCourses.forEach(courseName => {
        // Build the URL parameter (e.g., course.html?name=Effective+STEM)
        const encodedName = encodeURIComponent(courseName);
        
        const card = document.createElement('a');
        card.href = `course.html?name=${encodedName}`;
        card.className = 'course-card';
        card.innerHTML = `
            <h2>${courseName}</h2>
            <p>Click to view modules and resources.</p>
        `;
        grid.appendChild(card);
    });
}

// 4. Logic for the Viewer Page (course.html)
function buildCoursePage(data) {
    // Grab the course name from the URL (e.g., ?name=Effective+STEM)
    const urlParams = new URLSearchParams(window.location.search);
    const targetCourse = urlParams.get('name');

    if (!targetCourse) {
        document.getElementById('dynamic-course-title').innerText = "Course Not Found";
        return;
    }

    // Set the Sidebar Title
    document.getElementById('dynamic-course-title').innerText = targetCourse;

    // Filter the spreadsheet data down to ONLY this specific course
    const courseData = data.filter(row => row.Course === targetCourse);
    
    // Group files by Module (Week 1, Week 2, etc.)
    const modules = {};
    courseData.forEach(row => {
        if (!modules[row.Module]) modules[row.Module] = [];
        modules[row.Module].push(row);
    });

    // Build the Sidebar UI
    const container = document.getElementById('module-container');
    
    for (const moduleName in modules) {
        const group = document.createElement('div');
        group.className = 'module-group';
        
        const title = document.createElement('div');
        title.className = 'module-title';
        title.innerText = moduleName;
        group.appendChild(title);

        modules[moduleName].forEach(file => {
            if (!file.Title) return; // Skip empty rows

            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerText = file.Title;
            
            // Handle clicking a file
            item.onclick = () => {
                // 1. THIS IS THE DEBUG LINE WE ARE ADDING
                console.log("Button Clicked! Here is the data:", file); 

                document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                document.getElementById('empty-state').style.display = 'none';
                document.getElementById('content-frame').style.display = 'block';
                
                // 2. CHECK THIS LINE BELOW
                document.getElementById('content-frame').src = file.Link; 
            };
            
            group.appendChild(item);
        });

        container.appendChild(group);
    }
}