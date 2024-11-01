import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import './dist/HelpDeskPage.css'
import { Params, useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Input from '../../Components/Input/Input'
import { getInputValue } from '../../utils/getInputValue'
import { reportBubbleTypes } from '../../types'
import ReportTicketItems from './ReportTicketItems'
import Button from '../../Components/Button/Button'

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' // or use your specific production check
const protocol = isProduction ? 'https://' : 'http://'
const server = `${protocol}${window.location.hostname}:8080`

interface Props { }

const HelpDeskPage = (props: Props) => {
  const initialized = useRef(false)
  const navigatate = useNavigate()
  const params: Readonly<Params<string>> = useParams()

  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false)
  const [isAuthen, setIsAuthen] = useState<boolean>(false)
  const [inpSearchTicket, setInpSearchTicket] = useState<string>('')
  const [searchTicketResult, setSearchTicketResult] = useState<reportBubbleTypes[]>([])
  const [currFilter, setCurrFilter] = useState<string>('')
  const [filtersReporter, setFiltersReporter] = useState<reportBubbleTypes[]>([])
  const [ticketDatas, setTicketDatas] = useState<reportBubbleTypes[]>([])

  const getReports = async (ticket: string | undefined = undefined): Promise<void> => {
    await axios.get(`${ticket ? `${server}/reports/${ticket}` : `${server}/reports`}`, { headers: { username: params.username }, withCredentials: true })
      .then(res => {
        setTicketDatas(res.data.reportDatas)
      })
  }

  const toggleCollapsible = (e: React.MouseEvent | React.TouchEvent): void => {
    const elem = (e.currentTarget as HTMLElement)
    const collapsibleBtn = elem.children[0].children[2]
    const contentTicket = elem.children[1] as HTMLElement
    const contentTicketHeight = ((contentTicket.children[0] as HTMLElement).offsetHeight + 10) * contentTicket.children.length

    if (collapsibleBtn.classList.contains('fa-angle-down')) {
      collapsibleBtn.classList.remove('fa-angle-down')
      collapsibleBtn.classList.add('fa-angle-up')
      elem.classList.add('active')
      contentTicket.style.height = Math.min(contentTicketHeight, 200) + 'px'
      { (elem.children[0] as HTMLElement).style.marginBottom = '10px' }
    } else {
      collapsibleBtn.classList.remove('fa-angle-up')
      collapsibleBtn.classList.add('fa-angle-down')
      elem.classList.remove('active')
      contentTicket.style.height = '0px'
      setTimeout(() => {
        { (elem.children[0] as HTMLElement).style.marginBottom = '' }
      }, 300)
    }
  }

  const handleSearchingTicket = (data: string): void => {
    let resultSearching: reportBubbleTypes[] = []
    resultSearching = ticketDatas.filter(ticket => (ticket.ticket?.toLowerCase())!.includes(data))
    setSearchTicketResult(resultSearching)
  }

  const handleFilterTicket = (e: ChangeEvent) => {
    const value: string = (e.target as HTMLInputElement).value

    let result: reportBubbleTypes[] = []
    document.querySelector('.labelFilterTickets.active')?.classList.remove('active')
    if (value === params.username) {
      ((e.target as HTMLInputElement).nextElementSibling as HTMLElement).classList.add('active')
      setCurrFilter('filterYoursTickets')
      result = ticketDatas.filter(data => data.reporter === (e.target as HTMLInputElement).value)
    } else {
      ((e.target as HTMLInputElement).nextElementSibling as HTMLElement).classList.add('active')
      setCurrFilter('filterOthersTickets')
      result = ticketDatas.filter(data => data.reporter !== params.username)
    }
    setFiltersReporter(result)
  }

  const clearFilterSearch = (): void => {
    setFiltersReporter([])
    setSearchTicketResult([])
    setInpSearchTicket('')
    if (document.querySelector('.labelFilterTickets.active')) {
      { (document.getElementById(currFilter) as HTMLInputElement)!.checked = false }
      { document.querySelector('.labelFilterTickets.active')?.classList.remove('active') }
    }
  }

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true

      // check authenticate
      axios.get(`${server}/auth/token/${params.username}`, { withCredentials: true })
        .then(verified => {
          if (verified.data.valid) {
            setIsAuthen(verified.data.valid)

            const isMobileSupported: boolean = /android|iphone|kindle|ipad/i.test(navigator.userAgent)
            setIsMobileDevice(isMobileSupported)

            getReports()

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
    handleSearchingTicket(inpSearchTicket)
  }, [inpSearchTicket])

  return (
    <>
      {
        isAuthen ?
          <div className='container'>
            <div className='row'>
              <div className='col-12'>
                <nav className='d-flex justify-content-between align-items-start align-items-md-center my-20'>
                  <header>
                    <h1>REPORT <i className='fa fa-ticket'></i></h1>
                    <div>ticket manager</div>
                  </header>
                  <Link to={`/lomwong/${params.username}/lobby`} className='linkBackChat mt-md-0 d-flex justify-content-end align-items-center'>
                    <i className='fa fa-home'></i>
                    <span className='d-none d-md-inline'>Back to chat</span>
                  </Link>
                </nav>
              </div>
              <div className='col-12'>
                <div className='row mb-15'>
                  <div className='col-6 col-sm-3'>
                    <div className='filterTicketsWrapper'>
                      <Input type='radio' name='filterTickets' value={params.username} id='filterYoursTickets' className='inpFilterTickets' useLabel={true} labelText='Yours tickets report' labelClass='labelFilterTickets' onChange={handleFilterTicket} />
                    </div>
                  </div>
                  <div className='col-6 col-sm-3'>
                    <div className='filterTicketsWrapper'>
                      <Input type='radio' name='filterTickets' value='other' id='filterOthersTickets' className='inpFilterTickets' useLabel={true} labelText='Others tickets report' labelClass='labelFilterTickets' onChange={handleFilterTicket} />
                    </div>
                  </div>
                  <div className='col-12 col-sm-5'>
                    <Input type='text' name='inpSearchTicket' id='inpSearchTicket' onChange={e => getInputValue(e, setInpSearchTicket)} value={inpSearchTicket} placeHolder='Search Ticket' />
                  </div>
                  <div className='col-6 col-sm-1'>
                    <div className='filterTicketsWrapper'>
                      <Button type='button' name='clearFilterSearch' id='clearFilterSearch' className='clearFilterSearch' innerText='fa fa-close' useIconFA={true} onClick={clearFilterSearch} />
                    </div>
                  </div>
                </div>
                <div className='ticketsList row'>
                  <ReportTicketItems tickets={filtersReporter.length > 0 ? filtersReporter : searchTicketResult.length > 0 ? searchTicketResult : searchTicketResult.length === 0 && inpSearchTicket.length > 0 ? [] : ticketDatas} onClick={toggleCollapsible} />
                </div>
              </div>
            </div>
          </div>
          :
          <></>
      }
    </>
  )
}

export default HelpDeskPage