import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'

/**
 * Tablet intake form: staff at the shelter log a person into the roster.
 * Full name (required), TRN and DOB for the official record.
 */
export function LogPersonSheet({
  shelterId,
  open,
  onOpenChange,
}: {
  shelterId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const logOccupant = useStore((s) => s.logOccupant)
  const [name, setName] = useState('')
  const [trn, setTrn] = useState('')
  const [dob, setDob] = useState('')

  const submit = () => {
    logOccupant(shelterId, { name, trn, dob })
    setName('')
    setTrn('')
    setDob('')
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-lg pb-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="text-urgency-critical size-5" />
            Log a resident
          </SheetTitle>
          <SheetDescription>
            Record the person now sheltering here.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="log-name">Full name</Label>
            <Input
              id="log-name"
              maxLength={80}
              placeholder="e.g. Andre Campbell"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="log-trn">TRN</Label>
            <Input
              id="log-trn"
              inputMode="numeric"
              maxLength={11}
              placeholder="123-456-789"
              value={trn}
              onChange={(e) => setTrn(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="log-dob">Date of birth</Label>
            <Input
              id="log-dob"
              maxLength={20}
              placeholder="e.g. 12 Mar 1984"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <Button size="lg" disabled={name.trim() === ''} onClick={submit}>
            Add to shelter
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
