import React from 'react'
import './dist/Loader.css'

type Props = {}

const Loader = (props: Props) => {
  return (
    <div className='loader'>
      <div className='dot'></div>
      <div className='dot'></div>
      <div className='dot'></div>
    </div>
  )
}

export default Loader