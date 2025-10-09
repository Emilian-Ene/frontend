document.addEventListener("DOMContentLoaded", () => {
    const saveAllChangesBtn = document.getElementById("saveAllChanges");
    const deleteAccountBtn = document.getElementById("deleteAccountBtn");
    const passwordChangeForm = document.getElementById("passwordChangeForm");
    // Get token from both localStorage and sessionStorage
    const getAuthToken = () => {
        return localStorage.getItem("token") || sessionStorage.getItem("token");
    };
    const token = getAuthToken();

    // --- Utility Functions ---
    const showMessageBox = (message, type, duration = 3000) => {
        const el = document.getElementById("messageBox");
        el.textContent = message;
        el.className = "fixed bottom-5 right-5 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-base transition-all duration-300 transform opacity-100 translate-x-0";
        if (type === "success") el.classList.add("bg-green-600");
        else if (type === "error") el.classList.add("bg-red-600");
        else el.classList.add("bg-blue-600");
        setTimeout(() => {
            el.classList.add("translate-x-full", "opacity-0");
        }, duration);
    };

    // Function to clear user-specific localStorage data
    function clearUserSpecificData() {
        // Get all localStorage keys
        const keys = Object.keys(localStorage);
        
        // Remove all keys that contain user-specific data patterns
        keys.forEach(key => {
            if (key.includes('tradingJournalSettings_') || 
                key.includes('tradingJournalTrades_') ||
                key.includes('_user_')) {
                localStorage.removeItem(key);
            }
        });
    }

    const showConfirmModal = (message) => {
        return new Promise((resolve) => {
            const modal = document.getElementById("confirmModal");
            document.getElementById("confirmMessage").textContent = message;
            modal.classList.add("active");
            const yesBtn = document.getElementById("confirmYes");
            const noBtn = document.getElementById("confirmNo");
            const cleanup = (result) => {
                modal.classList.remove("active");
                yesBtn.replaceWith(yesBtn.cloneNode(true));
                noBtn.replaceWith(noBtn.cloneNode(true));
                resolve(result);
            };
            yesBtn.addEventListener("click", () => cleanup(true), { once: true });
            noBtn.addEventListener("click", () => cleanup(false), { once: true });
        });
    };

    const headers = {
        "Content-Type": "application/json",
        "x-auth-token": token,
    };

    // Prefer event-based subscription (auth.js dispatches 'user:data')
    const handleUserData = (user) => {
        fillProfileForm(user);
        checkProfileCompleteness(user);
        // Google password badge logic
        const badge = document.getElementById('googlePasswordBadge');
        const info = document.getElementById('googlePasswordInfo');
        if (badge && info && user.authProvider === 'google') {
            if (user.passwordSet === false) {
                badge.classList.remove('hidden');
                info.classList.add('hidden');
                // Hide current password field for first set
                const currentGroup = document.querySelector('#currentPassword')?.closest('.form-group');
                if (currentGroup) currentGroup.style.display = 'none';
            } else {
                info.classList.remove('hidden');
                badge.classList.add('hidden');
            }
        }
    };
    document.addEventListener('user:data', (e) => handleUserData(e.detail));
    // If user already fetched before this script loaded
    if (window.currentUser) handleUserData(window.currentUser);

    const fillProfileForm = (user) => {
        document.getElementById("email").value = user.email || '';
        document.getElementById("firstName").value = user.firstName || '';
        document.getElementById("lastName").value = user.lastName || '';
        document.getElementById("title").value = user.title || 'Mr.';
        document.getElementById("contactPhone").value = user.contactPhone || '';
        document.getElementById("country").value = user.country || 'United Kingdom';
        document.getElementById("city").value = user.city || '';
        document.getElementById("street").value = user.street || '';
        document.getElementById("postalCode").value = user.postalCode || '';
        document.getElementById("username").value = user.email || '';
        document.getElementById("language").value = user.language || 'English';
        document.getElementById("timezone").value = user.timezone || 'Autodetected';
        document.getElementById("googleAiKey").value = user.googleAiKey || '';
    };

    const checkProfileCompleteness = (user) => {
        const notice = document.getElementById("incompleteProfileNotice");
        const requiredFields = ['firstName', 'lastName', 'title', 'contactPhone', 'country', 'city', 'street', 'postalCode'];
        
        const isComplete = requiredFields.every(field => user[field] && user[field].trim() !== '');

        if (isComplete) {
            notice.classList.add('hidden');
        } else {
            notice.classList.remove('hidden');
        }
    };

    // Save all changes
    const saveChanges = async () => {
        const updatedData = {
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            title: document.getElementById("title").value,
            contactPhone: document.getElementById("contactPhone").value,
            country: document.getElementById("country").value,
            city: document.getElementById("city").value,
            street: document.getElementById("street").value,
            postalCode: document.getElementById("postalCode").value,
            language: document.getElementById("language").value,
            timezone: document.getElementById("timezone").value,
        };

        try {
            const res = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers,
                body: JSON.stringify(updatedData),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                // Use the globally available function from auth.js to update the header
                if (window.updateUserDisplay) {
                    window.updateUserDisplay(updatedUser);
                }
                // Re-populate the form with the confirmed data from the server
                fillProfileForm(updatedUser);
                // Re-check completeness after saving
                checkProfileCompleteness(updatedUser);
                showMessageBox("Profile updated successfully!", "success");
            } else {
                showMessageBox("Failed to update profile.", "error");
            }
        } catch (err) {
            console.error("Error saving profile data:", err);
            showMessageBox("An error occurred. Please try again.", "error");
        }
    };

    const saveAiKey = async (e) => {
        e.preventDefault();
        const apiKey = document.getElementById("googleAiKey").value;
        try {
            const res = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers,
                body: JSON.stringify({ googleAiKey: apiKey }),
            });
            if (res.ok) {
                showMessageBox("API Key saved successfully!", "success");
            } else {
                showMessageBox("Failed to save API Key.", "error");
            }
        } catch (err) {
            showMessageBox("An error occurred.", "error");
        }
    };

    const deleteApiKey = async () => {
        const confirmed = await showConfirmModal("Are you sure you want to delete your API key? This action cannot be undone.");
        if (confirmed) {
            try {
                const res = await fetch('http://localhost:5000/api/profile', {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({ googleAiKey: '' }), // Set the key to an empty string
                });
                if (res.ok) {
                    document.getElementById("googleAiKey").value = '';
                    showMessageBox("API Key deleted successfully!", "success");
                } else {
                    showMessageBox("Failed to delete API Key.", "error");
                }
            } catch (err) {
                showMessageBox("An error occurred.", "error");
            }
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = await showConfirmModal("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmed) {
            try {
                const res = await fetch('http://localhost:5000/api/profile', {
                    method: 'DELETE',
                    headers,
                });
                if (res.ok) {
                    // Clear all authentication tokens
                    localStorage.removeItem("token");
                    sessionStorage.removeItem("token");
                    localStorage.removeItem("rememberMe");
                    localStorage.removeItem("savedEmail");
                    
                    // Clear all user-specific dashboard settings and trades
                    clearUserSpecificData();
                    
                    window.location.href = "index.html";
                } else {
                    showMessageBox("Failed to delete account.", "error");
                }
            } catch (err) {
                showMessageBox("An error occurred. Please try again.", "error");
            }
        }
    };

    if (saveAllChangesBtn) {
        saveAllChangesBtn.addEventListener("click", saveChanges);
    }

    const aiKeyForm = document.getElementById("aiKeyForm");
    if (aiKeyForm) {
        aiKeyForm.addEventListener("submit", saveAiKey);
    }

    const deleteApiKeyBtn = document.getElementById("deleteApiKeyBtn");
    if (deleteApiKeyBtn) {
        deleteApiKeyBtn.addEventListener("click", deleteApiKey);
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener("click", handleDeleteAccount);
    }

    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const isGoogleFirstSet = window.currentUser && window.currentUser.authProvider === 'google' && window.currentUser.passwordSet === false;
            if (!newPassword) {
                showMessageBox('Enter a new password.', 'error');
                return;
            }
            if (!isGoogleFirstSet && !currentPassword) {
                showMessageBox('Please fill current & new password.', 'error');
                return;
            }
            if (newPassword !== confirmPassword) {
                showMessageBox('New password and confirmation do not match.', 'error');
                return;
            }
            try {
                const res = await fetch('http://localhost:5000/api/auth/change-password', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                let data = {};
                try { data = await res.json(); } catch(_) {}
                if (res.ok) {
                    if (isGoogleFirstSet) {
                        // Update local user flag so badge switches state
                        if (window.currentUser) window.currentUser.passwordSet = true;
                    }
                    showMessageBox(data.msg || (isGoogleFirstSet ? 'Password set.' : 'Password updated.'), 'success');
                    passwordChangeForm.reset();
                } else {
                    console.warn('Password change failed', res.status, data);
                    showMessageBox(data.msg || `Failed (${res.status}).`, 'error');
                }
            } catch (err) {
                showMessageBox('Server error changing password.', 'error');
                console.error('Password change network error', err);
            }
        });
    }

    // Initialize eye toggle buttons
    document.querySelectorAll('.pw-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
            btn.setAttribute('aria-label', (show ? 'Hide' : 'Show') + (targetId === 'googleAiKey' ? ' API key' : ' password'));
        });
    });

    // --- Profile Page Tabs ---
    const tabItems = document.querySelectorAll(".tab-item");
    const tabContents = document.querySelectorAll(".tab-content");

    tabItems.forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = tab.dataset.tab;

            // Update active tab
            tabItems.forEach(item => item.classList.remove("active"));
            tab.classList.add("active");

            // Update active content
            tabContents.forEach(content => {
                if (content.id === targetId) {
                    content.classList.add("active");
                } else {
                    content.classList.remove("active");
                }
            });
        });
    });

    // --- Live Clock Functionality ---
    let clockInterval;
    
    function updateClock() {
        const now = new Date();
        const timezoneSelect = document.getElementById('timezone');
        const selectedTimezone = timezoneSelect ? timezoneSelect.value : 'UTC';
        
        // Map common timezone values to valid timezone identifiers
        const timezoneMap = {
            'Autodetected': Intl.DateTimeFormat().resolvedOptions().timeZone,
            'UTC': 'UTC',
            'Europe - London (GMT)': 'Europe/London',           // GMT
            // Major Trading Hubs
            'America - New_York (EST)': 'America/New_York',        // Eastern Standard Time (US)
            'America - Chicago (CST)': 'America/Chicago',         // Central Standard Time (US)
            'America - Denver (MST)': 'America/Denver',          // Mountain Standard Time (US)
            'America - Los_Angeles (PST)': 'America/Los_Angeles',     // Pacific Standard Time (US)
            'Europe - Paris (CET)': 'Europe/Paris',            // Central European Time
            'Asia - Tokyo (JST)': 'Asia/Tokyo',              // Japan Standard Time
            'Australia - Sydney (AEST)': 'Australia/Sydney',       // Australian Eastern Standard Time
            'Asia - Hong_Kong (HKT)': 'Asia/Hong_Kong',          // Hong Kong Time
            'Asia - Singapore (SGT)': 'Asia/Singapore',          // Singapore Time
            // Additional Popular Timezones
            'Asia - Kolkata (IST)': 'Asia/Kolkata',            // India Standard Time
            'Africa - Johannesburg (CAT)': 'Africa/Johannesburg',     // Central Africa Time
            'America - Sao_Paulo (BRT)': 'America/Sao_Paulo',       // Brazil Time
            'America - Buenos_Aires (ART)': 'America/Argentina/Buenos_Aires', // Argentina Time
            'Pacific - Auckland (NZST)': 'Pacific/Auckland',       // New Zealand Standard Time
            'America - Halifax (AST)': 'America/Halifax',         // Atlantic Standard Time
            'Europe - Moscow (MSK)': 'Europe/Moscow',           // Moscow Standard Time
            'Asia - Dubai (GST)': 'Asia/Dubai',              // Gulf Standard Time
            'Asia - Seoul (KST)': 'Asia/Seoul',              // Korea Standard Time
            'Asia - Jakarta (WIB)': 'Asia/Jakarta'             // Western Indonesian Time
        };
        
        const actualTimezone = timezoneMap[selectedTimezone] || selectedTimezone || 'UTC';
        
        try {
            // Format time according to selected timezone
            const timeFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: actualTimezone,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const dateFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: actualTimezone,
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const timeString = timeFormatter.format(now);
            const dateString = dateFormatter.format(now);
            
            // Update clock display
            const clockElement = document.getElementById('digitalClock');
            const dateElement = document.getElementById('currentDate');
            const timezoneElement = document.getElementById('currentTimezone');
            
            if (clockElement) clockElement.textContent = timeString;
            if (dateElement) dateElement.textContent = dateString;
            if (timezoneElement) timezoneElement.textContent = selectedTimezone;
            
        } catch (error) {
            console.warn('Error updating clock:', error);
            // Fallback to local time
            const timeString = now.toLocaleTimeString('en-US', { hour12: false });
            const dateString = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            
            const clockElement = document.getElementById('digitalClock');
            const dateElement = document.getElementById('currentDate');
            
            if (clockElement) clockElement.textContent = timeString;
            if (dateElement) dateElement.textContent = dateString;
        }
    }
    
    function initializeClock() {
        // Use enhanced clock function that respects timezone selector
        updateEnhancedClock();
        
        // Update every second with enhanced clock
        clockInterval = setInterval(updateEnhancedClock, 1000);
        
        // Update when timezone changes
        const timezoneSelect = document.getElementById('timezone');
        if (timezoneSelect) {
            timezoneSelect.addEventListener('change', updateEnhancedClock);
        }
    }
    
    // Initialize clock when page loads
    initializeClock();
    
    // Cleanup interval when page unloads
    window.addEventListener('beforeunload', () => {
        if (clockInterval) {
            clearInterval(clockInterval);
        }
    });

    // === Weather and Enhanced Clock Functionality ===
    
    // Weather configuration
    let isManualLocation = false;
    let manualLocationName = 'London, England'; // Default location set to London
    
    // Enhanced clock functionality that respects timezone selector
    function updateEnhancedClock() {
        const now = new Date();
        const timezoneSelect = document.getElementById('timezone');
        const selectedTimezone = timezoneSelect ? timezoneSelect.value : 'Autodetected';
        
        // Map common timezone values to valid timezone identifiers
        const timezoneMap = {
            'Autodetected': Intl.DateTimeFormat().resolvedOptions().timeZone,
            'UTC': 'UTC',
            'Europe - London (GMT)': 'Europe/London',
            // Major Trading Hubs
            'America - New_York (EST)': 'America/New_York',
            'America - Chicago (CST)': 'America/Chicago',
            'America - Denver (MST)': 'America/Denver',
            'America - Los_Angeles (PST)': 'America/Los_Angeles',
            'Europe - Paris (CET)': 'Europe/Paris',
            'Asia - Tokyo (JST)': 'Asia/Tokyo',
            'Australia - Sydney (AEST)': 'Australia/Sydney',
            'Asia - Hong_Kong (HKT)': 'Asia/Hong_Kong',
            'Asia - Singapore (SGT)': 'Asia/Singapore',
            // Additional Popular Timezones
            'Asia - Kolkata (IST)': 'Asia/Kolkata',
            'Africa - Johannesburg (CAT)': 'Africa/Johannesburg',
            'America - Sao_Paulo (BRT)': 'America/Sao_Paulo',
            'America - Buenos_Aires (ART)': 'America/Argentina/Buenos_Aires',
            'Pacific - Auckland (NZST)': 'Pacific/Auckland',
            'America - Halifax (AST)': 'America/Halifax',
            'Europe - Moscow (MSK)': 'Europe/Moscow',
            'Asia - Dubai (GST)': 'Asia/Dubai',
            'Asia - Seoul (KST)': 'Asia/Seoul',
            'Asia - Jakarta (WIB)': 'Asia/Jakarta'
        };
        
        const actualTimezone = timezoneMap[selectedTimezone] || selectedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        try {
            // Format time according to selected timezone
            const timeFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: actualTimezone,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const dateFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: actualTimezone,
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const timeString = timeFormatter.format(now);
            const dateString = dateFormatter.format(now);
            
            // Update clock display elements
            const clockElement = document.getElementById('digitalClock');
            const dateElement = document.getElementById('currentDate');
            const timezoneElement = document.getElementById('currentTimezone');
            
            if (clockElement) clockElement.textContent = timeString;
            if (dateElement) dateElement.textContent = dateString;
            
            // Update timezone display with proper formatting
            if (timezoneElement) {
                // Show the selected timezone name for user clarity
                timezoneElement.textContent = selectedTimezone === 'Autodetected' 
                    ? actualTimezone.replace('_', ' ') 
                    : selectedTimezone;
            }
            
        } catch (error) {
            console.warn('Error updating enhanced clock:', error);
            // Fallback to local time
            const timeString = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const dateString = now.toLocaleDateString('en-US', { 
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const clockElement = document.getElementById('digitalClock');
            const dateElement = document.getElementById('currentDate');
            const timezoneElement = document.getElementById('currentTimezone');
            
            if (clockElement) clockElement.textContent = timeString;
            if (dateElement) dateElement.textContent = dateString;
            if (timezoneElement) {
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                timezoneElement.textContent = timezone.replace('_', ' ');
            }
        }
    }

    // Fetch weather for specified location (default: London)
    async function fetchWeatherForLocation() {
        const locationElement = document.getElementById('weatherLocation');
        const conditionElement = document.getElementById('weatherCondition');
        const tempElement = document.getElementById('currentTemp');
        const iconElement = document.getElementById('weatherIcon');
        const changeBtn = document.getElementById('changeLocationBtn');
        
        if (locationElement) locationElement.textContent = 'Loading...';
        if (conditionElement) conditionElement.textContent = 'Getting weather...';
        
        try {
            const weatherUrl = `https://wttr.in/${encodeURIComponent(manualLocationName)}?format=j1`;
            const response = await fetch(weatherUrl);
            const weatherData = await response.json();
            
            if (weatherData && weatherData.current_condition && weatherData.current_condition[0]) {
                const current = weatherData.current_condition[0];
                const location = weatherData.nearest_area[0];
                
                const temperature = current.temp_C;
                const condition = current.weatherDesc[0].value;
                const locationName = `${location.areaName[0].value}, ${location.country[0].value}`;
                
                const weatherIcons = {
                    'sunny': '☀️', 'clear': '☀️', 'partly cloudy': '⛅',
                    'cloudy': '☁️', 'overcast': '☁️', 'rain': '🌧️',
                    'light rain': '🌦️', 'heavy rain': '🌧️', 'snow': '🌨️',
                    'fog': '🌫️', 'thunderstorm': '⛈️'
                };
                
                const icon = weatherIcons[condition.toLowerCase()] || '🌤️';
                
                if (tempElement) tempElement.textContent = temperature + '°C';
                if (conditionElement) conditionElement.textContent = condition;
                if (locationElement) locationElement.textContent = locationName;
                if (iconElement) iconElement.textContent = icon;
                if (changeBtn) changeBtn.style.display = 'block';
            } else {
                throw new Error('Invalid weather data');
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
            if (locationElement) locationElement.textContent = 'London, England';
            if (conditionElement) conditionElement.textContent = 'Weather unavailable';
            if (tempElement) tempElement.textContent = '15°C';
            if (iconElement) iconElement.textContent = '🌤️';
            if (changeBtn) changeBtn.style.display = 'block';
        }
    }

    // Initialize weather and enhanced clock
    function initializeWeatherAndClock() {
        // Clock is already initialized by initializeClock() function above
        // Just add timezone change listener for immediate updates
        const timezoneSelect = document.getElementById('timezone');
        if (timezoneSelect) {
            // Remove any existing listener first
            timezoneSelect.removeEventListener('change', updateEnhancedClock);
            // Add the listener
            timezoneSelect.addEventListener('change', updateEnhancedClock);
        }
        
        // Set default location to London and fetch weather
        fetchWeatherForLocation();
        
        // Refresh weather every 10 minutes
        setInterval(() => {
            fetchWeatherForLocation();
        }, 600000);
        
        // Manual location controls
        const changeLocationBtn = document.getElementById('changeLocationBtn');
        const locationInput = document.getElementById('locationInput');
        const manualLocationInput = document.getElementById('manualLocation');
        const updateLocationBtn = document.getElementById('updateLocationBtn');
        const cancelLocationBtn = document.getElementById('cancelLocationBtn');
        
        if (changeLocationBtn) {
            changeLocationBtn.addEventListener('click', function() {
                if (locationInput) {
                    locationInput.classList.remove('hidden');
                    if (manualLocationInput) {
                        manualLocationInput.value = manualLocationName;
                        manualLocationInput.focus();
                    }
                }
            });
        }
        
        if (updateLocationBtn) {
            updateLocationBtn.addEventListener('click', function() {
                if (manualLocationInput) {
                    const newLocation = manualLocationInput.value.trim();
                    if (newLocation) {
                        manualLocationName = newLocation;
                        isManualLocation = true;
                        fetchWeatherForLocation();
                        if (locationInput) locationInput.classList.add('hidden');
                    }
                }
            });
        }
        
        if (cancelLocationBtn) {
            cancelLocationBtn.addEventListener('click', function() {
                if (locationInput) locationInput.classList.add('hidden');
            });
        }
    }
    
    // Initialize weather and clock functionality
    initializeWeatherAndClock();
});
