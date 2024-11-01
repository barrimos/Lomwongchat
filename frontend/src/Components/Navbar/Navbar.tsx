import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Button from '../Button/Button'
import Menu from '../Menu/Menu'
import { ExitRoomIcon } from '../Icons/ExitRoomIcon'
import PMLists from '../PMLists/PMLists'
import NavPMLists from '../PMLists/NavPMLists'

type Props = {
  isToggleMenuOpen: boolean
  toggleMenu: () => void
  setCurrTab: Dispatch<SetStateAction<string[]>>
  currTab: string[]
  ch: string[]
  currChannel: string
  setInpNewChannelName: Dispatch<SetStateAction<string>>
  inpNewChannelName: string
  createNewChannel: (e: MouseEvent) => void
  errorBox: string[]
  usersOnline: string[]
  inpSearchUser: string
  setInpSearchUser: Dispatch<SetStateAction<string>>
  joinChannel: (e: string) => void
  handleLogoutBtn: (e: MouseEvent) => void
  inpSearchChannel: string
  setInpSearchChannel: Dispatch<SetStateAction<string>>
  resultSearchChannel: string[]
  clearSearchChannel: () => void
  handleSearching: (e: string) => void
}

const Navbar = ({ isToggleMenuOpen, toggleMenu, setCurrTab, currTab, ch, currChannel, setInpNewChannelName, inpNewChannelName, createNewChannel, errorBox, usersOnline, inpSearchUser, setInpSearchUser, joinChannel, handleLogoutBtn, inpSearchChannel, setInpSearchChannel, resultSearchChannel, clearSearchChannel, handleSearching }: Props) => {
  return (
    <nav id='navbar' className='d-md-none'>
      <div className="row no-gutters d-flex justify-content-between align-items-center">

        <div className='col-auto'>
          <Button type='button' name='exitBtn' className='btn exitBtn' innerText='' onClick={handleLogoutBtn} >
            <ExitRoomIcon />
          </Button>
        </div>

        <div className='col-6 d-md-none'>
          <select name="channelSelect" id="channelSelect" className='channelSelect' value={currChannel} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => joinChannel(e.target.value)} >
            {
              ch && ch.length > 0 ?
                ch.map((name: string, i: number) => {
                  return (
                    <option value={name} className='optionRoom' key={i}>#{name}</option>
                  )
                })
                :
                <></>
            }
          </select>
        </div>
        <div className='col-auto'>
          <div className='d-flex justify-content-start alige-items-center'>
            <Button type='button' name='menuBtn' className='btn menuBtn' innerText='fa fa-bars' useIconFA={true} onClick={toggleMenu} />
          </div>
          <Menu
            setCurrTab={setCurrTab}
            currTab={currTab}
            usersOnline={usersOnline}
            inpSearchUser={inpSearchUser}
            setInpSearchUser={setInpSearchUser}
            errorBox={errorBox}
            toggleMenu={isToggleMenuOpen}
            setInpNewChannelName={setInpNewChannelName}
            inpNewChannelName={inpNewChannelName}
            createNewChannel={createNewChannel}
            inpSearchChannel={inpSearchChannel}
            setInpSearchChannel={setInpSearchChannel}
            resultSearchChannel={resultSearchChannel}
            clearSearchChannel={clearSearchChannel}
            handleSearching={handleSearching}
          />
        </div>
      </div>
      {
        isToggleMenuOpen ?
          <div id='overlay'></div>
          :
          <></>
      }
    </nav>
  )
}

export default Navbar