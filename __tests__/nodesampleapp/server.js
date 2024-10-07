const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    console.log('Hello endpoint called!');
    res.send('Hello from NodeJs App, Heyyy!')
})

app.get('/dummy', (req, res) => {
    console.log('Dummy endpoint called!');
    var s = process.env.DUMMY_APPSETTING || "Appsetting not Found";
    res.send(s)
})

app.get('/placeholder', (req, res) => {
    console.log('Placeholder endpoint called!');
    res.send('<<<node-place-holder>>>');
})

app.listen(port, () => console.log('Listening on port %s', port));