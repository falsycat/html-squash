import "../style/main.scss";

const htmlSquash = async (src) => {
  const res = await fetch(
    "/.netlify/functions/squash", {
    method: "POST",
    body: src,
  });
  const text = await res.text();
  if (res.status !== 200) {
    throw new Error(text);
  }
  return text;
};

window.addEventListener("DOMContentLoaded", () => {
  const elms = {
    input: {
      form: document.querySelector("#input form"),
      text: document.querySelector("#input textarea"),
    },
    output: {
      text: document.querySelector("#output textarea"),
    },
  };

  elms.input.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    elms.input.text.form.disabled = true;

    try {
      elms.output.text.value = await htmlSquash(elms.input.text.value);

    } catch (err) {
      console.error(err);

    } finally {
      elms.input.text.form.disabled = false;
    }
  });
});