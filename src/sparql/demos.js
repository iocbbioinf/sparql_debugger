import { endpointBase } from "../config";
import { idn } from "../tag.js"


const demoQueries = [
  {
    name: "Examples with UniProt",
    description: "Due to availability of official ChEMBL RDF service, these examples currently use a custom mirror of ChEMBL.",
    queries: [{
        name: "UniProt query",
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
      }]
  },
  
  {
    name: "Examples from BioSODA demonstrate bulk service node",
    description: "BioSODA: Federated template search over biological databases",
    queries: [{
        name: "Retrieve proteins",
        description: "Retrieve proteins which are the mouse's proteins encoded by genes which are expressed in the liver and are orthologous to human's INS gene.",
        endpoint: "https://idsm.elixir-czech.cz/sparql/endpoint/idsm",
        query: idn`${0}
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX up: <http://purl.uniprot.org/core/>
        PREFIX genex: <http://purl.org/genex#>
        PREFIX obo: <http://purl.obolibrary.org/obo/>
        PREFIX orth: <http://purl.org/net/orth#>
        PREFIX sio: <http://semanticscience.org/resource/>
        PREFIX lscr: <http://purl.org/lscr#>
        SELECT ?name1 ?protein1 ?name2 ?protein2 ?OMA_link2 ?anatomicalEntity {
          SELECT DISTINCT * {
            SERVICE <https://www.bgee.org/sparql/> {
              ?taxon up:commonName 'human' ;
                up:commonName ?name1 .
              ?taxon2 up:commonName 'mouse' ;
                up:commonName ?name2 .
            }
            SERVICE <https://sparql.omabrowser.org/sparql/> {
              ?cluster a orth:OrthologsCluster .
              ?cluster orth:hasHomologousMember ?node1 .
              ?cluster orth:hasHomologousMember ?node2 .
              ?node2 orth:hasHomologousMember* ?protein2 .
              ?node1 orth:hasHomologousMember* ?protein1 .
              ?protein1 a orth:Protein .
              ?protein1 rdfs:label 'INS' ;
                orth:organism/obo:RO_0002162 ?taxon .
              ?protein2 a orth:Protein ;
                sio:SIO_010079 ?gene ; #is encoded by
                orth:organism/obo:RO_0002162 ?taxon2 .
              ?gene lscr:xrefEnsemblGene ?geneEns .
              ?protein2 rdfs:seeAlso ?OMA_link2 .
              FILTER ( ?node1 != ?node2 )
            }
            SERVICE <https://www.bgee.org/sparql/> {
              ?geneB a orth:Gene .
                ?geneB genex:isExpressedIn ?cond .
                ?cond genex:hasAnatomicalEntity ?anat .
                ?geneB lscr:xrefEnsemblGene ?geneEns .
              ?anat rdfs:label 'liver' ;
                rdfs:label ?anatomicalEntity .
              ?geneB orth:organism ?o .
              ?o obo:RO_0002162 ?taxon2 .
            }
          }
          LIMIT 10
        }
        LIMIT 10`
      },
      {
        name: "Anatomic entities",
        description: "Anatomic entities where the ins zebrafish gene is expressed and its gene GO annotations.",
        endpoint: "https://idsm.elixir-czech.cz/sparql/endpoint/idsm",
        query: idn`${0}
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX genex: <http://purl.org/genex#>
        PREFIX lscr: <http://purl.org/lscr#>
        PREFIX orth: <http://purl.org/net/orth#>
        PREFIX obo: <http://purl.obolibrary.org/obo/>
        PREFIX up: <http://purl.uniprot.org/core/>
        SELECT DISTINCT ?anat_label ?GO_CLASS ?GO_LABEL {
          SERVICE <https://www.bgee.org/sparql/> {
            SELECT ?geneEns ?anat_label {
              ?geneB a orth:Gene .
              ?geneB genex:isExpressedIn ?anat .
              ?geneB rdfs:label ?anatLabel ;
                lscr:xrefEnsemblGene ?geneEns .
              FILTER (UCASE($anatLabel) = UCASE('ins'))
              ?anat rdfs:label ?anat_label .
              ?geneB orth:organism ?o .
              ?o obo:RO_0002162 ?taxon2 .
              ?taxon2 up:commonName 'zebrafish' .
            }
          }
          SERVICE <https://sparql.uniprot.org/sparql> {
            ?uniprot rdfs:seeAlso / up:transcribedFrom ?geneEns .
            ?uniprot a up:Protein .
            ?uniprot up:classifiedWith ?GO_CLASS .
            ?GO_CLASS rdfs:label ?GO_LABEL .
          }
        }
        LIMIT 10`
    },
    {
      name: "Primates genes",
      description: "Which are the genes in Primates orthologous to a gene that is expressed in the fruit fly’s eye?",
      endpoint: "https://idsm.elixir-czech.cz/sparql/endpoint/idsm",
      query: idn`${0}
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX up: <http://purl.uniprot.org/core/>
      PREFIX genex: <http://purl.org/genex#>
      PREFIX obo: <http://purl.obolibrary.org/obo/>
      PREFIX orth: <http://purl.org/net/orth#>
      PREFIX dcterms: <http://purl.org/dc/terms/>
      SELECT DISTINCT ?orthologous_to_gene_id ?orthologous_to_gene ?hasOrtholog WHERE {
        SELECT * {
          SERVICE <https://www.bgee.org/sparql/> {
            SELECT DISTINCT ?gene ?orthologous_to_gene_id ?orthologous_to_gene {
              ?gene a orth:Gene .
              ?gene genex:isExpressedIn ?anat .
              ?anat rdfs:label 'eye' .
              ?gene orth:organism ?o .
              ?o obo:RO_0002162 ?taxon .
              ?gene dcterms:identifier ?orthologous_to_gene_id .
              ?gene rdfs:seeAlso ?orthologous_to_gene .
              ?taxon up:commonName 'fruit fly' .
            } LIMIT 100
          }
          SERVICE <https://sparql.omabrowser.org/sparql/> {
            ?protein2 a orth:Protein .
            ?protein1 a orth:Protein .
            ?clusterPrimates a orth:OrthologsCluster .
            ?cluster a orth:OrthologsCluster .
            ?cluster orth:hasHomologousMember ?node1 .
            ?cluster orth:hasHomologousMember ?node2 .
            ?node2 orth:hasHomologousMember* ?clusterPrimates .
            ?clusterPrimates orth:hasHomologousMember* ?protein2 .
            ?node1 orth:hasHomologousMember* ?protein1 .
            ?protein1 dcterms:identifier ?orthologous_to_gene_id .
            ?protein2 rdfs:seeAlso ?hasOrtholog .
            ?clusterPrimates orth:hasTaxonomicRange ?taxRange .
            ?taxRange orth:taxRange ?taxLevel .
            VALUES ?taxLevel { 'Primates' }
            FILTER ( ?node1 != ?node2 )
          }
        }
      }
      LIMIT 10`
    },
    {
      name: "Rabbit's proteins",
      description: "Rabbit's proteins encoded by genes that are orthologous to Mouse's HBB-Y gene and their cross reference links to Uniprot.",
      endpoint: "https://idsm.elixir-czech.cz/sparql/endpoint/idsm",
      query: idn`${0}
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX lscr: <http://purl.org/lscr#>
      PREFIX orth: <http://purl.org/net/orth#>
      PREFIX up: <http://purl.uniprot.org/core/>
      PREFIX obo: <http://purl.obolibrary.org/obo/>
      SELECT DISTINCT ?PROTEIN_1 ?PROTEIN_2 ?UNIPROT_XREF_1 ?UNIPROT_XREF_2 WHERE {
        SERVICE <https://sparql.uniprot.org/sparql> {
          ?taxon_1 up:commonName 'Mouse' .
          ?taxon_2 up:commonName 'Rabbit' .
        }
        SERVICE <https://sparql.omabrowser.org/sparql/> {
          ?cluster a orth:OrthologsCluster .
          ?cluster orth:hasHomologousMember ?node1 .
          ?cluster orth:hasHomologousMember ?node2 .
          ?node2 orth:hasHomologousMember* ?PROTEIN_2 .
          ?node1 orth:hasHomologousMember* ?PROTEIN_1 .
          ?PROTEIN_1 a orth:Protein .
          ?PROTEIN_1 orth:organism/obo:RO_0002162 ?taxon_1 ;
            rdfs:label 'HBB-Y' ;
            lscr:xrefUniprot ?UNIPROT_XREF_1 .
          ?PROTEIN_2 a orth:Protein .
          ?PROTEIN_2 orth:organism/obo:RO_0002162 ?taxon_2 .
          ?PROTEIN_2 lscr:xrefUniprot ?UNIPROT_XREF_2 .
          FILTER ( ?node1 != ?node2 )
        }
      }`
    }  
    ]
  },  
  
  {
    name: "Examples with Rhea & UniProt",
    queries: [{
        name: "Rhea query",
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
},
];

export { demoQueries };
