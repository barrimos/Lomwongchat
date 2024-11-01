import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Input from '../Input/Input'
import { getInputValue } from '../../utils/getInputValue'
import Button from '../Button/Button'
import ClearSearchBtn from '../ClearSearchBtn/ClearSearchBtn'

interface Props {
  channelsList: string[]
  joinChannel: (e: string) => void
  setInpSearch: Dispatch<SetStateAction<string>>
  inpSearch: string
  handleSearching: (data: string) => void
  resultSearchChannel: string[]
  clearSearchChannel: () => void
}

const ChannelsList = ({ channelsList, joinChannel, setInpSearch, inpSearch, handleSearching, resultSearchChannel, clearSearchChannel }: Props): JSX.Element => {
  const { channel } = useParams()

  return (
    <>
      <div className='d-flex justify-content-between align-items-center' style={{ 'height': '30px' }}>
        <Input type='text' name='searchChannel' id='searchChannel' className='inpValueSearch' onChange={e => getInputValue(e, setInpSearch)} value={inpSearch} placeHolder='Search channel' />
        <Button type='button' name='submitSearch' id='submitSearch' className='submitInp' innerText='Search' onClick={handleSearching} value={inpSearch} />
      </div>
      {
        channelsList && channelsList.length > 0 ?
          channelsList.map((nameObj: string, i: number): JSX.Element => {
            return (
              <div key={i}>
                <li className='listsChannel' data-chanel-name={nameObj} onClick={e => joinChannel(nameObj)}>
                  <span className={`channel ${channel === nameObj ? 'active' : ''}`}>#{nameObj[0].toUpperCase() + nameObj.slice(1,)}</span>
                  {channel && channel === nameObj ?
                    <span className='joined'>joined</span>
                    :
                    <></>
                  }
                </li>
                {
                  resultSearchChannel.length > 0 ?
                    <ClearSearchBtn clearSearchChannel={clearSearchChannel}/>
                    :
                    <></>
                }
              </div>
            )
          })
          :
          <span className='empty'>No any channel</span>
      }
    </>
  )
}

export default ChannelsList