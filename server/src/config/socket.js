const socketConfig = {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingINterval: 25000,
    transports: ['websocket', 'polling']
};

module.exports = socketConfig;