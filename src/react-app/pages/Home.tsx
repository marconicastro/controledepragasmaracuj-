import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  TriangleAlert, 
  Award, 
  Rocket, 
  X, 
  Target, 
  Users, 
  Star, 
  TrendingUp, 
  CircleCheckBig,
  Shield,
  Download,
  Phone,
  DollarSign,
  ArrowRight,
  Clock,
  Zap
} from 'lucide-react';
import { 
  trackButtonClick, 
  trackCheckoutStart, 
  trackPurchaseClick,
  pushToDataLayer
} from '@/react-app/utils/tracking';
import { usePageTracking, useScrollTracking, useIntersectionTracking, useTimerTracking } from '@/react-app/hooks/useTracking';
import OptimizedImage from '@/react-app/components/OptimizedImage';
import LazySection from '@/react-app/components/LazySection';

// Memoized Timer Component
const Timer = memo(({ timeLeft }: { timeLeft: { hours: number; minutes: number; seconds: number } }) => {
  const formatTime = useCallback((time: number) => time.toString().padStart(2, '0'), []);
  
  return (
    <div className="bg-red-800 px-2 py-1 rounded font-mono text-xs sm:text-sm">
      {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
    </div>
  );
});

// Memoized Hero Section
const HeroSection = memo(({ onScrollToCheckout }: { onScrollToCheckout: () => void }) => (
  <div id="hero" className="bg-gradient-to-br from-green-50 to-green-100 py-6 sm:py-8 md:py-12">
    <div className="container mx-auto px-3 sm:px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-1 sm:gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm mb-4 sm:mb-6">
          <Award className="w-3 h-3 sm:w-4 sm:h-4" />
          MÉTODO VALIDADO PELA EMBRAPA
        </div>
        
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-4 leading-tight">
          <span className="text-red-600">PARE DE JOGAR</span><br/>
          <span className="text-gray-800">DINHEIRO FORA</span><br/>
          <span className="text-green-600">COM O TRIPS!</span>
        </h1>

        <div className="mb-4 sm:mb-6">
          <div className="flex justify-center max-w-2xl mx-auto">
            <OptimizedImage
              src="https://i.ibb.co/Ty7JVF4/ebook-logo.webp"
              alt="E-book Sistema de Controle de Trips"
              className="max-w-full h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
              style={{maxWidth: '320px'}}
              priority={true}
              loading="eager"
            />
          </div>
        </div>

        <p className="text-base sm:text-xl md:text-2xl text-gray-700 mb-4 sm:mb-6 font-semibold px-2">
          Descubra o <span className="text-green-600 font-black">Sistema de 4 Fases</span> que elimina o trips de vez e{' '}
          <span className="text-green-600 font-black">economiza até R$ 5.000 por hectare</span> em defensivos ineficazes
        </p>

        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg mb-4 sm:mb-6 inline-block">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              <span className="font-bold">+1.247 produtores</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
              <span className="font-bold">4.9/5 estrelas</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              <span className="font-bold">94% de sucesso</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onScrollToCheckout}
          className="bg-orange-500 hover:bg-orange-600 text-white font-black py-4 sm:py-6 px-6 sm:px-12 rounded-full text-base sm:text-xl md:text-2xl mb-4 sm:mb-6 transform hover:scale-105 transition-all duration-200 shadow-2xl animate-bounce w-full sm:w-auto inline-flex items-center justify-center gap-2"
        >
          <Rocket className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
          QUERO ECONOMIZAR R$ 5.000 AGORA!
        </button>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 sm:p-6 rounded-lg shadow-xl">
          <div className="text-xs sm:text-sm font-bold mb-2">🔥 OFERTA RELÂMPAGO - APENAS HOJE!</div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <div className="text-2xl sm:text-3xl font-black">R$ 39,90</div>
            <div className="text-base sm:text-lg line-through opacity-75">R$ 297,00</div>
            <div className="bg-yellow-400 text-red-600 px-2 sm:px-3 py-1 rounded-full font-black text-xs sm:text-sm">87% OFF</div>
          </div>
          <div className="text-xs sm:text-sm mt-2">💳 Ou 12x de R$ 3,99 sem juros</div>
        </div>
      </div>
    </div>
  </div>
));

// Memoized Problems Section  
const ProblemsSection = memo(() => (
  <div className="bg-red-50 py-8 sm:py-12 md:py-16 border-t-4 border-red-500">
    <div className="container mx-auto px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-red-600 mb-3 sm:mb-4 px-2">
            ⚠️ VOCÊ ESTÁ COMETENDO ESTES ERROS CAROS?
          </h2>
          <p className="text-base sm:text-xl text-gray-700 px-2">
            <strong>Cada dia que passa sem o controle correto = R$ 200 a R$ 800 de prejuízo!</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[
            {
              title: "❌ Só ataca quando vê o adulto",
              text: "Aplica Delegate, Decarzol, Esperto... mas 48h depois a praga volta PIOR que antes!",
              damage: "💸 Prejuízo: R$ 300-600/hectare por aplicação inútil"
            },
            {
              title: "❌ Ignora ovos, ninfas e pupas", 
              text: "Não quebra o ciclo! A cada 15 dias uma nova geração explode na lavoura.",
              damage: "💸 Prejuízo: R$ 2.000-5.000/hectare por safra perdida"
            },
            {
              title: "❌ Copia receita do vizinho",
              text: "Cada lavoura é única! O que funciona lá pode ser desastre aqui.",
              damage: "💸 Prejuízo: R$ 1.500-3.000/hectare em produtos errados"
            },
            {
              title: "❌ Compra o mais caro na revenda",
              text: "Vendedor empurra produto caro sem orientação técnica adequada.",
              damage: "💸 Prejuízo: R$ 800-2.000/hectare em produtos superdimensionados"
            }
          ].map((problem, index) => (
            <div key={index} className="bg-white border-l-4 border-red-500 p-4 sm:p-6 rounded-lg shadow-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{problem.title}</h3>
                  <p className="text-gray-600 mb-3 text-xs sm:text-sm">{problem.text}</p>
                  <div className="bg-red-100 p-2 sm:p-3 rounded text-red-800 font-semibold text-xs sm:text-sm">
                    {problem.damage}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-red-600 text-white p-6 sm:p-8 rounded-lg mt-6 sm:mt-8 text-center">
          <h3 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4">🚨 RESULTADO FINAL:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm sm:text-lg font-semibold">
            {[
              {
                title: "😰 Travamento das ponteiras",
                src: "https://i.ibb.co/W4w89xks/travamento-ponteiras.jpg",
                alt: "Travamento das ponteiras causado por trips"
              },
              {
                title: "🤢 Frutos deformados e manchados",
                src: "https://i.ibb.co/FLdFBcSM/frutos-manchados.jpg",
                alt: "Frutos deformados e manchados por trips"
              },
              {
                title: "💀 Viroses que matam a plantação",
                src: "https://i.ibb.co/rRc0ZLkG/viroses-plantas.jpg",
                alt: "Viroses que matam as plantas causadas por trips"
              }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="mb-3">{item.title}</div>
                <div className="bg-white rounded-lg p-3 shadow-lg">
                  <OptimizedImage
                    src={item.src}
                    alt={item.alt}
                    className="mx-auto max-w-full h-auto rounded"
                    style={{maxWidth: '180px'}}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 sm:mt-6 text-lg sm:text-xl font-black bg-red-800 p-3 sm:p-4 rounded">
            💸 PREJUÍZO TOTAL: R$ 5.000 a R$ 12.000 POR HECTARE!
          </div>
        </div>
      </div>
    </div>
  </div>
));

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 47,
    seconds: 0
  });

  // Initialize tracking hooks
  usePageTracking('maracuja_zero_pragas_home');
  useScrollTracking();
  useTimerTracking(timeLeft);
  const { trackElementView } = useIntersectionTracking();

  // Memoized scroll function
  const scrollToCheckout = useCallback(() => {
    trackButtonClick('QUERO ECONOMIZAR R$ 5.000 AGORA!', 'hero_section', 'scroll_to_checkout');
    document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Memoized checkout handler
  const handleCheckoutClick = useCallback((buttonLocation: string, buttonText: string) => {
    trackCheckoutStart('Sistema de Controle de Trips', 39.90);
    trackPurchaseClick('Sistema de Controle de Trips', 39.90);
    trackButtonClick(buttonText, buttonLocation, 'checkout_redirect');
    
    pushToDataLayer({
      event: 'begin_checkout',
      currency: 'BRL',
      value: 39.90,
      items: [{
        item_id: 'trips_control_system',
        item_name: 'Sistema de Controle de Trips',
        category: 'agricultural_course',
        quantity: 1,
        price: 39.90
      }],
      ecommerce: {
        currency: 'BRL',
        value: 39.90,
        items: [{
          item_id: 'trips_control_system',
          item_name: 'Sistema de Controle de Trips',
          category: 'agricultural_course',
          quantity: 1,
          price: 39.90
        }]
      },
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Optimized timer with requestAnimationFrame
  useEffect(() => {
    pushToDataLayer({
      event: 'page_loaded',
      page_name: 'maracuja_zero_pragas_home',
      product_name: 'Sistema de Controle de Trips',
      product_price: 39.90,
      original_price: 297.00,
      discount_percentage: 87,
      timestamp: new Date().toISOString(),
    });

    // Setup section tracking with delay
    const trackingTimeout = setTimeout(() => {
      trackElementView('hero', 'hero_section');
      trackElementView('problems', 'problems_section');
      trackElementView('solution', 'solution_section');
      trackElementView('results', 'results_section');
      trackElementView('urgency', 'urgency_section');
      trackElementView('checkout', 'checkout_section');
    }, 1000);

    let animationFrame: number;
    let lastUpdate = Date.now();

    const updateTimer = () => {
      const now = Date.now();
      if (now - lastUpdate >= 1000) {
        setTimeLeft(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else if (prev.hours > 0) {
            return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
          }
          return prev;
        });
        lastUpdate = now;
      }
      animationFrame = requestAnimationFrame(updateTimer);
    };

    animationFrame = requestAnimationFrame(updateTimer);

    return () => {
      clearTimeout(trackingTimeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [trackElementView]);

  // Memoized timer component
  const timerComponent = useMemo(() => (
    <Timer timeLeft={timeLeft} />
  ), [timeLeft]);

  return (
    <div className="min-h-screen bg-white">
      {/* Alert Banner */}
      <div className="bg-red-600 text-white py-2 px-2 sm:px-4 text-center animate-pulse">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-1">
            <TriangleAlert className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-center">ATENÇÃO: Apenas 47 minutos restantes para garantir o desconto de 87%!</span>
          </div>
          {timerComponent}
        </div>
      </div>

      {/* Hero Section */}
      <HeroSection onScrollToCheckout={scrollToCheckout} />

      {/* Problems Section */}
      <LazySection id="problems">
        <ProblemsSection />
      </LazySection>

      {/* Solution Section */}
      <LazySection id="solution" className="bg-gradient-to-br from-green-500 to-green-700 py-8 sm:py-12 md:py-16 text-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 px-2">
              🎯 A SOLUÇÃO QUE VAI SALVAR<br/>SUA LAVOURA E SEU DINHEIRO!
            </h2>
            <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 font-semibold px-2">
              O <span className="bg-yellow-400 text-green-800 px-2 sm:px-3 py-1 rounded font-black">SISTEMA 4 FASES</span> que elimina o trips de vez em apenas 28 dias!
            </p>

            <div className="bg-white text-gray-800 p-4 sm:p-8 rounded-lg shadow-2xl mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-black text-green-600 mb-4 sm:mb-6">🔬 PROTOCOLO CIENTÍFICO EMBRAPA</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  { phase: 1, title: "FASE OVOS (Dias 1-7)", desc: "Eliminação dos ovos antes da eclosão com produto ovicida específico", color: "green" },
                  { phase: 2, title: "FASE NINFAS (Dias 8-14)", desc: "Ataque direcionado às larvas em desenvolvimento com produto sistêmico", color: "blue" },
                  { phase: 3, title: "FASE PUPAS (Dias 15-21)", desc: "Controle no solo com produto específico para pupas em transformação", color: "purple" },
                  { phase: 4, title: "FASE ADULTOS (Dias 22-28)", desc: "Eliminação final dos adultos remanescentes e proteção residual", color: "orange" }
                ].map((item) => (
                  <div key={item.phase} className={`bg-${item.color}-50 p-3 sm:p-4 rounded-lg border-l-4 border-${item.color}-500`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`bg-${item.color}-500 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base`}>{item.phase}</div>
                      <h4 className={`font-bold text-${item.color}-700 text-sm sm:text-base`}>{item.title}</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-100 p-3 sm:p-4 rounded-lg mt-4 sm:mt-6">
                <p className="text-yellow-800 font-bold text-base sm:text-lg">⚡ RESULTADO: Ciclo do trips QUEBRADO para sempre!</p>
              </div>
            </div>

            <button 
              onClick={() => {
                trackButtonClick('QUERO O SISTEMA 4 FASES AGORA!', 'solution_section', 'cta_secondary');
                scrollToCheckout();
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-green-800 font-black py-4 sm:py-6 px-6 sm:px-12 rounded-full text-base sm:text-xl transform hover:scale-105 transition-all duration-200 shadow-2xl w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              QUERO O SISTEMA 4 FASES AGORA!
            </button>
          </div>
        </div>
      </LazySection>

      {/* Results Section */}
      <LazySection id="results" className="bg-white py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800 mb-3 sm:mb-4 px-2">
                📊 RESULTADOS QUE FALAM POR SI SÓ
              </h2>
              <p className="text-base sm:text-xl text-gray-600 px-2">
                Mais de <strong>1.247 produtores</strong> já transformaram suas lavouras com este método
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
              {[
                { value: "94%", label: "Taxa de Sucesso", color: "green" },
                { value: "R$ 5k", label: "Economia Média/Hectare", color: "blue" },
                { value: "28", label: "Dias para Resultado", color: "purple" },
                { value: "+67%", label: "Aumento na Produção", color: "orange" }
              ].map((stat, index) => (
                <div key={index} className={`text-center bg-${stat.color}-50 p-3 sm:p-6 rounded-lg border-2 border-${stat.color}-200`}>
                  <div className={`text-2xl sm:text-4xl font-black text-${stat.color}-600 mb-1 sm:mb-2`}>{stat.value}</div>
                  <p className="text-gray-700 font-semibold text-xs sm:text-base">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  image: "https://mocha-cdn.com/0199bb8b-29fd-75a3-9db8-426c2e92c7bc/joao-testimonial.jpg",
                  name: "João Mendes",
                  location: "1 hectare - Bahia",
                  testimonial: "Economizei R$ 3.500 em defensivos! O trips sumiu em 21 dias e não voltou mais. Minha produção aumentou 89% na safra seguinte.",
                  result: "💰 Economia: R$ 3.500 | 📈 Aumento: 89%",
                  color: "green"
                },
                {
                  image: "https://mocha-cdn.com/0199bb8b-29fd-75a3-9db8-426c2e92c7bc/maria-testimonial.jpg",
                  name: "Maria Silva", 
                  location: "1,5 hectares - Ceará",
                  testimonial: "Estava gastando R$ 1.200 por hectare com trips. Agora gasto R$ 180 e tenho controle total. Lucro líquido subiu R$ 8.160!",
                  result: "💰 Economia mensal: R$ 8.160 | 🎯 Controle: 100%",
                  color: "blue"
                },
                {
                  image: "https://mocha-cdn.com/0199bb8b-29fd-75a3-9db8-426c2e92c7bc/antonio-testimonial.jpg",
                  name: "Antônio Santos",
                  location: "1 hectare - Pernambuco", 
                  testimonial: "Ia cortar a plantação por causa das viroses. O sistema salvou meu negócio! Hoje tenho a melhor lavoura da região.",
                  result: "🏆 Melhor lavoura da região | 💪 Negócio salvo",
                  color: "purple"
                }
              ].map((testimonial, index) => (
                <div key={index} className={`bg-white p-4 sm:p-6 rounded-lg shadow-lg border-2 border-${testimonial.color}-200`}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <OptimizedImage
                      src={testimonial.image}
                      alt={`Foto de ${testimonial.name}`}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base">{testimonial.name}</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">{testimonial.location}</p>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-3 sm:mb-4 text-xs sm:text-sm">
                    "{testimonial.testimonial}"
                  </p>
                  <div className={`bg-${testimonial.color}-100 p-2 sm:p-3 rounded text-${testimonial.color}-800 font-semibold text-xs sm:text-sm`}>
                    {testimonial.result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </LazySection>

      {/* Urgency Section */}
      <LazySection id="urgency" className="bg-gradient-to-r from-red-600 to-red-700 py-8 sm:py-12 md:py-16 text-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-6 px-2">⚠️ ATENÇÃO: OFERTA LIMITADA!</h2>
            
            <div className="bg-white text-gray-800 p-4 sm:p-8 rounded-lg shadow-2xl mb-6 sm:mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center">
                  <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold mb-2">APENAS HOJE!</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Esta oferta especial expira em menos de 1 hora. Depois volta ao preço normal de R$ 297.
                  </p>
                </div>
                <div className="text-center">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold mb-2">ÚLTIMAS VAGAS!</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Restam apenas 23 vagas para garantir suporte personalizado via WhatsApp.
                  </p>
                </div>
              </div>
              <div className="bg-red-100 p-3 sm:p-4 rounded-lg mt-4 sm:mt-6">
                <p className="text-red-800 font-bold text-base sm:text-lg">
                  🚨 Cada minuto que passa = R$ 20 de prejuízo na sua lavoura!
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                trackButtonClick('GARANTIR MINHA VAGA AGORA!', 'urgency_section', 'cta_urgency');
                scrollToCheckout();
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-red-600 font-black py-4 sm:py-6 px-6 sm:px-12 rounded-full text-base sm:text-xl transform hover:scale-105 transition-all duration-200 shadow-2xl animate-pulse w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              GARANTIR MINHA VAGA AGORA!
            </button>
          </div>
        </div>
      </LazySection>

      {/* Checkout Section */}
      <LazySection id="checkout" className="bg-gray-50 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-8 border-4 border-green-500">
              <div className="text-center mb-6 sm:mb-8">
                <div className="bg-green-600 text-white p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-black mb-2">🎯 GARANTA SEU ACESSO AGORA!</h2>
                  <p className="text-green-100 text-sm sm:text-base">Transforme sua lavoura em 28 dias ou seu dinheiro de volta!</p>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
                  <div className="text-xs sm:text-sm font-bold mb-2">🔥 OFERTA RELÂMPAGO - SÓ HOJE!</div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-2">
                    <div className="text-3xl sm:text-4xl font-black">R$ 39,90</div>
                    <div className="text-lg sm:text-xl line-through opacity-75">R$ 297,00</div>
                    <div className="bg-yellow-400 text-red-600 px-2 sm:px-3 py-1 sm:py-2 rounded-full font-black text-xs sm:text-sm">87% OFF</div>
                  </div>
                  <div className="text-xs sm:text-sm">💳 Ou 12x de R$ 3,99 sem juros no cartão</div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-400 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                  <h3 className="font-bold text-yellow-800 mb-2 sm:mb-3 text-sm sm:text-base">🎁 BÔNUS EXCLUSIVOS (Valor: R$ 497)</h3>
                  <div className="text-left space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    {[
                      "📱 Suporte via WhatsApp por 30 dias",
                      "📊 Planilha de controle e monitoramento", 
                      "🎥 Vídeos práticos de aplicação",
                      "📋 Lista de produtos por região"
                    ].map((bonus, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CircleCheckBig className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        <span>{bonus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs">
                  {[
                    { icon: Shield, text: "Garantia 30 Dias", color: "green" },
                    { icon: Download, text: "Acesso Imediato", color: "blue" },
                    { icon: Phone, text: "Suporte Total", color: "purple" }
                  ].map((item, index) => (
                    <div key={index} className={`flex flex-col items-center gap-1 bg-${item.color}-50 p-2 sm:p-3 rounded`}>
                      <item.icon className={`w-4 h-4 sm:w-6 sm:h-6 text-${item.color}-600`} />
                      <span className="font-semibold text-center">{item.text}</span>
                    </div>
                  ))}
                </div>

                <a 
                  href="https://go.allpes.com.br/r1wl4qyyfv" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => handleCheckoutClick('checkout_section', 'GARANTIR ACESSO POR R$ 39,90')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 sm:py-6 px-4 sm:px-6 rounded-lg text-base sm:text-xl transform hover:scale-105 transition-all duration-200 shadow-2xl inline-flex items-center justify-center gap-2 sm:gap-3"
                >
                  <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" />
                  GARANTIR ACESSO POR R$ 39,90
                </a>

                <div className="text-center text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4 space-y-1">
                  <p>🔒 Compra 100% segura e protegida</p>
                  <p>✅ Garantia incondicional de 30 dias</p>
                  <p>⚡ Acesso liberado em até 2 minutos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LazySection>

      {/* Footer */}
      <LazySection className="bg-green-800 text-white py-6 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-2">
              🚀 Não deixe o trips destruir mais um dia da sua lavoura!
            </h3>
            <p className="text-green-200 mb-4 sm:mb-6 text-sm sm:text-base px-2">
              Mais de 1.247 produtores já transformaram suas lavouras. <strong>Você será o próximo?</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-green-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold">R$ 39,90</div>
                <div className="text-xs sm:text-sm text-green-200">87% de desconto</div>
              </div>
              <button 
                onClick={() => {
                  trackButtonClick('GARANTIR AGORA', 'footer_section', 'cta_footer');
                  scrollToCheckout();
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-lg w-full sm:w-auto inline-flex items-center justify-center gap-1 sm:gap-2 transition-all"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                GARANTIR AGORA
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold mb-1 sm:mb-2">📞 Contato</h4>
                <p className="text-green-200">maracujalucrativo@gmail.com</p>
              </div>
              <div>
                <h4 className="font-bold mb-1 sm:mb-2">🔒 Segurança</h4>
                <p className="text-green-200">Compra protegida e garantida</p>
              </div>
              <div>
                <h4 className="font-bold mb-1 sm:mb-2">📋 Políticas</h4>
                <p className="text-green-200">Termos • Privacidade • Reembolso</p>
              </div>
            </div>
          </div>
        </div>
      </LazySection>
    </div>
  );
}
