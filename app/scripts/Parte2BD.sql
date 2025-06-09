CREATE TABLE "user"(
    "id" BIGINT NOT NULL,
    "first_name" CHAR(255) NOT NULL,
    "last_name" CHAR(255) NOT NULL,
    "email" CHAR(255) NOT NULL,
    "username" CHAR(255) NOT NULL,
    "password" CHAR(255) NOT NULL,
    "avatar" CHAR(255) NOT NULL,
    "birth_date" BIGINT NOT NULL
);
ALTER TABLE
    "user" ADD PRIMARY KEY("id");
CREATE TABLE "trail"(
    "id" BIGINT NOT NULL,
    "name" CHAR(255) NOT NULL,
    "description" CHAR(255) NOT NULL,
    "id_certificate" BIGINT NOT NULL
);
ALTER TABLE
    "trail" ADD PRIMARY KEY("id");
CREATE INDEX "trail_id_certificate_index" ON
    "trail"("id_certificate");
CREATE TABLE "module"(
    "id" BIGINT NOT NULL,
    "name" CHAR(255) NOT NULL,
    "description" CHAR(255) NOT NULL,
    "id_trail" BIGINT NOT NULL
);
ALTER TABLE
    "module" ADD PRIMARY KEY("id");
CREATE INDEX "module_id_trail_index" ON
    "module"("id_trail");
CREATE TABLE "class"(
    "id" BIGINT NOT NULL,
    "name" CHAR(255) NOT NULL,
    "description" CHAR(255) NOT NULL,
    "id_module" BIGINT NOT NULL
);
ALTER TABLE
    "class" ADD PRIMARY KEY("id");
CREATE INDEX "class_id_module_index" ON
    "class"("id_module");
CREATE TABLE "certificate"(
    "id" BIGINT NOT NULL,
    "description" CHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "id_user" BIGINT NOT NULL
);
ALTER TABLE
    "certificate" ADD PRIMARY KEY("id");
CREATE INDEX "certificate_id_user_index" ON
    "certificate"("id_user");
CREATE TABLE "ranking"(
    "id" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "score" INTEGER NOT NULL
);
ALTER TABLE
    "ranking" ADD PRIMARY KEY("id");
CREATE TABLE "question"(
    "id" BIGINT NOT NULL,
    "question_text" TEXT NOT NULL,
    "id_test" BIGINT NOT NULL
);
ALTER TABLE
    "question" ADD PRIMARY KEY("id");
CREATE INDEX "question_id_test_index" ON
    "question"("id_test");
CREATE TABLE "answer"(
    "id" BIGINT NOT NULL,
    "answer_text" CHAR(255) NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "score" BIGINT NOT NULL,
    "id_question" BIGINT NOT NULL
);
ALTER TABLE
    "answer" ADD PRIMARY KEY("id");
CREATE INDEX "answer_id_question_index" ON
    "answer"("id_question");
CREATE TABLE "merit"(
    "id" BIGINT NOT NULL,
    "name" CHAR(255) NOT NULL,
    "description" CHAR(255) NOT NULL
);
ALTER TABLE
    "merit" ADD PRIMARY KEY("id");
CREATE TABLE "merit-user"(
    "id" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "id_merit" BIGINT NOT NULL
);
ALTER TABLE
    "merit-user" ADD PRIMARY KEY("id");
CREATE INDEX "merit_user_id_user_index" ON
    "merit-user"("id_user");
CREATE INDEX "merit_user_id_merit_index" ON
    "merit-user"("id_merit");
CREATE TABLE "trail-user"(
    "id" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "id_trail" BIGINT NOT NULL,
    "percentation" INTEGER NOT NULL
);
ALTER TABLE
    "trail-user" ADD PRIMARY KEY("id");
CREATE INDEX "trail_user_id_user_index" ON
    "trail-user"("id_user");
CREATE INDEX "trail_user_id_trail_index" ON
    "trail-user"("id_trail");
CREATE TABLE "test"(
    "id" BIGINT NOT NULL,
    "id_trail" BIGINT NOT NULL
);
ALTER TABLE
    "test" ADD PRIMARY KEY("id");
CREATE INDEX "test_id_trail_index" ON
    "test"("id_trail");
CREATE TABLE "module-user"(
    "id" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "id_module" BIGINT NOT NULL,
    "percentation" INTEGER NOT NULL
);
ALTER TABLE
    "module-user" ADD PRIMARY KEY("id");
CREATE INDEX "module_user_id_user_index" ON
    "module-user"("id_user");
CREATE INDEX "module_user_id_module_index" ON
    "module-user"("id_module");
CREATE TABLE "class-user"(
    "id" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "id_course" BIGINT NOT NULL,
    "complete" BOOLEAN NOT NULL
);
ALTER TABLE
    "class-user" ADD PRIMARY KEY("id");
CREATE INDEX "class_user_id_user_index" ON
    "class-user"("id_user");
CREATE INDEX "class_user_id_course_index" ON
    "class-user"("id_course");
CREATE TABLE "test-user"(
    "id" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "id_test" BIGINT NOT NULL,
    "grade" INTEGER NOT NULL
);
ALTER TABLE
    "test-user" ADD PRIMARY KEY("id");
CREATE INDEX "test_user_id_user_index" ON
    "test-user"("id_user");
CREATE INDEX "test_user_id_test_index" ON
    "test-user"("id_test");
ALTER TABLE
    "trail-user" ADD CONSTRAINT "trail_user_id_trail_foreign" FOREIGN KEY("id_trail") REFERENCES "trail"("id");
ALTER TABLE
    "class" ADD CONSTRAINT "class_id_module_foreign" FOREIGN KEY("id_module") REFERENCES "module"("id");
ALTER TABLE
    "certificate" ADD CONSTRAINT "certificate_id_user_foreign" FOREIGN KEY("id_user") REFERENCES "user"("id");
ALTER TABLE
    "question" ADD CONSTRAINT "question_id_test_foreign" FOREIGN KEY("id_test") REFERENCES "test"("id");
ALTER TABLE
    "test" ADD CONSTRAINT "test_id_trail_foreign" FOREIGN KEY("id_trail") REFERENCES "trail"("id");
ALTER TABLE
    "merit-user" ADD CONSTRAINT "merit_user_id_user_foreign" FOREIGN KEY("id_user") REFERENCES "user"("id");
ALTER TABLE
    "class-user" ADD CONSTRAINT "class_user_id_user_foreign" FOREIGN KEY("id_user") REFERENCES "user"("id");
ALTER TABLE
    "module-user" ADD CONSTRAINT "module_user_id_user_foreign" FOREIGN KEY("id_user") REFERENCES "user"("id");
ALTER TABLE
    "ranking" ADD CONSTRAINT "ranking_id_user_foreign" FOREIGN KEY("id_user") REFERENCES "user"("id");
ALTER TABLE
    "test-user" ADD CONSTRAINT "test_user_id_test_foreign" FOREIGN KEY("id_test") REFERENCES "test"("id");
ALTER TABLE
    "class-user" ADD CONSTRAINT "class_user_id_course_foreign" FOREIGN KEY("id_course") REFERENCES "class"("id");
ALTER TABLE
    "merit-user" ADD CONSTRAINT "merit_user_id_merit_foreign" FOREIGN KEY("id_merit") REFERENCES "merit"("id");
ALTER TABLE
    "test-user" ADD CONSTRAINT "test_user_id_user_foreign" FOREIGN KEY("id_user") REFERENCES "user"("id");
ALTER TABLE
    "answer" ADD CONSTRAINT "answer_id_question_foreign" FOREIGN KEY("id_question") REFERENCES "question"("id");
ALTER TABLE
    "trail" ADD CONSTRAINT "trail_id_certificate_foreign" FOREIGN KEY("id_certificate") REFERENCES "certificate"("id");
ALTER TABLE
    "module-user" ADD CONSTRAINT "module_user_id_module_foreign" FOREIGN KEY("id_module") REFERENCES "module"("id");
ALTER TABLE
    "trail-user" ADD CONSTRAINT "trail_user_id_user_foreign" FOREIGN KEY("id_user") REFERENCES "user"("id");
ALTER TABLE
    "module" ADD CONSTRAINT "module_id_trail_foreign" FOREIGN KEY("id_trail") REFERENCES "trail"("id");