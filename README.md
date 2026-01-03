 Installation
bash
npm install 
Make sure you have MongoDB running locally or a connection string to a hosted MongoDB instance.

 Environment Variables
Create a .env file in your project root with:

Code
MONGO_URI=mongodb://localhost:27017/yourdbname
JWT_SECRETE=yourSuperSecretKey
EXPIRES_IN=1d
PORT=5000

RUN npm run dev


 Project Structure
Code
src/
 └── modules/
      └── user_module/
           ├── user_controller.js
           ├── user_routes.js
           └── user_validation.js
shared models/
 └── User_model.js
 User Model
js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, minlength: 5, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, minlength: 6, required: true },
    username: { type: String, minlength: 2, required: true },
    phone: { type: String, minlength: 10 },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UserSchema);
 Validation (Joi)
Register requires:

name (min 5 chars)

username (min 2 chars)

email (valid email)

password (min 6 chars)

phone (optional, min 6 chars)

Login requires:

main (username or email)

password (min 6 chars)

 Endpoints
Register User
POST /student/register

Request Body:

json
{
  "name": "Elikem James",
  "username": "elikem",
  "email": "elikem@example.com",
  "password": "secret123",
  "phone": "034444444444"
}
Response:

json
{
  "message": "user successfully registered",
  "newUser": {
    "email": "elikem@example.com",
    "name": "Elikem James",
    "username": "elikem",
    "phone": "034444444444"
  }
}
Login User
POST /student/login

Request Body (login by email):

json
{
  "main": "elikem@example.com",
  "password": "secret123"
}
Request Body (login by username):

json
{
  "main": "elikem",
  "password": "secret123"
}
Response:

json
{
  "message": "login was successful",
  "safe_user": {
    "id": "65a1234567890",
    "name": "Elikem James",
    "username": "elikem",
    "email": "elikem@example.com",
    "role": "student",
    "phone": "034444444444"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
 Notes
Passwords are hashed with bcrypt before saving.

JWT tokens include id, name, email, username, phone, and role.

Always send Content-Type: application/json in requests.

Phone numbers should be strings (quoted in JSON) to preserve leading zeros.

 Testing
Use Postman or curl:

