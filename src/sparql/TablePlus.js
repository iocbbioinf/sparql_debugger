/**
Copyright (c) 2021 Triply B.V.
Copyright (c) 2021 Jakub Galgonek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import $ from "jquery";
import ReactDOM from 'react-dom';
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faTable } from "@fortawesome/free-solid-svg-icons";
import { escape, cloneDeep } from "lodash-es";
import "datatables.net";
import ColumnResizer from "column-resizer";

import { servletBase } from "../config";

import "./TablePlus.scss";
import "datatables.net-dt/css/jquery.dataTables.css";


const DEFAULT_PAGE_SIZE = 50;

const PN_CHARS_BASE = `([A-Za-z\\u{00C0}-\\u{00D6}\\u{00D8}-\\u{00F6}\\u{00F8}-\\u{02FF}\\u{0370}-\\u{037D}\\u{037F}-\\u{1FFF}\\u{200C}-\\u{200D}\\u{2070}-\\u{218F}\\u{2C00}-\\u{2FEF}\\u{3001}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFFD}]|[\\u{D840}-\\u{DBBF}][\\u{DC00}–\\u{DFFF}])`;
const PN_CHARS_U = `(${PN_CHARS_BASE}|_)`;
const PN_CHARS = `(${PN_CHARS_U}|[-0-9\\u{00B7}\\u{0300}-\\u{036F}\\u{203F}-\\u{2040}])`;
const PERCENT = `(%[0-9A-Fa-f][0-9A-Fa-f])`;
const PN_LOCAL_ESC = `(\\\\[-_~.!$&'()*+,;=/?#@%])`;
const PLX = `(${PERCENT}|${PN_LOCAL_ESC})`;
const PN_LOCAL = `((${PN_CHARS_U}|[0-9:]|${PLX})((${PN_CHARS}|[.:]|${PLX})*(${PN_CHARS}|:|${PLX}))?)?`;
var localNameRegExp = new RegExp(`^${PN_LOCAL}$`,"u");


const compounds = [
  {
    db: "drugbank",
    pattern: /^http:\/\/wifo5-04\.informatik\.uni-mannheim\.de\/drugbank\/resource\/drugs\/DB([0-9]+)$/,
    link: "https://go.drugbank.com/drugs/DB"
  },{
    db: "chebi",
    pattern: /^http:\/\/purl\.obolibrary\.org\/obo\/CHEBI_([0-9]+)$/,
    link: "https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:"
  },{
    db: "chembl",
    pattern: /^http:\/\/rdf\.ebi\.ac\.uk\/resource\/chembl\/molecule\/CHEMBL([0-9]+)$/,
    link: "https://www.ebi.ac.uk/chembl/compound_report_card/CHEMBL"
  },{
    db: "pubchem",
    pattern: /^http:\/\/rdf\.ncbi\.nlm\.nih\.gov\/pubchem\/compound\/CID([0-9]+)$/,
    link: "https://pubchem.ncbi.nlm.nih.gov/compound/"
  },{
    db: "wikidata",
    pattern: /^http:\/\/www\.wikidata\.org\/entity\/Q([0-9]+)$/,
    link: "http://www.wikidata.org/entity/Q"
  },{
    db: "mona",
    pattern: /^https:\/\/idsm\.elixir-czech\.cz\/rdf\/mona\/CMPD_(.*)$/,
    link: "https://mona.fiehnlab.ucdavis.edu/spectra/display/"
  }
]


const spectrum = [
  {
    db: "mona",
    pattern: /^https:\/\/idsm\.elixir-czech\.cz\/rdf\/mona\/MS_(.*)$/,
    link: "https://mona.fiehnlab.ucdavis.edu/spectra/display/"
  },{
    db: "isdb",
    pattern: /^https:\/\/idsm\.elixir-czech\.cz\/rdf\/isdb\/MS_(.*)$/,
    link: "https://zenodo.org/records/8287341?id="
  }
]


const experiments =  [
  {
    db: "mona",
    pattern: /^https:\/\/idsm\.elixir-czech\.cz\/rdf\/mona\/(.*)$/,
    link: "https://mona.fiehnlab.ucdavis.edu/spectra/display/"
  },{
    db: "isdb",
    pattern: /^https:\/\/idsm\.elixir-czech\.cz\/rdf\/isdb\/(.*)$/,
    link: "https://zenodo.org/records/8287341?id="
  }
]


class TablePlus {
  config;
  persistentConfig = {};
  yasr;
  tableControls;
  dataTable;
  tableFilterField;
  tableSizeField;
  tableCompactSwitch;
  expandedCells = {};
  tableResizer;

  helpReference = "https://triply.cc/docs/yasgui#table";
  label = "Table+";
  priority = 10;


  static defaults = {
    openIriInNewWindow: true,
    ellipseLength: 2048,
    tableConfig: {
      dom: "tip", // tip: Table, Page Information and Pager, change to ipt for showing pagination on top
      pageLength: DEFAULT_PAGE_SIZE, //default page length
      lengthChange: true, //allow changing page length
      data: [],
      columns: [],
      order: [],
      deferRender: true,
      orderClasses: false,
      autoWidth: false,
      language: {
        paginate: {
          first: "&lt;&lt;", // Have to specify these two due to TS defs, <<
          last: "&gt;&gt;", // Have to specify these two due to TS defs, >>
          next: "&gt;", // >
          previous: "&lt;", // <
        },
      },
    },
  }


  getIcon() {
    var svgContainer = document.createElement("div");
    svgContainer.className = "svgImg";
    ReactDOM.render(<Icon icon={faTable}/>, svgContainer);
    return svgContainer;
  }


  constructor(yasr) {
    this.yasr = yasr;
    //TODO read options from constructor
    this.config = cloneDeep(TablePlus.defaults);
  }


  getRows() {
    if(!this.yasr.results)
        return [];

    const bindings = this.yasr.results.getBindings();

    if(!bindings)
        return [];

    // Vars decide the columns
    const vars = this.yasr.results.getVariables();

    // Use "" as the empty value, undefined will throw runtime errors
    return bindings.map((binding, rowId) => [rowId + 1, ...vars.map((variable) => binding[variable] ?? "")]);
  }


  getImgUri(db, id, size) {
    return `${servletBase}/${db}/compound/image?id=${id}&amp;w=${size}`;
  }


  getMSUri(db, id) {
    return `${servletBase}/ms.html#n/${db}/${id}`;
  }


  getUriLinkFromBinding(binding, prefixes) {
    const href = binding.value;
    let visibleString = href;
    let size = href.length;
    let prefixed = false;

    if(prefixes) {
      for(const prefix in prefixes) {
        const definition = prefixes[prefix];

        if(href.indexOf(definition) === 0) {
          const name = href.substring(definition.length);

          if((size > name.length || (size === name.length && visibleString.length - size - 1 > prefix.length))
              && name.match(localNameRegExp)) {
            visibleString = prefix + ":" + name;
            size = name.length;
            prefixed = true;
          }
        }
      }
    }

    if(!prefixed && window.info && this.prefixes) {
      for(const prefix in this.prefixes) {
        const definition = this.prefixes[prefix];

        if(!(prefixes && prefixes[prefix]) && href.indexOf(definition) === 0) {
          const name = href.substring(definition.length);

          if((size > name.length || (size === name.length && visibleString.length - size - 1 > prefix.length))
              && name.match(localNameRegExp)) {
            visibleString = prefix + ":" + name;
            size = name.length;
            prefixed = true;
          }
        }
      }
    }

    // Hide brackets when prefixed or compact
    const hideBrackets = prefixed || this.persistentConfig.compact;
    const target = `${this.config.openIriInNewWindow ? '_blank ref="noopener noreferrer"' : "_self"}`;

    for(const i in compounds) {
      const e = compounds[i];
      const m = href.match(e.pattern);

      if(m) {
        const link = `<span class="iri">${hideBrackets ? "" : "&lt;"}<a class='iri' target='${target}' href='${e.link}${m[1]}'>${visibleString}</a>${hideBrackets ? "" : "&gt;"}</span>`;
        return `<a target='${target}' href='${this.getImgUri(e.db, m[1], 1000)}' class='d-inline-block'><img class='zoomable' src='${this.getImgUri(e.db, m[1], 400)}' loading='lazy' onerror='this.style.display="none"'></a>${link}`;
      }
    }

    for(const i in spectrum) {
      const e = spectrum[i];
      const m = href.match(e.pattern);

      if(m) {
        const link = `<span class="iri">${hideBrackets ? "" : "&lt;"}<a class='iri' target='${target}' href='${e.link}${m[1]}'>${visibleString}</a>${hideBrackets ? "" : "&gt;"}</span>`;
        return `<iframe src='${this.getMSUri(e.db, m[1])}' title='MS Chart' loading='lazy' width='100' height='60' scrolling='no' style='border: none; pointer-events: none;'></iframe>${link}`;
      }
    }

    for(const i in experiments) {
      const e = experiments[i];
      const m = href.match(e.pattern);

      if(m) {
        const link = `<span class="iri">${hideBrackets ? "" : "&lt;"}<a class='iri' target='${target}' href='${e.link}${m[1]}'>${visibleString}</a>${hideBrackets ? "" : "&gt;"}</span>`;
        return `<a target='${target}' href='${this.getImgUri(e.db, m[1], 1000)}' class='d-inline-block'><img class='zoomable' src='${this.getImgUri(e.db, m[1], 400)}' loading='lazy' onerror='this.style.display="none"'></a><iframe src='${this.getMSUri(e.db, m[1])}' title='MS Chart' loading='lazy' width='100' height='60' scrolling='no' style='border: none; pointer-events: none;'></iframe>${link}`;
      }
    }

    const link = `<span class="iri">${hideBrackets ? "" : "&lt;"}<a class='iri' target='${target}' href='${href}'>${visibleString}</a>${hideBrackets ? "" : "&gt;"}</span>`;
    return link;
  }


  getCellContent(binding, prefixes, options) {
    let content;

    if(binding.type === "uri")
      content = this.getUriLinkFromBinding(binding, prefixes);
    else
      content = `<span class='nonIri'>${this.formatLiteral(binding, prefixes, options)}</span>`;

    return `<div>${content}</div>`;
  }


  formatLiteral(literalBinding, prefixes, options) {
    let stringRepresentation = literalBinding.value;

    const shouldEllipse = options?.ellipse ?? true;

    // make sure we don't do an ellipsis for just one character
    if(shouldEllipse && stringRepresentation.length > this.config.ellipseLength + 1) {
      const ellipseSize = this.config.ellipseLength / 2;
      stringRepresentation = `${escape(stringRepresentation.slice(0, ellipseSize))}<a class="tableEllipse" title="Click to expand">…</a>${escape(stringRepresentation.slice(-1 * ellipseSize))}`;
    } else {
      stringRepresentation = escape(stringRepresentation);
    }

    // Return now when in compact mode.
    if(this.persistentConfig.compact)
      return stringRepresentation;

    if(literalBinding["xml:lang"]) {
      stringRepresentation = `"${stringRepresentation}"<sup>@${literalBinding["xml:lang"]}</sup>`;
    } else if(literalBinding.datatype) {
      const dataType = this.getUriLinkFromBinding({ type: "uri", value: literalBinding.datatype }, prefixes);
      stringRepresentation = `"${stringRepresentation}"<sup>^^${dataType}</sup>`;
    }

    return stringRepresentation;
  }


  getColumns() {
    if(!this.yasr.results)
        return [];

    const prefixes = this.yasr.getPrefixes();

    return [
      {
        name: "",
        searchable: false,
        width: `${this.getSizeFirstColumn()}px`,
        type: "num",
        orderable: false,
        visible: this.persistentConfig.compact !== true,
        render: (data, type) =>
          type === "filter" || type === "sort" || !type ? data : `<div class="rowNumber">${data}</div>`,
      }, //prepend with row numbers column
      ...this.yasr.results?.getVariables().map((name) => {
        return {
          name: name,
          title: name,
          render: (data, type, _row, meta) => {
            // Handle empty rows
            if(data === "")
                return data;

            if(type === "filter" || type === "sort" || !type)
                return data.value;

            // Check if we need to show the ellipsed version
            if(this.expandedCells[`${meta.row}-${meta.col}`])
              return this.getCellContent(data, prefixes, { ellipse: false });

            return this.getCellContent(data, prefixes);
          },
          createdCell: (cell, cellData, _rowData, row, col) => {
            // Do nothing on empty cells
            if(cellData === "")
                return;

            // Ellipsis is only applied on literals variants
            if(cellData.type === "literal" || cellData.type === "typed-literal") {
              const ellipseEl = cell.querySelector(".tableEllipse");
              if(ellipseEl)
                ellipseEl.addEventListener("click", () => {
                  this.expandedCells[`${row}-${col}`] = true;
                  // Disable the resizer as it messes with the initial drawing
                  this.tableResizer?.reset({ disable: true });
                  // Make the table redraw the cell
                  this.dataTable?.cell(row, col).invalidate();
                  // Signal the table to redraw the width of the table
                  this.dataTable?.columns.adjust();
                });
            }
          },
        };
      }),
    ];
  }


  getSizeFirstColumn() {
    const numResults = this.yasr.results?.getBindings()?.length || 0;
    return numResults.toString().length * 5;
  }


  draw(persistentConfig) {
    this.persistentConfig = { ...this.persistentConfig, ...persistentConfig };
    const table = document.createElement("table");
    const rows = this.getRows();
    const columns = this.getColumns();
    this.expandedCells = {};

    if(rows.length <= (persistentConfig?.pageSize || DEFAULT_PAGE_SIZE)) {
      //this.yasr.pluginControls;
      this.yasr.rootEl.classList.add("isSinglePage");
    } else {
      this.yasr.rootEl.classList.remove("isSinglePage");
    }

    if(this.dataTable) {
      // Resizer needs to be disabled otherwise it will mess with the new table's width
      this.tableResizer?.reset({ disable: true });
      this.tableResizer = undefined;

      this.dataTable.destroy(true);
      this.dataTable = undefined;
    }

    this.yasr.resultsEl.appendChild(table);

    // reset some default config properties as they couldn't be initialized beforehand
    const dtConfig = {
      ...((cloneDeep(this.config.tableConfig))),
      pageLength: persistentConfig?.pageSize ? persistentConfig.pageSize : DEFAULT_PAGE_SIZE,
      data: rows,
      columns: columns,
    };

    this.dataTable = $(table).DataTable(dtConfig);
    this.tableResizer = new ColumnResizer/*.default*/(table, {
      widths: this.persistentConfig.compact === true ? [] : [this.getSizeFirstColumn()],
      partialRefresh: true,
    });

    // Expanding an ellipsis disables the resizing, wait for the signal to re-enable it again
    this.dataTable.on("column-sizing", () => this.enableResizer());
    this.drawControls();
  }


  handleTableSearch = (event) => {
    this.dataTable?.search((event.target).value).draw();
  }


  handleTableSizeSelect = (event) => {
    const pageLength = parseInt((event.target).value);
    // Set page length
    this.dataTable?.page.len(pageLength).draw();
    // Store in persistentConfig
    this.persistentConfig.pageSize = pageLength;
    this.yasr.storePluginConfig("table", this.persistentConfig);
  }


  handleSetCompactToggle = (event) => {
    // Store in persistentConfig
    this.persistentConfig.compact = event.target.checked;
    // Update the table
    this.yasr.storePluginConfig("table", this.persistentConfig);
    this.draw(this.persistentConfig);
  };


  /**
   * Draws controls on each update
   */
  drawControls() {
    // Remove old header
    this.removeControls();
    this.tableControls = document.createElement("div");
    this.tableControls.className = "tableControls";

    // Compact switch
    const toggleWrapper = document.createElement("div");
    const switchComponent = document.createElement("label");
    const textComponent = document.createElement("span");
    textComponent.innerText = "Compact";
    textComponent.classList.add("label");
    switchComponent.appendChild(textComponent);
    switchComponent.classList.add("switch");
    toggleWrapper.appendChild(switchComponent);
    this.tableCompactSwitch = document.createElement("input");
    switchComponent.addEventListener("change", this.handleSetCompactToggle);
    this.tableCompactSwitch.type = "checkbox";
    switchComponent.appendChild(this.tableCompactSwitch);
    this.tableCompactSwitch.defaultChecked = !!this.persistentConfig.compact;
    this.tableControls.appendChild(toggleWrapper);

    // Create table filter
    this.tableFilterField = document.createElement("input");
    this.tableFilterField.className = "tableFilter";
    this.tableFilterField.placeholder = "Filter query results";
    this.tableControls.appendChild(this.tableFilterField);
    this.tableFilterField.addEventListener("keyup", this.handleTableSearch);

    // Create page wrapper
    const pageSizerWrapper = document.createElement("div");
    pageSizerWrapper.className = "pageSizeWrapper";

    // Create label for page size element
    const pageSizerLabel = document.createElement("span");
    pageSizerLabel.textContent = "Page size: ";
    pageSizerLabel.className = "pageSizerLabel";
    pageSizerWrapper.appendChild(pageSizerLabel);

    // Create page size element
    this.tableSizeField = document.createElement("select");
    this.tableSizeField.className = "tableSizer";

    // Create options for page sizer
    const options = [10, 50, 100, 1000, -1];

    for(const option of options) {
      const element = document.createElement("option");
      element.value = option + "";
      // -1 selects everything so we should call it All
      element.innerText = option > 0 ? option + "" : "All";
      // Set initial one as selected
      if(this.dataTable?.page.len() === option) element.selected = true;
      this.tableSizeField.appendChild(element);
    }

    pageSizerWrapper.appendChild(this.tableSizeField);
    this.tableSizeField.addEventListener("change", this.handleTableSizeSelect);
    this.tableControls.appendChild(pageSizerWrapper);
    this.yasr.pluginControls.appendChild(this.tableControls);
  }


  download(filename) {
    return {
      getData: () => this.yasr.results?.asCsv() || "",
      contentType: "text/csv",
      title: "Download result",
      filename: `${filename || "queryResults"}.csv`,
    };
  }


  canHandleResults() {
    return !!this.yasr.results && this.yasr.results.getVariables() && this.yasr.results.getVariables().length > 0;
  }


  removeControls() {
    // Unregister listeners and remove references to old fields
    this.tableFilterField?.removeEventListener("keyup", this.handleTableSearch);
    this.tableFilterField = undefined;
    this.tableSizeField?.removeEventListener("change", this.handleTableSizeSelect);
    this.tableSizeField = undefined;
    this.tableCompactSwitch?.removeEventListener("change", this.handleSetCompactToggle);
    this.tableCompactSwitch = undefined;

    // Empty controls
    while(this.tableControls?.firstChild)
        this.tableControls.firstChild.remove();

    this.tableControls?.remove();
  }


  enableResizer() {
    this.tableResizer?.reset({ disable: false });
  }


  destroy() {
    this.removeControls();
    this.tableResizer?.reset({ disable: true });
    this.tableResizer = undefined;
    this.dataTable?.off("column-sizing", () => this.enableResizer());
    this.dataTable?.destroy(true);
    this.dataTable = undefined;
    this.yasr.rootEl.classList.remove("isSinglePage");
  }


  initialize() {
    return new Promise((resolve, _reject) => {
      if(window.info)
        window.info.then(data => { this.prefixes = data.prefixes }).finally(() => resolve());
      else
        resolve();
    });
  }
}


export default TablePlus;
