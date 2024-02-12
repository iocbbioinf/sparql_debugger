import { endpointBase, servletBase } from "../config.js"
import { idn } from "../tag.js"


const sachemBase = endpointBase + "/sachem/endpoint";

const databaseOpts = [
  { value: "chembl", label: "ChEMBL", link: "https://www.ebi.ac.uk/chembldb/index.php/compound/inspect/CHEMBL",
    pattern: /^http:\/\/rdf\.ebi\.ac\.uk\/resource\/chembl\/molecule\/CHEMBL([0-9]+)$/ },
  { value: "chebi", label: "ChEBI", link: "https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:",
    pattern: /^http:\/\/purl\.obolibrary\.org\/obo\/CHEBI_([0-9]+)$/ },
  { value: "pubchem", label: "PubChem", link: "https://pubchem.ncbi.nlm.nih.gov/compound/",
    pattern: /^http:\/\/rdf\.ncbi\.nlm\.nih\.gov\/pubchem\/compound\/CID([0-9]+)$/ },
  { value: "drugbank", label: "DrugBank", link: "https://www.drugbank.ca/drugs/DB",
    pattern: /^http:\/\/wifo5-04\.informatik\.uni-mannheim\.de\/drugbank\/resource\/drugs\/DB([0-9]+)$/ },
  { value: "wikidata", label: "Wikidata", link: "http://www.wikidata.org/entity/Q",
    pattern: /^http:\/\/www\.wikidata\.org\/entity\/Q([0-9]+)$/ },
  { value: "mona", label: "MoNA", link: "https://mona.fiehnlab.ucdavis.edu/spectra/display/",
    pattern: /^https:\/\/idsm\.elixir-czech\.cz\/rdf\/mona\/CMPD_(.*)$/ },
  { value: "molmedb", label: "MolMeDB", link: "https://molmedb.upol.cz/mol/MM",
    pattern: /^https:\/\/molmedb\.upol\.cz\/mol\/MM([0-9]+)$/ },
];

const chargeOpts = [
  { value: 0, label: "Ignore", term: "sachem:ignoreCharges"},
  { value: 1, label: "Default any charge", term: "sachem:defaultChargeAsAny"},
  { value: 2, label: "Default zero charge", term: "sachem:defaultChargeAsZero"}
];

const isotopeOpts = [
 { value: 0, label: "Ignore", term: "sachem:ignoreIsotopes" },
 { value: 1, label: "Default any isotope", term: "sachem:defaultIsotopeAsAny" },
 { value: 2, label: "Default standard isotope", term: "sachem:defaultIsotopeAsStandard" }
];

const aromaOpts = [
  { value: 0, label: "From query", term: "sachem:aromaticityFromQuery" },
  { value: 1, label: "Recompute", term: "sachem:aromaticityDetect" },
  { value: 2, label: "Compute if missing", term: "sachem:aromaticityDetectIfMissing" }
];

const tautomerOpts = [
  { value: 0, label: "Ignore", term: "sachem:ignoreTautomers" },
  { value: 1, label: "InCHI-generated", term: "sachem:inchiTautomers" }
];

const radicalOpts = [
  { value: 0, label: "Ignore", term: "sachem:ignoreSpinMultiplicity" },
  { value: 1, label: "Default zero", term: "sachem:defaultSpinMultiplicityAsZero" },
  { value: 2, label: "Default any", term: "sachem:defaultSpinMultiplicityAsAny" }
];

const stereoOpts = [
  { value: 0, label: "Ignore", term: "sachem:ignoreStereo" },
  { value: 1, label: "Strict", term: "sachem:strictStereo" }
];

const similarityOpts = [
  { value: 0, label: "Radius 1", term: "'1'^^xsd:integer" },
  { value: 1, label: "Radius 2", term: "'2'^^xsd:integer" },
  { value: 2, label: "Radius 3", term: "'3'^^xsd:integer" }
];


function getCompoundFromIri(iri) {
  for(const db of databaseOpts) {
    const match = iri.match(db.pattern);

    if(match)
      return {
        id: match[1],
        db: db.value,
        iri: iri,
        label: db.label + ":\u200B" + match[1],
        link: db.link + match[1],
        img : function(size) {
          return servletBase + "/" + db.value + "/compound/image?id=" + match[1] + "&w=" + size;
        }
      };
  }

  return null;
}


function getCompoundStructure(iri) {
  var compound = getCompoundFromIri(iri);

  var data = compound.db === "wikidata"
    ? `SELECT (coalesce(?MOL1, ?MOL2) AS ?MOL) { OPTIONAL { <${compound.iri}> wdt:P2017 ?MOL1 } OPTIONAL { <${compound.iri}> wdt:P233 ?MOL2 }}`
    : `SELECT ?MOL { [ rdf:type sio:SIO_011120; sio:has-value ?MOL; sio:is-attribute-of <${compound.iri}> ] }`;

  return new Promise((resolve, reject) => {
    fetch(sachemBase + "/" + compound.db, {
      method: "POST",
      headers: {
        "Content-Type" : "application/sparql-query",
        "Accept": "application/sparql-results+json;",
      },
      redirect: "follow",
      body: data,
    })
    .then(response => response.json())
    .then(json => {
      if(json.results.bindings.length > 0)
        resolve(json.results.bindings[0].MOL.value);
      else reject("Structure not found");
    })
    .catch((error) => {
      reject(error);
    });
  });
}


function getPattern(indent, mol, params, limit) {
  switch (params.mode) {
    case "substructure":
      return idn`${indent}
        [ sachem:compound ?COMPOUND; sachem:score ?SCORE ]
            sachem:scoredSubstructureSearch [
                sachem:query '''${mol}''';
                sachem:searchMode ${params.exact ? "sachem:exactSearch" : "sachem:substructureSearch"};
                sachem:chargeMode ${params.charge.term};
                sachem:isotopeMode ${params.isotope.term};
                sachem:aromaticityMode ${params.aroma.term};
                sachem:stereoMode ${params.stereo.term};
                sachem:tautomerMode ${params.tautomers.term};
                sachem:radicalMode ${params.radicals.term};
                sachem:topn '${isNaN(limit) ? -1 : limit}'^^xsd:integer;
                sachem:internalMatchingLimit '1000000'^^xsd:integer
        ]`;

    case "similarity":
      return idn`${indent}
        [ sachem:compound ?COMPOUND; sachem:score ?SCORE ]
            sachem:similaritySearch [
                sachem:query '''${mol}''';
                sachem:cutoff '${params.threshold}'^^xsd:double;
                sachem:similarityRadius ${params.radius.term};
                sachem:aromaticityMode ${params.aroma.term};
                sachem:tautomerMode ${params.tautomers.term};
                sachem:topn '${isNaN(limit) ? -1 : limit}'^^xsd:integer
        ]`;

    default:
      return null;
  }
}


function getQuery(mol, params, offset, limit) {
  var pattern = getPattern(params.database.length !== 1 ? 6 : 2, mol, params, offset + limit);

  if(params.database.length !== 1)
    return idn`${0}
      PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
      PREFIX idsm: <https://idsm.elixir-czech.cz/sachem/endpoint/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      SELECT ?COMPOUND${params.mode === "similarity" ? " ?SCORE" : ""} WHERE {
      ${params.database.map(db => idn`${2}
        {
          SERVICE idsm:${db.value} {
          ${pattern}
          }
        }`).join("\n  UNION\n")}
      }
      ORDER BY desc(?SCORE)${limit ? "\nLIMIT " + limit : ""}${offset ? "\nOFFSET " + offset : ""}`;
  else
    return idn`${0}
      PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      SELECT ?COMPOUND${params.mode === "similarity" ? " ?SCORE" : ""} WHERE {
      ${pattern}
      }${limit ? "\nLIMIT " + limit : ""}${offset ? "\nOFFSET " + offset : ""}`;
}


function getEndpoint(params) {
  return sachemBase + "/" + (params.database.length === 1 ? params.database[0].value : "integrated");
}


function getDownloadLink(mol, params) {
  return (
    getEndpoint(params) + "?format=text%2Fcsv&filename=results.csv&query=" + encodeURIComponent(getQuery(mol, params))
  );
}


function search(mol, params, offset, limit) {
  var query = getQuery(mol, params, offset, limit);

  return new Promise((resolve, reject) => {
    fetch(getEndpoint(params) + "?warnings=true", {
      method: "POST",
      headers: {
        "Content-Type" : "application/sparql-query",
        "Accept": "application/sparql-results+json;",
      },
      redirect: "follow",
      body: query,
    })
    .then((response) => {
      if(!response.ok)
        response.text().then(text => reject("The query failed: " + text)).catch(e => reject(e));

      response.json().then((json) => {
        if(json.results) {
          const done = json.results.bindings.length < limit;

          const warnings = !json.warnings ? [] : json.warnings.messages.map(msg => {
            const m = msg.match(/.*: isomorphism: iteration limit exceeded for target (.*) in index '(.*)'/);

            if(!m)
              return msg;

            const db = databaseOpts.find(e => e.value === m[2])
            return `iteration limit exceeded for ${db ? db.label :  m[2]}:${m[1]}`;
          });

          const compounds = json.results.bindings.map(b => {
            var r = getCompoundFromIri(b.COMPOUND.value);

            if(b.SCORE)
              r.score = b.SCORE.value;

            return r;
          });

          resolve({compounds, warnings, done});
        }
      });
    })
    .catch(e => reject(e));
  });
}


export { databaseOpts, chargeOpts, isotopeOpts, aromaOpts, tautomerOpts, radicalOpts, stereoOpts, similarityOpts };
export { search, getQuery, getEndpoint, getDownloadLink, getCompoundStructure };
