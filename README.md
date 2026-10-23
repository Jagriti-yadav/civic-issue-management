# 🏛️ SmartCivic — Civic Issue Management System

SmartCivic is a web-based civic issue management platform designed to streamline the process of reporting, tracking, assigning, and resolving civic issues. It connects citizens with the relevant authorities, helping improve transparency, accountability, and efficiency in public service delivery.

The platform provides role-based portals for citizens, officers, department heads, and super administrators to manage complaints throughout their lifecycle.

## ✨ Features

### 👤 Citizen Portal

* User registration and login.
* Submit civic complaints.
* Track complaint status.
* View submitted complaints.
* Access relevant notifications.
* Manage profile information.

### 🛠️ Officer Portal

* View complaints assigned to the officer.
* Monitor assigned complaint details.
* Update complaint progress and status.
* Add remarks and resolution updates.
* View relevant notifications.
* Manage profile information.

### 🏢 Department Head Portal

* Department-specific dashboard.
* View departmental complaint statistics.
* Monitor complaints within the department.
* Access department officers and their workloads.
* Support complaint assignment and progress monitoring.

*Note: Department Head features are under development. Only features implemented and verified in the current version should be considered functional.*

### 🔐 Super Admin Portal

* Oversee complaint management.
* Manage complaint assignments.
* Access administrative dashboards and analytics.
* Support system-wide monitoring and administration.

*The availability of individual administrative features depends on the current implementation.*

## 🔄 Complaint Management Workflow

1. **Complaint Submission:** A citizen submits a complaint with the relevant details.
2. **Complaint Registration:** The system stores the complaint in the database and generates a complaint identifier, if configured.
3. **Department Assignment:** The complaint is assigned to the appropriate department.
4. **Officer Assignment:** An authorized administrator or department head assigns the complaint to an eligible officer.
5. **Progress Tracking:** The officer updates the complaint status and adds remarks.
6. **Resolution:** The complaint is marked as resolved when the issue has been addressed.
7. **Status Monitoring:** Authorized users can monitor complaint progress through their respective portals.

The exact workflow depends on the implemented backend rules and authorization permissions.

## 🧰 Technology Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* JavaScript

### Backend

* Node.js
* Express.js
* REST APIs
* JWT-based authentication

### Database

* MongoDB
* Mongoose

### Development Tools

* Visual Studio Code
* Git and GitHub
* Postman
* MongoDB Compass

## 📁 Project Structure

The following is an example structure. Adjust it to match the actual folders in your repository.

```text
SmartCivic/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

* [Node.js](https://nodejs.org/)
* npm, which is included with Node.js
* [MongoDB](https://www.mongodb.com/) local installation or a MongoDB Atlas account
* Git

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd SmartCivic
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your actual GitHub repository URL.

### 2. Install Frontend Dependencies

Navigate to the frontend directory:

```bash
cd client
npm install
```

Create the frontend `.env` file if your frontend requires environment variables.

If a `.env.example` file exists, copy it:

```powershell
Copy-Item .env.example .env
```

Configure the required values in `.env`.

For Vite, frontend environment variables exposed to browser code generally use the `VITE_` prefix. Never place private credentials or server-side secrets in frontend environment variables.

### 3. Install Backend Dependencies

Open another terminal and navigate to the backend directory:

```bash
cd server
npm install
```

Create the backend environment file:

```powershell
Copy-Item .env.example .env
```

Update the values according to your backend configuration.

Example environment variables:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret
```

**Important:** These names are examples. Use the exact variable names referenced by your existing backend code. For example, your application might use `MONGO_URI` instead of `MONGODB_URI`.

Never commit your actual `.env` file or expose database credentials and JWT secrets in GitHub.

### 4. Configure MongoDB

Configure your MongoDB connection string in the backend `.env` file.

For MongoDB Atlas, use the connection string provided by your database configuration.

For a local MongoDB instance, the connection string might resemble:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/smart_civic
```

Ensure your MongoDB instance is running and the database user has the required permissions.

The application may create collections automatically when records are inserted, depending on the Mongoose configuration and models.

### 5. Run the Backend

From the backend directory:

```bash
npm run dev
```

Use this command if your backend's `package.json` defines a `dev` script.

Otherwise, use the appropriate script defined in your backend `package.json`, such as:

```bash
npm start
```

### 6. Run the Frontend

From the frontend directory, open another terminal:

```bash
npm run dev
```

Vite will display the local development URL in the terminal, usually:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

**Note:** The frontend API configuration must point to the backend's actual address and port.

## 🔑 Authentication and Authorization

SmartCivic uses authentication and role-based access to provide different interfaces for different users.

The intended roles are:

| Role            | Purpose                                      |
| --------------- | -------------------------------------------- |
| Citizen         | Submit and track civic complaints            |
| Officer         | Manage assigned complaints                   |
| Department Head | Monitor departmental complaints and officers |
| Super Admin     | Oversee system-wide operations               |

Protected backend endpoints should verify authentication and enforce the relevant role and department permissions.

## 🗄️ Database

MongoDB is used to persist application data.

Depending on the current implementation, the database may contain records for:

* Users
* Complaints
* Departments
* Notifications
* Other application entities

The actual collections and their fields are defined by the project's Mongoose models.

## 🧪 Testing

Recommended testing activities include:

* Registering a new citizen account.
* Logging in with valid credentials.
* Submitting and tracking a complaint.
* Verifying that complaints persist in MongoDB.
* Testing complaint assignment and status updates.
* Verifying role-based access to protected endpoints.
* Confirming that users cannot access data belonging to unauthorized departments.
* Testing API endpoints with Postman.
* Running the frontend production build.

Run the frontend build from the frontend directory:

```bash
npm run build
```

Run automated tests if test scripts are configured in the relevant `package.json` files.

## 🔒 Environment Variables and Security

* Keep `.env` files out of version control.
* Commit `.env.example` files containing placeholders instead of real credentials.
* Never expose MongoDB credentials or JWT secrets in frontend code.
* Use strong secrets and rotate any credentials that have been exposed.
* Restrict database access using appropriate permissions.
* Validate and authorize requests on the backend.
* Configure CORS for trusted origins in production.

## 🚀 Future Enhancements

Potential enhancements include:

* Fully integrated Department Head dashboard and complaint management.
* Interactive maps for precise complaint locations.
* Location-based department assignment.
* AI-assisted complaint classification.
* Automated complaint prioritization.
* Real-time notifications.
* Analytics and performance reporting.
* Improved mobile responsiveness.
* Production deployment and monitoring.

These are planned enhancements, not a claim that all features are currently implemented.

## 🤝 Contributing

Contributions from teammates are welcome.

1. Clone the repository.
2. Create a feature branch.
3. Implement your changes.
4. Test the changes locally.
5. Commit your work with a descriptive message.
6. Push the branch to GitHub.
7. Open a pull request for review.

Do not commit environment files, credentials, or unrelated generated files.

## 👩‍💻 Project Information

**Project Name:** SmartCivic — Civic Issue Management System

**Project Type:** Full-Stack Web Application

**Architecture:** MERN Stack

**Purpose:** To improve civic complaint reporting, tracking, assignment, and resolution through a centralized digital platform.

---

*Built with React, Node.js, Express, and MongoDB.*
