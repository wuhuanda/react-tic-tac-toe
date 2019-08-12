import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className="square" style={props.winnerStyle} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winnerStyle = this.props.winnerIndexs.includes(i)
      ? {color: '#f00'}
      : {}
    return (
      <Square
        value={this.props.squares[i]}
        key={i}
        winnerStyle={winnerStyle}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const boards = [0, 1, 2].map(v => {
      const index = v * 3 + 1
      return(
        <div className="board-row" key={v}>
          {
            [index - 1, index, index + 1].map(j => {
              return(
                this.renderSquare(j)
              );
            })
          }
        </div>
      );
    })
    return (
      <div>
        {boards}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        position: -1,
        squares: Array(9).fill(null),
      }],
      recordList: [{
        position: -1,
        squares: Array(9).fill(null),
        stepNumber: 0,
      }],
      stepNumber: 0,
      xIsNext: true,
      isRecordAsc: true,
      winnerIndexs: [],
      isDraw: false,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const recordList = this.state.recordList.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const squares = current.squares.slice();

    if (squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    const winnerObj = calculateWinner(squares);
    if (winnerObj) {
      if (this.state.winnerIndexs.length !== 0) {
        return;
      }
      this.setState({
        winnerIndexs: winnerObj.winnerIndexs
      })
    }

    this.setState({
      history: history.concat([{
        position: i,
        squares,
      }]),
      recordList: recordList.concat([{
        position: i,
        squares,
        stepNumber: history.length,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });

    if(this.state.winnerIndexs.length === 0 && squares.every(e => e !== null)) {
      this.setState({
        isDraw: true,
      });
    }
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      winnerIndexs: [],
    });
  }

  toggleSortby() {
    const isRecordAsc = !this.state.isRecordAsc
    const recordList = this.state.recordList.slice(0)

    recordList.sort((a, b) => {
      return isRecordAsc
        ? a.stepNumber - b.stepNumber
        : b.stepNumber - a.stepNumber
    })

    this.setState({
      isRecordAsc,
      recordList,
    });
  }

  render() {
    const history = this.state.history;
    const recordList = this.state.recordList;
    const current = history[this.state.stepNumber];
    const winnerObj = calculateWinner(current.squares);
    const isRecordAsc = this.state.isRecordAsc;
    const winnerIndexs = this.state.winnerIndexs;
    const isDraw = this.state.isDraw;

    const moves = recordList.map((step) => {
      const desc = step.stepNumber
        ? `Go to move #${step.stepNumber}`
        : 'Go to game start';
      const coordinate = step.stepNumber
        ? `Col: ${(step.position + 4) % 3 || 3}, Row: ${Math.floor((step.position + 3) / 3) || 1}`
        : '';
      const activeClass = this.state.stepNumber === step.stepNumber
        ? 'list-active'
        : '';
      return (
        <li className={activeClass} key={step.stepNumber}>
          <span>{step.stepNumber}. </span>
          <button onClick={() => this.jumpTo(step.stepNumber)}>
            {desc}
          </button>
          <span style={{ paddingLeft: '10px' }}>{coordinate}</span>
        </li>
      );
    });

    let status;
    if (winnerObj) {
      status = `Winner: ${winnerObj.winner}`
    } else if (isDraw) {
      status = 'Draw!'
    } else {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} winnerIndexs={winnerIndexs} onClick={i => this.handleClick(i)} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.toggleSortby()}>
            {isRecordAsc ? 'ASC' : 'DESC'}
          </button>
          <ul>{moves}</ul>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winnerIndexs: [a, b, c],
      };
    }
  }
  return null;
}
