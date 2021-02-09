import "../style/main.scss";

const htmlSquash = async (src) => {
  const res = await fetch(
    "/.netlify/functions/squash", {
    method: "POST",
    body: src,
  });
  const text = await res.text();
  if (res.status !== 200) {
    throw { code: res.status, msg: text, };
  }
  return text;
};

window.addEventListener("DOMContentLoaded", () => {
  ace.config.set("basePath", "https://pagecdn.io/lib/ace/1.4.12/");

  const editor = {
    mode: "ace/mode/html",
    theme: "ace/theme/chaos",
  };
  const elms = {
    input: {
      button: document.querySelector("#input button"),
      text: ace.edit("input-html-box", {
        ...editor,
        useSoftTabs: true,
      }),
      msgbox: document.querySelector("#input .msg-box"),
    },
    output: {
      text: ace.edit("output-html-box", {
        ...editor,
        readOnly: true,
      }),
    },
  };

  let msgtimer = null;
  const showMsg = (name, perm) => {
    elms.input.msgbox.querySelectorAll(".shown").forEach((e) => {
      e.classList.remove("shown");
    });
    elms.input.msgbox.querySelector("." + name).classList.add("shown");

    if (msgtimer) clearTimeout(msgtimer);
    if (!perm) {
      msgtimer = setTimeout(() => {
        showMsg("default", true);
      }, 5000);
    }
  };

  elms.input.button.addEventListener("click", async (e) => {
    elms.input.button.disabled = true;
    elms.input.text.setReadOnly(true);
    showMsg("processing", true);

    try {
      elms.output.text.setValue(await htmlSquash(elms.input.text.getValue()));
      showMsg("done");

    } catch (err) {
      console.error(err);
      showMsg(err === 408 ? "timeout" : "error");

    } finally {
      elms.input.button.disabled = false;
      elms.input.text.setReadOnly(false);
    }
  });
});