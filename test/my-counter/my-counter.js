Promise.all([
  customElements.whenDefined('uce-template'),
  fetch("my-counter.html").then((b) => b.text())
]).then(([Template, parts]) => {
  document.body.appendChild(Template.from(parts));
});
