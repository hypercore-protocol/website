var menu = document.getElementById('mobile-menu')
document.getElementById('mobile-menu-btn').addEventListener('click', function (e) {
  e.preventDefault()
  menu.classList.toggle('open')
})