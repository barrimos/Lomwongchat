import React, { useState, useEffect } from 'react'
import { buttonTypes } from '../../types'

const Button = ({ type, name, value, id, className, innerText, onClick, useIconFA, disabled, children, attr }: buttonTypes): JSX.Element => {
  return (
    <button type={type}
      name={name}
      value={value}
      id={id}
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...(attr && attr.reduce((acc, obj) => ({ ...acc, ...obj }), {}))}
    >
      {
        useIconFA ?
          <i className={innerText}></i>
          :
          <>
            {
              innerText ?
               innerText
               :
               children
            }
          </>
      }
    </button>
  )
}

export default Button