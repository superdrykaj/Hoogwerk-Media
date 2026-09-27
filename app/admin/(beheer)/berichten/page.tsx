import { MessagesManager } from "@/components/admin/messages-manager";
import { PageHeading } from "@/components/admin/ui";
import { listMessages } from "@/lib/messages";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const messages = listMessages();

  return (
    <>
      <PageHeading
        title="Berichten"
        intro="Berichten uit het contactformulier. Alleen jij ziet deze gegevens."
      />
      <MessagesManager messages={messages} initialStatus={status ?? "all"} />
    </>
  );
}
