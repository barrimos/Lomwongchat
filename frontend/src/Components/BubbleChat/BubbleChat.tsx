import { useParams } from 'react-router-dom'
import { bubbleTypes } from '../../types'
import ContextMenu from './ContextMenu'
import { useEffect, useState } from 'react'
import { randomCharacter } from '../../utils/randomCharacter'


const BubbleChat = ({ bubble, setIsContextOpen, isContextOpen, setCurrIdContext, currIdContext, contextClick, copyMessage, replyMessage, reportMessage, setContextClick, scrollToReplyRef }: bubbleTypes): JSX.Element => {
  const { username } = useParams()
  const owner = bubble.username === sessionStorage.getItem('username') ? 'you' : 'other'
  const [idBubble, setIdBubble] = useState<string>('')

  const [axis, setAxis] = useState<number[]>([])

  const [longPressOpenContext, setLongPressOpenContext] = useState<NodeJS.Timeout | null>(null)

  const handleOpenContextMenu = (e: any) => {
    const target = e.currentTarget as HTMLDivElement
    const elemBoundingClientRect = target.getBoundingClientRect()

    if (isContextOpen && !target.classList.contains('contextMenu')) {
      removeContextMenu()
    }

    // const xAxis: number = e.clientX ?? e.touches[0].clientX ?? e.pageX ?? e.touches[0].pageX
    const yAxis: number = (e.clientY ?? e.touches[0].clientY ?? e.pageY ?? e.touches[0].pageY) - (window.innerWidth < 768 ? 40 : 0)
    const elemBoundingTop: number = elemBoundingClientRect.top - (window.innerWidth < 768 ? 40 : 0)
    if (elemBoundingTop < 0) return
    setAxis([elemBoundingTop, yAxis - elemBoundingTop <= 0 ? yAxis - elemBoundingTop + 20 : yAxis - elemBoundingTop + 22])

    const longPressTimeout = setTimeout(() => {
      if (setIsContextOpen) {
        setIsContextOpen(true)
      }
      if (setCurrIdContext) {
        setCurrIdContext(target.parentElement?.dataset.idBubble!)
      }
      setLongPressOpenContext(null) // Clear the state
    }, 500)

    setLongPressOpenContext(longPressTimeout) // Store the timeout ID in state
  }

  const handleCancelContextMenu = (e: any): void => {
    if (e.cancelable) {
      e.preventDefault();
    }
    if (longPressOpenContext) {
      clearTimeout(longPressOpenContext)
    }
    if (e.target.classList.contains('bubbleWrapper')) {
      removeContextMenu()
    }
  }

  const removeContextMenu = (): void => {
    document.querySelector(`.messageWrapper[data-id-bubble="${currIdContext}"] .contextMenuWrapper`)?.remove()
    if (setIsContextOpen) {
      setIsContextOpen(false)
    }
    if (setCurrIdContext) {
      setCurrIdContext('')
    }
  }

  const handleContextMenu = (event: any) => {
    // Prevent the browser's context menu from opening
    event.preventDefault()
  }

  useEffect(() => {
    if (contextClick) {
      removeContextMenu()
      setContextClick(false)
    }
  }, [contextClick])

  useEffect(() => {
    setIdBubble(randomCharacter(4))
  }, [])

  return (
    <div className={`bubbleWrapper ${owner}`} data-time={bubble.rawTime} onContextMenu={e => handleContextMenu(e)} onClick={handleCancelContextMenu} data-id-bubble={idBubble}>
      <pre className={`messageWrapper ${owner}`} data-id-bubble={idBubble} data-time={bubble.rawTime}>
        {
          isContextOpen && idBubble === currIdContext ?
            <ContextMenu
              axis={axis}
              message={bubble.message}
              rawTime={bubble.rawTime}
              idBubble={idBubble}
              username={bubble.username}
              setContextClick={setContextClick}
              copyMessage={copyMessage}
              replyMessage={replyMessage}
              reportMessage={reportMessage}
              replyIdBubble={bubble.reply?.idBubble}
              replyTo={bubble.reply?.username}
            />
            :
            <></>
        }
        <div className={`owner ${owner}`}>
          {bubble.username}
        </div>
        <div className={`message ${owner}`} onClick={handleCancelContextMenu} onMouseDown={handleOpenContextMenu} onMouseUp={handleCancelContextMenu}
          onTouchStart={handleOpenContextMenu} onTouchEnd={handleCancelContextMenu}>
          {
            bubble.reply ?
              <div className='replyBubble' data-reply-id-bubble={bubble.reply.idBubble} data-reply-to={bubble.reply.username} onClick={scrollToReplyRef} onTouchStart={scrollToReplyRef}>
                Reply to {bubble.reply.username}<br />
                {bubble.reply.message}
              </div>
              :
              <></>
          }
          {bubble.message}
        </div>
        <div className={`timestamp ${owner}`} data-time={bubble.rawTime}>
          {bubble.timestamp}
        </div>
      </pre>
    </div>
  )
}

export default BubbleChat