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
  Authorization: Bearer <ACCESS_TOKEN>
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
 ---

## 📝 2. Posts & Feed Interface (`/api/posts`)

### A. Create a New Post
Creates a new service or help post entry in the database. 
* **Method & Route**: `POST /api/posts/upload-post`
* **Content-Type**: `multipart/form-data` *(Required if attaching an image file via Multer)*
* **File Key**: `image` (Optional, allowed formats: `.jpg`, `.jpeg`, `.png`, `.img`)
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```

**Required Request Body Fields (JSON/Form representation):**
* `title` (**Required**, String) — Title of the post.
* `description` (**Required**, String) — Detailed breakdown of the task or job.
* `state` (**Required**, String) — State where the post applies.
* `city` (**Required**, String) — City where the post applies.
* `category` (**Required**, String) — The domain category (e.g., "Tech", "Education").
* `helpType` (**Required**, Enum) — Must match either `"VIRTUAL"` or `"PHYSICAL"`.
* `maxApplicant` (**Required**, Integer) — Maximum number of users allowed to apply before the post locks.
* `tags` (**Required**, Array of Strings) — Key tags related to the post (e.g., `["remote", "developer"]`).
* `country` (*Optional*, String) — Country location parameter (Defaults to home country if omitted).

**Example Conceptual Request Payload Snapshot:**
```json
{
  "title": "Need Urgent Math Tutor",
  "description": "Looking for an experienced tutor to help with high school calculus preparations.",
  "state": "Lagos",
  "city": "Ikeja",
  "category": "Education",
  "helpType": "PHYSICAL",
  "maxApplicant": 5,
  "tags": ["tutor", "calculus", "math"],
  "country": "Nigeria",
  "image": "[Binary Image File Upload]"
}
```

**✅ Success Response (`201 Created`):**
```json
{
  "status": "success",
  "message": "Post created and published successfully.",
  "data": {
    "id": "cmq4p5fsz0008w2eovc4y522b",
    "title": "Need Urgent Math Tutor",
    "description": "Looking for an experienced tutor to help with high school calculus preparations.",
    "state": "Lagos",
    "city": "Ikeja",
    "country": "Nigeria",
    "category": "Education",
    "helpType": "PHYSICAL",
    "maxApplicant": 5,
    "tags": ["tutor", "calculus", "math"],
    "image": "https://cloudinary.com",
    "userId": "user_cmq123xyz",
    "isClosed": false,
    "createdAt": "2026-06-24T04:23:00.000Z"
  }
}
```
---
### B. Get user personal post
Retrieves a list of all posts created exclusively by the currently authenticated user using classic row-skipping pagination.
* **Method & Route**: `GET /api/posts/my-posts`
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
* **URL Query Parameters**:
  * `page` (*Optional*, Integer, Default: `1`): The specific page number block to retrieve.
  * `limit` (*Optional*, Integer, Default: `20`): Maximum records per request page.

**Example Request URL**: `/api/posts/my-posts?page=2&limit=10`

**✅ Success Response (`200 OK`):**
```json
{
  "status": "success",
  "result": 1,
  "data": [ ... ],
  "pagination": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```
---
### C. Retrieve login user all applicant
Retrieves a list of all posts  currently authenticated user have applied for using classic row-skipping pagination.
* **Method & Route**: `GET /api/posts/my-applicants`
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
* **URL Query Parameters**:
  * `page` (*Optional*, Integer, Default: `1`): The specific page number block to retrieve.
  * `limit` (*Optional*, Integer, Default: `20`): Maximum records per request page.

**Example Request URL**: `/api/posts/my-applicants?page=2&limit=10`

**✅ Success Response (`200 OK`):**
```json
  {
    "status": "succes",
    "message": "Application retrieve successfully",
    "result": 4,
    "data": [...],
    "pagination": {
          "totalItems": 4,
          "totalPages": 1,
          "currentPage": 1,
          "limit": 10,
          "hasNextPage": false,
          "hasPreviousPage": false
        }
  }
```
---

### D. Get All open Request
* **Method & Route**: `GET /api/posts/all-posts`
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
* **URL Query Parameters**:
  * `limit` (*Optional*, Integer, Default: `20`): Maximum records per request page.
   * `cursor` (Optional, string ID of the last post loaded on screen)

**Example Request URL**: `/api/posts/all-post?limit=2&cursor=cmq4p0j8g00....`

**✅ Success Response (`200 OK`):**
```json
  {
  "status": "success",
  "results": 1,
  "data": [...],
  "pagination": {
    "nextCursor": "cmq4p2hkf0005w2eovdxzlucw",
    "hasNextPage": true
  }
}
```
---

### E. Delete specific request made by owner 
* **Method & Route**: `DELETE /api/posts/:postId/remove-post`
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
**Example Request URL**: `/api/posts/cmq4p0j8g00..../remove-post`  

**✅ Success Response (`200 OK`):**
```json
{
  "status": "success",
  "message": "The help request  has been permanently deleted."
}
```

### F. Close Request to marked it Resolved 
* **Method & Route**: `PATCH /api/posts/:postId/close`
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
**Example Request URL**: `/api/posts/cmq4p0j8g00..../close`  

**✅ Success Response (`200 OK`):**
```json
{
  "status": "success",
  "message": "Help request successfully closed!",
  "data":{...}
}
```
---

### G. Apply To Resolve a request 
* **Method & Route**: `POST /api/posts/:postId/apply`
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
**Example Request URL**: `/api/posts/cmq4p0j8g00..../apply`  

**✅ Success Response (`200 OK`):**
```json
{
  "status": "success",
  "message": "Your offer to help has been submitted!",
  "data":{...}
}
```
### H. Request owner view all applican 
* **Method & Route**: `POST /api/posts/:postId/responses`
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
**Example Request URL**: `/api/posts/cmq4p0j8g00..../responses`  

**✅ Success Response (`200 OK`):**
```json
{
  "status": "success",
  "message": "Successfully retrieved applicants for \"Reading Desk Repair\"",
  "results": 0,
  "data":[...]
}
```
---
### I. Accepting or Rejecting of apllicants 
* **Method & Route**: `POST /api/posts/responses/:responseId/review`
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
**Example Request URL**: `/api/posts/responses/cmq4p0j8g00..../review`

### J. Search for specific post
Search for any request posted by keywords, tags, categories e.t.c
* **Method & Route**: `GET /api/posts/search-post`
* **Query Params**: 
`query` (Required string keyword),
 `cursor` (Optional string ID),
 `page` (Optional Int default:1)
 * **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```

**Example URL**: `/api/posts/search-post?query=reading&cursor=cmq4p0j8g00....`

---

## 💬 Messaging Interface (`/api/message`)

### 1. Send message 
Send any message to request owner or request owner send message to accepted applicant
* **Method & Route**: `POST /api/message/send-message` 
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
**Request Body JSON:**
```json
    {
    "conversationId": "cmq4p0j8g00....",
    "text":"Hello I'm Joseph fikayo Ajala "
  }
```
**✅ Success Response (`200 OK`):**
```json
{
  "status": "success",
  "message": "Message delivered successfully",
  "data":{...}
}
```
### 2. Get all conversations that have been created 
* **Method & Route**: `GET /api/message/get-conversations` 
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```
  * **Query Params**: 
 `cursor` (Optional string ID),
 `page` (Optional Int default:1)

 **Example URL**: `/api/message/get-conversations?page=1&cursor=cvngh....`

 ---

 ### 3. Retrieve all messages between post owner and accepted applicant from the database  
* **Method & Route**: `GET /api/message/:conversationId/get-message` 
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```

 **Example URL**: `/api/message/cvngh..../get-message`

 ---

 ### 4. Retrieve all unread  messages between post owner and accepted applicant from the database  
* **Method & Route**: `GET /api/message/:conversationId/latest-message` 
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```

 **Example URL**: `/api/message/cvngh..../latest-message`

 ---

 ### 5. Delete message sent
* **Method & Route**: `DELETE /api/message/:messageId/delete-message` 
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
  ```

 **Example URL**: `/api/message/cvngh..../delete-message`

 ---

 ### user profile data
 Retrieve user profile data from the database 
 * **Method & Route**: `GET /api/users/me` 
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
```
### Refresh Token
Regenerate another access token once it expired
* **Method & Route**: `POST /api/refresh-token`
* **Header**: 
```text
  Authorization: Bearer <ACCESS_TOKEN>
```