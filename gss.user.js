// ==UserScript==
// @name         Google Search Navigator
// @description  Navigate google search with custom shortcuts
// @namespace    https://github.com/channprj/google-search-navigator
// @icon         https://user-images.githubusercontent.com/1831308/60544915-c043e700-9d54-11e9-9eb0-5c80c85d3a28.png
// @version      0.4
// @author       channprj
// @run-at       document-end
// @include      http*://*.google.tld/search*
// @include      http*://*.google.*/search*
// ==/UserScript==

const styles = {
  selectedLink:
    "padding-left:8px; margin-left:-12px; border-left:4px solid red;",
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

// Helper functions for result navigation
const isValidResultNode = (node) => {
  return node && node.childElementCount > 0 && node.offsetHeight > 0;
};

const findNextValidIndex = (currentIndex, childNodes) => {
  let nextIndex = currentIndex + 1;
  while (
    nextIndex < childNodes.length &&
    !isValidResultNode(childNodes[nextIndex])
  ) {
    nextIndex++;
  }
  return nextIndex < childNodes.length ? nextIndex : currentIndex;
};

const findPrevValidIndex = (currentIndex, childNodes) => {
  let prevIndex = currentIndex - 1;
  while (prevIndex >= 0 && !isValidResultNode(childNodes[prevIndex])) {
    prevIndex--;
  }
  return prevIndex >= 0 ? prevIndex : currentIndex;
};

const highlightResult = (index, childNodes) => {
  if (
    index >= 0 &&
    index < childNodes.length &&
    isValidResultNode(childNodes[index])
  ) {
    childNodes[index].style.cssText = styles.selectedLink;
    childNodes[index].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};

const clearHighlight = (index, childNodes) => {
  if (index >= 0 && index < childNodes.length) {
    childNodes[index].style.cssText = styles.normal;
  }
};

const navigateToResult = (index, childNodes) => {
  if (
    index >= 0 &&
    index < childNodes.length &&
    isValidResultNode(childNodes[index])
  ) {
    const selectedLink = childNodes[index].getElementsByTagName("a")[0];
    if (selectedLink) {
      selectedLink.click();
    }
  }
};

const initializeFirstResult = (results) => {
  if (results && results.length > 0) {
    let firstValidIndex = 0;
    while (
      firstValidIndex < results.length &&
      !isValidResultNode(results[firstValidIndex])
    ) {
      firstValidIndex++;
    }
    if (firstValidIndex < results.length) {
      const firstLink = results[firstValidIndex].getElementsByTagName("a")[0];
      if (firstLink) {
        firstLink.focus();
      }
      highlightResult(firstValidIndex, results);
      return firstValidIndex;
    }
  }
  return 0;
};

const handlePagination = (direction) => {
  const pageButton = document.getElementById(
    direction === "next" ? "pnnext" : "pnprev"
  );
  pageButton?.click();
};

const focusSearchInput = (searchInput) => {
  moveCursorToEnd(searchInput);
};

// work in progress...
const observer = new MutationObserver((mutations) => {});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Search result items
const results = document.querySelectorAll(".MjjYud");

// Initialize with first valid result
let focusIndex = initializeFirstResult(results);

const searchInputElement = document.querySelector("div input.gsfi");

// Focus searchbox when slash is pressed
window.addEventListener("keyup", (event) => {
  event = event || window.event;
  const keyCode = event.code;

  if (keyCode === "Slash") {
    focusSearchInput(searchInputElement);
    return;
  }
});

// TODO: Support nested rich lists (Image, Video, News, etc.)

// TODO: Support paginator navigation

window.addEventListener("keydown", (event) => {
  const keyCode = event.code;

  if (searchInputElement !== document.activeElement) {
    if (keyCode === "KeyJ" || keyCode === "ArrowDown") {
      event.preventDefault();
      clearHighlight(focusIndex, results);
      focusIndex = findNextValidIndex(focusIndex, results);
      highlightResult(focusIndex, results);
      return;
    }

    if (keyCode === "KeyK" || keyCode === "ArrowUp") {
      event.preventDefault();
      clearHighlight(focusIndex, results);
      focusIndex = findPrevValidIndex(focusIndex, results);
      highlightResult(focusIndex, results);
      return;
    }

    if (keyCode === "Enter") {
      navigateToResult(focusIndex, results);
      return;
    }

    if (keyCode === "KeyL" || keyCode === "ArrowRight") {
      handlePagination("next");
      return;
    }

    if (keyCode === "KeyH" || keyCode === "ArrowLeft") {
      handlePagination("prev");
      return;
    }
  }
});

// const pagination = document.getElementById('navcnt').getElementsByTagName('tr')
// pagination[0].children
