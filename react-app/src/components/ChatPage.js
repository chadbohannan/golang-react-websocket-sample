import React from 'react';
import FullHeight from "react-full-height";
import './ChatPage.css';

class ChatPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            name: "",
            msg:"",
            connected: false,
            rowHistory: []
        };
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
    
    componentDidMount() {
        let loc = window.location;
        if (loc.port) { // dev mode (local)
            this.connect("ws://" + loc.hostname + ":" + loc.port + "/chat")
          } else { // production
            this.connect("wss://" + loc.hostname + "/chat")
          }
    }

    sendMessage = () => {
        let msg = {
            name:this.state.name,
            message:this.state.msg,
            timestamp: Date.now()};
        debugger
        this.ws.send(JSON.stringify(msg));
        this.setState({ msg: "" });
        this.scrollToBottom();
    }

    onNameChanged = (event) => {
        this.setState({
            name: event.target.value
        });
    }

    onMessageChanged = (event) => {
        this.setState({
            msg: event.target.value
        });
    }

    _handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.sendMessage();
        }
      }

    ws = null;
    connect = (url) => {
        console.log("Connecting: " + url);
        this.ws = new WebSocket(url);
        this.ws.onmessage = (event) => {
            console.log(event);

            let msg = JSON.parse(event.data)
            let msgHist = this.state.rowHistory;
            this.setState({rowHistory:msgHist.concat(msg)});
            this.scrollToBottom();
        };
        this.ws.onerror = (event) => {
            console.log(event);
        };
        this.ws.onopen = (even) => {
            this.setState({connected: true});
        };
        this.ws.onclose = (event) => {
            console.log(event);
        };
        return this.ws.close.bind(this.ws);
    }


    render() {
        return (
            <FullHeight>
                <header>
                    EarnUp Challenge Chat
                </header>
                <div>
                    {this.state.rowHistory.map((msg) => {
                        debugger
                        return (                        
                        <div className="row" key={msg.timestamp}>
                            <span className="name-field">{msg.name}</span>
                            <span className="message-field">{msg.message}</span>
                        </div>
                    )})}
                    <div ref={(el) => { this.messagesEnd = el; }}/>
                </div>
                <footer style={{display:"flex"}}>
                    <input id="name-input"
                        type="text"
                        style={{maxWidth:"30%"}}
                        placeholder="user name"
                        value={this.state.name}
                        onChange={this.onNameChanged}
                    />
                    <input id="message-input"
                        type="text"
                        placeholder="message"
                        value={this.state.msg}
                        onKeyDown={this._handleKeyDown}
                        onChange={this.onMessageChanged}
                        style={{flex:1, minWidth:"30%"}}
                    />
                    <button
                        onClick={this.sendMessage}
                        disabled={!this.state.connected}>
                        Send
                    </button>
                </footer>
            </FullHeight>
        );  
    }
}

export default ChatPage;
