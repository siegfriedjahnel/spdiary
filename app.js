//---------------------
//service worker
//----------------------

//--------------
const apiUriSpdiary = "https://sj-sam.de/api/spdiary/spdiary.php";
const apiUriHorse = "https://sj-sam.de/api/spdiary/horse.php";

const content = document.getElementById("content");
const tblCalendar = document.getElementById("calendar");
const navigation = document.getElementById("navigation");
let allEntries = [];
let allHorses = [];
let selectedHorseId = 0;
async function getSpdiary(){
  const response = await fetch(apiUriSpdiary);
  const data = await response.json();
  allEntries = data;
  return data;
}

async function getHorse(){
  const response = await fetch(apiUriHorse);
  const data = await response.json();
  allHorses = data;
    return data;
}

async function updateSpdiary(id){
  let oldtext = allEntries.filter(entry => entry.id == id)[0].text;
  let text = prompt("text",oldtext);
  let uri = `${apiUriSpdiary}?action=update&id=${id}&text=${text}`;
  const response = await fetch(uri);
  if(response.statusText == "OK"){
    init();
  }
}

async function insertSpdiary(day,horse_id){
  let text = prompt("text");
  let uri = `${apiUriSpdiary}?action=insert&day=${day}&horse_id=${horse_id}&text=${text}`;
  const response = await fetch(uri);
  if(response.statusText == "OK"){
    init();
  }
}

function drawSpdiary(horse_id){
  console.log(selectedHorseId);
  tblCalendar.innerHTML = "";
  for(let i = 19450; i<19500;i++){
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    td1.setAttribute("class","td1");
    td3.setAttribute("class","td3");
    td1.innerHTML = i;
    let rows = allEntries.filter(entry => entry.day == i && entry.horse_id == horse_id);
    if(rows.length >0){
      td2.innerHTML += rows[0].name + ": " + rows[0].text + "<br>";
      td3.innerHTML += `<button onClick = "updateSpdiary(${rows[0].id})">e</button>`;
    }else{
      td3.innerHTML += `<button onClick = "insertSpdiary(${i},${horse_id})">i</button>`;

    }
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tblCalendar.appendChild(tr);
  }
    
}
function selectHorseId(horseId){
  selectedHorseId = horseId;
  drawSpdiary(selectedHorseId);
}
function drawNavigation(){
  navigation.innerHTML = "";
  allHorses.forEach(element => {
    let button = `<button horse_id ="${element.id}" onClick="selectHorseId(${element.id})">${element.name}</button>`;
    navigation.innerHTML += button;
  })
}

function init(){
  getHorse()
  .then(function(){
    drawNavigation();
  })
  getSpdiary()
  .then(function(){
    if(selectedHorseId != 0){
      drawSpdiary(selectedHorseId);
    }
  })
}

init();