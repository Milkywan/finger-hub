import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCbsTKlizaZ5krxoMQWvwy7Ljhqfk4RzZI",
  authDomain: "irwan-s.firebaseapp.com",
  projectId: "irwan-s",
  storageBucket: "irwan-s.firebasestorage.app",
  messagingSenderId: "306980146994",
  appId: "1:306980146994:web:19dc4144d0fec84c38512b",
  measurementId: "G-3T1LZW4KL2"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


logEvent(analytics, 'page_view');


document.addEventListener('DOMContentLoaded', () => {

  
  const btnMintaPenawaranHeader = document.getElementById('btnMintaPenawaranHeader');
  if (btnMintaPenawaranHeader) {
    btnMintaPenawaranHeader.addEventListener('click', () => {
      logEvent(analytics, 'click_cta_button', {
        button_name: 'minta_penawaran_header',
        location: 'header'
      });
      console.log('Event: click_cta_button (header) sent to Analytics');
    });
  }

  
  const btnDiskusiProyekHero = document.getElementById('btnDiskusiProyekHero');
  if (btnDiskusiProyekHero) {
    btnDiskusiProyekHero.addEventListener('click', () => {
      logEvent(analytics, 'click_cta_button', {
        button_name: 'diskusikan_proyek',
        location: 'hero_section'
      });
      console.log('Event: click_cta_button (diskusi proyek) sent to Analytics');
    });
  }

  
  const btnLihatPortofolioHero = document.getElementById('btnLihatPortofolioHero');
  if (btnLihatPortofolioHero) {
    btnLihatPortofolioHero.addEventListener('click', () => {
      logEvent(analytics, 'click_button', {
        button_name: 'lihat_portofolio',
        location: 'hero_section'
      });
      console.log('Event: click_button (lihat portofolio) sent to Analytics');
    });
  }

    const btnChatWhatsApp = document.getElementById('btnChatWhatsApp');
  if (btnChatWhatsApp) {
    btnChatWhatsApp.addEventListener('click', () => {
      logEvent(analytics, 'click_contact_method', {
        contact_method: 'whatsapp',
        action: 'chat'
      });
      console.log('Event: click_contact_method (whatsapp) sent to Analytics');
    });
  }

});
