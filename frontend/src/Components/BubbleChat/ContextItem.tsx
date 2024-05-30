import React from 'react'

interface Props {
  username: string
  idBubble: string
  contextName: string
  handleMenuContext: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void
}

const ContextItem = ({ username, idBubble, contextName, handleMenuContext }: Props) => {
  return (
    <div className='contextMenu'
      onClick={(e: React.MouseEvent<HTMLDivElement>) => handleMenuContext(e)}
      onTouchStart={(e: React.TouchEvent<HTMLDivElement>) => handleMenuContext(e)}
      data-username={username} data-id-bubble={idBubble} data-menu-context={contextName}>
        {contextName}
    </div>
  )
}

export default ContextItem