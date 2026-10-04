# PharmaLeads – Lead Management System

Lead & customer management for a pharmacy business: JWT auth with admin/user roles, full lead CRUD, server-side pagination/filter/sort/search, debounced search, follow-up reminders (toasts + bell), dynamic post-conversion customer fields.

## Prerequisites
Node 18+, MongoDB running locally.

## Setup
```bash
# Backend
cd backend
cp .env.example .env        # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run dev                 # http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173  (proxies /api to :5000)
npm test                    # unit tests
```


## Roles
- **admin**: sees all leads, can assign leads to any user, can delete leads.
- **user**: sees only leads assigned to / created by them; cannot delete or reassign.

## API (all `/api`, Bearer token except auth)
| Method | Path | Notes |
|---|---|---|
| POST | /auth/register, /auth/login | returns `{token,user}` |
| GET | /auth/me | current user |
| GET | /users | assignable users |
| GET | /leads | `page,limit,search,status,leadSource,assignedTo,sortBy,order` |
| POST | /leads | create |
| GET/PUT | /leads/:id | read / update |
| DELETE | /leads/:id | admin only |
| GET | /leads/stats, /leads/reminders | dashboard + follow-ups due (overdue/today/tomorrow) |

Import `postman_collection.json` into Postman; run **Login** first (it stores the token).

## Structure
`backend/src`: config 
               models 
               middleware (auth, validate, sanitize, error)  
               services 
               controllers 
               routes

`frontend/src`: components 
                views 
                context (Auth, Leads w/ cache, Toast) 
                hooks  
                services  
                utils 

## Notes
Tests use Vitest (Jest-compatible API) + React Testing Library, as it is Vite's native runner.
