let currentUser = null;
let isSignUpMode = false;

// Auto login if a session is present
document.addEventListener("DOMContentLoaded", () => {
    const savedUser = localStorage.getItem("medRemind_session");
    if (savedUser) {
        currentUser = savedUser;
        showDashboard();
    }
});

function showAuthPage() {
    document.getElementById("landing-page").style.display = "none";
    document.getElementById("dashboard-page").style.display = "none";
    document.getElementById("auth-page").style.display = "block";
    hideBanner();
    toggleAuthMode(false); 
}

function toggleAuthMode(signUp) {
    isSignUpMode = signUp;
    const title = document.getElementById("auth-title");
    const submitBtn = document.getElementById("auth-submit-btn");
    const toggleText = document.getElementById("auth-toggle-text");
    hideBanner();
    
    if (isSignUpMode) {
        title.innerText = "Create Your Account";
        submitBtn.innerText = "Register & Log In";
        toggleText.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuthMode(false)">Login here</a>';
    } else {
        title.innerText = "Login to Your Account";
        submitBtn.innerText = "Login";
        toggleText.innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleAuthMode(true)">Sign Up here</a>';
    }
    document.getElementById("auth-form").reset();
}

function displayBanner(message, type) {
    const banner = document.getElementById("auth-msg-banner");
    banner.innerText = message;
    banner.className = `msg-banner ${type}`;
    banner.style.display = "block";
}

function hideBanner() {
    document.getElementById("auth-msg-banner").style.display = "none";
}

// Authentication Logic utilizing localStorage
function handleAuth(event) {
    event.preventDefault();
    hideBanner();
    
    const userInp = document.getElementById("username").value.trim();
    const passInp = document.getElementById("password").value;

    if (!userInp || !passInp) return;

    if (isSignUpMode) {
        // Register verification
        if (localStorage.getItem(`user_${userInp}`)) {
            displayBanner("Username already exists! Please try another name or log in.", "error");
            return;
        }
        localStorage.setItem(`user_${userInp}`, passInp);
        loginUser(userInp);
    } else {
        // Login execution
        const storedPassword = localStorage.getItem(`user_${userInp}`);
        if (storedPassword && storedPassword === passInp) {
            loginUser(userInp);
        } else {
            displayBanner("Account not found or password incorrect! If you're new, click 'Sign Up here' below.", "error");
        }
    }
}

function loginUser(username) {
    currentUser = username;
    localStorage.setItem("medRemind_session", username);
    showDashboard();
}

function logout() {
    currentUser = null;
    localStorage.removeItem("medRemind_session");
    
    document.getElementById("nav-login-btn").style.display = "inline-block";
    document.getElementById("nav-logout-btn").style.display = "none";
    document.getElementById("dashboard-page").style.display = "none";
    document.getElementById("landing-page").style.display = "block";
    document.getElementById("auth-form").reset();
    hideBanner();
}

function showDashboard() {
    document.getElementById("landing-page").style.display = "none";
    document.getElementById("auth-page").style.display = "none";
    document.getElementById("dashboard-page").style.display = "block";
    
    document.getElementById("nav-login-btn").style.display = "none";
    document.getElementById("nav-logout-btn").style.display = "inline-block";
    document.getElementById("user-display-name").innerText = currentUser;
    
    renderMedicines();
}

function getMedicines() {
    const meds = localStorage.getItem(`meds_${currentUser}`);
    return meds ? JSON.parse(meds) : [];
}

function renderMedicines() {
    const listElement = document.getElementById("medicine-list");
    const emptyMsg = document.getElementById("no-meds-msg");
    const medicines = getMedicines();
    
    listElement.innerHTML = "";
    
    if (medicines.length === 0) {
        emptyMsg.style.display = "block";
        return;
    }
    
    emptyMsg.style.display = "none";
    medicines.sort((a, b) => a.time.localeCompare(b.time));

    medicines.forEach((med, index) => {
        const li = document.createElement("li");
        li.className = "med-item";
        li.innerHTML = `
            <div class="med-details">
                <strong>${escapeHtml(med.name)}</strong>
                <div class="med-meta">Dosage: ${escapeHtml(med.dosage)} | ⏰ Time: ${med.time}</div>
            </div>
            <button class="delete-btn" onclick="deleteMedicine(${index})">Remove</button>
        `;
        listElement.appendChild(li);
    });
}

function addMedicine(event) {
    event.preventDefault();
    const name = document.getElementById("med-name").value.trim();
    const dosage = document.getElementById("med-dosage").value.trim();
    const time = document.getElementById("med-time").value;

    if (!name || !dosage || !time) return;

    const medicines = getMedicines();
    medicines.push({ name, dosage, time });
    
    localStorage.setItem(`meds_${currentUser}`, JSON.stringify(medicines));
    document.getElementById("medicine-form").reset();
    renderMedicines();
}

function deleteMedicine(index) {
    const medicines = getMedicines();
    medicines.splice(index, 1);
    localStorage.setItem(`meds_${currentUser}`, JSON.stringify(medicines));
    renderMedicines();
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
