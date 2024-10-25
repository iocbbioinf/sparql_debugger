import React, { useState } from "react";
import YasguiJS from "@triply/yasgui";

import TablePlus from "./TablePlus";
import { corsProxy } from "./config";
import { endpointBase } from "../config";

import "@triply/yasgui/build/yasgui.min.css";
import "./Yasgui.scss";


class Yasgui extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentTabId: null,
    };

    this.reference = React.createRef();
    this.yasgui = null;
  }

  componentDidMount() {
    

    const debugButton = document.createElement("button");
    debugButton.title = "Debug query";
    debugButton.setAttribute("aria-label", "Debug query");
    debugButton.style.border = "none";
    debugButton.style.background = "none"; // Optional: Remove background if needed
    debugButton.style.cursor = "pointer"; // Ensures the button still looks clickable
    

    const debugIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    debugIcon.setAttribute("viewBox", "0 0 24 24");
    debugIcon.setAttribute("width", "40");
    debugIcon.setAttribute("height", "40");
    debugIcon.innerHTML = `
    <path fill="black" d="M10.94 13.5l-1.32 1.32a3.73 3.73 0 0 0-7.24 0L1.06 13.5 0 14.56l1.72 1.72-.22.22V18H0v1.5h1.5v.08c.077.489.214.966.41 1.42L0 22.94 1.06 24l1.65-1.65A4.308 4.308 0 0 0 6 24a4.31 4.31 0 0 0 3.29-1.65L10.94 24 12 22.94 10.09 21c.198-.464.336-.951.41-1.45v-.1H12V18h-1.5v-1.5l-.22-.22L12 14.56l-1.06-1.06zM6 13.5a2.25 2.25 0 0 1 2.25 2.25h-4.5A2.25 2.25 0 0 1 6 13.5zm3 6a3.33 3.33 0 0 1-3 3 3.33 3.33 0 0 1-3-3v-2.25h6v2.25zm14.76-9.9v1.26L13.5 17.37V15.6l8.5-5.37L9 2v9.46a5.07 5.07 0 0 0-1.5-.72V.63L8.64 0l15.12 9.6z"/>`;
  
    // Add the icon (SVG) to the button
    debugButton.appendChild(debugIcon);
  
  
    /*
    const queryEl = drawSvgStringAsElement(imgs.query);
    addClass(queryEl, "queryIcon");
    this.debugButton.appendChild(queryEl);
    */

    debugButton.onclick = () => {
      console.log("MMO + yasgui")
      this.props.onDebugClick();
    };

    if(this.yasgui)
      return;
      
    this.yasgui = new YasguiJS(this.reference.current, {
      endpointCatalogueOptions: {
        getData: () => this.props.endpoints
      },
      yasqe : {
        value: this.props.defaultQuery,
        pluginButtons: (yasqeInstance) => {
          const buttons = [];  
          buttons.push(debugButton);
    
          return buttons; // Return an array of buttons to YasguiJS
        } 
      },
      requestConfig: {
        endpoint: this.props.defaultEndpoint
      },
      copyEndpointOnNewTab: false,
      corsProxy: corsProxy,
    });

    /*
    this.yasgui.on('tabChange', (instance, tab) => {
      this.props.onTabChange(tab.getId());
    });
    */

    this.yasgui.on('tabSelect', (instance, tabId) => {
      this.props.onTabChange(tabId);
    });

    this.yasgui.on('tabAdd', (instance, tabId) => {
      this.props.onTabChange(tabId);
    });


    this.props.onTabChange(this.yasgui.getTab().persistentJson.id)
    
  }


  render() {
    return <div ref={this.reference}/>;
  }


  demo(demo, run) {
    const tab = this.yasgui.addTab(true);
    tab.setEndpoint(demo.endpoint);
    tab.setName(demo.name);
    tab.setQuery(demo.query);

    if(run)
      tab.yasqe.query.call();
  }

  getCurrentQuery() {
    return this.yasgui.getTab().yasqe.getValue()
  }

  getCurrentEndpoint() {
    return this.yasgui.getTab().endpointSelect.value
  }

  setResponse(response) {
    this.yasgui.getTab().yasr.setResponse(response);
  }

  getTab(tabId) {
    return this.yasgui.getTab(tabId)
  }

}


window.info = fetch(endpointBase + "/sparql/endpoint/idsm?info", {
    method: "GET",
    headers: {
      "Accept": "application/json;",
    },
    redirect: "follow",
  }).then(response => response.json());


YasguiJS.Yasr.registerPlugin("table", TablePlus);

YasguiJS.Yasqe.defaults.autocompleters.splice(YasguiJS.Yasqe.defaults.autocompleters.indexOf('prefixes'), 1);
YasguiJS.Yasqe.defaults.autocompleters.splice(YasguiJS.Yasqe.defaults.autocompleters.indexOf('property'), 1);
YasguiJS.Yasqe.defaults.autocompleters.splice(YasguiJS.Yasqe.defaults.autocompleters.indexOf('class'), 1);

YasguiJS.Yasqe.forkAutocompleter("prefixes", {
  name: "prefixes-local",
  persistenceId: null,
  get: () => window.info.then(data => Object.keys(data.prefixes).map(key => key + ": <" + data.prefixes[key] + ">").sort())
    .catch(() => null)
});

YasguiJS.Yasqe.forkAutocompleter("property", {
  name: "property-local",
  persistenceId: null,
  get: (yasqe, token) => window.info.then(data => data.properties.filter(iri => iri.startsWith(token.autocompletionString)))
    .catch(() => yasqe.showNotification("autocomplete_property", "Failed fetching suggestions"))
});

YasguiJS.Yasqe.forkAutocompleter("class", {
  name: "class-local",
  persistenceId: null,
  get: (yasqe, token) => window.info.then(data => data.classes.filter(iri => iri.startsWith(token.autocompletionString)))
    .catch(() => yasqe.showNotification("autocomplete_class", "Failed fetching suggestions"))
});


export default Yasgui;
