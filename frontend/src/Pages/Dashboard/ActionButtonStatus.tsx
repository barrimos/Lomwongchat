import React from 'react'
import Button from '../../Components/Button/Button'
import { DashboardUsers } from '../../types'

interface Props {
  actionStatus: (e: MouseEvent, user: DashboardUsers, statusNum: string) => void
  personalMessage: (e: MouseEvent, user: DashboardUsers) => void
  user: DashboardUsers
}

const ActionButtonStatus = ({ actionStatus, personalMessage, user }: Props) => {
  return (
    <div className='actionBtns'>
      <Button type='button' name='normal' id='actionStatusNormal' className={`actionStatusBtn ${user.status === 'normal' ? 'active' : '' } normal`} innerText='fa fa-check-circle-o' useIconFA={true} onClick={(e: MouseEvent) => actionStatus(e, user, '301')} />
      <Button type='button' name='warning' id='actionStatusWarning' className={`actionStatusBtn ${user.status === 'warning' ? 'active' : '' } warning`} innerText='fa fa-warning' useIconFA={true} onClick={(e: MouseEvent) => actionStatus(e, user, '400')} />
      <Button type='button' name='banned' id='actionStatusBanned' className={`actionStatusBtn ${user.status === 'banned' ? 'active' : '' } banned`} innerText='fa fa-ban' useIconFA={true} onClick={(e: MouseEvent) => actionStatus(e, user, '401')} />
      <Button type='button' name='pm' id='actionStatusPM' className={`actionStatusBtn pm`} data-pm={false} innerText='fa fa-commenting-o' useIconFA={true} onClick={(e: MouseEvent) => personalMessage(e, user)} />
    </div>
  )
}

export default ActionButtonStatus