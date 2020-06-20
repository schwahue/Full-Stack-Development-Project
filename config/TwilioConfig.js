module.exports = {
    // HTTP port
    port: process.env.PORT || 5000,
    
    // Production Authy API key
    authyApiKey: process.env.UiAk5VYGnQ7fPb9oN2muBicAl2PjWM4J,

    // MongoDB connection string - MONGO_URL is for local dev,
    // MONGOLAB_URI is for the MongoLab add-on for Heroku deployment
    mongoUrl: process.env.MONGOLAB_URI || process.env.MONGO_URL
};