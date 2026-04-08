// ========== DATA STORAGE (no saving - resets on refresh) ==========
let jobs = [];
let applications = [];
let notifications = [];

// Sample notification to show something
notifications = [
    { id: 1, title: "Welcome!", message: "Post your first opportunity using the button above", time: "Just now", read: false }
];

// ========== RENDER FUNCTIONS ==========
function renderOpportunities() {
    const container = document.getElementById('opportunitiesList');
    if (!container) return;
    
    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📌 You haven't posted any opportunities yet.</p>
                <p>Click "Post New Opportunity" to create your first learnership or internship.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
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
        if (applications[i].jobId === jobId) {
            count++;
        }
    }
    return count;
}

function renderApplications() {
    const container = document.getElementById('applicationsList');
    if (!container) return;
    
    if (applications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📭 No applications yet.</p>
                <p>When students apply to your opportunities, they will appear here.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Applicant Name</th>
                    <th>Opportunity</th>
                    <th>Applied Date</th>
                    <th>Qualifications</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    for (let i = 0; i < applications.length; i++) {
        const app = applications[i];
        const job = jobs.find(j => j.id === app.jobId);
        const jobTitle = job ? job.title : 'Unknown';
        
        html += `
            <tr>
                <td>${escapeHtml(app.applicantName)}</td>
                <td>${escapeHtml(jobTitle)}</td>
                <td>${app.appliedDate}</td>
                <td>${escapeHtml(app.qualifications)}</td>
                <td><span class="status-pending">${app.status}</span></td>
                <td class="action-buttons">
                    <button onclick="viewApplicant(${app.id})">👤 View Profile</button>
                    <button onclick="shortlistApplicant(${app.id})">✓ Shortlist</button>
                    <button onclick="rejectApplicant(${app.id})">✗ Reject</button>
                </td>
            </tr>
        `;
    }
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🔔 No new notifications.</p>
                <p>When students apply or update their applications, you will see them here.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    for (let i = 0; i < notifications.length; i++) {
        const notif = notifications[i];
        const unreadClass = notif.read ? '' : 'unread';
        html += `
            <div class="notification-item ${unreadClass}">
                <div class="notification-content">
                    <div class="notification-title">${escapeHtml(notif.title)}</div>
                    <div class="notification-message">${escapeHtml(notif.message)}</div>
                    <div class="notification-time">${escapeHtml(notif.time)}</div>
                </div>
                ${!notif.read ? `<button class="notification-read-btn" onclick="markNotificationRead(${notif.id})">Mark read</button>` : ''}
            </div>
        `;
    }
    container.innerHTML = html;
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

// ========== POST JOB MODAL ==========
function openPostJobModal() {
    const modal = document.getElementById('postJobModal');
    modal.style.display = 'flex';
}

function closePostJobModal() {
    const modal = document.getElementById('postJobModal');
    modal.style.display = 'none';
    document.getElementById('postJobForm').reset();
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
    
    // Convert requirements text to array
    const requirements = requirementsText.split('\n').filter(line => line.trim() !== '');
    
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
    
    // Add notification
    notifications.unshift({
        id: Date.now(),
        title: "Opportunity Posted",
        message: `You posted "${title}" successfully`,
        time: "Just now",
        read: false
    });
    
    closePostJobModal();
    switchTab('opportunities');
    alert('✅ Opportunity posted successfully!');
}

// ========== DELETE JOB ==========
function deleteJob(jobId) {
    const confirmDelete = confirm('Are you sure you want to delete this opportunity?');
    
    if (confirmDelete) {
        const job = jobs.find(j => j.id === jobId);
        const jobTitle = job ? job.title : 'Unknown';
        
        // Remove the job
        jobs = jobs.filter(j => j.id !== jobId);
        
        // Also delete all applications for this job
        applications = applications.filter(app => app.jobId !== jobId);
        
        // Add notification
        notifications.unshift({
            id: Date.now(),
            title: "Opportunity Deleted",
            message: `You deleted "${jobTitle}"`,
            time: "Just now",
            read: false
        });
        
        renderOpportunities();
        renderApplications();
        
        alert(`✅ "${jobTitle}" has been deleted.`);
    }
}

// ========== VIEW FUNCTIONS ==========
function viewJobDetails(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    let requirementsText = '';
    for (let i = 0; i < job.requirements.length; i++) {
        requirementsText += `\n✓ ${job.requirements[i]}`;
    }
    
    alert(
        `📋 ${job.title}\n\n` +
        `📍 Location: ${job.location}\n` +
        `💰 Stipend: ${job.stipend}\n` +
        `📅 Duration: ${job.duration}\n` +
        `📆 Closing Date: ${job.closingDate}\n` +
        `👥 Current Applicants: ${getApplicantCount(job.id)}\n\n` +
        `REQUIREMENTS:${requirementsText}\n\n` +
        `📝 Description:\n${job.description || 'No description provided'}`
    );
}

function viewApplicant(applicationId) {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;
    
    const job = jobs.find(j => j.id === app.jobId);
    const jobTitle = job ? job.title : 'Unknown';
    
    alert(
        `👤 APPLICANT PROFILE\n\n` +
        `Name: ${app.applicantName}\n` +
        `Applied for: ${jobTitle}\n` +
        `Applied on: ${app.appliedDate}\n` +
        `Qualifications: ${app.qualifications}\n` +
        `Status: ${app.status}\n\n` +
        `(Full profile with CV will be available in Sprint 3)`
    );
}

function shortlistApplicant(applicationId) {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
        app.status = 'shortlisted';
        renderApplications();
        
        notifications.unshift({
            id: Date.now(),
            title: "Applicant Shortlisted",
            message: `You shortlisted ${app.applicantName}`,
            time: "Just now",
            read: false
        });
        
        alert(`✅ ${app.applicantName} has been shortlisted!`);
    }
}

function rejectApplicant(applicationId) {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
        app.status = 'rejected';
        renderApplications();
        
        notifications.unshift({
            id: Date.now(),
            title: "Applicant Rejected",
            message: `You rejected ${app.applicantName}`,
            time: "Just now",
            read: false
        });
        
        alert(`❌ ${app.applicantName} has been rejected.`);
    }
}

function markNotificationRead(notificationId) {
    const notif = notifications.find(n => n.id === notificationId);
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

function logout() {
    alert('Logged out successfully!');
}

// ========== HELPER FUNCTION ==========
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
    document.getElementById('opportunitiesBtn').addEventListener('click', function() { switchTab('opportunities'); });
    document.getElementById('applicationsBtn').addEventListener('click', function() { switchTab('applications'); });
    document.getElementById('notificationsBtn').addEventListener('click', function() { switchTab('notifications'); });
    
    // Post job button
    document.getElementById('postJobBtn').addEventListener('click', openPostJobModal);
    
    // Modal close buttons
    document.getElementById('closeModalBtn').addEventListener('click', closePostJobModal);
    document.getElementById('cancelModalBtn').addEventListener('click', closePostJobModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('postJobModal');
        if (event.target === modal) {
            closePostJobModal();
        }
    });
    
    // Post job form submit
    document.getElementById('postJobForm').addEventListener('submit', postJob);
    
    // Mark all read button
    document.getElementById('markAllReadBtn').addEventListener('click', markAllNotificationsRead);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Filter buttons
    document.getElementById('filterAll').addEventListener('click', function() { alert('Filter All - coming in Sprint 2'); });
    document.getElementById('filterPending').addEventListener('click', function() { alert('Filter Pending - coming in Sprint 2'); });
    document.getElementById('filterReviewed').addEventListener('click', function() { alert('Filter Reviewed - coming in Sprint 2'); });
    
    // Show initial tab
    renderOpportunities();
});