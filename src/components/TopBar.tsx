import Link from "next/link";

export default function TopBar({ back = "/", title }: { back?: string; title?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-3">
      <Link href={back} className="glass flex h-10 w-10 items-center justify-center rounded-full text-lg" aria-label="Volver">
        ←
      </Link>
      {title && <h1 className="text-lg font-medium">{title}</h1>}
    </div>
  );
}
