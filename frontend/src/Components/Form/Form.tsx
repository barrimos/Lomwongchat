import { formTypes } from '../../types'


const Form = ({ head,
  headClass,
  subHead,
  subHeadClass,
  method,
  action,
  className,
  id,
  target,
  autoComplete,
  children
}: formTypes): JSX.Element => {
  return (
    <form action={action} method={method} className={className} id={id} target={target} autoComplete={autoComplete}>
      {
        head && subHead ?
          <div id='titleForm'>
            <h4 className={headClass}>{head}</h4>
            <h6 className={subHeadClass}>{subHead}</h6>
          </div>
          :
          <></>
      }
      {children}
    </form>
  )
}

export default Form