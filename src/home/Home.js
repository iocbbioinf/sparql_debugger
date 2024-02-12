import React from "react";
import { Carousel, Container, Row, Col, Image, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap"
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";

import { trackPageView } from "../matomo.js"

import idsmImage from './carousel-compounds.jpg';
import sachemImage from './carousel-model.jpg';
import rheaImage from './carousel-reactions.jpg';
import chemwebIcon from './icon-chemweb.png';
import sachemIcon from './icon-sachem.png';
import sparqlIcon from './icon-sparql.png';
import chemistryImage from './info-chemistry.jpg';
import databaseImage from './info-database.jpg';

import "./Home.scss";

import GmailTreeView from "../debugTree.js"

function HomeCarousel() {
  React.useEffect(() => {
    document.title = "IDSM - Integrated Database of Small Molecules";
    trackPageView();
  }, []);

  return (
    <Carousel indicators={false} className="d-none d-lg-block">
      <Carousel.Item style={{backgroundImage: `url(${idsmImage})`, backgroundSize: 'cover'}}>
        <Container fluid className="carousel-page d-flex flex-column justify-content-center text-white">
          <h1>Integrated Database of Small Molecules</h1>
          <p>
            IDSM provides unique source of fast similarity and structural search functionality in databases such as
            ChEMBL, ChEBI or PubChem. The search interface is fully interoperable, and may be used in combination with
            other data sources using SPARQL.
          </p>
          <p>
            <Button href="https://jcheminf.biomedcentral.com/articles/10.1186/s13321-019-0367-2">
              Read about IDSM
            </Button>
            {' '}
            <LinkContainer to="/sparql">
              <Button>Try IDSM</Button>
            </LinkContainer>
          </p>
        </Container>
      </Carousel.Item>

      <Carousel.Item style={{backgroundImage: `url(${sachemImage})`, backgroundSize: 'cover'}}>
        <Container fluid className="carousel-page d-flex flex-column justify-content-center text-white">
          <h1>Technology: Sachem</h1>
          <p>
            Sachem is the open-source chemical cartridge that provides the high-performance indexing backend for the
            IDSM services. Installations of Sachem routinely handle hundreds of millions of stored compounds.
          </p>
          <p>
            <Button href="https://jcheminf.biomedcentral.com/articles/10.1186/s13321-018-0282-y">
              Read about Sachem
            </Button>
            {' '}
            <LinkContainer to="/sachem">
              <Button>Try Sachem</Button>
            </LinkContainer>
          </p>
        </Container>
      </Carousel.Item>

      <Carousel.Item style={{backgroundImage: `url(${rheaImage})`, backgroundSize: 'cover'}}>
        <Container fluid className="carousel-page d-flex flex-column justify-content-center text-white">
          <h1>Similarity search in Rhea reactome</h1>
          <p>
            Interoperability allows you to search through Rhea, Uniprot, ChEMBL and IDSM data sources at once. We
            provide useful SPARQL query examples to get you started.
          </p>
          <p>
          <LinkContainer to="/sparql">
            <Button>Try it now</Button>
          </LinkContainer>
          </p>
        </Container>
      </Carousel.Item>
    </Carousel>
  );
}


function CardsRow() {
  return (
    <Row md={3}>
      <Col className="text-center d-flex flex-column mt-5">
        <LinkContainer to="/sachem">
          <Button variant="link"><Image src={sachemIcon} width={140} height={140} roundedCircle/><h2>Sachem GUI</h2></Button>
        </LinkContainer>
        <p className="flex-grow-1">
          Sachem is a high-performance chemical cartridge for fingerprint-guided substructure and similarity search.
          Sachem GUI allows quick access to this functionality on our Sachem installation. Indexed databases include
          up-to-date versions of PubChem and ChEMBL.
        </p>
        <LinkContainer to="/sachem">
          <Button variant="secondary">Search for compounds <Icon icon={faAngleDoubleRight}/></Button>
        </LinkContainer>
      </Col>

      <Col className="text-center d-flex flex-column mt-5">
        <LinkContainer to="/sparql">
          <Button variant="link"><Image src={sparqlIcon} width={140} height={140} roundedCircle/><h2>SPARQL GUI</h2></Button>
        </LinkContainer>
        <p className="flex-grow-1">
          We provide an indexing service that allows FAIR-style search in published chemical data. You can easily
          construct queries that contain chemical substructure and similarity search terms combined with protein or
          bioassay-related queries.
        </p>
        <LinkContainer to="/sparql">
          <Button variant="secondary">Search with SPARQL <Icon icon={faAngleDoubleRight}/>
          </Button>
        </LinkContainer>
      </Col>

      <Col className="text-center d-flex flex-column mt-5">
        <Button href="/chemweb" variant="link"><Image src={chemwebIcon} width={140} height={140} roundedCircle/><h2>ChemWebRDF</h2></Button>
        <p className="flex-grow-1">
          PubChem RDF data exposed and searchable through an interoperable, semantic interface, using a custom
          high-performance SPARQL endpoint implementation. The service is still under development, but may already be
          used for processing many complicated queries.
        </p>
        <Button href="/chemweb" variant="secondary">ChemWebRDF app <Icon icon={faAngleDoubleRight}/></Button>
      </Col>
    </Row>
  );
}


function ChemistryRow() {
  return (
    <Row className="align-items-center">
      <Col md="auto" className="d-none d-lg-block">
        <Image src={chemistryImage} width={350} height={350}/>
      </Col>
      <Col>
        <h2>Mission: Interoperability in small molecules</h2>
        <p>
          The main goal of IDSM is to aggregate many different sources of information about small molecules into a
          single, logically coherent and semantically interconnected information source. This is achieved using the
          semantic web technologies. The data is explored and queried by the SPARQL query language; allowing to search
          through the vast amount of published chemical RDF data.
        </p>
      </Col>
    </Row>
  );
}


function DatabaseRow() {
  return (
    <Row className="align-items-center">
      <Col>
        <h2>IDSM technology</h2>
        <p>
          IDSM internals have been described in several articles:
        </p>
        <ul>
          <li>
            Galgonek, J. & Vondrášek, J.{' '}
            <b>IDSM ChemWebRDF: SPARQLing small-molecule datasets.</b>{' '}
            <em>Journal of Cheminformatics</em> <b>13</b>, 38 (2021).{' '}
            <a target="_blank" rel="noreferrer" href="https://doi.org/10.1186/s13321-021-00515-1">doi:10.1186/s13321-021-00515-1</a>
          </li>
          <li>
            Kratochvíl, M., Vondrášek, J. & Galgonek, J.{' '}
            <b>Interoperable chemical structure search service.</b>{' '}
            <em>Journal of Cheminformatics</em> <b>11</b>, 45 (2019).{' '}
            <a target="_blank" rel="noreferrer" href="https://doi.org/10.1186/s13321-019-0367-2">doi:10.1186/s13321-019-0367-2</a>
          </li>
          <li>
            Kratochvíl, M., Vondrášek, J. & Galgonek, J.{' '}
            <b>Sachem: a chemical cartridge for high-performance substructure search.</b>{' '}
            <em>Journal of Cheminformatics</em> <b>10</b>, 27 (2018).{' '}
            <a target="_blank" rel="noreferrer" href="https://doi.org/10.1186/s13321-018-0282-y">doi:10.1186/s13321-018-0282-y</a>
          </li>
        </ul>
      </Col>
      <Col md="auto" className="d-none d-lg-block">
        <Image src={databaseImage} width={350} height={350}/>
      </Col>
    </Row>
  );
}


function DelimiterRow() {
  return (
    <Row><Col className="mb-4 mt-4"><hr className="mb-3 mt-3"/></Col></Row>
  );
}


function Home() {
  return (    
    <div>
      <GmailTreeView/>
    </div>
  );
}


export default Home;
