// ==UserScript==
// @name         Google Search Navigator
// @description  Navigate google search with custom shortcuts
// @namespace    https://github.com/channprj/google-search-navigator
// @icon         https://user-images.githubusercontent.com/1831308/60544915-c043e700-9d54-11e9-9eb0-5c80c85d3a28.png
// @version      0.5
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

// Selectors
const resultElements = document.querySelectorAll(".MjjYud");
const searchInputElement = document.querySelector("div textarea");
const contentWrapper = document.querySelector("#rcnt");

const moveCursorToEnd = (element) => {
  element.focus();
  if (element.setSelectionRange) {
    const len = element.value.length * 2;
    element.setSelectionRange(len, len);
  } else {
    element.value = element.value;
  }
};

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

const initializeFirstResult = (resultElements) => {
  if (resultElements && resultElements.length > 0) {
    let firstValidIndex = 0;
    while (
      firstValidIndex < resultElements.length &&
      !isValidResultNode(resultElements[firstValidIndex])
    ) {
      firstValidIndex++;
    }
    if (firstValidIndex < resultElements.length) {
      const firstLink =
        resultElements[firstValidIndex].getElementsByTagName("a")[0];
      if (firstLink) {
        firstLink.focus();
      }
      highlightResult(firstValidIndex, resultElements);
      return firstValidIndex;
    }
  }
  return 0;
};

const handlePagination = (direction) => {
  if (
    document.activeElement.tagName === "INPUT" ||
    document.activeElement.tagName === "TEXTAREA" ||
    document.activeElement.contentEditable === "true"
  ) {
    return;
  }

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

// Initialize with first valid result
let focusIndex = initializeFirstResult(resultElements);

// TODO: Support nested rich lists (Image, Video, News, etc.)

// TODO: Support paginator navigation

window.addEventListener("keyup", (event) => {
  event.preventDefault();
  const keyCode = event.code;

  if (keyCode === "KeyJ" || keyCode === "ArrowDown") {
    clearHighlight(focusIndex, resultElements);
    focusIndex = findNextValidIndex(focusIndex, resultElements);
    highlightResult(focusIndex, resultElements);
    return;
  }

  if (keyCode === "KeyK" || keyCode === "ArrowUp") {
    clearHighlight(focusIndex, resultElements);
    focusIndex = findPrevValidIndex(focusIndex, resultElements);
    highlightResult(focusIndex, resultElements);
    return;
  }

  if (keyCode === "Enter") {
    navigateToResult(focusIndex, resultElements);
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

  if (keyCode === "Escape") {
    contentWrapper.click();
    searchInputElement.blur();
    highlightResult(focusIndex, resultElements);
    return;
  }
});

// const pagination = document.getElementById('navcnt').getElementsByTagName('tr')
// pagination[0].children
