/**
 * Dashboard Modals - Gerenciador de modais do dashboard
 * Responsável por abertura, fechamento e interações com modais
 */

(function(window) {
    'use strict';

    const DashboardModals = {
        
        // Estado dos modais
        state: {
            activeModal: null,
            modalStack: [],
            blockClose: false
        },

        /**
         * Abrir modal genérico
         * @param {string} modalId - ID do modal
         * @param {Object} options - Opções do modal
         */
        openModal(modalId, options = {}) {
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.error(`❌ [MODALS] Modal ${modalId} não encontrado`);
                return;
            }

            // Fechar modal anterior se necessário
            if (this.state.activeModal && !options.keepPrevious) {
                this.closeModal(this.state.activeModal, true);
            }

            // Configurar modal
            this.state.activeModal = modalId;
            this.state.modalStack.push(modalId);

            // Mostrar modal
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');

            // Aplicar animação
            setTimeout(() => {
                modal.classList.add('modal-active');
            }, 10);

            // Configurar eventos
            this.setupModalEvents(modalId);

            // Callback de abertura
            if (options.onOpen) {
                options.onOpen(modal);
            }

            console.log(`🪟 [MODALS] Modal ${modalId} aberto`);
            
            // Disparar evento
            window.Dashboard.dispatchEvent('modal:opened', { modalId, modal });
        },

        /**
         * Fechar modal
         * @param {string} modalId - ID do modal
         * @param {boolean} silent - Se deve ser silencioso
         */
        closeModal(modalId, silent = false) {
            const modal = document.getElementById(modalId);
            if (!modal) {
                if (!silent) {
                    console.error(`❌ [MODALS] Modal ${modalId} não encontrado`);
                }
                return;
            }

            // Verificar se pode fechar
            if (this.state.blockClose && !silent) {
                console.log(`⏸️ [MODALS] Fechamento do modal ${modalId} bloqueado`);
                return;
            }

            // Animação de fechamento
            modal.classList.remove('modal-active');

            setTimeout(() => {
                modal.style.display = 'none';
                
                // Limpar estado
                this.state.modalStack = this.state.modalStack.filter(id => id !== modalId);
                
                if (this.state.activeModal === modalId) {
                    this.state.activeModal = this.state.modalStack[this.state.modalStack.length - 1] || null;
                }

                // Remover classe do body se não há modais ativos
                if (this.state.modalStack.length === 0) {
                    document.body.classList.remove('modal-open');
                }

                // Limpar formulário se houver
                const form = modal.querySelector('form');
                if (form) {
                    form.reset();
                    this.clearFormErrors(form);
                }

            }, 300); // Tempo da animação CSS

            console.log(`🪟 [MODALS] Modal ${modalId} fechado`);
            
            // Disparar evento
            window.Dashboard.dispatchEvent('modal:closed', { modalId, modal });
        },

        /**
         * Configurar eventos do modal
         * @param {string} modalId - ID do modal
         */
        setupModalEvents(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;

            // Clique no overlay para fechar
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modalId);
                }
            });

            // Tecla ESC para fechar
            const escHandler = (e) => {
                if (e.key === 'Escape' && this.state.activeModal === modalId) {
                    this.closeModal(modalId);
                }
            };
            
            document.addEventListener('keydown', escHandler);
            
            // Limpar listener quando modal fechar
            modal.addEventListener('modal:closed', () => {
                document.removeEventListener('keydown', escHandler);
            });

            // Botão de fechar
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modalId));
            }
        },

        /**
         * MODAIS ESPECÍFICOS
         */

        /**
         * Modal: Adicionar PTD à equipe
         */
        async openAddPTDModal() {
            try {
                // Carregar dados primeiro
                const data = await window.Dashboard.getAddPTDModalData();
                
                this.openModal('add-ptd-modal', {
                    onOpen: () => {
                        this.populateAddPTDModal(data.data);
                    }
                });
                
            } catch (error) {
                console.error('❌ [MODALS] Erro ao abrir modal de adicionar PTD:', error);
                window.Dashboard.showError('Erro ao carregar dados do modal');
            }
        },

        populateAddPTDModal(data) {
            const container = document.getElementById('available-ptds-list');
            const loadingEl = document.getElementById('available-ptds-loading');
            const noResultsEl = document.getElementById('no-ptds-message');
            const template = document.getElementById('available-ptd-template');

            if (!container || !template) return;

            // Esconder loading
            if (loadingEl) loadingEl.style.display = 'none';

            // Limpar container
            container.innerHTML = '';

            if (!data.availablePTDs || data.availablePTDs.length === 0) {
                if (noResultsEl) noResultsEl.style.display = 'block';
                return;
            }

            // Renderizar PTDs disponíveis
            data.availablePTDs.forEach(ptd => {
                const item = template.content.cloneNode(true);
                const ptdItem = item.querySelector('.ptd-item');
                
                ptdItem.dataset.ptdId = ptd.ptdId;
                
                // Avatar
                const avatarImg = item.querySelector('.avatar-img');
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ptd.ptdName)}&background=89D329&color=fff&size=128`;
                avatarImg.alt = ptd.ptdName;
                
                // Informações
                item.querySelector('.ptd-name').textContent = ptd.ptdName;
                item.querySelector('.ptd-email').textContent = ptd.ptdEmail;
                
                // Botão adicionar
                const addBtn = item.querySelector('.add-ptd-btn');
                addBtn.dataset.ptdId = ptd.ptdId;
                
                container.appendChild(item);
            });

            console.log(`✅ [MODALS] ${data.availablePTDs.length} PTDs carregados no modal`);
        },

        /**
         * Modal: Atribuir trilha
         */
        async openAssignTrailModal() {
            try {
                this.openModal('assign-trail-modal', {
                    onOpen: async () => {
                        await this.loadAssignTrailModalData();
                    }
                });
                
            } catch (error) {
                console.error('❌ [MODALS] Erro ao abrir modal de atribuir trilha:', error);
                window.Dashboard.showError('Erro ao carregar modal');
            }
        },

        async loadAssignTrailModalData() {
            try {
                // Chamar a função global definida no modal
                if (window.loadAssignTrailModalData) {
                    await window.loadAssignTrailModalData();
                }
            } catch (error) {
                console.error('❌ [MODALS] Erro ao carregar dados do modal de atribuição:', error);
                window.Dashboard.showError('Erro ao carregar dados do modal');
            }
        },

        /**
         * Modal: Criar PTD
         */
        openCreatePTDModal() {
            this.openModal('create-ptd-modal', {
                onOpen: (modal) => {
                    // Focar no primeiro campo
                    const firstInput = modal.querySelector('input[type="text"]');
                    if (firstInput) {
                        setTimeout(() => firstInput.focus(), 100);
                    }
                }
            });
        },

        /**
         * Modal: Criar Gestor/Admin
         */
        openCreateAdminModal() {
            this.openModal('create-admin-modal', {
                onOpen: (modal) => {
                    // Focar no primeiro campo
                    const firstInput = modal.querySelector('input[type="text"]');
                    if (firstInput) {
                        setTimeout(() => firstInput.focus(), 100);
                    }
                }
            });
        },

        /**
         * UTILITÁRIOS PARA FORMULÁRIOS
         */

        /**
         * Limpar erros de formulário
         * @param {HTMLElement} form - Elemento do formulário
         */
        clearFormErrors(form) {
            const errorElements = form.querySelectorAll('.field-error, .error-message');
            errorElements.forEach(el => {
                el.style.display = 'none';
                el.textContent = '';
            });

            // Remover classes de erro dos campos
            const fields = form.querySelectorAll('.form-input, .form-select, .form-textarea');
            fields.forEach(field => {
                field.classList.remove('error');
            });
        },

        /**
         * Validar formulário
         * @param {HTMLElement} form - Elemento do formulário
         * @returns {boolean} - Se o formulário é válido
         */
        validateForm(form) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    this.showFieldError(field, 'Este campo é obrigatório');
                    isValid = false;
                } else {
                    this.hideFieldError(field);
                }
            });

            return isValid;
        },

        /**
         * Mostrar erro em campo específico
         * @param {HTMLElement} field - Campo do formulário
         * @param {string} message - Mensagem de erro
         */
        showFieldError(field, message) {
            const fieldId = field.id;
            const errorEl = document.getElementById(`${fieldId}-error`) || 
                           document.querySelector(`[data-field="${fieldId}"] .field-error`);
            
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.style.display = 'block';
            }
            
            field.classList.add('error');
        },

        /**
         * Esconder erro de campo
         * @param {HTMLElement} field - Campo do formulário
         */
        hideFieldError(field) {
            const fieldId = field.id;
            const errorEl = document.getElementById(`${fieldId}-error`) || 
                           document.querySelector(`[data-field="${fieldId}"] .field-error`);
            
            if (errorEl) {
                errorEl.style.display = 'none';
            }
            
            field.classList.remove('error');
        },

        /**
         * Bloquear fechamento do modal
         * @param {boolean} block - Se deve bloquear
         */
        blockModalClose(block = true) {
            this.state.blockClose = block;
        },

        /**
         * Verificar se há modal ativo
         * @returns {boolean}
         */
        hasActiveModal() {
            return this.state.activeModal !== null;
        },

        /**
         * Obter modal ativo
         * @returns {string|null}
         */
        getActiveModal() {
            return this.state.activeModal;
        },

        /**
         * Fechar todos os modais
         */
        closeAllModals() {
            const modalsToClose = [...this.state.modalStack];
            modalsToClose.forEach(modalId => {
                this.closeModal(modalId, true);
            });
        },

        /**
         * Configurar eventos globais
         */
        setupGlobalEvents() {
            // Fechar modais ao clicar em links externos
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href]');
                if (link && link.href && !link.href.startsWith('#')) {
                    if (this.hasActiveModal()) {
                        this.closeAllModals();
                    }
                }
            });

            // Interceptar eventos de formulário
            document.addEventListener('submit', (e) => {
                const form = e.target;
                if (form.closest('.modal-overlay')) {
                    // Bloquear fechamento durante envio
                    this.blockModalClose(true);
                    
                    // Desbloquear após um tempo ou quando o formulário for resetado
                    setTimeout(() => {
                        this.blockModalClose(false);
                    }, 5000);
                }
            });
        }
    };

    // Configurar eventos globais quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            DashboardModals.setupGlobalEvents();
        });
    } else {
        DashboardModals.setupGlobalEvents();
    }

    // Estender o Dashboard principal com os modais
    if (window.Dashboard) {
        Object.assign(window.Dashboard, DashboardModals);
    }

    console.log('🪟 [DASHBOARD] Modals carregado');

})(window);