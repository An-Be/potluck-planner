import { getTheme } from "@/lib/themes";

export function PartyTitle({ title, theme, kicker }: { title: string; theme: string; kicker: string }) {
  const { emoji } = getTheme(theme);
  return (
    <section className="flex flex-col gap-3">
      <p className="label text-(--theme-accent)">
        {emoji ? <span aria-hidden="true">{emoji} </span> : null}
        {kicker}
      </p>
      <h1 className="display break-words text-5xl">{title}</h1>
    </section>
  );
}
