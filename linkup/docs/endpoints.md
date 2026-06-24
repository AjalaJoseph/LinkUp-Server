# LinkUp API Endpoint Blueprint 📡

This document provides full technical integration guidelines for the LinkUp API engine.

---

## 🌐 Base URL Environments Mapping
Depending on your runtime compilation environment, target your networking engine (Axios or Fetch) to one of the following root domain URLs:

* **Local Machine Development (Web/Browser)**: `http://localhost:5000`
* **Live Production Cloud Server**: `https://render.app` 

---

## 🛠️ Global Network Header Requirements
* **Content-Type**: `application/json` must be passed in the headers of all writing requests.
* **Authorization Protocol**: Protected routes require an asymmetric JSON Web Token (JWT) passed via the standard HTTP Authorization header:
  ```text
  Authorization: Bearer <YOUR_JWT_TOKEN>
  ```

---
## 🔐 1. Authentication Interface (`/api/auth`)

### A. User Account Registration
Creates a new profile on the network database.
* **Method & Route**: `POST /api/auth/register`
* **Idempotency**: Generate and send idempotency-key from client side to prevent double clicking.

**Request Body JSON:**
```json
{
  "name": "Joseph Ajala",
  "email": "joseph@example.com",
  "password": "SecurePassword123#"
}
```

**✅ Success Response (`201 Created`):**
```json
{
  "status": "success",
  "message": "User registered successfully.",
  "data": { 
    "id": "cmq4p5fsz0008w2eovc4y522b", 
    "name": "Joseph Ajala", 
    "email": "joseph@example.com" 
  }
}
```


**❌ Possible Errors:**
* **Input Error**

 ```json
  // Name error: Name field validation fail
  {
    "status": "fail",
    "message": "Name must be at least 3 characters"
  }
  ```
  ```json
  // Email error: Email format check fail
  {
    "status": "fail",
    "message": "Invalid Email format"
  }
  ```
  ```json
  // Password Error: Weak Password strength check fail
  {
    "status": "fail",
    "message": "password must be at least 8 characters including 1 lower case 1 upper case, 1 number and 1 symbol"
  }
  ```

* **Email Already Registered (`409 Conflict`):**
  ```json
  {
    "status": "fail",
    "message": "Email already exists"
  }
  ```

  ### B. User Account Login
Authenticates credentials and issues a secure application token.
* **Method & Route**: `POST /api/auth/login`

**Request Body JSON:**
```json
{
  "email": "joseph@example.com",
  "password": "SecurePassword123#"
}
```

**✅ Success Response (`200 OK`):**
```json
{
  "status": "success",
  "message": "login successfull",
  "data": {
    "id": "cmqrcmj0t0000w230mbzszdto",
    "name": "Joseph",
    "email": "joseph@example.com",
    "profileComplited": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....."
}
```

---

### C. Update Profile
update your profile by adding profile image,skills, bio e.t.c
* **Method & Route**: `PATCH /api/auth/update-profile`
* **Header**: ```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
**Request Body JSON:**
```json
{
  "state": "Lagos",
  "city": "Ikeja",
  "bio": "Full-stack mobile engineer building cross-platform social engines.",
  "skills": [
    "React Native",
    "NodeJS",
    "Postgres"
  ]
}
```

**✅ Success Response (`200 OK`):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "id": "cmqrcmj0t0000w230mbzszdto",
    "name": "Joseph",
    "email": "joseph@example.com",
    "role": "user",
    "bio": "Full-stack mobile engineer building cross-platform social engines.",
    "state": "Lagos",
    "city": "Ikeja",
    "skills": [
      "React Native",
      "NodeJS",
      "Postgres"
    ],
    "profileImage": null,
    "profileCompleted": false,
    "createdAt": "2026-06-24T00:42:24.064Z",
    "updatedAt": "2026-06-24T02:21:14.275Z"
  }
}
```
**❌ Possible Errors:**
* **Access-Token Error**
```json
{
  "error": "Invalid or expired token."
}
```
* **Input error**
```text
if any input field is empty it we throw a field is required error
```
### D. Upload profile picture
 upload profile image to complete user profile
* **Method & Route**: `POST /api/auth/upload-profile-image`
* **Content-Type**: `multipart/form-data`
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
**Request Body JSON**:
 ```text
    Key: image  ->  [Binary File: my_avatar.jpg]
 ``` 
**✅ Success Response (`200 OK`):**

```json
{
    "status":"success",
    "message":"Profile picture uploaded successfully!",
    "data":{
        "id":"cmqrcmj0t0000w230mbzszdto",
        "name":"Joseph",
        "email":"joseph@example.com",
        "role":"user",
        "bio":"Full-stack mobile engineer building cross-platform social engines.",
        "state":"Lagos","city":"Ikeja","skills":["React Native","NodeJS","Postgres"],
        "profileImage":"https://res.cloudinary.com/dim1tmtiy/image/upload/v1782269083/linkup_profiles/vecufks15dgtypkrgwci.jpg",
        "profileCompleted":true,
        "createdAt":"2026-06-24T00:42:24.064Z",
        "updatedAt":"2026-06-24T02:44:43.775Z"
        }}
```
### E. Change password
 **Method & Route**: `PATCH /api/auth/change-password`
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
**Request Body JSON:**
```json
    {
  "old_password": "SecurePassword123#",
  "new_password":"Amgreat27#"
}
```

**✅ Success Response (`200 OK`):**

```json
    {
  "status": "success",
  "message": "password updated sucessfully"
}
```
### F. Logout
 **Method & Route**: `POST /api/auth/logout`
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```