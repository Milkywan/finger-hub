

import { auth, db } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js"; 

/* HEADER ICON LINKS */
.menu a.icon-link {
  position: relative;
  display: inline-block;
  padding: 6px;
}

.menu a.icon-link img {
  width: 28px;
  height: 28px;
  vertical-align: middle;
}

.menu a.icon-link .tooltip {
  position: absolute;
  bottom: -26px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.75);
  color: #fff;
  font-size: 12px;
  padding: 3px 6px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.menu a.icon-link:hover .tooltip {
  opacity: 1;
}

/* MENU CARD ICONS */
.menu-card {
  position: relative;
  text-align: center;
  cursor: pointer;
  padding: 16px;
}

.menu-card img {
  width: 60px;
  height: 60px;
  transition: transform 0.3s ease;
}

.menu-card:hover img {
  transform: scale(1.1);
}

.menu-card .tooltip {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  color: #fff;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-card:hover .tooltip {
  opacity: 1;
}



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
      adminMenuLinks += `
        <a href="admin_upload_data.html" class="icon-link ${currentPageTitle === 'Unggah Data Karyawan' ? 'active' : ''}">
          <img src="images/admin_upload_data.png" alt="Upload Data">
          <span class="tooltip">Unggah Data Karyawan</span>
        </a>
      `;
    }

    if (userRole === "super_admin") {
      superAdminMenuLinks += `
        <a href="admin_manage_users.html" class="icon-link ${currentPageTitle === 'Kelola Pengguna' ? 'active' : ''}">
          <img src="images/admin_manage_users.png" alt="Manage Users">
          <span class="tooltip">Kelola Pengguna</span>
        </a>
        <a href="superadmin_settings.html" class="icon-link ${currentPageTitle === 'Pengaturan Sistem' ? 'active' : ''}">
          <img src="images/superadmin_settings.png" alt="Settings">
          <span class="tooltip">Pengaturan Sistem</span>
        </a>
      `;
    }

    navMenuContent = `
      <div class="menu">
        <a href="home.html" class="icon-link ${currentPageTitle === 'Menu Utama' ? 'active' : ''}">
          <img src="images/home.png" alt="Home">
          <span class="tooltip">Home</span>
        </a>
        ${superAdminMenuLinks}
        ${adminMenuLinks}
        <a href="flask.html" class="icon-link ${currentPageTitle === 'Download Data Finger' ? 'active' : ''}">
          <img src="images/flask.png" alt="Flask">
          <span class="tooltip">Download Data Finger</span>
        </a>
        <a href="excel_to_json.html" class="icon-link ${currentPageTitle === 'Mesin → JSON' ? 'active' : ''}">
          <img src="images/excel_to_json.png" alt="Excel to JSON">
          <span class="tooltip">Mesin → JSON</span>
        </a>
        <a href="convert-csv.html" class="icon-link ${currentPageTitle === 'Converter Xls' ? 'active' : ''}">
          <img src="images/convert-csv.png" alt="Convert CSV">
          <span class="tooltip">Converter Xls</span>
        </a>
        <a href="https://irwanss.web.app/" target="_blank" class="icon-link">
          <img src="images/portfolio.png" alt="Portfolio">
          <span class="tooltip">Portfolio</span>
        </a>
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
    { page: 'flask.html', text: 'Download Data Finger', icon: 'images/flask.png' },
    { page: 'excel_to_json.html', text: 'List Mesin → JSON', icon: 'images/excel_to_json.png' },
    { page: 'convert-csv.html', text: 'Data Finger → CSV/TXT', icon: 'images/convert-csv.png' },
  ];

  commonMenuItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'menu-card';
    div.onclick = () => window.goPage(item.page);
    div.innerHTML = `
      <img src="${item.icon}" alt="${item.text}">
      <span class="tooltip">${item.text}</span>
    `;
    mainMenuGrid.appendChild(div);
  });

  if (userRole === "admin" || userRole === "super_admin") {
    const adminMenuUpload = document.createElement("div");
    adminMenuUpload.className = "menu-card";
    adminMenuUpload.onclick = () => window.goPage('admin_upload_data.html');
    adminMenuUpload.innerHTML = `
      <img src="images/admin_upload_data.png" alt="Upload">
      <span class="tooltip">Upload & Kelola Data</span>
    `;
    mainMenuGrid.appendChild(adminMenuUpload);
  }

  if (userRole === "super_admin") {
    const adminMenuUsers = document.createElement("div");
    adminMenuUsers.className = "menu-card";
    adminMenuUsers.onclick = () => window.goPage('admin_manage_users.html');
    adminMenuUsers.innerHTML = `
      <img src="images/admin_manage_users.png" alt="Users">
      <span class="tooltip">Kelola Pengguna</span>
    `;
    mainMenuGrid.appendChild(adminMenuUsers);

    const superAdminMenuSettings = document.createElement("div");
    superAdminMenuSettings.className = "menu-card";
    superAdminMenuSettings.onclick = () => window.goPage('superadmin_settings.html');
    superAdminMenuSettings.innerHTML = `
      <img src="images/superadmin_settings.png" alt="Settings">
      <span class="tooltip">Pengaturan Sistem</span>
    `;
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




