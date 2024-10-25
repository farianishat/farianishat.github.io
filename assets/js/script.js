// When the user scrolls the page, execute myFunction
window.onscroll = function () {
  myFunction();
};

function myFunction() {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  document.getElementById("progress").style.width = scrolled + "%";
}

// Make a background request to the URL
fetch("https://www.flagcounter.me/details/e8m")
    .then(response => {
        if (response.ok) {
            console.log("Flag Counter loaded successfully.");
        } else {
            console.error("Failed to load Flag Counter:", response.statusText);
        }
    })
    .catch(error => {
        console.error("Error loading Flag Counter:", error);
    });
    