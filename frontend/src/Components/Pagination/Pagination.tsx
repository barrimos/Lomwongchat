import React, { Dispatch, MouseEventHandler, SetStateAction, useEffect, useState } from 'react'
import Button from '../Button/Button'
import { DashboardUsers } from '../../types'

interface Props {
  allUsers: DashboardUsers[]
  usersPerPage: number
  currPage: number
  setCurrPage: Dispatch<SetStateAction<number>>
  listUsersPerPage: (lists: DashboardUsers[], itemPerPage: number) => void
  nextPrevPage: (e: MouseEvent) => void
}

const Pagination = ({ allUsers, usersPerPage, currPage, setCurrPage, listUsersPerPage, nextPrevPage }: Props) => {

  const handleSelectPageNum = (e: React.MouseEvent) => {
    const page: number = Number((e.target as HTMLDivElement).dataset.page)
    setCurrPage(page)
  }

  const pageNumbers: number[] = []

  for (let i: number = 1; i <= Math.ceil(allUsers.length / usersPerPage); i++) {
    pageNumbers.push(i)
  }

  useEffect(() => {
    // reset current page to first when changes usersPerPage
    setCurrPage(1)
  }, [usersPerPage])

  useEffect(() => {
    listUsersPerPage(allUsers, usersPerPage)
  }, [currPage, usersPerPage])

  return (
    <div id='paginationUserDashboard' className='d-flex justify-content-center align-items-center'>
      <Button type='button' name='prevPage' id='prevPage' className='prevPage' value={-1} innerText='fa fa-arrow-left' useIconFA={true} onClick={nextPrevPage} />
      <div className='d-flex justify-content-center align-items-center ml-20 mr-20'>
        {
          pageNumbers.map((number: number, i: number) => {
            return (
              <div key={i} className={`paginationNum ${currPage === number ? 'active' : ''}`} data-page={number} onClick={(e: React.MouseEvent) => handleSelectPageNum(e)}>{number}</div>
            )
          })
        }
      </div>
      <Button type='button' name='nextPage' id='nextPage' className='nextPage' value={1} innerText='fa fa-arrow-right' useIconFA={true} onClick={nextPrevPage} />
    </div>
  )
}

export default Pagination