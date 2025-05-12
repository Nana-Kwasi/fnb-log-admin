=== REGISTERED ROUTES ===
GET /health
GET visitors//check-telephone/:telephone
GET visitors//index
GET visitors//index/branch
GET visitors//
GET visitors//by-phone
GET visitors//:id
POST visitors//
PUT visitors//:id
DELETE visitors//:id
POST auth//login
POST auth//register
POST auth//verify
POST auth//verify-admin
POST users//verify-fnumber
POST users//
POST users//authenticate
POST users//verify2fa
POST users//finalize-login
POST users//checkUserBranches
POST users//track2FAStatus
GET users//
PUT users//:id
DELETE users//:id
======================

Server is running on port 5001
Health check available at: http://localhost:5001/health
Auth endpoints available at: http://localhost:5001/auth/login
Connected to the database



