const search = document.getElementById("searchBar");
const matchList = document.getElementById("matchList");
const originalDisplay = document.getElementById("originalDisplay");
const userID = document.getElementById("merchantID");

//Search from SequelizeAPI and filter it
const searchStates = async (searchText) => {
  const res = await fetch(`/api/product/${user.id.value}`); //get product from mySQL
  const products = await res.json();

  //Get matches to current text input
  let matches = products.filter((product) => {
    const regex = new RegExp(`${searchText}`, "gi");
    return product.productName.match(regex);
  });

  if (searchText.length === 0) {
    matches = [];
    matchList.innerHTML = "";
    originalDisplay.hidden = false;
  }

  outputHTML(matches);
};

//Show results in HTML
const outputHTML = (matches) => {
  if (matches.length > 0) {
    const html = matches
      .map(
        (match) => `
        <div class="col-sm-12 col-md-4 mx-auto" style="margin-top:20px">
        <div class="card">
            <img class="card-img-top img-thumbnails img-fluid" style="height:300px; width:300px"
                src="${match.productImageURL}" alt="Card image cap">
            <div class="card-body">
                <h5 class="card-title">${match.productName}</h5>
                <p class="card-text"><b>ID:</b> ${match.productID}</p>
                <p class="card-text"><b>Description:</b> ${match.productDescription}</p>
                <p class="card-text"><b>Price:</b> ${match.productPrice}</p>
                <p class="card-text"><b>Stock:</b> ${match.productStock}</p>
                <p class="card-text"><b>Category:</b> ${match.productCategory}</p>
                <div class="row text-center">
                    <div class="col"><a href="updateProduct/${match.productID}" class="btn btn-success">Update
                        </a></div>
                    <div class="col"><a href="deleteProduct/${match.productID}" class="btn btn-danger">Delete
                        </a></div>
                </div>
            </div>
        </div>
    </div>
        `
      )
      .join("");
    matchList.innerHTML = html;
    originalDisplay.hidden = true;
    console.log('reached')
  }
};

search.addEventListener("input", () => searchStates(search.value));
