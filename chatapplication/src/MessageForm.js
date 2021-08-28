import React from "react";

class MessageForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            "input_message": ""
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
    }

    render() {
        let element = <div>
                <textarea rows='1' onChange={this.handleChange}></textarea>
                <button onClick={this.newMessage}>Send</button>
            </div>
        return element
    }
}

export default MessageForm;
