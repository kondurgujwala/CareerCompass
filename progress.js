const BASE_URL = "../Backend/";

const progressNotice = document.getElementById('progressNotice');

function setProgressNotice(message = '', type = 'info') {
    if (!progressNotice) return;
    if (!message) {
        progressNotice.style.display = 'none';
        return;
    }
    progressNotice.textContent = message;
    progressNotice.style.display = 'block';
    progressNotice.style.background = type === 'error' ? '#fef2f2' : '#ecfdf5';
    progressNotice.style.color = type === 'error' ? '#991b1b' : '#166534';
    progressNotice.style.border = type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0';
}

async function checkSession() {
    try {
        const response = await fetch(BASE_URL + "SessionCheck.php", {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Session check failed');
        const data = await response.json();
        if (!data.logged_in) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error(error);
        setProgressNotice('Unable to verify session. Please login again.', 'error');
    }
}

function renderProgressChart(attempts) {
    const chartPlaceholder = document.querySelector('.chart-placeholder');
    if (!attempts || !attempts.length) {
        chartPlaceholder.innerHTML = `
            <div class="placeholder-box">
                Progress chart will load once you complete a test.
            </div>
        `;
        return;
    }

    const chartHtml = attempts.map(attempt => `
        <div class="progress-row">
            <span>Attempt ${attempt.attempt_id}</span>
            <strong>${attempt.percentage}%</strong>
        </div>
    `).join('');

    chartPlaceholder.innerHTML = `
        <div class="chart-list">${chartHtml}</div>
    `;
}

function renderSkillProgress(skills) {
    const container = document.getElementById('skillsProgressContainer');
    if (!skills || !skills.length) {
        container.innerHTML = `
            <div class="placeholder-box">
                Skills progress will appear after you complete assessments.
            </div>
        `;
        return;
    }

    container.innerHTML = skills.map(skill => `
        <div class="skill-progress-item">
            <div class="skill-progress-header">
                <span>${skill.skill_name}</span>
                <strong>${skill.percentage}%</strong>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${skill.percentage}%;"></div>
            </div>
        </div>
    `).join('');
}

function renderActivity(attempts) {
    const activityList = document.getElementById('activityList');
    if (!attempts || !attempts.length) {
        activityList.innerHTML = `
            <div class="placeholder-box">
                No recent activity. Start an assessment to see updates.
            </div>
        `;
        return;
    }

    activityList.innerHTML = attempts.slice(-5).reverse().map(attempt => `
        <div class="activity-item">
            <div>
                <strong>Attempt #${attempt.attempt_id}</strong>
                <p>${attempt.percentage}% score</p>
            </div>
            <span>${new Date(attempt.attempt_date).toLocaleDateString()}</span>
        </div>
    `).join('');
}

async function loadProgressData() {
    setProgressNotice('Loading progress data...', 'info');
    try {
        const response = await fetch(BASE_URL + 'Getprogress.php', {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to load progress data');
        const data = await response.json();

        if (data.error) {
            setProgressNotice(data.error, 'error');
            return;
        }

        const attempts = data.attempts || [];
        const skills = data.skill_progress || [];

        document.getElementById('testsCompleted').textContent = attempts.length || 0;
        document.getElementById('skillsCovered').textContent = skills.length || 0;

        const average = attempts.length
            ? `${Math.round(attempts.reduce((sum, item) => sum + Number(item.percentage), 0) / attempts.length)}%`
            : '—';
        document.getElementById('avgScore').textContent = average;

        renderProgressChart(attempts);
        renderSkillProgress(skills);
        renderActivity(attempts);
        setProgressNotice('', 'info');
    } catch (error) {
        console.error(error);
        setProgressNotice('Unable to load progress data. Please refresh.', 'error');
        renderProgressChart([]);
        renderSkillProgress([]);
        renderActivity([]);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    loadProgressData();

    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.href.includes('progress.html')) {
            link.classList.add('active');
        }
    });
});
