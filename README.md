# Inteli - Instituto de Tecnologia e Liderança

<p align="center">
<a href= "https://www.inteli.edu.br/"><img src="./documentos/assets/inteli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0"></a>
</p>

# AprendizAgro🌿

## Grupo Croppers

## :student: Integrantes:

- <a href="https://www.linkedin.com/in/leonardo-corbi/">Leonardo Corbi</a>
- <a href="https://www.linkedin.com/in/lucas-pomin">Lucas Pomin</a>
- <a href="https://www.linkedin.com/in/mariana-pereira-394280346/">Mariana Pereira</a>
- <a href="https://www.linkedin.com/in/nicolli-venino-santana-b84341254/">Nicolli Santana</a>
- <a href="https://www.linkedin.com/in/rafael-santana-rodrigues/">Rafael Santana Rodrigues</a>
- <a href="https://www.linkedin.com/in/peresvivian/">Vivian Peres</a>
- <a href="https://www.linkedin.com/in/yuriboczar/">Yuri Boczar</a>

## :teacher: Professores:

### Orientador(a)

- <a href="https://www.linkedin.com/in/marcelo-gon%C3%A7alves-phd-a550652/">Marcelo Luiz do Amaral Gonçalves</a>

### Instrutores

- ⁠<a href="https://www.linkedin.com/in/cristiano-benites-ph-d-687647a8/">Cristiano da Silva Benitez</a>
- <a href="https://www.linkedin.com/in/francisco-escobar/">Francisco de Souza Escobar</a>
- ⁠<a href="https://www.linkedin.com/in/filipe-gon%C3%A7alves-08a55015b/">Filipe Gonçalves de Souza Nogueira da Silva</a>
- <a href="https://www.linkedin.com/in/geraldo-magela-severino-vasconcelos-22b1b220/">Geraldo Magela Severino Vasconcelos</a>
- ⁠<a href="https://www.linkedin.com/in/pedroteberga/">Pedro Marins Freire Teberga</a>

## 📝 Descrição

O AprendizAgro é uma plataforma de aprendizado e busca rápida de conteúdo, que tem como objetivo principal auxiliar os PTD’s em sua jornada no campo com o cliente final. Ou seja, capacitá-los e apoiá-los com informações relevantes para o seu trabalho diário no campo. Para isso, desenvolvemos nossa aplicação com algumas ferramentas essenciais para a efetivação dessas funcionalidades.

Primeiro, temos as trilhas, módulos e aulas, que estão diretamente interligados. As trilhas trazem um conteúdo mais geral, abordando o contexto dos módulos, enquanto dentro de cada módulo estão as aulas, focadas em assuntos específicos. Todo esse conjunto se conecta de forma integrada para facilitar e potencializar o aprendizado dos conteúdos disponíveis.

Também contamos com os cards, que são responsáveis pela pesquisa rápida dentro da plataforma. Neles, o usuário encontra informações objetivas e de fácil acesso, que podem ser consultadas tanto durante o atendimento no campo quanto em momentos de estudo, por conterem respostas rápidas para dúvidas pontuais.

Além disso, temos um feed, onde é possível registrar os atendimentos em campo e compartilhar com outros PTD’s as suas experiências. Essa é uma ótima oportunidade para apoiar colegas de trabalho, por meio de postagens que relatam as atividades realizadas, as soluções aplicadas e os aprendizados adquiridos durante os atendimentos.

## 📝 Link de demonstração

[![Assista ao vídeo](https://img.youtube.com/vi/tSUMxPiNFGE/0.jpg)](https://www.youtube.com/watch?v=tSUMxPiNFGE)
[Assista ao vídeo no YouTube](https://www.youtube.com/watch?v=tSUMxPiNFGE)




## 📁 Estrutura de pastas

Dentre os arquivos e pastas presentes na raiz do projeto, definem-se:

- <b>documentos</b>: aqui está o documento do projeto, como o Web Application Document (WAD) bem como as imagens complementares, na pasta assets.

- <b>app</b>: aqui está a pasta principal da aplicação, onde estão centralizadas as configurações do banco de dados, os modelos, os controllers, as rotas e o arquivo responsável por iniciar a aplicação.

- <b>README.md</b>: arquivo que serve como guia introdutório e explicação geral sobre o projeto e a aplicação (o mesmo arquivo que você está lendo agora).}


```plaintext
aprendizAgro/
│
├── app/                     # Núcleo da aplicação: backend, frontend, configurações e scripts
│   │
│   ├── config/              # Configurações globais da aplicação
│   │   ├── db.js            # Configuração da conexão com o banco de dados
│   │   └── jwtConfig.js     # Configuração do JWT para autenticação
│   │
│   ├── controllers/         # Controladores que tratam as requisições e implementam regras de negócio
│   │   ├── answerController.js
│   │   ├── authController.js
│   │   ├── cardController.js
│   │   ├── cardUserController.js
│   │   ├── certificateController.js
│   │   ├── classController.js
│   │   ├── classUserController.js
│   │   ├── comentClassController.js
│   │   ├── comentController.js
│   │   ├── comentPostController.js
│   │   ├── hierarchyController.js
│   │   ├── hierarchyTrailController.js
│   │   ├── likeController.js
│   │   ├── meritController.js
│   │   ├── meritUserController.js
│   │   ├── moduleController.js
│   │   ├── moduleUserController.js
│   │   ├── postController.js
│   │   ├── questionController.js
│   │   ├── rankingController.js
│   │   ├── roleController.js
│   │   ├── roleUserController.js
│   │   ├── testController.js
│   │   ├── testUserController.js
│   │   ├── trailController.js
│   │   ├── trailUserController.js
│   │   ├── userController.js
│   │   └── userLikeController.js
│   │
│   ├── middleware/          # Middlewares para tratamento de requisições
│   │   └── authMiddleware.js
│   │
│   ├── migrations/          # Scripts de criação, alteração e manipulação de tabelas no banco
│   │   ├── development/
│   │   ├── production/
│   │   ├── drop_all.js
│   │   ├── insert_all.js
│   │   └── migrate_all.js
│   │
│   ├── models/              # Definição dos modelos de dados (ORM)
│   │   ├── answerModel.js
│   │   ├── cardModel.js
│   │   ├── cardUserModel.js
│   │   ├── certificateModel.js
│   │   ├── classModel.js
│   │   ├── classUserModel.js
│   │   ├── comentClassModel.js
│   │   ├── comentModel.js
│   │   ├── comentPostModel.js
│   │   ├── hierarchyTrailModel.js
│   │   ├── likeModel.js
│   │   ├── meritModel.js
│   │   ├── meritUserModel.js
│   │   ├── moduleModel.js
│   │   ├── moduleUserModel.js
│   │   ├── postModel.js
│   │   ├── questionModel.js
│   │   ├── rankingModel.js
│   │   ├── roleUserModel.js
│   │   ├── testModel.js
│   │   ├── testUserModel.js
│   │   ├── trailModel.js
│   │   ├── trailUserModel.js
│   │   ├── userLikeModel.js
│   │   └── userModel.js
│   │
│   ├── public/              # Arquivos públicos (frontend estático)
│   │   ├── assets/
│   │   │   └── favicon.ico
│   │   ├── css/
│   │   │   ├── global.css
│   │   │   ├── components/
│   │   │   │   ├── footer.css
│   │   │   │   └── header.css
│   │   │   └── pages/
│   │   │       ├── auth.css
│   │   │       ├── class.css
│   │   │       ├── dashboard.css
│   │   │       ├── home.css
│   │   │       └── trail.css
│   │   └── scripts/
│   │       ├── class.js
│   │       ├── dashboard.js
│   │       ├── footer.js
│   │       ├── home.js
│   │       ├── login.js
│   │       ├── main.js
│   │       ├── register.js
│   │       └── trail.js
│   │
│   ├── routes/              # Definição das rotas/endpoints da API
│   │   ├── answerRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cardRoutes.js
│   │   ├── certificateRoutes.js
│   │   ├── classRoutes.js
│   │   ├── comentRoutes.js
│   │   ├── frontRoutes.js
│   │   ├── indexRoutes.js
│   │   ├── likeRoutes.js
│   │   ├── meritRoutes.js
│   │   ├── moduleRoutes.js
│   │   ├── postRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── rankingRoutes.js
│   │   ├── testRoutes.js
│   │   ├── trailRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── scripts/             # Scripts utilitários (ex: rodar comandos SQL)
│   │   ├── init.sql
│   │   └── runSQLScript.js
│   │
│   ├── tests/               # Testes unitários (Jest)
│   │   ├── answer.test.js
│   │   ├── card.test.js
│   │   ├── cardUser.test.js
│   │   ├── certificate.test.js
│   │   ├── class.test.js
│   │   ├── classUser.test.js
│   │   ├── coment.test.js
│   │   ├── comentClass.test.js
│   │   ├── comentPost.test.js
│   │   ├── hierarchyTrail.test.js
│   │   ├── likeController.test.js
│   │   ├── merit.test.js
│   │   ├── meritUser.test.js
│   │   ├── module.test.js
│   │   ├── moduleUser.test.js
│   │   ├── postController.test.js
│   │   ├── question.test.js
│   │   ├── ranking.test.js
│   │   ├── roleUser.test.js
│   │   ├── test.test.js
│   │   ├── testUser.test.js
│   │   ├── trail.test.js
│   │   ├── trailUser.test.js
│   │   ├── userController.test.js
│   │   └── userLike.test.js
│   │
│   ├── views/               # Templates EJS para as páginas renderizadas no servidor
│   │   ├── layout/
│   │   │   └── main.ejs
│   │   ├── components/
│   │   │   ├── footer.ejs
│   │   │   └── header.ejs
│   │   ├── pages/
│   │   │   ├── class.ejs
│   │   │   ├── dashboard.ejs
│   │   │   ├── home.ejs
│   │   │   ├── login.ejs
│   │   │   ├── register.ejs
│   │   │   └── trail.ejs
│   │   └── scripts/
│   │       └── auth.js
│   │
│   ├── .env                 # Variáveis de ambiente (ex: PORT, DATABASE_URL)
│   ├── .gitignore           # Arquivos e pastas que devem ser ignorados pelo Git
│   ├── jest.config.js       # Configuração do Jest para os testes
│   ├── package.json         # Lista de dependências, scripts e informações do projeto Node.js
│   ├── package-lock.json    # Controle de versões exatas das dependências
│   └── server.js            # Arquivo principal que inicializa o servidor Express
│
├── documentos/              # Documentação geral do projeto
│   ├── assets/              # Imagens utilizadas na documentação
│   │   └── ... (várias imagens relacionadas ao projeto)
│   └── wad.md               # Documento de Arquitetura e Design Web Application Description
│
├── README.md                # Explicação geral do projeto: descrição, como rodar, estrutura, etc

```
## 💻 Configuração para desenvolvimento e execução do código
Aqui estão todas as instruções necessárias para configurar o ambiente de desenvolvimento, instalar as dependências e executar a aplicação localmente.

#### ✅ Pré-requisitos

Antes de iniciar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

- [Node.js](https://nodejs.org/pt-br/) (versão recomendada: **16.15.1 LTS** ou superior)
- [NPM](https://www.npmjs.com/) (gerenciador de pacotes que já vem junto com o Node.js)
- Um banco de dados **PostgreSQL** instalado e configurado (é necessário criar um banco e atualizar o arquivo `.env` com suas credenciais)
- (Opcional) Um cliente para PostgreSQL, como **pgAdmin**, **DBeaver**, ou **TablePlus**, para visualizar as tabelas e os dados

#### ✅ Clonando o repositório

Abra o terminal (ou prompt de comando) e execute os seguintes comandos:

```bash
git clone https://github.com/Inteli-College/2025-1B-T15-IN02-G04.git
```

Depois, entre na pasta do projeto:

```bash
cd 2025-1B-T15-IN02-G04
```

#### ✅ Instalando as dependências

Agora navegue até a pasta `/app` dentro do projeto e instale as dependências:

```bash
cd app
npm install
```

Este comando vai instalar todas as bibliotecas necessárias que estão listadas no arquivo `package.json`.

#### ✅ Configuração das Variáveis de Ambiente (.env)

Antes de rodar o projeto, é necessário configurar as variáveis de ambiente.

Na raiz da pasta `/app`, crie um arquivo `.env` (se já não existir), com o seguinte conteúdo básico (exemplo):

```dotenv
PORT=3000
DATABASE_URL=postgres://seu_usuario:sua_senha@localhost:5432/nome_do_banco
JWT_SECRET=sua_chave_secreta
```

⚠️ **Altere os valores conforme a configuração do seu PostgreSQL.**

#### ✅ Rodando o servidor

Para iniciar o projeto em ambiente de desenvolvimento, use o comando:

```bash
npm run dev
```
Se tudo estiver correto, você verá no terminal algo como:

```
Conectado ao banco de dados PostgreSQL
Servidor rodando na porta 3000
```

#### ✅ Acessando a aplicação no navegador

Abra o navegador e acesse:

```
http://localhost:3000/
```

Pronto! A aplicação estará rodando localmente.

#### ✅ Rodando os testes (Opcional)

Se desejar executar os testes unitários com o Jest:

```bash
npm test
```

#### ✅ Dicas úteis

- Se fizer alterações no código, o Nodemon já está configurado para reiniciar o servidor automaticamente.
- Se houver problemas com o banco, verifique se o PostgreSQL está rodando e se os dados no `.env` estão corretos.
- Caso necessário, use os scripts de migração que estão na pasta `/app/migrations` para criar ou popular as tabelas do banco.

5. Agora você pode acessar a aplicação através do link http://localhost:3000/
6. O servidor está online.

## 🗃 Histórico de lançamentos

- ## 0.5.0 - 26/06/2025
- ## 0.4.0 - 13/06/2025
- ## 0.3.0 - 30/05/2025
- ## 0.2.0 - 16/05/2025
- ## 0.1.0 - 30/04/2025

## 📋 Licença/License

<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"><p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/Intelihub/Template_M2/">AprendizAGRP</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://www.yggbrasil.com.br/vr">Inteli, Leonardo Corbi, Lucas Pomin, Mariana Pereira, Nicolli Santana, Rafael Santana Rodrigues, Vivian Peres, Yuri Boczar</a> is licensed under <a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Attribution 4.0 International</a>.</p>
