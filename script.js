// ========== DATA STORAGE ==========
let jobs = [];
let applications = [];
let notifications = [];

// Sample notification
notifications = [
    { id: 1, title: "Welcome!", message: "Post your first opportunity using the button above", time: "Just now", read: false }
];

let currentFilter = "all";
let searchTerm = "";

// ========== RENDER FUNCTIONS ==========
function renderOpportunities() {
    const container = document.getElementById('opportunitiesList');
    if (!container) return;
    
    let filteredJobs = jobs;
    
    // Apply search filter
    if (searchTerm !== "") {
        filteredJobs = jobs.filter(function(job) {
            return job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   job.location.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }
    
    if (filteredJobs.length === 0) {
        if (jobs.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>📌 You haven't posted any opportunities yet.</p><p>Click "Post New Opportunity" to create your first learnership.</p></div>`;
        } else {
            container.innerHTML = `<div class="empty-state"><p>🔍 No opportunities match "${searchTerm}"</p><p>Try a different search term.</p></div>`;
        }
        return;
    }
    
    let html = '';
    for (let i = 0; i < filteredJobs.length; i++) {
        const job = filteredJobs[i];
        html += `
            <div class="opportunity-card">
                <div class="card-header">
                    <h3>${escapeHtml(job.title)}</h3>
                    <button class="delete-job-btn" onclick="deleteJob(${job.id})">🗑️ Delete</button>
                </div>
                <div class="opportunity-meta">
                    <span class="status-badge">Active</span>
                    <span class="applicant-count">👥 ${getApplicantCount(job.id)} applicants</span>
                </div>
                <div class="location-info">📍 ${escapeHtml(job.location)}</div>
                <div class="stipend-info">💰 ${escapeHtml(job.stipend)}</div>
                <div class="closing-date">📅 Closing: ${job.closingDate}</div>
                <button class="view-details-btn" onclick="viewJobDetails(${job.id})">View Details</button>
            </div>
        `;
    }
    container.innerHTML = html;
}

function getApplicantCount(jobId) {
    let count = 0;
    for (let i = 0; i < applications.length; i++) {
        if (applications[i].jobId === jobId) count++;
    }
    return count;
}

function renderApplications() {
    const container = document.getElementById('applicationsList');
    if (!container) return;
    
    if (applications.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>📭 No applications yet.</p><p>When students apply to your opportunities, they will appear here.</p></div>`;
        return;
    }
    
    let filteredApps = [];
    if (currentFilter === 'all') {
        filteredApps = applications;
    } else if (currentFilter === 'pending') {
        for (let i = 0; i < applications.length; i++) {
            if (applications[i].status === 'pending') filteredApps.push(applications[i]);
        }
    } else if (currentFilter === 'reviewed') {
        for (let i = 0; i < applications.length; i++) {
            if (applications[i].status === 'reviewed') filteredApps.push(applications[i]);
        }
    }
    
    if (filteredApps.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>📭 No applications found</p></div>`;
        return;
    }
    
    let html = `<table><thead><tr><th>Applicant Name</th><th>Opportunity</th><th>Applied Date</th><th>Qualifications</th><th>Status</th><th>Actions</th></tr></thead><tbody>`;
    for (let i = 0; i < filteredApps.length; i++) {
        const app = filteredApps[i];
        const job = jobs.find(function(j) { return j.id === app.jobId; });
        const jobTitle = job ? job.title : 'Unknown';
        html += `<tr><td>${escapeHtml(app.applicantName)}</td><td>${escapeHtml(jobTitle)}</td><td>${app.appliedDate}</td><td>${escapeHtml(app.qualifications)}</td><td><span class="status-pending">${app.status}</span></td><td class="action-buttons"><button onclick="viewApplicant(${app.id})">👤 View Profile</button><button onclick="shortlistApplicant(${app.id})">✓ Shortlist</button><button onclick="rejectApplicant(${app.id})">✗ Reject</button></td></tr>`;
    }
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>🔔 No new notifications.</p></div>`;
        return;
    }
    
    let html = '';
    for (let i = 0; i < notifications.length; i++) {
        const notif = notifications[i];
        const unreadClass = notif.read ? '' : 'unread';
        html += `<div class="notification-item ${unreadClass}"><div class="notification-content"><div class="notification-title">${escapeHtml(notif.title)}</div><div class="notification-message">${escapeHtml(notif.message)}</div><div class="notification-time">${escapeHtml(notif.time)}</div></div>${!notif.read ? `<button class="notification-read-btn" onclick="markNotificationRead(${notif.id})">Mark read</button>` : ''}</div>`;
    }
    container.innerHTML = html;
}

// ========== SEARCH FUNCTION ==========
function searchOpportunities() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchTerm = searchInput.value;
        renderOpportunities();
    }
}

// ========== TAB SWITCHING ==========
function switchTab(tab) {
    const opportunitiesSection = document.getElementById('opportunitiesSection');
    const applicationsSection = document.getElementById('applicationsSection');
    const notificationsSection = document.getElementById('notificationsSection');
    
    const opportunitiesBtn = document.getElementById('opportunitiesBtn');
    const applicationsBtn = document.getElementById('applicationsBtn');
    const notificationsBtn = document.getElementById('notificationsBtn');
    
    if (tab === 'opportunities') {
        opportunitiesSection.style.display = 'block';
        applicationsSection.style.display = 'none';
        notificationsSection.style.display = 'none';
        opportunitiesBtn.classList.add('active');
        applicationsBtn.classList.remove('active');
        notificationsBtn.classList.remove('active');
        renderOpportunities();
    } else if (tab === 'applications') {
        opportunitiesSection.style.display = 'none';
        applicationsSection.style.display = 'block';
        notificationsSection.style.display = 'none';
        opportunitiesBtn.classList.remove('active');
        applicationsBtn.classList.add('active');
        notificationsBtn.classList.remove('active');
        renderApplications();
    } else if (tab === 'notifications') {
        opportunitiesSection.style.display = 'none';
        applicationsSection.style.display = 'none';
        notificationsSection.style.display = 'block';
        opportunitiesBtn.classList.remove('active');
        applicationsBtn.classList.remove('active');
        notificationsBtn.classList.add('active');
        renderNotifications();
    }
}

// ========== POST JOB ==========
function openPostJobModal() {
    const modal = document.getElementById('postJobModal');
    if (modal) modal.style.display = 'flex';
}

function closePostJobModal() {
    const modal = document.getElementById('postJobModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('postJobForm');
    if (form) form.reset();
}

function postJob(event) {
    event.preventDefault();
    
    const title = document.getElementById('jobTitle').value;
    const location = document.getElementById('jobLocation').value;
    const stipend = document.getElementById('jobStipend').value;
    const duration = document.getElementById('jobDuration').value;
    const closingDate = document.getElementById('jobClosingDate').value;
    const requirementsText = document.getElementById('jobRequirements').value;
    const description = document.getElementById('jobDescription').value;
    
    const requirements = requirementsText.split('\n').filter(function(line) { return line.trim() !== ''; });
    
    const newJob = {
        id: Date.now(),
        title: title,
        location: location,
        stipend: stipend,
        duration: duration,
        closingDate: closingDate,
        requirements: requirements,
        description: description,
        postedDate: new Date().toISOString().split('T')[0]
    };
    
    jobs.push(newJob);
    
    notifications.unshift({
        id: Date.now(),
        title: "Opportunity Posted",
        message: "You posted \"" + title + "\" successfully",
        time: "Just now",
        read: false
    });
    
    closePostJobModal();
    switchTab('opportunities');
    renderNotifications();
    alert('✅ Opportunity posted successfully!');
}

function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this opportunity?')) {
        const job = jobs.find(function(j) { return j.id === jobId; });
        const jobTitle = job ? job.title : 'Unknown';
        jobs = jobs.filter(function(j) { return j.id !== jobId; });
        applications = applications.filter(function(app) { return app.jobId !== jobId; });
        notifications.unshift({ id: Date.now(), title: "Opportunity Deleted", message: "You deleted \"" + jobTitle + "\"", time: "Just now", read: false });
        renderOpportunities();
        renderApplications();
        renderNotifications();
        alert('✅ "' + jobTitle + '" has been deleted.');
    }
}

function viewJobDetails(jobId) {
    const job = jobs.find(function(j) { return j.id === jobId; });
    if (!job) return;
    let reqText = '';
    for (let i = 0; i < job.requirements.length; i++) {
        reqText += '\n✓ ' + job.requirements[i];
    }
    alert('📋 ' + job.title + '\n\n📍 Location: ' + job.location + '\n💰 Stipend: ' + job.stipend + '\n📅 Duration: ' + job.duration + '\n📆 Closing Date: ' + job.closingDate + '\n👥 Current Applicants: ' + getApplicantCount(job.id) + '\n\nREQUIREMENTS:' + reqText + '\n\n📝 Description:\n' + (job.description || 'No description provided'));
}

function viewApplicant(applicationId) {
    const app = applications.find(function(a) { return a.id === applicationId; });
    if (!app) return;
    const job = jobs.find(function(j) { return j.id === app.jobId; });
    const jobTitle = job ? job.title : 'Unknown';
    alert('👤 APPLICANT PROFILE\n\nName: ' + app.applicantName + '\nApplied for: ' + jobTitle + '\nApplied on: ' + app.appliedDate + '\nQualifications: ' + app.qualifications + '\nStatus: ' + app.status + '\n\n(Full profile with CV will be available in Sprint 3)');
}

function shortlistApplicant(applicationId) {
    const app = applications.find(function(a) { return a.id === applicationId; });
    if (app) {
        app.status = 'shortlisted';
        renderApplications();
        notifications.unshift({ id: Date.now(), title: "Applicant Shortlisted", message: "You shortlisted " + app.applicantName, time: "Just now", read: false });
        renderNotifications();
        alert('✅ ' + app.applicantName + ' has been shortlisted!');
    }
}

function rejectApplicant(applicationId) {
    const app = applications.find(function(a) { return a.id === applicationId; });
    if (app) {
        app.status = 'rejected';
        renderApplications();
        notifications.unshift({ id: Date.now(), title: "Applicant Rejected", message: "You rejected " + app.applicantName, time: "Just now", read: false });
        renderNotifications();
        alert('❌ ' + app.applicantName + ' has been rejected.');
    }
}

function markNotificationRead(notificationId) {
    const notif = notifications.find(function(n) { return n.id === notificationId; });
    if (notif) {
        notif.read = true;
        renderNotifications();
    }
}

function markAllNotificationsRead() {
    for (let i = 0; i < notifications.length; i++) {
        notifications[i].read = true;
    }
    renderNotifications();
    alert('All notifications marked as read');
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', function() {
    // Tab buttons
    const opportunitiesBtn = document.getElementById('opportunitiesBtn');
    const applicationsBtn = document.getElementById('applicationsBtn');
    const notificationsBtn = document.getElementById('notificationsBtn');
    
    if (opportunitiesBtn) {
        opportunitiesBtn.addEventListener('click', function() { switchTab('opportunities'); });
    }
    if (applicationsBtn) {
        applicationsBtn.addEventListener('click', function() { switchTab('applications'); });
    }
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', function() { switchTab('notifications'); });
    }
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', searchOpportunities);
    }
    
    // Post job button
    const postJobBtn = document.getElementById('postJobBtn');
    if (postJobBtn) {
        postJobBtn.addEventListener('click', openPostJobModal);
    }
    
    // Modal close buttons
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closePostJobModal);
    }
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closePostJobModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('postJobModal');
        if (event.target === modal) {
            closePostJobModal();
        }
    });
    
    // Post job form submit
    const postJobForm = document.getElementById('postJobForm');
    if (postJobForm) {
        postJobForm.addEventListener('submit', postJob);
    }
    
    // Mark all read button
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllNotificationsRead);
    }
    
    // Filter buttons
    const filterAll = document.getElementById('filterAll');
    const filterPending = document.getElementById('filterPending');
    const filterReviewed = document.getElementById('filterReviewed');
    
    if (filterAll) {
        filterAll.addEventListener('click', function() {
            filterAll.classList.add('active');
            filterPending.classList.remove('active');
            filterReviewed.classList.remove('active');
            currentFilter = 'all';
            renderApplications();
        });
    }
    if (filterPending) {
        filterPending.addEventListener('click', function() {
            filterPending.classList.add('active');
            filterAll.classList.remove('active');
            filterReviewed.classList.remove('active');
            currentFilter = 'pending';
            renderApplications();
        });
    }
    if (filterReviewed) {
        filterReviewed.addEventListener('click', function() {
            filterReviewed.classList.add('active');
            filterAll.classList.remove('active');
            filterPending.classList.remove('active');
            currentFilter = 'reviewed';
            renderApplications();
        });
    }
    
    // Dropdown menu
    const dropdownTrigger = document.getElementById('dropdownTrigger');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (dropdownTrigger) {
        dropdownTrigger.addEventListener('click', function(event) {
            event.stopPropagation();
            dropdownMenu.classList.toggle('show');
            dropdownTrigger.classList.toggle('active');
        });
    }
    
    document.addEventListener('click', function() {
        if (dropdownMenu) dropdownMenu.classList.remove('show');
        if (dropdownTrigger) dropdownTrigger.classList.remove('active');
    });
    
    // Dropdown items
    const profileBtn = document.getElementById('profileBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const privacyBtn = document.getElementById('privacyBtn');
    const helpBtn = document.getElementById('helpBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('My Profile - Coming in Sprint 2');
        });
    }
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Settings - Coming in Sprint 2');
        });
    }
    if (privacyBtn) {
        privacyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Privacy - Coming in Sprint 2');
        });
    }
    if (helpBtn) {
        helpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Help & Support - Coming in Sprint 2');
        });
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Logged out successfully!');
        });
    }
    
    // Initial render
    renderOpportunities();
    renderApplications();
    renderNotifications();
});