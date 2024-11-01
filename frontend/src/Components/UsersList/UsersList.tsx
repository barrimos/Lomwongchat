import React from 'react'
import { useParams } from 'react-router-dom'

interface Props {
  usersOnline: string[]
}

const UsersList = ({ usersOnline }: Props): JSX.Element => {
  const { username } = useParams()

  return (
    <>
      {
        usersOnline && usersOnline.length > 0 ?
          usersOnline.map((user: string, i: number): JSX.Element => {
            return (
              <li key={i} className={`listsUsers ${username === user ? 'order-0 you' : 'order-1'}`} data-receiver={user} data-is-open={false}>
                <span>{user}{username === user ? ' (you)' : ''}</span>
                {
                  username !== user ?
                    <i className='fa fa-circle-o' data-is-online={true}></i>
                    :
                    <></>
                }
              </li>
            )
          })
          :
          <span className='empty'>No one else</span>
      }
    </>
  )
}

export default UsersList