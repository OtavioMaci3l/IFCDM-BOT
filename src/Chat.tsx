import './Chat.css'
import Historico from './componetes/Historico/Historico'
import InputBox from './componetes/inputBox/InputBox'

export default function Chat() {

  return (
    <>
      <h1 className='tittle'>IF RoBot</h1>
      <Historico />
      <InputBox />
      <p className='makeby'>Make by Otávio Augusto</p>
    </>
  )
}