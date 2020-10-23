// ==UserScript==
// @name         Google Search Navigator
// @description  Navigate google search with custom shortcuts
// @namespace    https://github.com/channprj/google-search-navigator
// @icon         https://user-images.githubusercontent.com/1831308/60544915-c043e700-9d54-11e9-9eb0-5c80c85d3a28.png
// @version      0.2
// @author       channprj
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


// init selection
const initSelection = document.getElementById('search').getElementsByClassName('g')[0];
initSelection.getElementsByTagName('a')[0].focus();
initSelection.style.cssText = 'padding-left: 8px; border-left: 4px solid red;';

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
let focusIndex = 0;

window.addEventListener('keypress', (event) => {
  event = event || window.event;

  const keyCode = event.code;
  const results = document.getElementById('search').getElementsByClassName('g');
  if (searchInputElement !== document.activeElement) {
    if (keyCode === 'KeyJ' || keyCode === 'ArrowDown') {
      if (focusIndex < results.length-1) {
        results[focusIndex].style.cssText = ''
        focusIndex += 1;
      }

      results[focusIndex].getElementsByTagName('a')[0].focus();
      results[focusIndex].style.cssText = 'padding-left: 8px; border-left: 4px solid red;'
      return;
    }

    if (keyCode === 'KeyK' || keyCode === 'ArrowUp') {
      results[focusIndex].style.cssText = ''
      if (focusIndex > 0) {
        focusIndex -= 1;
      }

      results[focusIndex].getElementsByTagName('a')[0].focus();
      results[focusIndex].style.cssText = 'padding-left: 8px; border-left: 4px solid red;'
      return;
    }

    if (keyCode === 'KeyL') {
      document.getElementById('pnnext')?.click();
      return;
    }

    if (keyCode === 'KeyH') {
      document.getElementById('pnprev')?.click();
      return;
    }
  }
});


// const pagination = document.getElementById('navcnt').getElementsByTagName('tr')
// pagination[0].children
