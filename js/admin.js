document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const tableBody = document.getElementById('table-body');
    const dataCount = document.getElementById('data-count');
    const exportBtn = document.getElementById('exportExcelBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');

    const PASSWORD = 'kankali1975';

    // Check Login State
    function checkLogin() {
        if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
            showDashboard();
        } else {
            showLogin();
        }
    }

    function showLogin() {
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }

    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        renderSubmissions();
    }

    // Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const entered = document.getElementById('admin-password').value;
            
            if (entered === PASSWORD) {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                showDashboard();
                loginError.style.display = 'none';
            } else {
                loginError.style.display = 'block';
            }
        });
    }

    // Render Table
    function renderSubmissions() {
        const submissions = JSON.parse(localStorage.getItem('astro_submissions') || '[]');
        tableBody.innerHTML = '';
        
        if (submissions.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem; opacity: 0.5;">No records found.</td></tr>';
            dataCount.textContent = '0 total records';
            return;
        }

        dataCount.textContent = `${submissions.length} total records found`;

        submissions.reverse().forEach((sub) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="white-space: nowrap;">${sub.submittedAt || 'N/A'}</td>
                <td style="font-weight: 600;">${sub.name}</td>
                <td>${sub.phone}</td>
                <td><span class="text-saffron" style="font-weight: 500;">${sub.service}</span></td>
                <td style="font-size: 0.85rem;">
                    <strong>DOB:</strong> ${sub.dob}<br>
                    <strong>TOB:</strong> ${sub.tob}<br>
                    <strong>POB:</strong> ${sub.pob}
                </td>
                <td style="max-width: 300px; font-size: 0.85rem; opacity: 0.8;">${sub.message}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Export Logic
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const submissions = JSON.parse(localStorage.getItem('astro_submissions') || '[]');
            if (submissions.length === 0) {
                alert('No data to export.');
                return;
            }

            const ws = XLSX.utils.json_to_sheet(submissions);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Submissions");
            
            const date = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `consultations_export_${date}.xlsx`);
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isAdminLoggedIn');
            location.reload();
        });
    }

    // Clear Data
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm('Are you ABSOLUTELY sure you want to delete all stored records? This cannot be undone.')) {
                localStorage.removeItem('astro_submissions');
                renderSubmissions();
            }
        });
    }

    checkLogin();
});
