var links = document.querySelectorAll(".tabs li");

if (links.length) {
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      console.log("lINK WAS CLICKED!!");
      links.forEach((link) => {
        link.classList.remove('is-active');
      });
      link.classList.add('is-active');
    });
  });
}