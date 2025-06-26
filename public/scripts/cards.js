// Variáveis globais
let allCards = [];
let currentUser = null;
let isLoggedIn = false;
let isAdmin = false;
let editingCardId = null;

// DEBUG: Adicionar logs detalhados
console.log('🔄 [DEBUG] Script cards.js carregado');

// Elementos DOM
const cardsContainer = document.getElementById("cardsContainer");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearch");
const loadingIndicator = document.getElementById("loadingIndicator");
const noCardsMessage = document.getElementById("noCardsMessage");
const errorMessage = document.getElementById("errorMessage");
const favoriteModal = document.getElementById("favoriteModal");

// Elementos admin
const addCardBtn = document.getElementById('addCardBtn');
const editCardModal = document.getElementById('editCardModal');
const editCardForm = document.getElementById('editCardForm');
const editModalTitle = document.getElementById('editModalTitle');
const editModalClose = document.getElementById('editModalClose');
const editModalCancel = document.getElementById('editModalCancel');
const editModalDelete = document.getElementById('editModalDelete');
const editModalSave = document.getElementById('editModalSave');
const editModalLoading = document.getElementById('editModalLoading');

console.log('🔍 [DEBUG] Elementos DOM encontrados:', {
    cardsContainer: !!cardsContainer,
    addCardBtn: !!addCardBtn,
    editCardModal: !!editCardModal
});

// Inicialização

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 [DEBUG] DOM carregado, iniciando página');
    initializePage();
    setupEventListeners();
});

// Inicializar página
async function initializePage() {
    console.log('🔄 [DEBUG] Iniciando página...');
    await checkAuthStatus();
    await loadCards();
    toggleAdminElements();
}

// Verificar status de autenticação
async function checkAuthStatus() {
    console.log('🔍 [DEBUG] Verificando status de autenticação...');
    
    try {
        const response = await fetch('/api/usuarios/me');
        console.log('📡 [DEBUG] Resposta da API /me:', {
            status: response.status,
            ok: response.ok
        });
        
        if (response.ok) {
            currentUser = await response.json();
            isLoggedIn = true;
            
            console.log('👤 [DEBUG] Dados do usuário recebidos:', {
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                roles: currentUser.roles,
                isAdmin: currentUser.isAdmin
            });
            
            // Verificação dupla do isAdmin
            isAdmin = currentUser.isAdmin || false;
            
            // Verificação adicional se currentUser.roles existe
            if (currentUser.roles && Array.isArray(currentUser.roles)) {
                const hasAdminRole = currentUser.roles.some(role => {
                    console.log('🔍 [DEBUG] Verificando role:', role, 'id_role:', role.id_role);
                    return parseInt(role.id_role) === 1;
                });
                
                console.log('👑 [DEBUG] Verificação manual de admin role:', hasAdminRole);
                
                // Se a verificação manual encontrou admin role, mas isAdmin é false
                if (hasAdminRole && !isAdmin) {
                    console.log('⚠️ [DEBUG] DISCREPÂNCIA: Role admin encontrada mas isAdmin=false');
                    isAdmin = true; // Forçar true
                }
            }
            
            console.log('🔑 [DEBUG] Status final de autenticação:', { 
                isLoggedIn,
                isAdmin,
                userId: currentUser.id,
                userRoles: currentUser.roles?.length || 0
            });
        } else {
            console.log('❌ [DEBUG] Usuário não autenticado (status:', response.status, ')');
            isLoggedIn = false;
            isAdmin = false;
        }
    } catch (error) {
        console.log('❌ [DEBUG] Erro ao verificar autenticação:', error);
        isLoggedIn = false;
        isAdmin = false;
    }
  } catch (error) {
    console.log("Usuário não autenticado");
    isLoggedIn = false;
  }
}

// Mostrar/ocultar elementos de admin
function toggleAdminElements() {
    console.log('🎛️ [DEBUG] Alternando elementos admin. isAdmin:', isAdmin);
    
    const adminElements = document.querySelectorAll('.admin-only');
    console.log('🔍 [DEBUG] Elementos admin encontrados:', adminElements.length);
    
    adminElements.forEach((element, index) => {
        console.log(`🔍 [DEBUG] Elemento ${index}:`, {
            tag: element.tagName,
            id: element.id,
            classes: element.className,
            isAdmin: isAdmin
        });
        
        if (isAdmin) {
            element.classList.add('show-admin');
            if (element.style.display === 'flex' || element.classList.contains('flex')) {
                element.classList.add('flex');
            }
            console.log(`✅ [DEBUG] Elemento ${index} mostrado`);
        } else {
            element.classList.remove('show-admin', 'flex');
            console.log(`❌ [DEBUG] Elemento ${index} ocultado`);
        }
    });
    
    // Log final
    const visibleAdminElements = document.querySelectorAll('.admin-only.show-admin');
    console.log('📊 [DEBUG] Elementos admin visíveis após toggle:', visibleAdminElements.length);
}

// Configurar event listeners
function setupEventListeners() {
    console.log('🔗 [DEBUG] Configurando event listeners...');
    
    // Busca em tempo real
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Limpar busca
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Modal de favoritos
    document.getElementById('cancelFavorite')?.addEventListener('click', hideModal);
    document.getElementById('confirmFavorite')?.addEventListener('click', executeFavoriteAction);
    
    // Fechar modal clicando fora
    favoriteModal?.addEventListener('click', function(e) {
        if (e.target === favoriteModal) {
            hideModal();
        }
    });

    // Event listeners de admin
    if (addCardBtn) {
        console.log('✅ [DEBUG] Adicionando listener ao botão de adicionar card');
        addCardBtn.addEventListener('click', openCreateCardModal);
    } else {
        console.log('❌ [DEBUG] Botão de adicionar card não encontrado');
    }

    if (editModalClose) {
        editModalClose.addEventListener('click', closeEditModal);
    }

    if (editModalCancel) {
        editModalCancel.addEventListener('click', closeEditModal);
    }

    if (editModalDelete) {
        editModalDelete.addEventListener('click', confirmDeleteCard);
    }

    if (editCardForm) {
        editCardForm.addEventListener('submit', handleCardSubmit);
    }

    if (editCardModal) {
        editCardModal.addEventListener('click', function(e) {
            if (e.target === editCardModal) {
                closeEditModal();
            }
        });
    }
    
    console.log('✅ [DEBUG] Event listeners configurados');
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

// Carregar todos os cards
async function loadCards() {
  try {
    showLoading();
    const response = await fetch("/api/cards");

    if (!response.ok) {
      throw new Error("Erro ao carregar cards");
    }

    allCards = await response.json();
    await renderCards(allCards);
  } catch (error) {
    console.error("Erro ao carregar cards:", error);
    showError();
  } finally {
    hideLoading();
  }
}

// Buscar cards
async function handleSearch() {
  const searchTerm = searchInput.value.trim();

  if (searchTerm === "") {
    clearSearchBtn.classList.add("hidden");
    await renderCards(allCards);
    return;
  }

  clearSearchBtn.classList.remove("hidden");

  try {
    showLoading();
    const response = await fetch(
      `/api/cards/search?q=${encodeURIComponent(searchTerm)}`
    );

    if (!response.ok) {
      throw new Error("Erro na busca");
    }

    const filteredCards = await response.json();
    await renderCards(filteredCards, searchTerm);
  } catch (error) {
    console.error("Erro na busca:", error);
    showError();
  } finally {
    hideLoading();
  }
}

// Limpar busca
function clearSearch() {
  searchInput.value = "";
  clearSearchBtn.classList.add("hidden");
  renderCards(allCards);
}

// Renderizar cards
async function renderCards(cards, searchTerm = '') {
    console.log('🎨 [DEBUG] Renderizando cards. Total:', cards.length, 'isAdmin:', isAdmin);
    
    if (cards.length === 0) {
        showNoCards();
        return;
    }
    
    hideMessages();
    
    let cardsHTML = '';
    
    for (const card of cards) {
        const isFavorited = isLoggedIn ? await checkIfCardIsFavorited(card.id) : false;
        cardsHTML += createCardHTML(card, isFavorited, searchTerm);
    }
    
    cardsContainer.innerHTML = cardsHTML;
    
    // Adicionar event listeners aos botões dos cards
    addCardEventListeners();
    
    console.log('✅ [DEBUG] Cards renderizados');
}

// Verificar se card é favorito
async function checkIfCardIsFavorited(cardId) {
  if (!isLoggedIn) return false;

  try {
    const response = await fetch(`/api/cards/${cardId}/check-favorite`);
    if (response.ok) {
      const data = await response.json();
      return data.isFavorited;
    }
  } catch (error) {
    console.error("Erro ao verificar favorito:", error);
  }
  return false;
}

// Criar HTML do card
function createCardHTML(card, isFavorited, searchTerm = '') {
    const highlightClass = searchTerm ? 'search-highlight' : '';
    const favoritedClass = isFavorited ? 'favorited' : '';
    const favoriteIcon = isFavorited ? '❤️' : '🤍';
    const favoriteTooltip = isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    
    // Classe admin para cards clicáveis
    const adminCardClass = isAdmin ? 'admin-card' : '';
    const cardClickHandler = isAdmin ? `onclick="openEditCardModal(${card.id})"` : '';
    
    console.log('🎨 [DEBUG] Criando card HTML. ID:', card.id, 'isAdmin:', isAdmin, 'adminCardClass:', adminCardClass);
    
    // Verificar se há imagem válida
    const hasImage = card.image && card.image.trim() !== '';
    const imageHTML = hasImage 
        ? `<img src="${card.image}" alt="${card.title}" class="card-image" onerror="this.parentElement.innerHTML='<div class=\\'card-image-placeholder\\'>📄</div>'">`
        : `<div class="card-image-placeholder">📄</div>`;
    
    return `
        <div class="card ${highlightClass} ${adminCardClass}" data-card-id="${card.id}" ${cardClickHandler}>
            <div class="card-image-container">
                ${imageHTML}
            </div>
            <div class="card-content">
                <h3 class="card-title">${escapeHtml(card.title)}</h3>
                <p class="card-description">${escapeHtml(card.description)}</p>
                <div class="card-actions">
                    ${
                      isLoggedIn
                        ? `
                        <button 
                            class="card-action-btn favorite-btn ${favoritedClass}" 
                            data-card-id="${card.id}"
                            data-tooltip="${favoriteTooltip}"
                            onclick="event.stopPropagation(); handleFavorite(${card.id}, ${isFavorited})"
                        >
                            ${favoriteIcon}
                        </button>
                    `
                        : `
                        <button 
                            class="card-action-btn favorite-btn" 
                            data-tooltip="Faça login para favoritar"
                            onclick="event.stopPropagation(); redirectToLogin()"
                        >
                            🤍
                        </button>
                    `
                    }
                    <button 
                        class="card-action-btn download-btn" 
                        data-card-id="${card.id}"
                        data-tooltip="Baixar como PDF"
                        onclick="event.stopPropagation(); downloadCardAsPDF(${card.id})"
                    >
                        📥
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Adicionar event listeners aos cards
function addCardEventListeners() {
  // Os event listeners são adicionados via onclick no HTML
  // para melhor performance com muitos cards
}

// =========================
// ADMIN FUNCTIONS
// =========================

// Abrir modal para criar novo card
function openCreateCardModal() {
    console.log('➕ [DEBUG] Abrindo modal para criar card');
    
    editingCardId = null;
    editModalTitle.textContent = 'Criar Novo Card';
    editModalDelete.classList.add('hidden');
    editModalSave.textContent = 'Criar Card';
    
    // Limpar formulário
    document.getElementById('editCardTitle').value = '';
    document.getElementById('editCardDescription').value = '';
    document.getElementById('editCardImage').value = '';
    
    showEditModal();
}

// Abrir modal para editar card
async function openEditCardModal(cardId) {
    console.log('✏️ [DEBUG] Abrindo modal para editar card:', cardId);
    
    try {
        editingCardId = cardId;
        editModalTitle.textContent = 'Editar Card';
        editModalDelete.classList.remove('hidden');
        editModalSave.textContent = 'Salvar Alterações';
        
        showEditModalLoading();
        
        // Buscar dados do card
        const response = await fetch(`/api/cards/${cardId}`);
        if (!response.ok) {
            throw new Error('Erro ao carregar dados do card');
        }
        
        const card = await response.json();
        
        // Preencher formulário
        document.getElementById('editCardTitle').value = card.title;
        document.getElementById('editCardDescription').value = card.description;
        document.getElementById('editCardImage').value = card.image || '';
        
        hideEditModalLoading();
        showEditModal();
        
    } catch (error) {
        console.error('Erro ao carregar card para edição:', error);
        hideEditModalLoading();
        showToast('Erro ao carregar dados do card', 'error');
    }
}

// Mostrar modal de edição
function showEditModal() {
    console.log('📱 [DEBUG] Mostrando modal de edição');
    editCardModal.classList.remove('hidden');
    editCardModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Fechar modal de edição
function closeEditModal() {
    console.log('❌ [DEBUG] Fechando modal de edição');
    editCardModal.classList.remove('show');
    setTimeout(() => {
        editCardModal.classList.add('hidden');
        document.body.style.overflow = '';
        editingCardId = null;
    }, 300);
}

// Mostrar loading no modal
function showEditModalLoading() {
    editModalLoading.classList.remove('hidden');
}

// Esconder loading no modal
function hideEditModalLoading() {
    editModalLoading.classList.add('hidden');
}

// Manipular submissão do formulário
async function handleCardSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('editCardTitle').value.trim();
    const description = document.getElementById('editCardDescription').value.trim();
    const image = document.getElementById('editCardImage').value.trim();
    
    if (!title || !description) {
        showToast('Título e descrição são obrigatórios', 'error');
        return;
    }
    
    try {
        editModalSave.classList.add('loading');
        editModalSave.disabled = true;
        
        const cardData = { title, description, image };
        
        let response;
        if (editingCardId) {
            // Editar card existente
            response = await fetch(`/api/cards/${editingCardId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cardData)
            });
        } else {
            // Criar novo card
            response = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cardData)
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao salvar card');
        }
        
        const actionText = editingCardId ? 'atualizado' : 'criado';
        showToast(`Card ${actionText} com sucesso!`, 'success');
        
        closeEditModal();
        await loadCards(); // Recarregar cards
        
    } catch (error) {
        console.error('Erro ao salvar card:', error);
        showToast(`Erro ao salvar card: ${error.message}`, 'error');
    } finally {
        editModalSave.classList.remove('loading');
        editModalSave.disabled = false;
    }
}

// Confirmar deleção do card
function confirmDeleteCard() {
    if (!editingCardId) return;
    
    const card = allCards.find(c => c.id === editingCardId);
    const cardTitle = card ? card.title : 'este card';
    
    if (confirm(`Tem certeza que deseja deletar "${cardTitle}"? Esta ação não pode ser desfeita.`)) {
        deleteCard();
    }
}

// Deletar card
async function deleteCard() {
    if (!editingCardId) return;
    
    try {
        editModalDelete.classList.add('loading');
        editModalDelete.disabled = true;
        
        const response = await fetch(`/api/cards/${editingCardId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao deletar card');
        }
        
        showToast('Card deletado com sucesso!', 'success');
        
        closeEditModal();
        await loadCards(); // Recarregar cards
        
    } catch (error) {
        console.error('Erro ao deletar card:', error);
        showToast(`Erro ao deletar card: ${error.message}`, 'error');
    } finally {
        editModalDelete.classList.remove('loading');
        editModalDelete.disabled = false;
    }
}

// =========================
// EXISTING FUNCTIONS (mantidas inalteradas)
// =========================

// Lidar com favoritar/desfavoritar
function handleFavorite(cardId, isFavorited) {
  if (!isLoggedIn) {
    redirectToLogin();
    return;
  }

  const action = isFavorited ? "unfavorite" : "favorite";
  const message = isFavorited
    ? "Tem certeza que deseja remover este card dos favoritos?"
    : "Deseja adicionar este card aos seus favoritos?";

  showModal(message, () => executeFavoriteToggle(cardId, action));
}

// Executar ação de favoritar
async function executeFavoriteToggle(cardId, action) {
  try {
    const button = document.querySelector(
      `[data-card-id="${cardId}"].favorite-btn`
    );
    button.classList.add("loading");

    const url = `/api/cards/${cardId}/favorite`;
    const method = action === "favorite" ? "POST" : "DELETE";

    const response = await fetch(url, { method });

    if (!response.ok) {
      throw new Error("Erro ao atualizar favorito");
    }

    // Atualizar UI
    updateFavoriteButton(cardId, action === "favorite");

    showToast(
      action === "favorite"
        ? "Card adicionado aos favoritos!"
        : "Card removido dos favoritos!"
    );
  } catch (error) {
    console.error("Erro ao favoritar/desfavoritar:", error);
    showToast("Erro ao atualizar favorito", "error");
  }
}

// Atualizar botão de favorito
function updateFavoriteButton(cardId, isFavorited) {
    const button = document.querySelector(`[data-card-id="${cardId}"].favorite-btn`);
    if (button) {
        button.classList.remove('loading');
        
        if (isFavorited) {
            button.classList.add('favorited');
            button.innerHTML = '❤️';
            button.setAttribute('data-tooltip', 'Remover dos favoritos');
            button.setAttribute('onclick', `event.stopPropagation(); handleFavorite(${cardId}, true)`);
        } else {
            button.classList.remove('favorited');
            button.innerHTML = '🤍';
            button.setAttribute('data-tooltip', 'Adicionar aos favoritos');
            button.setAttribute('onclick', `event.stopPropagation(); handleFavorite(${cardId}, false)`);
        }
    }
  }
}

// Baixar card como PDF
async function downloadCardAsPDF(cardId) {
  console.log("📥 Iniciando download do card:", cardId);

  const button = document.querySelector(
    `[data-card-id="${cardId}"].download-btn`
  );
  if (button) {
    button.classList.add("loading");
  }

  try {
    // PRIMEIRO: Tentar gerar PDF (rota principal)
    console.log("📄 Tentando gerar PDF...");

    const pdfResponse = await fetch(`/api/cards/${cardId}/pdf`, {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    });

    console.log("📄 Resposta da rota PDF:", {
      status: pdfResponse.status,
      statusText: pdfResponse.statusText,
      contentType: pdfResponse.headers.get("Content-Type"),
    });

    // Se PDF foi gerado com sucesso
    if (
      pdfResponse.ok &&
      pdfResponse.headers.get("Content-Type")?.includes("application/pdf")
    ) {
      console.log("✅ PDF gerado com sucesso!");

      const blob = await pdfResponse.blob();
      console.log("📄 Blob PDF criado:", blob.size, "bytes");

      // Verificar se é realmente um PDF
      if (blob.type === "application/pdf" || blob.size > 0) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Extrair nome do arquivo do cabeçalho
        const contentDisposition = pdfResponse.headers.get(
          "Content-Disposition"
        );
        let fileName = `card-${cardId}.pdf`;

        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (fileNameMatch) {
            fileName = fileNameMatch[1];
          }
        }

        console.log("📄 Baixando PDF:", fileName);

        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast("📄 PDF baixado com sucesso!", "success");
        return; // Sucesso! Não precisa do fallback
      }
    }

    // Se chegou aqui, o PDF falhou. Vamos ver por quê.
    let errorMessage = "PDF não disponível";

    if (!pdfResponse.ok) {
      try {
        const errorData = await pdfResponse.json();
        errorMessage =
          errorData.error || errorData.details || pdfResponse.statusText;
        console.log("❌ Erro detalhado do PDF:", errorData);
      } catch (e) {
        errorMessage = `Erro HTTP ${pdfResponse.status}: ${pdfResponse.statusText}`;
        console.log("❌ Erro HTTP:", errorMessage);
      }
    }

    // SEGUNDO: Tentar fallback (arquivo texto)
    console.log("⚠️ PDF falhou, tentando download alternativo...");
    console.log("⚠️ Motivo da falha:", errorMessage);

    const fallbackResponse = await fetch(`/api/cards/${cardId}/download`);

    console.log("📝 Resposta do fallback:", {
      status: fallbackResponse.status,
      statusText: fallbackResponse.statusText,
      contentType: fallbackResponse.headers.get("Content-Type"),
    });

    if (fallbackResponse.ok) {
      const blob = await fallbackResponse.blob();
      console.log("📝 Fallback blob criado:", blob.size, "bytes");

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `card-${cardId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showToast(
        "📝 Arquivo baixado como texto (PDF temporariamente indisponível)",
        "warning"
      );
      console.log("✅ Fallback realizado com sucesso");
      return;
    }

    // Se nem o fallback funcionou
    const fallbackError = await fallbackResponse.text();
    throw new Error(
      `Ambas as tentativas falharam. PDF: ${errorMessage}, Fallback: ${fallbackError}`
    );
  } catch (error) {
    console.error("❌ Erro completo no download:", error);
    showToast(`Erro no download: ${error.message}`, "error");
  } finally {
    if (button) {
      button.classList.remove("loading");
    }
  }
}

// Redirecionar para login
function redirectToLogin() {
  window.location.href = "/login";
}

// Mostrar modal
function showModal(message, onConfirm) {
  document.getElementById("favoriteModalText").textContent = message;
  favoriteModal.classList.remove("hidden");
  favoriteModal.classList.add("show");

  // Remover listener anterior e adicionar novo
  const confirmBtn = document.getElementById("confirmFavorite");
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  newConfirmBtn.addEventListener("click", () => {
    hideModal();
    onConfirm();
  });
}

// Esconder modal
function hideModal() {
  favoriteModal.classList.remove("show");
  favoriteModal.classList.add("hidden");
}

// Executar ação de favorito do modal
function executeFavoriteAction() {
  hideModal();
}

// Mostrar loading
function showLoading() {
  loadingIndicator.classList.remove("hidden");
  hideMessages();
}

// Esconder loading
function hideLoading() {
  loadingIndicator.classList.add("hidden");
}

// Mostrar mensagem de sem cards
function showNoCards() {
  hideMessages();
  noCardsMessage.classList.remove("hidden");
}

// Mostrar mensagem de erro
function showError() {
  hideMessages();
  errorMessage.classList.remove("hidden");
}

// Esconder todas as mensagens
function hideMessages() {
  noCardsMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");
  cardsContainer.innerHTML = "";
}

// Mostrar toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transform transition-all duration-300 translate-x-full ${
        type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Função para recarregar cards (usada no botão de retry)
window.loadCards = loadCards;

// Tornar funções disponíveis globalmente para uso em onclick
window.openEditCardModal = openEditCardModal;
window.handleFavorite = handleFavorite;
window.downloadCardAsPDF = downloadCardAsPDF;
window.redirectToLogin = redirectToLogin;
