export type ClientActivityItem = {
  name: string;
  date?: string;
};

const asText = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

export type ClientActivitySource = {
  activity_details?: unknown;
  activity_name?: string;
  subscription_end_date?: string;
};

export function getClientActivities(
  client: ClientActivitySource,
): ClientActivityItem[] {
  const fallback: ClientActivityItem[] = [
    {
      name: client.activity_name || "N/A",
      date: client.subscription_end_date,
    },
  ];
  const raw = client.activity_details;

  if (!raw) return fallback;

  if (Array.isArray(raw)) {
    const parsed: ClientActivityItem[] = raw.map(
      (item: Record<string, unknown>) => ({
        name: asText(item?.name, asText(item?.activity_name, "N/A")),
        date: asText(
          item?.date,
          asText(
            item?.end_date,
            asText(item?.subscription_end_date, client.subscription_end_date),
          ),
        ),
      }),
    );
    return parsed.length ? parsed : fallback;
  }

  if (typeof raw === "string") {
    if (raw.trim().startsWith("[") || raw.trim().startsWith("{")) {
      try {
        const json = JSON.parse(raw);
        if (Array.isArray(json)) {
          const parsed: ClientActivityItem[] = json.map(
            (item: Record<string, unknown>) => ({
              name: asText(item?.name, asText(item?.activity_name, "N/A")),
              date: asText(
                item?.date,
                asText(
                  item?.end_date,
                  asText(
                    item?.subscription_end_date,
                    client.subscription_end_date,
                  ),
                ),
              ),
            }),
          );
          return parsed.length ? parsed : fallback;
        }
      } catch {}
    }

    const chunks = raw.includes(";") ? raw.split(";") : raw.split(",");
    const parsed: ClientActivityItem[] = chunks
      .map((chunk) => {
        const piece = chunk.trim();
        if (!piece) return null;
        const sepIndex = piece.lastIndexOf("|");
        if (sepIndex === -1)
          return { name: piece, date: client.subscription_end_date };
        return {
          name: piece.slice(0, sepIndex).trim(),
          date: piece.slice(sepIndex + 1).trim(),
        };
      })
      .filter(Boolean) as ClientActivityItem[];

    return parsed.length ? parsed : fallback;
  }

  return fallback;
}
