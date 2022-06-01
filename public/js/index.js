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
            caseGame[(listInfoUser[key]['xPos']+50*listInfoUser[key]['yPos'])].classList.add(key);
            caseGame[(listInfoUser[key]['xPos']+50*listInfoUser[key]['yPos'])].setAttribute('pseudo-value', listInfoUser[key]['pseudo']);
        }
    }
    for(key in casePos){
        for(i=0;i<casePos[key].length;i++){
            caseGame[casePos[key][i]['xPos']+50*casePos[key][i]['yPos']].classList.add(key);
        }
    }
})

playBtn.addEventListener('click', () => {
    if(inputPseudo.value == ""){
        inputPseudo.value = socket.id;
    }
    document.querySelector('.connect').classList.add('des');
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
    caseGame[(spawn['xPos']+50*spawn['yPos'])].classList.remove(color);
    for(i=0;i<casePosC.length;i++){
        caseGame[casePosC[i]['xPos']+50*casePosC[i]['yPos']].className = 'case';
    }
})

socket.on('refreshPos',(oldPos, newPos, spawn, color) => {
    caseGame[newPos].classList.add(color);
    caseGame[oldPos].setAttribute('pseudo-value', "");
    caseGame[newPos].setAttribute('pseudo-value', spawn['pseudo']);
});

socket.on('reboot', () => {
    location.reload();
})


