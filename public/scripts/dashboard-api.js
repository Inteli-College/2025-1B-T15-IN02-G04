/**
 * Dashboard API - Gerenciador de chamadas de API específicas do dashboard
 * Responsável por todas as interações com o backend
 */

(function(window) {
    'use strict';

    const DashboardAPI = {
        
        /**
         * APIs ESPECÍFICAS PARA PTD (id_role = 3)
         */
        PTD: {
            // TF: Trilhas sendo feitas
            async getActiveTrails() {
                return await window.Dashboard.request('/api/progress/trails/active');
            },

            // TA: Trilhas atribuídas pelo gestor
            async getAssignedTrails() {
                return await window.Dashboard.request('/api/progress/trails/assigned');
            },

            // CF: Cards favoritados
            async getFavoriteCards() {
                return await window.Dashboard.request('/api/favorites');
            },

            // RK: Ranking geral
            async getRanking() {
                return await window.Dashboard.request('/api/ranking/ptd-general?includeUser=true&limit=5');
            },

            async getUserPosition() {
                return await window.Dashboard.request('/api/ranking/ptd-position');
            },

            // Ações de trilhas
            async goToTrail(trailId) {
                window.location.href = `/trilha/${trailId}`;
            },

            // Ações de cards
            async unfavoriteCard(cardId) {
                const response = await window.Dashboard.request(`/api/cards/${cardId}/favorite`, {
                    method: 'DELETE'
                }, false);
                
                if (response.success || response.message) {
                    window.Dashboard.dispatchEvent('ptd:card-unfavorited', { cardId });
                    return response;
                }
                throw new Error(response.error || 'Erro ao desfavoritar card');
            },

            async downloadCard(cardId) {
                try {
                    // Abrir em nova aba para download
                    window.open(`/api/cards/${cardId}/pdf`, '_blank');
                    window.Dashboard.showNotification('Download iniciado', 'success');
                } catch (error) {
                    console.error('Erro no download:', error);
                    // Fallback para download de texto
                    window.open(`/api/cards/${cardId}/download`, '_blank');
                    window.Dashboard.showNotification('Download de texto iniciado', 'info');
                }
            }
        },

        /**
         * APIs ESPECÍFICAS PARA GESTOR (id_role = 2)
         */
        GESTOR: {
            // PE: Membros da equipe
            async getTeamMembers() {
                return await window.Dashboard.request('/api/team/members');
            },

            async getAvailablePTDs() {
                return await window.Dashboard.request('/api/team/available-ptds');
            },

            async addPTDToTeam(ptdId) {
                const response = await window.Dashboard.request('/api/team/add-ptd', {
                    method: 'POST',
                    body: JSON.stringify({ ptdId })
                }, false);
                
                if (response.success) {
                    window.Dashboard.dispatchEvent('gestor:ptd-added', { ptdId });
                    return response;
                }
                throw new Error(response.error || 'Erro ao adicionar PTD');
            },

            async removePTDFromTeam(ptdId) {
                const response = await window.Dashboard.request(`/api/team/remove-ptd/${ptdId}`, {
                    method: 'DELETE'
                }, false);
                
                if (response.success) {
                    window.Dashboard.dispatchEvent('gestor:ptd-removed', { ptdId });
                    return response;
                }
                throw new Error(response.error || 'Erro ao remover PTD');
            },

            // RKE: Ranking da equipe
            async getTeamRanking() {
                return await window.Dashboard.request('/api/team/ranking');
            },

            // ATTR: Atribuir trilha
            async getAvailableTrails() {
                return await window.Dashboard.request('/api/team/available-trails');
            },

            async assignTrailToPTD(data) {
                const response = await window.Dashboard.request('/api/team/assign-trail', {
                    method: 'POST',
                    body: JSON.stringify(data)
                }, false);
                
                if (response.success) {
                    window.Dashboard.dispatchEvent('gestor:trail-assigned', data);
                    return response;
                }
                throw new Error(response.error || 'Erro ao atribuir trilha');
            },

            // PT: Progresso das trilhas
            async getTeamProgress() {
                const teamMembers = await this.getTeamMembers();
                const progressPromises = teamMembers.map(member => 
                    window.Dashboard.request(`/api/progress/ptd/${member.ptdId}/trails`)
                );
                
                const progressResults = await Promise.all(progressPromises);
                
                return teamMembers.map((member, index) => ({
                    ...member,
                    trails: progressResults[index]
                }));
            },

            // CPTD: Criar PTD
            async createPTD(data) {
                const response = await window.Dashboard.request('/api/team/create-ptd', {
                    method: 'POST',
                    body: JSON.stringify(data)
                }, false);
                
                if (response.success) {
                    window.Dashboard.dispatchEvent('gestor:ptd-created', response.data);
                    return response;
                }
                throw new Error(response.error || 'Erro ao criar PTD');
            },

            // Estatísticas da equipe
            async getTeamStatistics() {
                return await window.Dashboard.request('/api/team/statistics');
            }
        },

        /**
         * APIs ESPECÍFICAS PARA ADMIN (id_role = 1)
         */
        ADMIN: {
            // Analytics
            async getPlatformStats() {
                return await window.Dashboard.request('/api/admin/analytics/platform-stats');
            },

            // PPT: PTDs por trilha
            async getPTDsPerTrail() {
                return await window.Dashboard.request('/api/admin/analytics/ptds-per-trail');
            },

            // MCT: Média de completude das trilhas
            async getTrailCompletion() {
                return await window.Dashboard.request('/api/admin/analytics/trail-completion');
            },

            // C+F: Cards mais favoritados
            async getMostFavoritedCards() {
                return await window.Dashboard.request('/api/admin/analytics/most-favorited-cards?limit=5');
            },

            // C-F: Cards menos favoritados
            async getLeastFavoritedCards() {
                return await window.Dashboard.request('/api/admin/analytics/least-favorited-cards?limit=5');
            },

            // CRGA: Criar Gestor/Admin
            async createGestorAdmin(data) {
                const response = await window.Dashboard.request('/api/admin/create-user', {
                    method: 'POST',
                    body: JSON.stringify(data)
                }, false);
                
                if (response.success) {
                    window.Dashboard.dispatchEvent('admin:user-created', response.data);
                    return response;
                }
                throw new Error(response.error || 'Erro ao criar usuário');
            },

            // Listar usuários
            async getUsers(filters = {}) {
                const params = new URLSearchParams(filters);
                return await window.Dashboard.request(`/api/admin/users?${params}`);
            },

            // Analytics avançadas
            async getRecentActivity(days = 7) {
                return await window.Dashboard.request(`/api/admin/analytics/recent-activity?days=${days}`);
            },

            async getEngagementStats() {
                return await window.Dashboard.request('/api/admin/analytics/engagement');
            },

            async getManagerPerformance() {
                return await window.Dashboard.request('/api/admin/analytics/manager-performance');
            }
        },

        /**
         * APIS DE MODAIS
         */
        MODALS: {
            // Modal: Adicionar PTD
            async getAddPTDModalData() {
                return await window.Dashboard.request('/api/modals/add-ptd-data');
            },

            async searchAvailablePTDs(searchTerm = '') {
                const params = new URLSearchParams({ search: searchTerm });
                return await window.Dashboard.request(`/api/modals/search-available-ptds?${params}`);
            },

            // Modal: Atribuir trilha
            async getAssignTrailModalData() {
                return await window.Dashboard.request('/api/modals/assign-trail-data');
            },

            // Validações
            async validateEmail(email) {
                try {
                    const response = await window.Dashboard.request('/api/check-email', {
                        method: 'POST',
                        body: JSON.stringify({ email })
                    }, false);
                    return response.available;
                } catch (error) {
                    console.warn('Erro na validação de email:', error);
                    return true; // Assumir disponível em caso de erro
                }
            },

            async validateUsername(username) {
                try {
                    const response = await window.Dashboard.request('/api/check-username', {
                        method: 'POST',
                        body: JSON.stringify({ username })
                    }, false);
                    return response.available;
                } catch (error) {
                    console.warn('Erro na validação de username:', error);
                    return true; // Assumir disponível em caso de erro
                }
            }
        },

        /**
         * FUNÇÕES ESPECÍFICAS BASEADAS NO ROLE DO USUÁRIO
         */
        
        // Carregar trilhas ativas (PTD)
        async loadActiveTrails() {
            try {
                const trails = await this.PTD.getActiveTrails();
                this.renderActiveTrails(trails);
            } catch (error) {
                console.error('Erro ao carregar trilhas ativas:', error);
                window.Dashboard.showError('Erro ao carregar trilhas ativas');
            }
        },

        // Carregar trilhas atribuídas (PTD)
        async loadAssignedTrails() {
            try {
                const trails = await this.PTD.getAssignedTrails();
                this.renderAssignedTrails(trails);
            } catch (error) {
                console.error('Erro ao carregar trilhas atribuídas:', error);
                window.Dashboard.showError('Erro ao carregar trilhas atribuídas');
            }
        },

        // Carregar ranking PTD
        async loadPTDRanking() {
            try {
                const [ranking, userPosition] = await Promise.all([
                    this.PTD.getRanking(),
                    this.PTD.getUserPosition()
                ]);
                this.renderPTDRanking(ranking, userPosition);
            } catch (error) {
                console.error('Erro ao carregar ranking:', error);
                window.Dashboard.showError('Erro ao carregar ranking');
            }
        },

        // Carregar cards favoritos (PTD)
        async loadFavoriteCards() {
            try {
                const cards = await this.PTD.getFavoriteCards();
                this.renderFavoriteCards(cards);
            } catch (error) {
                console.error('Erro ao carregar cards favoritos:', error);
                window.Dashboard.showError('Erro ao carregar cards favoritos');
            }
        },

        // Carregar membros da equipe (Gestor)
        async loadTeamMembers() {
            try {
                const members = await this.GESTOR.getTeamMembers();
                this.renderTeamMembers(members);
            } catch (error) {
                console.error('Erro ao carregar membros da equipe:', error);
                window.Dashboard.showError('Erro ao carregar membros da equipe');
            }
        },

        // Carregar ranking da equipe (Gestor)
        async loadTeamRanking() {
            try {
                const ranking = await this.GESTOR.getTeamRanking();
                this.renderTeamRanking(ranking);
            } catch (error) {
                console.error('Erro ao carregar ranking da equipe:', error);
                window.Dashboard.showError('Erro ao carregar ranking da equipe');
            }
        },

        // Carregar progresso da equipe (Gestor)
        async loadTeamProgress() {
            try {
                const progress = await this.GESTOR.getTeamProgress();
                this.renderTeamProgress(progress);
            } catch (error) {
                console.error('Erro ao carregar progresso da equipe:', error);
                window.Dashboard.showError('Erro ao carregar progresso da equipe');
            }
        },

        // Carregar analytics de trilhas (Admin)
        async loadTrailsAnalytics() {
            try {
                const [ptdsPerTrail, completion] = await Promise.all([
                    this.ADMIN.getPTDsPerTrail(),
                    this.ADMIN.getTrailCompletion()
                ]);
                this.renderTrailsAnalytics(ptdsPerTrail, completion);
            } catch (error) {
                console.error('Erro ao carregar analytics de trilhas:', error);
                window.Dashboard.showError('Erro ao carregar analytics de trilhas');
            }
        },

        // Carregar analytics de cards (Admin)
        async loadCardsAnalytics() {
            try {
                const [mostFavorited, leastFavorited] = await Promise.all([
                    this.ADMIN.getMostFavoritedCards(),
                    this.ADMIN.getLeastFavoritedCards()
                ]);
                this.renderCardsAnalytics(mostFavorited, leastFavorited);
            } catch (error) {
                console.error('Erro ao carregar analytics de cards:', error);
                window.Dashboard.showError('Erro ao carregar analytics de cards');
            }
        },

        /**
         * FUNÇÕES DE RENDERIZAÇÃO
         */
        
        renderActiveTrails(trails) {
            const container = document.getElementById('active-trails');
            if (!container) return;

            const template = document.getElementById('trail-item-template');
            if (!template) return;

            container.innerHTML = '';

            if (!trails || trails.length === 0) {
                container.innerHTML = '<div class="empty-state">Nenhuma trilha ativa no momento</div>';
                return;
            }

            trails.forEach(trail => {
                const item = template.content.cloneNode(true);
                const trailItem = item.querySelector('.trail-item');
                
                trailItem.dataset.trailId = trail.id;
                item.querySelector('.trail-name').textContent = trail.name;
                item.querySelector('.progress-fill').style.width = `${trail.percentage}%`;
                item.querySelector('.progress-percentage').textContent = `${trail.percentage}%`;
                
                // Adicionar click handler
                trailItem.querySelector('.trail-action-btn').onclick = () => this.PTD.goToTrail(trail.id);
                
                container.appendChild(item);
            });
        },

        renderAssignedTrails(trails) {
            const container = document.getElementById('assigned-trails');
            if (!container) return;

            const template = document.getElementById('trail-item-template');
            if (!template) return;

            container.innerHTML = '';

            if (!trails || trails.length === 0) {
                container.innerHTML = '<div class="empty-state">Nenhuma trilha atribuída</div>';
                return;
            }

            trails.forEach(trail => {
                const item = template.content.cloneNode(true);
                const trailItem = item.querySelector('.trail-item');
                
                trailItem.dataset.trailId = trail.id;
                item.querySelector('.trail-name').textContent = trail.name;
                item.querySelector('.progress-fill').style.width = `${trail.percentage}%`;
                item.querySelector('.progress-percentage').textContent = `${trail.percentage}%`;
                
                // Adicionar indicador de atribuição
                trailItem.classList.add('assigned-trail');
                
                // Adicionar click handler
                trailItem.querySelector('.trail-action-btn').onclick = () => this.PTD.goToTrail(trail.id);
                
                container.appendChild(item);
            });
        },

        renderPTDRanking(rankingData, userPosition) {
            const container = document.getElementById('ptd-ranking');
            if (!container) return;

            container.innerHTML = '';

            // Renderizar top 5
            if (rankingData && rankingData.data && rankingData.data.ranking) {
                const ranking = rankingData.data.ranking;
                const rankingList = document.createElement('div');
                rankingList.className = 'ranking-list';

                ranking.forEach((user, index) => {
                    const item = document.createElement('div');
                    item.className = 'ranking-item';
                    item.innerHTML = `
                        <span class="position">${index + 1}.</span>
                        <span class="name">${user.name}</span>
                        <span class="score">${user.score}</span>
                    `;
                    rankingList.appendChild(item);
                });

                container.appendChild(rankingList);
            }

            // Renderizar posição do usuário
            if (userPosition && userPosition.data) {
                const userPositionEl = document.createElement('div');
                userPositionEl.className = 'user-position';
                userPositionEl.innerHTML = `
                    <div class="position-label">Sua posição:</div>
                    <div class="position-info">
                        <span class="position-number">${userPosition.data.position}º</span>
                        <span class="position-score">${userPosition.data.score} pts</span>
                    </div>
                `;
                container.appendChild(userPositionEl);
            }
        },

        renderFavoriteCards(cards) {
            const container = document.getElementById('favorite-cards');
            if (!container) return;

            const template = document.getElementById('favorite-card-template');
            if (!template) return;

            container.innerHTML = '';

            if (!cards || cards.length === 0) {
                container.innerHTML = '<div class="empty-state">Nenhum card favoritado ainda</div>';
                return;
            }

            cards.forEach(card => {
                const item = template.content.cloneNode(true);
                const cardItem = item.querySelector('.favorite-card');
                
                cardItem.dataset.cardId = card.id;
                item.querySelector('.card-title').textContent = card.title;
                item.querySelector('.card-description').textContent = card.description;
                
                // Configurar botões
                item.querySelector('.unfavorite-btn').dataset.cardId = card.id;
                item.querySelector('.download-btn').dataset.cardId = card.id;
                
                container.appendChild(item);
            });
        },

        // Adicionar outras funções de renderização conforme necessário...
        renderTeamMembers(members) {
            // Implementar renderização de membros da equipe
            console.log('Renderizando membros da equipe:', members);
        },

        renderTeamRanking(ranking) {
            // Implementar renderização do ranking da equipe
            console.log('Renderizando ranking da equipe:', ranking);
        },

        renderTeamProgress(progress) {
            // Implementar renderização do progresso da equipe
            console.log('Renderizando progresso da equipe:', progress);
        },

        renderTrailsAnalytics(ptdsPerTrail, completion) {
            // Implementar renderização de analytics de trilhas
            console.log('Renderizando analytics de trilhas:', { ptdsPerTrail, completion });
        },

        renderCardsAnalytics(mostFavorited, leastFavorited) {
            // Implementar renderização de analytics de cards
            console.log('Renderizando analytics de cards:', { mostFavorited, leastFavorited });
        }
    };

    // Estender o Dashboard principal com as APIs
    if (window.Dashboard) {
        Object.assign(window.Dashboard, DashboardAPI);
    }

    console.log('🌐 [DASHBOARD] API carregada');

})(window);