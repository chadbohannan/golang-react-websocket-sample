import React from 'react';
import FullHeight from "react-full-height";
import './ChatPage.css';

class ChatPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            name: "",
            msg:"",
            rowHistory: [
                {
                    timestamp: 1,
                    name: "person one really long name",
                    message: "test message one"
                },
                {
                    timestamp: 2,
                    name: "p two",
                    message: "test message two"
                },
            ]
        };
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
    
    componentDidMount() {
        this.scrollToBottom();
    }

    sendMessage = () => {
        let msgHist = this.state.rowHistory;
        msgHist.push({
            name:this.state.name || '<anon>',
            message:this.state.msg || '<empty>',
            timestamp: Date.now()});
        this.setState({ msg: "" });

        this.setState({rowHistory:msgHist});
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

    render() {
        return (
            <FullHeight className="section">
                <header>
                    EarnUp Challenge Chat
                </header>
                <div>
                    {this.state.rowHistory.map((msg) => {return (
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
                    <button style={{borderRadius:5, padding:10, fontSize:"1.2em"}} onClick={this.sendMessage}>Send</button>
                </footer>
            </FullHeight>
        );  
    }
}

export default ChatPage;
