const profileNotice = document.getElementById('profileNotice');

function setProfileNotice(message = '', type = 'info') {
    if (!profileNotice) return;
    if (!message) {
        profileNotice.style.display = 'none';
        return;
    }
    profileNotice.textContent = message;
    profileNotice.style.display = 'block';
    profileNotice.style.background = type === 'error' ? '#fef2f2' : '#ecfdf5';
    profileNotice.style.color = type === 'error' ? '#991b1b' : '#166534';
    profileNotice.style.border = type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0';
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
        setProfileNotice('Unable to verify session. Please log in again.', 'error');
    }
}

async function loadProfileData() {
    setProfileNotice('Loading profile information...', 'info');
    try {
        const response = await fetch('../Backend/Getprofile.php', {credentials: 'include'});
        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();

        if (data.error) {
            setProfileNotice(data.error, 'error');
            return;
        }

        const user = data.user || {};
        document.getElementById('profileName').textContent = user.name || '—';
        document.getElementById('profileEmail').textContent = user.email || '—';
        document.getElementById('infoEmail').textContent = user.email || '—';
        document.getElementById('infoCGPA').textContent = user.cgpa ?? '—';
        document.getElementById('memberSince').textContent = user.created_at ? new Date(user.created_at).toLocaleDateString() : '—';

        const completion = user.cgpa ? Math.min(100, Math.round((user.cgpa / 10) * 100)) : 0;
        document.getElementById('profileCompletion').textContent = `${completion}%`;
        setProfileNotice('', 'info');
    } catch (error) {
        console.error(error);
        setProfileNotice('Unable to load profile. Please refresh the page.', 'error');
    }
}

async function loadSkills() {
    try {
        const response = await fetch('../Backend/Getskillgap.php', {credentials: 'include'});
        if (!response.ok) throw new Error('Failed to fetch skills');
        const data = await response.json();

        const skillsList = document.getElementById('skillsList');

        if (data.error || !Array.isArray(data.skill_gap) || data.skill_gap.length === 0) {
            skillsList.innerHTML = `
                <div class="placeholder-box">
                    Skills will appear here once you complete assessments.
                </div>
            `;
            return;
        }

        skillsList.innerHTML = data.skill_gap.slice(0, 6).map(skill => `
            <div class="skill-item ${skill.status}">
                <div>
                    <strong>${skill.skill_name}</strong>
                    <p>${skill.message}</p>
                </div>
                <span>${skill.percentage}%</span>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        const skillsList = document.getElementById('skillsList');
        skillsList.innerHTML = `
            <div class="placeholder-box">
                Unable to load skills. Please try again later.
            </div>
        `;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    loadProfileData();
    loadSkills();

    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.href.includes('profile.html')) {
            link.classList.add('active');
        }
    });
});
