import React, { Component } from 'react';
// components
import TargetBoxWrapper from './TargetBoxWrapper';

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = { droppedWordCards: [] };
  }

  handleDrop(item) {
    let droppedWordCards = Array.from(this.state.droppedWordCards);
    droppedWordCards.push(item);
    this.setState({
      droppedWordCards
    });
  }

  render() {
    return (
      <div style={{ padding: '5px 10px', backgroundColor: '#DCDCDC', margin: '0px 10px 10px 0px', height: '100px' }}>
        <TargetBoxWrapper
          {...this.props}
          droppedWordCards={this.state.droppedWordCards}
          onDrop={item => this.handleDrop(item)}
        />
      </div>
    );
  }
}