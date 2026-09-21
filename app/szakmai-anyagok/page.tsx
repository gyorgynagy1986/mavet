import { BookOpenIcon } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { SiteContainer } from "@/components/site-container"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
export default function ResourcesPage() { return <><PageHeader title="Szakmai anyagok" description="Ajánlások, előadások, publikációk és további szakmai tartalmak helye." /><SiteContainer className="py-12 sm:py-16"><Empty className="min-h-80 border"><EmptyHeader><EmptyMedia variant="icon"><BookOpenIcon /></EmptyMedia><EmptyTitle>A szakmai anyagok hamarosan érkeznek</EmptyTitle><EmptyDescription>A MAVET szakmai anyagai a weboldal következő fejlesztési ütemében válnak elérhetővé.</EmptyDescription></EmptyHeader></Empty></SiteContainer></> }
