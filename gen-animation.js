const widBar = 700
const heiBar = 30
const wid = 10
const hei = 30
const n = widBar / wid * heiBar / hei

// random()
bisect()
// stream()

function stream () {
  for (let i = 0; i < n; i++) {
    if (i === 0) div(0)
    else if (i === n - 1) div(150)
    else if (i % 10 === 0) div(i / 10 * 150 + 500)
    else div(Math.random() * 1000 + 1500)
  }
}

function bisect () {
  for (let i = 0; i < n; i++) {
    if (i === n - 1) div(0)
    else if (i === n - 3) div(150)
    else if (i === n - 9) div(300)
    else if (i === n - 17) div(450)
    else if (i === n - 33) div(600)
    else if (i === n - 65) div(750)
    else div(Math.random() * 800 + 1250)
  }
}

function random () {
  for (let i = 0; i < n; i++) {
    div(Math.random() * 1000)
  }
}

function div (delay) {
  delay = Math.round(delay)
  const n = Math.floor(delay / 1000)
  const m = delay % 1000
  console.log('<div style="animation-delay: ' + n + '.' + m + 's;"></div>')
}
