//---------------------
//service worker
//----------------------

//--------------
const apiUriSpdiary = "https://sj-sam.de/api/spdiary/spdiary.php";
const apiUriHorse = "https://sj-sam.de/api/spdiary/horse.php";

const content = document.getElementById("content");
const tblCalendar = document.getElementById("calendar");
const navigation = document.getElementById("navigation");
const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
//---------------------------------
var d = new Date();
var unixTime = d.getTime();
var f = 24 * 60 * 60 * 1000;
var unixToday = Math.floor(unixTime / f);
let allEntries = [];
let allHorses = [];
//let myHorseId = ;
let selectedHorseId = 0;

//---------------------------------
async function getSpdiary(){
  const response = await fetch(apiUriSpdiary);
  const data = await response.json();
  allEntries = data;
  return data;
}

async function saveHorseLocally(){
  let id =12;
  let name = "Sammy";
  var storedHorses = JSON.parse(localStorage.getItem("myHorses"));
  console.log("StoredHorses", storedHorses);
  if(storedHorses === null){
    storedHorses = [];
  }
  let newHorse = new Object;
  newHorse.id=id;
  newHorse.name = name;
  storedHorses.push(newHorse);
  localStorage.setItem("myHorses", JSON.stringify(storedHorses));

}

async function createNewHorse(){
  let name = prompt("Name");
  let uri = `${apiUriHorse}?action=insert&name=${name}`;
  const response = await fetch(uri);
  if(response.statusText == "OK"){
    init();
  }

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
  for(let ii = -10; ii<15;ii++){
    let i = ii + unixToday;
    var unixDay = unixToday + ii;

    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const date = new Date(unixDay*f);
    td1.setAttribute("class","td1");
    td3.setAttribute("class","td3");
    td1.innerHTML = date.toLocaleDateString('de-DE', options);
    let rows = allEntries.filter(entry => entry.day == i && entry.horse_id == horse_id);
    if(rows.length >0){
      td2.innerHTML += rows[0].name + ": " + rows[0].text + "<br>";
      td3.innerHTML += `<button onClick = "updateSpdiary(${rows[0].id})">&#x1F589;</button>`;
    }else{
      td3.innerHTML += `<button onClick = "insertSpdiary(${i},${horse_id})">&#x1F589;</button>`;

    }
    if (unixToday == unixDay) {
      tr.setAttribute("class", "today");
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