-- JobSearch schema (reconstructed from application queries)
-- Fresh setup:
--   podman exec -i jobsearch-mysql mysql -uroot -pjobsearchrootpass jobsearch < schema.sql

CREATE TABLE IF NOT EXISTS users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(50)  NOT NULL,
  last_name     VARCHAR(50)  NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  date_of_birth DATE NULL,
  phone_number  VARCHAR(20)  NULL,
  is_verified   TINYINT(1)   NOT NULL DEFAULT 0,
  role          ENUM('candidate','employer','employed') NOT NULL DEFAULT 'candidate',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  profile_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL UNIQUE,
  bio            TEXT NULL,
  skills         TEXT NULL,
  experience     TEXT NULL,
  location       VARCHAR(100) NULL,
  education      TEXT NULL,
  certifications TEXT NULL,
  languages      TEXT NULL,
  social_links   TEXT NULL,
  cv             TEXT NULL,
  website        VARCHAR(255) NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidates (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL UNIQUE,
  cover_letter TEXT NULL,
  availability ENUM('Yes','No') NOT NULL DEFAULT 'Yes',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS companies (
  company_id   INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(100) NOT NULL,
  industry     VARCHAR(100) NULL,
  founded_year YEAR NULL,
  location     VARCHAR(100) NULL,
  description  TEXT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  job_id          INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(120) NOT NULL,
  company_id      INT NOT NULL,
  location        VARCHAR(100) NULL,
  description     TEXT NULL,
  salary          DECIMAL(10,2) NULL,
  skills_required TEXT NULL,
  job_type        VARCHAR(50) NULL,
  remote_option   VARCHAR(20) NULL,
  category        VARCHAR(80) NULL,
  is_available    TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  job_id         INT NOT NULL,
  status         ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  applied_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id)  REFERENCES jobs(job_id)   ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employed (
  employed_id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id               INT NOT NULL,
  job_id                INT NULL,
  employer_id           INT NULL,
  employment_start_date DATE NULL,
  employment_end_date   DATE NULL,
  salary                DECIMAL(10,2) NULL,
  employment_status     VARCHAR(30) NOT NULL DEFAULT 'active',
  notes                 TEXT NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id)  REFERENCES jobs(job_id)   ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS saved_jobs (
  saved_job_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  job_id       INT NOT NULL,
  saved_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_saved (user_id, job_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id)  REFERENCES jobs(job_id)   ON DELETE CASCADE
);

-- Canonical columns: message / sent_at (REST path + frontend both read `message`)
CREATE TABLE IF NOT EXISTS messages (
  message_id  INT AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  message     TEXT NOT NULL,
  sent_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)   REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ratings (
  rating_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  reviewer_id INT NOT NULL,
  job_id      INT NULL,
  rating      TINYINT NOT NULL,
  comment     TEXT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidate_ratings (
  rating_id    INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT NOT NULL,
  employer_id  INT NOT NULL,
  rating       TINYINT NOT NULL,
  comment      TEXT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_ratings (
  rating_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  company_id INT NOT NULL,
  rating     TINYINT NOT NULL,
  comment    TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
  recommendation_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NOT NULL,
  job_id              INT NULL,
  candidate_id        INT NULL,
  score               FLOAT NOT NULL DEFAULT 0,
  recommendation_type ENUM('job','candidate') NOT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_rec (user_id, job_id, recommendation_type)
);

CREATE TABLE IF NOT EXISTS search_history (
  search_id    INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT NOT NULL,
  keywords     VARCHAR(255) NOT NULL,
  searched_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES users(user_id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS employers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  company_id INT NULL,
  job_id     INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(user_id)        ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE SET NULL,
  FOREIGN KEY (job_id)     REFERENCES jobs(job_id)          ON DELETE SET NULL
);
