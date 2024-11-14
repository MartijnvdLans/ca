document.getElementById("hamburger-menu").addEventListener("click", function() {
    const nav = document.querySelector(".navigation");
    const barLeft = document.querySelector(".bar:nth-of-type(1)");
    const bars = document.querySelectorAll(".bar");

    nav.classList.toggle("navActive");

    barLeft.classList.toggle("rotLeft");

    bars.forEach(bar => bar.classList.toggle("rot"));
});
