/* global instantsearch algoliasearch */

const search = instantsearch({
  indexName: "Products",
  searchClient: algoliasearch("97Y32174KO", "4facdb2ab4e15fcdfda63fe13674fb2e"),
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: "#searchbox",
  }),
  instantsearch.widgets.clearRefinements({
    container: "#clear-refinements",
  }),
  instantsearch.widgets.refinementList({
    container: "#brand-list",
    attribute: "productCategory",
  }),
  instantsearch.widgets.hits({
    container: "#hits",
    templates: {
      item: `
          <div class="text-center">
            <img src="{{productImage}}" class="img-fluid img-thumbnail" align="left" alt="{{name}}" />
            <div class="hit-name">
              {{#helpers.highlight}}{ "attribute": "productName" }{{/helpers.highlight}}
            </div>
            <div class="hit-description">
              {{#helpers.highlight}}{ "attribute": "productDescription" }{{/helpers.highlight}}
            </div>
            <div class="hit-price">\${{productPrice}}</div>
            <button type="button" class="btn btn-success" href="/">Buy</button>
          </div>
        `,
    },
  }),
  instantsearch.widgets.pagination({
    container: "#pagination",
  }),
]);

search.start();
