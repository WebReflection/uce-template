fetch("my-counter.html")
  .then((b) => b.text())
  .then(component => {
    const template = document.createElement("template", { is: "uce-template" });
    template.innerHTML = component;
    document.body.appendChild(template);
  });
