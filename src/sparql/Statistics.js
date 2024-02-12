import React from "react";


class Statistics extends React.Component {

  constructor(props) {
    super(props);

    this.url = props.url;
    this.state = {
      error: null,
      isLoaded: false,
      datasets: []
    };
  }


  componentDidMount() {
    fetch(this.url)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            datasets: result.datasets
          });
        })
      .catch(
        (error) => {
          this.setState({
            isLoaded: true,
            error: error
          })
        })
  }


  render() {
    if(this.state.error)
      return <div>Error: {this.state.error.message}</div>;

    if(!this.state.isLoaded)
      return <div>Loading...</div>;

    return (
      <ul>
        { this.state.datasets.map(dataset => (
          <li key={dataset.name}>
            <strong>{dataset.name}</strong> version {dataset.version}
            <br/>
            <span className="text-muted">
              { dataset.size.toLocaleString() }
              { ' compounds, checked on ' }
              { new Date(dataset.checked).toLocaleString([], {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute:'2-digit'
                })
              }
            </span>
          </li>
        ))}
      </ul>
    );
  }
}


export default Statistics;
