const User = require('../models/User'); 
// Import the User model to read/write users from the database.

const { hashPassword, comparePassword } = require('../utils/password');  
// Import helper functions: hashPassword to securely hash a plain password,
// comparePassword to check a login password against a stored hash. 

const { generateToken } = require('../utils/jwt'); 
// Import a function that creates a signed JWT token for a user.]




// POST /api/auth/register
const register = async (req, res) => {  
  // Controller function for the registration endpoint.
  // It receives the HTTP request (req) and sends back a response (res).
  try {
    const { name, email, password } = req.body;    
    // Extract name, email, and password sent by the client in the JSON body.

            // 1) Basic validation
    if (!name || !email || !password) { 
      // If any required field is missing, return 400 Bad Request with a message.
      return res.status(400).json({
        message: 'Name, email, and password are required',
      });
    }


        // 2) Check if user already exists
    const existingUser = await User.findByEmail(email);  
    // Query the database using the User model to see if a user with this email already exists.
    if (existingUser) {
      // If a user is found, return 409 Conflict because the email is already registered.
      return res.status(409).json({
        message: 'Email is already registered',
      });
    }

    // 3) Hash password
    const hashedPassword = await hashPassword(password); 
    // Take the plain password from the request and hash it with bcrypt
    // so we never store raw passwords in the database. [web:443][web:445]


    //Create USER in database

    const user  = await  User.create ({


        name,
        email,
        password: hashedPassword, // password table  but have hashed password

    });


    
    //Generate Token
const token = generateToken({ userId: createdUser.id }); 


 //Send response back to client
return res.status(201).json({
  message: 'User registered successfully',
  user: {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
  },
  token,
});

} catch (err) {
  console.log(err);
  return res.status(500).json({ error: err.message });
}
};
   /*



// GET /api/auth/me  (requires auth middleware)
const getMe = async (req, res) => {
  try {
    // auth middleware will put user object on req.user
    if (!req.user) {
      return res.status(401).json({
        message: 'Not authenticated',
      });
    }

    return res.json({
      user: req.user,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({
      message: 'Server error fetching current user',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};


   */