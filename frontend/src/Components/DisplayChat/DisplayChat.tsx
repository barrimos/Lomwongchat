import BubbleChat from '../BubbleChat/BubbleChat'
import { bubbleTypes, bubbleTypesPM, reportBubbleTypes } from '../../types'
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react'
import Modal from '../Modal/Modal'
import Form from '../Form/Form'
import TextArea from '../TextArea/TextArea'
import { getInputValue } from '../../utils/getInputValue'
import Button from '../Button/Button'

interface Props {
  bubbles: bubbleTypes[] | bubbleTypesPM[]
  setIsContextOpen: Dispatch<SetStateAction<boolean>>
  isContextOpen: boolean
  setCurrIdContext: Dispatch<SetStateAction<string>>
  currIdContext: string
  setReplyBubble: Dispatch<SetStateAction<{ username: string; idBubble: string; message: string; } | undefined>>
  copyMessage: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, message: string) => void
  replyMessage: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, message: string) => void
  reportMessage: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, message: string, ...replies: string[]) => void
  contextClick: boolean
  setContextClick: Dispatch<SetStateAction<boolean>>
  replyBubble: { username: string; idBubble: string; message: string } | undefined
  scrollToReplyRef: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void
  isReportModalOpen: boolean
  setInpReportMessage: Dispatch<SetStateAction<string>>
  inpReportMessage: string
  reportBubbleData: reportBubbleTypes | {}
  confirmedReport: (e: any) => void
  cancelReport: (e: any) => void
  id: string
  isMobileDevice: boolean
}

const DisplayChat = ({ bubbles, setIsContextOpen, isContextOpen, setCurrIdContext, currIdContext, copyMessage, replyMessage, reportMessage, contextClick, setContextClick, replyBubble, scrollToReplyRef, isReportModalOpen, setInpReportMessage, inpReportMessage, reportBubbleData, confirmedReport, cancelReport, id, isMobileDevice }: Props): JSX.Element => {

  const [useReply, setUseReply] = useState<HTMLElement>()

  const handleDisplayClick = (e: any): void => {
    if (isContextOpen && (e.target.dataset.id === 'displayChat' || e.target.classList.contains('outerBubblesWrapper'))) {
      setIsContextOpen(false)
    }
  }

  useEffect(() => {
    setUseReply(document.querySelector('#replyForm[data-replay-to]') as HTMLElement)
  }, [useReply])


  return (
    <div data-id={id} className={`displayChat ${replyBubble ? 'useReply' : ''}`} onScroll={handleDisplayClick} style={{ 'height': `${replyBubble ? `calc(100vh - ${useReply ? 100 : 140}px)` : ''}` }} onClick={handleDisplayClick}>
      {
        isReportModalOpen ?
          <Modal title='Report form' subtitle='inappropriate, violent, harassment or etc' isReportModalOpen={isReportModalOpen} handleCloseModal={cancelReport} id={id} isMobileDevice={isMobileDevice} attr={[{ 'data-draggable': 'true' }]}>
            <Form action='#' method='POST' className='reportForm' id={`reportForm-${id}`} head='' headClass='' subHead='' subHeadClass='' target='_self' autoComplete='off'>
              <TextArea
                className='reportTextArea'
                id={`reportTextArea-${id}`}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => getInputValue(e, setInpReportMessage)}
                value={inpReportMessage}
                placeHolder={`Max 250 characters\nDefendant: ${(reportBubbleData as reportBubbleTypes).username}\nQuote: ${(reportBubbleData as reportBubbleTypes).message}`}
                resizer='both'
                autoFocus={true}
              />
              <div className='d-flex justify-content-around align-items-center w-100'>
                <Button type='submit' name='reportSubmitBtn' className='reportSubmitBtn' id='reportSubmitBtn' innerText='Send' onClick={confirmedReport} />
                <Button type='button' name='reportCancelBtn' className='reportCancelBtn' id='reportCancelBtn' innerText='cancel' onClick={cancelReport} />
              </div>
            </Form>
          </Modal>
          :
          <></>
      }
      <div className='outerBubblesWrapper'>
        {bubbles && bubbles.length > 0 ?
          bubbles.map((bubble: any, i: number) => {
            return (
              <BubbleChat
                key={i}
                bubble={bubble}
                setIsContextOpen={setIsContextOpen}
                isContextOpen={isContextOpen}
                setCurrIdContext={setCurrIdContext}
                currIdContext={currIdContext}
                contextClick={contextClick}
                copyMessage={copyMessage}
                replyMessage={replyMessage}
                reportMessage={reportMessage}
                setContextClick={setContextClick}
                scrollToReplyRef={scrollToReplyRef}
              />
            )
          })
          :
          <></>
        }
      </div>
    </div>
  )
}

export default DisplayChat