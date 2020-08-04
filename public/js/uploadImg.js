// Initialize the Image Classifier method with MobileNet
const classifier = ml5.imageClassifier("Mobilenet", modelLoaded);

function toUpperCase() {
  let str = document.getElementById("title");
  str.value = str.value.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

$("#imageUpload").on("change", function () {
  console.log("init upload");
  let image = $("#imageUpload")[0].files[0];
  let formdata = new FormData();
  formdata.append("imageUpload", image);
  $.ajax({
    url: "/merchant/upload",
    type: "POST",
    data: formdata,
    contentType: false,
    processData: false,
    success: (data) => {
      $("#imageProduct").attr("src", data.file);
      $("#productImageURL").attr("value", data.file); // sets posterURL hidden field
      if (data.err) {
        $("#imageErr").show();
        $("#imageErr").text(data.err.message);
      } else {
        $("#imageErr").hide();
      }
    },
  });
  // Make a prediction with a selected image
  classifier.classify(
    document.getElementById("imageProduct"),
    (err, results) => {
      console.log(results);
      let name = document.getElementById("productName").value;
      let nameReg = new RegExp(name, "gi")
      if (
        results[0].label.match(nameReg) ||
        results[1].label.match(nameReg) ||
        results[2].label.match(nameReg)
      ) {
        console.log(name)
        console.log(nameReg)
        console.log("Success");
      } else {
        console.log("Not Success");
      }
    }
  );
  console.log("end upload. return json");
});

// When the model is loaded
function modelLoaded() {
  console.log("Model Loaded!");
}

function nameCheck() {
  classifier.classify(
    document.getElementById("imageProduct"),
    (err, results) => {
      console.log(results);
      let submitBut = document.getElementById("butAddProduct")
      let name = document.getElementById("productName").value;
      let nameReg = new RegExp(name, "gi")
      if (
        results[0].label.match(nameReg) ||
        results[1].label.match(nameReg) ||
        results[2].label.match(nameReg)
      ) {
        submitBut.disabled = true
        console.log("Success");
      } else {
        submitBut.disabled = false
        console.log("Not Success");
      }
    }
  );
}
