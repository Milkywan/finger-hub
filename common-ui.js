

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


function renderHeader(userRole, currentPageTitle, userName = 'Pengguna') {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    let adminMenuLinks = '';
    let superAdminMenuLinks = '';
    let navMenuContent = ''; 

    
    if (currentPageTitle !== 'Menu Utama') { 
        
        if (userRole === "admin" || userRole === "super_admin") {
            adminMenuLinks += `<a href="admin_upload_data.html" class="${currentPageTitle === 'Unggah Data Karyawan' ? 'active' : ''}">Unggah Data Karyawan</a>`;
        }

        
        if (userRole === "super_admin") {
            superAdminMenuLinks += `<a href="admin_manage_users.html" class="${currentPageTitle === 'Kelola Pengguna' ? 'active' : ''}">Kelola Pengguna</a>`;
            superAdminMenuLinks += `<a href="superadmin_settings.html" class="${currentPageTitle === 'Pengaturan Sistem' ? 'active' : ''}">Pengaturan Sistem</a>`;
        }

        
        navMenuContent = `
            <div class="menu">
                <a href="home.html" class="${currentPageTitle === 'Menu Utama' ? 'active' : ''}">Home</a>
                ${superAdminMenuLinks}
                ${adminMenuLinks}
                <a href="flask.html" class="${currentPageTitle === 'Download Data Finger' ? 'active' : ''}">Download Data Finger</a>
                <a href="excel_to_json.html" class="${currentPageTitle === 'Mesin → JSON' ? 'active' : ''}">Mesin → JSON</a>
                <a href="convert-csv.html" class="${currentPageTitle === 'Converter Xls' ? 'active' : ''}">Converter Xls</a>
                <a href="https://irwanss.web.app/" target="_blank">Portfolio</a>
            </div>
        `;
    }

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

    const commonMenuItems = [
        { page: 'flask.html', text: '📥 Download Data Finger' },
        { page: 'excel_to_json.html', text: '📄 List Mesin → JSON' },
        { page: 'convert-csv.html', text: '🔄 Data Finger → CSV/TXT' },
    ];

    commonMenuItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-card';
        div.onclick = () => window.goPage(item.page);
        div.textContent = item.text;
        mainMenuGrid.appendChild(div);
    });

    if (userRole === "admin" || userRole === "super_admin") {
        const adminMenuUpload = document.createElement("div");
        adminMenuUpload.className = "menu-card";
        adminMenuUpload.onclick = () => window.goPage('admin_upload_data.html');
        adminMenuUpload.textContent = "⬆️ Upload & Kelola Data";
        mainMenuGrid.appendChild(adminMenuUpload);
    }

    if (userRole === "super_admin") {
        const adminMenuUsers = document.createElement("div");
        adminMenuUsers.className = "menu-card";
        adminMenuUsers.onclick = () => window.goPage('admin_manage_users.html');
        adminMenuUsers.textContent = "👥 Kelola Pengguna";
        mainMenuGrid.appendChild(adminMenuUsers);
  
        const superAdminMenuSettings = document.createElement("div");
        superAdminMenuSettings.className = "menu-card";
        superAdminMenuSettings.onclick = () => window.goPage('superadmin_settings.html'); 
        superAdminMenuSettings.textContent = "⚙️ Pengaturan Sistem";
        mainMenuGrid.appendChild(superAdminMenuSettings);
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



