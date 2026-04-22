# Sitna Cancer Clinic — Backend

Standalone Express + Prisma backend for local testing.

## Setup

1. Set your database URL in `.env`:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/sitna_db"
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Run migrations (first time):
   ```bash
   npx prisma migrate dev --name init
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

Server runs at **http://localhost:4000**

---

## Test with curl

### Health
```bash
curl http://localhost:4000/health
```

---

### Auth

**Login**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

**Signup**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123","name":"Admin User"}'
```

---

### Appointments

**List all**
```bash
curl http://localhost:4000/api/appointments
```

**Filter by status**
```bash
curl "http://localhost:4000/api/appointments?status=PENDING"
```

**Filter by date**
```bash
curl "http://localhost:4000/api/appointments?date=2025-05-01"
```

**Get one**
```bash
curl http://localhost:4000/api/appointments/<id>
```

**Create**
```bash
curl -X POST http://localhost:4000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Doe",
    "dateOfBirth": "1990-01-15",
    "phone": "0712345678",
    "email": "jane@example.com",
    "reasonForVisit": "Consultation",
    "appointmentDate": "2025-05-05",
    "appointmentTime": "10:00",
    "location": "KNH Doctors Plaza",
    "reminderConsent": true
  }'
```

**Update status**
```bash
curl -X PATCH http://localhost:4000/api/appointments/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED"}'
```

**Delete**
```bash
curl -X DELETE http://localhost:4000/api/appointments/<id>
```

---

### Patients

**List all**
```bash
curl http://localhost:4000/api/patients
```

**Search**
```bash
curl "http://localhost:4000/api/patients?search=Jane"
```

**Get one by ID**
```bash
curl "http://localhost:4000/api/patients?id=<id>"
```

**Create**
```bash
curl -X POST http://localhost:4000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","dateOfBirth":"1985-03-20","phone":"0712345678","email":"john@example.com"}'
```

---

### Availability

**Weekly overview**
```bash
curl http://localhost:4000/api/availability
```

**Slots for a date**
```bash
curl "http://localhost:4000/api/availability?date=2025-05-05"
```

**Slots for a date + location**
```bash
curl "http://localhost:4000/api/availability?date=2025-05-05&location=knh"
```

**Block a slot**
```bash
curl -X POST http://localhost:4000/api/availability \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-05-05","startTime":"10:00","endTime":"10:45","reason":"Lunch","isBlocked":true}'
```

---

### Messages

**List all**
```bash
curl http://localhost:4000/api/messages
```

**Filter unread**
```bash
curl "http://localhost:4000/api/messages?status=UNREAD"
```

**Send a message**
```bash
curl -X POST http://localhost:4000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Jane Doe","phone":"0712345678","subject":"Inquiry","message":"What are your hours?"}'
```

**Mark as read**
```bash
curl -X PATCH http://localhost:4000/api/messages/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"READ"}'
```

**Respond**
```bash
curl -X PUT http://localhost:4000/api/messages/<id> \
  -H "Content-Type: application/json" \
  -d '{"response":"We are open Mon-Fri","respondedBy":"Admin"}'
```

**Delete**
```bash
curl -X DELETE http://localhost:4000/api/messages/<id>
```

---

### Doctor Unavailability

**List upcoming**
```bash
curl http://localhost:4000/api/unavailability
```

**List all (including past)**
```bash
curl "http://localhost:4000/api/unavailability?all=true"
```

**Add unavailability**
```bash
curl -X POST http://localhost:4000/api/unavailability \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2025-05-10","endDate":"2025-05-12","reason":"Conference"}'
```

**Delete**
```bash
curl -X DELETE http://localhost:4000/api/unavailability/<id>
```

---

### Dashboard

**Stats**
```bash
curl http://localhost:4000/api/dashboard/stats
```
