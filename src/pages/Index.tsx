import { PageShell } from "@/components/echo/PageShell";

const Index = () => {
  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-1">
        <h1 className="font-display italic text-[48px] leading-none text-foreground">
          ● Echo
        </h1>
        <p className="font-body text-[14px] text-muted-foreground">
          Peer support. No noise.
        </p>
      </div>
    </PageShell>
  );
};

export default Index;
