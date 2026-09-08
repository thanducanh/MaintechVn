import { getContactConfigAction } from "@/actions/contact";
import ContactManager from "./ContactManager";

export const dynamic = 'force-dynamic';

export default async function ContactAdminPage() {
    const config = await getContactConfigAction();

    return (
    <div className="bg-slate-50/50 dark:bg-slate-950/20 min-h-full w-full overflow-visible animate-in fade-in duration-500 flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto min-h-full flex-1 flex flex-col">
                <ContactManager initialConfig={config} />
            </div>
        </div>
    );
}
