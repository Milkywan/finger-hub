// common-ui.js

import { auth, db } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// --- GLOBAL FUNCTIONS ---

// Fungsi navigasi halaman
window.goPage = (page) => {
    window.location.href = page;
};

// Fungsi logout terpusat
window.logout = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem("userRole"); // Hapus role saat logout
        localStorage.removeItem("loginTime"); // Hapus waktu login juga
        window.location.href = "index.html"; // Kembali ke halaman login
    } catch (error) {
        console.error("Error logging out:", error);
        alert("Gagal logout. Silakan coba lagi.");
    }
};

// --- RENDER HEADER (NAVIGASI) ---
function renderHeader(userRole, currentPageTitle) {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    let adminMenuLinks = '';
    let superAdminMenuLinks = '';
    
    // Admin dan Super Admin menu
    if (userRole === "admin" || userRole === "super_admin") {
        adminMenuLinks += `<a href="admin-upload-data.html" class="${currentPageTitle === 'Unggah Data Karyawan' ? 'active' : ''}">Unggah Data Karyawan</a>`;
    }

    // Super Admin menu
    if (userRole === "super_admin") {
        superAdminMenuLinks += `<a href="admin-users.html" class="${currentPageTitle === 'Kelola Pengguna' ? 'active' : ''}">Kelola Pengguna</a>`;
        superAdminMenuLinks += `<a href="admin-settings.html" class="${currentPageTitle === 'Pengaturan Sistem' ? 'active' : ''}">Pengaturan Sistem</a>`;
    }

    const headerHTML = `
        <nav>
            <div class="brand">🦁 Internal Tools</div>
            <div class="menu">
                <a href="home.html" class="${currentPageTitle === 'Menu Utama' ? 'active' : ''}">Home</a>
                ${superAdminMenuLinks}
                ${adminMenuLinks}
                <a href="excel_to_json.html" class="${currentPageTitle === 'Mesin → JSON' ? 'active' : ''}">Mesin → JSON</a>
                <a href="convert-csv.html" class="${currentPageTitle === 'Absensi → CSV/TXT' ? 'active' : ''}">Absensi → CSV/TXT</a>
                <a href="https://irwanss.web.app/" target="_blank">Portfolio</a>
            </div>
            <div class="menu2" onclick="window.logout()">Logout</div>
        </nav>
    `;
    headerPlaceholder.innerHTML = headerHTML;
}

// --- RENDER FOOTER ---
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

// --- RENDER HOME MENU ITEMS (khusus untuk home.html) ---
function renderHomeMenuItems(userRole, mainMenuGridId) {
    const mainMenuGrid = document.getElementById(mainMenuGridId);
    if (!mainMenuGrid) return;

    mainMenuGrid.innerHTML = ''; // Bersihkan menu yang ada

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
        adminMenuUpload.onclick = () => window.goPage('admin-upload-data.html');
        adminMenuUpload.textContent = "⬆️ Upload & Kelola Data";
        mainMenuGrid.appendChild(adminMenuUpload);
    }

    if (userRole === "super_admin") {
        const adminMenuUsers = document.createElement("div");
        adminMenuUsers.className = "menu-card";
        adminMenuUsers.onclick = () => window.goPage('admin-users.html');
        adminMenuUsers.textContent = "👥 Kelola Pengguna";
        mainMenuGrid.appendChild(adminMenuUsers);
  
        const superAdminMenuSettings = document.createElement("div");
        superAdminMenuSettings.className = "menu-card";
        superAdminMenuSettings.onclick = () => window.goPage('admin-settings.html');
        superAdminMenuSettings.textContent = "⚙️ Pengaturan Sistem";
        mainMenuGrid.appendChild(superAdminMenuSettings);
    }

    // Tambahkan tombol Logout sebagai elemen terakhir
    const logoutMenuCard = document.createElement("div");
    logoutMenuCard.className = "menu-card";
    logoutMenuCard.onclick = () => window.logout();
    logoutMenuCard.textContent = "🚪 Logout";
    mainMenuGrid.appendChild(logoutMenuCard);
}


// --- MAIN INITIALIZER FUNCTION ---
// Fungsi ini dipanggil dari setiap halaman HTML
// Parameters:
//   - pageTitle: Judul halaman saat ini (misal: "Kelola Pengguna", "Unggah Data Karyawan", "Menu Utama")
//   - mainContentId: ID dari div container utama halaman yang akan disembunyikan/ditampilkan setelah otorisasi
//   - requiredRole: Peran minimum yang dibutuhkan untuk mengakses halaman ini (misal: "user", "admin", "super_admin")
//   - homeMenuGridId: Jika halaman adalah home.html, berikan ID dari div menu gridnya (misal: "mainMenuGrid")
export async function initPage(pageTitle, mainContentId, requiredRole, homeMenuGridId = null) {
    const mainContentElement = document.getElementById(mainContentId);
    if (!mainContentElement) {
        console.error(`Elemen dengan ID '${mainContentId}' tidak ditemukan.`);
        return;
    }

    // Sembunyikan konten utama secara default saat loading
    mainContentElement.style.display = 'none';

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            try {
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const userRole = userData.role || 'user'; // Default ke 'user' jika tidak ada peran
                    localStorage.setItem('userRole', userRole); // Simpan peran di localStorage

                    // Pengecekan otorisasi untuk halaman saat ini
                    let authorized = false;
                    if (requiredRole === "user") {
                        authorized = true; // Semua user bisa akses halaman ini
                    } else if (requiredRole === "admin" && (userRole === "admin" || userRole === "super_admin")) {
                        authorized = true;
                    } else if (requiredRole === "super_admin" && userRole === "super_admin") {
                        authorized = true;
                    }

                    if (authorized) {
                        renderHeader(userRole, pageTitle);
                        renderFooter();
                        if (homeMenuGridId) { // Jika halaman home.html
                            renderHomeMenuItems(userRole, homeMenuGridId);
                        }
                        mainContentElement.style.display = 'block'; // Tampilkan konten
                    } else {
                        alert("Anda tidak memiliki izin untuk mengakses halaman ini.");
                        window.location.href = "home.html"; // Redirect ke home jika tidak berhak
                    }
                } else {
                    console.warn("Dokumen pengguna tidak ditemukan di Firestore, menganggap peran 'user'.");
                    localStorage.setItem('userRole', 'user');
                    // Jika data pengguna tidak ada tapi terautentikasi, perlakukan sebagai user dan render dasar
                    renderHeader('user', pageTitle);
                    renderFooter();
                    if (homeMenuGridId) {
                        renderHomeMenuItems('user', homeMenuGridId);
                    }
                    if (requiredRole === "user") {
                        mainContentElement.style.display = 'block';
                    } else {
                        alert("Anda tidak memiliki izin untuk mengakses halaman ini.");
                        window.location.href = "home.html";
                    }
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
                alert("Terjadi kesalahan saat memeriksa izin. Silakan coba lagi.");
                window.location.href = "index.html"; // Kembali ke login jika ada error
            }
        } else {
            // Pengguna tidak terautentikasi, redirect ke halaman login
            window.location.href = "index.html";
        }
    });
}
