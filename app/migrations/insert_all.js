import pool from "../config/db.js";

async function seedAllData() {
  const client = await pool.connect();
  console.log("Starting seeding process...");

  try {
    await client.query("BEGIN");

    console.log("Populating 'user' table...");
    const userResult = await client.query(`
            INSERT INTO "user" (first_name, last_name, email, username, hash_password, avatar, birth_date) VALUES
            ('Alice', 'Smith', 'alice.smith@example.com', 'alice_s', '$2a$10$hashedpassword1', 'alice_avatar.png', '1995-03-15'),
            ('Bob', 'Johnson', 'bob.johnson@example.com', 'bob_j', '$2a$10$hashedpassword2', 'bob_avatar.png', '1990-07-22'),
            ('Carol', 'Williams', 'carol.williams@example.com', 'carol_w', '$2a$10$hashedpassword3', NULL, '1988-11-30')
            RETURNING id;
        `);
    const userIds = userResult.rows.map((row) => row.id);
    console.log(`Inserted ${userIds.length} users. IDs: ${userIds.join(", ")}`);

    console.log("Populating 'trail' table...");
    const trailResult = await client.query(`
            INSERT INTO trail (name, description) VALUES
            ('Web Development', 'Learn the fundamentals of web development.'),
            ('Data Science', 'Master data analysis and machine learning.')
            RETURNING id;
        `);
    const trailIds = trailResult.rows.map((row) => row.id);
    console.log(
      `Inserted ${trailIds.length} trails. IDs: ${trailIds.join(", ")}`
    );

    console.log("Populating 'merit' table...");
    const meritResult = await client.query(`
            INSERT INTO merit (name, description) VALUES
            ('Web Master', 'Awarded for completing the Web Development trail.'),
            ('Data Guru', 'Awarded for mastering Data Science basics.')
            RETURNING id;
        `);
    const meritIds = meritResult.rows.map((row) => row.id);
    console.log(
      `Inserted ${meritIds.length} merits. IDs: ${meritIds.join(", ")}`
    );

    console.log("Populating 'module' table...");
    const moduleResult = await client.query(`
            INSERT INTO module (name, description, id_trail) VALUES
            ('HTML & CSS', 'Introduction to web design.', ${trailIds[0]}),
            ('JavaScript', 'Learn JavaScript programming.', ${trailIds[0]}),
            ('Python Basics', 'Fundamentals of Python programming.', ${trailIds[1]})
            RETURNING id;
        `);
    const moduleIds = moduleResult.rows.map((row) => row.id);
    console.log(
      `Inserted ${moduleIds.length} modules. IDs: ${moduleIds.join(", ")}`
    );

    console.log("Populating 'class' table...");
    const classResult = await client.query(`
            INSERT INTO class (name, description, id_module) VALUES
            ('HTML Basics', 'Learn HTML structure and elements.', ${moduleIds[0]}),
            ('CSS Styling', 'Style web pages with CSS.', ${moduleIds[0]}),
            ('JavaScript Functions', 'Understand JavaScript functions.', ${moduleIds[1]}),
            ('Python Data Types', 'Explore Python data structures.', ${moduleIds[2]})
            RETURNING id;
        `);
    const classIds = classResult.rows.map((row) => row.id);
    console.log(
      `Inserted ${classIds.length} classs. IDs: ${classIds.join(", ")}`
    );

    console.log("Notwithstanding 'certificate' table...");
    await client.query(`
            INSERT INTO certificate (description, date, id_user, id_trail) VALUES
            ('Completed Web Development Trail', '2025-05-01', ${userIds[0]}, ${trailIds[0]}),
            ('Completed Data Science Trail', '2025-04-15', ${userIds[1]}, ${trailIds[1]})
        `);
    console.log("Inserted data into 'certificate'.");

    console.log("Populating 'trail_user' table...");
    await client.query(`
            INSERT INTO trail_user (id_user, id_trail, percentation) VALUES
            (${userIds[0]}, ${trailIds[0]}, 80),
            (${userIds[1]}, ${trailIds[1]}, 60),
            (${userIds[2]}, ${trailIds[0]}, 20)
        `);
    console.log("Inserted data into 'trail_user'.");

    console.log("Populating 'module_user' table...");
    await client.query(`
            INSERT INTO module_user (id_user, id_module, percentation) VALUES
            (${userIds[0]}, ${moduleIds[0]}, 90),
            (${userIds[0]}, ${moduleIds[1]}, 70),
            (${userIds[1]}, ${moduleIds[2]}, 50)
        `);
    console.log("Inserted data into 'module_user'.");

    console.log("Populating 'class_user' table...");
    await client.query(`
            INSERT INTO class_user (id_user, id_class, complete) VALUES
            (${userIds[0]}, ${classIds[0]}, TRUE),
            (${userIds[0]}, ${classIds[1]}, FALSE),
            (${userIds[1]}, ${classIds[3]}, TRUE),
            (${userIds[2]}, ${classIds[2]}, FALSE)
        `);
    console.log("Inserted data into 'class_user'.");

    console.log("Populating 'test' table...");
    const testResult = await client.query(`
            INSERT INTO test (id_trail, name) VALUES
            (${trailIds[0]}, 'Web Development Final Test'),
            (${trailIds[1]}, 'Data Science Quiz')
            RETURNING id;
        `);
    const testIds = testResult.rows.map((row) => row.id);
    console.log(`Inserted ${testIds.length} tests. IDs: ${testIds.join(", ")}`);

    console.log("Populating 'test_user' table...");
    await client.query(`
            INSERT INTO test_user (id_user, id_test, grade, submission_date) VALUES
            (${userIds[0]}, ${testIds[0]}, 85, '2025-05-10 14:30:00'),
            (${userIds[1]}, ${testIds[1]}, 70, '2025-05-12 09:15:00')
        `);
    console.log("Inserted data into 'test_user'.");

    console.log("Populating 'question' table...");
    const questionResult = await client.query(`
            INSERT INTO question (question_text, id_test) VALUES
            ('What does HTML stand for?', ${testIds[0]}),
            ('What is a Python list?', ${testIds[1]})
            RETURNING id;
        `);
    const questionIds = questionResult.rows.map((row) => row.id);
    console.log(
      `Inserted ${questionIds.length} questions. IDs: ${questionIds.join(", ")}`
    );

    console.log("Populating 'answer' table...");
    await client.query(`
            INSERT INTO answer (answer_text, correct, score, id_question) VALUES
            ('HyperText Markup Language', TRUE, 10, ${questionIds[0]}),
            ('HighText Machine Language', FALSE, 0, ${questionIds[0]}),
            ('A collection of ordered elements', TRUE, 10, ${questionIds[1]}),
            ('A single variable', FALSE, 0, ${questionIds[1]})
        `);
    console.log("Inserted data into 'answer'.");

    console.log("Populating 'merit_user' table...");
    await client.query(`
            INSERT INTO merit_user (id_user, id_merit, awarded_date) VALUES
            (${userIds[0]}, ${meritIds[0]}, '2025-05-01 10:00:00'),
            (${userIds[1]}, ${meritIds[1]}, '2025-04-15 12:00:00')
        `);
    console.log("Inserted data into 'merit_user'.");

    console.log("Populating 'ranking' table...");
    await client.query(`
            INSERT INTO ranking (id_user, position, score) VALUES
            (${userIds[0]}, 1, 150),
            (${userIds[1]}, 2, 100),
            (${userIds[2]}, 3, 50)
        `);
    console.log("Inserted data into 'ranking'.");

    await client.query("COMMIT");
    console.log("Seeding completed successfully! All transactions committed.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(
      "Error during seeding. Transaction rolled back:",
      err.message,
      err.stack
    );
    throw err;
  } finally {
    client.release();
    console.log("Database connection released.");
  }
}

seedAllData()
  .then(() => {
    console.log("Seeding script completed.");
    pool.end();
    console.log("Connection pool closed.");
  })
  .catch((error) => {
    console.error("Critical failure during seeding script:", error);
    pool.end();
    console.log("Connection pool closed due to error.");
    process.exit(1);
  });
