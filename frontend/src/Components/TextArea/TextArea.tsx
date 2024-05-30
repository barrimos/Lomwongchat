import React, { ChangeEvent } from 'react'

interface Props {
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  value: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeHolder?: string
  id?: string
  className?: string
  resizer: any
  autoFocus: boolean
}
const TextArea = ({ onChange, value, onKeyDown, placeHolder, className, id, resizer, autoFocus }: Props): JSX.Element => {
  return (
    <textarea style={{ 'resize': resizer ? resizer : '' }} className={className} onChange={onChange} value={value} onKeyDown={onKeyDown} placeholder={placeHolder} id={id} autoFocus={autoFocus} />
  )
}

export default TextArea