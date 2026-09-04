# jobsearch

Job search platform: React (CRA) frontend + Express backend + MySQL (Podman).

## Project structure

```
BackEnd/            Express server, routes/, recommendation engine, socket.io
FrontEnd/
  src/
    api.js          Central API base URL (REACT_APP_API_URL)
    pages/          Route components (Home, Jobs, Register, Login, ...)
    components/     Shared components (Navbar, Header, Footer, Rating)
    context/        AuthContext
    services/       socket, JobController, RegisterController
  scripts/          Dev utilities (extractRoutes.js)
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values (backend + frontend).

## MySQL in WSL (Podman)

The full stack (React + Express + MySQL) runs inside WSL. MySQL lives in a rootless Podman container:

```bash
podman run -d --name jobsearch-mysql -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=jobsearchrootpass \
  -e MYSQL_DATABASE=jobsearch \
  -e MYSQL_USER=jobsearchuser \
  -e MYSQL_PASSWORD=jobsearchuserpassword \
  docker.io/library/mysql:8.0.31
```

Restore data from a dump:

```bash
podman exec -i jobsearch-mysql mysql -uroot -pjobsearchrootpass jobsearch < <dump-file>.sql
```

### Daily usage

```bash
npm run dev      # starts MySQL container (waits until ready) + backend + frontend
npm run db:stop  # stop the MySQL container
npm run db:logs  # follow MySQL container logs
```

- Backend: http://localhost:5000 — Frontend: http://localhost:3000
- DB dumps are kept outside the repo in `~/Projects/jobsearch-dumps/`
