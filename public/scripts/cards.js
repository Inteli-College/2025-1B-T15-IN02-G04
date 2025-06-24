// Variáveis globais
let allCards = [];
let currentUser = null;
let isLoggedIn = false;

// Elementos DOM
const cardsContainer = document.getElementById('cardsContainer');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const loadingIndicator = document.getElementById('loadingIndicator');
const noCardsMessage = document.getElementById('noCardsMessage');
const errorMessage = document.getElementById('errorMessage');
const favoriteModal = document.getElementById('favoriteModal');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
});

// Inicializar página
async function initializePage() {
    await checkAuthStatus();
    await loadCards();
}

// Verificar status de autenticação
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/usuarios/me');
        if (response.ok) {
            currentUser = await response.json();
            isLoggedIn = true;
        }
    } catch (error) {
        console.log('Usuário não autenticado');
        isLoggedIn = false;
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Busca em tempo real
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Limpar busca
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Modal de favoritos
    document.getElementById('cancelFavorite').addEventListener('click', hideModal);
    document.getElementById('confirmFavorite').addEventListener('click', executeFavoriteAction);
    
    // Fechar modal clicando fora
    favoriteModal.addEventListener('click', function(e) {
        if (e.target === favoriteModal) {
            hideModal();
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

// Carregar todos os cards
async function loadCards() {
    try {
        showLoading();
        const response = await fetch('/api/cards');
        
        if (!response.ok) {
            throw new Error('Erro ao carregar cards');
        }
        
        allCards = await response.json();
        await renderCards(allCards);
        
    } catch (error) {
        console.error('Erro ao carregar cards:', error);
        showError();
    } finally {
        hideLoading();
    }
}

// Buscar cards
async function handleSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm === '') {
        clearSearchBtn.classList.add('hidden');
        await renderCards(allCards);
        return;
    }
    
    clearSearchBtn.classList.remove('hidden');
    
    try {
        showLoading();
        const response = await fetch(`/api/cards/search?q=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
            throw new Error('Erro na busca');
        }
        
        const filteredCards = await response.json();
        await renderCards(filteredCards, searchTerm);
        
    } catch (error) {
        console.error('Erro na busca:', error);
        showError();
    } finally {
        hideLoading();
    }
}

// Limpar busca
function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    renderCards(allCards);
}

// Renderizar cards
async function renderCards(cards, searchTerm = '') {
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
        console.error('Erro ao verificar favorito:', error);
    }
    return false;
}

// Criar HTML do card
function createCardHTML(card, isFavorited, searchTerm = '') {
    const highlightClass = searchTerm ? 'search-highlight' : '';
    const favoritedClass = isFavorited ? 'favorited' : '';
    const favoriteIcon = isFavorited ? '❤️' : '🤍';
    const favoriteTooltip = isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
    
    // Verificar se há imagem válida
    const hasImage = card.image && card.image.trim() !== '';
    const imageHTML = hasImage 
        ? `<img src="${card.image}" alt="${card.title}" class="card-image" onerror="this.parentElement.innerHTML='<div class=\\'card-image-placeholder\\'>📄</div>'">`
        : `<div class="card-image-placeholder">📄</div>`;
    
    return `
        <div class="card ${highlightClass}" data-card-id="${card.id}">
            <div class="card-image-container">
                ${imageHTML}
            </div>
            <div class="card-content">
                <h3 class="card-title">${escapeHtml(card.title)}</h3>
                <p class="card-description">${escapeHtml(card.description)}</p>
                <div class="card-actions">
                    ${isLoggedIn ? `
                        <button 
                            class="card-action-btn favorite-btn ${favoritedClass}" 
                            data-card-id="${card.id}"
                            data-tooltip="${favoriteTooltip}"
                            onclick="handleFavorite(${card.id}, ${isFavorited})"
                        >
                            ${favoriteIcon}
                        </button>
                    ` : `
                        <button 
                            class="card-action-btn favorite-btn" 
                            data-tooltip="Faça login para favoritar"
                            onclick="redirectToLogin()"
                        >
                            🤍
                        </button>
                    `}
                    <button 
                        class="card-action-btn download-btn" 
                        data-card-id="${card.id}"
                        data-tooltip="Baixar como PDF"
                        onclick="downloadCardAsPDF(${card.id})"
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

// Lidar com favoritar/desfavoritar
function handleFavorite(cardId, isFavorited) {
    if (!isLoggedIn) {
        redirectToLogin();
        return;
    }
    
    const action = isFavorited ? 'unfavorite' : 'favorite';
    const message = isFavorited 
        ? 'Tem certeza que deseja remover este card dos favoritos?'
        : 'Deseja adicionar este card aos seus favoritos?';
    
    showModal(message, () => executeFavoriteToggle(cardId, action));
}

// Executar ação de favoritar
async function executeFavoriteToggle(cardId, action) {
    try {
        const button = document.querySelector(`[data-card-id="${cardId}"].favorite-btn`);
        button.classList.add('loading');
        
        const url = `/api/cards/${cardId}/favorite`;
        const method = action === 'favorite' ? 'POST' : 'DELETE';
        
        const response = await fetch(url, { method });
        
        if (!response.ok) {
            throw new Error('Erro ao atualizar favorito');
        }
        
        // Atualizar UI
        updateFavoriteButton(cardId, action === 'favorite');
        
        showToast(action === 'favorite' ? 'Card adicionado aos favoritos!' : 'Card removido dos favoritos!');
        
    } catch (error) {
        console.error('Erro ao favoritar/desfavoritar:', error);
        showToast('Erro ao atualizar favorito', 'error');
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
            button.setAttribute('onclick', `handleFavorite(${cardId}, true)`);
        } else {
            button.classList.remove('favorited');
            button.innerHTML = '🤍';
            button.setAttribute('data-tooltip', 'Adicionar aos favoritos');
            button.setAttribute('onclick', `handleFavorite(${cardId}, false)`);
        }
    }
}

// Baixar card como PDF
async function downloadCardAsPDF(cardId) {
    console.log('🔄 Iniciando download do card:', cardId);
    
    try {
        const button = document.querySelector(`[data-card-id="${cardId}"].download-btn`);
        if (button) {
            button.classList.add('loading');
        }
        
        // STEP 1: Tentar PDF primeiro
        console.log('📄 Tentando gerar PDF...');
        
        const pdfResponse = await fetch(`/api/cards/${cardId}/pdf`, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf'
            }
        });

        console.log('📄 Resposta PDF:', {
            status: pdfResponse.status,
            statusText: pdfResponse.statusText,
            headers: Object.fromEntries(pdfResponse.headers.entries())
        });

        if (pdfResponse.ok) {
            console.log('✅ PDF gerado com sucesso');
            
            // Download do PDF
            const blob = await pdfResponse.blob();
            console.log('📄 Blob PDF criado:', blob.size, 'bytes');
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Extrair nome do arquivo do cabeçalho Content-Disposition
            const contentDisposition = pdfResponse.headers.get('Content-Disposition');
            let fileName = `card-${cardId}.pdf`;
            
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
                if (fileNameMatch) {
                    fileName = fileNameMatch[1];
                }
            }
            
            console.log('📄 Nome do arquivo:', fileName);
            
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showToast('PDF baixado com sucesso!');
            return;
        }

        // STEP 2: Se PDF falhar, tentar download alternativo
        console.log('⚠️ PDF falhou, tentando download alternativo...');
        
        const fallbackResponse = await fetch(`/api/cards/${cardId}/download`);
        
        console.log('📝 Resposta Fallback:', {
            status: fallbackResponse.status,
            statusText: fallbackResponse.statusText,
            headers: Object.fromEntries(fallbackResponse.headers.entries())
        });
        
        if (!fallbackResponse.ok) {
            // Tentar buscar detalhes do erro
            let errorDetails = 'Erro desconhecido';
            try {
                const errorData = await fallbackResponse.json();
                errorDetails = errorData.error || errorData.message || fallbackResponse.statusText;
                console.error('❌ Detalhes do erro:', errorData);
            } catch (e) {
                console.error('❌ Erro ao processar resposta de erro:', e);
                errorDetails = `HTTP ${fallbackResponse.status}: ${fallbackResponse.statusText}`;
            }
            
            throw new Error(`Erro ao gerar arquivo para download: ${errorDetails}`);
        }

        // Download do arquivo texto alternativo
        console.log('✅ Fallback funcionou, baixando arquivo texto...');
        
        const blob = await fallbackResponse.blob();
        console.log('📝 Blob texto criado:', blob.size, 'bytes');
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `card-${cardId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('Arquivo baixado como texto (PDF indisponível)', 'warning');
        
    } catch (error) {
        console.error('❌ Erro completo ao baixar arquivo:', {
            message: error.message,
            stack: error.stack,
            cardId: cardId
        });
        
        showToast(`Erro ao baixar arquivo: ${error.message}`, 'error');
    } finally {
        const button = document.querySelector(`[data-card-id="${cardId}"].download-btn`);
        if (button) {
            button.classList.remove('loading');
        }
    }
}

// Redirecionar para login
function redirectToLogin() {
    window.location.href = '/login';
}

// Mostrar modal
function showModal(message, onConfirm) {
    document.getElementById('favoriteModalText').textContent = message;
    favoriteModal.classList.remove('hidden');
    favoriteModal.classList.add('show');
    
    // Remover listener anterior e adicionar novo
    const confirmBtn = document.getElementById('confirmFavorite');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        hideModal();
        onConfirm();
    });
}

// Esconder modal
function hideModal() {
    favoriteModal.classList.remove('show');
    favoriteModal.classList.add('hidden');
}

// Executar ação de favorito do modal
function executeFavoriteAction() {
    hideModal();
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

// Mostrar mensagem de sem cards
function showNoCards() {
    hideMessages();
    noCardsMessage.classList.remove('hidden');
}

// Mostrar mensagem de erro
function showError() {
    hideMessages();
    errorMessage.classList.remove('hidden');
}

// Esconder todas as mensagens
function hideMessages() {
    noCardsMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
    cardsContainer.innerHTML = '';
}

// Mostrar toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transform transition-all duration-300 translate-x-full ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
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
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Função para recarregar cards (usada no botão de retry)
window.loadCards = loadCards;