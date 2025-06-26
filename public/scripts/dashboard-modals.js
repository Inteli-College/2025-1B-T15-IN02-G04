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
            console.log(`🪟 [MODALS] Tentando abrir modal: ${modalId}`);
            
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.error(`❌ [MODALS] Modal ${modalId} não encontrado no DOM`);
                return false;
            }

            console.log(`✅ [MODALS] Modal ${modalId} encontrado, abrindo...`);

            // Fechar modal anterior se necessário
            if (this.state.activeModal && !options.keepPrevious) {
                this.closeModal(this.state.activeModal, true);
            }

            // Configurar modal
            this.state.activeModal = modalId;
            this.state.modalStack.push(modalId);

            // Mostrar modal
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
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

            console.log(`🪟 [MODALS] Modal ${modalId} aberto com sucesso`);
            
            // Disparar evento
            if (window.Dashboard && window.Dashboard.dispatchEvent) {
                window.Dashboard.dispatchEvent('modal:opened', { modalId, modal });
            }

            return true;
        },

        /**
         * Fechar modal
         * @param {string} modalId - ID do modal
         * @param {boolean} silent - Se deve ser silencioso
         */
        closeModal(modalId, silent = false) {
            console.log(`❌ [MODALS] Fechando modal: ${modalId}`);
            
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
                modal.classList.add('hidden');
                
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

            console.log(`❌ [MODALS] Modal ${modalId} fechado`);
            
            // Disparar evento
            if (window.Dashboard && window.Dashboard.dispatchEvent) {
                window.Dashboard.dispatchEvent('modal:closed', { modalId, modal });
            }
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
            console.log('👥 [MODALS] Abrindo modal de adicionar PTD');
            
            try {
                // Verificar se o modal existe
                const modal = document.getElementById('add-ptd-modal');
                if (!modal) {
                    console.error('❌ [MODALS] Modal add-ptd-modal não encontrado no DOM');
                    alert('Modal não encontrado. Verifique se está logado como Gestor.');
                    return;
                }

                // Abrir modal primeiro
                const opened = this.openModal('add-ptd-modal', {
                    onOpen: async () => {
                        console.log('📊 [MODALS] Carregando dados do modal...');
                        await this.populateAddPTDModal();
                    }
                });

                if (!opened) {
                    throw new Error('Falha ao abrir modal');
                }
                
            } catch (error) {
                console.error('❌ [MODALS] Erro ao abrir modal de adicionar PTD:', error);
                if (window.Dashboard && window.Dashboard.showNotification) {
                    window.Dashboard.showNotification('Erro ao carregar dados do modal', 'error');
                } else {
                    alert('Erro ao carregar dados do modal');
                }
            }
        },

        async populateAddPTDModal() {
            const container = document.getElementById('available-ptds-list');
            const loadingEl = document.getElementById('available-ptds-loading');
            const noResultsEl = document.getElementById('no-ptds-message');
            const template = document.getElementById('available-ptd-template');

            if (!container || !template) {
                console.error('❌ [MODALS] Elementos do modal não encontrados');
                return;
            }

            try {
                // Mostrar loading
                if (loadingEl) loadingEl.style.display = 'block';
                if (noResultsEl) noResultsEl.style.display = 'none';

                // Buscar PTDs disponíveis
                const response = await fetch('/api/team/available-ptds');
                if (!response.ok) {
                    throw new Error('Erro ao buscar PTDs disponíveis');
                }

                const data = await response.json();
                console.log('📊 [MODALS] PTDs disponíveis recebidos:', data);

                // Esconder loading
                if (loadingEl) loadingEl.style.display = 'none';

                // Limpar container
                container.innerHTML = '';

                if (!data.success || !data.data || data.data.length === 0) {
                    if (noResultsEl) noResultsEl.style.display = 'block';
                    return;
                }

                // Renderizar PTDs disponíveis
                data.data.forEach(ptd => {
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

                console.log(`✅ [MODALS] ${data.data.length} PTDs carregados no modal`);

            } catch (error) {
                console.error('❌ [MODALS] Erro ao carregar PTDs:', error);
                if (loadingEl) loadingEl.style.display = 'none';
                container.innerHTML = '<div class="error-message">Erro ao carregar PTDs disponíveis</div>';
            }
        },

        /**
         * Modal: Atribuir trilha
         */
        async openAssignTrailModal() {
            console.log('🎯 [MODALS] Abrindo modal de atribuir trilha');
            
            try {
                const modal = document.getElementById('assign-trail-modal');
                if (!modal) {
                    console.error('❌ [MODALS] Modal assign-trail-modal não encontrado no DOM');
                    alert('Modal não encontrado. Verifique se está logado como Gestor.');
                    return;
                }

                const opened = this.openModal('assign-trail-modal', {
                    onOpen: async () => {
                        console.log('📊 [MODALS] Carregando dados do modal de atribuição...');
                        if (window.loadAssignTrailModalData) {
                            await window.loadAssignTrailModalData();
                        }
                    }
                });

                if (!opened) {
                    throw new Error('Falha ao abrir modal');
                }
                
            } catch (error) {
                console.error('❌ [MODALS] Erro ao abrir modal de atribuir trilha:', error);
                if (window.Dashboard && window.Dashboard.showNotification) {
                    window.Dashboard.showNotification('Erro ao carregar modal', 'error');
                } else {
                    alert('Erro ao carregar modal');
                }
            }
        },

        /**
         * Modal: Criar PTD
         */
        openCreatePTDModal() {
            console.log('👤 [MODALS] Abrindo modal de criar PTD');
            
            const modal = document.getElementById('create-ptd-modal');
            if (!modal) {
                console.error('❌ [MODALS] Modal create-ptd-modal não encontrado no DOM');
                alert('Modal não encontrado. Verifique se está logado como Gestor.');
                return;
            }

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
            console.log('👑 [MODALS] Abrindo modal de criar Admin/Gestor');
            
            const modal = document.getElementById('create-admin-modal');
            if (!modal) {
                console.error('❌ [MODALS] Modal create-admin-modal não encontrado no DOM');
                alert('Modal não encontrado. Verifique se está logado como Admin.');
                return;
            }

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
        }
    };

    // Estender o Dashboard principal com os modais
    if (window.Dashboard) {
        Object.assign(window.Dashboard, DashboardModals);
        console.log('🪟 [DASHBOARD] Modals integrado ao Dashboard principal');
    } else {
        // Se Dashboard não existe ainda, aguardar
        document.addEventListener('DOMContentLoaded', () => {
            if (window.Dashboard) {
                Object.assign(window.Dashboard, DashboardModals);
                console.log('🪟 [DASHBOARD] Modals integrado ao Dashboard principal (delayed)');
            }
        });
    }

    // Também expor globalmente para acesso direto
    window.DashboardModals = DashboardModals;

    console.log('🪟 [DASHBOARD] Modals carregado');

})(window);