# PLANEJAMENTO PARA IMPLEMENTAÇÃO DO DASHBOARD MODULAR

## 📋 RESUMO EXECUTIVO

### Objetivo
Desenvolver um dashboard único e modular que se adapta dinamicamente ao tipo de usuário (PTD, Gestor, Admin) baseado no `id_role`, utilizando a arquitetura MVC com Node.js, Express, EJS e CSS puro.

### Arquitetura
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: EJS + CSS Puro (sem Tailwind)
- **Padrão**: MVC (Model-View-Controller)
- **Autenticação**: JWT + Cookies
- **Responsividade**: CSS Grid + Flexbox

---

## 🎯 ANÁLISE DE REQUISITOS POR PERFIL

### 👨‍🌾 PTD (id_role = 3)
**Funcionalidades:**
1. **TF** - Trilhas sendo feitas (com progresso e redirecionamento)
2. **TA** - Trilhas atribuídas pelo Gestor (hierarchy_trail)
3. **CF** - Cards favoritados (card_user - download + desfavoritar)
4. **FD** - Feed (botão para /feed)
5. **AT** - Atendimento (botão para /atendimento)
6. **RK** - Ranking PTDs (top 5 + posição atual)

### 👔 GESTOR (id_role = 2)
**Funcionalidades:**
1. **PE** - PTDs na equipe (hierarchy + modal adicionar)
2. **RKE** - Ranking da equipe específica
3. **ATTR** - Atribuir trilha (modal com selectboxes)
4. **PT** - Progresso das trilhas da equipe
5. **CPTD** - Criar PTD (modal de registro)

### 🛡️ ADMIN (id_role = 1)
**Funcionalidades:**
1. **ET/EM/EA/EP** - Botões para edição (redirecionamentos)
2. **CRGA** - Criar Gestor/Admin (modal com selectbox role)
3. **PPT** - PTD por trilha (analytics)
4. **MCT** - Média de completude das trilhas
5. **C+F/C-F** - Cards mais/menos favoritados

---

## 📊 ESTRUTURA DE DADOS E RELACIONAMENTOS

### Tabelas Principais Envolvidas
```sql
-- Usuários e Roles
user (id, name, email, score)
role (id, role_name) 
role_user (id_user, id_role)

-- Hierarquia (Gestor -> PTD)
hierarchy (id_role_user1, id_role_user2) -- Gestor -> PTD
hierarchy_trail (id_hierarchy, id_trail) -- Trilhas atribuídas

-- Progresso e Completude
trail_user (id_user, id_trail, percentage)
module_user (id_user, id_module, percentage)
class_user (id_user, id_class, complete)

-- Cards e Favoritos
card (id, title, description, fav)
card_user (id_user, id_card) -- Favoritos
```

### Cálculos de Progresso
- **Trilha**: Baseado na completude das aulas (class_user.complete)
- **Módulo**: Baseado na média das aulas concluídas
- **Ranking**: Ordenação por user.score

---

## 🏗️ ARQUITETURA DE COMPONENTES

### 1. MODELS (Data Access Layer)
```
src/models/
├── dashboardModel.js       # Dados gerais do dashboard
├── trailProgressModel.js   # Cálculos de progresso
├── hierarchyModel.js       # Gestão de equipes
├── rankingModel.js         # Rankings e estatísticas
└── analyticsModel.js       # Analytics para admin
```

### 2. CONTROLLERS (Business Logic)
```
src/controllers/
├── dashboardController.js  # Controller principal
├── progressController.js   # Progresso de trilhas/módulos
├── teamController.js       # Gestão de equipes (Gestor)
├── adminController.js      # Funcionalidades admin
└── modalController.js      # Ações dos modais
```

### 3. VIEWS (Presentation Layer)
```
src/views/
├── pages/
│   └── dashboard.ejs       # Dashboard modular único
├── components/
│   ├── ptd-dashboard.ejs   # Componentes específicos PTD
│   ├── gestor-dashboard.ejs # Componentes específicos Gestor
│   ├── admin-dashboard.ejs # Componentes específicos Admin
│   └── modals/
│       ├── add-ptd-modal.ejs
│       ├── assign-trail-modal.ejs
│       ├── create-ptd-modal.ejs
│       └── create-admin-modal.ejs
```

### 4. ESTILOS CSS
```
public/css/
├── pages/
│   └── dashboard.css       # Estilos principais do dashboard
├── components/
│   ├── ptd-components.css  # Estilos específicos PTD
│   ├── gestor-components.css # Estilos específicos Gestor
│   ├── admin-components.css # Estilos específicos Admin
│   └── modals.css          # Estilos dos modais
```

---

## 🎨 SISTEMA DE CORES E DESIGN

### Paleta de Cores
```css
:root {
  --primary-color: #10384F;    /* Cor principal */
  --accent-green: #89D329;     /* Detalhes/sucesso */
  --accent-blue: #00BCFF;      /* Detalhes/info */
  --white: #FFFFFF;            /* Básica */
  --gray: #999999;             /* Básica */
  --black: #000000;            /* Básica */
}
```

### Princípios de Design
1. **Responsivo**: Grid adaptável para mobile/desktop
2. **Modular**: Componentes reutilizáveis
3. **Acessível**: Contraste adequado e semântica
4. **Consistente**: Padrão visual unificado

---

## 🔄 FLUXO DE AUTENTICAÇÃO E AUTORIZAÇÃO

### Middleware de Verificação
```javascript
// Verificação de role e redirecionamento
checkRole(req, res, next) {
  const userRole = req.user.role_id;
  
  // Buscar dados específicos baseado no role
  switch(userRole) {
    case 1: // Admin
      req.dashboardData = await getAdminData(req.user.id);
      break;
    case 2: // Gestor  
      req.dashboardData = await getGestorData(req.user.id);
      break;
    case 3: // PTD
      req.dashboardData = await getPTDData(req.user.id);
      break;
  }
  
  next();
}
```

---

## 📱 ESTRATÉGIA DE RESPONSIVIDADE

### Breakpoints
```css
/* Mobile First */
.dashboard-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr; /* Mobile */
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet */
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop */
  }
}
```

### Componentes Adaptativos
- **Cards**: Flexíveis com min/max width
- **Modais**: Centralizados e responsivos
- **Tabelas**: Scroll horizontal em mobile
- **Progress bars**: Escaláveis

---

## 🔧 FUNCIONALIDADES ESPECÍFICAS

### 1. Sistema de Progresso
```javascript
// Cálculo dinâmico de progresso
const calculateTrailProgress = async (userId, trailId) => {
  const totalClasses = await getTotalClasses(trailId);
  const completedClasses = await getCompletedClasses(userId, trailId);
  return Math.round((completedClasses / totalClasses) * 100);
};
```

### 2. Gestão de Equipes (Gestor)
```javascript
// Buscar PTDs da equipe
const getTeamMembers = async (gestorId) => {
  return await db.query(`
    SELECT u.* FROM "user" u
    JOIN role_user ru1 ON u.id = ru1.id_user
    JOIN hierarchy h ON ru1.id = h.id_role_user2
    JOIN role_user ru2 ON h.id_role_user1 = ru2.id
    WHERE ru2.id_user = $1 AND ru1.id_role = 3
  `, [gestorId]);
};
```

### 3. Analytics (Admin)
```javascript
// Estatísticas avançadas
const getTrailAnalytics = async () => {
  return {
    ptdPerTrail: await getPTDCountPerTrail(),
    avgCompletion: await getAverageCompletion(),
    topCards: await getMostFavoritedCards(5),
    leastCards: await getLeastFavoritedCards(5)
  };
};
```

---

## 🚀 ESTRATÉGIA DE IMPLEMENTAÇÃO

### Fase 1: Models
1. **dashboardModel.js** - Dados base do dashboard
2. **trailProgressModel.js** - Cálculos de progresso
3. **hierarchyModel.js** - Relacionamentos de equipe
4. **rankingModel.js** - Sistema de ranking
5. **analyticsModel.js** - Estatísticas para admin

### Fase 2: Controllers & Middlewares
1. **dashboardController.js** - Lógica principal
2. **authMiddleware.js** - Verificação de roles
3. **progressController.js** - Gestão de progresso
4. **teamController.js** - Funcionalidades de equipe
5. **adminController.js** - Ferramentas administrativas

### Fase 3: Routes & Views
1. **dashboardRoutes.js** - Rotas principais
2. **dashboard.ejs** - View principal modular
3. **Componentes específicos** - PTD, Gestor, Admin
4. **dashboard.css** - Estilos completos
5. **JavaScript** - Interações e modais

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ Preparação
- [ ] Análise completa do banco de dados
- [ ] Definição de interfaces de dados
- [ ] Estrutura de arquivos organizada

### 🔧 Development
- [ ] Models com todas as consultas
- [ ] Controllers com lógica de negócio
- [ ] Middlewares de autenticação/autorização
- [ ] Views modulares e responsivas
- [ ] CSS seguindo paleta de cores
- [ ] JavaScript para interações

### 🧪 Testing
- [ ] Testes de cada perfil de usuário
- [ ] Verificação de responsividade
- [ ] Validação de segurança (roles)
- [ ] Performance das consultas

### 🚀 Deploy
- [ ] Otimização de assets
- [ ] Configuração de cache
- [ ] Monitoramento de erros

---

## 🎯 PRÓXIMOS PASSOS

1. **Resposta 2**: Desenvolvimento completo dos Models
2. **Resposta 3**: Controllers e Middlewares
3. **Resposta 4**: Routes e Views (dashboard.ejs + CSS)

### Considerações Importantes
- **Segurança**: Validação rigorosa de roles em cada ação
- **Performance**: Consultas otimizadas e cache estratégico
- **UX**: Interface intuitiva e feedback visual claro
- **Manutenibilidade**: Código modular e bem documentado

---

*Este planejamento serve como roadmap completo para a implementação do dashboard modular, garantindo que cada funcionalidade seja desenvolvida de forma consistente e escalável.*