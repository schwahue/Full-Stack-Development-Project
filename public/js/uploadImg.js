// Initialize the Image Classifier method with MobileNet
const classifier = ml5.imageClassifier("/data/imageModel.json", modelLoaded);

let submitBut = document.getElementById("butAddProduct");
submitBut.disabled = true;

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
  })
  console.log("end upload. return json");
});

// When the model is loaded
function modelLoaded() {
  console.log("ml5 version:", ml5.version);
}

function nameCheck() {
  classifier.classify(
    document.getElementById("imageProduct"),
    (err, results) => {
      let submitBut = document.getElementById("butAddProduct");
      let name = document.getElementById("productName").value;
      let errorMsg = document.getElementById("ErrorMsg")
      if (name != "") {
        console.log(results);
        if (
          results[0].label.match(name)
        ) {
          errorMsg.hidden = true;
          submitBut.disabled = false;
          console.log("Success");
        } else {
          errorMsg.hidden = false;
          submitBut.disabled = true;
          console.log("Not Success");
        }
      }
    }
  );
}
