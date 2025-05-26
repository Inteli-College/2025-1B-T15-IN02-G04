require('dotenv').config()
const express = require('express');
const app = express();
const db = require('./config/db');
const path = require('path');
const authMiddleware = require('./routes/authRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const trailRoutes = require('./routes/trailRoutes');
const userRoutes = require('./routes/userRoutes');
const frontendRoutes = require('./routes/frontRoutes');
const classRoutes = require('./routes/classRoutes');
const questionRoutes = require('./routes/questionRoutes');
const answerRoutes = require('./routes/answerRoutes');
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/api', authMiddleware)
app.use('/api', moduleRoutes);
app.use('/api', trailRoutes);
app.use('/users', userRoutes);
app.use('/', frontendRoutes);
app.use('/api', classRoutes);
app.use('/api', questionRoutes);
app.use('/api', answerRoutes);
// Middleware para lidar com erros de rota não encontrada
app.use((req, res, next) => {
   res.status(404).send('Página não encontrada');
   // Middleware para lidar com erros internos do servidor
app.use((err, req, res, next) => {
   console.error(err.stack);
      res.status(500).send('Erro no servidor');
    });
 app.listen(PORT, () => {
   console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
.catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });
  });


db.connect()
  .then(() => {
    console.log('Conectado ao banco de dados PostgreSQL');

    app.use(express.json());
        
    const testRoutes = require('./routes/testRoutes');
    app.use('/api', testRoutes);

  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });
  });
