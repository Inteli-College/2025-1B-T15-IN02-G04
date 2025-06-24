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

// SVG Icons
const ICONS = {
  heartOutline: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.172 5.172a4 4 0 015.656 0L12 8.343l3.172-3.171a4 4 0 115.656 5.656L12 21.172l-8.828-8.828a4 4 0 010-5.656z" /></svg>`,
  heartSolid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M11.998 21.8l-.697-.637C5.252 15.552 2 12.592 2 8.5 2 5.44 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.44 22 8.5c0 4.092-3.252 7.052-9.303 12.663l-.699.637z" /></svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0 0-5-5m5 5 5-5M12 12V3" /></svg>`
};

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
    const highlightClasses = searchTerm ? 'ring-2 ring-field-blue' : '';
    const favoritedClass = isFavorited ? 'favorited bg-field-green text-white' : '';

    // Verificar se há imagem válida
    const hasImage = card.image && card.image.trim() !== '';
    const imageHTML = hasImage
        ? `<img src="${card.image}" alt="${card.title}" class="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105" onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center w-full h-full bg-gray-300\\'><svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' class=\\'w-10 h-10 text-gray-400\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M4 16V8a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H8a4 4 0 01-4-4z\\'/></svg></div>'">`
        : `<div class="flex items-center justify-center w-full h-full bg-gray-300"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-10 h-10 text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16V8a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H8a4 4 0 01-4-4z"/></svg></div>`;

    return `
        <div class="card group bg-white rounded-xl overflow-hidden shadow-md transform transition hover:-translate-y-1 hover:shadow-lg border-2 border-transparent ${highlightClasses}" data-card-id="${card.id}">
            <div class="relative w-full h-48 overflow-hidden bg-gray-200">
                ${imageHTML}
            </div>
            <div class="p-6 flex flex-col flex-1 card-content">
                <h3 class="text-lg font-semibold text-field-blue-dark mb-2 card-title">${escapeHtml(card.title)}</h3>
                <p class="text-gray-500 text-sm mb-4 card-description">${escapeHtml(card.description)}</p>
                <div class="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto card-actions">
                    ${isLoggedIn ? `
                        <button 
                            class="card-action-btn favorite-btn flex items-center justify-center w-10 h-10 rounded-full border-2 border-field-green bg-white text-gray-500 hover:bg-field-green hover:text-white transition transform hover:scale-110 ${favoritedClass}" 
                            data-card-id="${card.id}"
                            title="${isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
                            onclick="handleFavorite(${card.id}, ${isFavorited})"
                        >
                            ${isFavorited ? ICONS.heartSolid : ICONS.heartOutline}
                        </button>
                    ` : `
                        <button 
                            class="card-action-btn favorite-btn flex items-center justify-center w-10 h-10 rounded-full border-2 border-field-green bg-white text-gray-500 hover:bg-field-green hover:text-white transition transform hover:scale-110" 
                            title="Faça login para favoritar"
                            onclick="redirectToLogin()"
                        >
                            ${ICONS.heartOutline}
                        </button>
                    `}
                    <button 
                        class="card-action-btn download-btn flex items-center justify-center w-10 h-10 rounded-full border-2 border-field-blue bg-white text-gray-500 hover:bg-field-blue hover:text-white transition transform hover:scale-110" 
                        data-card-id="${card.id}"
                        title="Baixar como PDF"
                        onclick="downloadCardAsPDF(${card.id})"
                    >
                        ${ICONS.download}
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
        if (button) {
            button.classList.add('animate-spin', 'pointer-events-none', 'opacity-70');
        }
        
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
    if (!button) return;

    button.classList.remove('animate-spin', 'pointer-events-none', 'opacity-70');

    if (isFavorited) {
        button.classList.add('favorited', 'bg-field-green', 'text-white');
        button.innerHTML = ICONS.heartSolid;
        button.setAttribute('title', 'Remover dos favoritos');
        button.setAttribute('onclick', `handleFavorite(${cardId}, true)`);
    } else {
        button.classList.remove('favorited', 'bg-field-green', 'text-white');
        button.classList.add('bg-white', 'text-gray-500');
        button.innerHTML = ICONS.heartOutline;
        button.setAttribute('title', 'Adicionar aos favoritos');
        button.setAttribute('onclick', `handleFavorite(${cardId}, false)`);
    }
}

// Baixar card como PDF (versão simplificada)
function downloadCardAsPDF(cardId) {
    const button = document.querySelector(`[data-card-id="${cardId}"].download-btn`);
    if (button) {
        button.classList.add('animate-spin', 'pointer-events-none', 'opacity-70');
    }

    const link = document.createElement('a');
    link.href = `/api/cards/${cardId}/pdf`;
    link.setAttribute('download', ''); // nome definido pelo servidor via Content-Disposition
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (button) {
        button.classList.remove('animate-spin', 'pointer-events-none', 'opacity-70');
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