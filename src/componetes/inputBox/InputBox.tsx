import { useRef, useState } from 'react'
import sendIcon from '../../assets/send.png'
import './InputBox.css'

export default function InputBox() {

  const [text, setText] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = Math.min(textAreaRef.current.scrollHeight, window.innerHeight * 0.3) + 'px';
    }
  }

  const handleSend = async () => {
    if (!text.trim()) return
    setText('')

    const textFormated = encodeURIComponent(text)
    try {
      const res = await fetch(`http://localhost:8000/send/${textFormated}`, { method: 'POST' })
      const data = await res.json()
      console.log("DEU BOM: ", data)
    } catch (err) {
      console.log("DEU RUIM: ", err)
    }
  }

  return (
    <div className='input-box'>
      <textarea ref={textAreaRef} value={text} onChange={handleChange} name="prompt" id="prompt"></textarea>
      <button onClick={handleSend}><img src={sendIcon} alt="send icon" className={text.trim()? "send": "noSend"} /></button>
    </div>
  )
}