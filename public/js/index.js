let socket = io();

let gameDoc = document.querySelector('.game');
let inputPseudo = document.getElementById('choosePseudo');
let playBtn = document.getElementById('playBtn');
let notifDoc = document.querySelector('.notif');

for(i=0;i<50*50;i++){
    let c = document.createElement('div');
    c.classList.add('case');
    gameDoc.appendChild(c);
}
let caseGame = document.querySelectorAll('.game .case');

socket.on('allPosUser', (listInfoUser, casePos) => {
    for(key in listInfoUser){
        if(Object.keys(listInfoUser[key]).length != 0){
            caseGame[(listInfoUser[key]['xPos']+50*listInfoUser[key]['yPos'])].className = "case";
            caseGame[(listInfoUser[key]['xPos']+50*listInfoUser[key]['yPos'])].classList.add(key);
            caseGame[(listInfoUser[key]['xPos']+50*listInfoUser[key]['yPos'])].setAttribute('pseudo-value', listInfoUser[key]['pseudo']);
        }
    }
    for(key in casePos){
        for(i=0;i<casePos[key].length;i++){
            caseGame[casePos[key][i]['xPos']+50*casePos[key][i]['yPos']].className = "case";
            caseGame[casePos[key][i]['xPos']+50*casePos[key][i]['yPos']].classList.add(key);
        }
    }
})

playBtn.addEventListener('click', () => {
    if(inputPseudo.value == ""){
        inputPseudo.value = socket.id;
    }
    document.querySelector('.connect').classList.add('des');
    document.querySelector('.connect').style.display = "none";
    gameDoc.classList.remove('noPlay');
    socket.emit('userInfo',inputPseudo.value);
    document.addEventListener('keydown', (event) => {
        if (event.code === "ArrowDown"){
            socket.emit('mouvement','down');
        } else if (event.code === "ArrowUp"){
            socket.emit('mouvement','up');
        } else if (event.code === "ArrowLeft"){
            socket.emit('mouvement','left');
        } else if (event.code === "ArrowRight"){
            socket.emit('mouvement','right');
        }
      }, false);

      let startTouch = [null,null];
      let endTouch = [null,null];
      
      document.addEventListener('touchstart', (e) => {
          startTouch[0] = e.targetTouches[0].pageX;
          startTouch[1] = e.targetTouches[0].pageY;
      }, false);
      
      document.addEventListener('touchend', (e) => {
        endTouch[0] = e.changedTouches[0].clientX;
        endTouch[1] = e.changedTouches[0].clientY;
        if (Math.abs(startTouch[0]-endTouch[0])>=Math.abs(startTouch[1]-endTouch[1])){
            if(startTouch[0]-endTouch[0]>0){
                socket.emit('mouvement','left');
            }else if(startTouch[0]-endTouch[0]<0){
                socket.emit('mouvement','right');
            }
        }else{
            if(startTouch[1]-endTouch[1]>0){
                socket.emit('mouvement','up');
            }else if(startTouch[1]-endTouch[1]<0){
                socket.emit('mouvement','down');
            }
        }
      }, false);
})

socket.on('userSpawn', (spawn, color) => {
    notifDoc.classList.remove('des');
    notifDoc.innerHTML = "Connection de <strong>"+spawn['pseudo']+"</strong>";
    let timeout1 = setTimeout(() => {
        notifDoc.classList.add('des');
        setTimeout(() => notifDoc.innerHTML = "",400);
        clearTimeout(timeout1);
    },2000);
    caseGame[(spawn['xPos']+50*spawn['yPos'])].classList.add(color);
    caseGame[(spawn['xPos']+50*spawn['yPos'])].setAttribute('pseudo-value', spawn['pseudo']);
})

socket.on('userDespawn', (casePosC , spawn, color) => {
    notifDoc.classList.remove('des');
    notifDoc.innerHTML = "Deconnection de <strong>"+spawn['pseudo']+"</strong>";
    let timeout1 = setTimeout(() => {
        notifDoc.classList.add('des');
        setTimeout(() => notifDoc.innerHTML = "",400);
        clearTimeout(timeout1);
    },2000);
    caseGame[(spawn['xPos']+50*spawn['yPos'])].classList.remove(color);
    caseGame[(spawn['xPos']+50*spawn['yPos'])].setAttribute('pseudo-value', "");
    caseGame[(spawn['xPos']+50*spawn['yPos'])].borderRadius = "0px";
    for(i=0;i<casePosC.length;i++){
        caseGame[casePosC[i]['xPos']+50*casePosC[i]['yPos']].className = 'case';
    }
})

socket.on('refreshPos',(oldPos, newPos, spawn, color) => {
    caseGame[newPos].className = "case "+color;
    caseGame[oldPos].setAttribute('pseudo-value', "");
    caseGame[oldPos].style.borderRadius = "0px";
    caseGame[newPos].setAttribute('pseudo-value', spawn['pseudo']);
    caseGame[newPos].style.borderRadius = "10px";
});

socket.on('disconnect', () => {
    location.reload();
});

socket.on('reboot', () => {
    location.reload();
})

