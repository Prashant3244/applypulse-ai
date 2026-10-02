// popup.js - ApplyPulse AI Popup Controller

document.addEventListener('DOMContentLoaded', () => {
    const extpay = typeof ExtPay !== 'undefined' ? ExtPay('applypulse-ai') : null;

    // Elements - Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const tierBadge = document.getElementById('tier-badge');
    const trackerCountEl = document.getElementById('tracker-count');
    const toast = document.getElementById('toast');

    // Profile input field IDs
    const profileFields = [
        'firstName', 'lastName', 'email', 'phone', 'street',
        'city', 'state', 'zipCode', 'country', 'linkedinUrl',
        'githubUrl', 'portfolioUrl', 'currentTitle', 'currentCompany',
        'yearsExperience', 'skills', 'university', 'highestDegree',
        'major', 'gradYear', 'gpa', 'summaryPitch'
    ];

    function showToast(message = "Saved Successfully!") {
        toast.innerText = message;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 2200);
    }

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // Load Profile Data
    function loadProfile() {
        chrome.storage.sync.get(['applypulse_profile', 'applypulse_settings'], (res) => {
            const prof = res.applypulse_profile || {};
            profileFields.forEach(field => {
                const el = document.getElementById(`prof-${field}`);
                if (el) el.value = prof[field] || '';
            });

            // Checkboxes
            const authUs = document.getElementById('prof-authorizedUS');
            const reqSpon = document.getElementById('prof-requiresSponsorship');
            if (authUs) authUs.checked = prof.authorizedUS !== undefined ? prof.authorizedUS : true;
            if (reqSpon) reqSpon.checked = prof.requiresSponsorship !== undefined ? prof.requiresSponsorship : false;

            // Settings & Badge
            const settings = res.applypulse_settings || { dailyCount: 0, freeLimit: 5, devMode: false, devIsPro: false };
            const isPro = (settings.devMode && settings.devIsPro);

            if (isPro) {
                tierBadge.className = 'pro-badge badge-pro';
                tierBadge.innerText = 'PRO UNLIMITED';
            } else {
                tierBadge.className = 'pro-badge badge-free';
                tierBadge.innerText = 'FREE TIER';
            }

            const quotaText = document.getElementById('daily-quota-text');
            if (quotaText) {
                quotaText.innerText = isPro ? 'Unlimited (Pro Active)' : `${settings.dailyCount || 0} / ${settings.freeLimit || 5} used today`;
            }

            const devToggle = document.getElementById('dev-mode-toggle');
            if (devToggle) {
                devToggle.checked = !!(settings.devMode && settings.devIsPro);
            }
        });
    }

    // Save Profile
    document.getElementById('save-profile-btn').addEventListener('click', () => {
        const updated = {};
        profileFields.forEach(field => {
            const el = document.getElementById(`prof-${field}`);
            if (el) updated[field] = el.value.trim();
        });

        updated.fullName = `${updated.firstName || ''} ${updated.lastName || ''}`.trim();
        updated.authorizedUS = document.getElementById('prof-authorizedUS').checked;
        updated.requiresSponsorship = document.getElementById('prof-requiresSponsorship').checked;

        chrome.storage.sync.set({ applypulse_profile: updated }, () => {
            showToast("Candidate Profile Saved!");
        });
    });

    // Backup JSON
    document.getElementById('export-json-btn').addEventListener('click', () => {
        chrome.storage.sync.get(['applypulse_profile'], (res) => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.applypulse_profile || {}, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "applypulse_candidate_profile.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    });

    // Restore JSON
    const fileInput = document.getElementById('json-file-input');
    document.getElementById('import-json-btn').addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                chrome.storage.sync.set({ applypulse_profile: parsed }, () => {
                    loadProfile();
                    showToast("Profile Restored from JSON!");
                });
            } catch (err) {
                alert("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
    });

    // Load Job Tracker CRM
    function loadTracker() {
        chrome.storage.sync.get(['applypulse_tracker'], (res) => {
            const jobs = res.applypulse_tracker || [];
            trackerCountEl.innerText = jobs.length;
            const container = document.getElementById('tracker-list');

            if (jobs.length === 0) {
                container.innerHTML = `<div class="empty-state">No jobs tracked yet. Open any Workday or ATS application page and click "💾 Save to Job Tracker" in the floating HUD!</div>`;
                return;
            }

            container.innerHTML = '';
            jobs.forEach((job, idx) => {
                const item = document.createElement('div');
                item.className = 'tracker-item';
                
                const dateStr = job.savedAt ? new Date(job.savedAt).toLocaleDateString() : 'Recent';

                item.innerHTML = `
                    <div class="tracker-row-top">
                        <span class="tracker-company">${job.company || 'Unknown Company'}</span>
                        <select class="tracker-status-select" data-index="${idx}">
                            <option value="Saved" ${job.status === 'Saved' ? 'selected' : ''}>Saved</option>
                            <option value="Applied" ${job.status === 'Applied' ? 'selected' : ''}>Applied</option>
                            <option value="Interviewing" ${job.status === 'Interviewing' ? 'selected' : ''}>Interviewing</option>
                            <option value="Offer" ${job.status === 'Offer' ? 'selected' : ''}>Offer 🎉</option>
                            <option value="Rejected" ${job.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </div>
                    <div class="tracker-title">${job.title || 'Role details'}</div>
                    <div class="tracker-meta">
                        <span>📅 ${dateStr}</span>
                        ${job.url ? `<a href="${job.url}" target="_blank" style="color:#818cf8; text-decoration:none">View Job ↗</a>` : ''}
                    </div>
                `;
                container.appendChild(item);
            });

            // Listen for status changes
            container.querySelectorAll('.tracker-status-select').forEach(sel => {
                sel.addEventListener('change', (e) => {
                    const index = parseInt(e.target.dataset.index, 10);
                    jobs[index].status = e.target.value;
                    chrome.storage.sync.set({ applypulse_tracker: jobs }, () => {
                        showToast("Status Updated!");
                    });
                });
            });
        });
    }

    // Export Tracker to CSV
    document.getElementById('export-csv-btn').addEventListener('click', () => {
        chrome.storage.sync.get(['applypulse_tracker'], (res) => {
            const jobs = res.applypulse_tracker || [];
            if (jobs.length === 0) {
                alert("No jobs to export yet!");
                return;
            }

            let csvContent = "Company,Job Title,Status,Date Saved,Job URL\n";
            jobs.forEach(j => {
                const comp = `"${(j.company || '').replace(/"/g, '""')}"`;
                const title = `"${(j.title || '').replace(/"/g, '""')}"`;
                const status = `"${(j.status || '').replace(/"/g, '""')}"`;
                const date = `"${j.savedAt || ''}"`;
                const url = `"${(j.url || '').replace(/"/g, '""')}"`;
                csvContent += `${comp},${title},${status},${date},${url}\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ApplyPulse_Job_Tracker_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
    });

    // Clear Tracker
    document.getElementById('clear-tracker-btn').addEventListener('click', () => {
        if (confirm("Are you sure you want to clear your tracked job list?")) {
            chrome.storage.sync.set({ applypulse_tracker: [] }, () => {
                loadTracker();
                showToast("Job tracker cleared.");
            });
        }
    });

    // Upgrade to Pro Button
    document.getElementById('upgrade-pro-btn').addEventListener('click', () => {
        if (extpay) {
            extpay.openPaymentPage();
        } else {
            window.open('https://extensionpay.com', '_blank');
        }
    });

    // Dev Mode Toggle
    document.getElementById('dev-mode-toggle').addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        chrome.storage.sync.get(['applypulse_settings'], (res) => {
            const settings = res.applypulse_settings || { dailyCount: 0, freeLimit: 5 };
            settings.devMode = true;
            settings.devIsPro = isChecked;
            chrome.storage.sync.set({ applypulse_settings: settings }, () => {
                loadProfile();
                showToast(isChecked ? "Simulating Pro Plan Active!" : "Switched to Free Tier");
            });
        });
    });

    // Init
    loadProfile();
    loadTracker();
});
