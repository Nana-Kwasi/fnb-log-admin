PS C:\Users\f8877557\file-backend> cd new-backend
PS C:\Users\f8877557\file-backend\new-backend> node server.js
Server is running on port 5001
Health check available at: http://localhost:5001/health
Auth endpoints available at: http://localhost:5001/auth/login
Connected to the database
2025-03-25T13:35:45.667Z - GET /auth/branches
2025-03-25T13:35:45.736Z - POST /auth/login
Login attempt: admin@fnb.com for branch default
Checking if user admin@fnb.com has access to branch: default
User's authorized branches: [
  'JUNCTION SHOPPING CENTRE BRANCH',
  'WEST HILLS MALL',
  'ACCRA BRANCH'
]
Branch access denied: User admin@fnb.com attempted to access unauthorized branch: default
