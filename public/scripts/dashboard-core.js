/**
 * Dashboard Core - Sistema principal do dashboard modular
 * Responsável por inicialização, estado global e utilitários
 */

(function(window) {
    'use strict';

    // Configuração global do dashboard
    const DashboardCore = {
        // Estado global
        state: {
            initialized: false,
            user: null,
            role: null,
            apiBase: '/api/dashboard',
            refreshInterval: null,
            loading: false,
            cache: new Map(),
            notifications: []
        },
        
        // Configurações
        config: {
            refreshInterval: 5 * 60 * 1000, // 5 minutos
            cacheTimeout: 2 * 60 * 1000,    // 2 minutos
            retryAttempts: 3,
            retryDelay: 1000
        },

        /**
         * Inicializar o dashboard
         * @param {Object} options - Configurações de inicialização
         */
        init(options = {}) {
            console.log('🚀 [DASHBOARD] Inicializando dashboard...');
            
            try {
                // Configurar estado inicial
                this.state.user = options.user || window.dashboardConfig?.userName || null;
                this.state.role = options.role || window.dashboardConfig?.userRole || null;
                this.state.apiBase = options.apiBase || window.dashboardConfig?.apiBase || '/api/dashboard';
                this.config.refreshInterval = options.refreshInterval || this.config.refreshInterval;

                // Configurar listeners globais
                this.setupEventListeners();
                
                // Configurar refresh automático
                this.setupAutoRefresh();
                
                // Configurar interceptadores de requisições
                this.setupRequestInterceptors();
                
                // Carregar dados iniciais
                this.loadInitialData();
                
                // Marcar como inicializado
                this.state.initialized = true;
                
                console.log('✅ [DASHBOARD] Dashboard inicializado com sucesso');
                this.dispatchEvent('dashboard:initialized', { user: this.state.user, role: this.state.role });
                
            } catch (error) {
                console.error('❌ [DASHBOARD] Erro na inicialização:', error);
                this.showError('Erro ao inicializar dashboard');
            }
        },

        /**
         * Configurar event listeners globais
         */
        setupEventListeners() {
            // Listener para refresh manual
            const refreshBtn = document.getElementById('refresh-dashboard');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => this.refreshDashboard());
            }

            // Listener para notificações
            const notificationBtn = document.getElementById('dashboard-notifications');
            if (notificationBtn) {
                notificationBtn.addEventListener('click', () => this.toggleNotifications());
            }

            // Listener para mudanças de conectividade
            window.addEventListener('online', () => {
                this.showNotification('Conexão restaurada', 'success');
                this.refreshDashboard();
            });

            window.addEventListener('offline', () => {
                this.showNotification('Sem conexão com a internet', 'warning');
            });

            // Listener para erros globais
            window.addEventListener('error', (event) => {
                console.error('❌ [DASHBOARD] Erro global:', event.error);
            });

            // Listener para rejeições de Promise não tratadas
            window.addEventListener('unhandledrejection', (event) => {
                console.error('❌ [DASHBOARD] Promise rejeitada:', event.reason);
            });
        },

        /**
         * Configurar refresh automático
         */
        setupAutoRefresh() {
            if (this.state.refreshInterval) {
                clearInterval(this.state.refreshInterval);
            }

            this.state.refreshInterval = setInterval(() => {
                if (!this.state.loading && navigator.onLine) {
                    this.refreshDashboard(true); // Refresh silencioso
                }
            }, this.config.refreshInterval);
        },

        /**
         * Configurar interceptadores de requisições
         */
        setupRequestInterceptors() {
            // Interceptar fetch para adicionar headers padrão
            const originalFetch = window.fetch;
            window.fetch = async (url, options = {}) => {
                try {
                    // Adicionar headers padrão
                    options.headers = {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        ...options.headers
                    };

                    // Adicionar timeout
                    if (!options.signal) {
                        const controller = new AbortController();
                        setTimeout(() => controller.abort(), 30000); // 30 segundos
                        options.signal = controller.signal;
                    }

                    const response = await originalFetch(url, options);
                    
                    // Verificar se é erro de autenticação
                    if (response.status === 401) {
                        this.handleAuthError();
                        return response;
                    }

                    return response;
                } catch (error) {
                    if (error.name === 'AbortError') {
                        throw new Error('Tempo limite da requisição excedido');
                    }
                    throw error;
                }
            };
        },

        /**
         * Carregar dados iniciais do dashboard
         */
        async loadInitialData() {
            try {
                this.showLoading();
                
                // Carregar dados específicos baseado no role
                switch (this.state.role) {
                    case 1: // Admin
                        await this.loadAdminData();
                        break;
                    case 2: // Gestor
                        await this.loadGestorData();
                        break;
                    case 3: // PTD
                        await this.loadPTDData();
                        break;
                    default:
                        throw new Error('Role de usuário não reconhecido');
                }
                
            } catch (error) {
                console.error('❌ [DASHBOARD] Erro ao carregar dados iniciais:', error);
                this.showError('Erro ao carregar dados do dashboard');
            } finally {
                this.hideLoading();
            }
        },

        /**
         * Carregar dados específicos para Admin
         */
        async loadAdminData() {
            console.log('📊 [DASHBOARD] Carregando dados do Admin...');
            
            try {
                const [analytics, trails, cards] = await Promise.all([
                    this.request('/api/admin/analytics/platform-stats'),
                    this.request('/api/admin/analytics/ptds-per-trail'),
                    Promise.all([
                        this.request('/api/admin/analytics/most-favorited-cards'),
                        this.request('/api/admin/analytics/least-favorited-cards')
                    ])
                ]);

                this.dispatchEvent('dashboard:admin-data-loaded', {
                    analytics,
                    trails,
                    cards: { most: cards[0], least: cards[1] }
                });
                
            } catch (error) {
                console.error('❌ [DASHBOARD] Erro ao carregar dados do Admin:', error);
                throw error;
            }
        },

        /**
         * Carregar dados específicos para Gestor
         */
        async loadGestorData() {
            console.log('👥 [DASHBOARD] Carregando dados do Gestor...');
            
            try {
                const [team, ranking, trails] = await Promise.all([
                    this.request('/api/team/members'),
                    this.request('/api/team/ranking'),
                    this.request('/api/team/available-trails')
                ]);

                this.dispatchEvent('dashboard:gestor-data-loaded', {
                    team,
                    ranking,
                    trails
                });
                
            } catch (error) {
                console.error('❌ [DASHBOARD] Erro ao carregar dados do Gestor:', error);
                throw error;
            }
        },

        /**
         * Carregar dados específicos para PTD
         */
        async loadPTDData() {
            console.log('📚 [DASHBOARD] Carregando dados do PTD...');
            
            try {
                const [activeTrails, assignedTrails, ranking, favorites] = await Promise.all([
                    this.request('/api/progress/trails/active'),
                    this.request('/api/progress/trails/assigned'),
                    this.request('/api/ranking/ptd-general?includeUser=true'),
                    this.request('/api/favorites')
                ]);

                this.dispatchEvent('dashboard:ptd-data-loaded', {
                    activeTrails,
                    assignedTrails,
                    ranking,
                    favorites
                });
                
            } catch (error) {
                console.error('❌ [DASHBOARD] Erro ao carregar dados do PTD:', error);
                throw error;
            }
        },

        /**
         * Fazer requisição com retry e cache
         * @param {string} url - URL da requisição
         * @param {Object} options - Opções da requisição
         * @param {boolean} useCache - Se deve usar cache
         */
        async request(url, options = {}, useCache = true) {
            // Verificar cache primeiro
            if (useCache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
                const cacheKey = `${url}${JSON.stringify(options)}`;
                const cached = this.getFromCache(cacheKey);
                if (cached) {
                    return cached;
                }
            }

            let lastError;
            
            // Tentar requisição com retry
            for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
                try {
                    const response = await fetch(url, options);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    
                    // Cachear resultado se for GET
                    if (useCache && (!options.method || options.method === 'GET')) {
                        const cacheKey = `${url}${JSON.stringify(options)}`;
                        this.setCache(cacheKey, data);
                    }
                    
                    return data;
                    
                } catch (error) {
                    lastError = error;
                    console.warn(`⚠️ [DASHBOARD] Tentativa ${attempt} falhou:`, error.message);
                    
                    // Se não for a última tentativa, aguardar antes de tentar novamente
                    if (attempt < this.config.retryAttempts) {
                        await this.delay(this.config.retryDelay * attempt);
                    }
                }
            }
            
            throw lastError;
        },

        /**
         * Gerenciamento de cache
         */
        setCache(key, data) {
            this.state.cache.set(key, {
                data,
                timestamp: Date.now()
            });
        },

        getFromCache(key) {
            const cached = this.state.cache.get(key);
            if (cached && (Date.now() - cached.timestamp) < this.config.cacheTimeout) {
                return cached.data;
            }
            this.state.cache.delete(key);
            return null;
        },

        clearCache() {
            this.state.cache.clear();
            console.log('🗑️ [DASHBOARD] Cache limpo');
        },

        /**
         * Atualizar dashboard
         * @param {boolean} silent - Se deve ser silencioso (sem indicadores visuais)
         */
        async refreshDashboard(silent = false) {
            if (this.state.loading) {
                console.log('⏳ [DASHBOARD] Refresh já em andamento, ignorando...');
                return;
            }

            try {
                console.log('🔄 [DASHBOARD] Atualizando dashboard...');
                
                if (!silent) {
                    this.showLoading();
                }
                
                // Limpar cache para forçar novos dados
                this.clearCache();
                
                // Recarregar dados
                await this.loadInitialData();
                
                if (!silent) {
                    this.showNotification('Dashboard atualizado', 'success');
                }
                
                this.dispatchEvent('dashboard:refreshed');
                
            } catch (error) {
                console.error('❌ [DASHBOARD] Erro ao atualizar dashboard:', error);
                if (!silent) {
                    this.showError('Erro ao atualizar dashboard');
                }
            } finally {
                if (!silent) {
                    this.hideLoading();
                }
            }
        },

        /**
         * Gerenciar loading state
         */
        showLoading() {
            this.state.loading = true;
            const loadingEl = document.getElementById('dashboard-loading');
            if (loadingEl) {
                loadingEl.classList.remove('hidden');
            }
            
            // Desabilitar botão de refresh
            const refreshBtn = document.getElementById('refresh-dashboard');
            if (refreshBtn) {
                refreshBtn.disabled = true;
                refreshBtn.classList.add('loading');
            }
        },

        hideLoading() {
            this.state.loading = false;
            const loadingEl = document.getElementById('dashboard-loading');
            if (loadingEl) {
                loadingEl.classList.add('hidden');
            }
            
            // Reabilitar botão de refresh
            const refreshBtn = document.getElementById('refresh-dashboard');
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.classList.remove('loading');
            }
        },

        /**
         * Sistema de notificações
         */
        showNotification(message, type = 'info', duration = 5000) {
            if (window.DashboardNotifications) {
                window.DashboardNotifications.show(message, type, duration);
            } else {
                // Fallback simples
                console.log(`[${type.toUpperCase()}] ${message}`);
            }
        },

        showError(message, duration = 8000) {
            this.showNotification(message, 'error', duration);
        },

        showSuccess(message, duration = 4000) {
            this.showNotification(message, 'success', duration);
        },

        /**
         * Gerenciar erros de autenticação
         */
        handleAuthError() {
            console.warn('🔐 [DASHBOARD] Erro de autenticação detectado');
            this.showError('Sessão expirada. Redirecionando para login...');
            
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        },

        /**
         * Toggle painel de notificações
         */
        toggleNotifications() {
            // Implementar toggle do painel de notificações
            console.log('🔔 [DASHBOARD] Toggle notificações');
        },

        /**
         * Utilitários
         */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        formatDate(date) {
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(date));
        },

        formatNumber(number) {
            return new Intl.NumberFormat('pt-BR').format(number);
        },

        /**
         * Sistema de eventos customizados
         */
        dispatchEvent(eventName, data = {}) {
            const event = new CustomEvent(eventName, { 
                detail: data,
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(event);
        },

        addEventListener(eventName, callback) {
            document.addEventListener(eventName, callback);
        },

        removeEventListener(eventName, callback) {
            document.removeEventListener(eventName, callback);
        },

        /**
         * Cleanup ao sair da página
         */
        destroy() {
            if (this.state.refreshInterval) {
                clearInterval(this.state.refreshInterval);
                this.state.refreshInterval = null;
            }
            
            this.clearCache();
            this.state.initialized = false;
            
            console.log('🧹 [DASHBOARD] Dashboard destruído');
        }
    };

    // Cleanup automático ao sair da página
    window.addEventListener('beforeunload', () => {
        DashboardCore.destroy();
    });

    // Expor globalmente
    window.Dashboard = DashboardCore;
    
    console.log('📦 [DASHBOARD] Core carregado');

})(window);