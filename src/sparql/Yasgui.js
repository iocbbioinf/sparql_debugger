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
      
    if(this.yasgui)
      return;
      
    this.yasgui = new YasguiJS(this.reference.current, {
      endpointCatalogueOptions: {
        getData: () => this.props.endpoints
      },
      yasqe : {
        createShareableLink: null,
        consumeShareLink: null,
        value: this.props.defaultQuery,
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

    this.yasgui.on('queryResponse', (instance, tab) => {
      this.props.onQueryResponse(tab);
    })

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

  getCurrentConfig() {
    return this.yasgui.getTab().getRequestConfig();
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
