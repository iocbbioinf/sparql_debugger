import React, { useState } from 'react';

export const PENDING_STATE = "IN_PROGRESS";
export const SUCCESS_STATE = "SUCCESS";
export const FAILURE_STATE = "ERROR";

export const [baseUrl, setBaseUrl] = useState("http://idsm-debugger-test6.dyn.cloud.e-infra.cz");