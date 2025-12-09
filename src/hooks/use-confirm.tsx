'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { createCallable } from 'react-call'
import { Button } from '~/components/ui/intent-ui/button'
import { Label } from '~/components/ui/intent-ui/field'
import { Modal } from '~/components/ui/intent-ui/modal'
import { TextField } from '~/components/ui/intent-ui/text-field'
import { INVALID_INPUT_MESSAGE } from '~/constants/validation'
import { confirmInputSchema } from '~/types/schemas/confirm-input-schema'

export const { Root, ...Confirm } = createCallable<
  {
    title: string
    message: string | ReactNode
    expectedInput?: string
    placeholder?: string
  },
  boolean
>(({ call, title, message, expectedInput, placeholder }) => {
  return (
    <Modal isOpen={true} onOpenChange={() => call.end(false)}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
          <Modal.Description>{message}</Modal.Description>
        </Modal.Header>
        <ConfirmInput
          expectedInput={expectedInput}
          placeholder={placeholder}
          onConfirm={(isValid) => {
            if (isValid) {
              call.end(true)
            }
          }}
        />
      </Modal.Content>
    </Modal>
  )
})

type ConfirmInputProps = {
  expectedInput?: string
  placeholder?: string
  onConfirm: (isValid: boolean) => void
}

function ConfirmInput({ expectedInput, placeholder, onConfirm }: ConfirmInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const schema = expectedInput ? confirmInputSchema(expectedInput) : null
  const isInputValid = expectedInput ? inputValue === expectedInput : true

  const handleConfirm = () => {
    if (!expectedInput) {
      onConfirm(true)
      return
    }

    if (!schema) {
      return
    }

    const result = schema.safeParse({ input: inputValue })

    if (result.success) {
      setErrorMessage('')
      onConfirm(true)
    } else {
      const issue = result.error.issues[0]
      setErrorMessage(issue?.message ?? INVALID_INPUT_MESSAGE)
      onConfirm(false)
    }
  }

  if (!expectedInput) {
    return (
      <Modal.Footer className="pt-2">
        <Modal.Close>閉じる</Modal.Close>
        <Button intent="danger" onPress={handleConfirm}>
          実行する
        </Button>
      </Modal.Footer>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-y-2 px-6 pb-4">
        <Label>
          確認のため、<b>"{expectedInput}"</b>と入力してください
        </Label>
        <TextField
          placeholder={placeholder}
          value={inputValue}
          onChange={(value) => {
            setInputValue(value)

            if (errorMessage) {
              setErrorMessage('')
            }
          }}
          errorMessage={errorMessage}
          autoFocus
        />
      </div>
      <Modal.Footer className="pt-2">
        <Modal.Close>閉じる</Modal.Close>
        <Button intent="danger" onPress={handleConfirm} isDisabled={!isInputValid}>
          実行する
        </Button>
      </Modal.Footer>
    </>
  )
}
