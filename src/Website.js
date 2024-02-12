import React from "react";
import { Suspense } from "react";
import { Navbar, Nav, NavbarBrand, Container, Row, Col, Modal, Image, Button, Spinner } from "react-bootstrap";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap"
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faAtom, faNetworkWired, faDatabase, faHome} from "@fortawesome/free-solid-svg-icons";

import ErrorBoundary from "./ErrorBoundary.js"
import { initMatomo } from "./matomo.js"

import idsmLogo from "./logo-idsm.svg";
import elixirLogo from "./logo-elixir.png";
import uochbLogo from "./logo-uochb.png";

import "./Website.scss";


const Home = React.lazy(() => import("./home/Home"));
const Sachem = React.lazy(() => import("./sachem/Sachem"));
const Sparql = React.lazy(() => import("./sparql/Sparql"));


function DataPrivacy() {
  const [show, setShow] = React.useState(false);

  return (
    <>
      <Button variant="link" className="p-0" onClick={() => setShow(true)}>Data privacy</Button>

      <Modal centered size="lg" aria-labelledby="contained-modal-title-vcenter" show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">IDSM service data privacy</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-justify">
          <p>
            IDSM service is operated and maintained by <a target="_blank" rel="noreferrer"
            href="https://www.elixir-czech.cz/">ELIXIR CZ</a>. See also the <a target="_blank" rel="noreferrer"
            href="https://www.elixir-czech.cz/legal/terms-of-use">respective terms of use for all ELIXIR CZ services</a>.
          </p>
          <p>
            For planning and scientific review purposes, ELIXIR CZ will keep records of service usage. ELIXIR CZ may
            make information about the total volume of usage of particular software or databases to third parties
            organisations who supply the software or database contents.
          </p>
          <p>
            Logs of usage may also be maintained for the purposes of monitoring and improving services, and measuring
            the impact the particular services have on our resources.
          </p>
          <p>
            The logged information may include:
          </p>
          <ul>
            <li>timing information, including exact timestamp and service use duration</li>
            <li>network address (IP) used for communication with the service</li>
            <li>information provided by the user agent software, e.g. browser type and version</li>
            <li>content of queries submitted via the SPARQL interface</li>
          </ul>
          <p>
            These logs will not be made available to third parties for any purpose. We regard the nature of the
            communication carried out by any individual user as confidential, and shall make every reasonable attempt
            to prevent breaches of that confidentiality.
          </p>
          <p>
            ELIXIR CZ does not accept any responsibility for the consequences of any breach of the confidentiality of
            ELIXIR CZ site by third parties who, by any means, gain illegitimate access to the information.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}


function Contacts() {
  const [show, setShow] = React.useState(false);

  return (
    <>
      <Button variant="link" className="p-0" onClick={() => setShow(true)}>Contacts</Button>

      <Modal centered size="lg" aria-labelledby="contained-modal-title-vcenter" show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">IDSM service contact information</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <dl>
            <dt>Maintainer</dt>
            <dd>Jakub Galgonek &lt;<a href="mailto:jakub.galgonek@uochb.cas.cz?subject=IDSM">jakub.galgonek@uochb.cas.cz</a>&gt;</dd>
            <dt>Research group</dt>
            <dd><a target="_blank" rel="noreferrer" href="https://bioinformatics.group.uochb.cz/en">Bioinformatics</a></dd>
            <dt>Institution</dt>
            <dd><a target="_blank" rel="noreferrer" href="https://www.uochb.cas.cz/en">IOCB Prague</a></dd>
            <dt>ELIXIR Hub</dt>
            <dd><a target="_blank" rel="noreferrer" href="https://www.elixir-czech.cz/">ELIXIR Czech Republic</a></dd>
          </dl>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}


function Chemweb() {
  const { search } = useLocation();

  const style = {
    position: "fixed",
    top: "60px",
    left: 0,
    bottom: 0,
    right: 0,
    width: "100%",
    height: "calc(100% - 60px)",
    border: "none",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    zIndex: 1
  };
  
  return (
    <iframe src={"/chemweb/Chemweb.html"+search} title="chemweb" style={style}/>
  );
}


function Website() {
  React.useEffect(() => {
    initMatomo();
  }, []);

  return (
    <BrowserRouter>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark px-3" style={{zIndex:2}}>
        <LinkContainer to="/"><NavbarBrand><img src={idsmLogo} height="32px" alt="IDSM"/></NavbarBrand></LinkContainer>
        <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav activeKey={window.location.pathname} className="mr-auto">
            <Nav.Link to="/sachem" as={NavLink}><Icon icon={faAtom}/> Sachem GUI</Nav.Link>
            <Nav.Link to="/sparql" as={NavLink}><Icon icon={faNetworkWired}/> SPARQL GUI</Nav.Link>
            <Nav.Link to="/chemweb" as={NavLink}><Icon icon={faDatabase}/> ChemWebRDF</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            <Nav.Link target="_blank" rel="noreferrer" href="https://bioinformatics.group.uochb.cz/en">
              <Icon icon={faHome}/> Bioinformatics @ IOCB Prague
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className="page">
        <ErrorBoundary>
          <Suspense fallback={<Spinner animation="border" variant="primary" className="waiting d-block m-auto"/>}>
            <Routes>
              <Route path="/sachem/*" element={<Sachem/>}/>
              <Route path="/sparql/" element={<Sparql/>}/>
              <Route path="/chemweb/" element={<Chemweb/>}/>
              <Route path="/" element={<Home/>}/>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>

      <Container fluid className="pt-1 mt-5 footer">
        <Row className="justify-content-center align-items-center">
          <Col lg="auto" md="auto" xs="auto" className="mb-1 px-4">
            <span>&copy; 2018&ndash;2023 <a target="_blank" rel="noreferrer" href="https://www.uochb.cz/en">IOCB Prague</a></span>
          </Col>
          <Col lg="auto" md="auto" xs={12} className="mb-0 p-0"/>
          <Col lg="auto" md="auto" xs="auto" className="mb-1 px-4">
            <DataPrivacy/>
          </Col>
          <Col lg="auto" md="auto" xs="auto" className="mb-1 px-4">
            <Contacts/>
          </Col>
          <Col lg="auto" md={12} xs={12} className="mb-0 p-0"/>
          <Col lg="auto" md="auto" xs="auto" className="mb-1 px-4">
            <a target="_blank" rel="noreferrer" href="https://www.uochb.cz/en" className="d-block p-1"><Image src={uochbLogo} height={40}/></a>
          </Col>
          <Col lg="auto" md="auto" xs="auto" className="mb-1 px-4">
            <a target="_blank" rel="noreferrer" href="https://www.elixir-czech.cz/" className="d-block p-1"><Image src={elixirLogo} height={40}/></a>
          </Col>
        </Row>
      </Container>
    </BrowserRouter>
  );
}


export default Website;
