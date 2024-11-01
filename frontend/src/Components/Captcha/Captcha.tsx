import React, { useEffect, useState } from 'react'
import Button from '../Button/Button'
import Input from '../Input/Input'
import { captchaTypes } from '../../types'
import { randomCharacter } from '../../utils/randomCharacter'
import { getInputValue } from '../../utils/getInputValue'


const Captcha = ({
  value,
  useLabel,
  reNewCaptcha,
  inputCaptcha,
  setInputCaptcha,
  setReNewCaptcha,
  reCaptcha,
  readCaptcha,
  setCanvas,
  setCurrCaptcha,
  setStatusVerified
}: captchaTypes): JSX.Element => {

  const drawCaptcha = (text: string, canvas: HTMLCanvasElement): void => {
    let ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#f3f3f3'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      addNoise(canvas, ctx)
      ctx.fillStyle = '#fff'
      ctx.font = '35px Arial'

      // Calculate the width of text and start position
      const textWidth = ctx.measureText(text).width
      const startX = (canvas.width - textWidth) / 5

      // Adding rotation and distortion
      for (let i = 0; i < text.length; i++) {
        ctx.save()
        // Addjust startX for each char
        ctx.translate(startX + i * 30, 30)
        ctx.rotate((Math.random() - 0.5) * 0.4)
        ctx.fillText(text[i], 0, 0)
        ctx.restore()
      }

      canvas.setAttribute('alt', text)
    }
  }

  const addNoise = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    for (let i = 0; i < pixels.length; i += 1) {
      // Random noise color
      let color = (Math.random() > 0.3) ? 220 : 0
      pixels[i] = pixels[i + 1] = pixels[i + 5] = color
    }
    ctx.putImageData(imageData, 0, 0)
  }

  const handleStatusOnFocus = (e: any) => {
    setStatusVerified('')
  }



  useEffect(() => {
    let captcha: string = randomCharacter(6)

    // for test
    // setInputCaptcha(captcha)

    const canvasElement = document.getElementById('captchaText') as HTMLCanvasElement
    setCanvas(canvasElement)
    drawCaptcha(captcha, canvasElement)
    setCurrCaptcha(captcha)
    setReNewCaptcha(false)
  }, [reNewCaptcha])


  return (
    <>
      {useLabel ?
        <label htmlFor='captcha'>Enter CAPTCHA</label>
        :
        ''
      }
      <div className='captchaWrapper'>
        <canvas id='captchaText' height='40'></canvas>
        <div className='accessibilityWrapper'>
          <Button onClick={reCaptcha} type='button' className='accessibility' name='recaptcha' id='recaptcha' innerText='&#8635;' />
          <Button onClick={readCaptcha} type='button' className='accessibility' name='readcaptcha' id='readcaptcha' innerText='&#128362;' />
        </div>
      </div>
      <div className='inputWrapper'>
        <Input onChange={e => getInputValue(e, setInputCaptcha)} onFocus={handleStatusOnFocus} type='text' name='captcha' id='captcha' value={inputCaptcha ?? value} className='inp' placeHolder='Enter Captcha' useLabel={false} labelText='' labelId='' labelClass='' required={true} />
      </div>
    </>
  )
}


export default Captcha