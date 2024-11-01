import { ChangeEvent, Dispatch, SetStateAction } from "react"

export interface buttonTypes {
  type: 'button' | 'submit' | 'reset'
  name: string
  value?: string | number
  id?: string
  className?: string
  innerText: string
  useIconFA?: boolean
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  children?: React.ReactNode
  attr?: {[key: string]}[]
}

export interface ModalPosition {
  name: string
  x: number
  y: number
}

export interface bubbleTypesPM {
  name: string
  bubbles: Array
}

export interface InputTypes {
  type: string
  name: string
  id: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: KeyboardEventHandler<HTMLInputElement>) => void
  className?: string
  placeHolder?: string
  required?: boolean
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void
  value?: string | number
  useLabel?: boolean
  labelText?: string
  labelId?: string
  labelClass?: string
  min?: string | number
  max?: string | number
  useShowHide?: [boolean, Dispatch<SetStateAction<boolean>>]
}


export interface captchaTypes {
  setStatusVerified: Dispatch<SetStateAction<string>>
  setCanvas: (e: HTMLCanvasElement) => void
  value: string
  useLabel: boolean
  reNewCaptcha: boolean
  inputCaptcha: string
  setInputCaptcha: Dispatch<SetStateAction<string>>
  setReNewCaptcha: Dispatch<SetStateAction<boolean>>
  setCurrCaptcha: Dispatch<SetStateAction<string>>
  // genCaptcha: string
  reCaptcha: (e: MouseEvent<HTMLDivElement>) => void
  readCaptcha: (e: MouseEvent<HTMLDivElement>) => void
}

export interface formTypes {
  head: string
  headClass: string
  subHead: string
  subHeadClass: string
  method: string
  action: string
  className: string
  id: string
  target: '_blank' | '_self' | '_parent' | '_top' | undefined
  autoComplete: 'on' | 'off' | undefined
  children: React.ReactNode
}

export interface DashboardUsers {
  createdAt : string
  lastActive : string
  role : string
  status : string
  token : {
    accessToken: string
    refreshToken: string
  }
  updatedAt : string
  username : string
  __v : number
}

export interface bubbleTypes {
  bubble: {
    rid: string
    username: string
    message: string
    rawTime: string
    timestamp: string
    reply: { username: string, idBubble: string, message: string } | undefined
  }
  setIsContextOpen?: Dispatch<SetStateAction<boolean>>
  isContextOpen?: boolean
  setCurrIdContext?: Dispatch<SetStateAction<string>>
  currIdContext?: string
  replyBubble?: { username: string, idBubble: string, message: string }
  contextClick: boolean
  copyMessage: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, message: string) => void
  replyMessage: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, message: string) => void
  reportMessage: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, message: string, ...replies: string[]) => void
  setContextClick: Dispatch<SetStateAction<boolean>>
  scrollToReplyRef: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void
}

export interface boundingTypes {
  bottom: number
  height: number
  left: number
  right: number
  top: number
  width: number
  x: number
  y: number
}

export interface reportBubbleTypes {
  ticket: string | null
  status: string
  reporter: string | undefined
  channel: string | undefined
  username: string
  idBubble: string
  message: string,
  replies: string[]
  details: string | null
  timeMessage: string
  createdAt?: String
}