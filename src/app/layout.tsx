import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Controle de Trips - Economize até R$ 5.000 por Hectare",
  description: "Método validado pela EMBRAPA que elimina o trips de vez em 28 dias. Sistema de 4 fases com 94% de sucesso e economia de até R$ 5.000 por Hectare.",
  keywords: ["trips", "controle de trips", "maracujá", "agricultura", "EMBRAPA", "defensivos", "pragas", "sistema 4 fases"],
  openGraph: {
    title: "Sistema de Controle de Trips - Economize até R$ 5.000 por Hectare",
    description: "Elimine o trips de vez com método científico validado pela EMBRAPA. Economize milhares em defensivos ineficazes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* SCRIPT PARA RASTREAMENTO DE UTMS */}
        <Script
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          data-utmify-prevent-subids
          async
          defer
        />

        {/* SCRIPT DO PIXEL DA UTMIFY */}
        <Script
          id="utmify-pixel-script"
          dangerouslySetInnerHTML={{
            __html: `
              window.pixelId = "68aef5df7fe9644ed8977c6d";
              var a = document.createElement("script");
              a.setAttribute("async", "");
              a.setAttribute("defer", "");
              a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
              document.head.appendChild(a);
            `,
          }}
          strategy="afterInteractive"
        />

        {/* SCRIPT DE PROTEÇÃO CONTRA CÓPIA E SELEÇÃO */}
        <Script
          id="protection-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Bloquear seleção de texto
                function disableSelection(e) {
                  if (typeof e.onselectstart !== "undefined") {
                    e.onselectstart = function() { return false; };
                  } else if (typeof e.style.MozUserSelect !== "undefined") {
                    e.style.MozUserSelect = "none";
                  } else {
                    e.onmousedown = function() { return false; };
                  }
                  e.style.cursor = "default";
                }

                // Aplicar a todo o documento
                disableSelection(document.body);

                // Bloquear Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+S, Ctrl+U
                document.addEventListener('keydown', function(e) {
                  // Verificar se Ctrl está pressionado
                  if (e.ctrlKey || e.metaKey) {
                    switch (e.keyCode) {
                      case 67: // Ctrl+C
                      case 88: // Ctrl+X
                      case 65: // Ctrl+A
                      case 83: // Ctrl+S
                      case 85: // Ctrl+U
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                  }
                  
                  // Bloquear F12 (dev tools)
                  if (e.keyCode === 123) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                  
                  // Bloquear Ctrl+Shift+I (dev tools)
                  if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                  
                  // Bloquear Ctrl+Shift+J (dev tools)
                  if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                });

                // Bloquear clique direito
                document.addEventListener('contextmenu', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                });

                // Bloquear arrastar imagens
                document.addEventListener('dragstart', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                });

                // Bloquear print screen
                document.addEventListener('keyup', function(e) {
                  if (e.keyCode === 44) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                });

                // Detectar tentativas de copiar via clipboard
                document.addEventListener('copy', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                });

                document.addEventListener('cut', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                });

                // Bloquear seleção em elementos específicos
                document.addEventListener('selectstart', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                });

                // Adicionar CSS para bloquear seleção
                var style = document.createElement('style');
                style.innerHTML = \`
                  * {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                    -webkit-touch-callout: none !important;
                    -webkit-tap-highlight-color: transparent !important;
                  }
                  
                  *:focus {
                    outline: none !important;
                  }
                  
                  input, textarea, select {
                    -webkit-user-select: auto !important;
                    -moz-user-select: auto !important;
                    -ms-user-select: auto !important;
                    user-select: auto !important;
                  }
                \`;
                document.head.appendChild(style);

                // Console warning
                console.clear();
                console.log('%c⚠️ AVISO: Este conteúdo está protegido por direitos autorais. A cópia, reprodução ou distribuição não autorizada é proibida.', 'color: red; font-size: 16px; font-weight: bold;');

                // Detectar dev tools - DESATIVADO TEMPORARIAMENTE
                /*
                var devtools = {open: false, orientation: null};
                var threshold = 160;
                var devToolsCheck = setInterval(function() {
                  if (window.outerHeight - window.innerHeight > threshold || 
                      window.outerWidth - window.innerWidth > threshold) {
                    if (!devtools.open) {
                      devtools.open = true;
                      console.clear();
                      console.log('%c⚠️ Ferramentas de desenvolvedor detectadas.', 'color: orange; font-size: 14px; font-weight: bold;');
                      console.log('%cEsta página está protegida contra cópia não autorizada.', 'color: red; font-size: 12px;');
                      
                      // REMOVIDO: Recarregamento automático para evitar loop
                      // document.body.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #000; color: white; font-family: Arial, sans-serif; text-align: center; padding: 20px;"><h1>Acesso não autorizado detectado</h1><p>Por favor, feche as ferramentas de desenvolvedor para continuar.</p></div>';
                    }
                  } else {
                    devtools.open = false;
                  }
                }, 1000);
                */
              })();
            `,
          }}
          strategy="afterInteractive"
        />

        {/* SCRIPT ADICIONAL DE PROTEÇÃO DE IMAGENS */}
        <Script
          id="image-protection-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Proteção adicional para imagens
                document.addEventListener('DOMContentLoaded', function() {
                  var images = document.querySelectorAll('img');
                  
                  images.forEach(function(img) {
                    // Adicionar atributos de proteção
                    img.setAttribute('draggable', 'false');
                    img.setAttribute('ondragstart', 'return false');
                    img.setAttribute('oncontextmenu', 'return false');
                    img.setAttribute('onselectstart', 'return false');
                    img.setAttribute('oncopy', 'return false');
                    img.setAttribute('oncut', 'return false');
                    img.setAttribute('onpaste', 'return false');
                    
                    // Adicionar CSS inline
                    img.style.pointerEvents = 'none';
                    img.style.userSelect = 'none';
                    img.style.webkitUserSelect = 'none';
                    img.style.mozUserSelect = 'none';
                    img.style.msUserSelect = 'none';
                    img.style.khtmlUserSelect = 'none';
                    img.style.webkitTouchCallout = 'none';
                    img.style.webkitTapHighlightColor = 'transparent';
                    
                    // Bloquear eventos específicos da imagem
                    img.addEventListener('contextmenu', function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    });
                    
                    img.addEventListener('dragstart', function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    });
                    
                    img.addEventListener('mousedown', function(e) {
                      if (e.button === 2) { // Botão direito
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }
                    });
                    
                    img.addEventListener('selectstart', function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    });
                    
                    img.addEventListener('copy', function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    });
                    
                    img.addEventListener('cut', function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    });
                    
                    img.addEventListener('paste', function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    });
                    
                    // Prevenir salvamento via long press (mobile)
                    img.addEventListener('touchstart', function(e) {
                      e.preventDefault();
                    }, { passive: false });
                    
                    img.addEventListener('touchend', function(e) {
                      e.preventDefault();
                    }, { passive: false });
                    
                    img.addEventListener('touchmove', function(e) {
                      e.preventDefault();
                    }, { passive: false });
                  });
                  
                  // Adicionar watermark dinâmico nas imagens
                  function addWatermark() {
                    images.forEach(function(img) {
                      // Criar overlay de proteção
                      var overlay = document.createElement('div');
                      overlay.style.position = 'absolute';
                      overlay.style.top = '0';
                      overlay.style.left = '0';
                      overlay.style.width = '100%';
                      overlay.style.height = '100%';
                      overlay.style.backgroundColor = 'rgba(0,0,0,0.01)';
                      overlay.style.pointerEvents = 'none';
                      overlay.style.zIndex = '9999';
                      overlay.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Ctext x=\'50\' y=\'50\' font-family=\'Arial\' font-size=\'8\' fill=\'rgba(255,255,255,0.1)\' text-anchor=\'middle\'%3E© Protegido%3C/text%3E%3C/svg%3E")';
                      overlay.style.backgroundRepeat = 'repeat';
                      
                      // Envolver a imagem em um container
                      var wrapper = document.createElement('div');
                      wrapper.style.position = 'relative';
                      wrapper.style.display = 'inline-block';
                      
                      img.parentNode.insertBefore(wrapper, img);
                      wrapper.appendChild(img);
                      wrapper.appendChild(overlay);
                    });
                  }
                  
                  // Aplicar watermark após um pequeno delay
                  setTimeout(addWatermark, 1000);
                  
                  // Monitorar novas imagens adicionadas dinamicamente
                  var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      mutation.addedNodes.forEach(function(node) {
                        if (node.nodeName === 'IMG') {
                          addWatermark();
                        } else if (node.getElementsByTagName) {
                          var newImages = node.getElementsByTagName('img');
                          if (newImages.length > 0) {
                            addWatermark();
                          }
                        }
                      });
                    });
                  });
                  
                  observer.observe(document.body, {
                    childList: true,
                    subtree: true
                  });
                });
                
                // Bloquear tentativas de screenshot via JavaScript
                document.addEventListener('keyup', function(e) {
                  // Print Screen
                  if (e.keyCode === 44) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Adicionar overlay temporário
                    var overlay = document.createElement('div');
                    overlay.style.position = 'fixed';
                    overlay.style.top = '0';
                    overlay.style.left = '0';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                    overlay.style.backgroundColor = 'white';
                    overlay.style.zIndex = '999999';
                    overlay.style.pointerEvents = 'none';
                    document.body.appendChild(overlay);
                    
                    setTimeout(function() {
                      document.body.removeChild(overlay);
                    }, 100);
                    
                    return false;
                  }
                });
                
                // Detectar tentativas de imprimir
                window.addEventListener('beforeprint', function() {
                  document.body.style.visibility = 'hidden';
                  setTimeout(function() {
                    document.body.style.visibility = 'visible';
                  }, 1000);
                });
                
                // Console warning específico para imagens
                console.log('%c🛡️ Todas as imagens estão protegidas contra cópia e download não autorizado.', 'color: orange; font-size: 14px; font-weight: bold;');
              })();
            `,
          }}
          strategy="afterInteractive"
        />

        {/* SCRIPT DE PROTEÇÃO DE URL E PARÂMETROS DINÂMICOS - DESATIVADO TEMPORARIAMENTE */}
        {/* 
        <Script
          id="url-protection-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Sistema desativado temporariamente para evitar loops de redirecionamento
                console.log('%c🔒 Sistema de proteção de URL desativado temporariamente.', 'color: orange; font-size: 14px; font-weight: bold;');
              })();
            `,
          }}
          strategy="afterInteractive"
        />
        */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}


