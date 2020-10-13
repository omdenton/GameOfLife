import React from 'react';
import { Button, ButtonToolbar, Dropdown, DropdownButton, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import './index.css';

class Box extends React.Component {
  selectBox = () => {
    this.props.selectBox(this.props.row, this.props.col);
  };
  render() {
    return <div className={this.props.boxClass} id={this.props.id} onClick={this.selectBox} />;
  }
}

class Grid extends React.Component {
  render() {
    const width = this.props.cols * 14;

    var rowsArr = [];

    var boxClass = '';
    for (var i = 0; i < this.props.rows; i++) {
      for (var j = 0; j < this.props.cols; j++) {
        let boxId = i + '_' + j;

        boxClass = this.props.gridFull[i][j] ? 'box on' : 'box off';
        rowsArr.push(
          <Box boxClass={boxClass} key={boxId} boxId={boxId} row={i} col={j} selectBox={this.props.selectBox} />
        );
      }
    }

    return (
      <div className='grid' style={{ width: width }}>
        {rowsArr}
      </div>
    );
  }
}
class Buttons extends React.Component {
  handleSelect = (evt) => {
    this.props.gridSize(evt);
  };

  render() {
    return (
      <div className='center'>
        <ButtonToolbar>
          <Button variant='primary spaced' onClick={this.props.playButton}>
            Play
          </Button>
          <Button variant='primary spaced' onClick={this.props.pauseButton}>
            Pause
          </Button>
          <Button variant='primary spaced' onClick={this.props.clear}>
            Clear
          </Button>
          <Button variant='primary spaced' onClick={this.props.slow}>
            Slow
          </Button>
          <Button variant='primary spaced' onClick={this.props.fast}>
            Fast
          </Button>
          <Button variant='primary spaced' onClick={this.props.seed}>
            Seed
          </Button>
          <ToggleButtonGroup
            type='radio'
            id='generations'
            name='generations'
            defaultValue={1}
            onChange={this.handleGenerations}>
            <ToggleButton value={1}>Infinite Gen</ToggleButton>
            <ToggleButton value={2}>Single Gen</ToggleButton>
            <ToggleButton value={3}>Set Gen</ToggleButton>
          </ToggleButtonGroup>

          <DropdownButton title='Grid Size' id='size-menu' onSelect={this.handleSelect}>
            <Dropdown.Item eventKey='1'>20x20</Dropdown.Item>
            <Dropdown.Item eventKey='2'>30x30</Dropdown.Item>
            <Dropdown.Item eventKey='3'>50x50</Dropdown.Item>
          </DropdownButton>
        </ButtonToolbar>
      </div>
    );
  }
}

class Main extends React.Component {
  constructor() {
    super();
    this.speed = 10;
    this.rows = 30;
    this.cols = 30;

    this.state = {
      generation: 0,
      gridFull: Array(this.rows)
        .fill()
        .map(() => Array(this.cols).fill(false)),
    };
  }

  selectBox = (row, col) => {
    let gridCopy = arrrayClone(this.state.gridFull);
    gridCopy[row][col] = !gridCopy[row][col];
    this.setState({
      gridFull: gridCopy,
    });
  };

  seed = () => {
    let gridCopy = arrrayClone(this.state.gridFull);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (Math.floor(Math.random() * 4) === 1) {
          gridCopy[i][j] = true;
        }
      }
    }
    this.setState({
      gridFull: gridCopy,
    });
  };

  playButton = () => {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(this.play, this.speed);
  };

  pauseButton = () => {
    clearInterval(this.intervalId);
  };

  slow = () => {
    this.speed = 1000;
    this.playButton();
  };

  fast = () => {
    this.speed = 50;
    this.playButton();
  };

  clear = () => {
    var grid = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(false));
    this.setState({
      gridFull: grid,
      generation: 0,
    });
  };

  gridSize = (size) => {
    switch (size) {
      case '1':
        this.cols = 20;
        this.rows = 20;
        break;
      case '2':
        this.cols = 30;
        this.rows = 30;
        break;
      case '3':
        this.cols = 50;
        this.rows = 50;
        break;
      default:
        this.cols = 25;
        this.rows = 25;
    }
    this.clear();
  };

  nGenerations = (value) => {
    switch (value) {
      case 1:
        this.setState({ nGenerations: null });
        break;
      case 2:
      //stepper generation
      case 3:
        this.setState({ nGenerations: null });
      default:
        this.setState({ nGenerations: null });
        break;
    }
  };

  play = () => {
    //making intial grid clones
    let g = this.state.gridFull;
    let g2 = arrrayClone(this.state.gridFull);

    //updating cells
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        //checking neighbours
        let count = 0;
        if (i > 0) if (g[i - 1][j]) count++;
        if (i > 0 && j > 0) if (g[i - 1][j - 1]) count++;
        if (i > 0 && j < this.cols - 1) if (g[i - 1][j + 1]) count++;
        if (j < this.cols - 1) if (g[i][j + 1]) count++;
        if (j > 0) if (g[i][j - 1]) count++;
        if (i < this.rows - 1) if (g[i + 1][j]) count++;
        if (i < this.rows - 1 && j > 0) if (g[i + 1][j - 1]) count++;
        if (i < this.rows - 1 && j < this.cols - 1) if (g[i + 1][j + 1]) count++;

        //applying condition based on neigbours
        if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
        if (!g[i][j] && count === 3) g2[i][j] = true;
      }
    }
    this.setState({
      gridFull: g2,
      generation: this.state.generation + 1,
    });

    //Number of generations logic
    if (this.state.nGenerations < 0) {
      if (this.state.generation === this.state.nGenerations) {
        this.pauseButton();
      }
    }
  };

  componentDidMount() {
    this.seed();
    this.playButton();
  }
  render() {
    return (
      <div>
        <h1>The Game of Life </h1>
        <Buttons
          playButton={this.playButton}
          pauseButton={this.pauseButton}
          slow={this.slow}
          fast={this.fast}
          clear={this.clear}
          seed={this.seed}
          gridSize={this.gridSize}
        />

        <Grid gridFull={this.state.gridFull} rows={this.rows} cols={this.cols} selectBox={this.selectBox} />

        <h2>Generations: {this.state.generation}</h2>
      </div>
    );
  }
}

function arrrayClone(array) {
  return JSON.parse(JSON.stringify(array));
}

ReactDOM.render(<Main />, document.getElementById('root'));
