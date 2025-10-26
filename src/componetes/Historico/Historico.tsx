import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import './Historico.css'
import trash from '../../assets/trash.png'

export default function Historico() {
    const [msgs, setMsgs] = useState<{ role: string, content: string }[]>([])
    const [state, setState] = useState("")
    const [erro, setErro] = useState(false)


    useEffect(() => {
        let mounted = true
        const fetchThread = async () => {
            try {
                const res = await fetch('http://localhost:8000/')
                if (!res.ok) throw new Error("Error ao buscar thread")
                const data = await res.json()
                if (mounted) setMsgs(data.thread || [])
                setErro(false)
            } catch (err) {
                console.error("Erro no fetchThread: ", err)
                setErro(true)
            }
        }

        const fetchState = async () => {
            try {
                const res = await fetch('http://localhost:8000/state')
                if (!res.ok) throw new Error("Error ao buscar thread")
                const data = await res.json()
                if (mounted) setState(data.state || "")

            } catch (err) {
                console.error("Erro no fetchState: ", err)
            }
        }

        fetchThread();
        fetchState();

        const id = setInterval(() => {
            fetchThread();
            fetchState();
        }, 1000);

        return () => {
            mounted = false
            clearInterval(id)
        }
    }, [])

    const waiting = msgs.length > 0 && msgs[msgs.length - 1].role == 'user'

    if (erro) {
        return (
            <div className="bemVindo">
                <h1>Backend desconectado :(</h1>
            </div>
        )
    }

    const s1: string = "Qual o nome dos professores"
    const s2: string = "Cursos oferecidos pela instituição"
    const s3: string = "Funcionamento da biblioteca"

    return (
        <>
            <div className='trash'>
                <b><img onClick={() => fetch(`http://localhost:8000/trash`, { method: 'POST' })} src={trash} alt="trash" /></b>
            </div>
            <div className='espace'>
                <div className='historico'>
                    {msgs.length === 0 && (
                        <div className="bemVindo">
                            <h1>Em que posso ajudar? :)</h1>
                            <div className="sugestoes">
                                {[s1, s2, s3].map((s, i) =>
                                    <b key={i} onClick={() => fetch(`http://localhost:8000/send/${encodeURIComponent(s)}`, { method: 'POST' })} className='sugestao'>{s}</b>
                                )}
                            </div>
                        </div>
                    )}
                    {msgs.map((m, i) => (
                        <div key={i} className={m.role}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeSanitize]}
                            >
                                {m.content || ''}
                            </ReactMarkdown>
                        </div>
                    ))}
                    {waiting && (
                        <div className="digitando">{state}</div>
                    )}
                </div>
            </div>
        </>
    )
}