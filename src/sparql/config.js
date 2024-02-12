import { endpointBase } from "../config";
import { idn } from "../tag.js"


const corsProxy = endpointBase + "/sparql/endpoint/proxy";


const defaultQuery = idn`${0}
  PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>

  SELECT * WHERE {
  ?COMPOUND sachem:substructureSearch [
      sachem:query "CC(=O)Oc1ccccc1C(O)=O" ].
  }
  LIMIT 1000`


const defaultEndpoint = endpointBase + "/sparql/endpoint/idsm";


const simpleCheckQuery = idn`${0}
  SELECT ?T WHERE
  {
    VALUES ?T { true }
  }`


const checkQuery = idn`${0}
  SELECT ?T WHERE
  {
    SERVICE <${endpointBase}/sparql/endpoint/empty>
    {
      VALUES ?T { true }
    }
  }`


const endpoints = [{
    name: "neXtProt",
    endpoint: "https://sparql.nextprot.org/",
    query: checkQuery
  },
  {
    name: "UniProt",
    endpoint: "https://sparql.uniprot.org",
    query: checkQuery
  },
  {
    name: "Rhea",
    endpoint: "https://sparql.rhea-db.org/sparql",
    query: checkQuery
  },
  {
    name: "IDSM",
    endpoint: endpointBase + "/sparql/endpoint/idsm",
    query: simpleCheckQuery
  },
  {
    name: "IDSM/Sachem: PubChem",
    endpoint: endpointBase + "/sparql/endpoint/pubchem",
    query: simpleCheckQuery
  },
  {
    name: "IDSM/Sachem: ChEMBL",
    endpoint: endpointBase + "/sparql/endpoint/chembl",
    query: simpleCheckQuery
  },
  {
    name: "IDSM/Sachem: ChEBI",
    endpoint: endpointBase + "/sparql/endpoint/chebi",
    query: simpleCheckQuery
  },
  {
    name: "IDSM/Sachem: DrugBank",
    endpoint: endpointBase + "/sparql/endpoint/drugbank",
    query: simpleCheckQuery
  },
  {
    name: "IDSM/Sachem: Wikidata",
    endpoint: endpointBase + "/sparql/endpoint/wikidata",
    query: simpleCheckQuery
  },
  {
    name: "IDSM/Sachem: MoNA",
    endpoint: endpointBase + "/sparql/endpoint/mona",
    query: simpleCheckQuery
  },
];


export { corsProxy, defaultEndpoint, defaultQuery, endpoints };
