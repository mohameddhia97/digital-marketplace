const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Post = require('../models/Post');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Connected');
  seedDatabase();
}).catch(err => {
  console.error('Error connecting to database:', err);
  process.exit(1);
});

// Seed database with initial data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Post.deleteMany({});

    console.log('Previous data cleared');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      profile: {
        bio: 'Administrator of the marketplace'
      }
    });

    console.log('Admin user created');

    // Create test user
    const hashedUserPassword = await bcrypt.hash('password123', salt);
    
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedUserPassword,
      profile: {
        bio: 'I am a test user on this platform. I love digital goods and gaming!'
      }
    });

    console.log('Test user created');

    // Create categories
    const categories = await Category.insertMany([
      {
        name: 'Digital Goods',
        slug: 'digital-goods',
        description: 'Digital products, software, games, and more',
        icon: 'shopping-bag',
        order: 1
      },
      {
        name: 'Services',
        slug: 'services',
        description: 'Digital services, consultations, and more',
        icon: 'briefcase',
        order: 2
      },
      {
        name: 'Tutorials',
        slug: 'tutorials',
        description: 'Guides, how-tos, and educational content',
        icon: 'book-open',
        order: 3
      },
      {
        name: 'Discussions',
        slug: 'discussions',
        description: 'General discussions and community topics',
        icon: 'message-circle',
        order: 4
      }
    ]);

    console.log('Categories created');

    // Create sample posts
    const posts = await Post.insertMany([
      {
        title: 'Selling Premium UI Kit - Dark Theme',
        content: 'This premium UI kit includes over 200 components for web and mobile apps. Dark theme optimized for modern applications.',
        author: admin._id,
        category: categories[0]._id,
        tags: ['design', 'ui', 'dark-theme'],
        price: 49.99,
        isFree: false
      },
      {
        title: 'Free Photoshop Actions Pack',
        content: 'Download my free pack of 20 Photoshop actions for photo editing. Great for portraits and landscapes.',
        author: user._id,
        category: categories[0]._id,
        tags: ['photoshop', 'freebie', 'design'],
        isFree: true
      },
      {
        title: 'Web Development Services',
        content: 'Professional web development services. I specialize in React, Node.js, and MongoDB applications.',
        author: admin._id,
        category: categories[1]._id,
        tags: ['development', 'web', 'services'],
        price: 75,
        isFree: false
      },
      {
        title: 'Beginner Guide: How to Set Up Your Development Environment',
        content: 'A complete guide for beginners on setting up a development environment for web development.',
        author: admin._id,
        category: categories[2]._id,
        tags: ['tutorial', 'beginners', 'development'],
        isFree: true
      },
      {
        title: 'What programming language should I learn in 2025?',
        content: 'Looking for recommendations on which programming language to learn as a beginner in 2025.',
        author: user._id,
        category: categories[3]._id,
        tags: ['discussion', 'programming', 'beginners'],
        isFree: true
      }
    ]);

    console.log('Sample posts created');

    // Update user post counts
    await User.findByIdAndUpdate(admin._id, {
      $set: { postCount: 3 }
    });
    
    await User.findByIdAndUpdate(user._id, {
      $set: { postCount: 2 }
    });

    console.log('User post counts updated');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};