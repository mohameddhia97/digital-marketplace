// In MongoDB shell or using this script (updateRole.js)
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // Replace with your working email
      const user = await User.findOne({ email: 'jay@example.com' });
      
      if (!user) {
        console.log('User not found');
        return;
      }
      
      // Update role to admin
      user.role = 'admin';
      await user.save();
      
      console.log('User role updated to admin');
    } catch (error) {
      console.error('Error updating role:', error);
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
    process.exit(1);
});