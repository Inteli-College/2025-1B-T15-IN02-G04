CREATE TABLE "role-user"(
    "id" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "id_role" BIGINT NOT NULL
);
ALTER TABLE
    "role-user" ADD PRIMARY KEY("id");
CREATE TABLE "role"(
    "id" BIGINT NOT NULL,
    "role_name" CHAR(255) NOT NULL
);
ALTER TABLE
    "role" ADD PRIMARY KEY("id");
CREATE TABLE "hierarchy"(
    "id" BIGINT NOT NULL,
    "id_role-user1" BIGINT NOT NULL,
    "id_role-user2" BIGINT NOT NULL
);
ALTER TABLE
    "hierarchy" ADD PRIMARY KEY("id");
CREATE TABLE "hierarchy-trail"(
    "id" BIGINT NOT NULL,
    "id_hierarchy" BIGINT NOT NULL,
    "id_trail" BIGINT NOT NULL
);
ALTER TABLE
    "hierarchy-trail" ADD PRIMARY KEY("id");
CREATE TABLE "card"(
    "id" BIGINT NOT NULL,
    "titlle" CHAR(255) NOT NULL,
    "description" CHAR(255) NOT NULL,
    "image" CHAR(255) NOT NULL
);
ALTER TABLE
    "card" ADD PRIMARY KEY("id");
CREATE TABLE "card-user"(
    "id" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "id_card" BIGINT NOT NULL
);
ALTER TABLE
    "card-user" ADD PRIMARY KEY("id");
CREATE TABLE "coment"(
    "id" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "coment" CHAR(255) NOT NULL
);
ALTER TABLE
    "coment" ADD PRIMARY KEY("id");
CREATE TABLE "post"(
    "id" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "descripton" CHAR(255) NOT NULL,
    "tittle" CHAR(255) NOT NULL,
    "image" CHAR(255) NOT NULL,
    "data" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "post" ADD PRIMARY KEY("id");
CREATE TABLE "user-like"(
    "id" BIGINT NOT NULL,
    "id_user" BIGINT NOT NULL,
    "id_post" BIGINT NOT NULL,
    "like" BOOLEAN NOT NULL
);
ALTER TABLE
    "user-like" ADD PRIMARY KEY("id");
CREATE TABLE "coment-class"(
    "id" BIGINT NOT NULL,
    "id_class" BIGINT NOT NULL,
    "id_coment" BIGINT NOT NULL
);
ALTER TABLE
    "coment-class" ADD PRIMARY KEY("id");
CREATE TABLE "coment-post"(
    "id" BIGINT NOT NULL,
    "id_post" BIGINT NOT NULL,
    "id_coment" BIGINT NOT NULL
);
ALTER TABLE
    "coment-post" ADD PRIMARY KEY("id");
ALTER TABLE
    "coment-class" ADD CONSTRAINT "coment_class_id_coment_foreign" FOREIGN KEY("id_coment") REFERENCES "coment"("id");
ALTER TABLE
    "coment" ADD CONSTRAINT "coment_id_user_foreign" FOREIGN KEY("id_user") REFERENCES "user"("id");
ALTER TABLE
    "hierarchy-trail" ADD CONSTRAINT "hierarchy_trail_id_hierarchy_foreign" FOREIGN KEY("id_hierarchy") REFERENCES "hierarchy"("id");
ALTER TABLE
    "role-user" ADD CONSTRAINT "role_user_id_user_foreign" FOREIGN KEY("id_user") REFERENCES "user"("id");
ALTER TABLE
    "card-user" ADD CONSTRAINT "card_user_id_user_foreign" FOREIGN KEY("id_user") REFERENCES "user"("id");
ALTER TABLE
    "hierarchy" ADD CONSTRAINT "hierarchy_id_role_user1_foreign" FOREIGN KEY("id_role-user1") REFERENCES "role-user"("id");
ALTER TABLE
    "coment-post" ADD CONSTRAINT "coment_post_id_post_foreign" FOREIGN KEY("id_post") REFERENCES "post"("id");
ALTER TABLE
    "card-user" ADD CONSTRAINT "card_user_id_card_foreign" FOREIGN KEY("id_card") REFERENCES "card"("id");
ALTER TABLE
    "role-user" ADD CONSTRAINT "role_user_id_role_foreign" FOREIGN KEY("id_role") REFERENCES "role"("id");
ALTER TABLE
    "user-like" ADD CONSTRAINT "user_like_id_post_foreign" FOREIGN KEY("id_post") REFERENCES "post"("id");
ALTER TABLE
    "hierarchy" ADD CONSTRAINT "hierarchy_id_role_user2_foreign" FOREIGN KEY("id_role-user2") REFERENCES "role-user"("id");
ALTER TABLE
    "post" ADD CONSTRAINT "post_id_user_foreign" FOREIGN KEY("id_user") REFERENCES "user"("id");
ALTER TABLE
    "user-like" ADD CONSTRAINT "user_like_id_user_foreign" FOREIGN KEY("id_user") REFERENCES "user"("id");
ALTER TABLE
    "coment-post" ADD CONSTRAINT "coment_post_id_coment_foreign" FOREIGN KEY("id_coment") REFERENCES "coment"("id");