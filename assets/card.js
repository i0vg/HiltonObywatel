var confirmElement = document.querySelector(".confirm");

function closePage(){
  clearClassList();
}

function openPage(page){
  clearClassList();
  var classList = confirmElement.classList;
  classList.add("page_open");
  classList.add("page_" + page + "_open");
}

function clearClassList(){
  var classList = confirmElement.classList;
  classList.remove("page_open");
  classList.remove("page_1_open");
  classList.remove("page_2_open");
  classList.remove("page_3_open");
}

var time = document.getElementById("time");
var options = { year: 'numeric', month: 'numeric', day: '2-digit' };
var optionsTime = { second: 'numeric', minute: 'numeric', hour: '2-digit' };

if (localStorage.getItem("update") == null){
  localStorage.setItem("update", "21.05.2025");
}

var date = new Date();

var updateText = document.querySelector(".bottom_update_value");
if (updateText) {
  updateText.innerHTML = localStorage.getItem("update");
}

var update = document.querySelector(".update");
if (update) {
  update.addEventListener('click', () => {
    var newDate = date.toLocaleDateString("pl-PL", options);
    localStorage.setItem("update", newDate);
    if (updateText) updateText.innerHTML = newDate;
    scroll(0, 0);
  });
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

setClock();
function setClock(){
    date = new Date();
    if (time) {
      time.innerHTML = "Czas: " + date.toLocaleTimeString("pl-PL", optionsTime) + " " + date.toLocaleDateString("pl-PL", options);    
    }
    delay(1000).then(() => {
        setClock();
    });
}

var unfold = document.querySelector(".info_holder");
if (unfold) {
  unfold.addEventListener('click', () => {
    if (unfold.classList.contains("unfolded")){
      unfold.classList.remove("unfolded");
    } else {
      unfold.classList.add("unfolded");
    }
  });
}

var data = {};
var params = new URLSearchParams(window.location.search);
for (var key of params.keys()){
  data[key] = params.get(key);
}

// FIX: Bezpieczne ustawianie zdjęcia/tła – w przypadku błędu Imgur ustawia gradient
var idImageElem = document.querySelector(".id_own_image");
if (idImageElem) {
  var imgUrl = data['image'];
  if (imgUrl && !imgUrl.includes("imgur.com")) {
    idImageElem.style.backgroundImage = `url(${imgUrl})`;
  } else {
    // Domyślne awaryjne tło gradientowe
    idImageElem.style.background = "linear-gradient(135deg, #2b2310 0%, #16181b 50%, #0d0e10 100%)";
  }
}

var birthday = data['birthday'] || "01.01.2000";
var birthdaySplit = birthday.split(".");
var day = parseInt(birthdaySplit[0]) || 1;
var month = parseInt(birthdaySplit[1]) || 1;
var year = parseInt(birthdaySplit[2]) || 2000;

var birthdayDate = new Date();
birthdayDate.setDate(day);
birthdayDate.setMonth(month-1);
birthdayDate.setFullYear(year);

birthday = birthdayDate.toLocaleDateString("pl-PL", options);

var sex = data['sex'] || "m";
if (sex === "m"){
  sex = "Mężczyzna";
} else if (sex === "k"){
  sex = "Kobieta";
}

setData("name", (data['name'] || "JAN").toUpperCase());
setData("surname", (data['surname'] || "KOWALSKI").toUpperCase());
setData("nationality", (data['nationality'] || "POLSKIE").toUpperCase());
setData("birthday", birthday);
setData("familyName", data['familyName'] || "");
setData("sex", sex);
setData("fathersFamilyName", data['fathersFamilyName'] || "");
setData("mothersFamilyName", data['mothersFamilyName'] || "");
setData("birthPlace", data['birthPlace'] || "");
setData("countryOfBirth", data['countryOfBirth'] || "");
setData("adress", "ul. " + (data['adress1'] || "") + "<br>" + (data['adress2'] || "") + " " + (data['city'] || ""));

if (localStorage.getItem("homeDate") == null){
  var homeDay = getRandom(1, 25);
  var homeMonth = getRandom(0, 12);
  var homeYear = getRandom(2012, 2019);

  var homeDate = new Date();
  homeDate.setDate(homeDay);
  homeDate.setMonth(homeMonth);
  homeDate.setFullYear(homeYear);

  localStorage.setItem("homeDate", homeDate.toLocaleDateString("pl-PL", options));
}

var homeDateElem = document.querySelector(".home_date");
if (homeDateElem) {
  homeDateElem.innerHTML = localStorage.getItem("homeDate");
}

if (parseInt(year) >= 2000){
  month = 20 + month;
}

var later = (sex.toLowerCase() === "mężczyzna") ? "0295" : "0382";
var formattedDay = day < 10 ? "0" + day : day;
var formattedMonth = month < 10 ? "0" + month : month;

var pesel = year.toString().substring(2) + formattedMonth + formattedDay + later + "7";
setData("pesel", pesel);

function setData(id, value){
  var el = document.getElementById(id);
  if (el) el.innerHTML = value;
}

function getRandom(min, max) {
  return parseInt(Math.random() * (max - min) + min);
}

// FIX: Poprawka dolnej nawigacji + zachowywanie danych w URL przy przechodzeniu między kartami
(function(){
  try {
    var currentParams = window.location.search;
    var tab = (new URLSearchParams(currentParams).get('tab') || 'home').toLowerCase();
    var valid = ['home', 'services', 'qr', 'more'];
    if (!valid.includes(tab)) tab = 'home';

    var imgs = document.querySelectorAll('.bottom_element_image');
    var texts = document.querySelectorAll('.bottom_element_text');
    var openClasses = ['home_open', 'services_open', 'qr_open', 'more_open'];

    imgs.forEach(function(img){ openClasses.forEach(c => img.classList.remove(c)); });
    texts.forEach(function(t){ t.classList.remove('open'); });

    document.querySelectorAll('.bottom_element_grid').forEach(function(el){
      var send = el.getAttribute('send');
      var img = el.querySelector('.bottom_element_image');
      var txt = el.querySelector('.bottom_element_text');

      if (send === tab){ 
        if(img) img.classList.add(tab + '_open'); 
        if(txt) txt.classList.add('open'); 
      }

      // Podpinanie kliknięcia z przekazywaniem parametrów (żeby skaner QR i inne zakładki mogły wrócić)
      el.addEventListener('click', function(){
        var targetPage = send === 'home' ? 'id.html' : send + '.html';
        var searchParams = new URLSearchParams(window.location.search);
        searchParams.set('tab', send);
        window.location.href = targetPage + '?' + searchParams.toString();
      });
    });
  } catch(e) {}
})();
