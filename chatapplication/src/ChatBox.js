import React from "react";
import './Chatbox.css';

function Message(props) {
  if (props.messageType === "user") {
    let usermessage = <div class="talk-bubble-user tri-right btm-right-in">
                        <div class="talktext">
                          <p>{props.message}</p>
                        </div>
                      </div>
    return usermessage
  } else {
    let botmessage = <div class="talk-bubble-bot tri-right btm-left-in">
                      <div class="talktext">
                        <p>{props.message}</p>
                      </div>
                    </div>
    return botmessage
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
    let chatbox = 
    <div id="chat_box" className="container">
      {this.msgComps}
    </div>
    return chatbox
  }
}

export default ChatBox;
