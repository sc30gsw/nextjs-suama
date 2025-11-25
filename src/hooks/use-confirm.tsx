'use client'

import type { ReactNode } from 'react'
import { createCallable } from 'react-call'
import { Button } from '~/components/ui/intent-ui/button'
import { Modal } from '~/components/ui/intent-ui/modal'

export const { Root, ...Confirm } = createCallable<
  Record<'title' | 'message', string | ReactNode>,
  boolean
>(({ call, title, message }) => (
  <Modal isOpen={true} onOpenChange={() => call.end(false)}>
    <Modal.Content>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
        <Modal.Description>{message}</Modal.Description>
      </Modal.Header>
      <Modal.Footer className="pt-2">
        <Modal.Close>閉じる</Modal.Close>
        <Button intent="danger" onPress={() => call.end(true)}>
          実行する
        </Button>
      </Modal.Footer>
    </Modal.Content>
  </Modal>
))
