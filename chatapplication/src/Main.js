import React from "react";
import ChatBox from "./ChatBox";
import MessageForm from "./MessageForm";

class Main extends React.Component {

  hostname = "http://127.0.0.1:8000/"

  constructor(props) {
    super(props)
    this.greet_message = [
      ["server","Hi there!"],
      ["server", "Are you a new user?"],
      ["server", "Send 'Yes' or 'No' as a reply"]
    ]
    this.state = {
      "authorised": false,
      "logging_in": false,
      "new_user": true,
      "registering": false,
      "firstname": "",
      "lastname": "",
      "register_name_provided": false,
      "providing_options": false,
      "add_new_creds": false,
      "get_creds_website_provided": false,
      "fetch_creds_website": false,
      "username": "",
      "password": "",
      "messages": this.greet_message
    }
    this.newMessageFromUser = this.newMessageFromUser.bind(this)
    this.logIn = this.logIn.bind(this)
    this.register = this.register.bind(this)
  }

  validatePassword(password){
    var MinLength = 6;
    var MaxLength = 15;
    
    var meetsLengthRequirements = password.length >= MinLength && password.length <= MaxLength;
    var hasUpperCasevarter = false;
    var hasLowerCasevarter = false;
    var hasDecimalDigit = false;
    
    if (meetsLengthRequirements)
    {
      for (var i = 0, len = password.length; i < len; i++) {
        var char = password.charAt(i);
        if (!isNaN( +char * 1)){
          hasDecimalDigit = true;
        }
        else{
          if (char === char.toUpperCase()) {
            hasUpperCasevarter = true;
          }
          if (char === char.toLowerCase()){
            hasLowerCasevarter = true;
          }
        }
      }
    }
    
    var isValid = meetsLengthRequirements
                && hasUpperCasevarter
                && hasLowerCasevarter
                && hasDecimalDigit;
    return isValid;
  }

  async logIn() {
    console.log("logIn called")
    this.creds = this.state.messages.slice(-1)[0][1]
    console.log(this.creds)
    try {
      let credsArr = this.creds.split(" ");
      console.log(credsArr)
      const response = await fetch(this.hostname+'verifyuser/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              username: credsArr[0],
              password: credsArr[1]
            })
        });
      const data = await response.json();
      console.log(data);
      if (data["status_code"] === "success") {
        this.setState({"authorised": true})
        this.state.messages.push(["server", "Welcome "+data["firstname"]])
        this.state.messages.push(["server", "How would you like me to help you?"])
        this.state.messages.push(["server", "1. Add a new password 2. Get credentials. 3. Get all credentials for a website"])
        this.state.messages.push(["server", "Send number from 1 to 3 accordingly"])
        this.state.messages.push(["server", "You can send 'menu' anytime you want to come back to main menu"])
        this.setState({"providing_options": true})
        this.setState({"authorised": true})
        this.setState({"username": credsArr[0]})
        this.setState({"password": credsArr[1]})
      } else {
        this.setState({"authorised": false})
        this.state.messages.push(["server", "Invalid credentials. Please provide correct credentials."])
      }
    } catch(err) {
      this.setState({"authorised": false})
      this.state.messages.push(["server", "Ohh no! Seems like an error has occurred on the server"])
      console.log(err)
      alert(err)
    }
    this.forceUpdate()
  }

  async register() {
    console.log("register called")
    this.creds = this.state.messages.slice(-1)[0][1]
    console.log(this.creds)
    try {
      let credsArr = this.creds.split(" ");
      console.log(credsArr)
      let validpass = this.validatePassword(credsArr[1])
      if (validpass) {
        const response = await fetch(this.hostname+'register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstname: this.state.firstname,
                lastname: this.state.lastname,
                username: credsArr[0],
                password: credsArr[1]
              })
          });
        const data = await response.json();
        console.log(data);
        if (data["status_code"] === "success") {
          this.setState({"authorised": true})
          this.state.messages.push(["server", "Welcome "+this.state.firstname+"! You are registered successfully"])
          this.state.messages.push(["server", "How would you like me to help you?"])
          this.state.messages.push(["server", "1. Add a new password 2. Get credentials. 3. Get all credentials for a website"])
          this.state.messages.push(["server", "Send number from 1 to 3 accordingly"])
          this.state.messages.push(["server", "You can send 'menu' anytime you want to come back to main menu"])
          this.setState({"providing_options": true})
          this.setState({"authorised": true})
          this.setState({"username": credsArr[0]})
          this.setState({"password": credsArr[1]})
        } else if(data["status_code"] === "username_taken") {
          this.setState({"authorised": false})
          this.state.messages.push(["server", "This username is already taken"])
        } else {
          this.setState({"authorised": false})
          this.state.messages.push(["server", "Sorry. We were not able to register you for some reason."])
        }
      } else {
        this.setState({"authorised": false})
        this.state.messages.push(["server", "Sorry. We cannot accept the password you provided. Your password must be of length 6 to 15, have caps, alphabets and numbers"])
      }
      this.forceUpdate()
    } catch(err) {
      this.setState({"authorised": false})
      this.state.messages.push(["server", "Ohh no! Seems like an error has occurred on the server"])
      this.forceUpdate()
      console.log(err)
    }
  }

  async handleNewPassword() {
    console.log("handleNewPassword called")
    if (this.state.options_provided === true) {
      let creds = this.state.messages.slice(-1)[0][1]
      console.log(creds)
      let credsArr = creds.split(" ");
      console.log(credsArr)
      if (credsArr.length < 3) {
        this.state.messages.push(["server", "Seems like you have not provided credentials in the correct format"])
      } else {
        try {
          const response = await fetch(this.hostname+'newcreds/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  username: this.state.username,
                  password: this.state.password,
                  for_website: credsArr[0],
                  website_username: credsArr[1],
                  website_password: credsArr[2]
                })
            });
            const data = await response.json();
            console.log(data);
            if (data["status_code"] === "success") {
              this.state.messages.push(["server", "Credentials added successfully"])
            } else if (data["status_code"] === "duplicate_creds") {
              this.state.messages.push(["server", "You have already provided this username and website combination"])
            } else {
              this.state.messages.push(["server", "Sorry. We are not able to save your password for some reason."])
            }
        } catch(err) {
          this.state.messages.push(["server", "Ohh no! Seems like an error has occurred on the server"])
          console.log(err)
        } 
      }
      
    }
    this.forceUpdate()
  }

  async handleFetchCreds() {
    console.log("handleFetchCreds called")
    let creds = this.state.messages.slice(-1)[0][1]
    console.log(creds)
    let credsArr = creds.split(" ");
    console.log(credsArr)
    if (credsArr.length < 2) {
      this.state.messages.push(["server", "Seems like you have not provided credentials in the correct format"])
    } else {
      try {
        const response = await fetch(this.hostname+'getcreds/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                  username: this.state.username,
                  password: this.state.password,
                  for_website: credsArr[0],
                  website_username: credsArr[1]
            })
            });
          const data = await response.json();
          console.log(data);
          if (data["status_code"] === "success") {
            this.state.messages.push(["server", "Password: "+data["password"]])
          } else {
            this.state.messages.push(["server", "Sorry. We are not able to fetch your password for some reason."])
          }
        } catch(err) {
          this.state.messages.push(["server", "Ohh no! Seems like an error has occurred on the server"])
          console.log(err)
        } 
    }
    this.forceUpdate()
  }

  handleServices(rawMessage) {
    console.log("handleServices called")
    const existingMessages = this.state.messages
    if (this.state.providing_options === true) {
      if (rawMessage !== "1" && rawMessage !== "2" && rawMessage !== "3") {
        const existingMessages = this.state.messages
        existingMessages.push(["server", "Please provide a correct option"])
      } else {
        const existingMessages = this.state.messages
        if (rawMessage === "1") {
          this.setState({"add_new_creds": true})
          existingMessages.push(["server", "Please provide credentials in the following format"])
          existingMessages.push(["server", "<website name> <username> <password>"])
        } else if (rawMessage === "2")  {
          this.setState({"fetch_creds": true})
          existingMessages.push(["server", "Please provide credentials in the following format"])
          existingMessages.push(["server", "<website name> <website username>"])
        } else {
          this.setState({"fetch_creds_website": true})
          existingMessages.push(["server", "Please provide the website for which you want the credentials"])
        }
        this.setState({"options_provided": true})
      }
    }
    this.setState({
      "messages": existingMessages
    })
  }

  async getCredsWebsite() {
    console.log("getCredsWebsite called")
    let website = this.state.messages.slice(-1)[0][1]
    console.log(website)
    console.log(this.state.username)
    console.log(this.state.password)
    try {
      const response = await fetch(this.hostname+'getwebsitecreds/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          },
          body: JSON.stringify({
                username: this.state.username,
                password: this.state.password,
                for_website: website
            })
          });
        const data = await response.json();
        console.log(data);
        if (data["status_code"] === "success") {
          this.state.messages.push(["server", "Credentials for "+website])
          for (let i=0; i<data["credentials"].length; i++) {
            this.state.messages.push(["server", "Username: "+data["credentials"][i]["website_username"]+" Password: "+data["credentials"][i]["password"]])
          }
        } else {
          this.state.messages.push(["server", "Sorry. We are not able to fetch your password for some reason."])
        }
      } catch(err) {
        this.state.messages.push(["server", "Ohh no! Seems like an error has occurred on the server"])
        console.log(err)
      } 
    this.forceUpdate()
  }

  resetStateValues() {
    console.log("resetStateValues called")
    this.setState({
      "authorised": true,
      "providing_options": true,
      "add_new_creds": false,
      "get_creds_website_provided": false,
      "fetch_creds": false,
      "fetch_creds_website": false,
      "options_provided": false
    })
    this.state.messages.push(["server", "1. Add a new password 2. Get credentials. 3. Get all credentials for a website"])
    this.state.messages.push(["server", "Send number from 1 to 3 accordingly"])
    this.state.messages.push(["server", "You can send 'menu' anytime you want to come back to main menu"])
    this.forceUpdate()
  }

  newMessageFromUser(rawMessage) {
    const existingMessages = this.state.messages
    existingMessages.push(["user", rawMessage])
    if (rawMessage === "menu" || rawMessage === "Menu") {
      this.resetStateValues()
      return
    }
    if (this.state.authorised === true) {
      if (this.state.options_provided === true) {
        if (this.state.add_new_creds === true) {
          this.handleNewPassword()
        }
        if (this.state.fetch_creds) {
          this.handleFetchCreds()
        }
        if (this.state.fetch_creds_website) {
          this.getCredsWebsite()
        }
      } else {
        this.handleServices(rawMessage)
      }
    } else {
      if (this.state.logging_in && !this.state.new_user) {
        this.logIn()
      }
  
      if (this.state.new_user && this.state.logging_in) {
        if (this.state.registering === false) {
          if (this.state.register_name_provided === false) {
            let name = this.state.messages.slice(-1)[0][1]
            let nameArr = name.split(" ");
            console.log(nameArr)
            if (nameArr.length < 2) {
              existingMessages.push(["server", "Seems like you have not provided your name correctly."])
            } else {
              this.setState({
                "firstname": nameArr[0],
                "lastname": nameArr[1]
              })
              this.setState({"register_name_provided": true})
              existingMessages.push(["server", "Send us a username and a strong password you would like to keep (space separated)"])
              this.setState({"registering": true})
            }
          } 
        } else {
          this.register()
        }
      }
  
      if (this.state.logging_in === false && this.state.new_user === true) {
        if (rawMessage === "No" || rawMessage === "no") {
          this.setState({
            "logging_in": true,
            "new_user": false
          })
          existingMessages.push(["server", "Please provide your username and password (space separated)"])
        } else if (rawMessage === "Yes" || rawMessage === "yes") {
          this.setState({
            "new_user": true,
            "logging_in": true
          })
          existingMessages.push(["server", "Enter your first name and last name (space separated)"])
        } else {
          this.setState({"new_user": true})
          existingMessages.push(["server", "Please send a valid response"])
        }
      }
    }

    this.setState({
      "messages": existingMessages
    })
    
  }

  componentDidUpdate() {
    const objDiv = document.getElementById('chat_box');
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  render() {
    return <div>
      <ChatBox messages={this.state.messages}/>
      <MessageForm newMessageCallback={this.newMessageFromUser}  />
    </div>
  }
}

export default Main;
