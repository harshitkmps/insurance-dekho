//setup agenda for scheduling task
const Agenda = require('agenda');
const dbURL = config.mongodb.uri;
const agenda = new Agenda({
    db: {address: dbURL, collection: 'scheduler'},
    processEvery: '5 seconds',
    useUnifiedTopology: true,
    defaultLockLifetime: 10000,
});
global.agenda = agenda;