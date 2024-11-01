import { ChangeEvent, useEffect, useRef, useState } from 'react'
import Input from '../../Components/Input/Input'
import { getInputValue } from '../../utils/getInputValue'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import axios, { AxiosResponse } from 'axios'

import './dist/Dashboard.css'
import Button from '../../Components/Button/Button'
import Switch from '../../Components/Switch/Switch'
import { useNavigate, useParams } from 'react-router-dom'
import Form from '../../Components/Form/Form'
import BoardBox from '../../Components/BoardBox/BoardBox'
import ActionButtonStatus from './ActionButtonStatus'
import { DashboardUsers, reportBubbleTypes } from '../../types'
import Pagination from '../../Components/Pagination/Pagination'
import Chat from '../../Components/Chat/Chat'

import io from 'socket.io-client'
import Loader from '../../Components/Loader/Loader'
import ReportManage from './ReportManage'

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' // or use your specific production check
const protocol = isProduction ? 'https://' : 'http://'
const server = `${protocol}${window.location.hostname}:8080`

const socket = io(server, {
  autoConnect: false,
  extraHeaders: {
    'Access-Control-Allow-Origin': server,
  }
})

interface Props { }

const LoginDashboard = (props: Props) => {
  const navigate = useNavigate()
  const ref = useRef(false)

  const { username } = useParams()

  const [uname, setUname] = useState<string>(() => {
    return sessionStorage.getItem('username')!
  })

  const [allChannelsList, setAllChannelsList] = useState<string[]>(['lobby'])
  const [allUsers, setAllUsers] = useState<DashboardUsers[]>([])
  const [countUsersOnline, setCountUsersOnline] = useState<number>(0)
  const [requestReports, setRequestReports] = useState<reportBubbleTypes[]>([])

  const [currPage, setCurrPage] = useState<number>(1)
  const [usersPagination, setUsersPagination] = useState<DashboardUsers[]>([])

  const [inpSearchUser, setInpSearchUser] = useState<string>('')
  const [resultSearchUser, setResultSearchUser] = useState<DashboardUsers[]>()
  const [usersPerPage, setUsersPerPage] = useState<number>(15)

  const [joinNewChannel, setJoinNewChannel] = useState<boolean>(false)
  const [currChannel, setCurrChannel] = useState<string>('lobby')

  const [inpSysUsername, setInpSysUsername] = useState<string>('')
  const [inpSysPassword, setInpSysPassword] = useState<string>('')
  const [errorBox, setErrorBox] = useState<string>('')

  const [attempRemains, setAttempRemains] = useState<number>(() => {
    const storedRemains = localStorage.getItem('remains')
    return storedRemains ? Number(storedRemains) : 3
  })

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthPass, setIsAuthPass] = useState<boolean>(false)

  const [themeSwitch, setThemeSwitch] = useState<string>('light')

  const [sortedAsc, setSortedAsc] = useState<boolean>(true)
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false)

  const [reportDatas, setReportDatas] = useState<reportBubbleTypes[]>([])
  const [isReportManageOpen, setIsReportManageOpen] = useState<boolean>(false)

  const reset = (): void => {
    setAllUsers([])
    setAllChannelsList(['lobby'])
    setIsAuthPass(false)
    setIsLoading(false)
    setUname('')
    setInpSysUsername('')
    setInpSysPassword('')
    localStorage.clear()
    sessionStorage.clear()
    ref.current = false
  }

  const getRemains = async (): Promise<void> => {
    const remains: AxiosResponse = await axios.get(`${server}/adsysop/remains`, { withCredentials: true })
    localStorage.setItem('remains', remains.data)
    setAttempRemains(remains.data)
  }

  const handleVerifyAccess = async (): Promise<void> => {
    if (attempRemains <= 0) {
      return document.getElementById('submitAso')?.remove()
    }

    // authenticate
    await axios.post(`${server}/adsysop`, { username: inpSysUsername, password: inpSysPassword }, { withCredentials: true })
      .then(res => {
        if (res.data.valid) {
          setIsAuthPass(res.data.valid)
          setIsLoading(false)
          sessionStorage.setItem('username', res.data.username)
          setUname(res.data.username)
          setCurrChannel('lobby')
          navigate(`/adsysop/${res.data.username}`)
        }
      })
      .catch(err => {
        reset()
        withReactContent(Swal).fire(err.response.data.error ?? err.response.data)
        getRemains()
      })
  }

  const searchingUser = (data: string): void => {
    const resultSearching: DashboardUsers[] = allUsers.filter(userObj => userObj.username.toLowerCase().includes(data))
    setResultSearchUser(resultSearching)
  }

  const listUsersPerPage = (list: DashboardUsers[], itemPerPage: number): void => {
    if (list.length === 0) return
    const start: number = (currPage - 1) * itemPerPage
    const end: number = start + itemPerPage

    const usersPages: DashboardUsers[] = list.slice(start, end)
    setUsersPagination(usersPages)
  }

  const fetchData = async (): Promise<void> => {
    try {
      // authenticate to request data
      await axios.get(`${server}/adsysop/data/${username ?? uname}`, { withCredentials: true })
        .then(async res => {
          // setAllUsers(testUsers)
          setAllUsers(res.data.response)

          // listUsersPerPage(testUsers, 15)
          listUsersPerPage(res.data.response, 15)

          setRequestReports(res.data.reports)
        })
        .catch(err => {
          navigate('/adsysop')
          reset()
          withReactContent(Swal).fire(err.response.data.error)
        })

      const reportDatas = await axios.get(`${server}/adsysop/reports/${username || uname}`, { withCredentials: true })
      setReportDatas(reportDatas.data.reports)

      const response: AxiosResponse = await axios.get(`${server}/channels`, { withCredentials: true })
      setAllChannelsList([...allChannelsList, ...response.data])
    } catch (err) {
      throw err
    }
  }

  const renderTableRow = (data: DashboardUsers[]): JSX.Element[] => {
    return (
      data.map((user, index) => {
        const lastActive = (user.lastActive || user.updatedAt).split('T')
        return (
          <tr key={index}>
            <td>{user.username}</td>
            <td data-username={user.username}>Offline</td>
            <td>
              <div>{lastActive[0]}</div>
              <div>{lastActive[1].slice(0, 5)}</div>
            </td>
            <td>
              <div className={`statusName ${user.status}`} data-username={user.username}>
                {user.status}
              </div>
              <ActionButtonStatus actionStatus={actionStatus} personalMessage={personalMessage} user={user} />
            </td>
          </tr>
        )
      })
    )
  }


  const nextPrevPage = async (e: MouseEvent): Promise<void> => {
    e.stopPropagation()
    const dir: number = await Number((e.currentTarget as HTMLButtonElement).value)
    if (currPage + dir < 1 || currPage + dir > Math.ceil(allUsers.length / usersPerPage)) return
    setCurrPage(prevValue => prevValue + dir)
  }

  const logoutDashboard = async (): Promise<void> => {
    await axios.delete(`${server}/adsysop`, { withCredentials: true })
      .then(() => {
        socket.emit('logout', username, sessionStorage.getItem('skid'), sessionStorage.getItem('channel'))
        reset()
        socket.disconnect()
        navigate('/adsysop')
      })
  }

  const personalMessage = (e: MouseEvent, user: DashboardUsers): void => {
    const sender: string | undefined = username ?? uname
    const receiver: string = user.username

    console.log(sender, receiver)
  }

  const actionStatus = async (e: MouseEvent, user: DashboardUsers, statusNum: string): Promise<void> => {
    const btn = (e.currentTarget as HTMLElement)

    const statusName: string | null = btn.getAttribute('name')

    const qryUser = (document.querySelector(`td>div.statusName[data-username="${user.username}"]`) as HTMLElement)

    await axios.post(`${server}/adsysop/updateStatus`, { admin: username ?? uname, statusName: statusName, user: user }, { withCredentials: true })
      .then(() => {
        qryUser.nextElementSibling?.querySelector('.actionStatusBtn.active')?.classList.remove('active')
        qryUser.classList.remove('normal')
        qryUser.classList.remove('warning')
        qryUser.classList.remove('banned')
        qryUser.classList.add(statusName!)
        qryUser.innerText = statusName!
        btn.classList.add('active')
      })
      .catch(err => {
        withReactContent(Swal).fire(err)
      })
  }

  const joinChannel = (e: ChangeEvent): void => {
    const channelJoinTo: string = (e.currentTarget as HTMLSelectElement).value
    socket.emit('joinChannel', [currChannel, channelJoinTo, username ?? uname])
    setCurrChannel(channelJoinTo)
    sessionStorage.setItem('channel', channelJoinTo)
    setJoinNewChannel(true)
  }

  // when refresh page check authorize
  const verify = async (): Promise<void> => {
    if (!ref.current) {
      ref.current = true
      await axios.get(`${server}/adsysop/verify/${username || uname}`, { withCredentials: true })
        .then(res => {
          sessionStorage.setItem('channel', 'lobby')
          setIsAuthPass(res.data.valid)
          setIsLoading(false)
          fetchData()
        })
        .catch(err => {
          reset()
          navigate('/adsysop')
        })
    }
  }

  const sortTable = (e: MouseEvent | TouchEvent): void => {
    let table, rows, switching, i, x, y, shouldSwitch, col
    col = (e.currentTarget! as HTMLButtonElement).name

    table = document.getElementById("tbOp")
    switching = true

    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
      //start by saying: no switching is done:
      switching = false
      rows = (table! as HTMLTableElement).rows
      /*Loop through all table rows (except the
        first, which contains table headers):*/
      for (i = 2; i < (rows.length - 1); i++) {
        //start by saying there should be no switching:
        shouldSwitch = false
        /*Get the two elements you want to compare,
        one from current row and one from the next:*/
        x = rows[i].getElementsByTagName("TD")[col === 'username' ? 0 : 1]
        y = rows[i + 1].getElementsByTagName("TD")[col === 'username' ? 0 : 1]
        //check if the two rows should switch place:
        if (!sortedAsc) {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            //if so, mark as a switch and break the loop:
            shouldSwitch = true
            break
          }
        } else {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            //if so, mark as a switch and break the loop:
            shouldSwitch = true
            break
          }
        }
      }
      if (!sortedAsc) {
        setSortedAsc(true)
      } else {
        setSortedAsc(false)
      }

      if (shouldSwitch) {
        /*If a switch has been marked, make the switch
        and mark that a switch has been done:*/
        rows[i].parentNode!.insertBefore(rows[i + 1], rows[i])
        switching = true
      }
    }
  }

  const getReports = (): void => {
    if (!isReportManageOpen) {
      setIsReportManageOpen(true)
    } else {
      setIsReportManageOpen(false)
    }
  }

  const updateReports = async (e: MouseEvent | TouchEvent, status: string): Promise<void> => {
    const { idx, currStatus, ticket } = (e.currentTarget as HTMLElement).dataset
    await axios.post(`${server}/adsysop/reports/${username || uname}/${ticket}/${status}`, {}, { withCredentials: true })
      .then(res => {
        if (res.data.error) {
          withReactContent(Swal).fire(res.data.error)
          return
        }
        const updateReportDatas = [...reportDatas]
        updateReportDatas[Number(idx)].status = status

        setReportDatas(updateReportDatas)
      })
      .catch(err => {
        withReactContent(Swal).fire(err.response.data.error)
      })
  }


  const deleteTicket = async (e: MouseEvent | TouchEvent): Promise<void> => {
    const { ticket, currStatus } = (e.currentTarget as HTMLButtonElement).dataset
    await axios.delete(`${server}/adsysop/reports/${username || uname}/${ticket}/${currStatus}`, { withCredentials: true })
      .then(res => {
        if (res.data.error) {
          withReactContent(Swal).fire(res.data.error)
          return
        }
        document.querySelector(`.ticketItem[data-ticket="${ticket}"]`)?.remove()
        setRequestReports(tk => tk.filter(t => t.ticket !== ticket))
      })
      .catch(err => {
        withReactContent(Swal).fire(err.response.data.error)
      })
  }

  useEffect(() => {
    getRemains()

    socket.on('usersOnline', (usersOnline: string[]) => {
      setCountUsersOnline(usersOnline.length)
    })

    const isMobileSupported: boolean = /android|iphone|kindle|ipad/i.test(navigator.userAgent)
    setIsMobileDevice(isMobileSupported)
  }, [])

  useEffect(() => {
    socket.on('usersJoinedChannel', (data: string[], isLogout: boolean) => {
      const elem = (document.querySelector(`td[data-username="${data[2]}"]`) as HTMLElement)
      if (elem) {
        if (isLogout) {
          elem.innerText = 'Offline'
        } else {
          elem.innerText = data[1]
        }
      }
    })
  }, [])

  useEffect(() => {
    if (!username || username === 'undefined' || username === 'null') {
      window.history.pushState(null, '', uname)
    }

    if (username ?? uname) {
      verify()
      socket.emit('toD')
    } else {
      setIsLoading(false)
    }
  }, [username, uname])

  useEffect(() => {
    document.body.style.transition = 'background-color ease .3s'
    if (themeSwitch === '') {
      document.body.style.background = '#333'
    } else if (themeSwitch === 'light') {
      document.body.style.background = '#ddd'
    }
  }, [themeSwitch])

  useEffect(() => {
    searchingUser(inpSearchUser)
  }, [inpSearchUser])

  return (
    <>
      {
        isLoading ?
          <div className='w-100 h-vh-100 d-flex justify-content-center align-items-center'>
            <div style={{ 'color': 'white', 'fontSize': '2em', 'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center' }}>Loading&nbsp;{<Loader />}</div>
          </div>
          :
          !isAuthPass ?
            <div className='container'>
              <div className='row justify-content-center align-items-center h-vh-100'>
                <div className='col-12 col-md-6 col-lg-5'>
                  <Switch name='themeDarkLight' id='themeDarkLight' className='themeDarkLight' offValue='light' onValue='dark' setThemeSwitch={setThemeSwitch} />
                  <div id='formAccess' className={themeSwitch}>
                    <Form action='#' method='POST' className='loginFormAso p-15 p-md-20' id='loginFormAso' head='ASO' headClass='titleHead' subHead='Administrator system operation' subHeadClass='subHead' target='_self' autoComplete='off'>
                      <Input type='text' name='sysUsername' id='sysUsername' className='sysInput' onChange={e => getInputValue(e, setInpSysUsername)} placeHolder='Username' value={inpSysUsername} />
                      <div className='inpPassAso'>
                        <Input type='password' name='sysPassword' id='sysPassword' className='sysInput' onChange={e => getInputValue(e, setInpSysPassword)} placeHolder='Password' value={inpSysPassword} />
                        {
                          errorBox[0] ?
                            <div className={`errorBox ${errorBox[0] ? 'active' : ''}`}>{errorBox[0]}</div>
                            :
                            <></>
                        }
                      </div>
                      <div className='d-flex justify-content-between align-items-center'>
                        <Button type='button' name='submitAso' id='submitAso' className='submitAso' innerText='Login' disabled={inpSysPassword.length >= 3 ? false : true} onClick={handleVerifyAccess} />
                        <div id='attempRemains'>
                          <span data-remain={attempRemains}>{attempRemains}</span>
                          <span>/3</span>
                        </div>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
            :
            <div className='container'>
              <div className='row'>
                <div className='col-12'>
                  <nav className='d-flex justify-content-between align-items-center w-100 py-10'>
                    <h3>Welcome <b>{(username ?? uname)[0].toUpperCase() + (username ?? uname).slice(1,)}</b></h3>
                    <Switch name='themeDarkLight' id='themeDarkLight' className='themeDarkLight' offValue='light' onValue='dark' setThemeSwitch={setThemeSwitch} />
                    <Button type='button' name='logoutDashboard' id='logoutDashboard' className='logoutDashboard' innerText='fa fa-power-off' useIconFA={true} onClick={logoutDashboard} />
                  </nav>
                  <main id='mainDashboard'>
                    {
                      isReportManageOpen ?
                        <ReportManage reportDatas={reportDatas} onClick={getReports} draggable={false} updateReports={updateReports} deleteTicket={deleteTicket} />
                        :
                        <></>
                    }
                    <div className='row'>
                      <div className='col-12 col-sm-6 col-lg-3 my-10'>
                        <BoardBox title='Total channels' value={allChannelsList.length} iconFa='fa fa-globe' className='noc' />
                      </div>
                      <div className='col-12 col-sm-6 col-lg-3 my-10'>
                        <BoardBox title='Total users' value={allUsers.length} iconFa='fa fa-users' className='nou' />
                      </div>
                      <div className='col-12 col-sm-6 col-lg-3 my-10'>
                        <BoardBox title='Users online' value={countUsersOnline} iconFa='fa fa-feed' className='uso' />
                      </div>
                      <div className='col-12 col-sm-6 col-lg-3 my-10'>
                        <BoardBox title='Reports (click to open)' value={requestReports.length} iconFa='fa fa-flag' className='rpt' onClick={getReports} />
                      </div>
                      <div className='col-12 col-md-7 my-10'>
                        <Pagination allUsers={allUsers} currPage={currPage} setCurrPage={setCurrPage} usersPerPage={usersPerPage} listUsersPerPage={listUsersPerPage} nextPrevPage={nextPrevPage} />
                        <div className='tableWrapper'>
                          <table id='tbOp'>
                            <thead>
                              <tr>
                                <th scope='col'>
                                  Name
                                  <Button type='button' name='username' id='ascdesNameBtn' className='ascdesBtn' innerText='fa fa-sort' useIconFA={true} onClick={sortTable} />
                                </th>
                                <th scope='col'>
                                  Channel
                                  <Button type='button' name='channel' id='ascdesNameBtn' className='ascdesBtn' innerText='fa fa-sort' useIconFA={true} onClick={sortTable} />
                                </th>
                                <th scope='col'>Last active</th>
                                <th scope='col'>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td colSpan={5}>
                                  <div className='d-flex justify-content-between align-items-center'>
                                    <div className='listsPerPage' id='listsPerPage'>
                                      <select defaultValue={15} style={{ 'padding': '5px' }} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUsersPerPage(Number(e.target.value))}>
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="15">15</option>
                                        <option value="20">20</option>
                                      </select>
                                      <span>per page</span>
                                    </div>
                                    <Input type='text' name='searchUser' id='searchUser' className='inpValueSearch' value={inpSearchUser} placeHolder='Search user' onChange={e => getInputValue(e, setInpSearchUser)} />
                                  </div>
                                </td>
                              </tr>
                              {
                                inpSearchUser.length > 0 ?
                                  resultSearchUser && resultSearchUser.length > 0 ?
                                    renderTableRow(resultSearchUser)
                                    :
                                    <tr>
                                      <td colSpan={5}>Not found</td>
                                    </tr>
                                  :
                                  usersPagination && usersPagination.length > 0 ?
                                    renderTableRow(usersPagination)
                                    :
                                    <tr>
                                      <td colSpan={5}>No one else</td>
                                    </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                        <Pagination allUsers={allUsers} currPage={currPage} setCurrPage={setCurrPage} usersPerPage={usersPerPage} listUsersPerPage={listUsersPerPage} nextPrevPage={nextPrevPage} />
                      </div>
                      <div className='col-12 col-md-5 my-10'>
                        <select name="channelSelect" id="channelSelect" className='channelSelect' style={{ 'width': '100%' }} defaultValue='lobby' onChange={(e: React.ChangeEvent<HTMLSelectElement>) => joinChannel(e)} >
                          {
                            allChannelsList && allChannelsList.length > 0 ?
                              allChannelsList.map((name: string, i: number) => {
                                return (
                                  <option value={name} className='optionRoom' key={i}>#{name}</option>
                                )
                              })
                              :
                              <></>
                          }
                        </select>
                        <Chat socket={socket} id='dashboardChat' rid={null} joinNewChannel={joinNewChannel} currChannel={currChannel} isMobileDevice={isMobileDevice} autoFocus={false} />
                      </div>
                    </div>
                  </main>
                </div>
              </div >
            </div >
      }
    </>
  )
}

export default LoginDashboard