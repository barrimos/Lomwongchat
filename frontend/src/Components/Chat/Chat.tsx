import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import Button from '../Button/Button'
import { getInputValue } from '../../utils/getInputValue'
import DisplayChat from '../DisplayChat/DisplayChat'
import TextArea from '../TextArea/TextArea'
import { ToBottomIcon } from '../Icons/ExitRoomIcon'
import { bubbleTypes, reportBubbleTypes } from '../../types'

import { useParams } from 'react-router-dom'
import ReplyForm from '../BubbleChat/ReplyForm'
import { Socket } from 'socket.io-client'

import './dist/Chat.css'
import { randomCharacter } from '../../utils/randomCharacter'
import axios from 'axios'
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2'

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' // or use your specific production check
const protocol = isProduction ? 'https://' : 'http://'
const server = `${protocol}${window.location.hostname}:8080`

interface Props {
  socket: Socket
  id: string
  rid?: string | null
  joinNewChannel?: boolean
  currChannel?: string
  isMobileDevice?: boolean
  isToggleMenuOpen?: boolean
  toggleMenu?: () => void
  autoFocus?: boolean
}

const Chat = ({ socket, id, rid, joinNewChannel, currChannel, isMobileDevice, isToggleMenuOpen, toggleMenu, autoFocus }: Props) => {
  const ref = useRef(false)

  const { username, channel } = useParams()

  const [elemChats, setElemChat] = useState<NodeListOf<HTMLElement> | null>(null)
  const [elemScrollBottomBtn, setElemScrollBottomBtn] = useState<NodeListOf<HTMLElement> | null>(null)

  const [inpMessage, setInpMessage] = useState<string>('')
  const [bubblesData, setBubblesData] = useState<bubbleTypes[]>([])

  const [isContextOpen, setIsContextOpen] = useState<boolean>(false)
  const [currIdContext, setCurrIdContext] = useState<string>('')
  const [contextClick, setContextClick] = useState<boolean>(false)
  const [replyBubble, setReplyBubble] = useState<{ username: string, idBubble: string, message: string } | undefined>(undefined)

  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false)
  const [reportBubbleData, setReportBubbleData] = useState<reportBubbleTypes | {}>({})
  const [inpReportMessage, setInpReportMessage] = useState<string>('')

  const scrollToDown = (): void => {
    const scrollBottomBtn: NodeListOf<HTMLElement> | [] = document.querySelectorAll('.toBottomBtn')

    scrollBottomBtn.forEach((btn: HTMLElement, i: number) => {
      const displayChat = (btn as HTMLElement)?.parentElement?.parentElement?.querySelector('.outerBubblesWrapper')
      btn.addEventListener('click', e => {
        displayChat!.scrollTop = displayChat!.scrollHeight
      })

      displayChat?.addEventListener('scroll', e => {
        if (displayChat.scrollHeight > displayChat.clientHeight * 2) {
          if (displayChat.scrollTop * 2 < displayChat.scrollHeight * .9) {
            btn!.classList.add('active')
            if (displayChat.parentElement?.nextElementSibling!.id === 'replyForm') {
              btn!.style.bottom = '110px'
            } else {
              btn!.style.bottom = '55px'
            }
          } else {
            btn!.classList.remove('active')
            btn!.style.bottom = '5px'
          }
        }
      })
    })

    // scrollBottomBtn?.addEventListener('click', e => {
    //   displayChat!.scrollTop = displayChat!.scrollHeight
    // })

    // displayChat?.addEventListener('scroll', e => {
    //   scrollBottomBtn!.style.transition = 'ease-in-out 0.3s'
    //   if (displayChat.scrollHeight > displayChat.clientHeight * 2) {
    //     if (displayChat.scrollTop * 2 < displayChat.scrollHeight * .9) {
    //       if (displayChat.parentElement?.nextElementSibling!.id === 'replyForm') {
    //         scrollBottomBtn!.style.bottom = '110px'
    //       } else {
    //         scrollBottomBtn!.style.bottom = '55px'
    //       }
    //     } else {
    //       scrollBottomBtn!.style.bottom = '5px'
    //     }
    //   }
    // })

    // if ((elemChats && elemChats.length > 0) && (elemScrollBottomBtn && elemScrollBottomBtn.length > 0)) {
    //   elemScrollBottomBtn.forEach((btn: Element, i: number) => {
    //     btn.addEventListener('click', e => {
    //       elemChats[i]!.scrollTop = elemChats[i]!.scrollHeight
    //     })
    //   })

    //   elemChats && elemChats.forEach((elem: Element, i: number) => {
    //     elem.addEventListener('scroll', e => {
    //       if (elem.scrollHeight > elem.clientHeight * 2) {
    //         if (elem.scrollTop * 2 < elem.scrollHeight * .9) {
    //           if (elem.parentElement?.nextElementSibling!.id === 'replyForm') {
    //             elemScrollBottomBtn[i]!.style.bottom = '110px'
    //           } else {
    //             elemScrollBottomBtn[i]!.style.bottom = '55px'
    //           }
    //         } else {
    //           elemScrollBottomBtn[i]!.style.bottom = '5px'
    //         }
    //       }
    //     })
    //   })
    // }
  }

  const handleSubmitMessage = (e?: MouseEvent | TouchEvent): void => {

    if (/^\s*$/g.test(inpMessage)) {
      setInpMessage('')
      return
    }

    const d = new Date()
    const hours: string = `${d.getHours()}`.padStart(2, '0')
    const mins: string = `${d.getMinutes()}`.padStart(2, '0')

    const bubble = {
      rid: rid || channel || currChannel,
      username: sessionStorage.getItem('username'),
      message: inpMessage,
      rawTime: `${d.getTime()}`,
      timestamp: `${hours} : ${mins}`,
      reply: replyBubble
    }

    socket.emit('message', bubble)
    setInpMessage('')
    setReplyBubble(undefined)
    setCurrIdContext('')

    if (e) {
      (((e?.currentTarget as HTMLElement).previousElementSibling! as HTMLInputElement) ?? e.currentTarget as HTMLInputElement).focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey && inpMessage) {
      e.preventDefault()
      handleSubmitMessage(e as any)
    }
  }

  const copyMessage = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, message: string): void => {
    if (message) {
      const temp_input = document.createElement('textarea')
      temp_input.style.zIndex = '-99999'

      const menu_context_opened = document.querySelector('#replyForm[data-replay-to]')
      // if menu context was opened at some bubble remove menu wrapper and then add menu context to new bubble called
      if (menu_context_opened !== null) {
        setReplyBubble(undefined)
        const displayChat: HTMLElement | null = (e.target as HTMLElement).closest('.outerBubblesWrapper')
        const scrollBottomBtn: HTMLElement | null = (displayChat!.parentElement!.nextElementSibling!.nextElementSibling! ?? displayChat!.parentElement!.nextElementSibling!).querySelector('.toBottomBtn')

        if (scrollBottomBtn && scrollBottomBtn!.classList.contains('active')) {
          if (displayChat!.scrollHeight > displayChat!.clientHeight * 2) {
            if (displayChat!.scrollTop * 2 < displayChat!.scrollHeight * .9) {
              scrollBottomBtn!.style.bottom = '55px'
            }
          }
        }
        setTimeout(() => {
          (displayChat!.parentElement!.nextElementSibling!.querySelector('.inpMessage') as HTMLTextAreaElement).focus()
        }, 100)


        // elemChats?.forEach((elem: HTMLElement, i: number) => {
        //   if (elem!.scrollHeight > elem!.clientHeight * 2) {
        //     if (elem!.scrollTop * 2 < elem!.scrollHeight * .9) {
        //       elemScrollBottomBtn![i].style.bottom = '55px'
        //     }
        //   }
        // })
      }

      document.body.appendChild(temp_input)
      temp_input.innerHTML = message
      temp_input.select()
      temp_input.setSelectionRange(0, 99999)
      document.execCommand('copy')
      document.body.removeChild(temp_input)
    }
  }

  const replyMessage = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, message: string): void => {
    const targetElem = (e.target as HTMLDivElement).dataset
    const dataReply = {
      username: targetElem.username as string,
      idBubble: targetElem.idBubble as string,
      message: message.slice(0, 60) + '...' as string,
    }
    setReplyBubble(dataReply)

    const displayChat: HTMLElement | null = (e.target as HTMLElement).closest('.outerBubblesWrapper')
    const scrollBottomBtn: HTMLElement | null = displayChat!.parentElement!.nextElementSibling!.querySelector('.toBottomBtn')

    if (scrollBottomBtn && scrollBottomBtn!.classList.contains('active')) {
      if (displayChat!.scrollHeight > displayChat!.clientHeight * 2) {
        if (displayChat!.scrollTop * 2 < displayChat!.scrollHeight * .9) {
          scrollBottomBtn!.style.bottom = '110px'
        } else {
          scrollBottomBtn!.style.bottom = '55px'
        }
      }
    }

    setTimeout(() => {
      (displayChat!.parentElement!.nextElementSibling?.nextElementSibling!.querySelector('.inpMessage') as HTMLTextAreaElement).focus()
    }, 100)

    // elemChats?.forEach((elem: HTMLElement, i: number) => {
    //   if (elem!.scrollHeight > elem!.clientHeight * 2) {
    //     if (elem!.scrollTop * 2 < elem!.scrollHeight * .9) {
    //       elemScrollBottomBtn![i].style.bottom = '110px'
    //     } else {
    //       elemScrollBottomBtn![i].style.bottom = '55px'
    //     }
    //   }
    // })
  }

  const reportMessage = async (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, message: string, ...replies: string[]): Promise<void> => {
    const targetElem = (e.target as HTMLDivElement)
    const dataReport: reportBubbleTypes = {
      ticket: randomCharacter(5),
      status: 'queue',
      reporter: username,
      channel: rid || channel || currChannel,
      username: targetElem.dataset.username as string,
      idBubble: targetElem.dataset.idBubble as string,
      message: message as string,
      replies: replies,
      details: null,
      timeMessage: targetElem.parentElement?.dataset.time as string
    }

    if (setIsReportModalOpen) setIsReportModalOpen(true)
    if (setReportBubbleData) setReportBubbleData(dataReport)
  }

  const confirmedReport = async (e: any): Promise<void> => {
    e.preventDefault()
    await axios.post(`${server}/reports`, { data: reportBubbleData, details: inpReportMessage }, { withCredentials: true })
      .then(res => {
        withReactContent(Swal).fire({
          title: res.data.message,
          text: `Ticket is ${res.data.ticket}`
        })
      })
      .catch(err => {
        withReactContent(Swal).fire(err.response.data.error)
      })

    if (setReportBubbleData) setReportBubbleData({})
    cancelReport()
  }

  const cancelReport = (): void => {
    if (setIsReportModalOpen) setIsReportModalOpen(false)
  }

  const scrollToReplyRef = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>): void => {
    e.stopPropagation()
    const replyToId: string | undefined = (e.target as HTMLDivElement).dataset.replyIdBubble
    document.querySelector(`.bubbleWrapper[data-id-bubble="${replyToId}"]`)!.scrollIntoView(true)
  }

  const closereplyForm = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>): void => {
    setReplyBubble(undefined)
    const displayChat: Element | null | undefined = (e.currentTarget as HTMLElement).parentElement?.previousElementSibling?.querySelector('.outerBubblesWrapper')
    const scrollBottomBtn: HTMLElement | null = displayChat!.parentElement!.nextElementSibling!.nextElementSibling!.querySelector('.toBottomBtn')

    if (scrollBottomBtn && scrollBottomBtn!.classList.contains('active')) {
      if (displayChat!.scrollHeight > displayChat!.clientHeight * 2) {
        if (displayChat!.scrollTop * 2 < displayChat!.scrollHeight * .9) {
          scrollBottomBtn!.style.bottom = '55px'
        }
      }
    }

    setTimeout(() => {
      (displayChat!.parentElement!.nextElementSibling!.querySelector('.inpMessage') as HTMLTextAreaElement).focus()
    }, 100)

    // elemChats?.forEach((elem: HTMLElement, i: number) => {
    //   if (elem!.scrollHeight > elem!.clientHeight * 2) {
    //     if (elem!.scrollTop * 2 < elem!.scrollHeight * .9) {
    //       elemScrollBottomBtn![i].style.bottom = '55px'
    //     }
    //   }
    // })
  }

  useEffect(() => {
    if (joinNewChannel) {
      setBubblesData([])
    }
  }, [joinNewChannel, currChannel])

  useEffect(() => {
    if (!ref.current) {
      ref.current = true
      socket.connect()
      // Connect to Socket.IO server
      socket.emit('verify', username)

      socket.on('getId', (id: string) => {
        sessionStorage.setItem('skid', id)
        socket.emit('joinChannel', [null, rid || channel || currChannel, username])
      })

      setElemChat(document.querySelectorAll('.outerBubblesWrapper'))
      setElemScrollBottomBtn(document.querySelectorAll('.toBottomBtn'))

      window.addEventListener('beforeunload', () => {
        socket.emit('beforeUnload', sessionStorage.getItem('skid'), rid || channel || currChannel)
      })
    }
  }, [])

  useEffect(() => {
    if (isToggleMenuOpen) {
      toggleMenu!()
    }
  }, [inpMessage])

  useEffect(() => {
    scrollToDown()
  }, [elemChats, elemScrollBottomBtn])

  useEffect(() => {
    socket.on('broadcast', (newMessage: bubbleTypes['bubble']) => {
      setBubblesData((prevMessages: any) => {
        // Check if the message is already present in the state
        if (!prevMessages.includes(newMessage)) {
          // If not present, add the message to the state
          return [...prevMessages, newMessage]
        }
        // If present, return the previous state without adding the message
        return prevMessages
      })
    })
  }, [])


  useEffect(() => {
    if (bubblesData.length > 0) {
      const displayChats: NodeListOf<HTMLElement> | null = document.querySelectorAll('.outerBubblesWrapper')
      displayChats.forEach(elem => {
        elem!.scrollTop = elem!.scrollHeight
      })
    }
  }, [bubblesData])

  return (
    <>
      <DisplayChat
        id={id}
        bubbles={bubblesData}
        setIsContextOpen={setIsContextOpen}
        isContextOpen={isContextOpen}
        setCurrIdContext={setCurrIdContext}
        currIdContext={currIdContext}
        setReplyBubble={setReplyBubble}
        replyBubble={replyBubble}
        copyMessage={copyMessage}
        replyMessage={replyMessage}
        reportMessage={reportMessage}
        contextClick={contextClick}
        setContextClick={setContextClick}
        scrollToReplyRef={scrollToReplyRef}
        isReportModalOpen={isReportModalOpen}
        setInpReportMessage={setInpReportMessage}
        inpReportMessage={inpReportMessage}
        reportBubbleData={reportBubbleData}
        confirmedReport={confirmedReport}
        cancelReport={cancelReport}
        isMobileDevice={isMobileDevice!}
      />
      {
        replyBubble ?
          <ReplyForm replyBubble={replyBubble} closereplyForm={closereplyForm} />
          :
          <></>
      }
      <div className='inpMessageWrapper'>
        <TextArea
          className='inpMessage'
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => getInputValue(e, setInpMessage)}
          value={inpMessage}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleKeyPress(e)}
          placeHolder={`Send message ${isMobileDevice ? '' : 'shift + enter : new line'}`}
          resizer={null}
          autoFocus={autoFocus!}
        />
        <Button type='button' name='submitMessageBtn' className='submitMessageBtn' innerText='fa fa-fire' useIconFA={true} onClick={handleSubmitMessage} />
        <Button type='button' name='toBottomBtn' className='toBottomBtn' useIconFA={false} innerText=''>
          <ToBottomIcon />
        </Button>
      </div>
    </>
  )
}

export default Chat