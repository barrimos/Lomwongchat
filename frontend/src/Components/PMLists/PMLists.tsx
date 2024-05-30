import React from 'react'

interface Props {
  listPM: string[]
  clearPM: (e: React.MouseEvent | React.TouchEvent) => void
}

const PMLists = ({ listPM, clearPM }: Props) => {
  return (
    <>
      {
        listPM && listPM.length > 0 ?
          listPM.map((name: string, i: number) => {
            return (
              <li className='pmListsWrapper' key={i}>
                <div className='pmName'>{name}</div>
                <i className='deletePMBtn fa fa-close' data-receiver={name} data-key-idx={i} onClick={clearPM}></i>
              </li>
            )
          })
          :
          <li className='empty'>No direct message</li>
      }
    </>
  )
}

export default PMLists