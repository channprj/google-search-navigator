// ==UserScript==
// @name         Google Search Navigator
// @description  Navigate google search with custom shortcuts
// @namespace    https://github.com/channprj/google-search-navigator
// @icon         https://user-images.githubusercontent.com/1831308/60544915-c043e700-9d54-11e9-9eb0-5c80c85d3a28.png
// @version      0.8
// @author       channprj
// @run-at       document-end
// @include      http*://*.google.tld/search*
// @include      http*://*.google.*/search*
// ==/UserScript==

(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    styles: {
      selectedLink:
        "padding-left:8px; margin-left:-12px; border-left:4px solid red;",
      normal: "",
    },
    selectors: {
      resultElements: ".MjjYud",
      nestedResultElements: ".A6K0A",
      searchInput: "div textarea",
      contentWrapper: "#rcnt",
      nextButton: "#pnnext",
      prevButton: "#pnprev",
    },
    scrollBehavior: {
      behavior: "smooth",
      block: "center",
    },
  };

  // DOM Elements Cache
  class DOMCache {
    constructor() {
      this.refresh();
    }

    refresh() {
      this._resultElements = document.querySelectorAll(
        CONFIG.selectors.resultElements
      );
      const nestedElements = document.querySelectorAll(
        CONFIG.selectors.nestedResultElements
      );

      // Use nested elements if available (for specialized search results)
      if (nestedElements.length > 0) {
        this._resultElements = nestedElements;
      }

      this._searchInput = document.querySelector(CONFIG.selectors.searchInput);
      this._contentWrapper = document.querySelector(
        CONFIG.selectors.contentWrapper
      );
    }

    get resultElements() {
      return this._resultElements;
    }

    get searchInput() {
      return this._searchInput;
    }

    get contentWrapper() {
      return this._contentWrapper;
    }
  }

  const domCache = new DOMCache();

  // Utility Functions
  const Utils = {
    isTextElementFocused() {
      const el = document.activeElement;
      return (
        el &&
        ((el.tagName.toLowerCase() === "input" &&
          (el.type === "text" ||
            el.type === "search" ||
            el.type === "email" ||
            el.type === "password" ||
            el.type === "url")) ||
          el.tagName.toLowerCase() === "textarea" ||
          el.contentEditable === "true")
      );
    },

    moveCursorToEnd(element) {
      if (!element) return;

      element.focus();
      if (element.setSelectionRange) {
        const len = element.value.length * 2;
        element.setSelectionRange(len, len);
      } else {
        element.value = element.value;
      }
    },

    isValidResultNode(node) {
      return node && node.childElementCount > 0 && node.offsetHeight > 0;
    },

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
  };

  // Navigation Controller
  class NavigationController {
    constructor() {
      this.focusIndex = 0;
      this.initialize();
    }

    initialize() {
      this.focusIndex = this.initializeFirstResult();
    }

    findNextValidIndex(currentIndex) {
      const elements = domCache.resultElements;
      let nextIndex = currentIndex + 1;

      while (
        nextIndex < elements.length &&
        !Utils.isValidResultNode(elements[nextIndex])
      ) {
        nextIndex++;
      }

      return nextIndex < elements.length ? nextIndex : currentIndex;
    }

    findPrevValidIndex(currentIndex) {
      const elements = domCache.resultElements;
      let prevIndex = currentIndex - 1;

      while (prevIndex >= 0 && !Utils.isValidResultNode(elements[prevIndex])) {
        prevIndex--;
      }

      return prevIndex >= 0 ? prevIndex : currentIndex;
    }

    setHighlight(index) {
      const elements = domCache.resultElements;
      if (
        index >= 0 &&
        index < elements.length &&
        Utils.isValidResultNode(elements[index])
      ) {
        elements[index].style.cssText = CONFIG.styles.selectedLink;
        elements[index].scrollIntoView(CONFIG.scrollBehavior);
      }
    }

    clearHighlight(index) {
      const elements = domCache.resultElements;
      if (index >= 0 && index < elements.length) {
        elements[index].style.cssText = CONFIG.styles.normal;
      }
    }

    clickItem(index, openInNewTab = false) {
      const elements = domCache.resultElements;
      if (
        index >= 0 &&
        index < elements.length &&
        Utils.isValidResultNode(elements[index])
      ) {
        const selectedLink = elements[index].getElementsByTagName("a")[0];
        if (selectedLink) {
          if (openInNewTab) {
            // Open in new background tab
            window.open(selectedLink.href, "_blank");
          } else {
            selectedLink.click();
          }
        }
      }
    }

    initializeFirstResult() {
      const elements = domCache.resultElements;
      if (!elements || elements.length === 0) return 0;

      let firstValidIndex = 0;
      while (
        firstValidIndex < elements.length &&
        !Utils.isValidResultNode(elements[firstValidIndex])
      ) {
        firstValidIndex++;
      }

      if (firstValidIndex < elements.length) {
        this.setHighlight(firstValidIndex);
        return firstValidIndex;
      }

      return 0;
    }

    navigateNext() {
      this.clearHighlight(this.focusIndex);
      this.focusIndex = this.findNextValidIndex(this.focusIndex);
      this.setHighlight(this.focusIndex);
    }

    navigatePrev() {
      this.clearHighlight(this.focusIndex);
      this.focusIndex = this.findPrevValidIndex(this.focusIndex);
      this.setHighlight(this.focusIndex);
    }

    openItem(openInNewTab = false) {
      this.clickItem(this.focusIndex, openInNewTab);
    }

    refresh() {
      domCache.refresh();
      this.initialize();
    }
  }

  // Pagination Handler
  const PaginationHandler = {
    handlePagination(direction) {
      if (Utils.isTextElementFocused()) {
        return;
      }

      const buttonId =
        direction === "next"
          ? CONFIG.selectors.nextButton
          : CONFIG.selectors.prevButton;
      const pageButton = document.querySelector(buttonId);

      if (pageButton) {
        pageButton.click();
      }
    },
  };

  // Search Input Handler
  const SearchInputHandler = {
    focusSearchInput() {
      const searchInput = domCache.searchInput;
      if (searchInput) {
        Utils.moveCursorToEnd(searchInput);
      }
    },

    blurSearchInput() {
      const searchInput = domCache.searchInput;
      if (searchInput) {
        searchInput.blur();
      }
    },
  };

  // Initialize navigation controller
  const navigation = new NavigationController();

  // Keyboard Event Handler
  const KeyboardHandler = {
    handleKeyEvent(event) {
      const keyCode = event.code;

      // Navigation keys
      if (keyCode === "KeyJ" || keyCode === "ArrowDown") {
        event.preventDefault();
        navigation.navigateNext();
        return;
      }

      if (keyCode === "KeyK" || keyCode === "ArrowUp") {
        event.preventDefault();
        navigation.navigatePrev();
        return;
      }

      // Activation key
      if (keyCode === "Enter" && !Utils.isTextElementFocused()) {
        event.preventDefault();
        // Check for Cmd+Enter (metaKey on macOS)
        if (event.metaKey) {
          console.log("Cmd+Enter detected - opening in new tab");
          navigation.openItem(true); // Open in new tab
        } else {
          console.log("Enter detected - normal navigation");
          navigation.openItem(false); // Normal navigation
        }
        return;
      }

      // Pagination keys
      if (keyCode === "KeyL" || keyCode === "ArrowRight") {
        event.preventDefault();
        PaginationHandler.handlePagination("next");
        return;
      }

      if (keyCode === "KeyH" || keyCode === "ArrowLeft") {
        event.preventDefault();
        PaginationHandler.handlePagination("prev");
        return;
      }

      // Escape key
      if (keyCode === "Escape") {
        event.preventDefault();
        const contentWrapper = domCache.contentWrapper;
        if (contentWrapper) {
          contentWrapper.click();
        }
        SearchInputHandler.blurSearchInput();
        navigation.setHighlight(navigation.focusIndex);
        return;
      }

      // Search focus key
      if (keyCode === "Slash") {
        event.preventDefault();
        SearchInputHandler.focusSearchInput();
        return;
      }
    },
  };

  // DOM Observer for dynamic content
  const DOMObserver = {
    observer: null,

    init() {
      this.observer = new MutationObserver(
        Utils.debounce((mutations) => {
          // Check if search results have changed
          const hasNewResults = mutations.some((mutation) =>
            Array.from(mutation.addedNodes).some(
              (node) =>
                node.nodeType === Node.ELEMENT_NODE &&
                ((node.matches &&
                  node.matches(CONFIG.selectors.resultElements)) ||
                  (node.querySelector &&
                    node.querySelector(CONFIG.selectors.resultElements)))
            )
          );

          if (hasNewResults) {
            navigation.refresh();
          }
        }, 250)
      );

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    },

    disconnect() {
      if (this.observer) {
        this.observer.disconnect();
      }
    },
  };

  // Event Listeners
  const setupEventListeners = () => {
    window.addEventListener("keydown", KeyboardHandler.handleKeyEvent);

    // Handle page unload
    window.addEventListener("beforeunload", () => {
      DOMObserver.disconnect();
    });
  };

  // Initialize the application
  const init = () => {
    try {
      DOMObserver.init();
      setupEventListeners();

      console.log("Google Search Navigator initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Google Search Navigator:", error);
    }
  };

  // Start the application
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
