Promise.all([
  customElements.whenDefined('uce-template'),
  fetch('my-counter.uce').then((b) => b.text())
]).then(([Template = customElements.get('uce-template'), parts]) => {
  document.body.appendChild(Template.from(parts));
});
