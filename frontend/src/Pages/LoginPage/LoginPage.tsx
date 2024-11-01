import { useState, useEffect, useRef, ChangeEvent } from 'react'
import axios, { AxiosResponse } from 'axios'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import Input from '../../Components/Input/Input'
import Button from '../../Components/Button/Button'
import Form from '../../Components/Form/Form'
import Captcha from '../../Components/Captcha/Captcha'
import CaptchaStatus from '../../Components/Captcha/CaptchaStatus'
import './dist/LoginPage.css'
import bg from '../../img/fire.jpg'

import { getInputValue } from '../../utils/getInputValue'
import Loader from '../../Components/Loader/Loader'

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' // or use your specific production check
const protocol = isProduction ? 'https://' : 'http://'
const server = `${protocol}${window.location.hostname}:8080`

interface Prop { }

const LoginPage = (): JSX.Element => {
  const ref = useRef(false)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [checking, setChecking] = useState<boolean>(false)
  const [toggleShowHide, setToggleShowHide] = useState<boolean>(false)
  const [resultCaptcha, setResultCaptcha] = useState<boolean>(false)
  const [event, setEvent] = useState<MouseEvent>()

  const [DBUsers, setDBUsers] = useState<string[]>([])
  const [reNewCaptcha, setReNewCaptcha] = useState<boolean>(false)
  const [currCaptcha, setCurrCaptcha] = useState<string>('')
  const [statusVerfied, setStatusVerified] = useState<string>('')
  const [inputUsername, setInputUsername] = useState<string>('')
  const [inputPassword, setInputPassword] = useState<string>('')
  const [inputCaptcha, setInputCaptcha] = useState<string>('')
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  const navigate = useNavigate()

  const pattern = new RegExp(/\s+|\b^(?:.{1,2})$\b|(?:.{16,})|(?:\W{2,})|\b(\W.*?\W)\b/g)

  const resetState = () => {
    setInputUsername('')
    setInputPassword('')
    setInputCaptcha('')
    setResultCaptcha(false)
    setStatusVerified('')
    setChecking(false)
    reCaptcha()
  }

  const handleLogin = async (e: MouseEvent | undefined) => {
    if (resultCaptcha) {
      if (DBUsers.includes(inputUsername)) {
        try {
          const verified: { data: { valid: boolean, error: string } } = await axios.get(`${server}/auth/login/${inputUsername}/${inputPassword}`, { withCredentials: true })
          if (verified.data.valid) {
            sessionStorage.setItem('username', inputUsername)
            setTimeout(() => {
              navigate(`lomwong/${inputUsername}/lobby`)
            }, 1000)
          } else {
            withReactContent(Swal).fire(verified.data.error)
            resetState()
          }
        } catch (err: any) {
          withReactContent(Swal).fire(err.response.data.error)
          resetState()
        }
      } else {
        withReactContent(Swal).fire('User not found')
        resetState()
      }
    }
  }

  const handleRegistration = async (e: MouseEvent | undefined): Promise<void> => {
    if (pattern.test(inputUsername) || /\s+/g.test(inputPassword)) {
      withReactContent(Swal).fire('Username or Password is wrong condition')
      resetState()
    } else {
      if (DBUsers.includes(inputUsername)) {
        withReactContent(Swal).fire('This username is not available')
        resetState()
      } else {
        if (resultCaptcha) {
          withReactContent(Swal).fire({
            title: <i>Need to join ?</i>,
            showConfirmButton: true,
            showCancelButton: true
          })
            .then(async result => {
              if (result.isConfirmed) {
                try {
                  await axios.post(`${server}/regisUsers`, { username: inputUsername, password: inputPassword }, { withCredentials: true })
                    .then(res => {
                      withReactContent(Swal).fire({
                        title: 'Registration completed',
                        text: 'log-in again',
                        timerProgressBar: true,
                        timer: 2000,
                        showConfirmButton: true,
                      })
                      resetState()
                      fetchUsers()
                    })
                    .catch(err => {
                      withReactContent(Swal).fire({
                        title: 'Registration Error try again',
                        text: err.response.data.error
                      })
                      resetState()
                    })
                } catch (error) {
                  console.error('Error:', error)
                }
              } else {
                resetState()
              }
            })
        }
      }
    }
  }


  const verifyCaptcha = (e: MouseEvent) => {
    setEvent(e)

    if (!inputCaptcha || !inputUsername || !inputPassword) {
      return
    } else if (inputCaptcha !== currCaptcha) {
      e.preventDefault()
      setStatusVerified('incorrect')
      reCaptcha()
      return
    } else {
      e.preventDefault()
      setStatusVerified('correct')
      setChecking(true)
      setResultCaptcha(true)
    }
  }

  const reCaptcha = (): void => {
    // Add event listener for reload button
    speechSynthesis.cancel()
    setInputCaptcha('')
    setReNewCaptcha(true)
  }

  const readCaptcha = (): void => {
    if (canvas) {
      const altText: string | null = canvas.getAttribute('alt')
      const text: Array<string> = altText ? altText.split('') : []

      // initials
      let caseType: string = 'lowercase'
      let isUnicode: boolean = false

      text.forEach(c => {
        isUnicode = false || /[-&+_=?]/g.test(c)

        if (!isUnicode && c.toUpperCase().match(c) && isNaN(Number(c))) {
          caseType = 'uppercase'
        }

        // unicode
        if (isUnicode) {
          switch (c) {
            case '&': c = 'ampersand'
              break
            case '+': c = 'plus sign'
              break
            case '-': c = 'minus sign'
              break
            case '_': c = 'underscore'
              break
            case '=': c = 'equal sign'
              break
            case '?': c = 'question sign'
              break
          }
        }

        // Create a new SpeechSynthesisUtterance object with the text
        const utterance: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(`${c} ${isNaN(Number(c)) && !isUnicode ? caseType : ''}`)
        // utterance.rate = 0.7

        // Use the speech synthesis API to speak the text
        speechSynthesis.speak(utterance)

        caseType = 'lowercase'
        isUnicode = false
      })
    }
  }

  const fetchUsers = async (): Promise<void> => {
    try {
      const response = await axios.get(`${server}/users`, { withCredentials: true })
      setDBUsers(response.data) // Return the data from the response
      // sessionStorage.setItem('dbusers', JSON.stringify(response.data))
      setIsReady(true)
      setIsLoading(false)
    } catch (err) {
      withReactContent(Swal).fire({
        title: 'Error fetching',
        showConfirmButton: true,
      })
      console.error(err)
    }
  }

  useEffect(() => {
    if (event) {
      const eventName = (event.target as HTMLButtonElement).name
      if (eventName === 'login') {
        handleLogin(event)
      } else if (eventName === 'regis') {
        handleRegistration(event)
      }
    }
  }, [resultCaptcha])


  useEffect(() => {
    if (!ref.current) {
      ref.current = true
      fetchUsers()
    }
  }, [])

  return (
    <div id='loginPageBody' className='d-flex justify-content-center align-items-center w-100 h-vh-100' style={{ 'backgroundImage': `url(${bg})`, 'backgroundOrigin': 'center center', 'backgroundPosition': 'center center', 'backgroundRepeat': 'no-repeat', 'backgroundSize': 'cover', 'objectFit': 'cover' }}>
      {
        isLoading ?
          <div style={{ 'color': 'white', 'fontSize': '2em', 'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center' }}>Loading&nbsp;{<Loader />}</div>
          :
          <>
            <Form action='#' method='POST' className='form p-15 p-md-20' id='loginForm' head='LomWongChat' headClass='titleHead' subHead='Login' subHeadClass='subHead' target='_self' autoComplete='on'>
              <div className='inputWrapper'>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => getInputValue(e, setInputUsername)} type='text' name='inpUsername' value={inputUsername || ''} min='3' max='15' id='inpUsername' className='inp inpUsername' placeHolder=' ' useLabel={true} labelText='Username' labelId='labelUsername' labelClass='labelUsername' required={true} />
              </div>
              <div className='inputWrapper'>
                <Input onChange={(e: ChangeEvent<HTMLInputElement>) => getInputValue(e, setInputPassword)} type={toggleShowHide ? 'text' : 'password'} name='inpPassword' value={inputPassword || ''} id='inpPassword' className='inp inpPassword' placeHolder=' ' useLabel={true} labelText='Password' labelId='labelPassword' labelClass='labelPassword' useShowHide={[true, setToggleShowHide]} required={true} />
              </div>
              <Captcha setCanvas={setCanvas} setStatusVerified={setStatusVerified} useLabel={false} value={inputCaptcha} reNewCaptcha={reNewCaptcha} setCurrCaptcha={setCurrCaptcha} setReNewCaptcha={setReNewCaptcha} setInputCaptcha={setInputCaptcha} inputCaptcha={inputCaptcha} reCaptcha={reCaptcha} readCaptcha={readCaptcha} />
              <CaptchaStatus resultVerified={statusVerfied} />
              <div className='buttonWrapper d-block d-md-flex'>
                {
                  isReady ?
                    <>
                      {
                        checking ?
                          <Button type='button' name='checking' id='checkingBtn' className='btn checkingBtn formBtn mb-10 mb-md-0' innerText='checking' disabled={true} />
                          :
                          <>
                            <Button onClick={(e: MouseEvent) => verifyCaptcha(e)} type='submit' value={inputCaptcha} name='login' id='loginBtn' className='btn loginBtn formBtn mb-10 mb-md-0' innerText='Login' />
                            <Button onClick={(e: MouseEvent) => verifyCaptcha(e)} type='submit' value={inputCaptcha} name='regis' id='regisBtn' className='btn regisBtn formBtn mb-10 mb-md-0 ml-md-10' innerText='Register' />
                          </>
                      }
                    </>
                    :
                    <Button type='submit' name='invalid' id='invalidBtn' className='btn invalidBtn formBtn mb-10 mb-md-0' innerText='Invalid' disabled={true} />
                }
              </div>
            </Form>
          </>
      }
    </div>
  )
}

export default LoginPage