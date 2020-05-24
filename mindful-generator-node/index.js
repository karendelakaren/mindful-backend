const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const port = 4000

const app = express()

app.use(bodyParser.json());
app.use(cors({origin:true,credentials: true}));

app.get('/', (req, res) => {
  fs.readFile('../mindful.json', (err, data) => {
    if (err) throw err;
    let cues = JSON.parse(data);
    res.send(cues);
  });

})

app.post('/', function (req, res) {
  console.log(req.body)
  fs.writeFile('../mindful.json', JSON.stringify(req.body), (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
  res.send('Got a POST request')
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))