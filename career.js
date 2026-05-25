const BASE_URL = "../Backend/";

const careerNotice = document.getElementById('careerNotice');

function setCareerNotice(message = '', type = 'info') {
    if (!careerNotice) return;

    if (!message) {
        careerNotice.style.display = 'none';
        return;
    }

    careerNotice.textContent = message;
    careerNotice.style.display = 'block';
    careerNotice.style.background = type === 'error' ? '#fef2f2' : '#ecfdf5';
    careerNotice.style.color = type === 'error' ? '#991b1b' : '#166534';
    careerNotice.style.border = type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0';
}

async function checkSession() {
    try {
        const response = await fetch(BASE_URL + "SessionCheck.php", {
            credentials: 'include'
        });

        if (!response.ok) throw new Error("Session check failed");

        const data = await response.json();

        if (!data.logged_in) {
            window.location.href = 'login.html';
        }

    } catch (error) {
        console.error("Session error:", error);
        setCareerNotice('Session expired. Please login again.', 'error');
    }
}

function renderCareers(careers) {
    const container = document.getElementById('careerContainer');

    if (!container) return;

    if (!Array.isArray(careers) || careers.length === 0) {
        container.innerHTML = `
            <div class="placeholder-box" style="grid-column: 1/-1;">
                No career recommendations available.
            </div>
        `;
        return;
    }

    container.innerHTML = careers.map(c => `
        <div class="card career-card">
            <h3 class="career-title">${c.career_name || 'Career'}</h3>
            <p class="career-match">🎯 Career Match</p>
            <p class="career-skills">${c.description || 'No description available.'}</p>
            <div class="career-skill-tags">
                ${(c.required_skills || '').split(',').map(skill => `
                    <span class="skill-tag">${skill.trim()}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

async function loadCareers() {
    setCareerNotice('Loading career recommendations...', 'info');

    try {
        const response = await fetch(BASE_URL + "Getcareers.php", {
            credentials: 'include'
        });

        if (!response.ok) throw new Error("Failed to fetch careers");

        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error("Invalid JSON: " + text);
        }

        if (data.error) {
            setCareerNotice(data.error, 'error');
            return;
        }

        renderCareers(data.careers);
        setCareerNotice('');

    } catch (error) {
        console.error("Career load error:", error);
        setCareerNotice('Unable to load careers. Please try again.', 'error');

        const container = document.getElementById('careerContainer');
        if (container) {
            container.innerHTML = `
                <div class="placeholder-box" style="grid-column: 1/-1;">
                    Error loading careers. Please refresh.
                </div>
            `;
        }
    }
}

// INIT
document.addEventListener('DOMContentLoaded', function () {
    checkSession();
    loadCareers();

    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.href.includes('career.html')) {
            link.classList.add('active');
        }
    });
});