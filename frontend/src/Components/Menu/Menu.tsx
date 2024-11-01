import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react'
import Input from '../Input/Input'
import { getInputValue } from '../../utils/getInputValue'
import Button from '../Button/Button'
import ClearSearchBtn from '../ClearSearchBtn/ClearSearchBtn'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'

interface Props {
  setCurrTab: Dispatch<SetStateAction<string[]>>
  currTab: string[]
  toggleMenu: boolean
  setInpNewChannelName: Dispatch<SetStateAction<string>>
  inpNewChannelName: string
  createNewChannel: (e: MouseEvent) => void
  errorBox: string[]
  usersOnline: string[]
  inpSearchUser: string
  setInpSearchUser: Dispatch<SetStateAction<string>>
  inpSearchChannel: string
  setInpSearchChannel: Dispatch<SetStateAction<string>>
  resultSearchChannel: string[]
  clearSearchChannel: () => void
  handleSearching: (e: string) => void
}

const Menu = ({ setCurrTab, currTab, toggleMenu, setInpNewChannelName, inpNewChannelName, createNewChannel, errorBox, usersOnline, inpSearchUser, setInpSearchUser, inpSearchChannel, setInpSearchChannel, resultSearchChannel, clearSearchChannel, handleSearching }: Props): JSX.Element => {
  const { username } = useParams()
  const [menuWrapper, setMenuWrapper] = useState<HTMLElement | undefined>()
  const [menuList, setMenuList] = useState<HTMLElement | undefined>()
  const [newCurrDataSlide, setNewCurrDataSlide] = useState<number>(0)

  useEffect(() => {
    setMenuWrapper(document.querySelector('.menuWrapper') as HTMLElement)
    setMenuList(document.querySelector('.menuList') as HTMLElement)
  }, [])

  const slideMenuLists = (e: MouseEvent): void => {
    const target = e.target as HTMLButtonElement
    const currentItem = target.parentElement!.querySelector('.item.active') as HTMLElement
    const currDataSlide: number = Number(currentItem.dataset.slide)
    const slideLength: number = Number(target.parentElement!.querySelectorAll('.item').length)
    currentItem.classList.remove('active')
    let newIndex: number = 0

    if (target.name === 'next') {
      newIndex = currDataSlide + 1 > slideLength - 1 ? 0 : currDataSlide + 1
      setNewCurrDataSlide(newIndex)
    }
    if (target.name === 'prev') {
      newIndex = currDataSlide - 1 < 0 ? slideLength - 1 : currDataSlide - 1
      setNewCurrDataSlide(newIndex)
    }

    if (newIndex === 0) {
      setCurrTab(['asideChannels', 'New channel', 'Create'])
    } else if (newIndex === 1) {
      setCurrTab(['asideUsers', 'Search someone', 'Search'])
    }

    (target.parentElement!.querySelector(`.item[data-slide="${newIndex}"]`) as HTMLElement).classList.add('active')
  }

  useEffect(() => {
    document.querySelector('.listMenuItemWrapper.active')?.classList.remove('active')
    document.querySelector(`.listMenuItemWrapper[data-slide="${newCurrDataSlide}"]`)?.classList.add('active')
  }, [newCurrDataSlide])

  useEffect(() => {
    if (toggleMenu && menuList) {
      const listHeight = menuList.scrollHeight
      if (menuWrapper) {
        menuWrapper.style.height = `${listHeight}px`
      }
    } else {
      if (menuWrapper) {
        menuWrapper.style.height = '0px'
      }
    }
  }, [toggleMenu, menuWrapper, menuList, newCurrDataSlide, usersOnline, resultSearchChannel])

  return (
    <div className={`menuWrapper ${toggleMenu ? 'active' : ''}`}>
      <ul className='menuList'>
        <li className='listMenuItem'>
          <div className='slide'>
            <Button type='button' name='next' className='controlSlideBtn next' innerText='⟩' onClick={(e: MouseEvent) => slideMenuLists(e)} />
            <Button type='button' name='prev' className='controlSlideBtn prev' innerText='⟨' onClick={(e: MouseEvent) => slideMenuLists(e)} />
            <div className='item center active' data-slide='0'>Create new channel</div>
            <div className='item center' data-slide='1'>Find someone</div>
            <div className='item center' data-slide='2'>Help desk</div>
          </div>
        </li>
        <div className='listMenuItemWrapper active' data-slide='0'>
          <li className='listMenuItem'>
            <Input onChange={(e: ChangeEvent<HTMLInputElement>) => getInputValue(e, setInpNewChannelName)} type='text' name='inpCreateNewChannelNavbar' id='inpCreateNewChannelNavbar' className='inpValueSearch' placeHolder='Create new channel' value={inpNewChannelName} />
            <i onClick={(e: any) => createNewChannel(e)} className='fa fa-plus-circle'></i>
            {
              errorBox && errorBox[1] === 'create' ?
                <div className='errorBox'>{errorBox[0]}</div>
                :
                <></>
            }
          </li>
          <li className='listMenuItem'>
            <Input onChange={(e: ChangeEvent<HTMLInputElement>) => getInputValue(e, setInpSearchChannel)} type='text' name='inpSearchChannelNavbar' id='inpSearchChannelNavbar' className='inpValueSearch' placeHolder='Search Channel' value={inpSearchChannel} />
            <i className='fa fa-search' onClick={() => handleSearching(inpSearchChannel)}></i>
            {
              errorBox[1] === 'searchUser' ?
                <div className='errorBox'>{errorBox[0]}</div>
                :
                <></>
            }
          </li>
          {
            resultSearchChannel && resultSearchChannel.length > 0 ?
              <>
                <li className='listMenuItem' id='navListsChannel'>
                  <div>
                    {
                      resultSearchChannel.map((channel: string, i: number) => {
                        return (
                          <div key={i} className='channelNavbarItem'>#{channel}</div>
                        )
                      })
                    }
                  </div>
                </li>
                <ClearSearchBtn clearSearchChannel={clearSearchChannel} />
              </>
              :
              <></>
          }
        </div>
        <div className='listMenuItemWrapper' data-slide='1'>
          <li className='listMenuItem'>
            <Input onChange={(e: ChangeEvent<HTMLInputElement>) => getInputValue(e, setInpSearchUser)} type='text' name='inpSearchUserNavbar' id='inpSearchUserNavbar' className='inpValueSearch' placeHolder='Search user' value={inpSearchUser} />
          </li>
          <li className='listMenuItem' id='navListsUser'>
            <div>
              {
                usersOnline && usersOnline.length > 0 ?
                  usersOnline.map((user: string, i: number) => {
                    return (
                      <div key={i} data-receiver={user} className='d-flex justify-content-between align-items-center' data-is-open={false}>
                        <div className='usersOnlineNavbarItem'>{user} {user === username ? '(you)' : ''}</div>
                        {
                          user !== username ?
                            <i className='fa fa-circle-o' data-is-online={true}></i>
                            :
                            <></>
                        }
                      </div>
                    )
                  })
                  :
                  <>No one else</>
              }
            </div>
          </li>
        </div>
        <div className='listMenuItemWrapper' data-slide='2'>
          <Link to={`/lomwong/helps/${username}`}>
            <li className='listMenuItem'>
              <span className='pl-5'>
                Ticket report manager page
              </span>
              <i className='fa fa-ticket'></i>
            </li>
          </Link>
          <li className='listMenuItem' data-receiver='admin' data-is-open={false}>
            <span className='pl-5'>
              Text to admin (Not available now)
            </span>
            <Button type='button' name='navbarChatAdmin' className='navbarChatAdmin h-100' innerText='fa fa-commenting-o' useIconFA={true} />
          </li>
        </div>
      </ul>
    </div>
  )
}

export default Menu