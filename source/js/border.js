var back = document.querySelector('.example__back');
var next = document.querySelector('.example__next');

back.onmousedown = function () {
  back.style.border = 'none'
}

back.onmouseup = function () {
  back.style='none'
}

next.onmousedown = function () {
  next.style.border = 'none'
}

next.onmouseup = function () {
  next.style='none'
}
