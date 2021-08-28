import React from "react";

function Message(props) {
  if (props.messageType === "user") {
    return <div>{props.message}</div>
  } else {
    return <div>{props.message}</div>
  }
}

class ChatBox extends React.Component {

  render() {
    if (this.props.messages) {
      this.msgComps = []
      this.msgs = this.props.messages
      if (this.msgs) {
        for(var i=0; i<this.msgs.length; i++) {
          this.msgComps.push(<Message 
            key={i+1} 
            messageType={this.msgs[i][0]}
            message = {this.msgs[i][1]}
            />)
        }
      }
    }

    //based on last message process it, make an api call and add the response in the end

    return this.msgComps
  }
}

export default ChatBox;
