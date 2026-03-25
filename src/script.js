 document.getElementById("loginButton").onclick = function() {
      // Esconde a área de login
      document.getElementById("loginArea").style.display = "none";
      // Mostra o blog
      document.getElementById("blog").style.display = "block";
      document.getElementById("blog").scrollIntoView({behavior: "smooth"});
    };
