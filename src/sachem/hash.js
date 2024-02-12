import LZString from "lz-string";

import { databaseOpts, chargeOpts, isotopeOpts, aromaOpts, tautomerOpts, radicalOpts, stereoOpts, similarityOpts } from "./idsm.js" ;


const defaultOpts = {
  mode: "substructure",
  exact: false,
  database: [ databaseOpts[0] ],
  threshold: 0.8,
  charge: chargeOpts[1],
  isotope: isotopeOpts[0],
  aroma: aromaOpts[2],
  stereo: stereoOpts[0],
  tautomers: tautomerOpts[0],
  radicals: radicalOpts[0],
  radius: similarityOpts[0],
};


function makeHash(mol, params) {
  const parameters = {
    mode: params.mode,
    exact: params.exact,
    database: params.database.map(db => db.value),
    threshold: params.threshold,
    charge: params.charge.value,
    isotope: params.isotope.value,
    aroma: params.aroma.value,
    stereo: params.stereo.value,
    tautomers: params.tautomers.value,
    radicals: params.radicals.value,
    radius: params.radius.value,
  }

  return LZString.compressToBase64(JSON.stringify({ mol: mol, params: parameters })).replace(/\//g, "-");
}


function parseHash(hash) {
  if(!hash)
    return { mol: null, params: defaultOpts };

  try {
    const json = JSON.parse(LZString.decompressFromBase64(hash.replace(/-/g, "/")));

    if("database" in json.params && typeof json.params.database === "string")
      json.params.database = [json.params.database];

    const parameters = {
      mode: json.params.mode,
      exact: json.params.exact,
      database: json.params.database.map(db => databaseOpts.find(e => e.value === db)),
      threshold: json.params.threshold,
      charge: chargeOpts[json.params.charge],
      isotope: isotopeOpts[json.params.isotope],
      aroma: aromaOpts[json.params.aroma],
      stereo: stereoOpts[json.params.stereo],
      tautomers: tautomerOpts[json.params.tautomers],
      radicals: radicalOpts[json.params.radicals],
      radius: similarityOpts[json.params.radius],
    }

    return { mol: json.mol, params: parameters };
  } catch(err) {
    console.log("Hash link decoding failed: " + err);
    return { mol: null, params: defaultOpts };
  }
}


export { makeHash, parseHash };
