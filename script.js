document.querySelectorAll('.q button').forEach(function (b) {
  b.addEventListener('click', function () { b.parentElement.classList.toggle('open'); });
});
document.querySelectorAll('.nav a').forEach(function (a) {
  a.addEventListener('click', function () { document.getElementById('nav').classList.remove('open'); });
});
