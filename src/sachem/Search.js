import React from "react";
import ReactSelect from "react-select";
import InputRange from "react-input-range";
import { useNavigate } from "react-router-dom";
import { Button, Form, ToggleButtonGroup, ToggleButton, Container, Row, Col } from "react-bootstrap";
import { Editor } from 'ketcher-react'
import { StandaloneStructServiceProvider } from 'ketcher-standalone'
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import { makeHash } from "./hash.js";
import { databaseOpts, chargeOpts, isotopeOpts, aromaOpts, tautomerOpts, radicalOpts, stereoOpts, similarityOpts } from "./idsm.js" ;

import "react-input-range/lib/css/index.css";
import "ketcher-react/dist/index.css";


function SelectOption(props) {
  return (
    <Form.Group as={Row} className="mt-1">
      <Form.Label column xs={12} sm={4}>{props.label}</Form.Label>
      <Col xs={12} sm={8}>
        <ReactSelect options={props.options} value={props.value} onChange={s => props.onChange(s)}/>
      </Col>
    </Form.Group>
  );
}


function CheckOption(props) {
  return (
    <Form.Group as={Row} className="mt-3">
      <Col xs={12} sm={{ span: 8, offset: 4 }}>
        <Form.Check type="switch" label={props.label} checked={props.value} onChange={t => props.onChange(t.target.checked)}/>
      </Col>
    </Form.Group>
  );
}


function RangeOption(props) {
  return (
    <Form.Group as={Row} className="mt-1">
      <Form.Label column xs={12} sm={4}>{props.label}</Form.Label>
      <Col xs={12} sm={8}>
      <div style={{"margin-top":"0.8rem"}}>
        <InputRange maxValue={props.maxValue} minValue={props.minValue} step={props.step}
            value={props.value} onChange={v => props.onChange(v)}
            formatLabel={(value) =>`${Math.round((value + Number.EPSILON) * props.scale) / props.scale}`}/>
      </div>
      </Col>
    </Form.Group>
  );
}


function SubstructureOptions(props) {
  return (
    <>
      <SelectOption label="Charge" options={chargeOpts} value={props.values.charge} onChange={charge => props.onChange({charge})}/>
      <SelectOption label="Isotopes" options={isotopeOpts} value={props.values.isotope} onChange={isotope => props.onChange({isotope})}/>
      <SelectOption label="Aromaticity" options={aromaOpts} value={props.values.aroma} onChange={aroma => props.onChange({aroma})}/>
      <SelectOption label="Stereochemistry" options={stereoOpts} value={props.values.stereo} onChange={stereo => props.onChange({stereo})}/>
      <SelectOption label="Tautomerism" options={tautomerOpts} value={props.values.tautomers} onChange={tautomers => props.onChange({tautomers})}/>
      <SelectOption label="Radicals" options={radicalOpts} value={props.values.radicals} onChange={radicals => props.onChange({radicals})}/>
      <CheckOption label="Require exact match" value={props.values.exact} onChange={exact => props.onChange({exact})}/>
    </>
  );
}


function SimilarityOptions(props) {
  return (
    <>
      <RangeOption label="Threshold:" maxValue={1} minValue={0.5} step={0.01} scale={100} value={props.values.threshold} onChange={threshold => props.onChange({threshold})} className="mt-3"/>
      <SelectOption label="Radius" options={similarityOpts} value={props.values.radius} onChange={radius => props.onChange({radius})}/>
      <SelectOption label="Aromaticity" options={aromaOpts} value={props.values.aroma} onChange={aroma => props.onChange({aroma})}/>
      <SelectOption label="Tautomerism" options={tautomerOpts} value={props.values.tautomers} onChange={tautomers => props.onChange({tautomers})}/>
    </>
  );
}


function Search(props) {
  const navigate = useNavigate();

  const [state, setState] = React.useState(props.defaultParams);

  function assignState(value) {
    setState(state => ({...state, ...value }));
  }

  React.useEffect(() => {
    setTimeout(function waitOnKetcher() {
      if(window.ketcher)
        window.ketcher.setMolecule(props.defaultQuery);
      else
        setTimeout(waitOnKetcher, 100);
    }, 1);
  }, [props]);

  return (
    <Container className="sachem-search">

      <Row className="mt-3">
        <Col xs={12} lg={8}><h1 className="display-4">Sachem GUI</h1></Col>
      </Row>

      <Row className="mt-3 row-gap-5">
        <Col md={12} lg={7} xl={8}>
          <Editor structServiceProvider={new StandaloneStructServiceProvider()} onInit={ketcher => {window.ketcher = ketcher}} />
        </Col>

        <Col md={6} lg={5} xl={4}>
          <Container>
            <h4>Search options</h4>

            <Form.Group as={Row} className="mt-3 mb-3">
              <Form.Label column xs={12} sm={4}>Search type</Form.Label>
              <Col xs={12} sm={8}>
                <ToggleButtonGroup type="radio" name="searchType" className="w-100" defaultValue={state.mode} onChange={mode => {assignState({mode})}}>
                  <ToggleButton id="substructure-btn" value={"substructure"} variant={state.mode === "substructure" ? "primary" : "outline-secondary"}>
                    Substructure
                  </ToggleButton>
                  <ToggleButton id="similarity-btn" value={"similarity"} variant={state.mode === "similarity" ? "primary" : "outline-secondary"}>
                    Similarity
                  </ToggleButton>
                </ToggleButtonGroup>
              </Col>
            </Form.Group>


            <Form.Group as={Row} className="mt-3 mb-3">
              <Form.Label column xs={12} sm={4}>Database</Form.Label>
              <Col xs={12} sm={8}>
                <ReactSelect isMulti closeMenuOnSelect={true} isClearable={false} options={databaseOpts}
                  value={state.database} onChange={s => { if(s.length) assignState({ database: s }) }}/>
              </Col>
            </Form.Group>

            {state.mode === "substructure" &&
              <SubstructureOptions values={state} onChange={(v) => assignState(v)}/>
            }

            {state.mode === "similarity" &&
              <SimilarityOptions values={state} onChange={(v) => assignState(v)}/>
            }

            <Form.Group as={Row} className="mt-4">
              <Col xs={12} sm={{ span: 8, offset: 4 }}>
                <Button variant="primary" size="lg" style={{ width: "100%" }} onClick={() => {
                    window.ketcher.getMolfile().then((molfile)=>{
                        const hash = makeHash(molfile, state);
                        navigate("../search/" + hash);
                        navigate("../results/" + hash);
                      });
                    }}>
                  <Icon icon={faSearch}/> Search
                </Button>
              </Col>
            </Form.Group>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}


export default Search;
