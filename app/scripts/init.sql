-- init.sql

-- Criar extensão para suportar UUIDs, se ainda não estiver ativada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabelas 
CREATE TABLE users (
id SERIAL PRIMARY KEY,
first_name TEXT NOT NULL,
last_name TEXT NOT NULL,
email TEXT NOT NULL,
username TEXT NOT NULL,
password TEXT NOT NULL, 
avatar TEXT NOT NULL,
birth_date TEXT NOT NULL
);


CREATE TABLE ranking (
id SERIAL PRIMARY KEY,
id_user INT REFERENCES users(id) ON DELETE CASCADE
position INT,
score INT
);


CREATE TABLE meritis (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
description TEXT NOT NULL
);


CREATE TABLE users-meritis (
id SERIAL PRIMARY KEY,
id_user INT REFERENCES users(id) ON DELETE CASCADE,
id_meriti INT REFERENCES meritis(id) ON DELETE CASCADE,
);


CREATE TABLE certificates
id SERIAL PRIMARY KEY,
description TEXT NOT NULL,
date DATE DEFAULT CURRENT_DATE,
id_user REFERENCES users(id) ON DELETE CASCADE


CREATE TABLE trail
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
description TEXT NOT NULL,
id_certificate INT REFERENCES certificates(id) ON DELETE CASCADE


CREATE TABLE modules
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
description TEXT NOT NULL,
id_trail REFERENCES trail(id) ON DELETE CASCADE


CREATE TABLE course
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
description TEXT NOT NULL,
id_module REFERENCES modules(id) ON DELETE CASCADE


CREATE TABLE questions
id SERIAL PRIMARY KEY,
question TEXT NOT NULL,
id_course REFERENCES courses(id) ON DELETE CASCADE


CREATE TABLE answers
id SERIAL PRIMARY KEY,
answer TEXT NOT NULL,
correct BOOLEAN, 
score INT,
id_question REFERENCES questions(id) ON DELETE CASCADE
