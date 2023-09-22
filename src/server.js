// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();

// Config environment variables
require('dotenv').config({ path: `${__dirname}/.env` })

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended:true
}));

const aws = require('aws-sdk');

const multer = require('multer');
const upload = multer();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.post("/detectarLabels", upload.single('myfile'),function(request, response) {
  aws.config.update({
    region: process.env.AWS_REGION
  });
  
  var rekognition = new aws.Rekognition(); 

  var arquivo = request.file.buffer;
  var params = {
    Image: {
      Bytes: arquivo
    },
    MaxLabels: 50,
    MinConfidence: 70
  };

  rekognition.detectLabels(params, function(err, data) {
    if(err){
      console.log(err, err.stack);
    }else{
      console.log(data);
      
      var table = "<table border=1>";
      table += "<tr><th>Nome</th><th>Confiança</th></tr>";
      for(var i = 0; i < data.Labels.length; i++){
        table += "<tr><td>" + data.Labels[i].Name + "</td><td>" + data.Labels[i].Confidence + "</td></tr>";
      }
      table+= "</table>";

      response.send(table);

    }
  });

});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

// var rekognition = new aws.Rekognition(); 

// var params = {
//   Image: {
//     Bytes: new Buffer(request.body.image, 'base64')
//   },
//   MaxLabels: 10,
//   MinConfidence: 70
// };

// rekognition.detectLabels(params, function(err, data) {
//   if(err){
//     console.log(err, err.stack);
//   }else{
//     console.log(data);
//   }
