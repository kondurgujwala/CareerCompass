const BASE_URL = "../Backend/";

document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    loadDashboard();
});

async function checkSession() {
    try {
        const res = await fetch(BASE_URL + "SessionCheck.php", {
            credentials: "include"
        });
        const data = await res.json();

        if (!data.logged_in) {
            window.location.href = "login.html";
        }
    } catch (err) {
        window.location.href = "login.html";
    }
}

async function loadDashboard() {
    try {
        const res = await fetch(BASE_URL + "Getdashboard.php", {
            credentials: "include"
        });
        const data = await res.json();

        if (data.error) return;

        const stats = data.stats || {};

        document.querySelectorAll('.stat-value')[0].innerText = stats.total_attempts || 0;
        document.querySelectorAll('.stat-value')[1].innerText = (stats.avg_score ? stats.avg_score : 0) + "%";
        document.querySelectorAll('.stat-value')[2].innerText = data.recent_attempts?.length || 0;
        document.querySelectorAll('.stat-value')[3].innerText = data.recent_attempts?.length || 0;

        const activityBox = document.getElementById("activityBox");

        if (data.recent_attempts?.length) {
            activityBox.innerHTML = data.recent_attempts.map(a => `
                <div style="margin-bottom:10px;">
                    Attempt #${a.attempt_id} - ${(a.percentage || 0)}%
                </div>
            `).join('');
        } else {
            activityBox.innerHTML = "No activity yet";
        }

    } catch (err) {}
}

async function logout() {
    try {
        const res = await fetch(BASE_URL + "Logout.php", {
            credentials: "include"
        });
        const data = await res.json();

        if (data.success) {
            window.location.href = "login.html";
        }
    } catch (err) {}
}