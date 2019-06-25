const endianness = require('convert-endianness');
var express = require("express");
var now = new Date();
var bodyParser = require("body-parser");
var app = express();
var mongoose = require("mongoose");
var Float = require('mongoose-float').loadType(mongoose , 8);


var serverDataSchema = new mongoose.Schema({
    parameter : String , 
    address : String , 
    hexValue : String ,
    value : {type : Float},
    date: { type: Date, default: Date.now },
    timeOfCreation : String
});
var serverData = mongoose.model("serverData" , serverDataSchema);
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://localhost/server_data" , {useNewUrlParser : true});

//Variables
const fs = require("fs");
var result = "";
var n = "";
var idArray =[];


//Reading Data
// fs.readFile("data3.txt"  , function(err,data){
//     if(err){
//         console.log(err);
//     }
//     result = result + data;   
//     var time =  now.getTime();
//     console.log(time);
//     parseData(String(result) , time);
// });

//Float Parser
function parseFloat(str) {
        var float = 0, sign, order, mantiss,exp,
        int = 0, multi = 1;
        if (/^0x/.exec(str)) {
            int = parseInt(str,16);
        }else{
            for (var i = str.length -1; i >=0; i -= 1) {
                if (str.charCodeAt(i)>255) {
                    console.log('Wrong string parametr'); 
                    return false;
                }
                int += str.charCodeAt(i) * multi;
                multi *= 256;
            }
        }
        sign = (int>>>31)?-1:1;
        exp = (int >>> 23 & 0xff) - 127;
        mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
        for (i=0; i<mantissa.length; i+=1){
            float += parseInt(mantissa[i])? Math.pow(2,exp):0;
            exp--;
        }
        return float*sign;
    }
    
var params = ["Watts Total", "Watts R phase",  "Watts Y phase","Watts B phase","VAR Total", "VAR R phase","VAR Y phase","VAR B phase","PF Ave. (Instantaneous)",
"PF R phase","PF Y phase","PF B phase","VA total","VA R phase","VA Y phase","VA B phase","VLL average","Vry phase","Vyb phase","Vbr phase ","VLN average","V R phase",
"V Y phase","V B phase","Current Total","Current R phase","Current Y phase","Current B phase","Frequency","Wh received","VAh received","VARh Ind. Received","VARh Cap. received",
"Wh Delivered","VAh Delivered","VARh Ind. Delivered","VARh Cap. Delivered","PF average Received","Amps average Received","PF average Delivered","Amps average Delivered",
"Neutral Current","Voltage R Harmonics","Voltage Y Harmonics","Voltage B Harmonics","Current R Harmonics","Current Y Harmonics","Current B Harmonics","Rising Demand float",
"Forecast Demand" ];
function parseData(n , t){
    var i = 6; var x =1; var add =40100;
    var j = 10;
    var k = j + 4;
    
    for(;x<=50;){
    var str1 = n.slice(i , j);
    var str2 = n.slice(j , k);
    var str3 = "0x" + str2 + str1;
    console.log(str3 +":" + x);
    console.log(parseFloat(str3) +":" + params[x-1]);

    // serverData.remove({} , function(err , foundData){
    //     if(err)
    //     console.log(err);
    //     else
    //     console.log("removed");
    // });
    
    var obj = {parameter : params[x-1] , 
               address : String(40100 + 2*x-1),
                value : parseFloat(str3),
                hexValue : str3 ,
                timeOfCreation : String(t) };
    serverData.create(obj , function(err , storedData){
                    if(err)
                        console.log(err);
    }); 
    i = i+ 8;
    j = j+ 8;
    k = j +4;
    x++;
    }    
}

app.get("/" , function(req , res){
        serverData.find({address : "40101"} , function(err, foundData){
                    if(err)
                        console.log(err);
                    else
                    {
                        res.render("home.ejs" , {foundData : foundData});
                    }
        });
});

app.get("/serverData/:created" , function(req , res){
        var timeCreated = String(req.params.created);
        serverData.find( {timeOfCreation:timeCreated} , function(err , foundData){
                        if(err)
                            console.log(err);
                        else
                            res.render("show.ejs" , {serverData : foundData});
        });
});

app.get("/serverData/:created/:address" , function(req,res){
        var address = req.params.address;
        serverData.find({address : address} , function(err , foundData){
                        if(err)
                            console.log(err);
                        else
                            res.render("graph.ejs" , {foundData: foundData});
        });
});

app.listen(8080 , function(){
    console.log("listening on 8080");
});