import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";

import Search from "./Search.js";
import Results from "./Results.js";
import { parseHash } from "./hash.js";
import { trackPageView } from "../matomo.js"

import "./Sachem.scss"


function Sachem() {
  React.useEffect(() => {
    document.title = "IDSM / Sachem GUI";
    trackPageView();
  }, []);

  return (
    <Routes>
      <Route path="/search/:hash?" element={<SearchPage />} />
      <Route path="/results/:hash" element={<ResultsPage />} />
      <Route path="/" element={<SearchPage />} />
    </Routes>
  );
}


function SearchPage() {
  var { mol, params } = parseHash(useParams()["hash"]);

  return <Search defaultQuery={mol} defaultParams={params}/>
}


function ResultsPage() {
  var { mol, params } = parseHash(useParams()["hash"]);

  if(mol == null)
    return <Navigate to="/search"/>;

  return <Results query={mol} params={params}/>;
}


export default Sachem;
