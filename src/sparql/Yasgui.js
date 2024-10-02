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
    debugButton.textContent = "Debug"; // Button text or you can use an icon
    debugButton.title = "Debug query";
    debugButton.setAttribute("aria-label", "Debug query");

    const debugIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    debugIcon.setAttribute("viewBox", "0 0 24 24");
    debugIcon.setAttribute("width", "16");
    debugIcon.setAttribute("height", "16");
    debugIcon.innerHTML = `
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      <path d="M12 6a1 1 0 0 0-1 1v6.586l4.293 4.293 1.414-1.414L13 12.586V7a1 1 0 0 0-1-1z"/>`;
  
    // Add the icon (SVG) to the button
    debugButton.appendChild(debugIcon);
  
  
    /*
    const queryEl = drawSvgStringAsElement(imgs.query);
    addClass(queryEl, "queryIcon");
    this.debugButton.appendChild(queryEl);
    */

    /*
    debugButton.onclick = () => {
      if (this.config.queryingDisabled) return; // Don't do anything
      if (this.req) {
        this.abortQuery();
      } else {
        this.query().catch(() => {}); //catch this to avoid unhandled rejection
      }
    };
    */

    debugButton.onclick = this.props.handleDebugClick;

    if(this.yasgui)
      return;
      
    this.yasgui = new YasguiJS(this.reference.current, {
      endpointCatalogueOptions: {
        getData: () => this.props.endpoints
      },
      yasqe : {
        value: this.props.defaultQuery,
        pluginButtons: (yasqeInstance) => {
          // You can customize this array with other plugin buttons, either your own or YasguiJS built-ins
          const buttons = [];
  
          // Add the custom debug button
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
