'use client'

import { Button } from '~/components/ui/intent-ui/button'
import { Confirm } from '~/hooks/use-confirm'

export function ConfirmButton() {
  const handleClick = async () => {
    const ok = await Confirm.call({
      title: 'Delete this channel?',
      message:
        'You are about to delete this channel. This action is irreversible.',
    })

    if (ok) {
      alert('Channel deleted')
    } else {
      alert('Channel not deleted')
    }
  }

  return <Button onPress={handleClick}>Click Me</Button>
}
