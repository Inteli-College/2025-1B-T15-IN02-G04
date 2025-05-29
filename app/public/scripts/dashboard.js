// Dashboard JavaScript
let currentUser = null;
let currentTrail = null;
let currentModule = null;
let allTrails = [];
let userProgress = [];

// Inicializar dashboard quando página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (!requireAuth()) {
        return;
    }
    
    // Carregar dados do usuário
    loadUserData();
    
    // Carregar trilhas
    loadTrails();
    
    // Carregar progresso do usuário
    loadUserProgress();
});

// Carregar dados do usuário
function loadUserData() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateWelcomeMessage();
    }
}

// Atualizar mensagem de boas-vindas
function updateWelcomeMessage() {
    const welcomeElement = document.getElementById('welcome-message');
    if (currentUser && currentUser.first_name) {
        welcomeElement.textContent = `Bem-vindo(a), ${currentUser.first_name}!`;
    }
}

// Carregar trilhas
async function loadTrails() {
    const loadingElement = document.getElementById('trails-loading');
    const gridElement = document.getElementById('trails-grid');
    const errorElement = document.getElementById('trails-error');
    
    try {
        loadingElement.style.display = 'block';
        gridElement.style.display = 'none';
        errorElement.style.display = 'none';
        
        const response = await authenticatedRequest('/api/trails');
        
        if (!response || !response.ok) {
            throw new Error('Erro ao carregar trilhas');
        }
        
        const trails = await response.json();
        allTrails = trails;
        
        renderTrails(trails);
        
        loadingElement.style.display = 'none';
        gridElement.style.display = 'grid';
        
    } catch (error) {
        console.error('Erro ao carregar trilhas:', error);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
    }
}

// Renderizar trilhas
function renderTrails(trails) {
    const gridElement = document.getElementById('trails-grid');
    
    if (!trails || trails.length === 0) {
        gridElement.innerHTML = `
            <div class="empty-state">
                <p>Nenhuma trilha disponível no momento.</p>
            </div>
        `;
        return;
    }
    
    gridElement.innerHTML = trails.map(trail => `
        <div class="trail-card" onclick="openTrailModal(${trail.id})">
            <div class="trail-header">
                <div class="trail-icon">🌱</div>
                <h3 class="trail-title">${trail.name}</h3>
            </div>
            <div class="trail-body">
                <p class="trail-description">${trail.description || 'Descrição não disponível'}</p>
                <div class="trail-stats">
                    <span>📚 ${trail.module_count || 0} módulos</span>
                    <span>⏱️ ${trail.estimated_hours || 0}h</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Abrir modal da trilha
async function openTrailModal(trailId) {
    currentTrail = allTrails.find(t => t.id === trailId);
    if (!currentTrail) return;
    
    const modal = document.getElementById('trail-modal');
    const titleElement = document.getElementById('modal-trail-title');
    const descriptionElement = document.getElementById('modal-trail-description');
    const modulesList = document.getElementById('modal-modules-list');
    
    titleElement.textContent = currentTrail.name;
    descriptionElement.textContent = currentTrail.description || 'Descrição não disponível';
    
    // Carregar módulos da trilha
    modulesList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Carregando módulos...</p></div>';
    
    try {
        const response = await authenticatedRequest(`/api/modules?trail_id=${trailId}`);
        if (response && response.ok) {
            const modules = await response.json();
            renderModulesInModal(modules);
        } else {
            throw new Error('Erro ao carregar módulos');
        }
    } catch (error) {
        console.error('Erro ao carregar módulos:', error);
        modulesList.innerHTML = '<p>Erro ao carregar módulos.</p>';
    }
    
    modal.style.display = 'block';
}

// Renderizar módulos no modal
function renderModulesInModal(modules) {
    const modulesList = document.getElementById('modal-modules-list');
    
    if (!modules || modules.length === 0) {
        modulesList.innerHTML = '<p>Nenhum módulo disponível nesta trilha.</p>';
        return;
    }
    
    modulesList.innerHTML = modules.map(module => `
        <div class="module-item" onclick="openModuleModal(${module.id})">
            <div class="module-info">
                <div class="module-name">${module.name}</div>
                <div class="module-description">${module.description || 'Descrição não disponível'}</div>
            </div>
            <div class="module-status status-not-started">Não iniciado</div>
        </div>
    `).join('');
}

// Fechar modal da trilha
function closeTrailModal() {
    document.getElementById('trail-modal').style.display = 'none';
    currentTrail = null;
}

// Iniciar trilha
function startTrail() {
    if (!currentTrail) return;
    
    showMessage(`Trilha "${currentTrail.name}" iniciada! Você pode começar pelos módulos disponíveis.`, 'success');
    closeTrailModal();
    
    // Atualizar progresso (implementar conforme necessário)
    loadUserProgress();
}

// Abrir modal do módulo
async function openModuleModal(moduleId) {
    try {
        const response = await authenticatedRequest(`/api/modules/${moduleId}`);
        if (!response || !response.ok) {
            throw new Error('Erro ao carregar módulo');
        }
        
        currentModule = await response.json();
        
        const modal = document.getElementById('module-modal');
        const titleElement = document.getElementById('modal-module-title');
        const descriptionElement = document.getElementById('modal-module-description');
        const classesList = document.getElementById('modal-classes-list');
        
        titleElement.textContent = currentModule.name;
        descriptionElement.textContent = currentModule.description || 'Descrição não disponível';
        
        // Carregar aulas do módulo
        classesList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Carregando aulas...</p></div>';
        
        const classesResponse = await authenticatedRequest(`/api/classes?module_id=${moduleId}`);
        if (classesResponse && classesResponse.ok) {
            const classes = await classesResponse.json();
            renderClassesInModal(classes);
        } else {
            throw new Error('Erro ao carregar aulas');
        }
        
        // Fechar modal da trilha primeiro
        closeTrailModal();
        
        // Abrir modal do módulo
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Erro ao carregar módulo:', error);
        showMessage('Erro ao carregar módulo. Tente novamente.', 'error');
    }
}

// Renderizar aulas no modal
function renderClassesInModal(classes) {
    const classesList = document.getElementById('modal-classes-list');
    
    if (!classes || classes.length === 0) {
        classesList.innerHTML = '<p>Nenhuma aula disponível neste módulo.</p>';
        return;
    }
    
    classesList.innerHTML = classes.map(classItem => `
        <div class="class-item" onclick="startClass(${classItem.id})">
            <div class="class-info">
                <div class="class-name">${classItem.name}</div>
                <div class="class-description">${classItem.description || 'Descrição não disponível'}</div>
            </div>
            <div class="class-status status-not-started">Não iniciado</div>
        </div>
    `).join('');
}

// Fechar modal do módulo
function closeModuleModal() {
    document.getElementById('module-modal').style.display = 'none';
    currentModule = null;
}

// Iniciar módulo
function startModule() {
    if (!currentModule) return;
    
    showMessage(`Módulo "${currentModule.name}" iniciado! Comece pelas aulas disponíveis.`, 'success');
    closeModuleModal();
    
    // Atualizar progresso (implementar conforme necessário)
    loadUserProgress();
}

// Iniciar aula
function startClass(classId) {
    showMessage('Funcionalidade de aulas será implementada em breve!', 'info');
    closeModuleModal();
}

// Carregar progresso do usuário
async function loadUserProgress() {
    try {
        // Por enquanto, vamos simular dados de progresso
        // Implementar quando houver tabelas de progresso no banco
        const mockProgress = [
            {
                id: 1,
                name: 'Agricultura Digital 4.0',
                description: 'Aprenda sobre IoT, sensores e análise de dados aplicados ao campo.',
                progress: 65,
                type: 'trail'
            },
            {
                id: 2,
                name: 'Introdução ao IoT Agrícola',
                description: 'Conceitos básicos de Internet das Coisas na agricultura.',
                progress: 80,
                type: 'module'
            }
        ];
        
        renderUserProgress(mockProgress);
        updateDashboardStats(mockProgress);
        
    } catch (error) {
        console.error('Erro ao carregar progresso:', error);
    }
}

// Renderizar progresso do usuário
function renderUserProgress(progress) {
    const progressSection = document.getElementById('current-progress-section');
    const progressGrid = document.getElementById('progress-grid');
    
    if (!progress || progress.length === 0) {
        progressSection.style.display = 'none';
        return;
    }
    
    progressGrid.innerHTML = progress.map(item => `
        <div class="progress-card">
            <div class="progress-header">
                <div class="progress-title">${item.name}</div>
                <div class="progress-percentage">${item.progress}%</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${item.progress}%"></div>
            </div>
            <div class="progress-description">${item.description}</div>
            <button class="continue-btn" onclick="continueItem(${item.id}, '${item.type}')">
                Continuar
            </button>
        </div>
    `).join('');
    
    progressSection.style.display = 'block';
}

// Continuar item em progresso
function continueItem(id, type) {
    if (type === 'trail') {
        openTrailModal(id);
    } else if (type === 'module') {
        openModuleModal(id);
    }
}

// Atualizar estatísticas do dashboard
function updateDashboardStats(progress) {
    const completedCourses = progress.filter(p => p.progress === 100).length;
    const inProgressCourses = progress.filter(p => p.progress > 0 && p.progress < 100).length;
    const totalHours = progress.reduce((total, p) => total + Math.floor(p.progress / 10), 0);
    
    document.getElementById('completed-courses').textContent = completedCourses;
    document.getElementById('in-progress-courses').textContent = inProgressCourses;
    document.getElementById('total-hours').textContent = `${totalHours}h`;
}

// Fechar modais quando clicar fora
window.addEventListener('click', function(event) {
    const trailModal = document.getElementById('trail-modal');
    const moduleModal = document.getElementById('module-modal');
    
    if (event.target === trailModal) {
        closeTrailModal();
    }
    
    if (event.target === moduleModal) {
        closeModuleModal();
    }
});

// Fechar modais com ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeTrailModal();
        closeModuleModal();
    }
});