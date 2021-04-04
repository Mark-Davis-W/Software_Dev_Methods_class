DROP TABLE IF EXISTS notes CASCADE;
CREATE TABLE IF NOT EXISTS notes (
  note_id SERIAL PRIMARY KEY,
  -- This is a file path (absolute or relative), that holds the path for the pdf
  filepath varchar(200) NOT NULL, 
  major varchar(30) NOT NULL,
  course_id char(8) NOT NULL,
  note_title varchar NOT NULL,
  semester date,
  reported boolean NOT NULL,
  note_user_id integer NOT NULL
);

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username varchar(50) UNIQUE NOT NULL,
  email varchar UNIQUE NOT NULL,
  pass_word varchar NOT NULL,
  account_type char(1) NOT NULL CHECK (account_type = 's' OR account_type = 'n'),
  is_admin boolean NOT NULL,
  university varchar(200) NOT NULL,
  -- Suppposedly have an array of notes via note_id here
  saved_notes integer[],
  written_notes integer[],
  about_me varchar(1000),
  courses varchar[]
);

DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE IF NOT EXISTS messages (
  message_id SERIAL PRIMARY KEY,
  sender_id integer NOT NULL,
  reciever_id integer NOT NULL,
  body varchar(300) NOT NULL,
  creationDate DATE NOT NULL
);

ALTER TABLE "users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "notes" ADD FOREIGN KEY ("note_user_id") REFERENCES "users" ("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "messages" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "messages" ADD FOREIGN KEY ("reciever_id") REFERENCES "users" ("user_id") ON UPDATE CASCADE ON DELETE CASCADE;

INSERT INTO users(username, email, pass_word, account_type, is_admin, university, courses)
VALUES ('user1', 'user1@email.com', 'user1password', 's', 'false', 'CU Boulder', ARRAY ['CSCI']),
('user2', 'user2@email.com', 'user2password', 'n', 'false', 'CU Boulder', ARRAY ['CSCI']),
('user3', 'user3@email.com', 'user3password', 's', 'false', 'CU Boulder', ARRAY ['CSCI', 'ASTR']),
('user4', 'user4@email.com', 'user4password', 'n', 'false', 'CU Boulder', ARRAY ['CSCI', 'ASTR']);

INSERT INTO users(username, email, pass_word, account_type, is_admin, university)
VALUES ('admin', 'admin@email.com', 'admin1password', 'n', 'true', 'CU Boulder');

INSERT INTO notes(filepath, major, course_id, note_title, semester, reported, note_user_id)
VALUES('#', 'Computer Science', 'CSCI3308', 'Software Dev Notes', '20210120', 'FALSE','1'),
('#', 'Computer Science', 'CSCI3308', 'Software Dev Notes', '20210120', 'TRUE','1'),
('#', 'Computer Science', 'CSCI3155', 'Principles of Programming Notes', '20210120', 'TRUE','1');

INSERT INTO messages(sender_id, reciever_id, body, creationDate)
VALUES (1, 2, 'a message from 1 to 2', '20210421'), 
(2, 1, 'a message from 2 to 1', '20210422'),
(3, 1, 'a message from 3 to 1', '20210422');


-- OLD STUFF

-- CREATE EXTENSION pgcrypto;
-- crypt('user1password', gen_salt('bf'))

-- ALTER TABLE "notes" ADD FOREIGN KEY ("note_id") REFERENCES "users" ("saved_notes");

-- ALTER TABLE "notes" ADD FOREIGN KEY ("note_id") REFERENCES "users" ("written_notes");

-- ALTER TABLE "users" ADD FOREIGN KEY ("user_id") REFERENCES "messages" ("sender_id");

-- ALTER TABLE "users" ADD FOREIGN KEY ("user_id") REFERENCES "messages" ("reciever_id");

-- ALTER TABLE "users" ADD FOREIGN KEY ("courses") REFERENCES "notes" ("course_id");