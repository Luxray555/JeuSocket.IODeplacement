//require
let express = require('express');
const session = require('express-session');
const url = require('url');
const cookieParser = require("cookie-parser");
let mysql = require('mysql');
const EventEmitter = require('events');
const { emit } = require('process');

//Create web app
let app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

app.use(session({
  
    // It holds the secret key for session
    secret: 'jhzrfjhrsedg',
    
    //Set options cookies
    cookie: { maxAge: 86400000 },

    resave: false,
  
    // Forces a session that is "uninitialized"
    // to be saved to the store
    saveUninitialized: true,
}))

//Create Server socket.io
const http = require('http').Server(app);
const io = require("socket.io")(http);
io.setMaxListeners(0);

let listJoueur = {
    "blue":{},
    "red":{},
    "yellow":{},
    "green":{}
}
let casePos = {
    "blue":[],
    "red":[],
    "yellow":[],
    "green":[]
}

let createCase = (posX, posY, cle) => {
    for(key in casePos){
        for(i=0;i<casePos[key].length;i++){
            if(casePos[key][i]['xPos'] == posX && casePos[key][i]['yPos'] == posY){
                casePos[key].splice(i, i);
            }
        }
    }
    casePos[cle].push({
        'xPos': posX,
        'yPos': posY
    })
}

app.get('/',(req, res) => {
    res.sendFile(__dirname+'/index.html');
})

io.on('connection', (socket) => {
    console.log(socket.id+" is connected");
    socket.emit('allPosUser',listJoueur,casePos);
    socket.on('userInfo',(name) => {
        for(key in listJoueur){
            if(Object.keys(listJoueur[key]).length == 0){
                listJoueur[key]["socket"] = socket.id;
                listJoueur[key]['pseudo'] = name;
                listJoueur[key]['xPos'] = Math.floor(Math.random() * 50);
                listJoueur[key]['yPos'] = Math.floor(Math.random() * 50);
                io.emit('userSpawn',listJoueur[key], key);
                break;
            }
        }
    })
    socket.on('mouvement', (direction)=> {
        let key = Object.keys(listJoueur).find(key => listJoueur[key]['socket'] === socket.id);
        if(key != undefined){
            if(direction == 'up' && 0<listJoueur[key]['yPos']){
                createCase(listJoueur[key]['xPos'], listJoueur[key]['yPos'], key);
                io.emit('refreshPos', listJoueur[key]['xPos']+50*listJoueur[key]['yPos'], listJoueur[key]['xPos']+50*(listJoueur[key]['yPos']-1), listJoueur[key], key);
                listJoueur[key]['yPos']--;
            }else if(direction == 'down' && 49>listJoueur[key]['yPos']){
                createCase(listJoueur[key]['xPos'], listJoueur[key]['yPos'], key);
                io.emit('refreshPos', listJoueur[key]['xPos']+50*listJoueur[key]['yPos'], listJoueur[key]['xPos']+50*(listJoueur[key]['yPos']+1), listJoueur[key], key);
                listJoueur[key]['yPos']++;
            }else if(direction == 'left' && listJoueur[key]['xPos']>0){
                createCase(listJoueur[key]['xPos'], listJoueur[key]['yPos'], key);
                io.emit('refreshPos', listJoueur[key]['xPos']+50*listJoueur[key]['yPos'], (listJoueur[key]['xPos']-1)+50*listJoueur[key]['yPos'], listJoueur[key], key);
                listJoueur[key]['xPos']--;
            }else if(direction == 'right' && listJoueur[key]['xPos']<49){
                createCase(listJoueur[key]['xPos'], listJoueur[key]['yPos'], key);
                io.emit('refreshPos', listJoueur[key]['xPos']+50*listJoueur[key]['yPos'], (listJoueur[key]['xPos']+1)+50*listJoueur[key]['yPos'], listJoueur[key], key);
                listJoueur[key]['xPos']++;
            }
        }else{
            socket.emit('reboot');
        }
        delete key;
    })
    socket.on('disconnect', () => {
        console.log(socket.id+" is disconnect");
        for(key in listJoueur){
            if(listJoueur[key]['socket'] == socket.id){ 
                io.emit('userDespawn',casePos[key] , listJoueur[key], key);
                listJoueur[key]={};
                casePos[key]=[];
            }
        }
    })
})

//server port
http.listen(port, () => {
    console.log('listening on :'+port);
    console.log('http://localhost:'+port);
});
