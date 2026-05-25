const BASE_URL = "../Backend/";

const skillGapNotice = document.getElementById('skillGapNotice');

function setSkillGapNotice(message = '', type = 'info') {
    if (!skillGapNotice) return;

    if (!message) {
        skillGapNotice.style.display = 'none';
        return;
    }

    skillGapNotice.textContent = message;
    skillGapNotice.style.display = 'block';
    skillGapNotice.style.background = type === 'error' ? '#fef2f2' : '#ecfdf5';
    skillGapNotice.style.color = type === 'error' ? '#991b1b' : '#166534';
    skillGapNotice.style.border = type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0';
}

async function checkSession(){
    try {
        const response = await fetch(BASE_URL + "SessionCheck.php",{
            credentials: 'include'
        });

        if (!response.ok) throw new Error("Session API failed");

        const data = await response.json();

        if (!data.logged_in) {
            window.location.href = 'login.html';
        }

    } catch (error) {
        console.error("Session error:", error);
        setSkillGapNotice('Session expired. Please login again.', 'error');
    }
}

function renderSkillGap(skillGap){
    const currentSkills = document.getElementById('currentSkills');
    const requiredSkills = document.getElementById('requiredSkills');

    if (!currentSkills || !requiredSkills) return;

    if (!Array.isArray(skillGap) || skillGap.length === 0) {
        currentSkills.innerHTML = `
            <div class="placeholder-box">
                No skill data available. Complete a test first.
            </div>
        `;
        requiredSkills.innerHTML = `
            <div class="placeholder-box">
                No skill gap data available.
            </div>
        `;

        document.getElementById('skillsMatched').textContent = '0';
        document.getElementById('skillsGap').textContent = '0';
        document.getElementById('readinessPercent').textContent = '0%';
        return;
    }

    const matchedSkills = skillGap.filter(skill => Number(skill.percentage) >= 50);
    const gapSkills = skillGap.filter(skill => Number(skill.percentage) < 50);

    // Current Skills
    currentSkills.innerHTML = matchedSkills.length ? matchedSkills.map(skill => `
        <div class="skill-item ${skill.status || ''}">
            <div>
                <strong>${skill.skill_name}</strong>
                <p>${
                    skill.status === 'strong' ? 'Strong skill' :
                    skill.status === 'average' ? 'Moderate skill' :
                    'Developing'
                }</p>
            </div>
            <span>${skill.percentage}%</span>
        </div>
    `).join('') : `
        <div class="placeholder-box">
            No strong skills yet. Take a test first.
        </div>
    `;

    // Required Skills (Gap)
    requiredSkills.innerHTML = gapSkills.length ? gapSkills.map(skill => `
        <div class="skill-item ${skill.status || ''}">
            <div>
                <strong>${skill.skill_name}</strong>
                <p>Needs improvement</p>
            </div>
            <span>${skill.percentage}%</span>
        </div>
    `).join('') : `
        <div class="placeholder-box">
            No major skill gaps. Good job!
        </div>
    `;

    // Summary
    document.getElementById('skillsMatched').textContent = matchedSkills.length;
    document.getElementById('skillsGap').textContent = gapSkills.length;

    const avg = Math.round(
        skillGap.reduce((sum, s) => sum + Number(s.percentage || 0), 0) / skillGap.length
    );

    document.getElementById('readinessPercent').textContent = avg + '%';
}

async function loadSkillGap(){
    setSkillGapNotice('Loading skill gap...', 'info');

    try {
        const response = await fetch(BASE_URL + "Getskillgap.php",{
            credentials: 'include'
        });

        if (!response.ok) throw new Error("API error");

        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error("Invalid JSON: " + text);
        }

        if (data.error) {
            setSkillGapNotice(data.error, 'error');
            return;
        }

        renderSkillGap(data.skill_gap);
        setSkillGapNotice('');

    } catch (error) {
        console.error("Skill gap error:", error);
        setSkillGapNotice('Failed to load skill gap. Check backend.', 'error');
    }
}

// INIT
document.addEventListener('DOMContentLoaded', function () {
    checkSession();
    loadSkillGap();

    document.querySelectorAll('.sidebar-nav a').forEach(link =>{
        if (link.href.includes('skill-gap.html')) {
            link.classList.add('active');
        }
    });
});