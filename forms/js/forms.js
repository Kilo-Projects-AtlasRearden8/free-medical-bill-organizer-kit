// Free Medical Bill Organizer Kit — shared behavior
// Credit: Asdale Dynamics, LLC (education only, not billing advice)
(function () {
  var buttons = document.querySelectorAll('.k-btn-print');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function (e) {
      e.preventDefault();
      window.print();
    });
  }
})();
