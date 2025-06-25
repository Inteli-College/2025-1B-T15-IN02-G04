-- Inicia uma transação para garantir que todas as inserções sejam atômicas
BEGIN;

-- TRILHAS (TRAIL)
INSERT INTO trail (name, description) VALUES
('FieldView - 1ª Temporada: Conexão FieldView', 'Trilha introdutória ao FieldView, explorando a Agricultura Digital da Bayer e suas soluções para otimização da lavoura.'),
('Bayer Directo Nematoide', 'Programa que oferece um manejo otimizado de nematoides em lavouras de soja, com foco na aplicação localizada de Verango® Prime e análise de resultados.');

-- MÓDULOS (MODULE)
-- Módulos para a trilha 'FieldView - 1ª Temporada: Conexão FieldView'
INSERT INTO module (id_trail, name, description) VALUES
((SELECT id FROM trail WHERE name = 'FieldView - 1ª Temporada: Conexão FieldView'), 'Episódio 1: A Agricultura Digital', 'Visão geral da evolução da agricultura e o papel da Agricultura Digital na produção mais eficiente.'),
((SELECT id FROM trail WHERE name = 'FieldView - 1ª Temporada: Conexão FieldView'), 'Episódio 2: A Climate Corporation e o FieldView', 'Apresenta a Climate Corporation, divisão de Agricultura Digital da Bayer, e a proposta de inovação do FieldView.'),
((SELECT id FROM trail WHERE name = 'FieldView - 1ª Temporada: Conexão FieldView'), 'Acesso e Planos FieldView', 'Detalhes sobre como adquirir licenças do FieldView através do site, Orbia e Impulso Bayer.');

-- Módulos para a trilha 'Bayer Directo Nematoide'
INSERT INTO module (id_trail, name, description) VALUES
((SELECT id FROM trail WHERE name = 'Bayer Directo Nematoide'), 'Conceitos Gerais e Tecnologia de Aplicação', 'Aborda conceitos gerais, modo de aplicação, volume de calda, pontas de pulverização e calibração de pulverizadores.'),
((SELECT id FROM trail WHERE name = 'Bayer Directo Nematoide'), 'Programa Bayer Directo Nematoide', 'Detalhes sobre o programa, proposta de valor, critérios de participação, compartilhamento de risco e suporte.'),
((SELECT id FROM trail WHERE name = 'Bayer Directo Nematoide'), 'Inserção de Prescrições em Monitores', 'Orientações detalhadas sobre como inserir mapas de prescrição em diferentes monitores agrícolas (AGCO, CNH, JACTO, John Deere, Raven, Stara).');

-- CLASSES (CLASS)
-- Classes para 'Episódio 1: A Agricultura Digital'
INSERT INTO class (id_module, name, description, url_video, url_complementary_material) VALUES
((SELECT id FROM module WHERE name = 'Episódio 1: A Agricultura Digital'), 'Introdução à Agricultura Moderna', 'Contextualiza a transformação da agricultura ao longo da história.', 'https://example.com/video_agri_moderna', NULL),
((SELECT id FROM module WHERE name = 'Episódio 1: A Agricultura Digital'), 'A Revolução Digital no Campo', 'Explora a importância da Agricultura Digital para balancear produtividade e custos.', 'https://example.com/video_revolucao_digital', NULL);

-- Classes para 'Episódio 2: A Climate Corporation e o FieldView'
INSERT INTO class (id_module, name, description, url_video, url_complementary_material) VALUES
((SELECT id FROM module WHERE name = 'Episódio 2: A Climate Corporation e o FieldView'), 'O Surgimento da Climate', 'História e propósito da Climate, divisão de Agricultura Digital da Bayer.', 'https://example.com/video_climate_origem', NULL),
((SELECT id FROM module WHERE name = 'Episódio 2: A Climate Corporation e o FieldView'), 'FieldView: Soluções e Serviços', 'Funcionalidades e benefícios do FieldView baseados em ciência de dados.', 'https://example.com/video_fieldview_solucoes', NULL);

-- Classes para 'Acesso e Planos FieldView'
INSERT INTO class (id_module, name, description, url_video, url_complementary_material) VALUES
((SELECT id FROM module WHERE name = 'Acesso e Planos FieldView'), 'Adquirindo sua Licença FieldView', 'Como adquirir a licença FieldView via site oficial.', 'https://example.com/video_licenca_fieldview', 'https://www.climatefieldview.com.br'),
((SELECT id FROM module WHERE name = 'Acesso e Planos FieldView'), 'FieldView via Orbia', 'Processo de aquisição do FieldView através da plataforma Orbia e resgate de pontos.', 'https://example.com/video_orbia', 'https://www.orbia.ag/'),
((SELECT id FROM module WHERE name = 'Acesso e Planos FieldView'), 'FieldView via Impulso Bayer', 'Aquisição de licenças FieldView pelo programa Impulso Bayer e classificação por estrelas.', 'https://example.com/video_impulso_bayer', 'https://www.impulsobayer.com.br');

-- Classes para 'Conceitos Gerais e Tecnologia de Aplicação'
INSERT INTO class (id_module, name, description, url_video, url_complementary_material) VALUES
((SELECT id FROM module WHERE name = 'Conceitos Gerais e Tecnologia de Aplicação'), 'Conceitos Fundamentais da Aplicação', 'Conceitos gerais de aplicação, modo de aplicação e volume de calda.', 'https://example.com/video_conceitos_aplicacao', NULL),
((SELECT id FROM module WHERE name = 'Conceitos Gerais e Tecnologia de Aplicação'), 'Pontas de Pulverização e Calibração', 'Detalhes sobre tipos de pontas, tamanhos de gotas, pressão de trabalho e calibração do pulverizador.', 'https://example.com/video_pontas_calibracao', NULL),
((SELECT id FROM module WHERE name = 'Conceitos Gerais e Tecnologia de Aplicação'), 'Condições Ambientais na Aplicação', 'Importância das condições ambientais e qualidade da aplicação.', 'https://example.com/video_condicoes_ambientais', NULL);

-- Classes para 'Programa Bayer Directo Nematoide'
INSERT INTO class (id_module, name, description, url_video, url_complementary_material) VALUES
((SELECT id FROM module WHERE name = 'Programa Bayer Directo Nematoide'), 'Visão Geral do Bayer Directo', 'Conceito e proposta de valor do programa Bayer Directo Nematoide.', 'https://example.com/video_bayer_directo_visao', 'https://go.bayer.com/bayerdirecto'),
((SELECT id FROM module WHERE name = 'Programa Bayer Directo Nematoide'), 'Jornada de Participação e Benefícios', 'Explica a jornada do produtor no programa, incluindo inscrição, prescrição, mapeamento e reembolso.', 'https://example.com/video_jornada_participacao', NULL),
((SELECT id FROM module WHERE name = 'Programa Bayer Directo Nematoide'), 'Suporte e Contato Bayer Directo', 'Informações de contato para suporte ao programa Bayer Directo Nematoide.', 'https://example.com/video_suporte_directo', NULL);

-- Classes para 'Inserção de Prescrições em Monitores'
INSERT INTO class (id_module, name, description, url_video, url_complementary_material) VALUES
((SELECT id FROM module WHERE name = 'Inserção de Prescrições em Monitores'), 'Prescrição em Monitores AGCO', 'Orientações para inserir prescrições em monitores AGCO (C3000 Topcon) e modelos de máquinas (MF500R, MF9130, MF8225, BS3330).', 'https://example.com/video_prescricao_agco', 'Bayer_Directo_INFO_Prescricao_AGCO 1.PDF'),
((SELECT id FROM module WHERE name = 'Inserção de Prescrições em Monitores'), 'Prescrição em Monitores CNH (CASE/New Holland)', 'Orientações para inserir prescrições em monitores CNH (AFS Pro 700, Intelliview Plus IV) e modelos de máquinas (Patriot 250, 350, Defensor 2500, 3500HC).', 'https://example.com/video_prescricao_cnh', 'Bayer_Directo_INFO_Prescricao_CNH 1.PDF'),
((SELECT id FROM module WHERE name = 'Inserção de Prescrições em Monitores'), 'Prescrição em Monitores JACTO', 'Orientações para inserir prescrições em monitores JACTO (OMNI 700, OTMIS) e modelos de máquinas (Uniport 2030, 2530, 3030, 4530).', 'https://example.com/video_prescricao_jacto', 'Bayer_Directo_INFO_Prescricao_JACTO 1.PDF'),
((SELECT id FROM module WHERE name = 'Inserção de Prescrições em Monitores'), 'Prescrição em Monitores JOHN DEERE', 'Orientações para inserir prescrições em monitores JOHN DEERE (GS3, GS4) e modelos de máquinas (4730, M4025, M4030, M4040).', 'https://example.com/video_prescricao_johndeere', 'Bayer_Directo_INFO_Prescricao_JOHN_DEERE 1.PDF'),
((SELECT id FROM module WHERE name = 'Inserção de Prescrições em Monitores'), 'Prescrição em Monitores RAVEN', 'Orientações para inserir prescrições em monitores RAVEN (Viper 4, CR7, CR12).', 'https://example.com/video_prescricao_raven', 'Bayer_Directo_INFO_Prescricao_RAVEN 1.PDF'),
((SELECT id FROM module WHERE name = 'Inserção de Prescrições em Monitores'), 'Prescrição em Monitores STARA', 'Orientações para inserir prescrições em monitores STARA (Topper 5500) e modelos de máquinas (Imperador 2000, 3000, 4000, 3.0).', 'https://example.com/video_prescricao_stara', 'Bayer_Directo_INFO_Prescricao_STARA 1.PDF');

-- TESTES (TEST)
-- Teste para a trilha 'FieldView - 1ª Temporada: Conexão FieldView'
INSERT INTO test (id_trail, title, description, max_score) VALUES
((SELECT id FROM trail WHERE name = 'FieldView - 1ª Temporada: Conexão FieldView'), 'Avaliação FieldView - 1ª Temporada', 'Teste de conhecimento sobre os conceitos e funcionalidades do FieldView abordados na primeira temporada.', 100);

-- Teste para a trilha 'Bayer Directo Nematoide'
INSERT INTO test (id_trail, title, description, max_score) VALUES
((SELECT id FROM trail WHERE name = 'Bayer Directo Nematoide'), 'Avaliação Bayer Directo Nematoide', 'Teste de conhecimento sobre o programa Bayer Directo Nematoide e inserção de prescrições.', 100);

-- PERGUNTAS (QUESTION) e RESPOSTAS (ANSWER)
-- Perguntas para 'Avaliação FieldView - 1ª Temporada'
INSERT INTO question (id_test, question_text, score) VALUES
((SELECT id FROM test WHERE title = 'Avaliação FieldView - 1ª Temporada'), 'Qual o principal objetivo da Agricultura Digital, conforme o Episódio 1?', 25);
INSERT INTO answer (id_question, answer_text, is_correct) VALUES
((SELECT id FROM question WHERE question_text = 'Qual o principal objetivo da Agricultura Digital, conforme o Episódio 1?'), 'Produzir mais gastando menos no mesmo espaço de terra.', TRUE),
((SELECT id FROM question WHERE question_text = 'Qual o principal objetivo da Agricultura Digital, conforme o Episódio 1?'), 'Aumentar o uso de defensivos agrícolas.', FALSE),
((SELECT id FROM question WHERE question_text = 'Qual o principal objetivo da Agricultura Digital, conforme o Episódio 1?'), 'Reduzir a área plantada para preservar a natureza.', FALSE),
((SELECT id FROM question WHERE question_text = 'Qual o principal objetivo da Agricultura Digital, conforme o Episódio 1?'), 'Depender exclusivamente de mão de obra manual.', FALSE);

INSERT INTO question (id_test, question_text, score) VALUES
((SELECT id FROM test WHERE title = 'Avaliação FieldView - 1ª Temporada'), 'Quais são as três principais formas de adquirir a licença FieldView mencionadas?', 25);
INSERT INTO answer (id_question, answer_text, is_correct) VALUES
((SELECT id FROM question WHERE question_text = 'Quais são as três principais formas de adquirir a licença FieldView mencionadas?'), 'Site do FieldView, Orbia e Impulso Bayer.', TRUE),
((SELECT id FROM question WHERE question_text = 'Quais são as três principais formas de adquirir a licença FieldView mencionadas?'), 'Distribuidores físicos, cooperativas e feiras agrícolas.', FALSE),
((SELECT id FROM question WHERE question_text = 'Quais são as três principais formas de adquirir a licença FieldView mencionadas?'), 'Aplicativo móvel, e-mail e telefone.', FALSE),
((SELECT id FROM question WHERE question_text = 'Quais são as três principais formas de adquirir a licença FieldView mencionadas?'), 'Bancos, financiadoras e agências governamentais.', FALSE);

INSERT INTO question (id_test, question_text, score) VALUES
((SELECT id FROM test WHERE title = 'Avaliação FieldView - 1ª Temporada'), 'Qual o significado de uma classificação de 5 estrelas no programa Impulso Bayer para acesso ao FieldView?', 25);
INSERT INTO answer (id_question, answer_text, is_correct) VALUES
((SELECT id FROM question WHERE question_text = 'Qual o significado de uma classificação de 5 estrelas no programa Impulso Bayer para acesso ao FieldView?'), 'Acesso gratuito ao PLANO PLUS com mapeamento ilimitado.', TRUE),
((SELECT id FROM question WHERE question_text = 'Qual o significado de uma classificação de 5 estrelas no programa Impulso Bayer para acesso ao FieldView?'), 'Acesso gratuito ao PLANO ENTRADA.', FALSE),
((SELECT id FROM question WHERE question_text = 'Qual o significado de uma classificação de 5 estrelas no programa Impulso Bayer para acesso ao FieldView?'), 'Desconto de 50% na compra do PLANO ENTRADA.', FALSE),
((SELECT id FROM question WHERE question_text = 'Qual o significado de uma classificação de 5 estrelas no programa Impulso Bayer para acesso ao FieldView?'), 'Nenhum benefício relacionado ao FieldView.', FALSE);

INSERT INTO question (id_test, question_text, score) VALUES
((SELECT id FROM test WHERE title = 'Avaliação FieldView - 1ª Temporada'), 'O que o FieldView busca comprovar em relação aos avanços tecnológicos na agricultura?', 25);
INSERT INTO answer (id_question, answer_text, is_correct) VALUES
((SELECT id FROM question WHERE question_text = 'O que o FieldView busca comprovar em relação aos avanços tecnológicos na agricultura?'), 'Que os avanços tecnológicos são essenciais para o sucesso do agricultor.', TRUE),
((SELECT id FROM question WHERE question_text = 'O que o FieldView busca comprovar em relação aos avanços tecnológicos na agricultura?'), 'Que a tecnologia substitui completamente o trabalho manual.', FALSE),
((SELECT id FROM question WHERE question_text = 'O que o FieldView busca comprovar em relação aos avanços tecnológicos na agricultura?'), 'Que a agricultura digital é apenas uma tendência passageira.', FALSE),
((SELECT id FROM question WHERE question_text = 'O que o FieldView busca comprovar em relação aos avanços tecnológicos na agricultura?'), 'Que o produtor não precisa de apoio científico.', FALSE);


-- Perguntas para 'Avaliação Bayer Directo Nematoide'
INSERT INTO question (id_test, question_text, score) VALUES
((SELECT id FROM test WHERE title = 'Avaliação Bayer Directo Nematoide'), 'Qual o principal produto Bayer utilizado para o manejo otimizado de nematoides no programa Directo?', 25);
INSERT INTO answer (id_question, answer_text, is_correct) VALUES
((SELECT id FROM question WHERE question_text = 'Qual o principal produto Bayer utilizado para o manejo otimizado de nematoides no programa Directo?'), 'Verango® Prime.', TRUE),
((SELECT id FROM question WHERE question_text = 'Qual o principal produto Bayer utilizado para o manejo otimizado de nematoides no programa Directo?'), 'Glifosato.', FALSE),
((SELECT id FROM question WHERE question_text = 'Qual o principal produto Bayer utilizado para o manejo otimizado de nematoides no programa Directo?'), 'Larvin.', FALSE),
((SELECT id FROM question WHERE question_text = 'Qual o principal produto Bayer utilizado para o manejo otimizado de nematoides no programa Directo?'), 'Roundup.', FALSE);

INSERT INTO question (id_test, question_text, score) VALUES
((SELECT id FROM test WHERE title = 'Avaliação Bayer Directo Nematoide'), 'Qual é um dos principais impactos econômicos dos nematoides para os produtores de soja no Brasil?', 25);
INSERT INTO answer (id_question, answer_text, is_correct) VALUES
((SELECT id FROM question WHERE question_text = 'Qual é um dos principais impactos econômicos dos nematoides para os produtores de soja no Brasil?'), 'Perda de produtividade.', TRUE),
((SELECT id FROM question WHERE question_text = 'Qual é um dos principais impactos econômicos dos nematoides para os produtores de soja no Brasil?'), 'Aumento da fertilidade do solo.', FALSE),
((SELECT id FROM question WHERE question_text = 'Qual é um dos principais impactos econômicos dos nematoides para os produtores de soja no Brasil?'), 'Melhora na qualidade da safra.', FALSE),
((SELECT id FROM question WHERE question_text = 'Qual é um dos principais impactos econômicos dos nematoides para os produtores de soja no Brasil?'), 'Redução nos custos de produção.', FALSE);

INSERT INTO question (id_test, question_text, score) VALUES
((SELECT id FROM test WHERE title = 'Avaliação Bayer Directo Nematoide'), 'Para qual monitor agrícola é indicado o formato de arquivo SHP, DBF, PRJ, SHX dentro da pasta "Rx"?', 25);
INSERT INTO answer (id_question, answer_text, is_correct) VALUES
((SELECT id FROM question WHERE question_text = 'Para qual monitor agrícola é indicado o formato de arquivo SHP, DBF, PRJ, SHX dentro da pasta "Rx"?'), 'John Deere.', TRUE),
((SELECT id FROM question WHERE question_text = 'Para qual monitor agrícola é indicado o formato de arquivo SHP, DBF, PRJ, SHX dentro da pasta "Rx"?'), 'AGCO.', FALSE),
((SELECT id FROM question WHERE question_text = 'Para qual monitor agrícola é indicado o formato de arquivo SHP, DBF, PRJ, SHX dentro da pasta "Rx"?'), 'JACTO.', FALSE),
((SELECT id FROM question WHERE question_text = 'Para qual monitor agrícola é indicado o formato de arquivo SHP, DBF, PRJ, SHX dentro da pasta "Rx"?'), 'STARA.', FALSE);

INSERT INTO question (id_test, question_text, score) VALUES
((SELECT id FROM test WHERE title = 'Avaliação Bayer Directo Nematoide'), 'Qual a velocidade máxima de aplicação recomendada para o programa Bayer Directo Nematoide?', 25);
INSERT INTO answer (id_question, answer_text, is_correct) VALUES
((SELECT id FROM question WHERE question_text = 'Qual a velocidade máxima de aplicação recomendada para o programa Bayer Directo Nematoide?'), 'Até 10 km/h.', TRUE),
((SELECT id FROM question WHERE question_text = 'Qual a velocidade máxima de aplicação recomendada para o programa Bayer Directo Nematoide?'), 'Até 5 km/h.', FALSE),
((SELECT id FROM question WHERE question_text = 'Qual a velocidade máxima de aplicação recomendada para o programa Bayer Directo Nematoide?'), 'Até 15 km/h.', FALSE),
((SELECT id FROM question WHERE question_text = 'Qual a velocidade máxima de aplicação recomendada para o programa Bayer Directo Nematoide?'), 'Sem limite de velocidade.', FALSE);


-- MÉRITOS (MERIT)
INSERT INTO merit (name, description, image_url) VALUES
('Conhecedor FieldView Básico', 'Concluiu a trilha introdutória sobre o FieldView.', 'https://example.com/merit_fieldview_basic.png'),
('Especialista Bayer Directo Nematoide', 'Concluiu a trilha sobre o programa Bayer Directo Nematoide.', 'https://example.com/merit_bayer_directo.png'),
('Dominando Prescrições', 'Demonstrou conhecimento sobre a inserção de prescrições em diferentes monitores.', 'https://example.com/merit_prescricoes.png');

-- CERTIFICADOS (CERTIFICATE)
-- CERTIFICADOS (CERTIFICATE) - ALTERADO
INSERT INTO certificate (id_trail, name, description) VALUES
((SELECT id FROM trail WHERE name = 'FieldView - 1ª Temporada: Conexão FieldView'), 'Certificado de Conclusão - FieldView 1ª Temporada', 'Certificado por ter concluído a trilha "FieldView - 1ª Temporada: Conexão FieldView".'),
((SELECT id FROM trail WHERE name = 'Bayer Directo Nematoide'), 'Certificado de Conclusão - Bayer Directo Nematoide', 'Certificado por ter concluído a trilha "Bayer Directo Nematoide".');


COMMIT;