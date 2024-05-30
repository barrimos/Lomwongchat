import { ChangeEvent, Dispatch, SetStateAction } from 'react'

export const getInputValue = <T extends string | number>(e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>, setState?: Dispatch<SetStateAction<T>>): void => {
  const value: T = e.target.value as T
  if (setState) setState(value)
}