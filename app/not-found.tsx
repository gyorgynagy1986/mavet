import Link from "next/link";
import { MapIcon } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { SiteContainer } from "@/components/site-container";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
// Unmatched URLs render under the root layout, outside the `(public)` group,
// so the public frame is added here explicitly.
export default function NotFound() {
  return (
    <PublicShell>
    <SiteContainer className="py-16">
      <Empty className="min-h-96 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MapIcon />
          </EmptyMedia>
          <EmptyTitle>Az oldal nem található</EmptyTitle>
          <EmptyDescription>
            A megadott cím nem létezik vagy megváltozott.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href="/" />} nativeButton={false}>
            Vissza a főoldalra
          </Button>
        </EmptyContent>
      </Empty>
    </SiteContainer>
    </PublicShell>
  );
}
