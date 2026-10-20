"use client"

import { useState } from "react"
import { PlayIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/** A video plays in a dialog (client decision DD-47/53), so the list keeps its height; closing unmounts the player. */
export function VideoDialog({ title, embedUrl }: { title: string; embedUrl: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="sm" variant="soft" onClick={() => setOpen(true)}>
        <PlayIcon data-icon="inline-start" aria-hidden="true" />
        Lejátszás
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 sm:p-0">
          <DialogHeader className="px-5 pt-5 pr-12">
            <DialogTitle className="text-balance">{title}</DialogTitle>
            <DialogDescription className="sr-only">Videó lejátszása</DialogDescription>
          </DialogHeader>
          {open ? (
            <div className="aspect-video w-full bg-black">
              <iframe src={`${embedUrl}&autoplay=1`} title={title} className="size-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
