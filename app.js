//---------------------
//service worker
//----------------------

//--------------
const apiUriSpdiary = "https://sj-sam.de/api/spdiary/spdiary.php";
const apiUriHorse = "https://sj-sam.de/api/spdiary/horse.php";
const selectedHorse = document.getElementById("selectedHorse");
const content = document.getElementById("content");
const tblOutput = document.getElementById("tblOutput");
const navigation = document.getElementById("navigation");
const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
//---------------------------------
var d = new Date();
var unixTime = d.getTime();
var f = 24 * 60 * 60 * 1000;
var unixToday = Math.floor(unixTime / f);
let allEntries = [];
let myHorses = [];
//let myHorseId = ;
let selectedHorseId = 0;

//----------- fetches all entries from table: "spdiary" ----------
async function getSpdiary(){
  const response = await fetch(apiUriSpdiary);
  const data = await response.json();
  allEntries = data;
  return data;
}
//---------------------------------------------------------------

//----------- fetches all entries from table: "spdiary" ----------
async function getHorseById(id){
  const response = await fetch(`${apiUriHorse}?action=get&id=${id}`);
  const data = await response.json();
  return data;
}
//---------------------------------------------------------------

//--------stores a horse in local storage-----------------------
function saveHorseLocally(id,name){
  let newHorse = new Object;
  newHorse.id=id;
  newHorse.name = name;
  myHorses.push(newHorse);
  localStorage.setItem("myHorses", JSON.stringify(myHorses));
}
//-------------------------------------------------------------------

//--------updates a horse in local storage-----------------------
function updateHorseLocally(id,name){
  //find horse from myHorses --> row_id
  let index = myHorses.findIndex(entry => entry.id == id);
  if(name != "") myHorses[index].name = name;
  localStorage.setItem("myHorses", JSON.stringify(myHorses));
}
//-------------------------------------------------------------------


//--------deletes a horse from local storage-----------------------
function deleteHorseLocally(id){
  if(confirm("Pferd wirklich löschen?")){
    let index = myHorses.findIndex(entry => entry.id == id);
    myHorses.splice(index,1);
    localStorage.setItem("myHorses", JSON.stringify(myHorses));
  }
}
//-------------------------------------------------------------------

function createNewHorse(){
  let name = prompt("Name");
  if(name != ""){
    //save Horse on server
    saveHorseOnServer(name)
    .then(
      (response) =>{
        let id = response;
        saveHorseLocally(id,name);
      })
  }
}


//------------------------------------------------------------
function addSharedHorse(){
  let horseId = prompt("Pferdenummer");
  if(horseId != ""){
    getHorseById(horseId)
    .then(
      response =>{
        if(response.length >0){
          let horseName = response[0].name;
          saveHorseLocally(horseId, horseName);
        }else{
          alert("Pferd existiert nicht");
        }
      })
  }
}
//-----------------------------------------------------------


async function saveHorseOnServer(name){
  let uri = `${apiUriHorse}?action=insert&name=${name}`;
  const response = await fetch(uri);
  return  await response.text();
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

async function updateHorse(id){
  let oldname = myHorses.filter(entry => entry.id == id)[0].name;
  let name = prompt("text",oldname);
  let uri = `${apiUriHorse}?action=update&id=${id}&name=${name}`;
  const response = await fetch(uri);
  if(response.statusText == "OK"){
    updateHorseLocally(id,name);
    console.log("horsename updated on server",id,name);
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

// ----------------- creates output--------------------------------
function drawHorses(){
  tblOutput.innerHTML = "";

  const th = document.createElement("tr");
  th.innerHTML = `<th>PferdeNr</th><th>PferdeName</th><th> </th>`;
  tblOutput.appendChild(th);
  myHorses.forEach(element => {
  const tr = document.createElement("tr");
  const td1 = document.createElement("td");
  const td2 = document.createElement("td");
  const td3 = document.createElement("td");
  td1.setAttribute("class","td1");
  td3.setAttribute("class","td25percent");
    td1.innerHTML = element.id;
    td2.innerHTML = element.name;
    td3.innerHTML = `<button onClick = "updateHorse(${element.id})">&#x1F589;</button> <button onClick = "deleteHorseLocally(${element.id})">&#x26D2;</button>`;
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tblOutput.appendChild(tr);
    
  })
}

//-----------------------------------------------------------------
function drawSpdiary(horse_id){
  console.log(selectedHorseId);
  tblOutput.innerHTML = "";
  for(let ii = -10; ii<15;ii++){
    let i = ii + unixToday;
    var unixDay = unixToday + ii;

    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const date = new Date(unixDay*f);
    td1.setAttribute("class","td1");
    td3.setAttribute("class","td10percent");
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
    tblOutput.appendChild(tr);
  }
    
}
//----------------------------------------------------------------------------------------


//------------selects a horse to display---------------------------
function selectHorseId(horseId){
  selectedHorseId = horseId;
  selectedHorse.innerHTML = "Kalender von " + myHorses.filter(entry => entry.id == horseId)[0].name;
  drawSpdiary(selectedHorseId);
}
//---------------------------------------------------------------

function drawNavigation(){
  navigation.innerHTML = "";
  console.log("myHorses",myHorses);
  myHorses.forEach(element => {
    let button = `<button  onClick="selectHorseId(${element.id})">${element.name}</button>`;
    navigation.innerHTML += button;
  })
}

function init(){
  if(localStorage.getItem("myHorses") !== null){
    myHorses = JSON.parse(localStorage.getItem("myHorses"));
    drawNavigation();
  } 
  getSpdiary()
  .then(function(){
    if(selectedHorseId != 0){
      drawSpdiary(selectedHorseId);
    }
  })
}

init();