import React from "react";
import { Container, Row, Col, Accordion, Card, Button } from "react-bootstrap";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faBook, faInfoCircle, faServer, faPlay, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import { trackPageView } from "../matomo.js"

import Yasgui from "./Yasgui"
import Statistics from "./Statistics"
import Status from "./Status"
import { servletBase } from "../config";
import { endpoints, defaultEndpoint, defaultQuery } from "./config";
import { demoQueries } from "./demos";

import IdsmSparqlDebugger from "../IdsmSparqlDebugger.js"


import "./Sparql.scss";


function CustomToggle(props) {
  const decoratedOnClick = useAccordionButton(props.eventKey);

  return (
    <Button variant={props.variant} className="w-100" onClick={decoratedOnClick}>
      {props.children}
    </Button>
  );
}


function Sparql() {
  React.useEffect(() => {
    document.title = "IDSM / SPARQL GUI";
    trackPageView();
  }, []);

  React.useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, []);

  const [statusIsOpen, setStatusIsOpen] = React.useState(false);

  const [currentYasguiTabId, setCurrentYasguiTabId] = React.useState(null);

  const yasgui = React.useRef(null);

  const idsmSparqlDebugger = React.useRef(null);

  const handleTabChange = (newTabId) => {
    setCurrentYasguiTabId(newTabId);
  };

  const handleDebugClick = () => {
    console.log("MMO + Sparql")
    idsmSparqlDebugger.current?.handleDebugClick(currentYasguiTabId);
  }

  const handleQueryResponse = (tab) => {
    idsmSparqlDebugger.current?.handleQueryResponse(tab);
  }

  return (
    <Container fluid className="mt-3">
      <Row>
        <Col xl={3} lg={4} md={5} sm={12} className="sparql-panel mb-4">

          <h2>SPARQL Federated Query Debugger</h2>
          <p>
            Detailed execution data can help identify the specific service responsible for an error or high latency, even if it is deeply nested within the query structure.
          </p>
          <p>
            <a target="_blank" href="https://github.com/iocbbioinf/sparql_debugger"><Icon icon={faBook}/> Docs </a>
          </p>

          <Accordion>
            {
              demoQueries.map((group, index) =>
                <Card key={'' + index}>
                  <Card.Header>
                    <CustomToggle variant="outline-primary" block eventKey={'' + index}>
                      {group.name}
                    </CustomToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey={'' + index}>
                    <Card.Body className="demo-section">
                      <p>{group.description}</p>
                      {
                        group.queries.map((demo, subindex) =>
                          <Accordion key={'' + subindex}>
                            <Card>
                              <Card.Header>
                                <CustomToggle variant="outline-secondary" block eventKey={'' + subindex}>
                                  {demo.name}
                                </CustomToggle>
                              </Card.Header>
                              <Accordion.Collapse eventKey={'' + subindex}>
                                <Card.Body>
                                  <p>{demo.description}</p>
                                  <Button onClick={() => {yasgui.current.demo(demo, false)}}><Icon icon={faEdit}/> Edit query</Button>
                                </Card.Body>
                              </Accordion.Collapse>
                            </Card>
                          </Accordion>
                        )
                      }
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              )
            }
          </Accordion>
        </Col>

        <Col xl={6} lg={5} md={4} sm={12} style={{position: "inherit"}}>
          <Yasgui onDebugClick={handleDebugClick} onTabChange={handleTabChange} onQueryResponse={handleQueryResponse} ref={yasgui} endpoints={endpoints} defaultEndpoint={defaultEndpoint} defaultQuery={defaultQuery}/>
        </Col>    
        <Col xl={3} lg={3} md={3} sm={12}>
          <IdsmSparqlDebugger yasgui={yasgui} currentTabKey={currentYasguiTabId} ref={idsmSparqlDebugger}/>
        </Col>
      </Row>  
    </Container>
    
  );
}


export default Sparql;
