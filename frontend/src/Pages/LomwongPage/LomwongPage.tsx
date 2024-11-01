import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Params, useNavigate, useParams } from 'react-router-dom'
import { bubbleTypes } from '../../types'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import io from 'socket.io-client'

import Input from '../../Components/Input/Input'
import Button from '../../Components/Button/Button'
import Channel from '../../Components/Channel/Channel'
import Navbar from '../../Components/Navbar/Navbar'
import './dist/LomwongPage.css'

import { getInputValue } from '../../utils/getInputValue'

import axios, { AxiosResponse } from 'axios'
import UsersList from '../../Components/UsersList/UsersList'
import Chat from '../../Components/Chat/Chat'
import { Link } from 'react-router-dom'

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' // or use your specific production check
const protocol = isProduction ? 'https://' : 'http://'
const server = `${protocol}${window.location.hostname}:8080`

interface Props { }
const socket = io(server, {
  autoConnect: false,
  extraHeaders: {
    'Access-Control-Allow-Origin': server,
  }
})

const LomwongPage = (props: Props): JSX.Element => {
  const initialized = useRef(false)

  const params: Readonly<Params<string>> = useParams()
  const navigatate = useNavigate()

  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false)

  const [isAuthen, setIsAuthen] = useState<boolean>(false)
  const [currTab, setCurrTab] = useState<string[]>(['asideChannels', 'New channel', 'Create'])

  const [inpNewChannelName, setInpNewChannelName] = useState<string>('')

  const [inpSearchUser, setInpSearchUser] = useState<string>('')
  const [inpSearchChannel, setInpSearchChannel] = useState<string>('')

  const [errorBox, setErrorBox] = useState<string[]>([])

  const [fetchMessage, setFetchMessage] = useState<bubbleTypes[]>([])

  const [channelsList, setChannelsList] = useState<string[]>(['lobby'])
  const [usersOnline, setUsersOnline] = useState<string[]>([])
  const [resultSearchChannel, setResultSearchChannel] = useState<string[]>([])
  const [resultSearchUser, setResultSearchUser] = useState<string[]>([])

  const [joinNewChannel, setJoinNewChannel] = useState<boolean>(false)
  const [currChannel, setCurrChannel] = useState<string>('lobby')

  const [isToggleMenuOpen, setIsToggleMenuOpen] = useState<boolean>(false)

  const switchTab = (e: MouseEvent): void => {
    const target: string = (e.target as HTMLButtonElement).name
    if (target === 'asideChannels') {
      setCurrTab(['asideChannels', 'New channel', 'Create'])
    } else {
      setCurrTab(['asideUsers', 'Search someone', 'Search'])
    }
  }

  const fetchUsersOnline = async (data: string[]): Promise<void> => {
    const updateUsersList: string[] = [...usersOnline, ...data]
    setUsersOnline(updateUsersList)
  }

  const createNewChannel = async (e: MouseEvent): Promise<void> => {
    e.preventDefault()
    if (!inpNewChannelName) {
      return
    }
    if (channelsList.includes(inpNewChannelName)) {
      setErrorBox(['This room is already exists', 'create'])
      setTimeout(() => {
        setErrorBox([])
      }, 3000)
      return
    }
    try {
      await axios.post(`${server}/createChannel/${inpNewChannelName}`, {}, { withCredentials: true })
      socket.emit('newChannelCreated', inpNewChannelName)
      joinChannel(inpNewChannelName)
      navigatate(`/lomwong/${params.username}/${inpNewChannelName}`)
    } catch (err: any) {
      console.error(err.response.data.error)
    }
    setInpNewChannelName('')
  }

  const joinChannel = (selectChannel: string): void => {
    if (selectChannel === params.channel) {
      return
    } else {
      // setBubblesData([])
      setJoinNewChannel(true)
    }
    socket.emit('joinChannel', [params.channel, selectChannel, params.username])
    setCurrChannel(selectChannel)
    navigatate(`/lomwong/${params.username}/${selectChannel}`)
  }

  const fetchChannels = async (): Promise<void> => {
    try {
      const response: AxiosResponse = await axios.get(`${server}/channels`, { withCredentials: true })
      const updateChannel: string[] = [...channelsList, ...response.data]
      setChannelsList(updateChannel)
    } catch (err) {
      throw err
    }
  }

  const fetchChatHistory = async (): Promise<void> => {
    try {
      const response: AxiosResponse = await axios.get(`${server}/chatHistory`, { withCredentials: true })
      setFetchMessage(response.data)
    } catch (err) {
      throw err
    }
  }

  const handleSearching = (data: string): void => {
    let resultSearching: string[] = []
    if ((currTab[0] === 'asideChannels') && inpSearchChannel) {
      resultSearching = channelsList.filter(channel => channel === inpSearchChannel)
      setResultSearchChannel(resultSearching)
      setInpSearchChannel('')
    } else if ((currTab[0] === 'asideUsers') && inpSearchUser) {
      resultSearching = usersOnline.filter(user => user.includes(data))
      setResultSearchUser(resultSearching)
    } else {
      return
    }
  }

  const clearSearchChannel = (): void => {
    setResultSearchChannel([])
  }

  const toggleMenu = () => {
    const btn = document.querySelector('.menuBtn i')

    if (isToggleMenuOpen) {
      setIsToggleMenuOpen(false)
      btn!.classList.remove('fa-close')
      btn!.classList.add('fa-bars')
    } else {
      setIsToggleMenuOpen(true)
      btn!.classList.remove('fa-bars')
      btn!.classList.add('fa-close')
    }
  }

  const handleLogoutBtn = async (e: MouseEvent): Promise<void> => {
    await axios.post(`${server}/logout`, { username: params.username }, { withCredentials: true })
    sessionStorage.clear()
    localStorage.clear()
    socket.emit('logout', params.username, sessionStorage.getItem('skid'), params.channel)
    socket.disconnect()
    navigatate('/')
  }

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true

      // check authenticate
      axios.get(`${server}/auth/token/${params.username}`, { withCredentials: true })
        .then(verified => {
          if (verified.data.valid) {
            setIsAuthen(verified.data.valid)

            fetchChannels()

            const isMobileSupported: boolean = /android|iphone|kindle|ipad/i.test(navigator.userAgent)
            setIsMobileDevice(isMobileSupported)

          } else {
            if (verified.data.error) {
              withReactContent(Swal).fire({
                text: verified.data.error
              })
                .then(() => {
                  navigatate('/')
                })
            }
          }
        })
        .catch(() => {
          navigatate('/')
        })
    }
  }, [])

  useEffect(() => {
    if (currTab) {
      document.querySelector('.asideBtn.active')?.classList.remove('active')
      document.querySelector(`.${currTab}`)?.classList.add('active')
      if (!params.channel || !channelsList.includes(params.channel)) {
        navigatate(`/lomwong/${params.username}/lobby`)
      }
    }
  }, [currTab])

  useEffect(() => {
    socket.on('usersOnline', (newClientConnect: string[]) => {
      fetchUsersOnline(newClientConnect)
      // fetchUsersOnline(testUsers)
    })

    socket.on('fetchNewChannel', () => {
      fetchChannels()
    })
  }, [])

  useEffect(() => {
    window.addEventListener('click', e => {
      if ((e.target as HTMLElement).id === 'overlay') {
        if (isToggleMenuOpen) {
          toggleMenu()
        }
      }
    })
  }, [isToggleMenuOpen])

  useEffect(() => {
    handleSearching(inpSearchUser)
  }, [inpSearchUser])

  return (
    <>
      {
        isAuthen ?
          <div className='container'>
            <div className='row'>
              <div className='d-none d-md-block col-md-2'>
                <aside id='asideProfile'>
                  <div className='profile'>
                    <h1>{params.username}</h1>
                    <Link to={`/lomwong/helps/${params.username}`} className='linkTicket'>
                      <i className='fa fa-ticket'></i>
                    </Link>
                  </div>
                  <div className='pmListWrapper'>
                    <ul className='personalMessageList'>
                      <li className='headPM'>Direct Message</li>
                      <li className='empty'>Not available now</li>
                    </ul>
                  </div>
                </aside>
              </div>
              <div className='col-12 col-md-6 p-0'>
                <main>
                  <Navbar
                    isToggleMenuOpen={isToggleMenuOpen}
                    toggleMenu={toggleMenu}

                    // setState current tab
                    setCurrTab={setCurrTab}
                    // value current tab
                    currTab={currTab}
                    // list users online
                    usersOnline={inpSearchUser.length > 0 ? resultSearchUser : usersOnline}
                    // input search user online
                    inpSearchUser={inpSearchUser}
                    // setState search user online
                    setInpSearchUser={setInpSearchUser}

                    errorBox={errorBox}

                    // list channels
                    ch={channelsList}
                    // current join channel
                    currChannel={currChannel}
                    // setState create new channel
                    setInpNewChannelName={setInpNewChannelName}
                    // input create new channel
                    inpNewChannelName={inpNewChannelName}
                    // method create new channel
                    createNewChannel={createNewChannel}
                    // method join channel
                    joinChannel={joinChannel}
                    // input search channel
                    inpSearchChannel={inpSearchChannel}
                    // setState search channel
                    setInpSearchChannel={setInpSearchChannel}
                    // result search channel
                    resultSearchChannel={resultSearchChannel}
                    // clear search
                    clearSearchChannel={clearSearchChannel}

                    // method search user and channel
                    handleSearching={handleSearching}

                    // logout
                    handleLogoutBtn={handleLogoutBtn}
                  />
                  <Chat
                    socket={socket}
                    id='displayChat'
                    joinNewChannel={joinNewChannel}
                    currChannel={currChannel}
                    isMobileDevice={isMobileDevice}
                    isToggleMenuOpen={isToggleMenuOpen}
                    toggleMenu={toggleMenu}
                    autoFocus={true}
                  />
                </main>
              </div>
              <aside className='col-md-4 d-none d-md-block'>
                <div id='asideMenu'>
                  <div className='aside-menu d-flex justify-content-between align-items-center'>
                    <Button type='button' name='asideChannels' id='asideChannels' className='asideBtn asideChannels active' innerText='Channels' onClick={(e: MouseEvent) => switchTab(e)} />
                    <Button type='button' name='asideUsers' id='asideUsers' className='asideBtn asideUsers' innerText='Users' onClick={(e: MouseEvent) => switchTab(e)} />
                    <Button type='button' name='logoutBtn' id='logoutBtn' className='asideBtn logoutBtn' innerText='fa fa-power-off' useIconFA={true} onClick={handleLogoutBtn} />
                  </div>
                  <div id='inpAside'>
                    <Input onChange={(e: ChangeEvent<HTMLInputElement>) => getInputValue(e, currTab[0] === 'asideChannels' ? setInpNewChannelName : setInpSearchUser)} type='text' name='inpCreateNewChannel' id='inpCreateNewChannel' className='inpValueSearch' data-submit={currTab[2].toLocaleLowerCase()} placeHolder={currTab[1]} value={currTab[0] === 'asideChannels' ? inpNewChannelName : inpSearchUser} />
                    {
                      currTab[0] === 'asideChannels' ?
                        <Button onClick={(e: MouseEvent) => createNewChannel(e)} type='button' name='submitAsideBtn' id='submitAsideBtn' className='submitInp' innerText={currTab[2]} value={inpNewChannelName} />
                        :
                        <></>
                    }
                    {
                      errorBox[0] ?
                        <div className={`errorBox ${errorBox[0] ? 'active' : ''}`}>{errorBox[0]}</div>
                        :
                        <></>
                    }
                  </div>
                  <div id="groupWrapper">
                    <ul id='groupList'>
                      <Button type='button' name='asideChatAdmin' className='asideChatAdmin p-5 asideBtn' innerText='' attr={[{ 'data-receiver': 'admin' }, { 'data-is-open': false }]}>
                        Text to admin (Not available now) <i className='fa fa-commenting-o'></i>
                      </Button>
                      {
                        currTab[0] === 'asideChannels' ?
                          <Channel ch={resultSearchChannel.length > 0 ? resultSearchChannel : channelsList} resultSearchChannel={resultSearchChannel} clearSearchChannel={clearSearchChannel} joinChannel={joinChannel} setInpSearch={setInpSearchChannel} handleSearching={handleSearching} inpSearch={inpSearchChannel} />
                          :
                          <UsersList usersOnline={inpSearchUser.length > 0 ? resultSearchUser : usersOnline} />
                      }
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div >
          :
          <></>
      }
    </>
  )
}

export default LomwongPage