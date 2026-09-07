-- JobSearch demo seed data (idempotent: fixed high IDs, INSERT IGNORE)
-- Import: podman exec -i jobsearch-mysql mysql -uroot -pjobsearchrootpass jobsearch < seed.sql
-- All demo users share the password: Passw0rd!123

-- ---- Users (employers: 101/102/108, candidates: 103/104/106/107) ----
INSERT IGNORE INTO users (user_id, first_name, last_name, email, password, date_of_birth, phone_number, is_verified, role) VALUES
(101, 'Maria',  'Papadaki',  'maria@techcorp.gr',      '$2b$10$XC.NsiYqLPYFkGmQ8snYWuqEd9RZYRnDagISbt09AcPMGEMXaOES6', '1988-03-12', '2101111111', 1, 'employer'),
(102, 'Nikos',  'Georgiou',  'nikos@webflow.gr',       '$2b$10$XC.NsiYqLPYFkGmQ8snYWuqEd9RZYRnDagISbt09AcPMGEMXaOES6', '1985-07-22', '2102222222', 1, 'employer'),
(103, 'Eleni',  'Dimitriou', 'eleni.cand@gmail.com',  '$2b$10$XC.NsiYqLPYFkGmQ8snYWuqEd9RZYRnDagISbt09AcPMGEMXaOES6', '1998-11-05', '2103333333', 1, 'candidate'),
(104, 'Costas', 'Iliopoulos','costas.cand@gmail.com', '$2b$10$XC.NsiYqLPYFkGmQ8snYWuqEd9RZYRnDagISbt09AcPMGEMXaOES6', '1996-02-18', '2104444444', 1, 'candidate'),
(105, 'Dimitris','Vlachos',   'dimitris@startup.gr',   '$2b$10$XC.NsiYqLPYFkGmQ8snYWuqEd9RZYRnDagISbt09AcPMGEMXaOES6', '1990-05-15', '2105555555', 1, 'employer'),
(106, 'Sofia',  'Nikolaidou','sofia.new@gmail.com',    '$2b$10$XC.NsiYqLPYFkGmQ8snYWuqEd9RZYRnDagISbt09AcPMGEMXaOES6', '2000-01-20', '2106666666', 1, 'candidate'),
(107, 'Alexandros','Kostas', 'alex.empty@gmail.com',   '$2b$10$XC.NsiYqLPYFkGmQ8snYWuqEd9RZYRnDagISbt09AcPMGEMXaOES6', '1997-09-08', '2107777777', 1, 'candidate'),
(108, 'Elena',  'Papadopoulos','elena@fintech.gr',    '$2b$10$XC.NsiYqLPYFkGmQ8snYWuqEd9RZYRnDagISbt09AcPMGEMXaOES6', '1987-12-03', '2108888888', 1, 'employer');

-- ---- Companies ----
INSERT IGNORE INTO companies (company_id, company_name, industry, founded_year, location, description) VALUES
(101, 'TechCorp Hellas', 'Software Development', 2012, 'Athens, Greece', 'Product company building B2B SaaS tools for the EU market.'),
(102, 'WebFlow Studio',  'Digital Agency',       2016, 'Thessaloniki, Greece', 'Creative agency specialized in web & mobile experiences.'),
(103, 'StartupGreen',    'CleanTech',            2024, 'Athens, Greece', 'Early-stage green tech startup focused on carbon tracking.'),
(104, 'FinanceHub',      'FinTech',              2018, 'Athens, Greece', 'Digital payments platform for SMBs.');

-- ---- Jobs ----
INSERT IGNORE INTO jobs (job_id, title, company_id, location, description, salary, skills_required, job_type, remote_option, category) VALUES
(201, 'Senior Frontend Developer', 101, 'Athens (Hybrid)',       'Build and scale our React-based SaaS dashboard. You will own the frontend architecture and mentor junior devs.', 55000.00, 'React, JavaScript, CSS, Testing', 'full-time', 'Hybrid', 'Engineering'),
(202, 'Backend Engineer (Node.js)', 101, 'Athens (Hybrid)',      'Design REST APIs and optimize MySQL queries for our core platform. Express + Node.js stack.',                    58000.00, 'Node.js, Express, MySQL, REST',   'full-time', 'Hybrid', 'Engineering'),
(203, 'Junior Web Developer',      101, 'Athens (On-site)',      'Entry-level role for a motivated developer. Work alongside senior engineers on real product features.',           24000.00, 'HTML, CSS, JavaScript, Git',      'full-time', 'No',     'Engineering'),
(204, 'React Native Developer',    102, 'Thessaloniki (Remote)', 'Cross-platform mobile apps for agency clients. Modern React Native + TypeScript codebase.',                      48000.00, 'React Native, TypeScript, iOS',   'full-time', 'Yes',    'Engineering'),
(205, 'UI/UX Designer',            102, 'Thessaloniki (Hybrid)', 'Design clean, accessible interfaces. Work with Figma and hand off to our dev team.',                             39000.00, 'Figma, Design Systems, UX',       'part-time', 'Hybrid', 'Design'),
(206, 'DevOps Engineer',           102, 'Remote (Greece)',       'Own our CI/CD pipelines, containers and cloud infrastructure. Docker, GitHub Actions, AWS.',                     62000.00, 'Docker, AWS, CI/CD, Linux',       'full-time', 'Yes',    'Engineering'),
(207, 'Python Data Engineer',      104, 'Athens (Hybrid)',       'Build data pipelines for our analytics platform. Python + SQL + Airflow.',                                       52000.00, 'Python, SQL, Airflow, ETL',       'full-time', 'Hybrid', 'Data');

-- ---- Employer links ----
INSERT IGNORE INTO employers (user_id, company_id, job_id) VALUES
(101, 101, 201), (101, 101, 202), (101, 101, 203),
(102, 102, 204), (102, 102, 205), (102, 102, 206),
(105, 103, NULL),
(108, 104, 207);

-- ---- Candidate profiles ----
INSERT IGNORE INTO candidates (id, user_id, cover_letter, availability) VALUES
(101, 103, 'Frontend-focused developer with 3 years of React experience and a passion for clean UI.', 'Yes'),
(102, 104, 'Full-stack developer, comfortable with Node.js, MySQL and modern tooling.',               'Yes'),
(103, 106, '',                                                                                        'Yes'),
(104, 107, 'Looking for my first dev role.',                                                         'Yes');

INSERT IGNORE INTO profiles (user_id, bio, skills, experience, location, education, certifications, languages, website) VALUES
(103, 'React developer who loves pixel-perfect UIs.', 'React, JavaScript, CSS, Git', '3 years as frontend dev in two startups', 'Athens, Greece', 'BSc Computer Science, Aristotle University', 'Meta Frontend Professional', 'Greek, English', 'https://eleni-dev.example.com'),
(104, 'Full-stack engineer, Node.js & MySQL.',        'Node.js, Express, MySQL, Docker', '4 years building REST APIs', 'Patras, Greece', 'BSc Informatics, University of Patras', '', 'Greek, English', '');

-- ---- Company ratings ----
INSERT IGNORE INTO company_ratings (user_id, company_id, rating, comment, created_at) VALUES
(103, 101, 5, 'Great interview process, fast feedback.',            NOW() - INTERVAL 5 DAY),
(104, 101, 4, 'Solid engineering culture, slightly slow onboarding.', NOW() - INTERVAL 3 DAY),
(103, 102, 4, 'Creative team, well-organized projects.',             NOW() - INTERVAL 2 DAY);

-- ---- Candidate ratings ----
INSERT IGNORE INTO candidate_ratings (candidate_id, employer_id, rating, comment) VALUES
(101, 101, 5, 'Excellent communicator, delivered on time.'),
(102, 102, 4, 'Strong backend skills, proactive.');

-- ---- Demo messages between candidates ----
INSERT IGNORE INTO messages (sender_id, receiver_id, message, sent_at) VALUES
(103, 104, 'Hey Costas, are you joining the Athens JS meetup this week?', NOW() - INTERVAL 1 DAY),
(104, 103, 'Yes! See you there — I will bring the project notes.',        NOW() - INTERVAL 1 DAY + INTERVAL 2 HOUR);

-- ---- Saved jobs for demo candidate ----
INSERT IGNORE INTO saved_jobs (user_id, job_id) VALUES
(103, 204), (103, 202);

-- ---- Demo applications ----
INSERT IGNORE INTO applications (user_id, job_id, status, applied_at) VALUES
(103, 201, 'pending',  NOW() - INTERVAL 3 DAY),
(104, 202, 'accepted', NOW() - INTERVAL 7 DAY);
