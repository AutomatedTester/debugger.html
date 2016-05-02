/* global window, document */
"use strict";

const React = require("react");
const ReactDOM = require("react-dom");
const { bindActionCreators, combineReducers } = require("redux");
const { Provider } = require("react-redux");
const { AppContainer } = require("react-hot-loader");

const configureStore = require("./create-store");
const reducers = require("./reducers");
const { connectToClient, getThreadClient, debugTab } = require("./client");
const actions = require("./actions");

const createStore = configureStore({
  log: false,
  makeThunkArgs: args => {
    return Object.assign({}, args, { threadClient: getThreadClient() });
  }
});
const store = createStore(combineReducers(reducers));
const boundActions = bindActionCreators(actions, store.dispatch);
const {
  newTabs, newSource, paused, resumed,
  selectTab, selectSource, loadSources } = boundActions;

// global for debugging purposes only!
window.store = store;

connectToClient(response => {
  newTabs(response.tabs);

  // if there's a pre-selected tab, connect to it and load the sources.
  // otherwise, just show the toolbox.
  if (hasSelectedTab()) {
    const selectedTab = getSelectedTab(store.getState().tabs.get("tabs"));
    const tabActor = selectedTab.get("actor");
    debugTab({ tabActor, newSource, paused, resumed,
               selectTab, loadSources, selectSource })
      .then(renderToolbox);
  } else {
    renderToolbox();
  }
});

/**
 * Check to see if the url hash has a selected tab
 * e.g. #tab=child2
 */
function hasSelectedTab() {
  return window.location.hash.includes("tab");
}

/**
 * get the selected tab from the url hash
 * e.g. #tab=child2
 *
 * tabs are keyed by their child id,
 * this is because the actor connection id increments every refresh and
 * tab id is always 1.
 *
 */
function getSelectedTab(tabs) {
  const childId = window.location.hash.split("=")[1];
  return tabs.find(tab => tab.get("actor").includes(childId));
}

function renderToolbox() {
  ReactDOM.render(
    React.createElement(
      AppContainer,
      null,
      React.createElement(
        Provider,
        { store },
        React.createElement(require("./components/TabList"))
      )
    ),
    document.querySelector("#mount")
  );
}

if(module.hot) {
  module.hot.accept('./components/TabList.js', () => {
    renderToolbox();
  });
}
