function onOpenModal(){
  console.log("onOpenModal called");
}

function sendDataBase(){
  return undefined;
}

function saveData() {
  var firstNameInput = document.getElementById("first").value;
  var lastNameInput = document.getElementById("last").value;
  var emailInput = document.getElementById("email").value;
  var universityInput = document.getElementById("university").value;

  document.getElementById("u_Fname").innerHTML = firstNameInput;
  document.getElementById("u_Lname").innerHTML = lastNameInput;
  document.getElementById("u_Email").innerHTML = emailInput;
  document.getElementById("u_University").innerHTML = universityInput;
  console.log(universityInput)

  // Note that two values are hardcoded below. Eventually we will have to retrieve these from a database.
  // var insertion1 = firstNameInput + " " + lastNameInput;
  // var insertion2 = "Account type: user<br>Username: hackerman_username52<br>" + "Email: " + emailInput + "<br>" + "University: " + universityInput;

  // console.log(insertion1);
  // console.log(insertion2);

  // document.getElementById("para1").innerHTML = insertion1;
  // document.getElementById("para2").innerHTML = insertion2;

  sendDataBase();


  //Account type: user<br>
  //Username: hackerman_username52<br>
  //Email: hackerman@yandex.ru<br>
  //University: Hardknocks
}

function reply(){
  console.log("I tried")
}