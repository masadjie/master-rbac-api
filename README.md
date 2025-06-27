---

# Master RBAC API | Node.js & MongoDB

An advanced Role-Based Access Control (RBAC) API built with **Node.js** and **MongoDB**. This API provides secure authentication and authorization through JWT, with a focus on role management and user permissions, allowing fine-grained access control to your resources.

---

## 🚀 Features

* **Role-Based Authentication**: Securely manage access with roles and permissions.
* **JWT Authentication**: Use JSON Web Tokens (JWT) for secure, stateless authentication.
* **Refresh Tokens**: Improve security with refresh tokens for seamless session management.
* **MongoDB Integration**: Store and manage users, roles, and permissions in MongoDB.
* **Seamless Seeding**: Pre-populate your database with essential data for testing or deployment.

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org/en/) (v12.x or later)
* [MongoDB](https://www.mongodb.com/) (local or a MongoDB Atlas account)
* Package manager: `npm` or `yarn`

---

## 🏗️ Setup

### 1. Clone the repository

Clone this repo to your local machine:

```bash
git clone https://github.com/yourusername/master-rbac-api.git
cd master-rbac-api
```

### 2. Install Dependencies

Run the following command to install all required dependencies:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file at the root of the project and include the following:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/djiecloud
JWT_SECRET=A0ZDFhCiaw1ztST/Q23eA7WOqxzA43taYVAaJC0U3Q2kfAKbkrG7tQ+502I9R2OqeYGz6JEsFHeb83rYCDE6Ag==
JWT_REFRESH_SECRET=gVJtWvYTui9zQtDDNmf52ujRKkvew4q4n5Y5IQQXSMQcjKZWihrgq/o9yqprXuHYdroMeEDDmXZzwkc87QBWVg==
```

* `MONGO_URI`: The URI for your MongoDB instance (local or cloud).
* `JWT_SECRET` and `JWT_REFRESH_SECRET`: Secret keys used to sign your JWT tokens.

### 4. Run the Application

To start the application in **development mode**:

```bash
npm run dev
```

For **production mode**:

```bash
npm run prod
```

### 5. Seed the Database (Optional)

If you want to populate your database with some initial data (users, roles, etc.), run:

```bash
npm run seed
```

### 6. Generate JWT Secret (Optional)

If you need to regenerate your JWT secret, use the following command:

```bash
npm run generate-secret
```

---

## 🔧 API Endpoints

### **Authentication**

* `POST /api/auth/register`: Register a new user.
* `POST /api/auth/login`: Log in to receive JWT tokens.
* `POST /api/auth/refresh-token`: Refresh your JWT access token using a valid refresh token.

### **Users**

* `GET /api/users`: List all registered users.
* `GET /api/users/:id`: Fetch a user by ID.
* `PUT /api/users/:id`: Update user information.
* `DELETE /api/users/:id`: Delete a user.

### **Roles and Permissions**

* `GET /api/roles`: List all available roles.
* `POST /api/roles`: Create a new role.
* `PUT /api/roles/:id`: Update an existing role.
* `DELETE /api/roles/:id`: Delete a role.

### **Middleware**

* **authMiddleware**: Verifies that the user is authenticated (JWT token).
* **roleMiddleware**: Ensures the user has the required role(s) to access the resource.

---

## 📑 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🚀 Contributing

We welcome contributions! Please fork this repository, submit issues, and send pull requests. Together, we can improve and expand the capabilities of this API.

---

## 💬 Contact

For any questions or support, feel free to open an issue or contact me via [bgdjie46@gmail.com](mailto:bgdjie46@gmail.com).

---

Let me know if you'd like further tweaks or additions!
