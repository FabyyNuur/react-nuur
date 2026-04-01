import bgImage from "../../assets/fond.png";

export function LoginBackground() {
  return (
    <>
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Gym Background"
          className="w-full h-full object-cover opacity-30 scale-105 blur-sm"
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      </div>

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[150px] opacity-10 animate-pulse pointer-events-none" />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent rounded-full blur-[150px] opacity-10 animate-pulse pointer-events-none"
        style={{ animationDelay: "2s" }}
      />
    </>
  );
}
