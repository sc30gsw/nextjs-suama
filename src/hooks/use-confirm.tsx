'use client'

import { createCallable } from 'react-call'
import { Button } from '~/components/ui/intent-ui/button'
import { Modal } from '~/components/ui/intent-ui/modal'

export const { Root, ...Confirm } = createCallable<
  Record<'title' | 'message', string>,
  boolean
>(({ call, title, message }) => (
  <Modal isOpen={true} onOpenChange={() => call.end(false)}>
    <Modal.Content>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
        <Modal.Description>{message}</Modal.Description>
      </Modal.Header>
      <Modal.Footer className="pt-2">
        <Modal.Close>Cancel</Modal.Close>
        <Button
          intent="secondary"
          onPress={() => call.end(true)}
          className="w-24 text-white bg-zinc-900 hover:bg-zinc-950 data-hovered:bg-zinc-800/90 data-pressed:bg-zinc-800/90"
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal.Content>
  </Modal>
))
