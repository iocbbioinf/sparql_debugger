import React from "react";
import { Button, Badge } from "react-bootstrap";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

import { corsProxy } from "./config";


const states = {
  OK:       { name: "ok",             variant: "success" },
  ERROR:    { name: "error",          variant: "danger" },
  TIMEOUT:  { name: "timeout",        variant: "warning" },
  CHECKING: { name: "checking\u2026", variant: "info" },
};


class Status extends React.Component {

  constructor(props) {
    super(props);

    this.controllers = {};
    this.state = {};
    this.isLoaded = false;

    for(const endpoint of this.props.endpoints)
      this.state[endpoint.name] = states.CHECKING;
  }


  reload() {
    for(const endpoint of this.props.endpoints) {
      this.setState({ [endpoint.name]: states.CHECKING });

      if(this.controllers[endpoint.name] != null)
        this.controllers[endpoint.name].abort();

      let controller = new AbortController();
      this.controllers[endpoint.name] = controller;

      const id = setTimeout(() => {
        controller.abort();
        this.setState({ [endpoint.name]: states.TIMEOUT });
      }, 30000);

      fetch(endpoint.endpoint, {
        method: 'POST',
        cache: 'no-cache',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/sparql-query',
          'Accept': 'application/sparql-results+json'
        },
        body: endpoint.query,
        signal: controller.signal
      })
      .catch(
        (error) => {
          if(error.name === 'AbortError')
            throw error;

          const data = new URLSearchParams();
          data.append('method', 'POST');
          data.append('endpoint', endpoint.endpoint);
          data.append('query', endpoint.query);

          return fetch(corsProxy , {
            method: 'POST',
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/sparql-results+json'
            },
            body: data.toString(),
            signal: controller.signal
          })
        })
      .then(
        (response) => {
          if(!response.ok)
            throw new Error('Network response was not ok');

          return response.json();
        })
      .then(
        () => {
          this.setState({ [endpoint.name]: states.OK });
        })
      .catch(
        (error) => {
          if(error.name !== 'AbortError')
            this.setState({ [endpoint.name]: states.ERROR });
        })
      .finally(
        () => {
          this.controllers[endpoint.name] = null;
          clearTimeout(id);
        })
    }
  }


  render() {
    if(this.props.isShown && !this.isLoaded) {
      this.isLoaded = true;
      this.reload();
    }

    return (
      <>
        <ul>
          { this.props.endpoints.map(endpoint => (
            <li key={endpoint.name}>
              <Badge variant={this.state[endpoint.name].variant}>{this.state[endpoint.name].name}</Badge>
              {' '}
              {endpoint.name}
            </li>
          ))}
        </ul>

        <Button variant="secondary" size="sm" className="mt-3" onClick={() => this.reload()}><Icon icon={faSyncAlt}/> Reload</Button>
      </>
    );
  }
}


export default Status;
