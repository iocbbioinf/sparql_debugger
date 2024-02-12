import { endpointBase } from "../config";
import { idn } from "../tag.js"


const demoQueries = [{
    name: "Simple standalone query examples",
    queries: [{
        name: "Substructure search",
        description: "Search for structures containing aspirin as their substructure. The query structure is specified by SMILES.",
        endpoint: endpointBase + "/sparql/endpoint/chebi",
        query: idn`${0}
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>

          SELECT * WHERE {
            ?COMPOUND sachem:substructureSearch [
                  sachem:query "CC(=O)Oc1ccccc1C(O)=O" ].
          }`
      },
      {
        name: "Substructure search by a MOL file",
        description: "Search for all alpha amino acids (in their un-ionized forms). The query structure is specified by MOL.",
        endpoint: endpointBase + "/sparql/endpoint/chebi",
        query: idn`${0}
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>

          SELECT * WHERE {
            ?COMPOUND sachem:substructureSearch [
                sachem:query '''
          alpha amino acid

            8  7  0  0  0  0  0  0  0  0999 V2000
            233.0000  202.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
            260.7128  218.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
            205.2872  218.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
            288.4256  202.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
            260.7128  250.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
            288.4256  266.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
            205.2872  250.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
            177.5744  202.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
            1  2  1  0  0  0  0
            1  3  1  0  0  0  0
            2  4  2  0  0  0  0
            2  5  1  0  0  0  0
            5  6  1  0  0  0  0
            3  7  1  0  0  0  0
            3  8  1  0  0  0  0
          M  END''' ].
          }`
      },
      {
        name: "Similarity search with score values",
        description: "Search for structures similar to ibuprofen. The query structure is specified by SMILES and the cutoff score is set as 0.8.",
        endpoint: endpointBase + "/sparql/endpoint/chebi",
        query: idn`${0}
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

          SELECT * WHERE {
            [ sachem:compound ?COMPOUND;
              sachem:score ?SCORE ] sachem:similaritySearch [
                    sachem:query "CC(C)Cc1ccc(cc1)C(C)C(O)=O";
                    sachem:cutoff "0.8"^^xsd:double ].
          }`
      },
      {
        name: "Simple similarity search",
        description: "A simpler variant of the previous example; the simpler syntax is especially useful in cases when the exact similarity score is irrelevant.",
        endpoint: endpointBase + "/sparql/endpoint/chebi",
        query: idn`${0}
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

          SELECT * WHERE {
            ?COMPOUND sachem:similarCompoundSearch [
                sachem:query "CC(C)Cc1ccc(cc1)C(C)C(O)=O";
                sachem:cutoff "0.8"^^xsd:double ].
          }`
      },
      {
        name: "Multiple substructure search",
        description: "Search for compounds that contain any of the specified substructures; in this case, we search for several penicillin-related antibiotics.",
        endpoint: endpointBase + "/sparql/endpoint/chebi",
        query: idn`${0}
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>

          SELECT ?COMPOUND ?QUERY WHERE {
            VALUES (?QUERY ?SMILES) {
              ("clometocillin" "CC1(C(N2C(S1)C(C2=O)NC(=O)C(C3=CC(=C(C=C3)Cl)Cl)OC)C(=O)O)C")
              ("carbenicillin" "CC1(C(N2C(S1)C(C2=O)NC(=O)C(C3=CC=CC=C3)C(=O)O)C(=O)O)C")
              ("ampicillin" "CC1(C(N2C(S1)C(C2=O)NC(=O)C(C3=CC=CC=C3)N)C(=O)O)C")
            }

            ?COMPOUND sachem:substructureSearch [
                sachem:query ?SMILES ].
          }`
      }]
  },
  {
    name: "Interoperability examples with ChEBI",
    description: "Due to availability of official ChEBI RDF service, these examples currently use a custom mirror of ChEBI.",
    queries: [{
        name: "ChEBI interoperability",
        description: "Search for aspirin substructure, also fetching some related compound metadata (labels) from ChEBI.",
        endpoint: endpointBase + "/sparql/endpoint/idsm",
        query: idn`${0}
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX endpoint: <${endpointBase}/sparql/endpoint/>

          SELECT * WHERE {
            SERVICE endpoint:chebi {
              ?COMPOUND sachem:substructureSearch
                  [ sachem:query "CC(=O)Oc1ccccc1C(O)=O" ]
            }
            ?COMPOUND rdfs:label ?o
          }`
      },
      {
        name: "ChEBI compounds with a specific role of substructures",
        description: "Search for ChEBI compounds containing any substructure anotated as the leprostatic drug (CHEBI:35816).",
        endpoint: endpointBase + "/sparql/endpoint/idsm",
        query: idn`${0}
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX owl: <http://www.w3.org/2002/07/owl#>
          PREFIX obo: <http://purl.obolibrary.org/obo/>
          PREFIX chebi: <http://purl.obolibrary.org/obo/chebi/>
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX endpoint: <${endpointBase}/sparql/endpoint/>
          PREFIX sio: <http://semanticscience.org/resource/>

          SELECT DISTINCT ?COMPOUND WHERE {
            ?DRUG rdfs:subClassOf [ rdf:type owl:Restriction;
                owl:onProperty obo:RO_0000087;
                owl:someValuesFrom obo:CHEBI_35816 ].

            SERVICE endpoint:chebi {
              [ rdf:type sio:SIO_011120;
                  sio:is-attribute-of ?DRUG;
                  sio:has-value ?MOLFILE ].

              ?COMPOUND sachem:substructureSearch [
                  sachem:query ?MOLFILE ].
            }
          }`
      },
      {
        name: "ChEBI Compound properties and roles",
        description: "Display all possible roles of compounds that contain aspirin. The query uses the EBI endpoint for retrieving roles of compounds that contain aspirin, which are in turn retrieved from the IOCB endpoint.",
        endpoint: endpointBase + "/sparql/endpoint/idsm",
        query: idn`${0}
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX endpoint: <${endpointBase}/sparql/endpoint/>
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX owl: <http://www.w3.org/2002/07/owl#>
          PREFIX obo: <http://purl.obolibrary.org/obo/>

          SELECT DISTINCT ?role ?label WHERE {
            SERVICE endpoint:chebi {
              ?COMPOUND sachem:substructureSearch
                  [ sachem:query "CC(=O)Oc1ccccc1C(O)=O" ]
            }

            ?COMPOUND rdfs:subClassOf [ rdf:type owl:Restriction ;
              owl:onProperty obo:RO_0000087 ;
              owl:someValuesFrom ?role ].
            ?role rdfs:label ?label.
          }`
      }]
  },
  {
    name: "Interoperability examples with neXtProt & UniProt",
    description: "Due to availability of official ChEMBL RDF service, these examples currently use a custom mirror of ChEMBL.",
    queries: [{
        name: "UniProt interoperability",
        description: "Search for all proteins in UniProt that have some measured activity with any compound that contains aspirin, and fetch the scientific name of the organism from which the protein originated.",
        endpoint: "https://sparql.uniprot.org",
        query: idn`${0}
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX chembl: <http://rdf.ebi.ac.uk/terms/chembl#>
          PREFIX uniprot: <http://purl.uniprot.org/core/>
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX endpoint: <${endpointBase}/sparql/endpoint/>

          SELECT ?COMPOUND ?UNIPROT ?ORGANISM_NAME WHERE
          {
              SERVICE endpoint:idsm {
                SERVICE endpoint:chembl {
                  ?COMPOUND sachem:substructureSearch [
                      sachem:query "CC(=O)Oc1ccccc1C(O)=O" ]
                }

              ?ACTIVITY rdf:type chembl:Activity;
                chembl:hasMolecule ?COMPOUND;
                chembl:hasAssay ?ASSAY.
              ?ASSAY chembl:hasTarget ?TARGET.
              ?TARGET chembl:hasTargetComponent ?COMPONENT.
              ?COMPONENT chembl:targetCmptXref ?UNIPROT.
              ?UNIPROT rdf:type chembl:UniprotRef.
            }

            ?UNIPROT uniprot:organism ?ORGANISM.
            ?ORGANISM uniprot:scientificName ?ORGANISM_NAME.
          }`
      },
      {
        name: "neXtProt interoperability",
        description: "Search for all proteins in neXtProt that have some measured activity with any compound that contains aspirin.",
        endpoint: "https://sparql.nextprot.org/",
        query: idn`${0}
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
          PREFIX chembl: <http://rdf.ebi.ac.uk/terms/chembl#>
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX endpoint: <${endpointBase}/sparql/endpoint/>
          PREFIX nextprot: <http://nextprot.org/rdf#>

          SELECT ?COMPOUND ?ENTRY WHERE
          {
            {
              SELECT ?COMPOUND ?UNIPROT WHERE {
                SERVICE endpoint:idsm {
                  SERVICE endpoint:chembl {
                    ?COMPOUND sachem:substructureSearch [
                        sachem:query "CC(=O)Oc1ccccc1C(O)=O" ]
                  }

                  ?ACTIVITY rdf:type chembl:Activity;
                    chembl:hasMolecule ?COMPOUND;
                    chembl:hasAssay ?ASSAY.
                  ?ASSAY chembl:hasTarget ?TARGET.
                  ?TARGET chembl:hasTargetComponent ?COMPONENT.
                  ?COMPONENT chembl:targetCmptXref ?UNIPROT.
                  ?UNIPROT rdf:type chembl:UniprotRef.
                }
              }
            }

            ?ENTRY skos:exactMatch ?UNIPROT.
          }`
      },
      {
        name: "neXtProt interoperability (via UniProt)",
        description: "Ask the neXtProt SPARQL endpoint to fetch aspirin-containing compounds and find UniProt proteins which have some measured activity with them, filtering the result using the UniProt class annotation to only display surface antigens.",
        endpoint: "https://sparql.nextprot.org",
        query: idn`${0}
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          PREFIX dc: <http://purl.org/dc/elements/1.1/>
          PREFIX chembl: <http://rdf.ebi.ac.uk/terms/chembl#>
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX endpoint: <${endpointBase}/sparql/endpoint/>
          PREFIX nextprot: <http://nextprot.org/rdf#>
          PREFIX db: <http://nextprot.org/rdf/db/>

          SELECT ?COMPOUND ?ENTRY WHERE {
            SERVICE endpoint:idsm {
              SERVICE endpoint:chembl {
                ?COMPOUND sachem:substructureSearch [
                    sachem:query "CC(=O)Oc1ccccc1C(O)=O" ]
              }

              ?ACTIVITY rdf:type chembl:Activity;
                  chembl:hasMolecule ?COMPOUND;
                  chembl:hasAssay ?ASSAY.
              ?ASSAY chembl:hasTarget ?TARGET.
              ?TARGET chembl:hasTargetComponent ?COMPONENT.
              ?COMPONENT chembl:targetCmptXref ?UNIPROT.
              ?UNIPROT rdf:type chembl:UniprotRef.
              ?UNIPROT dc:identifier ?UNI.
              ?TARGET chembl:hasProteinClassification ?CLASS.
              ?CLASS chembl:classPath "/Protein class/Surface antigen".
            }

            ?ENTRY nextprot:reference [
                nextprot:provenance db:UniProt;
                nextprot:accession ?UNI ].
          }`
      },
      {
        name: "neXtProt interoperability (via PDB)",
        description: "Ask the same query as in previous example, but use PDB identifiers to link the results together.",
        endpoint: "https://sparql.nextprot.org",
        query: idn`${0}
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          PREFIX dc: <http://purl.org/dc/elements/1.1/>
          PREFIX chembl: <http://rdf.ebi.ac.uk/terms/chembl#>
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX endpoint: <${endpointBase}/sparql/endpoint/>
          PREFIX nextprot: <http://nextprot.org/rdf#>
          PREFIX db: <http://nextprot.org/rdf/db/>

          SELECT ?COMPOUND ?ENTRY WHERE {
            SERVICE endpoint:idsm {
              SERVICE endpoint:chembl {
                ?COMPOUND sachem:substructureSearch [
                    sachem:query "CC(=O)Oc1ccccc1C(O)=O" ]
              }

              ?ACTIVITY rdf:type chembl:Activity;
                  chembl:hasMolecule ?COMPOUND;
                  chembl:hasAssay ?ASSAY.
              ?ASSAY chembl:hasTarget ?TARGET.
              ?TARGET chembl:hasTargetComponent ?COMPONENT.
              ?COMPONENT chembl:targetCmptXref ?UNIPROT.
              ?UNIPROT rdf:type chembl:ProteinDataBankRef.
              ?UNIPROT dc:identifier ?PDB.
              ?TARGET chembl:hasProteinClassification ?CLASS.
              ?CLASS chembl:classPath "/Protein class/Surface antigen".
            }

            ?ENTRY nextprot:reference [
                nextprot:provenance db:PDB;
                nextprot:accession ?PDB ].
          }`
      }]
  },{
    name: "Interoperability examples with Rhea & UniProt",
    queries: [{
        name: "Rhea interoperability",
        description: "Retrieve the Rhea biochemical reactions that involve cholesterol or cholesterol derivatives",
        endpoint: "https://sparql.rhea-db.org/sparql",
        query: idn`${0}
          PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX endpoint: <${endpointBase}/sparql/endpoint/>
          PREFIX up:<http://purl.uniprot.org/core/>
          PREFIX rh:<http://rdf.rhea-db.org/>
          PREFIX ch:<http://purl.obolibrary.org/obo/>

          SELECT DISTINCT ?CHEBI ?CHEBI_UNIPROT_NAME ?RHEA_REACTION ?RHEA_REACTION_EQUATION WHERE {
            SERVICE endpoint:chebi {
              ?CHEBI sachem:substructureSearch [
                  sachem:query "C1C2(C3(CCC4(C(C3(CC=C2CC(C1)O))(CCC4(C(C)CCCC(C)C)))C))C" ].
            }

            ?RHEA_REACTION rdfs:subClassOf rh:Reaction.
            ?RHEA_REACTION rh:status rh:Approved.
            ?RHEA_REACTION rh:equation ?RHEA_REACTION_EQUATION.
            ?RHEA_REACTION rh:side / rh:contains / rh:compound / rh:chebi ?CHEBI.
            ?CHEBI up:name ?CHEBI_UNIPROT_NAME.
          }`
      },
      {
        name: "Rhea+Uniprot: Enzymes",
        description: "Retrieve the number of UniProtKB/Swiss-Prot human enzymes that metabolize cholesterol or cholesterol derivatives",
        endpoint: "https://sparql.rhea-db.org/sparql",
        query: idn`${0}
          PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX endpoint: <${endpointBase}/sparql/endpoint/>
          PREFIX up:<http://purl.uniprot.org/core/>
          PREFIX rh:<http://rdf.rhea-db.org/>
          PREFIX ch:<http://purl.obolibrary.org/obo/>
          PREFIX taxon:<http://purl.uniprot.org/taxonomy/>
          PREFIX keywords:<http://purl.uniprot.org/keywords/>

          SELECT (count(distinct ?PROTEIN) AS ?HUMAN_PROTEIN_COUNT)
                 (count(distinct ?RHEA_REACTION) AS ?RHEA_REACTION_COUNT) WHERE {
            # endpoint:chebi service
            SERVICE endpoint:chebi {
                ?CHEBI sachem:substructureSearch [
                    sachem:query "C1C2(C3(CCC4(C(C3(CC=C2CC(C1)O))(CCC4(C(C)CCCC(C)C)))C))C" ].
            }

            ?RHEA_REACTION rdfs:subClassOf rh:Reaction.
            ?RHEA_REACTION rh:status rh:Approved.
            ?RHEA_REACTION rh:side / rh:contains / rh:compound / rh:chebi ?CHEBI.

            # UniProt service
            SERVICE <https://sparql.uniprot.org/sparql> {
              # Rhea reactions catalyzed by UniProt proteins
              ?PROTEIN up:annotation / up:catalyticActivity / up:catalyzedReaction ?RHEA_REACTION.

              # UniProtKB/Swiss-Prot entries
              ?PROTEIN up:reviewed true.
              # Human entries
              ?PROTEIN up:organism taxon:9606.
            }
          }`
      },
      {
        name: "Rhea+UniProt: Catalysis",
        description: "Retrieve the list of UniProtKB/Swiss-Prot human proteins that catalyze Rhea reactions involving cholesterol or cholesterol derivatives",
        endpoint: "https://sparql.rhea-db.org/sparql",
        query: idn`${0}
          PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX endpoint: <${endpointBase}/sparql/endpoint/>
          PREFIX up:<http://purl.uniprot.org/core/>
          PREFIX rh:<http://rdf.rhea-db.org/>
          PREFIX ch:<http://purl.obolibrary.org/obo/>
          PREFIX taxon:<http://purl.uniprot.org/taxonomy/>
          PREFIX keywords:<http://purl.uniprot.org/keywords/>

          SELECT distinct ?CHEBI ?CHEBI_UNIPROT_NAME ?RHEA_REACTION ?PROTEIN ?PROTEIN_FULL_NAME WHERE {
            # endpoint:chebi service
            SERVICE endpoint:chebi {
              ?CHEBI sachem:substructureSearch [
                    sachem:query "C1C2(C3(CCC4(C(C3(CC=C2CC(C1)O))(CCC4(C(C)CCCC(C)C)))C))C" ].
              }

            ?RHEA_REACTION rdfs:subClassOf rh:Reaction .
            ?RHEA_REACTION rh:status rh:Approved .
            ?RHEA_REACTION rh:side / rh:contains / rh:compound / rh:chebi ?CHEBI .
            ?CHEBI up:name ?CHEBI_UNIPROT_NAME .

            # UniProt service
            SERVICE <https://sparql.uniprot.org/sparql> {
              # Rhea reactions catalyzed by UniProt proteins
              ?PROTEIN up:annotation/up:catalyticActivity/up:catalyzedReaction ?RHEA_REACTION.

              # UniProtKB/Swiss-Prot entries
              ?PROTEIN up:reviewed true.
              # Human entries
              ?PROTEIN up:organism taxon:9606.
              # Protein name
              ?PROTEIN up:recommendedName/up:fullName ?PROTEIN_FULL_NAME.
            }
          }`
      },
      {
        name: "Rhea+UniProt: Disease-related enzymes",
        description: "Retrieve the number of UniProtKB/Swiss-Prot human enzymes that metabolize cholesterol or cholesterol derivatives and that are involved in diseases",
        endpoint: "https://sparql.rhea-db.org/sparql",
        query: idn`${0}
          PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX endpoint: <${endpointBase}/sparql/endpoint/>
          PREFIX up:<http://purl.uniprot.org/core/>
          PREFIX rh:<http://rdf.rhea-db.org/>
          PREFIX ch:<http://purl.obolibrary.org/obo/>
          PREFIX taxon:<http://purl.uniprot.org/taxonomy/>
          PREFIX keywords:<http://purl.uniprot.org/keywords/>
          PREFIX disease: <http://purl.uniprot.org/core/disease/>
          PREFIX skos:<http://www.w3.org/2004/02/skos/core#>

          SELECT (count(distinct ?PROTEIN) as ?HUMAN_PROTEIN_COUNT)
                 (count(distinct ?DISEASE) as ?DISEASE_COUNT) WHERE {
            # endpoint:chebi service
            SERVICE endpoint:chebi {
                ?CHEBI sachem:substructureSearch [
                    sachem:query "C1C2(C3(CCC4(C(C3(CC=C2CC(C1)O))(CCC4(C(C)CCCC(C)C)))C))C" ].
            }

            ?RHEA_REACTION rdfs:subClassOf rh:Reaction.
            ?RHEA_REACTION rh:status rh:Approved.
            ?RHEA_REACTION rh:side / rh:contains / rh:compound / rh:chebi ?CHEBI.

            # UniProt service
            SERVICE <https://sparql.uniprot.org/sparql> {
              # Rhea reactions catalyzed by UniProt proteins
              ?PROTEIN up:annotation/up:catalyticActivity/up:catalyzedReaction ?RHEA_REACTION.

              # UniProtKB/Swiss-Prot entries
              ?PROTEIN up:reviewed true.
              # Human entries
              ?PROTEIN up:organism taxon:9606.
              # disease
              ?PROTEIN up:annotation/up:disease ?DISEASE.
            }
          }`
      },
      {
        name: "Rhea+UniProt: Involved proteins",
        description: "Retrieve the list of diseases involving human enzymes that metabolize cholesterol or cholesterol derivatives and the number of proteins involved",
        endpoint: "https://sparql.rhea-db.org/sparql",
        query: idn`${0}
          PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>
          PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
          PREFIX endpoint: <${endpointBase}/sparql/endpoint/>
          PREFIX up:<http://purl.uniprot.org/core/>
          PREFIX rh:<http://rdf.rhea-db.org/>
          PREFIX ch:<http://purl.obolibrary.org/obo/>
          PREFIX taxon:<http://purl.uniprot.org/taxonomy/>
          PREFIX keywords:<http://purl.uniprot.org/keywords/>
          PREFIX disease: <http://purl.uniprot.org/core/disease/>
          PREFIX skos:<http://www.w3.org/2004/02/skos/core#>

          SELECT ?DISEASE ?DISEASE_NAME (count(distinct ?PROTEIN) as ?HUMAN_PROTEIN_COUNT) WHERE {
            SERVICE endpoint:chebi {
              ?CHEBI sachem:substructureSearch [
                    sachem:query "C1C2(C3(CCC4(C(C3(CC=C2CC(C1)O))(CCC4(C(C)CCCC(C)C)))C))C" ].
              }

            ?RHEA_REACTION rdfs:subClassOf rh:Reaction.
            ?RHEA_REACTION rh:status rh:Approved.
            ?RHEA_REACTION rh:side / rh:contains / rh:compound / rh:chebi ?CHEBI .

            # UniProt endpoint service
            SERVICE <https://sparql.uniprot.org/sparql> {
              # Rhea reactions catalyzed by UniProt proteins
              ?PROTEIN up:annotation/up:catalyticActivity/up:catalyzedReaction ?RHEA_REACTION .

              # UniProtKB/Swiss-Prot entries
              ?PROTEIN up:reviewed true .
              # Human entries
              ?PROTEIN up:organism taxon:9606 .
              # disease
              ?PROTEIN up:annotation/up:disease ?DISEASE .
              ?DISEASE skos:prefLabel ?DISEASE_NAME .
            }
          }
          GROUP BY ?DISEASE ?DISEASE_NAME
          ORDER BY DESC(count(distinct ?PROTEIN))`
      },
      {
        name: "Rhea+UniProt: Interacting drugs",
        description: "Retrieve ChEMBL drugs that interact with UniProt enzymes catalyzing Rhea reactions involving members of the ChEBI class ChEBI:15889 (sterol) as participants.",
        endpoint: endpointBase + "/sparql/endpoint/idsm",
        query: idn`${0}
          PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>
          PREFIX owl: <http://www.w3.org/2002/07/owl#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
          PREFIX up: <http://purl.uniprot.org/core/>
          PREFIX rh: <http://rdf.rhea-db.org/>
          PREFIX CHEBI: <http://purl.obolibrary.org/obo/CHEBI_>
          PREFIX chebihash: <http://purl.obolibrary.org/obo/chebi#>
          PREFIX taxon:<http://purl.uniprot.org/taxonomy/>
          PREFIX cco: <http://rdf.ebi.ac.uk/terms/chembl#>
          prefix skos: <http://www.w3.org/2004/02/skos/core#>

          SELECT DISTINCT ?protein ?proteinFullName ?activityType
              ?standardActivityValue ?standardActivityUnit ?chemblMolecule ?chemlbMoleculePrefLabel WHERE {
            SERVICE <https://sparql.uniprot.org> {
              SERVICE <https://sparql.rhea-db.org/sparql> {
                # retrieve members of the ChEBI class ChEBI:15889 (sterol)
                {
                  ?chebi (rdfs:subClassOf)+ CHEBI:15889.
                } UNION {
                  _:bn (rdfs:subClassOf)+ CHEBI:15889.
                  _:bn rdfs:subClassOf [
                      a owl:Restriction;
                      owl:onProperty chebihash:has_major_microspecies_at_pH_7_3;
                      owl:someValuesFrom ?chebi ].
                }

                # retrieve the Rhea reactions involving these ChEBI as participants
                ?reaction rdfs:subClassOf rh:Reaction;
                    rh:status rh:Approved;
                    rh:side / rh:contains / rh:compound / rh:chebi ?chebi.
              }

              # retrieve the human (taxid:9606) enzymes catalyzing these Rhea reactions
              ?protein up:annotation / up:catalyticActivity / up:catalyzedReaction ?reaction;
                  up:organism taxon:9606;
                  up:recommendedName / up:fullName ?proteinFullName.
            }

            # retrieve the drugs in clinical phase 4 that interact with the enzymes
            ?activity a cco:Activity;
                cco:hasAssay / cco:hasTarget / cco:hasTargetComponent/cco:targetCmptXref ?protein;
                cco:hasMolecule ?chemblMolecule;
                cco:standardType ?activityType;
                cco:standardValue ?standardActivityValue;
                cco:standardUnits ?standardActivityUnit.

            ?chemblMolecule cco:highestDevelopmentPhase "4"^^xsd:int;
                skos:prefLabel ?chemlbMoleculePrefLabel.
          }`
      }]
}];


export { demoQueries };
