/**
 * Dashboard Notifications - Sistema de notificações toast
 * Responsável por exibir notificações temporárias e gerenciar o painel de notificações
 */

(function(window) {
    'use strict';

    const DashboardNotifications = {
        
        // Estado das notificações
        state: {
            toasts: new Map(),
            notifications: [],
            unreadCount: 0,
            panelOpen: false,
            maxToasts: 5,
            maxNotifications: 50
        },

        // Configurações
        config: {
            defaultDuration: 5000,
            durations: {
                success: 4000,
                info: 5000,
                warning: 6000,
                error: 8000
            },
            positions: {
                topRight: 'top-right',
                topLeft: 'top-left',
                bottomRight: 'bottom-right',
                bottomLeft: 'bottom-left'
            },
            animations: {
                slideIn: 'slide-in',
                fadeIn: 'fade-in',
                bounceIn: 'bounce-in'
            }
        },

        /**
         * Inicializar sistema de notificações
         */
        init() {
            this.createToastContainer();
            this.setupEventListeners();
            this.loadStoredNotifications();
            
            console.log('🔔 [NOTIFICATIONS] Sistema inicializado');
        },

        /**
         * Criar container de toasts se não existir
         */
        createToastContainer() {
            let container = document.getElementById('toast-container');
            
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-container';
                container.className = 'toast-container';
                document.body.appendChild(container);
            }

            return container;
        },

        /**
         * Configurar event listeners
         */
        setupEventListeners() {
            // Listener para notificações do dashboard
            document.addEventListener('dashboard:notification', (e) => {
                const { message, type, duration } = e.detail;
                this.show(message, type, duration);
            });

            // Listener para eventos do dashboard
            document.addEventListener('dashboard:data-loaded', () => {
                this.show('Dados carregados com sucesso', 'success');
            });

            document.addEventListener('dashboard:error', (e) => {
                const { message } = e.detail;
                this.show(message || 'Erro no dashboard', 'error');
            });
        },

        /**
         * Carregar notificações armazenadas
         */
        loadStoredNotifications() {
            try {
                const stored = localStorage.getItem('dashboard-notifications');
                if (stored) {
                    this.state.notifications = JSON.parse(stored);
                    this.updateNotificationBadge();
                }
            } catch (error) {
                console.warn('Erro ao carregar notificações armazenadas:', error);
            }
        },

        /**
         * Salvar notificações no localStorage
         */
        saveNotifications() {
            try {
                localStorage.setItem('dashboard-notifications', JSON.stringify(this.state.notifications));
            } catch (error) {
                console.warn('Erro ao salvar notificações:', error);
            }
        },

        /**
         * Mostrar toast notification
         * @param {string} message - Mensagem da notificação
         * @param {string} type - Tipo da notificação (success, error, warning, info)
         * @param {number} duration - Duração em ms (opcional)
         * @param {Object} options - Opções adicionais
         */
        show(message, type = 'info', duration = null, options = {}) {
            const id = this.generateId();
            const finalDuration = duration || this.config.durations[type] || this.config.defaultDuration;
            
            // Criar toast
            const toast = this.createToast(id, message, type, options);
            
            // Adicionar ao container
            const container = this.createToastContainer();
            container.appendChild(toast);
            
            // Gerenciar limite de toasts
            this.manageToastLimit();
            
            // Armazenar referência
            this.state.toasts.set(id, {
                element: toast,
                timeout: null,
                type,
                message,
                timestamp: Date.now()
            });

            // Adicionar às notificações persistentes
            this.addNotification(message, type);
            
            // Animação de entrada
            setTimeout(() => {
                toast.classList.add('toast-show');
            }, 10);
            
            // Auto-remover
            if (finalDuration > 0) {
                const timeout = setTimeout(() => {
                    this.remove(id);
                }, finalDuration);
                
                this.state.toasts.get(id).timeout = timeout;
            }
            
            console.log(`🔔 [NOTIFICATIONS] Toast ${type}: ${message}`);
            
            return id;
        },

        /**
         * Criar elemento de toast
         * @param {string} id - ID único do toast
         * @param {string} message - Mensagem
         * @param {string} type - Tipo
         * @param {Object} options - Opções
         */
        createToast(id, message, type, options = {}) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.setAttribute('data-toast-id', id);
            
            // Ícones por tipo
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            
            toast.innerHTML = `
                <div class="toast-content">
                    <div class="toast-icon">${icons[type] || icons.info}</div>
                    <div class="toast-message">${this.escapeHtml(message)}</div>
                    <button class="toast-close" onclick="window.DashboardNotifications.remove('${id}')" aria-label="Fechar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                ${options.showProgress !== false ? '<div class="toast-progress"><div class="toast-progress-bar"></div></div>' : ''}
            `;
            
            // Configurar barra de progresso
            if (options.showProgress !== false) {
                const progressBar = toast.querySelector('.toast-progress-bar');
                const duration = options.duration || this.config.durations[type] || this.config.defaultDuration;
                progressBar.style.animationDuration = `${duration}ms`;
            }
            
            // Event listeners
            toast.addEventListener('mouseenter', () => {
                this.pauseToast(id);
            });
            
            toast.addEventListener('mouseleave', () => {
                this.resumeToast(id);
            });
            
            return toast;
        },

        /**
         * Remover toast
         * @param {string} id - ID do toast
         */
        remove(id) {
            const toastData = this.state.toasts.get(id);
            if (!toastData) return;
            
            const { element, timeout } = toastData;
            
            // Cancelar timeout
            if (timeout) {
                clearTimeout(timeout);
            }
            
            // Animação de saída
            element.classList.add('toast-hide');
            
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                this.state.toasts.delete(id);
            }, 300);
        },

        /**
         * Pausar toast
         * @param {string} id - ID do toast
         */
        pauseToast(id) {
            const toastData = this.state.toasts.get(id);
            if (!toastData || !toastData.timeout) return;
            
            clearTimeout(toastData.timeout);
            toastData.timeout = null;
            
            // Pausar animação da barra de progresso
            const progressBar = toastData.element.querySelector('.toast-progress-bar');
            if (progressBar) {
                progressBar.style.animationPlayState = 'paused';
            }
        },

        /**
         * Retomar toast
         * @param {string} id - ID do toast
         */
        resumeToast(id) {
            const toastData = this.state.toasts.get(id);
            if (!toastData || toastData.timeout) return;
            
            // Continuar animação da barra de progresso
            const progressBar = toastData.element.querySelector('.toast-progress-bar');
            if (progressBar) {
                progressBar.style.animationPlayState = 'running';
            }
            
            // Novo timeout com tempo restante
            const timeout = setTimeout(() => {
                this.remove(id);
            }, 2000); // Tempo restante aproximado
            
            toastData.timeout = timeout;
        },

        /**
         * Gerenciar limite de toasts ativos
         */
        manageToastLimit() {
            const container = document.getElementById('toast-container');
            if (!container) return;
            
            const toasts = container.querySelectorAll('.toast');
            if (toasts.length > this.state.maxToasts) {
                // Remover o mais antigo
                const oldestToast = toasts[0];
                const oldestId = oldestToast.getAttribute('data-toast-id');
                if (oldestId) {
                    this.remove(oldestId);
                }
            }
        },

        /**
         * Adicionar notificação persistente
         * @param {string} message - Mensagem
         * @param {string} type - Tipo
         */
        addNotification(message, type) {
            const notification = {
                id: this.generateId(),
                message,
                type,
                timestamp: Date.now(),
                read: false
            };
            
            this.state.notifications.unshift(notification);
            
            // Limitar número de notificações
            if (this.state.notifications.length > this.state.maxNotifications) {
                this.state.notifications = this.state.notifications.slice(0, this.state.maxNotifications);
            }
            
            this.state.unreadCount++;
            this.updateNotificationBadge();
            this.saveNotifications();
        },

        /**
         * Atualizar badge de notificações
         */
        updateNotificationBadge() {
            const badge = document.querySelector('.notification-badge');
            if (!badge) return;
            
            if (this.state.unreadCount > 0) {
                badge.textContent = this.state.unreadCount > 99 ? '99+' : this.state.unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        },

        /**
         * Marcar notificação como lida
         * @param {string} id - ID da notificação
         */
        markAsRead(id) {
            const notification = this.state.notifications.find(n => n.id === id);
            if (notification && !notification.read) {
                notification.read = true;
                this.state.unreadCount = Math.max(0, this.state.unreadCount - 1);
                this.updateNotificationBadge();
                this.saveNotifications();
            }
        },

        /**
         * Marcar todas como lidas
         */
        markAllAsRead() {
            this.state.notifications.forEach(notification => {
                notification.read = true;
            });
            this.state.unreadCount = 0;
            this.updateNotificationBadge();
            this.saveNotifications();
        },

        /**
         * Limpar todas as notificações
         */
        clearAll() {
            this.state.notifications = [];
            this.state.unreadCount = 0;
            this.updateNotificationBadge();
            this.saveNotifications();
        },

        /**
         * Toggle painel de notificações
         */
        togglePanel() {
            // TODO: Implementar painel de notificações
            console.log('🔔 [NOTIFICATIONS] Toggle painel');
        },

        /**
         * Métodos de conveniência
         */
        success(message, duration = null, options = {}) {
            return this.show(message, 'success', duration, options);
        },

        error(message, duration = null, options = {}) {
            return this.show(message, 'error', duration, options);
        },

        warning(message, duration = null, options = {}) {
            return this.show(message, 'warning', duration, options);
        },

        info(message, duration = null, options = {}) {
            return this.show(message, 'info', duration, options);
        },

        /**
         * Utilitários
         */
        generateId() {
            return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        },

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        /**
         * Remover todos os toasts ativos
         */
        removeAll() {
            const toastIds = Array.from(this.state.toasts.keys());
            toastIds.forEach(id => this.remove(id));
        },

        /**
         * Obter estatísticas
         */
        getStats() {
            return {
                activeToasts: this.state.toasts.size,
                totalNotifications: this.state.notifications.length,
                unreadCount: this.state.unreadCount,
                panelOpen: this.state.panelOpen
            };
        }
    };

    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            DashboardNotifications.init();
        });
    } else {
        DashboardNotifications.init();
    }

    // Expor globalmente
    window.DashboardNotifications = DashboardNotifications;
    
    console.log('🔔 [DASHBOARD] Notifications carregado');

})(window);