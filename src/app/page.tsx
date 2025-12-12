"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Rocket, ChevronRight, Zap, FileText, Video, Star, Check, Menu, X,
  Sparkles, TrendingUp, Clock, Shield, Users
} from "lucide-react";
import { useState } from "react";

const TESTIMONIALS = [
  {
    name: "Ayşe K.",
    role: "TikTok İçerik Üreticisi",
    avatar: "🎬",
    text: "ViralHook kullandıktan sonra videolarım 500 izlenmeden 50K+'ya çıktı. Hook'lar paha biçilemez!"
  },
  {
    name: "Mehmet D.",
    role: "Finans İçerik Üreticisi",
    avatar: "💰",
    text: "Her gün script yazımından 2 saat tasarruf ediyorum. AI tam olarak neyin viral olduğunu anlıyor."
  },
  {
    name: "Zeynep A.",
    role: "Yaşam Tarzı Influencer",
    avatar: "✨",
    text: "Sonunda Gen-Z dilinden anlayan bir araç! Etkileşim oranım sadece 2 haftada ikiye katlandı."
  }
];

const FAQ = [
  {
    q: "ViralHook nasıl çalışıyor?",
    a: "Sadece nişinizi, video stilinizi seçin ve konunuzu girin. AI'mız milyonlarca viral videoyu analiz ederek scroll-durdurucu hooklar ve tam scriptler oluşturur."
  },
  {
    q: "Ücretsiz plan var mı?",
    a: "Evet! Günde 3 ücretsiz üretim hakkınız var. Sınırsız erişim için Pro'ya yükseltin."
  },
  {
    q: "Hangi platformlar için kullanabilirim?",
    a: "TikTok, Instagram Reels, YouTube Shorts ve tüm kısa video platformları için uygundur."
  },
  {
    q: "İstediğim zaman iptal edebilir miyim?",
    a: "Kesinlikle! Sözleşme yok, gizli ücret yok. Pro aboneliğinizi istediğiniz zaman iptal edin."
  }
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-cyan">
                <Rocket className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white">
                Viral<span className="gradient-text">Hook</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-white transition-colors">
                Özellikler
              </a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-white transition-colors">
                Yorumlar
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-white transition-colors">
                Fiyatlar
              </a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-white transition-colors">
                SSS
              </a>

              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 px-8 py-6 text-lg">
                  Giriş Yap
                </Button>
              </Link>
            </div>

            <button className="md:hidden p-2 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-center text-muted-foreground">Özellikler</a>
                <a href="#pricing" className="text-center text-muted-foreground">Fiyatlar</a>
                <Link href="/generator">
                  <Button className="w-full gradient-primary text-black font-semibold">
                    Ücretsiz Dene
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            AI Destekli Viral İçerik Üretici
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            <span className="text-white">Kimsenin İzlemediği</span>
            <br />
            <span className="gradient-text">Videolar Paylaşmayı Bırak</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Saniyeler içinde viral hooklar, tam scriptler ve görsel yönlendirmeler alın. Milyonlarca viral video ile eğitilmiş yapay zeka tarafından desteklenmektedir.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/generator">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg gradient-primary text-black font-bold hover:opacity-90 glow-cyan">
                <Rocket className="w-5 h-5 mr-2" />
                Ücretsiz Dene
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg border-white/20 hover:bg-white/5">
              Örnekleri Gör
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {[
              { value: "10K+", label: "Hook Üretildi" },
              { value: "5K+", label: "Aktif Kullanıcı" },
              { value: "4.9★", label: "Kullanıcı Puanı" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="relative z-10 border-y border-white/5 py-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[
              { icon: <Shield className="w-5 h-5" />, text: "Güvenli Ödeme" },
              { icon: <Clock className="w-5 h-5" />, text: "Anında Üretim" },
              { icon: <Users className="w-5 h-5" />, text: "5000+ Kullanıcı" },
              { icon: <TrendingUp className="w-5 h-5" />, text: "%98 Memnuniyet" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <span className="text-cyan-400">{badge.icon}</span>
                <span className="text-sm">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Tek Tıkla Viral İçerik
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            AI destekli araçlarımız, saniyeler içinde viral potansiyeli yüksek içerikler üretir.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { icon: <Zap className="w-6 h-6" />, title: "10 Viral Hook", desc: "İzleyicileri durduran ilk 3 saniye", color: "cyan" },
            { icon: <FileText className="w-6 h-6" />, title: "Tam Scriptler", desc: "Sonuna kadar izleme tutma sağlayan 30-60 saniyelik scriptler", color: "purple" },
            { icon: <Video className="w-6 h-6" />, title: "Görsel Yönlendirme", desc: "Ekran yazıları ve arka plan video önerileri", color: "pink" },
          ].map((feature, i) => (
            <div key={i} className="group p-6 md:p-8 rounded-2xl glass hover:border-cyan-500/30 transition-all duration-300">
              <div className={`w-14 h-14 rounded-xl gradient-${feature.color === "cyan" ? "primary" : "accent"} flex items-center justify-center mb-6`}>
                <span className="text-black">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Nasıl Çalışır?
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          {[
            { step: "01", title: "Niş Seçin", desc: "12 popüler kategoriden birini seçin" },
            { step: "02", title: "Stil Belirleyin", desc: "8 video stilinden birini seçin" },
            { step: "03", title: "Ton Seçin", desc: "İçeriğinizin sesini belirleyin" },
            { step: "04", title: "İçerik Alın", desc: "10 hook + tam script alın" },
          ].map((item, i) => (
            <div key={i} className="relative text-center">
              <div className="text-6xl md:text-7xl font-bold gradient-text opacity-20 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 select-none">
                {item.step}
              </div>
              <div className="relative pt-14">
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="/generator">
            <Button size="lg" className="px-8 py-6 text-lg gradient-primary text-black font-bold hover:opacity-90 glow-cyan">
              Hemen Başla
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-20 md:py-32 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Kullanıcılar Ne Diyor?
            </h2>
            <p className="text-muted-foreground">
              Binlerce içerik üreticisi ViralHook'a güveniyor
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="p-6 rounded-2xl glass">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Basit Fiyatlandırma
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl glass">
            <h3 className="text-xl font-bold text-white mb-2">Ücretsiz</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">₺0</span>
              <span className="text-muted-foreground">/ay</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["Günde 3 üretim", "10 viral hook", "Tam script", "Görsel yönlendirme"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/generator">
              <Button variant="outline" className="w-full py-5 border-white/20 hover:bg-white/5">
                Ücretsiz Başla
              </Button>
            </Link>
          </div>

          <div className="p-8 rounded-2xl gradient-primary relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/20 text-white text-xs font-medium">
              POPÜLER
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-black">₺149</span>
              <span className="text-black/60">/ay</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["Sınırsız üretim", "Öncelikli AI işleme", "Script kaydetme", "Gelişmiş niş hedefleme", "7/24 destek"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-black/80">
                  <Check className="w-5 h-5 text-black" />
                  {item}
                </li>
              ))}
            </ul>
            <Button className="w-full py-5 bg-black text-white hover:bg-black/80">
              Pro'ya Geç
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sık Sorulan Sorular
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ.map((faq, i) => (
            <div key={i} className="rounded-2xl glass overflow-hidden">
              <button
                className="w-full p-5 flex items-center justify-between text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-semibold text-white">{faq.q}</span>
                <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 md:p-12 rounded-3xl gradient-primary">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Viral Olmaya Hazır mısın?
            </h2>
            <p className="text-black/70 mb-8 max-w-xl mx-auto">
              Binlerce içerik üreticisine katılın ve AI destekli viral hooklar oluşturmaya başlayın.
            </p>
            <Link href="/generator">
              <Button size="lg" className="px-8 py-6 text-lg bg-black text-white hover:bg-black/80 font-bold">
                <Rocket className="w-5 h-5 mr-2" />
                Ücretsiz Dene
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Rocket className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold text-white">ViralHook AI</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-white transition-colors">Gizlilik</a>
              <a href="#" className="hover:text-white transition-colors">Şartlar</a>
              <a href="#" className="hover:text-white transition-colors">İletişim</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ViralHook AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
