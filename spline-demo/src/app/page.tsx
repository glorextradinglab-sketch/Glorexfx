import { LampContainer } from "@/components/ui/lamp"
import { SplineSceneBasic } from "@/components/ui/demo"
import { Testimonials } from "@/components/ui/testimonials-demo"
import { GlowCard } from "@/components/ui/spotlight-card"

export default function Home() {
  return (
    <main className="bg-neutral-950 text-white">
      {/* Lamp */}
      <LampContainer>
        <h1 className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
          Build lamps <br /> the right way
        </h1>
      </LampContainer>

      {/* Spline 3D */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-5xl">
          <SplineSceneBasic />
        </div>
      </div>

      {/* Testimonials */}
      <Testimonials />

      {/* GlowCard — Spotlight Cards */}
      <div className="flex flex-row items-center justify-center gap-10 py-20 flex-wrap">
        <GlowCard glowColor="red" size="md">
          <p className="text-white text-center font-semibold">Red Glow</p>
        </GlowCard>
        <GlowCard glowColor="purple" size="md">
          <p className="text-white text-center font-semibold">Purple Glow</p>
        </GlowCard>
        <GlowCard glowColor="blue" size="md">
          <p className="text-white text-center font-semibold">Blue Glow</p>
        </GlowCard>
      </div>
    </main>
  )
}
