import React, { ChangeEvent, useEffect, useState } from 'react'
import Modal from '../../Components/Modal/Modal'
import { reportBubbleTypes } from '../../types'
import Input from '../../Components/Input/Input'
import { getInputValue } from '../../utils/getInputValue'
import Button from '../../Components/Button/Button'


interface Props {
  reportDatas: reportBubbleTypes[]
  onClick: (e: MouseEvent | TouchEvent) => void
  draggable: boolean
  updateReports: (e: MouseEvent | TouchEvent, status: string) => void
  deleteTicket: (e: MouseEvent | TouchEvent) => void
}

const ReportManage = ({ reportDatas, onClick, draggable, updateReports, deleteTicket }: Props) => {

  const [showReports, setShowReports] = useState<reportBubbleTypes[]>(reportDatas)
  const [currFilter, setCurrFilter] = useState<string | null>(null)
  const [inpSearchReportTicket, setInpSearchReportTicket] = useState<string>('')

  const searchTicket = (data: string) => {
    if (data.length <= 0) {
      setShowReports(reportDatas)
    } else {
      const result: reportBubbleTypes[] = showReports.filter(report => (report.ticket?.toLowerCase())?.includes(data))
      setShowReports(result)
    }
  }

  const filterOpenClosedTickets = (e: ChangeEvent) => {
    const targetRadio = (e.target as HTMLInputElement).value

    if (currFilter && (targetRadio === currFilter)) {
      return
    }

    let result: reportBubbleTypes[] = []

    { document.querySelector(`.labelForRadioFilterTickets.active`)?.classList.remove('active') }

    if (targetRadio === 'openTickets') {
      result = reportDatas.filter(report => (report.status === 'open'))
    } else if (targetRadio === 'closedTickets') {
      result = reportDatas.filter(report => (report.status === 'closed'))
    } else if (targetRadio === 'queueTickets') {
      result = reportDatas.filter(report => (report.status === 'queue'))
    }
    setShowReports(result)
    { ((e.target as HTMLInputElement).nextElementSibling as HTMLElement).classList.add('active') }

    setCurrFilter(targetRadio)
  }

  const clearFilterTickets = () => {
    setShowReports(reportDatas)
    setCurrFilter(null)
    if (document.querySelector('.labelForRadioFilterTickets.active')) {
      { (document.getElementById(currFilter!) as HTMLInputElement)!.checked = false }
      { document.querySelector('.labelForRadioFilterTickets.active')?.classList.remove('active') }
    }
  }

  const closeTerminateReportBtn = (e: MouseEvent | TouchEvent): void => {
    const reportStatus = (e.currentTarget as HTMLButtonElement).dataset.currStatus

    if (reportStatus === 'open') {
      const confirm: boolean = window.confirm('Are you sure for terminate this report ?')
      if (confirm) {
        updateReports(e, 'closed')
      } else {
        return
      }
    }
  }

  const openReportsBtn = (e: MouseEvent | TouchEvent): void => {
    updateReports(e, 'open')
  }

  useEffect(() => {
    searchTicket(inpSearchReportTicket)
  }, [inpSearchReportTicket])

  return (
    <Modal title='Reports' className='reportDashboard' subtitle={`Total reports: ${reportDatas.length}`} handleCloseModal={onClick} attr={[{ 'data-draggable': `${draggable}` }]}>
      <Input type='text' name='searchReportsTicket' id='searchReportsTicket' className='searchReportsTicket' value={inpSearchReportTicket} placeHolder='Search ticket' onChange={e => getInputValue(e, setInpSearchReportTicket)} />
      <div className='d-flex justify-content-start align-items-center'>
        <div className='radioFilterTicketsWrapper'>
          <Input type='radio' name='radioFilterTickets' id='queueTickets' className='radioFilterTickets' value='queueTickets' useLabel={true} labelText='Queue' labelClass='labelForRadioFilterTickets' onChange={filterOpenClosedTickets} />
        </div>
        <div className='radioFilterTicketsWrapper'>
          <Input type='radio' name='radioFilterTickets' id='openTickets' className='radioFilterTickets' value='openTickets' useLabel={true} labelText='Open' labelClass='labelForRadioFilterTickets' onChange={filterOpenClosedTickets} />
        </div>
        <div className='radioFilterTicketsWrapper'>
          <Input type='radio' name='radioFilterTickets' id='closedTickets' className='radioFilterTickets' value='closedTickets' useLabel={true} labelText='Closed' labelClass='labelForRadioFilterTickets' onChange={filterOpenClosedTickets} />
        </div>
        <Button type='button' name='clearFilterTickets' id='clearFilterTickets' innerText='Clear' onClick={clearFilterTickets} />
      </div>
      {
        showReports && showReports.length > 0 ?
          showReports.map((data: reportBubbleTypes, i: number) => {
            return (
              <div key={i} className='ticketItem' data-ticket={data.ticket}>
                <div className='d-flex justify-content-between align-items-center'>
                  <h3 className='ticketSN'><span className={`reportStatus ${data.status}`} data-status={data.status}>{data.status}</span>{data.ticket}</h3>
                  <div>
                    <Button type='button' name='openReportBtn' id='openReportBtn' className='openReportBtn manageReport' innerText='open' onClick={openReportsBtn} attr={[{ 'data-idx': i }, { 'data-curr-status': data.status }, { 'data-ticket': data.ticket }]} disabled={data.status === 'queue' ? false : true} />
                    <Button type='button' name='terminateReportBtn' id='terminateReportBtn' className='terminateReportBtn manageReport' innerText='Terminate' onClick={closeTerminateReportBtn} attr={[{ 'data-idx': i }, { 'data-curr-status': data.status }, { 'data-ticket': data.ticket }]} disabled={data.status === 'open' ? false : true} />
                    {
                      data.status === 'closed' ?
                        <Button type='button' name='deleteTicketBtn' id='deleteTicketBtn' className='deleteTicketBtn manageReport' attr={[{ 'data-ticket': data.ticket }, { 'data-curr-status': data.status }]} innerText='Delete' onClick={deleteTicket} />
                        :
                        <></>
                    }
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <td>Report date</td>
                      <td>Reporter</td>
                      <td>Defendant</td>
                      <td>Id message</td>
                      <td>Message</td>
                      <td>Time message</td>
                      <td>Channel</td>
                      <td>Detail</td>
                      <td>Replies to id message</td>
                      <td>Replies to user</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{`${new Date(`${data.createdAt}`)}` || '-'}</td>
                      <td>{data.reporter || '-'}</td>
                      <td>{data.username || '-'}</td>
                      <td>{data.idBubble || '-'}</td>
                      <td>{data.message || '-'}</td>
                      <td>{`${new Date(`${data.timeMessage}`)}` || '-'}</td>
                      <td>{data.channel || '-'}</td>
                      <td>{data.details || '-'}</td>
                      <td>{data.replies[0] || '-'}</td>
                      <td>{data.replies[1] || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          })
          :
          <div className='empty'>
            No ticket found
          </div>
      }
    </Modal>
  )
}

export default ReportManage