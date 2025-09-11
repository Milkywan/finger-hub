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
    } finally {
        // Penting: Pastikan timer dihentikan saat logout (baik manual atau otomatis)
        clearTimeout(inactivityTimer); 
    }
};

// --- INACTIVITY AUTO-LOGOUT LOGIC ---
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 menit dalam milidetik
let inactivityTimer;

function startInactivityTimer() {
    clearTimeout(inactivityTimer); // Hapus timer yang ada sebelumnya
    inactivityTimer = setTimeout(() => {
        console.log("Deteksi inaktivitas, otomatis logout...");
        window.logout(); // Panggil fungsi logout yang sudah ada
    }, INACTIVITY_TIMEOUT_MS);
}

function resetInactivityTimer() {
    startInactivityTimer(); // Cukup mulai ulang timer setiap kali ada aktivitas
}

// Tambahkan event listener global untuk mendeteksi aktivitas pengguna
// Ini hanya perlu dilakukan sekali saat script dimuat
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('scroll', resetInactivityTimer); // Opsional, baik untuk halaman panjang

// --- RENDER HEADER (NAVIGASI) ---
function renderHeader(userRole, currentPageTitle, userName = 'Pengguna') {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    let adminMenuLinks = '';
    let superAdminMenuLinks = '';
    let navMenuContent = ''; // Konten untuk div class="menu"

    // Render link menu navigasi hanya jika bukan halaman utama
    if (currentPageTitle !== 'Menu Utama') { // <--- KONDISI BARU DI SINI!
        // Admin dan Super Admin menu
        if (userRole === "admin" || userRole === "super_admin") {
            adminMenuLinks += `<a href="admin_upload_data.html" class="${currentPageTitle === 'Unggah Data Karyawan' ? 'active' : ''}">Unggah Data Karyawan</a>`;
        }

        // Super Admin menu
        if (userRole === "super_admin") {
            superAdminMenuLinks += `<a href="admin_manage_users.html" class="${currentPageTitle === 'Kelola Pengguna' ? 'active' : ''}">Kelola Pengguna</a>`;
            superAdminMenuLinks += `<a href="superadmin_settings.html" class="${currentPageTitle === 'Pengaturan Sistem' ? 'active' : ''}">Pengaturan Sistem</a>`;
        }

        // Susun konten div class="menu"
        navMenuContent = `
            <div class="menu">
                <a href="home.html" class="${currentPageTitle === 'Menu Utama' ? 'active' : ''}">Home</a>
                ${superAdminMenuLinks}
                ${adminMenuLinks}
                <a href="excel_to_json.html" class="${currentPageTitle === 'Mesin → JSON' ? 'active' : ''}">Mesin → JSON</a>
                <a href="convert-csv.html" class="${currentPageTitle === 'Absensi → CSV/TXT' ? 'active' : ''}">Absensi → CSV/TXT</a>
                <a href="https://irwanss.web.app/" target="_blank">Portfolio</a>
            </div>
        `;
    }

    const headerHTML = `
        <nav>
            <div class="brand">🦁 Internal Tools</div>
            ${navMenuContent}  <!-- Sisipkan konten menu navigasi secara kondisional -->
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
        superAdminMenuSettings.onclick = () => window.goPage('superadmin_settings.html'); // Pastikan ini mengarah ke admin-settings.html
        superAdminMenuSettings.textContent = "⚙️ Pengaturan Sistem";
        mainMenuGrid.appendChild(superAdminMenuSettings);
    }
} // <--- PASTIKAN KURUNG KURAWAL INI ADA DAN TIDAK TERKOMENTAR!

// --- MAIN INITIALIZER FUNCTION ---
// Fungsi ini dipanggil dari setiap halaman HTML
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
                let userData = {};
                let userRole = 'user'; // Default role
                let userName = user.email; // Default name

                if (userDocSnap.exists()) {
                    userData = userDocSnap.data();
                    userRole = userData.role || 'user';
                    userName = userData.username || user.email; // Prioritaskan username dari Firestore
                    localStorage.setItem('userRole', userRole); // Simpan peran di localStorage
                } else {
                    console.warn("Dokumen pengguna tidak ditemukan di Firestore. Menggunakan peran default 'user' dan email sebagai nama.");
                    localStorage.setItem('userRole', 'user');
                }

                // Pengecekan otorisasi untuk halaman saat ini
                let authorized = false;
                if (requiredRole === "user") { // Halaman untuk semua user
                    authorized = true;
                } else if (requiredRole === "admin" && (userRole === "admin" || userRole === "super_admin")) { // Halaman untuk admin & super_admin
                    authorized = true;
                } else if (requiredRole === "super_admin" && userRole === "super_admin") { // Halaman khusus super_admin
                    authorized = true;
                }

                if (authorized) {
                    renderHeader(userRole, pageTitle, userName); // Meneruskan userName dan userRole
                    renderFooter();
                    if (homeMenuGridId) { // Jika halaman adalah home.html
                        renderHomeMenuItems(userRole, homeMenuGridId);
                    }
                    mainContentElement.style.display = 'block'; // Tampilkan konten
                    startInactivityTimer(); // <<< MULAI TIMER INAKTIVITAS DI SINI!
                } else {
                    alert("Anda tidak memiliki izin untuk mengakses halaman ini.");
                    window.location.href = "home.html"; // Redirect ke home jika tidak berhak
                    clearTimeout(inactivityTimer); // Hentikan timer jika tidak berhak dan redirect
                }
            } catch (error) {
                console.error("Error fetching user data or rendering page:", error);
                alert("Terjadi kesalahan saat memeriksa izin atau memuat data. Silakan coba lagi.");
                window.location.href = "index.html"; // Kembali ke login jika ada error
                clearTimeout(inactivityTimer); // Hentikan timer jika ada error
            }
        } else {
            // Pengguna tidak terautentikasi, redirect ke halaman login
            window.location.href = "index.html";
            clearTimeout(inactivityTimer); // Hentikan timer jika tidak ada user
        }
    });
}

