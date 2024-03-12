require("dotenv").config();
const User = require("../../models/user");


async function getMe(req, res) {
  const {username} = req.body;

  try {
    const userExists = await User.findOne({ username }); 
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }
    const response = {
        username: userExists.username,
        gender: userExists.gender ||'N/A',
        language: userExists.language || 'N/A',
        email: userExists.email || 'N/A' 
      };
  
      res.json(response);

    } 
    catch (error) {
         return res.status(500).json({ 
            success: false,
            message: error.message });
     }
    

};
module.exports = { getMe };
