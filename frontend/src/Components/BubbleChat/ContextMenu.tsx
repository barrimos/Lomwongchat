import { Dispatch, SetStateAction } from "react"
import ContextItem from "./ContextItem"

interface Props {
  axis: number[]
  message: string
  username: string | undefined
  idBubble: string
  rawTime: string
  setContextClick: Dispatch<SetStateAction<boolean>>
  copyMessage: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, message: string) => void
  replyMessage: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, message: string) => void
  reportMessage: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, message: string, ...replies: string[]) => void
  replyIdBubble: string | undefined
  replyTo: string | undefined
}

const ContextMenu = ({ axis, message, username, idBubble, rawTime, setContextClick, copyMessage, replyMessage, reportMessage, replyIdBubble, replyTo }: Props): JSX.Element => {

  const handleMenuContext = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>): void => {
    const contextName: string | undefined = (e.target as HTMLDivElement).dataset.menuContext
    if (contextName) {
      setContextClick(true)
    }

    if (contextName === 'copy') {
      copyMessage(e, message)
    } else if (contextName === 'reply') {
      replyMessage(e, message)
    } else if (contextName === 'report') {
      reportMessage(e, message, replyIdBubble!, replyTo!)
    }
  }

  return (
    <div id='contextMenuWrapper'
      style={{ 'top': `${axis[0] < 10 ? (axis[1] - (axis[1] > 38 ? 20 : 0)) + 'px' : 20 + 'px'}` }}
      data-time={rawTime}
    >
      {
        ['copy', 'reply', 'report'].map((name: string, i: number) => {
          return (
            <ContextItem key={i} username={username!} idBubble={idBubble} contextName={name} handleMenuContext={handleMenuContext} />
          )
        })
      }
    </div>
  )
}

export default ContextMenu
