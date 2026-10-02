// content.js - ApplyPulse AI Injected Form Engine & HUD

(function () {
    if (window.hasApplyPulseLoaded) return;
    window.hasApplyPulseLoaded = true;

    // Detect ATS Platform
    function detectPlatform() {
        const host = window.location.hostname.toLowerCase();
        if (host.includes('myworkdayjobs.com') || host.includes('workday.com')) return 'Workday';
        if (host.includes('greenhouse.io')) return 'Greenhouse';
        if (host.includes('lever.co')) return 'Lever';
        if (host.includes('ashbyhq.com')) return 'Ashby';
        if (host.includes('bamboohr.com')) return 'BambooHR';
        if (host.includes('smartrecruiters.com')) return 'SmartRecruiters';
        if (host.includes('taleo.net')) return 'Taleo';
        if (host.includes('icims.com')) return 'iCIMS';
        if (host.includes('rippling.com')) return 'Rippling';
        return 'Standard ATS';
    }

    const platform = detectPlatform();

    // Helper: simulate natural React/Vue/Angular input update
    function setNativeValue(element, value) {
        if (!element || value === undefined || value === null) return false;
        
        const prototype = Object.getPrototypeOf(element);
        const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value') || 
                           Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value') ||
                           Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');

        if (descriptor && descriptor.set) {
            descriptor.set.call(element, value);
        } else {
            element.value = value;
        }

        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
        
        element.classList.add('applypulse-autofilled');
        return true;
    }

    // Helper: set select element by text matching
    function setSelectValue(selectElem, targetText) {
        if (!selectElem) return false;
        const normalized = targetText.toLowerCase();
        for (let i = 0; i < selectElem.options.length; i++) {
            const opt = selectElem.options[i];
            const optText = opt.text.toLowerCase();
            const optVal = opt.value.toLowerCase();
            if (optText.includes(normalized) || optVal.includes(normalized)) {
                selectElem.selectedIndex = i;
                selectElem.dispatchEvent(new Event('change', { bubbles: true }));
                selectElem.classList.add('applypulse-autofilled');
                return true;
            }
        }
        return false;
    }

    // Helper: click radio or checkbox matching keyword
    function setRadioOrCheckbox(containerOrName, targetValueBool) {
        const targetStr = targetValueBool ? "yes" : "no";
        // search for inputs within context
        const radios = document.querySelectorAll(`input[type="radio"], input[type="checkbox"]`);
        radios.forEach(r => {
            const label = r.closest('label') || document.querySelector(`label[for="${r.id}"]`);
            const labelText = (label ? label.innerText : (r.value || '')).toLowerCase();
            if (targetValueBool && (labelText.startsWith('yes') || labelText === 'yes' || labelText.includes('authorized'))) {
                r.checked = true;
                r.dispatchEvent(new Event('change', { bubbles: true }));
                r.classList.add('applypulse-autofilled');
            } else if (!targetValueBool && (labelText.startsWith('no') || labelText === 'no' || labelText.includes('not require') || labelText.includes('do not'))) {
                r.checked = true;
                r.dispatchEvent(new Event('change', { bubbles: true }));
                r.classList.add('applypulse-autofilled');
            }
        });
    }

    // Matcher dictionary by field category
    const FIELD_KEYWORDS = {
        firstName: ['firstname', 'first_name', 'first-name', 'fname', 'givenname', 'given-name', 'legalnamesection_firstname'],
        lastName: ['lastname', 'last_name', 'last-name', 'lname', 'familyname', 'family-name', 'legalnamesection_lastname', 'surname'],
        fullName: ['fullname', 'full_name', 'candidate_name', 'applicant_name', 'your-name', 'your_name', 'name'],
        email: ['email', 'email_address', 'emailaddress', 'electronicmail', 'contact_email'],
        phone: ['phone', 'phonenumber', 'phone_number', 'mobile', 'cellphone', 'telephone', 'tel'],
        street: ['street', 'addressline1', 'address_line1', 'street_address', 'address1', 'streetaddress', 'street_line1'],
        city: ['city', 'locality', 'town'],
        state: ['state', 'province', 'region'],
        zipCode: ['zip', 'zipcode', 'zip_code', 'postalcode', 'postal_code', 'postcode'],
        country: ['country', 'nation'],
        linkedinUrl: ['linkedin', 'linkedin_url', 'urls[linkedin]'],
        githubUrl: ['github', 'github_url', 'urls[github]'],
        portfolioUrl: ['portfolio', 'website', 'personal_website', 'urls[portfolio]', 'site_url'],
        currentCompany: ['current_company', 'company', 'organization', 'employer', 'org'],
        currentTitle: ['current_title', 'title', 'headline', 'position', 'job_title', 'current_position'],
        yearsExperience: ['experience_years', 'years_experience', 'total_experience'],
        university: ['school', 'university', 'college', 'institution', 'school_name'],
        highestDegree: ['degree', 'education_level', 'highest_degree'],
        major: ['major', 'field_of_study', 'discipline', 'course'],
        gradYear: ['grad_year', 'graduation_year', 'end_year', 'year_of_graduation'],
        gpa: ['gpa', 'grade_point_average']
    };

    function identifyField(input) {
        const id = (input.id || '').toLowerCase();
        const name = (input.name || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        const auto = (input.autocomplete || '').toLowerCase();
        const automationId = (input.getAttribute('data-automation-id') || '').toLowerCase();
        const aria = (input.getAttribute('aria-label') || '').toLowerCase();
        
        let labelText = '';
        if (input.id) {
            const labelElem = document.querySelector(`label[for="${input.id}"]`);
            if (labelElem) labelText = labelElem.innerText.toLowerCase();
        }
        if (!labelText) {
            const parentLabel = input.closest('label');
            if (parentLabel) labelText = parentLabel.innerText.toLowerCase();
        }

        const combined = `${id} ${name} ${placeholder} ${auto} ${automationId} ${aria} ${labelText}`;

        for (const [key, keywords] of Object.entries(FIELD_KEYWORDS)) {
            // Check specific matches first (prioritize first/last name over generic "name")
            if (key === 'fullName') continue; // evaluate last
            for (const kw of keywords) {
                if (combined.includes(kw)) {
                    return key;
                }
            }
        }

        // Generic Name fallback if neither first nor last matched
        for (const kw of FIELD_KEYWORDS.fullName) {
            if (combined.includes(kw) && !combined.includes('company') && !combined.includes('school')) {
                return 'fullName';
            }
        }

        return null;
    }

    // AI Contextual Answer Synthesizer for custom textareas
    function generateSmartAnswer(questionPrompt, profile) {
        const q = (questionPrompt || '').toLowerCase();
        const company = extractJobDetails().company || "your team";
        const title = extractJobDetails().title || "this role";

        if (q.includes('why') && (q.includes('work') || q.includes('join') || q.includes('company') || q.includes('interested'))) {
            return `I have followed ${company}'s impressive growth and mission closely. With my background as a ${profile.currentTitle || 'Engineer'} at ${profile.currentCompany || 'leading tech companies'}, my core strengths in ${profile.skills.split(',').slice(0, 3).join(', ')} directly align with the technical challenges ${company} is solving. I am eager to bring my ownership mindset and execution speed to this role.`;
        }

        if (q.includes('challenge') || q.includes('difficult') || q.includes('obstacle') || q.includes('conflict')) {
            return `In my role at ${profile.currentCompany || 'my recent company'}, we faced high latency and scaling bottlenecks during peak traffic. I led a refactor of our core services using ${profile.skills.split(',')[0] || 'modern architectures'}, optimizing database queries and establishing automated CI/CD monitoring. This reduced system latency by 45% and improved uptime to 99.98%.`;
        }

        if (q.includes('salary') || q.includes('compensation') || q.includes('expectation')) {
            return `My salary expectations are competitive and aligned with the market rate for a ${profile.currentTitle || 'senior specialist'} in this location, while remaining flexible based on total compensation, equity, and team opportunities.`;
        }

        if (q.includes('sponsor') || q.includes('visa')) {
            return profile.requiresSponsorship ? 
                "I will require visa sponsorship in the future." : 
                "I am authorized to work in the United States and do not require visa sponsorship.";
        }

        // General default cover pitch
        return `${profile.summaryPitch} I am excited about the opportunity to contribute to ${company} as a ${title}.`;
    }

    // Extract Job Title & Company from Page
    function extractJobDetails() {
        let title = "";
        let company = "";

        // Check OpenGraph or Meta tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && ogTitle.content) title = ogTitle.content;

        // Check H1
        const h1 = document.querySelector('h1');
        if (!title && h1) title = h1.innerText.trim();

        // Extract Company Name
        const host = window.location.hostname;
        const subdomains = host.split('.');
        if (subdomains.length >= 3 && subdomains[0] !== 'www') {
            company = subdomains[0].charAt(0).toUpperCase() + subdomains[0].slice(1);
        } else {
            company = document.title.split('-')[0].split('|')[0].trim();
        }

        if (!title) title = document.title.split('-')[0].split('|')[0].trim();

        return {
            title: title.slice(0, 70),
            company: company.slice(0, 50),
            url: window.location.href
        };
    }

    // Main Autofill Execution
    function autofillApplication(profile) {
        let filledCount = 0;

        // 1. Text, Email, Tel, and Number inputs
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"]):not([type="radio"]):not([type="checkbox"])');
        
        inputs.forEach(input => {
            const fieldType = identifyField(input);
            if (fieldType && profile[fieldType]) {
                const success = setNativeValue(input, profile[fieldType]);
                if (success) filledCount++;
            }
        });

        // 2. Select dropdowns
        const selects = document.querySelectorAll('select');
        selects.forEach(sel => {
            const fieldType = identifyField(sel);
            if (fieldType && profile[fieldType]) {
                const success = setSelectValue(sel, profile[fieldType]);
                if (success) filledCount++;
            }
        });

        // 3. Work Authorization & Compliance Questions (Radio buttons)
        setRadioOrCheckbox(null, profile.authorizedUS);

        return filledCount;
    }

    // Attach inline AI generator buttons to Textareas
    function injectInlineAIBadges(profile) {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(ta => {
            if (ta.dataset.applypulseInjected) return;
            ta.dataset.applypulseInjected = "true";

            // Find question prompt
            let questionPrompt = "";
            const label = document.querySelector(`label[for="${ta.id}"]`) || ta.closest('label');
            if (label) questionPrompt = label.innerText;
            if (!questionPrompt) questionPrompt = ta.placeholder || ta.getAttribute('aria-label') || "Cover Note";

            const badge = document.createElement('button');
            badge.type = "button";
            badge.className = "applypulse-ai-badge";
            badge.innerHTML = `<span>✨ AI Draft Answer</span>`;
            badge.title = "Generate a tailored answer based on your profile";

            badge.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const smartAns = generateSmartAnswer(questionPrompt, profile);
                setNativeValue(ta, smartAns);
            });

            // Insert badge right before or after textarea
            if (ta.parentNode) {
                ta.parentNode.insertBefore(badge, ta);
            }
        });
    }

    // Render Floating HUD
    function renderHUD(profile, status) {
        const existing = document.getElementById('applypulse-hud-root');
        if (existing) existing.remove();

        const root = document.createElement('div');
        root.id = 'applypulse-hud-root';

        const jobInfo = extractJobDetails();

        root.innerHTML = `
            <!-- Minimized Pill -->
            <div class="applypulse-pill" id="ap-pill">
                <div class="applypulse-pill-logo">⚡</div>
                <div class="applypulse-pill-title">ApplyPulse AI</div>
                <div class="applypulse-pill-badge">${platform}</div>
                <button class="applypulse-pill-quick-btn" id="ap-quick-fill-btn">⚡ Autofill</button>
            </div>

            <!-- Expanded Drawer -->
            <div class="applypulse-drawer" id="ap-drawer">
                <div class="applypulse-header">
                    <div class="applypulse-brand">
                        <div class="applypulse-pill-logo">⚡</div>
                        <span class="applypulse-brand-text">ApplyPulse AI Copilot</span>
                    </div>
                    <div class="applypulse-header-actions">
                        <button class="applypulse-icon-btn" id="ap-close-btn" title="Minimize">✕</button>
                    </div>
                </div>

                <div class="applypulse-body">
                    <div class="applypulse-ats-status">
                        <span class="applypulse-ats-label">Detected Portal:</span>
                        <span class="applypulse-ats-tag">
                            <span class="applypulse-ats-dot"></span>
                            ${platform}
                        </span>
                    </div>

                    <button class="applypulse-primary-btn" id="ap-main-fill-btn">
                        <span>⚡ 1-Click Autofill Form</span>
                    </button>

                    <button class="applypulse-secondary-btn" id="ap-save-job-btn">
                        <span>💾 Save to Job Tracker</span>
                    </button>

                    <div class="applypulse-stats-box" id="ap-stats-box"></div>

                    <div class="applypulse-profile-preview">
                        <div><strong>Active Candidate:</strong> ${profile.fullName || profile.firstName}</div>
                        <div><strong>Role:</strong> ${profile.currentTitle || 'Applicant'}</div>
                        <div><strong>Target:</strong> ${jobInfo.company || 'Current Company'}</div>
                    </div>
                </div>

                <div class="applypulse-footer">
                    <span>${status.isPro ? '⭐ Pro Unlimited' : `Free: ${status.settings.dailyCount || 0}/${status.settings.freeLimit || 5} today`}</span>
                    <a href="#" id="ap-open-settings">Edit Profile ⚙️</a>
                </div>
            </div>
        `;

        document.body.appendChild(root);

        // UI Interactions
        const pill = document.getElementById('ap-pill');
        const drawer = document.getElementById('ap-drawer');
        const closeBtn = document.getElementById('ap-close-btn');
        const quickFillBtn = document.getElementById('ap-quick-fill-btn');
        const mainFillBtn = document.getElementById('ap-main-fill-btn');
        const saveJobBtn = document.getElementById('ap-save-job-btn');
        const statsBox = document.getElementById('ap-stats-box');
        const openSettings = document.getElementById('ap-open-settings');

        function showDrawer() {
            pill.style.display = 'none';
            drawer.style.display = 'block';
        }

        function hideDrawer() {
            drawer.style.display = 'none';
            pill.style.display = 'flex';
        }

        pill.addEventListener('click', (e) => {
            if (e.target !== quickFillBtn) showDrawer();
        });

        closeBtn.addEventListener('click', hideDrawer);

        function triggerFill() {
            chrome.runtime.sendMessage({ action: "GET_PROFILE_AND_STATUS" }, (res) => {
                if (!res || !res.canAutofill) {
                    alert("⚡ Daily free limit reached (5/5). Upgrade to ApplyPulse Pro for unlimited 1-click autofills!");
                    return;
                }

                const count = autofillApplication(res.profile);
                chrome.runtime.sendMessage({ action: "RECORD_AUTOFILL_USAGE" });

                statsBox.style.display = 'block';
                statsBox.innerHTML = `<strong>✨ Success!</strong> ${count} application fields populated.`;
                showDrawer();

                setTimeout(() => {
                    statsBox.style.display = 'none';
                }, 5000);
            });
        }

        quickFillBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerFill();
        });

        mainFillBtn.addEventListener('click', triggerFill);

        saveJobBtn.addEventListener('click', () => {
            const job = extractJobDetails();
            chrome.runtime.sendMessage({ action: "SAVE_TRACKED_JOB", job: { ...job, status: "Applied" } }, (res) => {
                saveJobBtn.innerHTML = `<span>✔ Job Saved to Tracker!</span>`;
                saveJobBtn.style.borderColor = '#10b981';
                saveJobBtn.style.color = '#6ee7b7';
                setTimeout(() => {
                    saveJobBtn.innerHTML = `<span>💾 Save to Job Tracker</span>`;
                    saveJobBtn.style.borderColor = '';
                    saveJobBtn.style.color = '';
                }, 3000);
            });
        });

        openSettings.addEventListener('click', (e) => {
            e.preventDefault();
            alert("Click the ApplyPulse extension icon in your Chrome toolbar to edit your profile, view your job tracker, or export to CSV!");
        });
    }

    // Initialize extension on page load
    chrome.runtime.sendMessage({ action: "GET_PROFILE_AND_STATUS" }, (res) => {
        if (!res) return;
        renderHUD(res.profile, res);
        injectInlineAIBadges(res.profile);

        // Periodically check for dynamically added textareas (e.g. Workday multi-step wizards)
        const observer = new MutationObserver(() => {
            injectInlineAIBadges(res.profile);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });

    // Listen for background context menu triggers
    chrome.runtime.onMessage.addListener((req) => {
        if (req.action === "TRIGGER_AUTOFILL") {
            chrome.runtime.sendMessage({ action: "GET_PROFILE_AND_STATUS" }, (res) => {
                if (res) autofillApplication(res.profile);
            });
        }
    });

})();
