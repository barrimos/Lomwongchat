import React, { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import './dist/Modal.css'
import Button from '../Button/Button'
import { ModalPosition } from '../../types'

interface Props {
  id?: string
  title?: string
  subtitle?: string
  className?: string
  children?: ReactNode
  isReportModalOpen?: boolean
  attr?: { [key: string]: string | undefined }[]
  handleCloseModal?: (e: MouseEvent | TouchEvent) => void
  isMobileDevice?: boolean
  clearPM?: (e: React.MouseEvent | React.TouchEvent) => void
  pos?: ModalPosition
  setPositions?: Dispatch<SetStateAction<ModalPosition[]>>
}

const Modal = ({ id, title, subtitle, className = '', children, attr, handleCloseModal, isMobileDevice, clearPM, pos, setPositions }: Props) => {
  const startEvent: string = isMobileDevice ? 'touchstart' : 'mousedown'
  const moveEvent: string = isMobileDevice ? 'touchmove' : 'mousemove'
  const endEvent: string = isMobileDevice ? 'touchend' : 'mouseup'

  const handleSetPosition = (name: string, x: number, y: number) => {
    if (setPositions) {
      setPositions(prev =>
        prev.map(pos => (pos.name === name ? { ...pos, x, y } : pos))
      )
    }
  }

  const dragElement = (modal: HTMLElement, name: string): void => {
    let pos1: number = 0, pos2: number = 0, pos3: number = 0, pos4: number = 0
    modal.querySelector('.modalHeadTitle')!.addEventListener(startEvent, dragDown, { passive: false })

    function dragDown(e: any) {
      e.preventDefault()

      if (document.querySelector('.modal.active')) {
        document.querySelector('.modal.active')?.classList.remove('active')
      }
      (e.target as HTMLElement).closest('.modal')?.classList.add('active')

      const modalRect = modal.getBoundingClientRect()
      // get the mouse cursor position at startup:
      pos3 = (isMobileDevice ? e.touches[0].clientX : e.clientX) - modalRect.left
      pos4 = (isMobileDevice ? e.touches[0].clientY : e.clientY) - modalRect.top

      document.addEventListener(endEvent, dragEnd, { passive: false })
      // call a function whenever the cursor moves:
      document.addEventListener(moveEvent, dragMove, { passive: false })
    }

    function dragMove(e: any) {
      const parentElem = modal.parentElement as HTMLElement

      e.preventDefault()
      // calculate the new cursor position:
      pos1 = (isMobileDevice ? e.touches[0].clientX : e.clientX) - pos3 - parentElem.getBoundingClientRect().left
      pos2 = (isMobileDevice ? e.touches[0].clientY : e.clientY) - pos4 - parentElem.getBoundingClientRect().top

      const newX = Math.max(0, Math.min(pos1, parentElem.clientWidth - modal.offsetWidth))
      const newY = Math.max(0, Math.min(pos2, parentElem.clientHeight - modal.offsetHeight))

      modal.style.top = newY + 'px'
      modal.style.left = newX + 'px'

      handleSetPosition(name, newX, newY)
    }

    function dragEnd() {
      // stop moving when mouse button is released:
      document.removeEventListener(endEvent, dragEnd)
      document.removeEventListener(moveEvent, dragMove)
    }
  }

  // useEffect(() => {
  //   window.addEventListener('resize', () => {
  //     const displayChat = document.querySelector(`.displayChat[data-id="${id}"]`)
  //     const displayChatStyle = window.getComputedStyle(displayChat!)
  //     const inpTextareaReport = displayChat!.querySelector('.reportTextArea')

  //     if (inpTextareaReport) {
  //       (inpTextareaReport! as HTMLElement).style.maxHeight = `${parseInt(displayChatStyle.height) * .4}px`
  //     }
  //   })
  // }, [])

  useEffect(() => {
    const modals: NodeListOf<HTMLElement> | null = document.querySelectorAll('.modal')
    modals.forEach((modal: HTMLElement, i: number) => {
      if (modal.dataset.draggable === 'true') {
        dragElement(modal, modal.dataset!.receiver!)
      }
      modal.addEventListener('click', e => {
        const elem = (e.currentTarget as HTMLElement)
        // e.preventDefault()
        if (elem.classList.contains('active')) {
          return
        } else {
          (document.querySelector('.modal.pmWrapper.active') as HTMLElement)?.classList.remove('active')
          elem?.classList.add('active')
        }
      })
    })
  }, [])

  return (
    <div className={`modal ${className}`} {...(attr && attr.reduce((acc, obj) => ({ ...acc, ...obj }), {}))} style={{ 'top': pos?.y, 'left': pos?.x }}>
      <div className='d-flex justify-content-between align-items-center'>
        <h4 className='modalHeadTitle w-100 d-flex align-items-center'>{title}<i className='fa fa-arrows' style={{ 'fontSize': '.6em', 'marginLeft': '10px' }}></i></h4>
        <Button type='button' name='closeModal' id='closeModal' innerText='✖' onClick={className === 'pmWrapper' ? clearPM : handleCloseModal} attr={attr} />
      </div>
      {
        subtitle ?
          <div className='modalHeadSubtitle'>{subtitle}</div>
          :
          <></>
      }
      {children}
    </div>
  )
}

export default Modal