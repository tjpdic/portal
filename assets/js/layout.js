import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// 1. INJEÇÃO DO CABEÇALHO E RODAPÉ (O ESPELHO GLOBAL)
const headerHTML = `
    <div class="top-bar">
        <div class="container top-bar-content">
            <div class="top-links" id="dynamicTopLinks"></div>
            <div class="top-actions">
                <span>Bem-vindo ao Portal do TJP</span>
            </div>
        </div>
    </div>
    <header class="header">
        <div class="container header-content">
            <div class="brand">
                <div class="logo"><img src="assets/img/logo-tjp.png" alt="Logo TJP" style="height: 55px;"></div>
                <div>
                    <h1>Tribunal de Justiça Policial</h1>
                    <small>Departamento de Investigação Criminal&reg;</small>
                </div>
            </div>
            <nav class="main-nav">
                <ul id="dynamicMenu"></ul>
            </nav>
        </div>
    </header>
`;

const footerHTML = `
    <footer class="footer">
        <div class="container footer-content">
            <div class="footer-col brand-col">
                <img src="assets/img/logo-tjp.png" alt="Logo TJP" style="height: 100px; margin-bottom: 15px;">
                <strong style="display: block; color: var(--primary); font-size: 16px;">Tribunal de Justiça Policial</strong>
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 10px;">Departamento de Investigação Criminal&reg;</p>
                <div class="social-links">
                    <a href="https://www.facebook.com/tjp.dic" target="_blank" class="social-btn"><i class="fa-brands fa-facebook-f"></i></a>
                </div>
            </div>
            <div id="dynamicFooterColumns" style="display: contents;"></div>
        </div>
        <div class="container footer-system-middle">
            <a href="https://dic.systemhb.net/" target="_blank"><img src="assets/img/logo-dic.png" alt="System Polícia DIC" style="height: 80px;"></a>
        </div>
        <div class="footer-bottom">
            <div class="container"><p>&copy; 2026 Polícia DIC. Todos os direitos reservados.</p></div>
        </div>
    </footer>
`;

const globalHeader = document.getElementById("global-header");
if(globalHeader) globalHeader.innerHTML = headerHTML;

const globalFooter = document.getElementById("global-footer");
if(globalFooter) globalFooter.innerHTML = footerHTML;

// 2. INICIALIZAÇÃO ÚNICA DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBrez1ecIuGbmv5Q_NC1kTpIJhAT2kcnxs",
    authDomain: "monitores-sisap.firebaseapp.com",
    projectId: "monitores-sisap",
    storageBucket: "monitores-sisap.firebasestorage.app",
    messagingSenderId: "489679893157",
    appId: "1:489679893157:web:b1bbfaf4c0c5937d44534c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 3. LÓGICA DE DADOS (TOPLINKS E MENUS)
onSnapshot(doc(db, "tjp_config", "toplinks"), (snap) => {
    const container = document.getElementById("dynamicTopLinks");
    if(!container) return;
    container.innerHTML = `<a href="#">Ouvidoria TJP</a>`; 
    if(snap.exists() && snap.data().lista) {
        snap.data().lista.forEach(lk => {
            const icn = lk.icone.includes('http') || lk.icone.includes('assets') ? `<img src="${lk.icone}" style="height: 16px;">` : `<i class="${lk.icone}"></i>`;
            const cls = lk.titulo ? "system-btn-top" : "icon-only-top"; 
            const titleHtml = lk.titulo ? ` ${lk.titulo}` : "";
            container.innerHTML += `<a href="${lk.url}" target="_blank" class="${cls}" title="${lk.titulo || 'Link'}">${icn}${titleHtml}</a>`;
        });
    }
});

const buildMenuHtml = (items) => {
    let html = "";
    items.forEach(item => {
        let icon = "";
        if(item.nome === "O TJP") icon = '<i class="fa-solid fa-building-columns"></i> ';
        else if(item.nome === "CSJ") icon = '<i class="fa-solid fa-users-gear"></i> ';
        else if(item.nome === "Diário Oficial") icon = '<i class="fa-solid fa-book-open"></i> ';
        else if(item.nome === "Legislações") icon = '<i class="fa-solid fa-scale-balanced"></i> ';

        let catChildren = item.sub || [];
        let catUrl = item.link && item.link !== "" ? item.link : '#';

        if(catChildren.length > 0) {
            html += `<li class="dropdown"><a href="${catUrl}">${icon}${item.nome} <i class="fa-solid fa-chevron-down" style="font-size: 10px;"></i></a><div class="dropdown-content">`;
            catChildren.forEach(subItem => {
                let subChildren = subItem.sub || [];
                let subUrl = subItem.link && subItem.link !== "" ? subItem.link : '#';

                if(subChildren.length > 0) {
                    html += `<div class="dropdown dropdown-submenu"><a href="${subUrl}">${subItem.nome} <i class="fa-solid fa-chevron-right" style="font-size: 10px;"></i></a><div class="dropdown-content">`;
                    subChildren.forEach(sub2 => { 
                        let sub2Url = sub2.link && sub2.link !== "" ? sub2.link : '#';
                        html += `<a href="${sub2Url}">${sub2.nome}</a>`; 
                    });
                    html += `</div></div>`;
                } else {
                    html += `<a href="${subUrl}">${subItem.nome}</a>`;
                }
            });
            html += `</div></li>`;
        } else {
            html += `<li><a href="${catUrl}">${icon}${item.nome}</a></li>`;
        }
    });
    return html;
};

onSnapshot(doc(db, "tjp_config", "menus"), (snap) => {
    let menus = [];
    if(snap.exists() && snap.data().lista) menus = snap.data().lista;
    
    const navMenu = document.getElementById("dynamicMenu");
    if(navMenu) {
        navMenu.innerHTML = `
            <li><a href="index.html"><i class="fa-solid fa-house"></i> Início</a></li>
            ${buildMenuHtml(menus)}
            <li><a href="login.html" class="btn-login"><i class="fa-solid fa-right-to-bracket"></i> Acesso Restrito</a></li>
        `;
    }

    const footerCols = document.getElementById("dynamicFooterColumns");
    if(footerCols) {
        let footerHtml = '';
        menus.forEach(rootItem => {
            let catChildren = rootItem.sub || [];
            if(catChildren.length > 0 && rootItem.nome !== "CSJ") {
                footerHtml += `<div class="footer-col"><h4>${rootItem.nome}</h4><ul>`;
                catChildren.forEach(subItem => {
                    let subUrl = subItem.link && subItem.link !== "" ? subItem.link : '#';
                    footerHtml += `<li><a href="${subUrl}">${subItem.nome}</a></li>`;
                });
                footerHtml += `</ul></div>`;
            }
        });
        footerCols.innerHTML = footerHtml;
    }
});