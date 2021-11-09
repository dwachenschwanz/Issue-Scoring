import App from "./app.js";

window.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");
  const page = document.getElementById("page");

  const app = new App(page);
});
