# SmartScore Backend

SmartScore is a comprehensive school result management system. This backend service is built using Node.js, Express, PostgreSQL, and Prisma ORM.

## Project Setup

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v14 or higher)
- **PostgreSQL** (v13 or higher)
- **Git**
- **npm** (comes with Node.js)
  
### 1. Clone the Repository

Start by cloning the project repository from GitHub:

```bash
git clone https://github.com/your-username/smartscore-backend.git
```

Then navigate into the project directory:

```bash
cd smartscore-backend
```

### 2. Install Dependencies

To install all the project dependencies, run:

```bash
npm install
```

### 3. Set Up Environment Variables

You need to create a `.env` file that holds your environment-specific variables. An example of these variables is provided in `.env.example`.

To quickly create your `.env` file, run:

```bash
npm run setup-env
```

Once the file is created, you can open the `.env` file and replace the placeholder values with your actual configurations.

### 4. Create PostgreSQL Database

Ensure that PostgreSQL is installed and running on your local machine. You can create the `smartscore` database manually by logging into PostgreSQL with the following commands:

```bash
psql -U postgres
CREATE DATABASE smartscore;
```

### 5. Initialize Prisma (ORM)

After setting up the environment and database, run Prisma migration to sync the schema with your PostgreSQL database:

```bash
npx prisma migrate dev --name init
```

This will apply any pending migrations to your database and ensure Prisma is correctly set up.

### 6. Running the Project

Now you're ready to start the development server. Run:

```bash
npm run start
```

The server will start on the port specified in the `.env` file (default is `3000`).

You can access the API by visiting:

```
http://localhost:3000
```

### 7. Development Mode with Nodemon

If you want the server to restart automatically upon detecting code changes, use:

```bash
npm run dev
```

### 8. Accessing the Prisma Studio (Optional)

To interact with your database through a visual interface, you can use Prisma Studio:

```bash
npx prisma studio
```

### Technologies Used

- **Node.js**: JavaScript runtime for backend
- **Express.js**: Web framework for Node.js
- **PostgreSQL**: Relational database system
- **Prisma ORM**: Database toolkit
- **Nodemon**: Automatically restarts the server on file changes
- **Twilio & SendGrid** (for notifications)
- **Docker, AWS** (for infrastructure)

---

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---

### Contributors

- [Tom Daniel](https://github.com/tomdan-ai)

### Steps Explained:
1. **Clone the Repository**: How to get the project on their local machine.
2. **Install Dependencies**: Install the packages using `npm install`.
3. **Set Up Environment Variables**: Guide to setting up environment variables using `.env.example`.
4. **Create PostgreSQL Database**: Help users create the required database.
5. **Initialize Prisma**: Run Prisma migration to sync the database.
6. **Run the Project**: Instructions for starting the server and accessing the API.
7. **Development Mode with Nodemon**: Guidance on how to use `nodemon` for automatic restarts.
8. **Accessing Prisma Studio**: (Optional) How to use Prisma Studio to interact with the database.