#!/usr/bin/env python
from flask import Flask, send_from_directory
from flask_sockets import Sockets
from threading import Lock

app = Flask(__name__, 
    static_folder='react-app/build/static',
    static_url_path='/static')

# WebSocket library
sockets = Sockets(app)

# threadsafe routines for set of connected clients
conn_set = set()
conn_set_lock = Lock()
def add_connection(conn):
    with conn_set_lock:
        conn_set.add(conn)
    
def remove_connection(conn):
    with conn_set_lock:
        conn_set.remove(conn)

def connection_set():
    with conn_set_lock:
        return conn_set.copy()


# WebSocket handler
@sockets.route('/chat')
def echo_socket(ws):
    add_connection(ws)
    while not ws.closed:
        message = ws.receive()        # wait for a message from a client       
        for conn in connection_set(): # broadcast message to all connected clients
            try:
                conn.send(message)
            except Exception as e:
                print(e)
    remove_connection(ws)


# HTML handler
@app.route('/')
def index():
    return send_from_directory('react-app/build', 'index.html')


if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    server = pywsgi.WSGIServer(('', 8080), app, handler_class=WebSocketHandler)
    server.serve_forever()
