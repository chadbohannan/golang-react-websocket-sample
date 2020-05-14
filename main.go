package main

import (
	"container/list"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// ChatMessage is the only struct we need
type ChatMessage struct {
	Timestamp int64  `json:"timestamp"`
	Name      string `json:"name"`
	Message   string `json:"message"`
}

const (
	logLimit = 20
)

var (
	msgLog        = list.New()
	clientSet     = map[*websocket.Conn]bool{}
	clientSetLock = sync.Mutex{}
	bcastChatChan = make(chan *ChatMessage)
	httpSrv       = &http.Server{Addr: ":8080"}
)

func msNow() int64 {
	return time.Now().UnixNano() / int64(time.Millisecond)
}

func bcastRoutine() {
	for msg := range bcastChatChan {
		clientSetLock.Lock()
		for client := range clientSet {
			client.WriteJSON(msg)
		}
		clientSetLock.Unlock()

		// cache the message for dumps to new clients
		msgLog.PushBack(msg)
		if msgLog.Len() > logLimit {
			msgLog.Remove(msgLog.First())
		}
	}
}

func socketHandler(w http.ResponseWriter, r *http.Request) {
	var upgrader = websocket.Upgrader{
		ReadBufferSize:  4096,
		WriteBufferSize: 4096,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	for e := msgLog.First(); e != nil; e = e.Next() {
		conn.WriteJSON(e.Value) // dump the chat log to new client
	}

	// add client to broadcast pool
	clientSetLock.Lock()
	clientSet[conn] = true
	clientSetLock.Unlock()

	for { // ever and ever
		msg := &ChatMessage{}
		if err := conn.ReadJSON(msg); err == nil {
			if msg.Timestamp == 0 {
				msg.Timestamp = msNow()
			}
			if len(msg.Name) == 0 {
				msg.Name = conn.RemoteAddr().String()
			}
			bcastChatChan <- msg // queue them message for broadcast
		} else {
			log.Printf("client read err: %s\nclosing socket", err.Error(), conn.RemoteAddr().String())
			break // jk; not forever
		}
	}

	// remove client from broadcast pool
	clientSetLock.Lock()
	delete(clientSet, conn)
	clientSetLock.Unlock()
}

func main() {
	go bcastRoutine()
	http.HandleFunc("/chat", socketHandler)
	http.Handle("/", http.FileServer(http.Dir("./react-app/build")))

	log.Printf("chat service is listening\n")
	if err := httpSrv.ListenAndServe(); err != nil {
		log.Fatal("ListenAndServe: ", err.Error())
	}
	log.Printf("chat service exiting\n")
}
