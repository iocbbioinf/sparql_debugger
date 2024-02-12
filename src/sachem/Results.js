import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, ButtonGroup, Card, Container, Row, Col, OverlayTrigger, Popover, Spinner, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleLeft, faAngleUp, faAngleDown, faImage, faEdit, faTable, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import { makeHash } from "./hash.js";
import { search, getQuery, getEndpoint, getDownloadLink, getCompoundStructure } from "./idsm.js";


function Compound(props) {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);

  function editMol() {
    setLoading(true);

    getCompoundStructure(props.iri)
    .then(mol => {
      navigate("../search/" + makeHash(mol, props.params));
    })
    .catch(err => {
      console.log("mol retrieval error: " + err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <Card className="compound-card">
      <div className="ms-auto">
        <OverlayTrigger overlay={<Tooltip>View larger image</Tooltip>}>
          <a href={props.img(1000)} target="_blank" rel="noopener noreferrer" className="mr-2 badge text-dark">
            <Icon icon={faImage}/>
          </a>
        </OverlayTrigger>
        <OverlayTrigger overlay={<Tooltip>Search for this structure</Tooltip>}>
          <span onClick={editMol} className="badge text-dark c-pointer">
            {loading
              ? <Spinner animation="border" variant="secondary" className="spinner"/>
              : <Icon icon={faEdit}/>
            }
          </span>
        </OverlayTrigger>
      </div>

      <OverlayTrigger placement="bottom"
        overlay={
          <Popover className="compound-tooltip">
            <img loading="lazy" alt="" src={props.img(840)}/>
          </Popover>
        }>
        <img loading="lazy" alt="" src={props.img(320)} className="card-img-top"/>
      </OverlayTrigger>

      <Card.Body className="text-center">
        <div>
          <a href={props.link} target="_blank" rel="noopener noreferrer">{props.label}</a>
        </div>
        {props.score &&
          <div className="text-muted">
            Score: {parseFloat(props.score).toFixed(3)}
          </div>
        }
      </Card.Body>
    </Card>
  );
}


function Results(props) {
  const queryLimit = 6 * 16;
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = React.useState(null);
  const [results, setResults] = React.useState([]);
  const [warnings, setWarnings] = React.useState([]);
  const [showSPARQL, setShowSPARQL] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [lastReached, setLastReached] = React.useState(false);
  const [showWarnings, setShowWarnings] = React.useState(true);

  function loadFirstResults() {
    search(props.query, props.params, 0, queryLimit)
    .then(result => {
      setLoading(false);
      setLastReached(result.done);
      setResults(result.compounds);
      setWarnings(result.warnings);
    })
    .catch(err => {
      setLoading(false);
      setLastReached(true);
      setErrorMsg(err.toString());
    });
  }

  function loadMoreResults() {
    setLoading(true);

    search(props.query, props.params, results.length, queryLimit)
    .then(result => {
      setLoading(false);
      setLastReached(result.done);
      setResults(r=>r.concat(result.compounds));
      setWarnings(w=>[...new Set(w.concat(result.warnings))]);
    })
    .catch(err => {
      setLoading(false);
      setLastReached(true);
      setErrorMsg(err.toString());
    });
  }

  React.useEffect(loadFirstResults, [props, queryLimit]);

  return (
    <Container className="sachem-results">
      <Row className="mt-3">
        <Col>
          <h1 className="display-4 text-nowrap">Search results</h1>
        </Col>
        <Col sm="auto" ml="auto" className="pt-4">
          <ButtonGroup className="ml-3">
            <Button variant="outline-secondary" onClick={() => navigate("../search/" + makeHash(props.query, props.params))}>
              <Icon icon={faAngleDoubleLeft}/> Edit this search
            </Button>
            
            {warnings.length > 0 && !showWarnings &&
              <Button variant="outline-danger" className="ml-3" onClick={() => setShowWarnings(true)}>
                <Icon icon={faExclamationTriangle}/> Show warnings
              </Button>
            }
            
            <Button variant="outline-secondary" href={getDownloadLink(props.query, props.params)}>
              <Icon icon={faTable}/> Get CSV
            </Button>
            
            <Button variant="outline-secondary" onClick={() => setShowSPARQL(!showSPARQL)}>
              SPARQL <Icon icon={showSPARQL ? faAngleUp : faAngleDown}/>
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {showSPARQL &&
        <>
        <pre>#endpoint: ${getEndpoint(props.params)}{"\n\n"}${getQuery(props.query, props.params)}</pre>
        <hr/>
        </>
      }

      {warnings.length > 0 && showWarnings &&
        <Row>
          <Col>
            <Alert variant="danger" dismissible onClose={() => setShowWarnings(false)}>
              The following {warnings.length} warning{warnings > 1 ? "s were" : " was"} returned:
              <lu>
              {warnings.map((w) => (
                <li key={w} className="warning">{w}</li>
              ))}
              </lu>
            </Alert>
          </Col>
        </Row>
      }

      <div className="mt-1 d-flex flex-wrap">
        {results.map((r) => (
          <Compound {...r} key={r.db + ":" + r.id} params={props.params}/>
        ))}
      </div>

      {lastReached && !errorMsg && !loading && results.length > 0 &&
        <div className="mt-4 text-center">
          <hr/>
          <div className="mt-4">No more results</div>
        </div>
      }

      {lastReached && !errorMsg && !loading && results.length === 0 &&
        <Alert variant="info">No results found</Alert>
      }

      {errorMsg &&
        <Alert variant="danger">Server returned an error: {errorMsg}</Alert>
      }

      {loading &&
        <div className="mt-4 text-center">
          <Spinner animation="border" variant="primary" className="spinner d-block mx-auto"/>
          <p className="mt-3">Searching...</p>
        </div>
      }

      {!loading && !errorMsg && !lastReached &&
        <div className="text-center">
          <Button onClick={loadMoreResults} variant="primary" className="mt-3">
            Load more results
          </Button>
        </div>
      }
    </Container>
  );
}


export default Results;
