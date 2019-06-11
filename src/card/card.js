import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { getBounds } from './positionHelpers';
import '../card/card.css';
import { COLOURS } from './enums/config';

class Card extends Component {
  constructor(props) {
    super(props);

    this.axisFixedBounds = {
      top: -500,
      right: 500
    };

    this.originalPosition = {
      x: this.props.x,
      y: this.props.y
    };

    this.state = {
      position: {
        x: 0,
        y: 0
      },
      colour: ""
    };
    
    this.colour= this.state.colour;

    this.cardRef = React.createRef();
  }

  componentDidMount() {
    this.props.firebase
      .database()
      .ref(`power-map-${this.props.powerMapID}/cards/`)
      .on('child_changed', (snapshot, prevSnapshot) => {
        const card = snapshot.val();
        if (card['card_id'] !== this.props.id) return;

        this.originalPosition = {
          x: card['card_x_pos'],
          y: card['card_y_pos']
        };
        
        this.updateScaledPosition();
      });

    this.props.firebase
      .database()
      .ref(`power-map-${this.props.powerMapID}/cards/${this.props.id}`)
      .on('value', snapshot =>{
        this.colour = snapshot.val()['card_colour'] !== undefined ? snapshot.val()['card_colour'] : "";
        this.setState({
          colour: this.colour
        })
      })

    this.updateScaledPosition();

    window.addEventListener("resize", this.updateScaledPosition);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateScaledPosition);
  }

  deleteCard = () => {
    this.props.firebase
      .database()
      .ref(`power-map-${this.props.powerMapID}/cards/${this.props.id}`)
      .remove();
  };

  updatePosition = (e, ui) => {
    const { x, y } = this.state.position;
    this.setState({
      position: {
        x: x + ui.deltaX,
        y: y + ui.deltaY
      }
    });
  };

  updateScaledPosition = () => {
    const axisScale = this.getAxisScale();
    this.setState({
      position: {
        x: this.originalPosition.x * axisScale.x,
        y: this.originalPosition.y * axisScale.y
      }
    });
  };

  saveCardStateToDB = () => {
    const axisScale = this.getAxisScale();
    this.props.firebase
      .database()
      .ref(`power-map-${this.props.powerMapID}/cards/${this.props.id}`)
      .set({
        card_id: this.props.id,
        card_name: this.props.name,
        card_x_pos: this.state.position.x / axisScale.x,
        card_y_pos: this.state.position.y / axisScale.y,
        card_colour: this.state.colour
      });
  };

  getAxisScale = () => {
    const bounds = this.getAxisBounds();
    return {
      x: bounds.right / this.axisFixedBounds.right,
      y: bounds.top / this.axisFixedBounds.top
    };
  };
  
  changeCardColour = () => {
    let colour;
    const currentColour = this.state.colour;
    const availableColours = Object.values(COLOURS);
    
    const currentIndexColour = availableColours.find((element)=>currentColour === element) !== undefined ? 
      availableColours.findIndex((element)=>currentColour === element): 0;
    
    
    if(parseInt(currentIndexColour) <= availableColours.length){
      const newColour = currentIndexColour + 1 ;
      if(newColour >= availableColours.length){
        colour = availableColours[0]
      } else {
        colour = availableColours[newColour]
      }
    } else {
      colour = availableColours[0]
    }
    this.setState({
      colour
    })
  };

  getAxisBounds = () => getBounds(this.cardRef.current);

  render() {
    return (
      <Draggable
        bounds='parent'
        position={{ x: this.state.position.x, y: this.state.position.y }}
        onDrag={this.updatePosition}
        onStop={this.saveCardStateToDB}
      >
        <div ref={this.cardRef} className={'figure-card'} style={{backgroundColor: this.colour}}>
          <h3>{this.props.name}</h3>
          <button className={'delete-icon'} onClick={() => this.deleteCard()}>
            x
          </button>
          <button className={'change-colour-icon'} onClick={() => {
            this.changeCardColour();
            this.saveCardStateToDB();
          }}>
            <i className="fa fa-paint-brush"></i>
          </button>
        </div>
      </Draggable>
    );
  }
}

export default Card;
