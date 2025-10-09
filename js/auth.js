const userMenuButton = document.getElementById("userMenuButton");
const userMenu = document.getElementById("userMenu");
const logoutButton = document.getElementById("logoutButton");

// Check for token in both localStorage (remember me) and sessionStorage (session only)
const getAuthToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const token = getAuthToken();

const updateUserDisplay = (user) => {
    if (!user) return;
    
    const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase() : '';
    const firstName = displayName ? displayName.split(' ')[0] : '';

    // Update all header and dropdown elements that exist on the page
    const elements = {
        headerUsername: user.firstName || displayName,
        headerUserInitials: initials,
        dropdownUsername: displayName,
        dropdownUserEmail: user.email,
        profilePageUsername: displayName,
        profilePageUserInitials: initials
    };

    for (const id in elements) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = elements[id];
        }
    }
};

const checkProfileCompleteness = (user) => {
    const notice = document.getElementById("incompleteProfileNotice");
    if (!notice) return; // Don't run on pages without the notice

    const requiredFields = ['firstName', 'lastName', 'title', 'contactPhone', 'country', 'city', 'street', 'postalCode'];
    
    const isComplete = requiredFields.every(field => user[field] && user[field].trim() !== '');

    if (isComplete) {
        notice.classList.add('hidden');
    } else {
        notice.classList.remove('hidden');
    }
};

const fetchUserData = async () => {
    if (!token) {
        if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('index.html')) {
            window.location.href = "login.html";
        }
        return;
    }

    try {
        const res = await fetch('http://localhost:5000/api/profile', {
            headers: { "x-auth-token": token }
        });

        if (!res.ok) {
            // Clear tokens from both storage types
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        const user = await res.json();
        window.currentUser = user; // cache globally
        updateUserDisplay(user);
        checkProfileCompleteness(user);
        // Fire a custom event so multiple scripts can listen without clobbering each other
        document.dispatchEvent(new CustomEvent('user:data', { detail: user }));
        if (typeof window.onUserDataLoaded === 'function') {
            try { window.onUserDataLoaded(user); } catch(e){ console.warn('onUserDataLoaded error', e);}        }

    } catch (err) {
        console.error("Failed to fetch user data for header:", err);
        // Clear tokens from both storage types
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "login.html";
    }
};

// --- Event Listeners ---
if (userMenuButton) {
    userMenuButton.addEventListener("click", () => {
        userMenu.classList.toggle("hidden");
    });
}

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        // Clear tokens from both storage types
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        // Also clear remember me data
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("savedEmail");
        
        // DO NOT clear user settings on logout - only on account deletion
        // User should get their settings back when they log in again
        
        window.location.href = "login.html";
    });
}

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

document.addEventListener("click", (event) => {
    if (userMenu && userMenuButton && !userMenu.classList.contains("hidden") && !userMenuButton.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.classList.add("hidden");
    }
});

// Expose functions to global scope
window.updateUserDisplay = updateUserDisplay;

// Initial load of user data for the header
fetchUserData();
