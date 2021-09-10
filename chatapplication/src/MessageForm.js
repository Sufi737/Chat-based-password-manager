import React from "react";
import './MessageForm.css';

class MessageForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            "input_message": "",
            "text_input": ""
        }
        this.newMessage = this.newMessage.bind(this)
    }
    
    handleChange = (event) => {
        this.setState({
            "input_message": event.target.value
        })

    }

    newMessage() {
        let userMessage = this.state.input_message
        this.props.newMessageCallback(userMessage)
        this.setState({"input_message": ""});
    }

    render() {
        let element = <div className="message-container">
                <input className="chat-input" type="text" rows='1' value={this.state.input_message} onChange={this.handleChange} />
                <button className="send-btn" onClick={this.newMessage}>Send</button>
            </div>
        return element
    }
}

export default MessageForm;
