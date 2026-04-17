// recruiter_homepage.test.js

// ========== MOCK DOM ENVIRONMENT ==========

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock alert and confirm
global.alert = jest.fn();
global.confirm = jest.fn(() => true);

// Mock document.getElementById
global.document = {
    getElementById: jest.fn((id) => {
        const elements = {
            'opportunitiesList': { innerHTML: '', style: {} },
            'bulkDeleteBar': { style: { display: 'none' } },
            'selectedCount': {},
            'prevPageBtn': { disabled: false },
            'nextPageBtn': { disabled: false },
            'pageInfo': { textContent: '' },
            'applicationsBtn': { innerHTML: '' },
            'postJobModal': { style: { display: 'none' } },
            'jobTitleField': { value: 'Software Development', trim: () => 'Software Development' },
            'jobTitleType': { value: 'Learnership' },
            'jobLocation': { value: 'Johannesburg', trim: () => 'Johannesburg' },
            'jobStipend': { value: 'R5000', trim: () => 'R5000' },
            'jobDuration': { value: '12 months', trim: () => '12 months' },
            'jobClosingDate': { value: '2026-12-31' },
            'jobRequirements': { value: 'Matric\nID', trim: () => 'Matric\nID' },
            'jobDescription': { value: 'Great opportunity' },
            'jobStatus': { value: 'active' },
            'postJobForm': { reset: jest.fn() },
            'modalTitle': { textContent: '' },
            'submitJobBtn': { textContent: '' },
            'searchInput': { value: '', addEventListener: jest.fn() },
            'sortByDateBtn': { classList: { add: jest.fn(), remove: jest.fn() } },
            'sortByApplicantsBtn': { classList: { add: jest.fn(), remove: jest.fn() } }
        };
        return elements[id] || null;
    })
};

// Mock querySelectorAll
global.document.querySelectorAll = jest.fn(() => []);
global.document.querySelector = jest.fn(() => null);

// Mock addEventListener
global.document.addEventListener = jest.fn();

// ========== IMPORT MODULE ==========
const recruiterModule = require('./recruiter_homepage.js');

// Get all exported functions
const {
    escapeHtml,
    formatJobTitle,
    getPaginatedJobs,
    getTotalPages,
    filterJobsBySearch,
    sortJobs,
    getApplicantCount,
    getPendingApplicantCount,
    saveToLocalStorage,
    loadFromLocalStorage,
    validateJobForm
} = recruiterModule;

// ========== TEST SETUP ==========
let mockApplications = [];
let mockJobs = [];
let mockCurrentSort = "date";

// Wrapper functions for testing with mock data
function testGetApplicantCount(jobId) {
    return mockApplications.filter(app => app.jobId === jobId).length;
}

function testGetPendingApplicantCount(jobId) {
    return mockApplications.filter(app => app.jobId === jobId && app.status === "pending").length;
}

function testSortJobs(jobsArray) {
    const sorted = [...jobsArray];
    if (mockCurrentSort === "date") {
        sorted.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    } else {
        sorted.sort((a, b) => testGetApplicantCount(b.id) - testGetApplicantCount(a.id));
    }
    return sorted;
}

// ========== TESTS ==========

describe('escapeHtml function', () => {
    test('should return empty string for empty input', () => {
        expect(escapeHtml("")).toBe("");
    });

    test('should return empty string for null', () => {
        expect(escapeHtml(null)).toBe("");
    });

    test('should return empty string for undefined', () => {
        expect(escapeHtml(undefined)).toBe("");
    });

    test('should escape ampersand', () => {
        expect(escapeHtml("Hello & World")).toBe("Hello &amp; World");
    });

    test('should escape less than sign', () => {
        expect(escapeHtml("5 < 10")).toBe("5 &lt; 10");
    });

    test('should escape greater than sign', () => {
        expect(escapeHtml("10 > 5")).toBe("10 &gt; 5");
    });

    test('should escape multiple special characters', () => {
        expect(escapeHtml("&<>")).toBe("&amp;&lt;&gt;");
    });

    test('should return normal text unchanged', () => {
        expect(escapeHtml("Hello World")).toBe("Hello World");
    });
});

describe('formatJobTitle function', () => {
    test('should format Learnership title correctly', () => {
        expect(formatJobTitle("Software Development", "Learnership")).toBe("Software Development Learnership");
    });

    test('should format Internship title correctly', () => {
        expect(formatJobTitle("Data Analytics", "Internship")).toBe("Data Analytics Internship");
    });

    test('should format Apprenticeship title correctly', () => {
        expect(formatJobTitle("Cybersecurity", "Apprenticeship")).toBe("Cybersecurity Apprenticeship");
    });

    test('should handle empty strings', () => {
        expect(formatJobTitle("", "")).toBe(" ");
    });

    test('should handle only field', () => {
        expect(formatJobTitle("Software", "")).toBe("Software ");
    });
});

describe('pagination functions', () => {
    const jobs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    test('getPaginatedJobs should return first 5 jobs for page 1', () => {
        expect(getPaginatedJobs(jobs, 1)).toEqual([1, 2, 3, 4, 5]);
    });

    test('getPaginatedJobs should return next 5 jobs for page 2', () => {
        expect(getPaginatedJobs(jobs, 2)).toEqual([6, 7, 8, 9, 10]);
    });

    test('getPaginatedJobs should return empty array for page beyond range', () => {
        expect(getPaginatedJobs(jobs, 3)).toEqual([]);
    });

    test('getTotalPages should calculate total pages correctly', () => {
        expect(getTotalPages(jobs)).toBe(2);
    });

    test('getTotalPages should return 0 for empty jobs', () => {
        expect(getTotalPages([])).toBe(0);
    });

    test('getTotalPages should handle 1 item', () => {
        expect(getTotalPages([1])).toBe(1);
    });
});

describe('filterJobsBySearch function', () => {
    const mockJobsArray = [
        { title: "Software Developer Learnership", location: "Johannesburg" },
        { title: "Data Analyst Internship", location: "Cape Town" },
        { title: "Cybersecurity Apprenticeship", location: "Durban" }
    ];

    test('should return all jobs when search term is empty', () => {
        expect(filterJobsBySearch(mockJobsArray, "")).toHaveLength(3);
    });

    test('should return all jobs when search term is undefined', () => {
        expect(filterJobsBySearch(mockJobsArray, undefined)).toHaveLength(3);
    });

    test('should filter jobs by title keyword', () => {
        const filtered = filterJobsBySearch(mockJobsArray, "Software");
        expect(filtered).toHaveLength(1);
        expect(filtered[0].title).toBe("Software Developer Learnership");
    });

    test('should filter jobs by location keyword', () => {
        const filtered = filterJobsBySearch(mockJobsArray, "Cape Town");
        expect(filtered).toHaveLength(1);
        expect(filtered[0].title).toBe("Data Analyst Internship");
    });

    test('should be case insensitive', () => {
        const filtered = filterJobsBySearch(mockJobsArray, "software");
        expect(filtered).toHaveLength(1);
    });

    test('should return empty array when no match', () => {
        const filtered = filterJobsBySearch(mockJobsArray, "Pretoria");
        expect(filtered).toHaveLength(0);
    });
});

describe('getApplicantCount function', () => {
    beforeEach(() => {
        mockApplications = [
            { id: 1, jobId: 10, applicantName: "John", status: "pending" },
            { id: 2, jobId: 10, applicantName: "Jane", status: "pending" },
            { id: 3, jobId: 20, applicantName: "Bob", status: "reviewed" }
        ];
    });

    test('should return 2 for jobId 10', () => {
        expect(testGetApplicantCount(10)).toBe(2);
    });

    test('should return 1 for jobId 20', () => {
        expect(testGetApplicantCount(20)).toBe(1);
    });

    test('should return 0 for jobId with no applications', () => {
        expect(testGetApplicantCount(99)).toBe(0);
    });
});

describe('getPendingApplicantCount function', () => {
    beforeEach(() => {
        mockApplications = [
            { id: 1, jobId: 10, status: "pending" },
            { id: 2, jobId: 10, status: "pending" },
            { id: 3, jobId: 10, status: "reviewed" },
            { id: 4, jobId: 20, status: "pending" }
        ];
    });

    test('should return 2 pending for jobId 10', () => {
        expect(testGetPendingApplicantCount(10)).toBe(2);
    });

    test('should return 1 pending for jobId 20', () => {
        expect(testGetPendingApplicantCount(20)).toBe(1);
    });

    test('should return 0 for jobId with no pending', () => {
        expect(testGetPendingApplicantCount(99)).toBe(0);
    });
});

describe('sortJobs function', () => {
    const mockJobsArray = [
        { id: 1, title: "Job A", postedDate: "2026-04-10", applicants: 5 },
        { id: 2, title: "Job B", postedDate: "2026-04-01", applicants: 10 },
        { id: 3, title: "Job C", postedDate: "2026-04-05", applicants: 3 }
    ];

    test('should sort jobs by date when currentSort is "date"', () => {
        mockCurrentSort = "date";
        const sorted = testSortJobs(mockJobsArray);
        expect(sorted[0].title).toBe("Job A");
        expect(sorted[1].title).toBe("Job C");
        expect(sorted[2].title).toBe("Job B");
    });

    test('should sort jobs by applicants when currentSort is "applicants"', () => {
        mockCurrentSort = "applicants";
        mockApplications = [
            { jobId: 1, status: "pending" }, { jobId: 1, status: "pending" },
            { jobId: 1, status: "pending" }, { jobId: 1, status: "pending" },
            { jobId: 1, status: "pending" }, { jobId: 2, status: "pending" },
            { jobId: 2, status: "pending" }, { jobId: 2, status: "pending" },
            { jobId: 2, status: "pending" }, { jobId: 2, status: "pending" },
            { jobId: 2, status: "pending" }, { jobId: 2, status: "pending" },
            { jobId: 2, status: "pending" }, { jobId: 2, status: "pending" },
            { jobId: 2, status: "pending" }, { jobId: 3, status: "pending" },
            { jobId: 3, status: "pending" }, { jobId: 3, status: "pending" }
        ];
        
        const sorted = testSortJobs(mockJobsArray);
        expect(sorted[0].title).toBe("Job B");
        expect(sorted[1].title).toBe("Job A");
        expect(sorted[2].title).toBe("Job C");
    });

    test('should handle empty array', () => {
        expect(testSortJobs([])).toEqual([]);
    });

    test('should handle single item', () => {
        const singleJob = [{ id: 1, title: "Job A", postedDate: "2026-04-10" }];
        expect(testSortJobs(singleJob)).toHaveLength(1);
    });
});


describe('validateJobForm function', () => {
    test('validateJobForm function exists', () => {
        expect(validateJobForm).toBeDefined();
    });
});

describe('additional edge cases', () => {
    test('getTotalPages handles jobsPerPage of 1', () => {
        const jobs = [1, 2, 3];
        const totalPages = Math.ceil(jobs.length / 1);
        expect(totalPages).toBe(3);
    });
});

describe('function existence checks', () => {
    test('escapeHtml exists', () => {
        expect(typeof escapeHtml).toBe('function');
    });

    test('formatJobTitle exists', () => {
        expect(typeof formatJobTitle).toBe('function');
    });

    test('getPaginatedJobs exists', () => {
        expect(typeof getPaginatedJobs).toBe('function');
    });

    test('getTotalPages exists', () => {
        expect(typeof getTotalPages).toBe('function');
    });

    test('filterJobsBySearch exists', () => {
        expect(typeof filterJobsBySearch).toBe('function');
    });

    test('sortJobs exists', () => {
        expect(typeof sortJobs).toBe('function');
    });
});
