const coursesNotice = document.getElementById('coursesNotice');
const coursesGrid = document.getElementById('coursesGrid');
let loadedCourses = [];

function setCoursesNotice(message = '', type = 'info') {
    if (!coursesNotice) return;
    if (!message) {
        coursesNotice.style.display = 'none';
        return;
    }
    coursesNotice.textContent = message;
    coursesNotice.style.display = 'block';
    coursesNotice.style.background = type === 'error' ? '#fef2f2' : '#ecfdf5';
    coursesNotice.style.color = type === 'error' ? '#991b1b' : '#166534';
    coursesNotice.style.border = type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0';
}

function renderCourses(courses) {
    if (!courses || !courses.length) {
        coursesGrid.innerHTML = `
            <div class="placeholder-box" style="grid-column: 1/-1;">
                No courses available right now.
            </div>
        `;
        return;
    }

    coursesGrid.innerHTML = courses.map(course => `
        <div class="card course-card">
            <h3>${course.title}</h3>
            <p class="course-meta">${course.provider} • ${course.category || 'General'}</p>
            <p>${course.description || 'No description available.'}</p>
            <a href="${course.url || '#'}" target="_blank" class="btn btn-outline">View Course</a>
        </div>
    `).join('');
}

function filterCourses(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized || normalized === 'all categories') {
        renderCourses(loadedCourses);
        return;
    }

    const filtered = loadedCourses.filter(course => {
        const title = (course.title || '').toLowerCase();
        const provider = (course.provider || '').toLowerCase();
        const category = (course.category || '').toLowerCase();
        return title.includes(normalized) || provider.includes(normalized) || category.includes(normalized);
    });
    renderCourses(filtered);
}

async function checkSession() {
    try {
        const response = await fetch('../Backend/SessionCheck.php', {credentials: 'include'});
        if (!response.ok) throw new Error('Session check failed');
        const data = await response.json();
        if (!data.logged_in) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error(error);
        setCoursesNotice('Unable to verify session. Please login again.', 'error');
    }
}

async function loadCourses() {
    setCoursesNotice('Loading courses...', 'info');
    try {
        const response = await fetch('../Backend/Getcourses.php', {credentials: 'include'});
        if (!response.ok) throw new Error('Unable to load courses');
        const data = await response.json();

        if (data.error) {
            setCoursesNotice(data.error, 'error');
            return;
        }

        loadedCourses = data.courses || [];
        renderCourses(loadedCourses);
        setCoursesNotice('', 'info');
    } catch (error) {
        console.error(error);
        setCoursesNotice('Unable to load course recommendations.', 'error');
        renderCourses([]);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    loadCourses();

    const filterInput = document.querySelector('.filter-input');
    const filterSelect = document.querySelector('.filter-select');

    if (filterInput) {
        filterInput.addEventListener('input', function(e) {
            filterCourses(e.target.value);
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', function(e) {
            filterCourses(e.target.value);
        });
    }

    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.href.includes('courses.html')) {
            link.classList.add('active');
        }
    });
});
