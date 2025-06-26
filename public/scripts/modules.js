let allModules = [];
let allTrails = [];
let currentEditingModule = null;

// Elementos DOM
const modulesContainer = document.getElementById("modulesContainer");
const searchInput = document.getElementById("searchInput");
const trailFilter = document.getElementById("trailFilter");
const loadingIndicator = document.getElementById("loadingIndicator");
const noModulesMessage = document.getElementById("noModulesMessage");
const errorMessage = document.getElementById("errorMessage");
const moduleModal = document.getElementById("moduleModal");
const deleteModal = document.getElementById("deleteModal");
const moduleForm = document.getElementById("moduleForm");

// Botões
const addModuleBtn = document.getElementById("addModuleBtn");
const refreshBtn = document.getElementById("refreshBtn");
const cancelBtn = document.getElementById("cancelBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Página de módulos carregada");
  console.log("🔍 Verificando elementos DOM...");

  // Verificar se todos os elementos necessários existem
  const requiredElements = [
    "modulesContainer",
    "searchInput",
    "trailFilter",
    "loadingIndicator",
    "noModulesMessage",
    "errorMessage",
    "moduleModal",
    "deleteModal",
    "moduleForm",
    "moduleTrail",
  ];

  const missingElements = requiredElements.filter(
    (id) => !document.getElementById(id)
  );

  if (missingElements.length > 0) {
    console.error("❌ Elementos DOM ausentes:", missingElements);
    showToast("Erro na página: elementos ausentes", "error");
    return;
  }

  console.log("✅ Todos os elementos DOM encontrados");

  initializePage();
  setupEventListeners();
});

// Inicializar página
async function initializePage() {
  console.log("🔄 Inicializando página...");

  try {
    // Carregar trilhas primeiro (necessário para os filtros)
    await loadTrails();

    // Depois carregar módulos
    await loadModules();

    console.log("✅ Página inicializada com sucesso");
  } catch (error) {
    console.error("❌ Erro na inicialização:", error);
    showToast("Erro ao inicializar página", "error");
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Busca em tempo real
  searchInput.addEventListener("input", debounce(handleSearch, 300));

  // Filtro por trilha
  trailFilter.addEventListener("change", handleTrailFilter);

  // Botões principais
  addModuleBtn.addEventListener("click", showAddModuleModal);
  refreshBtn.addEventListener("click", () => {
    loadModules();
    showToast("Dados atualizados!");
  });

  // Modal de módulo
  cancelBtn.addEventListener("click", hideModuleModal);
  moduleForm.addEventListener("submit", handleModuleSubmit);

  // Modal de exclusão
  cancelDeleteBtn.addEventListener("click", hideDeleteModal);
  confirmDeleteBtn.addEventListener("click", handleDeleteConfirm);

  // Fechar modais clicando fora
  moduleModal.addEventListener("click", function (e) {
    if (e.target === moduleModal) {
      hideModuleModal();
    }
  });

  deleteModal.addEventListener("click", function (e) {
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
    console.log("🔄 Carregando trilhas...");
    const response = await fetch("/api/trails");

    console.log(
      "📡 Resposta da API trails:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
    }

    allTrails = await response.json();
    console.log(
      "✅ Trilhas carregadas:",
      allTrails.length,
      "trilhas encontradas"
    );
    console.log("📋 Trilhas:", allTrails);

    populateTrailFilters();
  } catch (error) {
    console.error("❌ Erro ao carregar trilhas:", error);
    showToast(`Erro ao carregar trilhas: ${error.message}`, "error");

    // Fallback: tentar carregar trilhas com rota alternativa
    await loadTrailsFallback();
  }
}

// Função de fallback para carregar trilhas
async function loadTrailsFallback() {
  try {
    console.log("🔄 Tentando rota alternativa para trilhas...");
    const response = await fetch("/api/trails/");

    if (!response.ok) {
      throw new Error("Trilhas não disponíveis");
    }

    allTrails = await response.json();
    console.log("✅ Trilhas carregadas via fallback:", allTrails.length);
    populateTrailFilters();
  } catch (error) {
    console.error("❌ Fallback também falhou:", error);
    // Criar opção manual se necessário
    allTrails = [];
    populateTrailFilters();
    showToast(
      "Trilhas não puderam ser carregadas. Verifique se existem trilhas cadastradas.",
      "error"
    );
  }
}

// Popular filtros de trilha
function populateTrailFilters() {
  console.log("🔄 Populando filtros de trilha...");

  // Filtro da página
  const trailFilterEl = document.getElementById("trailFilter");
  const moduleTrailEl = document.getElementById("moduleTrail");

  if (!trailFilterEl || !moduleTrailEl) {
    console.error("❌ Elementos de trilha não encontrados no DOM");
    return;
  }

  // Limpar opções existentes
  trailFilterEl.innerHTML = '<option value="">Todas as trilhas</option>';
  moduleTrailEl.innerHTML = '<option value="">Selecione uma trilha</option>';

  console.log(`📝 Adicionando ${allTrails.length} trilhas aos filtros`);

  if (!allTrails || allTrails.length === 0) {
    console.warn("⚠️ Nenhuma trilha disponível");
    // Adicionar opção indicando que não há trilhas
    const noTrailOption1 = document.createElement("option");
    noTrailOption1.value = "";
    noTrailOption1.textContent = "Nenhuma trilha cadastrada";
    noTrailOption1.disabled = true;
    trailFilterEl.appendChild(noTrailOption1);

    const noTrailOption2 = document.createElement("option");
    noTrailOption2.value = "";
    noTrailOption2.textContent = "Nenhuma trilha cadastrada";
    noTrailOption2.disabled = true;
    moduleTrailEl.appendChild(noTrailOption2);

    return;
  }

  allTrails.forEach((trail, index) => {
    console.log(`📌 Adicionando trilha ${index + 1}:`, trail);

    // Verificar se a trilha tem as propriedades necessárias
    if (!trail.id || !trail.name) {
      console.warn("⚠️ Trilha com dados incompletos:", trail);
      return;
    }

    // Filtro da página
    const option1 = document.createElement("option");
    option1.value = trail.id;
    option1.textContent = trail.name;
    trailFilterEl.appendChild(option1);

    // Seletor do modal
    const option2 = document.createElement("option");
    option2.value = trail.id;
    option2.textContent = trail.name;
    moduleTrailEl.appendChild(option2);
  });

  console.log("✅ Filtros de trilha populados com sucesso");
}

// Carregar todos os módulos
async function loadModules() {
  try {
    showLoading();
    const response = await fetch("/api/modules");

    if (!response.ok) {
      throw new Error("Erro ao carregar módulos");
    }

    allModules = await response.json();
    renderModules(allModules);
  } catch (error) {
    console.error("Erro ao carregar módulos:", error);
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
function filterAndRenderModules(searchTerm = "", selectedTrail = "") {
  let filteredModules = allModules;

  // Filtrar por termo de busca
  if (searchTerm) {
    filteredModules = filteredModules.filter(
      (module) =>
        module.name.toLowerCase().includes(searchTerm) ||
        (module.description &&
          module.description.toLowerCase().includes(searchTerm))
    );
  }

  // Filtrar por trilha
  if (selectedTrail) {
    filteredModules = filteredModules.filter(
      (module) => module.id_trail.toString() === selectedTrail
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

  const modulesHTML = sortedModules
    .map((module) => createModuleHTML(module))
    .join("");
  modulesContainer.innerHTML = modulesHTML;
}

// Criar HTML do módulo
function createModuleHTML(module) {
  const trail = allTrails.find((t) => t.id === module.id_trail);
  const trailName = trail ? trail.name : "Trilha não encontrada";
  const formattedDate = new Date(module.created_at).toLocaleDateString("pt-BR");

  return `
        <div class="module-card" data-module-id="${module.id}">
            <div class="module-header">
                <div class="module-order">${module.module_order || 1}</div>
                <h3 class="module-title">${escapeHtml(module.name)}</h3>
                <span class="trail-badge">${escapeHtml(trailName)}</span>
            </div>
            <div class="module-content">
                <p class="module-description">${escapeHtml(
                  module.description || "Sem descrição"
                )}</p>
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
  console.log("👁️ Visualizando módulo:", moduleId);

  // Converter para string para comparação, já que os IDs vêm como string do banco
  const module = allModules.find(
    (m) => m.id.toString() === moduleId.toString()
  );

  if (!module) {
    console.error("❌ Módulo não encontrado:", moduleId);
    console.log(
      "📋 IDs disponíveis:",
      allModules.map((m) => m.id)
    );
    showToast("Módulo não encontrado", "error");
    return;
  }

  console.log("✅ Módulo encontrado:", module);

  // Encontrar a trilha correspondente
  const trail = allTrails.find(
    (t) => t.id.toString() === module.id_trail.toString()
  );
  const trailName = trail ? trail.name : "Trilha não encontrada";

  // Formatar data
  const formattedDate = new Date(module.created_at).toLocaleDateString("pt-BR");

  // Criar informações do módulo
  const info = `
📚 INFORMAÇÕES DO MÓDULO

🏷️ Nome: ${module.name}
📖 Descrição: ${module.description || "Sem descrição"}
🛤️ Trilha: ${trailName}
📊 Ordem: ${module.module_order || 1}
🆔 ID: #${module.id}
📅 Criado em: ${formattedDate}
  `;

  // Mostrar informações (futuramente pode ser um modal mais elaborado)
  alert(info);

  console.log("✅ Informações do módulo exibidas");
}

// Editar módulo
function editModule(moduleId) {
  const module = allModules.find(
    (m) => m.id.toString() === moduleId.toString()
  );
  if (!module) {
    showToast("Módulo não encontrado", "error");
    return;
  }

  currentEditingModule = module;

  // Preencher formulário
  document.getElementById("moduleId").value = module.id;
  document.getElementById("moduleName").value = module.name;
  document.getElementById("moduleDescription").value = module.description || "";
  document.getElementById("moduleTrail").value = module.id_trail;
  document.getElementById("moduleOrder").value = module.module_order || 1;

  // Atualizar título e botão
  document.getElementById("modalTitle").textContent = "Editar Módulo";
  document.getElementById("submitBtnText").textContent = "Salvar Alterações";

  showModuleModal();
}

// Excluir módulo
function deleteModule(moduleId) {
  const module = allModules.find(
    (m) => m.id.toString() === moduleId.toString()
  );
  if (!module) {
    showToast("Módulo não encontrado", "error");
    return;
  }

  currentEditingModule = module;
  document.getElementById(
    "deleteModalText"
  ).textContent = `Tem certeza que deseja excluir o módulo "${module.name}"? Esta ação não pode ser desfeita.`;

  showDeleteModal();
}

// Confirmar exclusão
async function handleDeleteConfirm() {
  if (!currentEditingModule) return;

  try {
    const response = await fetch(`/api/modules/${currentEditingModule.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir módulo");
    }

    hideDeleteModal();
    showToast("Módulo excluído com sucesso!");
    await loadModules();
  } catch (error) {
    console.error("Erro ao excluir módulo:", error);
    showToast("Erro ao excluir módulo", "error");
  }

  currentEditingModule = null;
}

// Mostrar modal de adicionar módulo
function showAddModuleModal() {
  currentEditingModule = null;

  // Limpar formulário
  document.getElementById("moduleForm").reset();
  document.getElementById("moduleId").value = "";

  // Atualizar título e botão
  document.getElementById("modalTitle").textContent = "Novo Módulo";
  document.getElementById("submitBtnText").textContent = "Criar Módulo";

  showModuleModal();
}

// Lidar com submissão do formulário
async function handleModuleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const moduleData = {
    name: formData.get("name"),
    description: formData.get("description"),
    id_trail: parseInt(formData.get("id_trail")),
    module_order: parseInt(formData.get("module_order")) || 1,
  };

  // Validação básica
  if (!moduleData.name.trim()) {
    showToast("Nome do módulo é obrigatório", "error");
    return;
  }

  if (!moduleData.id_trail) {
    showToast("Trilha é obrigatória", "error");
    return;
  }

  try {
    const isEditing = currentEditingModule !== null;
    const url = isEditing
      ? `/api/modules/${currentEditingModule.id}`
      : "/api/modules";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(moduleData),
    });

    if (!response.ok) {
      throw new Error(
        isEditing ? "Erro ao atualizar módulo" : "Erro ao criar módulo"
      );
    }

    hideModuleModal();
    showToast(
      isEditing
        ? "Módulo atualizado com sucesso!"
        : "Módulo criado com sucesso!"
    );
    await loadModules();
  } catch (error) {
    console.error("Erro ao salvar módulo:", error);
    showToast(error.message, "error");
  }
}

// Mostrar modal de módulo
function showModuleModal() {
  moduleModal.classList.remove("hidden");
  document.getElementById("moduleName").focus();
}

// Esconder modal de módulo
function hideModuleModal() {
  moduleModal.classList.add("hidden");
  currentEditingModule = null;
}

// Mostrar modal de exclusão
function showDeleteModal() {
  deleteModal.classList.remove("hidden");
}

// Esconder modal de exclusão
function hideDeleteModal() {
  deleteModal.classList.add("hidden");
  currentEditingModule = null;
}

// Função para escapar HTML e prevenir XSS
function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

// Mostrar loading
function showLoading() {
  console.log("⏳ Mostrando loading...");
  loadingIndicator.classList.remove("hidden");
  hideMessages();
}

// Esconder loading
function hideLoading() {
  console.log("✅ Escondendo loading...");
  loadingIndicator.classList.add("hidden");
}

// Mostrar mensagem de sem módulos
function showNoModules() {
  console.log("📭 Mostrando mensagem de sem módulos");
  hideMessages();
  noModulesMessage.classList.remove("hidden");
}

// Mostrar mensagem de erro
function showError() {
  console.log("❌ Mostrando mensagem de erro");
  hideMessages();
  errorMessage.classList.remove("hidden");
}

// Esconder todas as mensagens
function hideMessages() {
  noModulesMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");
  modulesContainer.innerHTML = "";
}

// Mostrar toast notification
function showToast(message, type = "success") {
  console.log(`🍞 Toast: ${message} (${type})`);

  // Remover toasts existentes
  const existingToasts = document.querySelectorAll(".toast-notification");
  existingToasts.forEach((toast) => toast.remove());

  const toast = document.createElement("div");
  toast.className = `toast-notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transform transition-all duration-300 translate-x-full ${
    type === "error"
      ? "bg-red-500"
      : type === "warning"
      ? "bg-yellow-500"
      : "bg-green-500"
  }`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Animar entrada
  setTimeout(() => {
    toast.classList.remove("translate-x-full");
  }, 100);

  // Remover após 4 segundos
  setTimeout(() => {
    toast.classList.add("translate-x-full");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

// Função para recarregar módulos (usada no botão de retry)
window.loadModules = loadModules;

// Funções de debug para desenvolvimento
window.debugTrails = async function () {
  console.log("🔍 DEBUG: Testando carregamento de trilhas...");

  try {
    const response = await fetch("/api/trails");
    console.log("📡 Status da resposta:", response.status);
    console.log("📡 Headers:", [...response.headers.entries()]);

    const data = await response.json();
    console.log("📋 Dados recebidos:", data);
    console.log("📋 Tipo:", typeof data);
    console.log("📋 É array?:", Array.isArray(data));

    if (Array.isArray(data)) {
      console.log(`📋 Quantidade: ${data.length} trilhas`);
      data.forEach((trail, i) => {
        console.log(`  ${i + 1}. ID: ${trail.id}, Nome: ${trail.name}`);
      });
    }

    return data;
  } catch (error) {
    console.error("❌ Erro no debug:", error);
    return null;
  }
};

// Função de debug para testar criação manual de trilhas no select
window.debugAddTrail = function (id, name) {
  console.log(`🔧 DEBUG: Adicionando trilha manual - ID: ${id}, Nome: ${name}`);

  const moduleTrail = document.getElementById("moduleTrail");
  if (moduleTrail) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = name;
    moduleTrail.appendChild(option);
    console.log("✅ Trilha adicionada manualmente");
  } else {
    console.error("❌ Elemento moduleTrail não encontrado");
  }
};

// Função para verificar estado atual
window.debugState = function () {
  console.log("🔍 DEBUG: Estado atual da aplicação");
  console.log("📋 Trilhas carregadas:", allTrails);
  console.log("📋 Módulos carregados:", allModules.length);

  const moduleTrail = document.getElementById("moduleTrail");
  if (moduleTrail) {
    console.log("📋 Opções no select:", moduleTrail.options.length);
    for (let i = 0; i < moduleTrail.options.length; i++) {
      const option = moduleTrail.options[i];
      console.log(
        `  ${i}. Valor: "${option.value}", Texto: "${option.textContent}"`
      );
    }
  }
};
