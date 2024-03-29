const { signUp } = require('../controller/Auth/userController');
const User = require('../models/user');


    // Returns a 200 status code and a success message when the username is available.
    it('should return a 200 status code and a success message when the username is available', async () => {
      const req = { params: { username: 'abdullah' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const User = require('../../models/userModel');
      User.findOne = jest.fn().mockResolvedValue(null);

      await userExist(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Username is available',
      });
    });

        // Returns an error message if email is invalid
        it('should return an error message when email is invalid', async () => {
          const req = {
            body: {
              username: 'testuser',
              email: 'invalidemail',
              password: 'Test1234',
            },
          };
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };
    
          await signUp(req, res);
    
          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({
            message: 'Invalid email address',
          });
        });



