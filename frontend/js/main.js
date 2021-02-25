import "../style/main.scss";

const htmlSquash = async (src, urlRegex) => {
  const res = await fetch(
    "/.netlify/functions/squash?urlRegex="+encodeURI(urlRegex), {
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
      option: document.querySelector("#input button.option"),
      squash: document.querySelector("#input button.squash"),
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
    option: {
      popup: document.querySelector("#option"),
      urlRegex: document.querySelector("#option input.url-regex"),
      close: document.querySelector("#option button.close"),
    },
  };

  elms.input.option.addEventListener("click", async (e) => {
    elms.option.popup.classList.add("shown");
  });
  elms.option.close.addEventListener("click", async (e) => {
    elms.option.popup.classList.remove("shown");
  })

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

  elms.input.squash.addEventListener("click", async (e) => {
    elms.input.squash.disabled = true;
    elms.input.text.setReadOnly(true);
    showMsg("processing", true);

    try {
      const src      = elms.input.text.getValue();
      const urlRegex = elms.option.urlRegex.value;
      elms.output.text.setValue(await htmlSquash(src, urlRegex));
      showMsg("done");

    } catch (err) {
      console.error(err);
      showMsg(err === 408 ? "timeout" : "error");

    } finally {
      elms.input.squash.disabled = false;
      elms.input.text.setReadOnly(false);
    }
  });
});