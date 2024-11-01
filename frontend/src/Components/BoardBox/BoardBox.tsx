import React, { useEffect } from 'react'

interface Props {
  className?: string
  maxHeight?: string
  iconFa: string
  title: string
  value: number | string
  titleColor?: string
  valueColor?: string
  onClick?: () => void
}

const BoardBox = ({ className, maxHeight, iconFa, title, value, titleColor, valueColor, onClick }: Props) => {
  return (
    <div className={`boardBox ${maxHeight} ${className ?? 'defaultColor'}`} onClick={onClick}>
      <div className='d-flex justify-content-center align-items-center'>
        <div className='iconBox'>
          <i className={iconFa}></i>
        </div>
        <h5 style={{ 'color': `${titleColor}` }}>{title}</h5>
      </div>
      <span style={{ 'color': `${valueColor}` }}>{value}</span>
    </div>
  )
}

export default BoardBox