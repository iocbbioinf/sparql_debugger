# SPARQL Query Editor and Debugger

This repository provides an interface for creating, executing, and debugging SPARQL federated queries. It includes a customized query editor, result visualizer, and tools for in-depth debugging of query execution.

## Features

### SPARQL Query Editor

SPARQL Query editor is a customized standard [YASGUI](https://docs.triply.cc/yasgui-api/) component. The queries are specified in standard [SPARQL](https://www.w3.org/TR/sparql11-query/) syntax. The interface provides basic syntax highlighting and autocompletion of prefixes and keywords. Several queries can be edited and executed at once, using the integrated tabs functionality. Tabs and their contents are persistent even if the user closes the frontend page in browser.

Above the query text area, there is a field to enter the desired endpoint where the query will be executed.

Below the query, there is a result visualizer that renders results in either table format or raw response form.

### Query Execution Debugging

On the right side of the Query editor, there is a **Debug** button that starts debugging. Below this button, the service execution tree is continuously rendered as services are finished. For each service call, the following information is displayed:

- **State:** Pending / OK, Failure
- **HTTP status** of the response
- **HTTP service request**
- **HTTP service response**
- **Duration**
- **Number of response items**

The HTTP result of the root node (SPARQL endpoint given by Query editor) is sent to and rendered by YASGUI result visualizer.

It’s possible to run the query without debugging by clicking the **Run** button beside the Debug button.

It's possible to cancel both debugging or running query by **Cancel** button.

In case a service is invoked multiple times with varying substitutions of variables, the service calls are aggregated to a special node that aggregates all the service calls and is by default collapsed. These "bulk" nodes are colored yellow, and the following information is displayed:

- **Number of calls**
- **Duration:** Time taken from when the first bulk service started until the actual last service finished.

### Demo Examples

On the left side, there is a list of Federated query examples. By **Edit Query** button, a certain query example is populated to the Query editor.

## Deployment

Applcation is deployed [here](https://idsm-react-debugger-1.dyn.cloud.e-infra.cz/).

---
