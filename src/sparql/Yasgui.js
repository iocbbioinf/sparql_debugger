import React from "react";
import YasguiJS from "@triply/yasgui";

import TablePlus from "./TablePlus";
import { corsProxy } from "./config";
import { endpointBase } from "../config";

import "@triply/yasgui/build/yasgui.min.css";
import "./Yasgui.scss";


class Yasgui extends React.Component {

  constructor(props) {
    super(props);

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
        value: this.props.defaultQuery
      },
      requestConfig: {
        endpoint: this.props.defaultEndpoint
      },
      copyEndpointOnNewTab: false,
      corsProxy: corsProxy
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
