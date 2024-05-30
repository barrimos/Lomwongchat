import { InputTypes } from '../../types'
import ToggleShowHideBtn from '../ToggleShowHideBtn/ToggleShowHideBtn'

const Input = ({
  type,
  name,
  id,
  className,
  placeHolder,
  required,
  onChange,
  onFocus,
  onKeyDown,
  value,
  useLabel,
  labelText,
  labelId,
  labelClass,
  min,
  max,
  useShowHide
}: InputTypes): JSX.Element => {

  const [useShow, setState] = useShowHide || [false, () => { }];

  return (

    // <div className='inputWrapper'>
    <>
      {
        useShow ?
          <ToggleShowHideBtn setToggleShowHide={setState} />
          :
          <></>
      }
      <input type={type} onChange={onChange} onFocus={onFocus} onKeyDown={onKeyDown} name={name} id={id} value={value} className={className} placeholder={placeHolder} required={required} min={min} max={max} />
      {
        useLabel ?
          <label htmlFor={id} id={labelId} className={labelClass} onClick={(e: any) => onChange(e)}>{labelText}</label>
          :
          ''
      }
    </>
    // </div>
  )
}

export default Input