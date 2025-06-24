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

// Download do card como PDF
async function downloadCardAsPDF(cardId) {
    try {
        const button = document.querySelector(`[data-card-id="${cardId}"].download-btn`);
        button.classList.add('loading');
        
        const card = allCards.find(c => c.id === cardId);
        if (!card) {
            throw new Error('Card não encontrado');
        }
        
        // Verificar se jsPDF está carregado
        if (typeof window.jsPDF === 'undefined') {
            throw new Error('Biblioteca de PDF não carregada');
        }
        
        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();
        
        // Configurações do PDF
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        
        // Cabeçalho
        doc.setFillColor(16, 56, 79); // bayer-dark
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('AprendizAGRO', margin, 25);
        
        // Título do card
        doc.setTextColor(16, 56, 79);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(card.title, contentWidth);
        doc.text(titleLines, margin, 60);
        
        // Descrição
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(card.description, contentWidth);
        doc.text(descLines, margin, 80);
        
        // Rodapé
        const footerY = pageHeight - 20;
        doc.setTextColor(153, 153, 153);
        doc.setFontSize(10);
        doc.text('Gerado pela plataforma AprendizAGRO', margin, footerY);
        doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - margin - 30, footerY);
        
        // Download
        const fileName = `card-${card.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`;
        doc.save(fileName);
        
        showToast('PDF baixado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showToast('Erro ao gerar PDF', 'error');
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