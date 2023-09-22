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

app.post("/detectarLabelS3",function(request, response) {
  aws.config.update({
    region: process.env.AWS_REGION
  });
  
  var rekognition = new aws.Rekognition(); 

  var nomeArquivo = request.body.foto; //nome do arquivo que está no S3 e "foto" é o nome do campo que está no form
  var params = {
    Image: {
      S3Object:{
        Bucket: process.env.AWS_BUCKET,
        Name: nomeArquivo
      }
    },
    MaxLabels: 50,
    MinConfidence: 85
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


app.post("/detectarModeracao", upload.single('myfile_moderar'),function(request, response) {
  aws.config.update({
    region: process.env.AWS_REGION
  });
  
  var rekognition = new aws.Rekognition(); 

  var arquivo = request.file.buffer;

  var params = {
    Image: {
      Bytes: arquivo
    },
    MinConfidence: 1
  };

  rekognition.detectModerationLabels(params, function(err, data) {
    if(err){
      console.log(err, err.stack);
    }else{
      console.log(data);
      
      var table = "<table border=1>";
      table += "<tr><th>Nome</th><th>Confiança</th></tr>";
      for(var i = 0; i < data.ModerationLabels.length; i++){
        table += "<tr><td>" + data.ModerationLabels[i].Name + "</td><td>" + data.ModerationLabels[i].Confidence + "</td></tr>";
      }
      table+= "</table>";

      response.send(table);

    }
  });

});

app.post("/analiseFacial", upload.single('myfile_facial'),function(request, response) {
  aws.config.update({
    region: process.env.AWS_REGION
  });
  
  var rekognition = new aws.Rekognition(); 

  var arquivo = request.file.buffer;

  var params = {
    Image: {
      Bytes: arquivo
    },
    Attributes: ['ALL']
  };

  rekognition.detectFaces(params, function(err, data) {
    if(err){
      console.log(err, err.stack);
    }else{
      console.log(data);
      
      var table = "<table border=1>";
      table += "<tr><th>Idade mínima</th><th>Idade máxima</th><th>Gênero</th><th>Sentimento</th></tr>";
      for(var i = 0; i < data.FaceDetails.length; i++){
        table += "<tr><td>" + data.FaceDetails[i].AgeRange.Low + "</td><td>" + data.FaceDetails[i].AgeRange.High + "</td>";
        table += "<td>" + data.FaceDetails[i].Gender.Value + "</td>";
        table += "<td>" + data.FaceDetails[i].Emotions[0].Type + "</td></tr>";

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
