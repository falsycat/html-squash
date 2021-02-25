import jsdom from "jsdom"
import fetch from "node-fetch"

class Exception {
  constructor(code, msg) {
    this.code = code;
    this.msg = msg;
  }
};

const htmlSquash = async (src, urlRegex) => {
  const isExternal = (url) => {
    return (
      url !== "" &&
      !!url.match(/^(?:https?\:)?\/\//) &&
      !!url.match(urlRegex));
  };
  try {
    const dom = new jsdom.JSDOM(src);
    const doc = dom.window.document;
    await Promise.all([
      ...[...doc.querySelectorAll("script")].map(async (e) => {
        if (!isExternal(e.src)) {
          return;
        }
        try {
          const src = await fetch(e.src).then((p) => p.text());
          const s = doc.createElement("script");
          s.innerHTML = src;
          e.parentNode.replaceChild(s, e);
        } catch (err) {
        }
      }),
      ...[...doc.querySelectorAll("link[rel=stylesheet]")].map(async (e) => {
        if (!isExternal(e.href)) {
          return;
        }
        try {
          const s = doc.createElement("style");
          s.innerHTML = await fetch(e.href).then((p) => p.text());
          e.parentNode.replaceChild(s, e);
        } catch (err) {
        }
      })]);
    return "<!DOCTYPE html>"+doc.documentElement.outerHTML;
  } catch (err) {
    throw new Exception(500, err.message);
  }
};

exports.handler = async (ev, ctx) => {
  try {
    if (ev.httpMethod !== "POST") {
      throw new Exception(400, "invalid request method: " + ev.httpMethod);
    }
    const src      = ev.body;
    const urlRegex = ev.queryStringParameters.urlRegex || "";

    const ret = await htmlSquash(src, urlRegex);
    return {
      statusCode: 200,
      body: ret,
    };
  } catch (err) {
    return {
      statusCode: err.code,
      body: err.msg,
    };
  }
};