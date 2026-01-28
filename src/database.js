import { Sequelize } from 'sequelize';

// Database connection configuration
const sequelize = new Sequelize('wkesselr_db1', 'wkesselr', 'Securitas2025!', {
  host: 'localhost',
  dialect: 'postgres',
});

// Define a model for your data
const User = sequelize.define('User', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

// Define a model for your time series event log
const EventLog = sequelize.define('EventLog', {
  timestamp: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  event_type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  event_data: {
    type: Sequelize.JSONB,
    allowNull: false,
  },
});

// Function to initialize database and populate with sample data
const initializeDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync all models
    await sequelize.sync({ force: false });
    console.log('Database models synced.');

    // Check if EventLog has any data
    const eventCount = await EventLog.count();
    
    if (eventCount === 0) {
      // Populate EventLog with sample data
      await EventLog.bulkCreate([
        {
          timestamp: new Date(),
          event_type: 'login',
          event_data: { userId: 1, success: true },
        },
        {
          timestamp: new Date(Date.now() + 60000),
          event_type: 'user_action',
          event_data: { userId: 1, action: 'view_dashboard', duration: 30 },
        },
        {
          timestamp: new Date(Date.now() + 120000),
          event_type: 'logout',
          event_data: { userId: 1, session_duration: 120 },
        },
        {
          timestamp: new Date(Date.now() + 180000),
          event_type: 'login',
          event_data: { userId: 2, success: true },
        },
        {
          timestamp: new Date(Date.now() + 240000),
          event_type: 'error',
          event_data: { userId: 2, error_code: 500, message: 'Internal Server Error' },
        },
      ]);
      console.log('Sample event log data inserted.');
    } else {
      console.log(`Database already contains ${eventCount} events.`);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Call the function to initialize the database
initializeDatabase();

export { sequelize, User, EventLog };