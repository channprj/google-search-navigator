// ==UserScript==
// @name         Google Search Shortcuts for Vim User
// @description  Navigate Google Search with Custom Shortcuts
// @namespace    https://github.com/channprj/google-search-shortcuts
// @icon         https://user-images.githubusercontent.com/1831308/60544915-c043e700-9d54-11e9-9eb0-5c80c85d3a28.png
// @version      0.1
// @author       CHANN
// @run-at       document-end
// @include      http*://*.google.tld/search*
// @include      http*://*.google.*/search*
// ==/UserScript==

function moveCursorToEnd(element) {
  element.focus();
  if (element.setSelectionRange) {
    const len = element.value.length * 2;
    element.setSelectionRange(len, len);
  } else {
    element.value = element.value;
  }
}

// work in progress...
const observer = new MutationObserver(mutations => {
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});


// default selection
document.getElementById('search').getElementsByClassName('g')[0].getElementsByTagName('a')[0].focus()

// focus on searchbox
const searchInputElement = document.querySelector('div input.gsfi');

window.addEventListener('keyup', (event) => {
  event = event || window.event;
  const keyCode = event.code;

  if (keyCode === 'Slash') {
    moveCursorToEnd(searchInputElement);

    return;
  }
});

// focus on results
// TODO: focus pagination after results
let focusIndex = -1;

window.addEventListener('keypress', (event) => {
  event = event || window.event;

  const keyCode = event.code;
  const results = document.getElementById('search').getElementsByClassName('g');
  if (searchInputElement !== document.activeElement) {
    if (keyCode === 'KeyJ' || keyCode === 'ArrowDown') {
      if (focusIndex < results.length-1) {
        focusIndex += 1;
      }

      results[focusIndex].getElementsByTagName('a')[0].focus();
      return;
    }

    if (keyCode === 'KeyK' || keyCode === 'ArrowUp') {
      if (focusIndex > 0) {
        focusIndex -= 1;
      }

      results[focusIndex].getElementsByTagName('a')[0].focus();
      return;
    }
  }
});


// const pagination = document.getElementById('navcnt').getElementsByTagName('tr')
// pagination[0].children
