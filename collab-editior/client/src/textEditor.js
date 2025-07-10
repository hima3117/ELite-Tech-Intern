import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";



const SAVE_INTERVAL=3000
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ['clean']
];

const bindings = {
  tab: {
    key: 9,
    handler: function () {
      // Optional: custom tab behavior
    }
  },
  custom: {
    key: ['b', 'B'],
    shiftKey: true,
    handler: function (range, context) {
      // Optional: custom shift+B behavior
    }
  },
  list: {
    key: 'Backspace',
    format: ['list'],
    handler: function (range, context) {
      if (context.offset === 0) {
        this.quill.format('list', false, Quill.sources.USER);
      } else {
        return true;
      }
    }
  }
};

export default function TextEditor() {
  const{id: documentId}= useParams()
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  console.log(documentId)
useEffect(()=>{
if(!socket||!quill) return
const Interval= setInterval(()=>{
socket.emit("save-document",quill.getContents())
},SAVE_INTERVAL)
return()=>{
  clearInterval(Interval)
}
},[socket,quill])

  useEffect(()=>{
      if(!socket||!quill) return
  
  socket.once("load-document", document=>{
    quill.setContents(document)
    quill.enable()
  })
  socket.emit("get-document",documentId)
  },[socket,quill,documentId])

  // Connect to socket
  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);
    return () => s.disconnect();
  }, []);

  // Send changes
  useEffect(() => {
    if (!socket || !quill) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);
    return () => quill.off("text-change", handler);
  }, [socket, quill]);

  // Receive changes
  useEffect(() => {
    if (!socket || !quill) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler);
    return () => socket.off("receive-changes", handler);
  }, [socket, quill]);

  // Editor wrapper
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper === null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
        keyboard: { bindings }
      }
    });
    q.enable(false)
    q.setText("loading....")
    setQuill(q);
  }, []);

  return <div className="container" ref={wrapperRef}></div>;
}
