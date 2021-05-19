function openNav() {
    document.getElementById("navbtn").className = "navSubmitbtn-disable"
    document.getElementById("navbtn2").style.marginRight = "62rem";
    document.getElementById("navID").className = "nav";
    document.getElementById("navID").style.width = "100%";
    document.getElementById("navbtn2").setAttribute("onClick", "closeNav()")
    document.getElementById("navbtn").innerHTML = '&#x2718;'
    document.getElementById("navbtn2").innerHTML = '&#x2718;'

    setTimeout(() => {
      closeNav()
      clearTimeout()
    }, 4200);
  }

  function closeNav() {
    document.getElementById("navbtn").className = "navSubmitbtn"
    document.getElementById("navID").className = "nav-disable";
    document.getElementById("navID").style.width = "0";
    document.getElementById("navbtn").setAttribute("onClick", "openNav()")
    document.getElementById("navbtn").innerHTML = "☰"
    clearTimeout()
  }