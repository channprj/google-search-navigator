// ==UserScript==
// @name         Google Search Navigator
// @description  Navigate google search with custom shortcuts
// @namespace    https://github.com/channprj/google-search-navigator
// @icon         https://user-images.githubusercontent.com/1831308/60544915-c043e700-9d54-11e9-9eb0-5c80c85d3a28.png
// @version      0.3
// @author       channprj
// @run-at       document-end
// @include      http*://*.google.tld/search*
// @include      http*://*.google.*/search*
// ==/UserScript==

const styles = {
  highlight:
    "padding-left: 8px; margin-left: -12px; border-left: 4px solid red;",
  normal: "",
};

const moveCursorToEnd = (element) => {
  element.focus();
  if (element.setSelectionRange) {
    const len = element.value.length * 2;
    element.setSelectionRange(len, len);
  } else {
    element.value = element.value;
  }
};

// work in progress...
const observer = new MutationObserver((mutations) => {});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

const results = document.getElementById("rso");

// Select first item
results.childNodes[0].getElementsByTagName("a")[0].focus();
results.childNodes[0].style.cssText = styles.highlight;

const searchInputElement = document.querySelector("div input.gsfi");

// Focus searchbox when slash is pressed
window.addEventListener("keyup", (event) => {
  event = event || window.event;
  const keyCode = event.code;

  if (keyCode === "Slash") {
    moveCursorToEnd(searchInputElement);

    return;
  }
});

// TODO: focus pagination after results

let focusIndex = 0;
window.addEventListener("keypress", (event) => {
  event = event || window.event;

  const keyCode = event.code;
  if (searchInputElement !== document.activeElement) {
    if (keyCode === "KeyJ" || keyCode === "ArrowDown") {
      if (focusIndex < results.childNodes.length - 1) {
        results.childNodes[focusIndex].style.cssText = styles.normal;
        focusIndex += 1;
      }

      results.childNodes[focusIndex].style.cssText = styles.highlight;
      results.childNodes[focusIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (keyCode === "KeyK" || keyCode === "ArrowUp") {
      results.childNodes[focusIndex].style.cssText = styles.normal;
      if (focusIndex > 0) {
        focusIndex -= 1;
      }

      results.childNodes[focusIndex].style.cssText = styles.highlight;
      results.childNodes[focusIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (keyCode === "Enter") {
      const selectedLink =
        results.childNodes[focusIndex].getElementsByTagName("a")[0];
      selectedLink.click();
      return;
    }

    if (keyCode === "KeyL") {
      document.getElementById("pnnext")?.click();
      return;
    }

    if (keyCode === "KeyH") {
      document.getElementById("pnprev")?.click();
      return;
    }
  }
});

// const pagination = document.getElementById('navcnt').getElementsByTagName('tr')
// pagination[0].children
