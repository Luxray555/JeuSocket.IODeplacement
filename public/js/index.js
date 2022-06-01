let socket = io();

let gameDoc = document.querySelector('.game');
let inputPseudo = document.getElementById('choosePseudo');
let playBtn = document.getElementById('playBtn');

for(i=0;i<50*50;i++){
    let c = document.createElement('div');
    c.classList.add('case');
    gameDoc.appendChild(c);
}

let caseGame = document.querySelectorAll('.game .case');

socket.on('allPosUser', (listInfoUser) => {
    for(key in listInfoUser){
        if(Object.keys(listInfoUser[key]).length != 0){
            caseGame[(listInfoUser[key]['xPos']+50*listInfoUser[key]['yPos'])].classList.add(key);
            caseGame[(listInfoUser[key]['xPos']+50*listInfoUser[key]['yPos'])].setAttribute('pseudo-value', listInfoUser[key]['pseudo']);
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
    caseGame[(spawn['xPos']+50*spawn['yPos'])].classList.add(color);
    caseGame[(spawn['xPos']+50*spawn['yPos'])].setAttribute('pseudo-value', spawn['pseudo']);
})

socket.on('userDespawn', (spawn, color) => {
    caseGame[(spawn['xPos']+50*spawn['yPos'])].classList.remove(color);
})

socket.on('refreshPos',(oldPos, newPos, spawn, color) => {
    caseGame[oldPos].classList.remove(color);
    caseGame[newPos].classList.add(color);
    caseGame[oldPos].setAttribute('pseudo-value', "");
    caseGame[newPos].setAttribute('pseudo-value', spawn['pseudo']);
});

socket.on('reboot', () => {
    location.reload();
})


