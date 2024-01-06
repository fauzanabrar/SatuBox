import { ReactNode } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogPortal,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

type Props = {
  triggerChildren: ReactNode
  children: ReactNode
  onSelect: () => void
  onOpenChange: (open: boolean) => void
}

export const DialogItem = ({ triggerChildren, children, onSelect, onOpenChange }: Props) => {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={event => {
            event.preventDefault()
            onSelect && onSelect()
          }}
        >
          {triggerChildren}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogPortal>
        <DialogContent>
          {children}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}