'use client'

import { IconPlus } from '@intentui/icons'
import type { ReactNode } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Form } from '~/components/ui/intent-ui/form'
import { Modal } from '~/components/ui/intent-ui/modal'
import { TextField } from '~/components/ui/intent-ui/text-field'

export function CreateClientModal({ children }: { children: ReactNode }) {
  return (
    <Modal>
      <Modal.Trigger>{children}</Modal.Trigger>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>クライアントを登録する</Modal.Title>
          <Modal.Description>
            プロジェクトに関連するクライアントを登録します。
          </Modal.Description>
        </Modal.Header>
        <Form>
          <Modal.Body className="space-y-4">
            <TextField
              isRequired={true}
              autoFocus={true}
              label="クライアント名"
              type="text"
              placeholder="クライアント名を入力"
            />
            <TextField
              isRequired={true}
              autoFocus={true}
              label="検索単語"
              type="text"
              placeholder="検索単語を入力"
            />
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close>閉じる</Modal.Close>
            <Button type="submit">
              登録する
              <IconPlus />
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Content>
    </Modal>
  )
}
