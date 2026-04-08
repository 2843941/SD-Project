// Wait for page to load first
document.addEventListener('DOMContentLoaded', function() {

    // ========== MOCK DATA WITH REQUIREMENTS ==========
    const recruiterOpportunities = [
        { 
            id: 1, 
            title: "Software Development Learnership", 
            postedDate: "2026-04-01", 
            applicants: 12, 
            status: "Active",
            requirements: [
                "Matric certificate with Maths",
                "No prior degree required",
                "Basic computer literacy",
                "Age 18-34 years old",
                "South African ID"
            ],
            stipend: "R4,500 per month",
            duration: "12 months",
            location: "Johannesburg (Hybrid)"
        },
        { 
            id: 2, 
            title: "Data Analytics Internship", 
            postedDate: "2026-03-28", 
            applicants: 8, 
            status: "Active",
            requirements: [
                "Degree or diploma in IT/Statistics",
                "Excel proficiency",
                "SQL knowledge is a plus",
                "South African ID"
            ],
            stipend: "R6,000 per month",
            duration: "6 months",
            location: "Cape Town (Remote)"
        },
        { 
            id: 3, 
            title: "Cybersecurity Apprenticeship", 
            postedDate: "2026-03-25", 
            applicants: 24, 
            status: "Closing Soon",
            requirements: [
                "IT degree or relevant certification",
                "Network fundamentals knowledge",
                "Problem-solving skills",
                "South African ID"
            ],
            stipend: "R5,500 per month",
            duration: "18 months",
            location: "Durban (On-site)"
        }
    ];

    const allApplications = [
        { id: 101, applicantName: "Thabo Nkosi", opportunityTitle: "Software Development Learnership", appliedDate: "2026-04-05", status: "pending", qualifications: "Matric with Maths - 78%" },
        { id: 102, applicantName: "Lerato Molefe", opportunityTitle: "Software Development Learnership", appliedDate: "2026-04-04", status: "pending", qualifications: "Matric with Maths - 65%" },
        { id: 103, applicantName: "Sipho Dlamini", opportunityTitle: "Data Analytics Internship", appliedDate: "2026-04-03", status: "reviewed", qualifications: "IT Diploma - Completed 2025" },
        { id: 104, applicantName: "Nomusa Khumalo", opportunityTitle: "Cybersecurity Apprenticeship", appliedDate: "2026-04-02", status: "pending", qualifications: "Computer Science Degree - 3rd year" }
    ];

    let notifications = [
        { id: 1, title: "New Application", message: "Thabo Nkosi applied for Software Development Learnership", time: "2 hours ago", read: false },
        { id: 2, title: "New Application", message: "Lerato Molefe applied for Software Development Learnership", time: "1 day ago", read: false },
        { id: 3, title: "Application Reviewed", message: "You reviewed Sipho Dlamini's application", time: "2 days ago", read: true },
        { id: 4, title: "Opportunity Closing Soon", message: "Cybersecurity Apprenticeship closes in 3 days", time: "3 days ago", read: true }
    ];

    let currentFilter = "all";

    // ========== FUNCTION TO SHOW OPPORTUNITIES ==========
    function renderOpportunities() {
        const grid = document.getElementById('opportunitiesGrid');
        if (!grid) return;
        
        let html = '';
        for (let i = 0; i < recruiterOpportunities.length; i++) {
            const opp = recruiterOpportunities[i];
            html += `
                <div class="opportunity-card" onclick="showJobDetails(${opp.id})">
                    <h3>${opp.title}</h3>
                    <div class="opportunity-meta">
                        Posted: ${opp.postedDate}
                        <span class="status-badge status-active">${opp.status}</span>
                    </div>
                    <div class="applicant-count">👥 ${opp.applicants} applicants</div>
                    <div class="location-info">📍 ${opp.location}</div>
                    <div class="stipend-info">💰 ${opp.stipend}</div>
                </div>
            `;
        }
        grid.innerHTML = html;
    }

    // ========== FUNCTION TO SHOW JOB DETAILS WITH REQUIREMENTS ==========
    window.showJobDetails = function(jobId) {
        const job = recruiterOpportunities.find(function(j) { return j.id === jobId; });
        if (!job) return;
        
        let requirementsText = "";
        for (let i = 0; i < job.requirements.length; i++) {
            requirementsText = requirementsText + "\n✓ " + job.requirements[i];
        }
        
        alert(
            "📋 " + job.title + "\n\n" +
            "📍 Location: " + job.location + "\n" +
            "💰 Stipend: " + job.stipend + "\n" +
            "📅 Duration: " + job.duration + "\n" +
            "👥 Current Applicants: " + job.applicants + "\n\n" +
            "REQUIREMENTS:" + requirementsText + "\n\n" +
            "(Full details page coming in Sprint 2)"
        );
    };

    // ========== FUNCTION TO SHOW APPLICATIONS ==========
    function renderApplications() {
        const tbody = document.getElementById('applicationsTableBody');
        if (!tbody) return;
        
        let filteredApps = [];
        
        if (currentFilter === 'all') {
            filteredApps = allApplications;
        } else if (currentFilter === 'pending') {
            filteredApps = [];
            for (let i = 0; i < allApplications.length; i++) {
                if (allApplications[i].status === 'pending') {
                    filteredApps.push(allApplications[i]);
                }
            }
        } else if (currentFilter === 'reviewed') {
            filteredApps = [];
            for (let i = 0; i < allApplications.length; i++) {
                if (allApplications[i].status === 'reviewed') {
                    filteredApps.push(allApplications[i]);
                }
            }
        }
        
        if (filteredApps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No applications found</td></tr>';
            return;
        }
        
        let html = '';
        for (let i = 0; i < filteredApps.length; i++) {
            const app = filteredApps[i];
            html += `
                <tr>
                    <td>${app.applicantName}</td>
                    <td>${app.opportunityTitle}</td>
                    <td>${app.appliedDate}</td>
                    <td>${app.qualifications}</td>
                    <td><span class="status-pending">${app.status}</span></td>
                    <td class="action-buttons">
                        <button onclick="viewApplicantProfile(${app.id})">👤 View Profile</button>
                        <button onclick="alert('Shortlist coming in Sprint 2')">✓ Shortlist</button>
                        <button onclick="alert('Reject coming in Sprint 2')">✗ Reject</button>
                    </td>
                </tr>
            `;
        }
        tbody.innerHTML = html;
    }

    // ========== VIEW APPLICANT PROFILE ==========
    window.viewApplicantProfile = function(applicationId) {
        let applicant = null;
        for (let i = 0; i < allApplications.length; i++) {
            if (allApplications[i].id === applicationId) {
                applicant = allApplications[i];
                break;
            }
        }
        
        if (!applicant) return;
        
        alert(
            "👤 APPLICANT PROFILE\n\n" +
            "Name: " + applicant.applicantName + "\n" +
            "Applied for: " + applicant.opportunityTitle + "\n" +
            "Applied on: " + applicant.appliedDate + "\n" +
            "Qualifications: " + applicant.qualifications + "\n" +
            "Status: " + applicant.status + "\n\n" +
            "(Full profile page coming in Sprint 2)"
        );
    };

    // ========== FUNCTION TO SHOW NOTIFICATIONS ==========
    function renderNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;
        
        if (notifications.length === 0) {
            container.innerHTML = '<div class="notification-item">No notifications</div>';
            return;
        }
        
        let html = '';
        for (let i = 0; i < notifications.length; i++) {
            const notif = notifications[i];
            const unreadClass = notif.read ? '' : 'unread';
            html += `
                <div class="notification-item ${unreadClass}">
                    <div class="notification-content">
                        <div class="notification-title">${notif.title}</div>
                        <div class="notification-message">${notif.message}</div>
                        <div class="notification-time">${notif.time}</div>
                    </div>
                    ${!notif.read ? '<button class="notification-read-btn" onclick="markAsRead(' + notif.id + ')">Mark read</button>' : ''}
                </div>
            `;
        }
        container.innerHTML = html;
    }

    // ========== FUNCTION TO SWITCH TABS ==========
    function switchTab(tabName) {
        // Hide all tab contents
        const allContents = document.querySelectorAll('.tab-content');
        for (let i = 0; i < allContents.length; i++) {
            allContents[i].classList.remove('active');
        }
        
        // Remove active class from all buttons
        const allBtns = document.querySelectorAll('.nav-btn');
        for (let i = 0; i < allBtns.length; i++) {
            allBtns[i].classList.remove('active');
        }
        
        // Show selected tab content
        const selectedContent = document.getElementById(tabName + 'Content');
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
        
        // Add active class to clicked button
        const clickedBtn = document.getElementById(tabName + 'Btn');
        if (clickedBtn) {
            clickedBtn.classList.add('active');
        }
    }

    // ========== SETUP FILTER BUTTONS ==========
    function setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        for (let i = 0; i < filterBtns.length; i++) {
            const btn = filterBtns[i];
            btn.addEventListener('click', function() {
                // Remove active class from all filter buttons
                for (let j = 0; j < filterBtns.length; j++) {
                    filterBtns[j].classList.remove('active');
                }
                // Add active class to clicked button
                this.classList.add('active');
                // Update filter and refresh applications
                currentFilter = this.getAttribute('data-filter');
                renderApplications();
            });
        }
    }

    // ========== MARK NOTIFICATION AS READ ==========
    window.markAsRead = function(notificationId) {
        for (let i = 0; i < notifications.length; i++) {
            if (notifications[i].id === notificationId) {
                notifications[i].read = true;
                break;
            }
        }
        renderNotifications();
    };

    // ========== POST NEW JOB (WITH REQUIREMENTS FORM) ==========
    window.showPostJobForm = function() {
        alert(
            "📝 POST NEW OPPORTUNITY (Sprint 2)\n\n" +
            "Fields will include:\n" +
            "- Job Title\n" +
            "- Description\n" +
            "- Location\n" +
            "- Stipend amount\n" +
            "- Duration\n" +
            "- Requirements (list)\n" +
            "- Closing date\n\n" +
            "This form will be available in Sprint 2."
        );
    };

    // ========== SETUP BUTTON CLICKS ==========
    // Tab buttons
    const oppBtn = document.getElementById('opportunitiesBtn');
    const appsBtn = document.getElementById('applicationsBtn');
    const notifBtn = document.getElementById('notificationsBtn');
    
    if (oppBtn) {
        oppBtn.addEventListener('click', function() { switchTab('opportunities'); });
    }
    if (appsBtn) {
        appsBtn.addEventListener('click', function() { switchTab('applications'); });
    }
    if (notifBtn) {
        notifBtn.addEventListener('click', function() { switchTab('notifications'); });
    }
    
    // Post opportunity button
    const postBtn = document.getElementById('postOpportunityBtn');
    if (postBtn) {
        postBtn.addEventListener('click', function() {
            showPostJobForm();
        });
    }
    
    // Mark all as read button
    const markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', function() {
            for (let i = 0; i < notifications.length; i++) {
                notifications[i].read = true;
            }
            renderNotifications();
            alert('All notifications marked as read');
        });
    }
    
    // Logout button
    const logout = document.getElementById('logoutBtn');
    if (logout) {
        logout.addEventListener('click', function() {
            alert('Logout will redirect to login page in Sprint 2');
        });
    }

    // ========== INITIAL LOAD ==========
    renderOpportunities();
    renderApplications();
    renderNotifications();
    setupFilters();

});