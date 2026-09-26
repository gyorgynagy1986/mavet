import Link from "next/link";
import { MapIcon } from "lucide-react";
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
export default function NotFound() {
  return (
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
  );
}
