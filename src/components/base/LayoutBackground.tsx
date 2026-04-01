import bgImage from "../../assets/fond.png";

export function LayoutBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 blur-[4px] opacity-[0.58] grayscale-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#132d62]/12 via-[#122750]/34 to-[#0F1419]/62" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(90,150,255,0.16),transparent_72%)]" />
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/12 blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[100px] animate-pulse"
        style={{ animationDelay: "2s" }}
      />
    </div>
  );
}
