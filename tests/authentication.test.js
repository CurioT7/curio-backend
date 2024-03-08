const { signUp } = require('../controller/Auth/userController');
const User = require('../models/user');
// describe('signUp function', () => {
//     it('should create a new user when valid username, email, and password are provided', async () => {
//       // Mock request with sample data
//       const req = {
//         body: {
//           username: 'testuser',
//           email: 'testuser@example.com',
//           password: 'password123'
//         }
//       };
  
//       // Mock response with Jest's mock functions
//       const res = {
//         status: jest.fn().mockReturnThis(), // Mock the status method
//         json: jest.fn() // Mock the json method
//       };
  
//       // Call the signUp function with the mock request and response
//       await signUp(req, res);
  
//       // Assert that the response status is set to 201 (Created)
//       expect(res.status).toHaveBeenCalledWith(201);
  
//       // Assert that the response JSON matches the expected success message
//       expect(res.json).toHaveBeenCalledWith({ success: true, message: "User created successfully" });
//     }, 50000);
//     });
  

//     // Creating a new user with all required fields should successfully save to the database.
//     it('should successfully save a new user with all required fields', async () => {
//         const newUser = new User({
//           username: 'testuser',
//           email: 'testuser@example.com',
//           password: 'password123'
//         });
//         const savedUser = await newUser.save();
//         expect(savedUser._id).toBeDefined();
//         expect(savedUser.username).toBe(newUser.username);
//         expect(savedUser.email).toBe(newUser.email);
//         expect(savedUser.password).toBe(newUser.password);
//         });

