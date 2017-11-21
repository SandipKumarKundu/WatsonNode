

var express=require('express');
var app=express();
var path = require('path');
var watson=require('.//app.js');
var Sync = require('sync');//synchronising
const Log = require('.//Log');//Calling Log Js
//var FacebookMessanger=require('.//messenger-webhook/Webhook')
app.use(express.static(__dirname + '/public'));
var router = express.Router();
var  message=[{"Type":"Received","Author":"Watson","Text":"This is watson","TimeStamp":new Date()}]
let CryptoJS =require('crypto-js');
const fs = require('.//Log');//Calling Node Fs
//TimeOut ----------
const util = require('util');
let StartOfConv=false; 
let ContextVariable=[];//Capture all context variables
let Context={};
router.get('/',function(req,res){
    
    res.sendFile(path.join(__dirname, '/', 'public','/','Views', 'index.html'));

});

var bodyParser = require('body-parser');// to read data from req.body
//var multer = require('multer');//to read objectified data
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
var sentdata={};
var  message=[]

app.post('/watson',function (req, res, next) {
  var keySize = 256;
  var ivSize = 128;
  var iterations = 100;
  var password = "Secret Password";
  function decrypt (transitmessage, pass) {
    var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
    var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
    var encrypted = transitmessage.substring(64);
    
    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize/32,
        iterations: iterations
      });
  
    var decrypted = CryptoJS.AES.decrypt(encrypted, key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
      
    })
    return decrypted;
  }
 
let ReceivedData={};

    // decrypted = decrypt(req.query.y, password);
    // ReceivedData.Text = decrypted.toString(CryptoJS.enc.Utf8);
    // decrypted = decrypt(req.query.z, password);
    // ReceivedData.Author = decrypted.toString(CryptoJS.enc.Utf8);
    ReceivedData.Author=req.query.z;
    ReceivedData.Text=req.query.y;
    ReceivedData.Time=new Date();
     ReceivedData.Type="Sent";
     let start=req.query.m;
    //console.log("start"+start+"Typew of start"+typeof(start));
    setTimeout(function(){ var str=new Date()+"   "+"Author : "+ ReceivedData.Author + "   Message :  "+ ReceivedData.Text+"\r\n" 
    Log.CreateLog(str);

console.log("decrypted"+JSON.stringify(ReceivedData));
if(start=="true"){
  console.log("This is start of message");
  watson.message({
    input:{ text: '' },
    workspace_id: '6158aa0e-620c-4d57-aa03-e9bca3462dbb'
}, function(err, response) {
    if (err) {
      console.error(err);
    } else {
            var text='';
        sentdata.Author="Watson";
        sentdata.Type="Received";
        if(response.output.text.length>1){
            for(data in response.output.text ){
            text=text+'\n'+response.output.text[data];
            }
        }
        else
        text=response.output.text[0];
        Context=response.context;
        StartOfConv=response.context.StartOfConv;
        sentdata.Text=text;
        sentdata.Time=new Date();
        console.log(JSON.stringify(response));
        var str=new Date()+"   "+"Author : "+ "Watson" + "   Message :  "+ sentdata.Text+"\r\n" 
        Log.CreateLog(str);
    
        res.json(sentdata);
    }
}); 

}


          else{
            console.log("After Start conversation");
         watson.message({
            input:{ text: ReceivedData.Text },
            workspace_id: '6158aa0e-620c-4d57-aa03-e9bca3462dbb',
            context:Context  
        }, function(err, response) {
            if (err) {
              console.error(err);
            } else {
              Context=response.context;
                    var text='';
                sentdata.Author="Watson";
                sentdata.Type="Received";
                if(response.output.text.length>1){
                    for(data in response.output.text ){
                    text=text+'\n'+response.output.text[data];
                    }
                }
                else
                text=response.output.text[0];
                let action=response.output.action;
                if(action!=null||action!=undefined){
                  //callAction(action);
                  if(action[0]=="ConfirmCarbooking"){
                    response.context.CarBookingDate=null;
                    response.context.CarBookingTime=null;
                    response.context.CarBookingConfirmation=null;
                  }
                  console.log("Actions is"+action);
                }
                sentdata.Text=text;
                sentdata.Time=new Date();
                console.log(JSON.stringify(response));
                var str=new Date()+"   "+"Author : "+ "Watson" + "   Message :  "+ sentdata.Text+"\r\n" 
                Log.CreateLog(str);
                
                res.json(sentdata);
            }
          
        }); 
      }//End of else
 }, 300);


           
res.sendStatus;
  });


app.post('/webhook', (req, res) => {  
    
     let body = req.body;
   
     // Checks this is an event from a page subscription
     if (body.object === 'page') {
   
       // Iterates over each entry - there may be multiple if batched
       body.entry.forEach(function(entry) {
   
         // Gets the message. entry.messaging is an array, but 
         // will only ever contain one message, so we get index 0
         let webhookEvent = entry.messaging[0];
         console.log(webhookEvent);
       });
   
       // Returns a '200 OK' response to all requests
       res.status(200).send('EVENT_RECEIVED');
     } else {
       // Returns a '404 Not Found' if event is not from a page subscription
       res.sendStatus(404);
     }
   
   });


   // Adds support for GET requests to our webhook
   app.get('/webhook', (req, res) => {
    
      // Your verify token. Should be a random string.
      let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"
        
      // Parse the query params
      let mode = req.query['hub.mode'];
      let token = req.query['hub.verify_token'];
      let challenge = req.query['hub.challenge'];
        
      // Checks if a token and mode is in the query string of the request
      if (mode && token) {
      
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
          
          // Responds with the challenge token from the request
          console.log('WEBHOOK_VERIFIED');
          res.status(200).send(challenge);
        
        } else {
          // Responds with '403 Forbidden' if verify tokens do not match
          res.sendStatus(403);      
        }
      }
    });
  
//console.log(path.join(__dirname));
app.use('/',router);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
console.log(process.env);
app.listen(3001);
//console.log(process.env);
module.exports=app;