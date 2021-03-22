CREATE EXTENSION pgcrypto;

DROP TABLE IF EXISTS user CASCADE;
CREATE TABLE IF NOT EXISTS user (
  id integer PRIMARY KEY,
  username varchar(20) UNIQUE,
  email varchar UNIQUE,
  password varchar(20),
  account_type char(1),
  university varchar(200),
  saved_notes varchar[],
  written_notes varchar[],
  about_me varchar(1000),
  courses varchar[]
);

DROP TABLE IF EXISTS notes CASCADE;
CREATE TABLE IF NOT EXISTS notes (
  id integer PRIMARY KEY,
  filepath varchar UNIQUE,
  major varchar(30),
  course_id char(8),
  note_title varchar,
  semester date,
  reported boolean
);

DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE IF NOT EXISTS messages (
  id integer PRIMARY KEY,
  sender_id integer UNIQUE,
  reciever_id integer UNIQUE,
  body varchar(200),
  creationDate DATE
);

DROP TABLE IF EXISTS university CASCADE;
CREATE TABLE IF NOT EXISTS university (
  id char(50) PRIMARY KEY,
  user_id integer[]
);

-- INSERT INTO user(id, username, email, password, account_type, university, courses)
-- VALUES (1, 'user1', 'user1@email.com', crypt('user1password', gen_salt('bf')), 'S', 'CU Boulder', ARRAY ['CSCI']);

INSERT INTO notes(id, filepath, major, course_id, note_title, semester, reported)
VALUES (1, '#', 'Computer Science', 'CSCI3308', 'Software Dev Notes', '20210120', 'FALSE');
VALUES (2, '#', 'Computer Science', 'CSCI3308', 'Software Dev Notes', '20210120', 'TRUE');
VALUES (3, '#', 'Computer Science', 'CSCI3155', 'Principles of Programming Notes', '20210120', 'TRUE');

INSERT INTO messages(id, sender_id, reciever_id, body, creationDate)
VALUES (1, 1, 2, 'a message from 1 to 2', '20210421');
VALUES (2, 2, 1, 'a message from 2 to 1', '20210422');
VALUES (3, 3, 1, 'a message from 3 to 1', '20210422');

INSERT INTO university(id, user_id)
VALUES ('Cu Boulder', ARRAY [1,2,3]);


ALTER TABLE "user" ADD FOREIGN KEY ("saved_notes") REFERENCES "notes" ("id");

ALTER TABLE "user" ADD FOREIGN KEY ("written_notes") REFERENCES "notes" ("id");

ALTER TABLE "user" ADD FOREIGN KEY ("id") REFERENCES "messages" ("user1");

ALTER TABLE "user" ADD FOREIGN KEY ("id") REFERENCES "messages" ("user2");

ALTER TABLE "user" ADD FOREIGN KEY ("courses") REFERENCES "notes" ("course_id");

ALTER TABLE "user" ADD FOREIGN KEY ("university") REFERENCES "university" ("id");

ALTER TABLE "university" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");
