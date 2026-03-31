# 🚀 User Management System  
Spring Boot + Angular Full-Stack Application

## 📌 Overview  
A full-stack application for managing users with authentication, role-based access, and audit logging.

---

## ✨ Features  
- 🔐 Login & Signup  
- 👥 User CRUD operations  
- 🔑 Role-based access (ADMIN, USER)  
- 📊 Audit logging  

---

## 🛠️ Tech Stack  
Backend: Java 17, Spring Boot, Spring Security, JPA, MySQL  
Frontend: Angular, TypeScript, RxJS, Bootstrap  

---

## 🔗 APIs  
- Auth → /api/auth/signup, /api/auth/login  
- Users → /api/users (CRUD + promote)  
- Audit → /api/audit-logs  

---

## ⚙️ Setup  
1. Clone repo  
2. Run backend (mvn spring-boot:run)  
3. Run frontend (npm install && ng serve)  

---

## ⚠️ Note  
- Use BCrypt for passwords  
- Implement JWT for security  
- Secure endpoints before production  

---

## 👨‍💻 Author  
Cyril Joshua
