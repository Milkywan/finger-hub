import { auth, db } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js"; 




window.goPage = (page) => {
    window.location.href = page;
};


window.logout = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem("userRole"); 
        localStorage.removeItem("loginTime"); 
        window.location.href = "index.html"; 
    } catch (error) {
        console.error("Error logging out:", error);
        alert("Gagal logout. Silakan coba lagi.");
    } finally {
        
        clearTimeout(inactivityTimer); 
    }
};


const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; 
let inactivityTimer;

function startInactivityTimer() {
    clearTimeout(inactivityTimer); 
    inactivityTimer = setTimeout(() => {
        console.log("Deteksi inaktivitas, otomatis logout...");
        window.logout(); 
    }, INACTIVITY_TIMEOUT_MS);
}

function resetInactivityTimer() {
    startInactivityTimer(); 
}



document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('scroll', resetInactivityTimer); 

// Helper function to determine icon path based on page URL
function getIconPath(pageUrl) {
    if (pageUrl.startsWith('https://')) {
        // Special case for external links, e.g., your portfolio
        if (pageUrl.includes('irwanss.web.app')) {
            return 'images/portfolio.png'; // Assuming you have an icon named portfolio.png
        }
        return 'images/external_link.png'; // Generic external link icon if needed
    }
    // Extract filename from path (e.g., "flask.html" -> "flask")
    const filename = pageUrl.split('/').pop().split('.')[0];
    return `images/${filename}.png`;
}


function renderHeader(userRole, currentPageTitle, userName = 'Pengguna') {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    // Helper to create a menu item with icon and hover text
    const createHeaderMenuItem = (page, text, currentTitle) => {
        const iconPath = getIconPath(page);
        const targetAttr = page.startsWith('https://') ? 'target="_blank" rel="noopener noreferrer"' : ''; // Add rel for security
        const isActive = (text === currentTitle); // Compare actual text with current page title
        return `
            <a href="${page}" class="menu-icon-link ${isActive ? 'active' : ''}" ${targetAttr}>
                <img src="${iconPath}" alt="${text}" class="menu-icon">
                <span class="menu-text">${text}</span>
            </a>
        `;
    };

    let adminMenuLinks = '';
    let superAdminMenuLinks = '';
    
    // --- KESALAHAN SEBELUMNYA ADA DI SINI ---
    // --- SEKARANG, KONDISI 'if (currentPageTitle !== 'Menu Utama')' TELAH DIHAPUS
    // --- AGAR MENU NAVIGASI SELALU TAMPIL, TERMASUK LINK HOME
    // Note: The text here must match the `pageTitle` passed to initPage function for 'active' state to work
    // Ensure home link is always present
    let navMenuContent = `
        <div class="menu">
            ${createHeaderMenuItem("home.html", "Menu Utama", currentPageTitle)}
    `;

    if (userRole === "admin" || userRole === "super_admin") {
        adminMenuLinks += createHeaderMenuItem("admin_upload_data.html", "Unggah Data Karyawan", currentPageTitle);
    }

    if (userRole === "super_admin") {
        superAdminMenuLinks += createHeaderMenuItem("admin_manage_users.html", "Kelola Pengguna", currentPageTitle);
        superAdminMenuLinks += createHeaderMenuItem("superadmin_settings.html", "Pengaturan Sistem", currentPageTitle);
    }

    navMenuContent += `
            ${superAdminMenuLinks}
            ${adminMenuLinks}
            ${createHeaderMenuItem("flask.html", "Download Data Finger", currentPageTitle)}
            ${createHeaderMenuItem("excel_to_json.html", "Mesin → JSON", currentPageTitle)}
            ${createHeaderMenuItem("convert-csv.html", "Converter Xls", currentPageTitle)}
            ${createHeaderMenuItem("https://irwanss.web.app/", "Portfolio", currentPageTitle)}
        </div>
    `;


    const headerHTML = `
        <nav>
            <div class="brand">🦁 Internal Tools</div>
            ${navMenuContent}  
            <div class="right-nav-items">
                <div class="user-info">
                    <span>Halo, ${userName} (<span style="text-transform: capitalize;">${userRole}</span>)</span>
                </div>
                <div class="menu2" onclick="window.logout()">Logout</div>
            </div>
        </nav>
    `;
    headerPlaceholder.innerHTML = headerHTML;
}


function renderFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    const footerHTML = `
        <footer>
            © 2025 by <a href="https://irwanss.web.app" target="_blank">IrwanS</a>
        </footer>
    `;
    footerPlaceholder.innerHTML = footerHTML;
}


function renderHomeMenuItems(userRole, mainMenuGridId) {
    const mainMenuGrid = document.getElementById(mainMenuGridId);
    if (!mainMenuGrid) return;

    mainMenuGrid.innerHTML = ''; 

    // Helper to create a menu card with icon and hover text
    const createMenuCard = (page, text) => {
        const iconPath = getIconPath(page);
        const div = document.createElement('div');
        div.className = 'menu-card';
        div.onclick = () => window.goPage(page);
        div.innerHTML = `
            <img src="${iconPath}" alt="${text}" class="card-icon">
            <span class="card-text">${text}</span>
        `;
        return div;
    };

    const commonMenuItems = [
        { page: 'flask.html', text: '📥 Download Data Finger' },
        { page: 'excel_to_json.html', text: '📄 List Mesin → JSON' },
        { page: 'convert-csv.html', text: '🔄 Data Finger → CSV/TXT' },
    ];

    commonMenuItems.forEach(item => {
        mainMenuGrid.appendChild(createMenuCard(item.page, item.text));
    });

    if (userRole === "admin" || userRole === "super_admin") {
        mainMenuGrid.appendChild(createMenuCard('admin_upload_data.html', '⬆️ Upload & Kelola Data'));
    }

    if (userRole === "super_admin") {
        mainMenuGrid.appendChild(createMenuCard('admin_manage_users.html', '👥 Kelola Pengguna'));
        mainMenuGrid.appendChild(createMenuCard('superadmin_settings.html', '⚙️ Pengaturan Sistem'));
    }
} 



export async function initPage(pageTitle, mainContentId, requiredRole, homeMenuGridId = null) {
    const mainContentElement = document.getElementById(mainContentId);
    if (!mainContentElement) {
        console.error(`Elemen dengan ID '${mainContentId}' tidak ditemukan.`);
        return;
    }

    
    mainContentElement.style.display = 'none';

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            try {
                const userDocSnap = await getDoc(userDocRef);
                let userData = {};
                let userRole = 'user'; 
                let userName = user.email; 

                if (userDocSnap.exists()) {
                    userData = userDocSnap.data();
                    userRole = userData.role || 'user';
                    userName = userData.username || user.email; 
                    localStorage.setItem('userRole', userRole); 
                } else {
                    console.warn("Dokumen pengguna tidak ditemukan di Firestore. Menggunakan peran default 'user' dan email sebagai nama.");
                    localStorage.setItem('userRole', 'user');
                }

                
                let authorized = false;
                if (requiredRole === "user") { 
                    authorized = true;
                } else if (requiredRole === "admin" && (userRole === "admin" || userRole === "super_admin")) { 
                    authorized = true;
                } else if (requiredRole === "super_admin" && userRole === "super_admin") { 
                    authorized = true;
                }

                if (authorized) {
                    renderHeader(userRole, pageTitle, userName); 
                    renderFooter();
                    if (homeMenuGridId) { 
                        renderHomeMenuItems(userRole, homeMenuGridId);
                    }
                    mainContentElement.style.display = 'block'; 
                    startInactivityTimer(); 
                } else {
                    alert("Anda tidak memiliki izin untuk mengakses halaman ini.");
                    window.location.href = "home.html"; 
                    clearTimeout(inactivityTimer); 
                }
            } catch (error) {
                console.error("Error fetching user data or rendering page:", error);
                alert("Terjadi kesalahan saat memeriksa izin atau memuat data. Silakan coba lagi.");
                window.location.href = "index.html"; 
                clearTimeout(inactivityTimer); 
            }
        } else {
            
            window.location.href = "index.html";
            clearTimeout(inactivityTimer); 
        }
    });
}
