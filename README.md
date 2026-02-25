# 🎓 Student Affairs Management System

A comprehensive **ECMAScript (ES6+)** project built during the **Advanced JavaScript Course** at **ITI (Information Technology Institute)**.  
This system manages **Students, Instructors, Employees, and Courses** using pure **HTML, CSS, and JavaScript** with a **simulated backend using JSON Server**.

---

## 📌 Project Overview

This is a **fully dynamic single-page-like web application** that demonstrates:

- Clean **Object-Oriented Programming (OOP)** with ES6 classes
- **Modular architecture** using JavaScript modules
- **CRUD operations** with a **mock REST API using JSON Server**
- **Real-time data relationships** between entities
- **Professional UI/UX** with smooth interactions

> 📦 **No real backend!** JSON Server simulates a complete REST API using a simple `db.json` file.


---

## ✨ Key Features

### 🔹 **Multi-Page Navigation**
- Four main pages: **Students**, **Instructors**, **Employees**, **Courses**
- Persistent navigation with active state
- Page title updates dynamically

### 🔹 **Complete CRUD Operations**
- **Create** – Add new records with validation
- **Read** – Display data in clean, sortable tables
- **Update** – Edit existing records with pre-filled forms
- **Delete** – Remove with confirmation and relationship checks

### 🔹 **Smart Data Relationships**
- **Students** → have an **advisor** (Instructor) and enrolled **courses**
- **Instructors** → teach **courses** and advise **students**
- **Employees** → base class for all staff, **Instructors** inherit from Employees
- **Courses** → have an **instructor** and enrolled **students**

### 🔹 **Advanced UI/UX Features**
- **Real-time search** – Filter by name, major, position, etc.
- **Column sorting** – Sort tables by any field (ascending/descending)
- **Pagination** – 10 items per page with page navigation
- **Smooth scrolling** – Auto-scroll to form on Add/Edit
- **Form validation** – Instant feedback with error messages

### 🔹 **Data Integrity**
- **Delete protection** – Prevent deletion if entity has related records
  - Can't delete instructor with students or courses
  - Can't delete course with enrolled students
- **Relationship updates** – Changes automatically reflect in related entities

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Page structure |
| **CSS3** | Styling and animations |
| **JavaScript (ES6+)** | Core functionality |
| **ECMAScript Modules** | Code organization |
| **JSON Server** | **Mock REST API backend** (simulates a real server) |
| **Fetch API** | HTTP requests to JSON Server |
| **Git & GitHub** | Version control |

---

## 🧠 OOP Highlights

### ✅ **Inheritance Chain**
```javascript
Person → Employee → Instructor
Person → Student
Course (independent)
```

### ✅ **Encapsulation with Private Fields**
```javascript
#id, #name, #age, #grade, #salary, #courses, #students
```
### ✅ **Polymorphism**
  - Each class implements its own toJSON() and fromJSON()
  - toString() method overridden in each class

### ✅ **Composition**
  - Student has courses[] and advisorId
  - Instructor has courses[] and students[]
  - Course has students[] and instructorId

---

## 🔍 Key Functionalities by Page

### 👨‍🎓 **Students Page**
  - View all students with advisor name
  - Add/Edit with advisor selection (dropdown)
  - Select multiple courses (multi-select)
  - Real-time grade validation (A, B+, C-, etc.)
  - Search by name or major
  - Sort by any column
  - Courses count displayed

### 👨‍🏫 **Instructors Page**
  - View instructors with courses & students count
  - Inherits all employee fields + specialization, department
  - Delete protection if has students or courses
  - Search by name, specialization, position, department
  - Sort by any column

### 👔 Employees Page
  - Base staff management
  - Add regular employees or instructors (type selector)
  - Automatic sync between employees and instructors
  - Salary and date validation
  - Search by name, position, office

### 📚 Courses Page
  - View courses with instructor name
  - View courses with instructor name
  - Add/Edit with instructor selection
  - Track enrolled students count
  - Credit validation (1-6)
  - Delete protection if has students
  - Search by name, code, credits

---

## 👩‍💻 Author
  **Sohaila Hesham Metwally**
  
  MEARN Stack Trainee @ ITI
  
  [GitHub Profile](https://github.com/Sohailahesham) | [LinkedIn Profile](https://www.linkedin.com/in/sohaila-hesham/)
