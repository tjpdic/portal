document.addEventListener("DOMContentLoaded", () => {
    const sessionData = localStorage.getItem("juspanel_session");
    
    // Se não estiver logado, expulsa
    if (!sessionData) {
        window.location.href = "/login.html";
        return;
    }

    const user = JSON.parse(sessionData);
    const nivel = user.nivel_acesso || user.cargo;

    // Definição de Níveis de Acesso
    const isAdminFull = ["Presidente", "Admin", "CSJ"].includes(nivel);
    const isN1 = nivel === "ADM N1";
    const isN2 = nivel === "ADM N2";
    const isN3 = nivel === "ADM N3";

    // Catraca de Segurança de Rotas
    const currentPath = window.location.pathname;
    let hasAccess = false;

    if (isAdminFull) {
        hasAccess = true;
    } else if (isN1 && currentPath.includes("publicacoes.html")) {
        hasAccess = true;
    } else if (isN2 && currentPath.includes("dojup.html")) {
        hasAccess = true;
    } else if (isN3 && (currentPath.includes("publicacoes.html") || currentPath.includes("dojup.html"))) {
        hasAccess = true;
    }

    // Se não tiver acesso à rota que tentou acessar pela URL, volta para Intranet
    if (!hasAccess) {
        alert("Acesso Negado. Você não possui as permissões necessárias para acessar esta página da Administração.");
        window.location.href = "/intranet/";
        return;
    }

    // Preenche dados do usuário no cabeçalho (Evita repetição em todos os HTMLs)
    const nickDisplay = document.getElementById("userNickDisplay");
    if(nickDisplay) nickDisplay.innerText = user.nick;
    
    const cargoDisplay = document.getElementById("userCargoDisplay");
    if(cargoDisplay) cargoDisplay.innerText = user.cargo;
    
    const avatarDisplay = document.getElementById("userAvatarDisplay");
    if(avatarDisplay) avatarDisplay.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user.nick}&action=std&direction=2&head_direction=2&gesture=sml&size=m`;

    // Função Global de Logout (Evita repetição de script)
    window.logoutUser = function() {
        localStorage.removeItem("juspanel_session");
        window.location.href = "/login.html";
    };

    // Construtor do Menu Lateral Dinâmico
    let menuHTML = "";

    // Aba Principal
    if (isAdminFull) {
        menuHTML += `
            <span class="nav-label">Principal</span>
            <a href="/admin/index.html" class="menu-link" data-path="/admin/index.html|/admin/"><i class="fa-solid fa-gauge-high"></i> Dashboard Geral</a>
        `;
    }

    // Aba Portal Público
    if (isAdminFull || isN1 || isN2 || isN3) {
        menuHTML += `<span class="nav-label">Portal Público</span>`;
        if (isAdminFull || isN1 || isN3) {
            menuHTML += `<a href="/admin/publicacoes.html" class="menu-link" data-path="/admin/publicacoes.html"><i class="fa-solid fa-newspaper"></i> Publicações</a>`;
        }
        if (isAdminFull || isN2 || isN3) {
            menuHTML += `<a href="/admin/dojup.html" class="menu-link" data-path="/admin/dojup.html"><i class="fa-solid fa-file-contract"></i> Diário Oficial (DOJUP)</a>`;
        }
        if (isAdminFull) {
            menuHTML += `<a href="/admin/aparencia.html" class="menu-link" data-path="/admin/aparencia.html"><i class="fa-solid fa-palette"></i> Gerir Portal</a>`;
        }
    }

    // Aba Sistemas
    if (isAdminFull) {
        menuHTML += `
            <span class="nav-label">Intranet & Sistemas</span>
            <a href="/admin/documentos.html" class="menu-link" data-path="/admin/documentos.html"><i class="fa-solid fa-file-signature"></i> Gestão de Documentos</a>
            <a href="/admin/canvas.html" class="menu-link" data-path="/admin/canvas.html"><i class="fa-solid fa-object-group"></i> Gestão de Canvas</a>
            <a href="/admin/membros.html" class="menu-link" data-path="/admin/membros.html"><i class="fa-solid fa-users-gear"></i> Controle da Bancada</a>
            <a href="/admin/comunicacao.html" class="menu-link" data-path="/admin/comunicacao.html"><i class="fa-solid fa-tower-broadcast"></i> Comunicação Interna</a>
            <a href="/admin/configuracoes.html" class="menu-link" data-path="/admin/configuracoes.html"><i class="fa-solid fa-sliders"></i> Configurações Internas</a>
        `;
    }

    // Injeção e Destaque do Link Ativo (Verdinho claro)
    const navElement = document.querySelector(".admin-nav");
    if (navElement) {
        navElement.innerHTML = menuHTML;
        
        const links = navElement.querySelectorAll(".menu-link");
        links.forEach(link => {
            const paths = link.getAttribute("data-path").split("|");
            if (paths.some(p => currentPath.endsWith(p))) {
                link.classList.add("active");
            }
        });
    }
});