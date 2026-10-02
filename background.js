// background.js - ApplyPulse AI Service Worker
try {
    importScripts('ExtPay.js');
} catch (e) {
    console.warn("ExtPay script import note:", e);
}

const DEFAULT_PROFILE = {
    firstName: "Alex",
    lastName: "Taylor",
    fullName: "Alex Taylor",
    email: "alex.taylor@example.com",
    phone: "+1 (555) 349-2041",
    street: "742 Evergreen Terrace",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    country: "United States",
    linkedinUrl: "https://linkedin.com/in/alextaylor-pro",
    githubUrl: "https://github.com/alextaylor-dev",
    portfolioUrl: "https://alextaylor.design",
    currentCompany: "NextGen Technologies",
    currentTitle: "Senior Software Engineer",
    yearsExperience: "6",
    highestDegree: "Bachelor's Degree",
    university: "University of California, Berkeley",
    major: "Computer Science",
    gradYear: "2019",
    gpa: "3.85",
    skills: "React, TypeScript, Node.js, Python, AWS, Docker, GraphQL, System Design, REST APIs, Microservices",
    authorizedUS: true,
    requiresSponsorship: false,
    veteranStatus: "No",
    disabilityStatus: "No",
    gender: "Decline to identify",
    race: "Decline to identify",
    preferredTone: "Confident & Concise",
    summaryPitch: "High-impact Full-Stack Engineer with 6+ years driving scalable web architectures, microservices, and high-conversion client-facing apps. Passionate about rapid iteration, clean code, and zero-downtime deployments."
};

chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.sync.get(['applypulse_profile', 'applypulse_tracker', 'applypulse_settings'], (res) => {
        if (!res.applypulse_profile) {
            chrome.storage.sync.set({ applypulse_profile: DEFAULT_PROFILE });
        }
        if (!res.applypulse_tracker) {
            chrome.storage.sync.set({ applypulse_tracker: [] });
        }
        if (!res.applypulse_settings) {
            chrome.storage.sync.set({
                applypulse_settings: {
                    dailyCount: 0,
                    lastResetDate: new Date().toDateString(),
                    freeLimit: 5,
                    devMode: false,
                    devIsPro: false
                }
            });
        }
    });

    // Create Context Menu
    chrome.contextMenus.create({
        id: "applypulse_autofill_page",
        title: "⚡ ApplyPulse: Autofill Application",
        contexts: ["page", "editable"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "applypulse_autofill_page" && tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_AUTOFILL" });
    }
});

// Message Listener from Content Script or Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_PROFILE_AND_STATUS") {
        chrome.storage.sync.get(['applypulse_profile', 'applypulse_settings'], (data) => {
            const settings = data.applypulse_settings || { dailyCount: 0, lastResetDate: new Date().toDateString(), freeLimit: 5 };
            const today = new Date().toDateString();
            
            if (settings.lastResetDate !== today) {
                settings.dailyCount = 0;
                settings.lastResetDate = today;
                chrome.storage.sync.set({ applypulse_settings: settings });
            }

            const isPro = (settings.devMode && settings.devIsPro) || false;

            sendResponse({
                profile: data.applypulse_profile || DEFAULT_PROFILE,
                settings: settings,
                isPro: isPro,
                canAutofill: isPro || (settings.dailyCount < settings.freeLimit)
            });
        });
        return true; // Keep channel open for async response
    }

    if (request.action === "RECORD_AUTOFILL_USAGE") {
        chrome.storage.sync.get(['applypulse_settings'], (data) => {
            const settings = data.applypulse_settings || { dailyCount: 0, lastResetDate: new Date().toDateString(), freeLimit: 5 };
            settings.dailyCount = (settings.dailyCount || 0) + 1;
            chrome.storage.sync.set({ applypulse_settings: settings }, () => {
                sendResponse({ success: true, newCount: settings.dailyCount });
            });
        });
        return true;
    }

    if (request.action === "SAVE_TRACKED_JOB") {
        chrome.storage.sync.get(['applypulse_tracker'], (data) => {
            let tracker = data.applypulse_tracker || [];
            const newJob = request.job;
            
            // Check if already exists by URL
            const existingIndex = tracker.findIndex(j => j.url === newJob.url);
            if (existingIndex >= 0) {
                tracker[existingIndex] = { ...tracker[existingIndex], ...newJob, updated: new Date().toISOString() };
            } else {
                tracker.unshift({ ...newJob, id: 'job_' + Date.now(), savedAt: new Date().toISOString() });
            }
            
            chrome.storage.sync.set({ applypulse_tracker: tracker }, () => {
                sendResponse({ success: true, count: tracker.length });
            });
        });
        return true;
    }
});
