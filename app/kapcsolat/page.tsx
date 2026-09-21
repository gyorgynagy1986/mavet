import { MailIcon } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import { PageHeader } from "@/components/page-header"
import { SiteContainer } from "@/components/site-container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { contact } from "@/lib/data/site"
import { FacebookMark } from "@/components/facebook-mark"
export default function ContactPage() { return <><PageHeader title="Kapcsolat" description="Kérdésével vagy szakmai megkeresésével forduljon a Magyar Vidékegészségügyi Társasághoz." /><SiteContainer className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.7fr_1.3fr]"><Card className="h-fit"><CardHeader><CardTitle>Elérhetőség</CardTitle><CardDescription>A Facebook-hivatkozás az élesítés előtt kerül be.</CardDescription></CardHeader><CardContent className="flex flex-col items-start gap-4"><a className="inline-flex items-center gap-2 text-sm underline underline-offset-4" href={`mailto:${contact.email}`}><MailIcon className="size-4" />{contact.email}</a><FacebookMark /></CardContent></Card><Card><CardHeader><CardTitle>Írjon nekünk</CardTitle><CardDescription>A mezők kitöltése után az üzenetet a MAVET kijelölt kapcsolattartója kapja meg.</CardDescription></CardHeader><CardContent><ContactForm /></CardContent></Card></SiteContainer></> }
