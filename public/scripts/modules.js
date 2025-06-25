// Variáveis globais
let allModules = [];
let allTrails = [];
let currentEditingModule = null;

// Elementos DOM
const modulesContainer = document.getElementById('modulesContainer');
const searchInput = document.getElementById('searchInput');
const trailFilter = document.getElementById('trailFilter');
const loadingIndicator = document.getElementById('loadingIndicator');
const noModulesMessage = document.getElementById('noModulesMessage');
const errorMessage = document.getElementById('errorMessage');
const moduleModal = document.getElementById('moduleModal');
const deleteModal = document.getElementById('deleteModal');
const moduleForm = document.getElementById('moduleForm');

// Botões
const addModuleBtn = document.getElementById('addModuleBtn');
const refreshBtn = document.getElementById('refreshBtn');
const cancelBtn = document.getElementById('cancelBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
});

// Inicializar página
async function initializePage() {
    await loadTrails();
    await loadModules();
}

// Configurar event listeners
function setupEventListeners() {
    // Busca em tempo real
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Filtro por trilha
    trailFilter.addEventListener('change', handleTrailFilter);
    
    // Botões principais
    addModuleBtn.addEventListener('click', showAddModuleModal);
    refreshBtn.addEventListener('click', () => {
        loadModules();
        showToast('Dados atualizados!');
    });
    
    // Modal de módulo
    cancelBtn.addEventListener('click', hideModuleModal);
    moduleForm.addEventListener('submit', handleModuleSubmit);
    
    // Modal de exclusão
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
    
    // Fechar modais clicando fora
    moduleModal.addEventListener('click', function(e) {
        if (e.target === moduleModal) {
            hideModuleModal();
        }
    });
    
    deleteModal.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            hideDeleteModal();
        }
    });
}

// Debounce function para otimizar busca
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Carregar trilhas
async function loadTrails() {
    try {
        const response = await fetch('/api/trails');
        
        if (!response.ok) {
            throw new Error('Erro ao carregar trilhas');
        }
        
        allTrails = await response.json();
        populateTrailFilters();
        
    } catch (error) {
        console.error('Erro ao carregar trilhas:', error);
        showToast('Erro ao carregar trilhas', 'error');
    }
}

// Popular filtros de trilha
function populateTrailFilters() {
    // Filtro da página
    trailFilter.innerHTML = '<option value="">Todas as trilhas</option>';
    
    // Seletor do modal
    const moduleTrail = document.getElementById('moduleTrail');
    moduleTrail.innerHTML = '<option value="">Selecione uma trilha</option>';
    
    allTrails.forEach(trail => {
        // Filtro da página
        const option1 = document.createElement('option');
        option1.value = trail.id;
        option1.textContent = trail.name;
        trailFilter.appendChild(option1);
        
        // Seletor do modal
        const option2 = document.createElement('option');
        option2.value = trail.id;
        option2.textContent = trail.name;
        moduleTrail.appendChild(option2);
    });
}

// Carregar todos os módulos
async function loadModules() {
    try {
        showLoading();
        const response = await fetch('/api/modules');
        
        if (!response.ok) {
            throw new Error('Erro ao carregar módulos');
        }
        
        allModules = await response.json();
        renderModules(allModules);
        
    } catch (error) {
        console.error('Erro ao carregar módulos:', error);
        showError();
    } finally {
        hideLoading();
    }
}

// Buscar módulos
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedTrail = trailFilter.value;
    
    filterAndRenderModules(searchTerm, selectedTrail);
}

// Filtrar por trilha
function handleTrailFilter() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedTrail = trailFilter.value;
    
    filterAndRenderModules(searchTerm, selectedTrail);
}

// Filtrar e renderizar módulos
function filterAndRenderModules(searchTerm = '', selectedTrail = '') {
    let filteredModules = allModules;
    
    // Filtrar por termo de busca
    if (searchTerm) {
        filteredModules = filteredModules.filter(module =>
            module.name.toLowerCase().includes(searchTerm) ||
            (module.description && module.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filtrar por trilha
    if (selectedTrail) {
        filteredModules = filteredModules.filter(module =>
            module.id_trail.toString() === selectedTrail
        );
    }
    
    renderModules(filteredModules);
}

// Renderizar módulos
function renderModules(modules) {
    if (modules.length === 0) {
        showNoModules();
        return;
    }
    
    hideMessages();
    
    // Ordenar módulos por trilha e ordem
    const sortedModules = modules.sort((a, b) => {
        if (a.id_trail !== b.id_trail) {
            return a.id_trail - b.id_trail;
        }
        return (a.module_order || 1) - (b.module_order || 1);
    });
    
    const modulesHTML = sortedModules.map(module => createModuleHTML(module)).join('');
    modulesContainer.innerHTML = modulesHTML;
}

// Criar HTML do módulo
function createModuleHTML(module) {
    const trail = allTrails.find(t => t.id === module.id_trail);
    const trailName = trail ? trail.name : 'Trilha não encontrada';
    const formattedDate = new Date(module.created_at).toLocaleDateString('pt-BR');
    
    return `
        <div class="module-card" data-module-id="${module.id}">
            <div class="module-header">
                <div class="module-order">${module.module_order || 1}</div>
                <h3 class="module-title">${escapeHtml(module.name)}</h3>
                <span class="trail-badge">${escapeHtml(trailName)}</span>
            </div>
            <div class="module-content">
                <p class="module-description">${escapeHtml(module.description || 'Sem descrição')}</p>
                <div class="module-meta">
                    <span class="module-id">ID: #${module.id}</span>
                    <span class="module-date">${formattedDate}</span>
                </div>
                <div class="module-actions">
                    <button 
                        class="module-action-btn btn-view" 
                        onclick="viewModule(${module.id})"
                        title="Visualizar módulo"
                    >
                        Ver
                    </button>
                    <button 
                        class="module-action-btn btn-edit" 
                        onclick="editModule(${module.id})"
                        title="Editar módulo"
                    >
                        Editar
                    </button>
                    <button 
                        class="module-action-btn btn-delete" 
                        onclick="deleteModule(${module.id})"
                        title="Excluir módulo"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Visualizar módulo
function viewModule(moduleId) {
    const module = allModules.find(m => m.id === moduleId);
    if (!module) {
        showToast('Módulo não encontrado', 'error');
        return;
    }
    
    // Por enquanto, apenas mostrar um alert com as informações
    // Futuramente pode ser uma página dedicada ou modal de visualização
    const trail = allTrails.find(t => t.id === module.id_trail);
    const info = `
Módulo: ${module.name}
Trilha: ${trail ? trail.name : 'N/A'}
Ordem: ${module.module_order || 1}
Criado em: ${new Date(module.created_at).toLocaleDateString('pt-BR')}

Descrição:
${module.description || 'Sem descrição'}
    `;
    
    alert(info);
}

// Editar módulo
function editModule(moduleId) {
    const module = allModules.find(m => m.id === moduleId);
    if (!module) {
        showToast('Módulo não encontrado', 'error');
        return;
    }
    
    currentEditingModule = module;
    
    // Preencher formulário
    document.getElementById('moduleId').value = module.id;
    document.getElementById('moduleName').value = module.name;
    document.getElementById('moduleDescription').value = module.description || '';
    document.getElementById('moduleTrail').value = module.id_trail;
    document.getElementById('moduleOrder').value = module.module_order || 1;
    
    // Atualizar título e botão
    document.getElementById('modalTitle').textContent = 'Editar Módulo';
    document.getElementById('submitBtnText').textContent = 'Salvar Alterações';
    
    showModuleModal();
}

// Excluir módulo
function deleteModule(moduleId) {
    const module = allModules.find(m => m.id === moduleId);
    if (!module) {
        showToast('Módulo não encontrado', 'error');
        return;
    }
    
    currentEditingModule = module;
    document.getElementById('deleteModalText').textContent = 
        `Tem certeza que deseja excluir o módulo "${module.name}"? Esta ação não pode ser desfeita.`;
    
    showDeleteModal();
}

// Confirmar exclusão
async function handleDeleteConfirm() {
    if (!currentEditingModule) return;
    
    try {
        const response = await fetch(`/api/modules/${currentEditingModule.id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao excluir módulo');
        }
        
        hideDeleteModal();
        showToast('Módulo excluído com sucesso!');
        await loadModules();
        
    } catch (error) {
        console.error('Erro ao excluir módulo:', error);
        showToast('Erro ao excluir módulo', 'error');
    }
    
    currentEditingModule = null;
}

// Mostrar modal de adicionar módulo
function showAddModuleModal() {
    currentEditingModule = null;
    
    // Limpar formulário
    document.getElementById('moduleForm').reset();
    document.getElementById('moduleId').value = '';
    
    // Atualizar título e botão
    document.getElementById('modalTitle').textContent = 'Novo Módulo';
    document.getElementById('submitBtnText').textContent = 'Criar Módulo';
    
    showModuleModal();
}

// Lidar com submissão do formulário
async function handleModuleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const moduleData = {
        name: formData.get('name'),
        description: formData.get('description'),
        id_trail: parseInt(formData.get('id_trail')),
        module_order: parseInt(formData.get('module_order')) || 1
    };
    
    // Validação básica
    if (!moduleData.name.trim()) {
        showToast('Nome do módulo é obrigatório', 'error');
        return;
    }
    
    if (!moduleData.id_trail) {
        showToast('Trilha é obrigatória', 'error');
        return;
    }
    
    try {
        const isEditing = currentEditingModule !== null;
        const url = isEditing ? `/api/modules/${currentEditingModule.id}` : '/api/modules';
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(moduleData)
        });
        
        if (!response.ok) {
            throw new Error(isEditing ? 'Erro ao atualizar módulo' : 'Erro ao criar módulo');
        }
        
        hideModuleModal();
        showToast(isEditing ? 'Módulo atualizado com sucesso!' : 'Módulo criado com sucesso!');
        await loadModules();
        
    } catch (error) {
        console.error('Erro ao salvar módulo:', error);
        showToast(error.message, 'error');
    }
}

// Mostrar modal de módulo
function showModuleModal() {
    moduleModal.classList.remove('hidden');
    document.getElementById('moduleName').focus();
}

// Esconder modal de módulo
function hideModuleModal() {
    moduleModal.classList.add('hidden');
    currentEditingModule = null;
}

// Mostrar modal de exclusão
function showDeleteModal() {
    deleteModal.classList.remove('hidden');
}

// Esconder modal de exclusão
function hideDeleteModal() {
    deleteModal.classList.add('hidden');
    currentEditingModule = null;
}

// Mostrar loading
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    hideMessages();
}

// Esconder loading
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

// Mostrar mensagem de sem módulos
function showNoModules() {
    hideMessages();
    noModulesMessage.classList.remove('hidden');
}

// Mostrar mensagem de erro
function showError() {
    hideMessages();
    errorMessage.classList.remove('hidden');
}

// Esconder todas as mensagens
function hideMessages() {
    noModulesMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
    modulesContainer.innerHTML = '';
}

// Mostrar toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Criar container se não existir
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Função para recarregar módulos (usada no botão de retry)
window.loadModules = loadModules;

router.get('/modulos', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Módulos de Aprendizagem',
    content: '../pages/modules',
    pageCSS: 'pages/modules.css',
    pageJS: 'modules.js',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});