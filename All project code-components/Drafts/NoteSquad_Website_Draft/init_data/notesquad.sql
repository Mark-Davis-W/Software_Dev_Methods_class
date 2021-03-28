CREATE EXTENSION pgcrypto;

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username varchar(50) UNIQUE,
  email varchar UNIQUE,
  password varchar NOT NULL,
  account_type char(1) NOT NULL,
  CHECK (account_type = 's' OR account_type = 'n'),
  is_admin boolean NOT NULL,
  university varchar(200) NOT NULL,
  saved_notes varchar[],
  written_notes varchar[],
  about_me varchar(1000),
  courses varchar[]
);

DROP TABLE IF EXISTS notes CASCADE;
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  filepath varchar,
  major varchar(30),
  course_id char(8),
  note_title varchar,
  semester date,
  reported boolean
);

DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id integer,
  reciever_id integer,
  body varchar(200),
  creationDate DATE
);

INSERT INTO users(username, email, password, account_type, is_admin, university, courses)
VALUES ('user1', 'user1@email.com', crypt('user1password', gen_salt('bf')), 's', 'false', 'CU Boulder', ARRAY ['CSCI']),
('user2', 'user2@email.com', crypt('user2password', gen_salt('bf')), 'n', 'false', 'CU Boulder', ARRAY ['CSCI']),
('user3', 'user3@email.com', crypt('user3password', gen_salt('bf')), 's', 'false', 'CU Boulder', ARRAY ['CSCI', 'ASTR']),
('user4', 'user4@email.com', crypt('user4password', gen_salt('bf')), 'n', 'false', 'CU Boulder', ARRAY ['CSCI', 'ASTR']);
INSERT INTO users(username, email, password, account_type, is_admin, university)
VALUES ('admin', 'admin@email.com', crypt('admin1password', gen_salt('bf')), 's', 'true', 'CU Boulder');

INSERT INTO notes(filepath, major, course_id, note_title, semester, reported)
VALUES('#', 'Computer Science', 'CSCI3308', 'Software Dev Notes', '20210120', 'FALSE'),
('#', 'Computer Science', 'CSCI3308', 'Software Dev Notes', '20210120', 'TRUE'),
('#', 'Computer Science', 'CSCI3155', 'Principles of Programming Notes', '20210120', 'TRUE');

INSERT INTO messages(sender_id, reciever_id, body, creationDate)
VALUES (1, 2, 'a message from 1 to 2', '20210421'), 
(2, 1, 'a message from 2 to 1', '20210422'),
(3, 1, 'a message from 3 to 1', '20210422');


ALTER TABLE "users" ADD FOREIGN KEY ("saved_notes") REFERENCES "notes" ("id");

ALTER TABLE "users" ADD FOREIGN KEY ("written_notes") REFERENCES "notes" ("id");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "messages" ("sender_id");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "messages" ("reciever_id");

ALTER TABLE "users" ADD FOREIGN KEY ("courses") REFERENCES "notes" ("course_id");
