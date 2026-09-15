window.languageLabels = {
  es: "ES",
  pt: "PT",
};

window.moments = [
  {
    id: "relevo-generacional",
    layout: "center",
    copy: {
      es: {
        kicker: "Future Leaders Forum · Fórum UPB",
        title: "RELEVO GENERACIONAL: LA VENTAJA QUE NADIE ESTÁ APROVECHANDO",
        subtitle: "@centrodeeventosupb",
      },
      pt: {
        kicker: "Future Leaders Forum · Fórum UPB",
        title: "RELEVO GERACIONAL: A VANTAGEM QUE NINGUÉM ESTÁ APROVEITANDO",
        subtitle: "@centrodeeventosupb",
      },
    },
    state: "latent",
    intensity: 0.3,
    colors: ["#08a9dd", "#f7353f", "#e96daa"],
    behavior: {
      structure: "loose_ring",
      linkOpacity: 0.05,
      pulseRate: 0.0,
      spread: 1.0,
      rotation: 0.1,
    },
  },
  {
    id: "auditorio-grados",
    layout: "left",
    copy: {
      es: {
        kicker: "Espacio",
        title: "¿Un gran auditorio solo para hacer grados?",
        subtitle: "",
      },
      pt: {
        kicker: "Espaço",
        title: "Um grande auditório apenas para formaturas?",
        subtitle: "",
      },
    },
    asset: {
      type: "image",
      src: "./assets/ceremonia-grados-placeholder.png",
      alt: "Ceremonia de grados en un auditorio universitario",
      placement: "background",
    },
    state: "architecture",
    intensity: 0.1,
    colors: ["#dde2e6", "#08a9dd", "#e96daa"],
    behavior: {
      structure: "grid",
      linkOpacity: 0.1,
      pulseRate: 0.0,
      spread: 0.8,
      rotation: 0.0,
    },
  },
  {
    id: "universidad-mundo",
    layout: "right",
    copy: {
      es: {
        kicker: "Encuentro",
        title: "Los eventos no llegaron a la Universidad. La Universidad decidió encontrarse con el mundo.",
        subtitle: "",
      },
      pt: {
        kicker: "Encontro",
        title: "Os eventos não chegaram à Universidade. A Universidade decidiu se encontrar com o mundo.",
        subtitle: "",
      },
    },
    state: "opening",
    intensity: 0.5,
    colors: ["#08a9dd", "#f7f7f4", "#f7353f"],
    behavior: {
      structure: "expanding_cloud",
      linkOpacity: 0.15,
      pulseRate: 0.2,
      spread: 1.5,
      rotation: 0.2,
    },
  },
  {
    id: "academia-industria-ciudad",
    layout: "left",
    copy: {
      es: {
        kicker: "Tres fuerzas",
        title: "Academia + Industria + Ciudad",
        subtitle: "",
      },
      pt: {
        kicker: "Três forças",
        title: "Academia + Indústria + Cidade",
        subtitle: "",
      },
    },
    state: "triad",
    intensity: 0.7,
    colors: ["#08a9dd", "#f7353f", "#e96daa"],
    behavior: {
      structure: "triad_clusters",
      linkOpacity: 0.25,
      pulseRate: 0.3,
      spread: 1.0,
      rotation: 0.4,
    },
  },
  {
    id: "impacto",
    layout: "right",
    copy: {
      es: {
        kicker: "Impacto",
        title: "Los eventos nunca fueron el objetivo. El impacto sí.",
        subtitle: "",
      },
      pt: {
        kicker: "Impacto",
        title: "Os eventos nunca foram o objetivo. O impacto, sim.",
        subtitle: "",
      },
    },
    state: "impact",
    intensity: 0.8,
    colors: ["#f7353f", "#e96daa", "#f7f7f4"],
    behavior: {
      structure: "triad_impact",
      linkOpacity: 0.4,
      pulseRate: 0.6,
      spread: 1.2,
      rotation: 0.5,
    },
  },
  {
    id: "comunidad",
    layout: "center",
    copy: {
      es: {
        kicker: "Comunidad",
        title: "Un evento trae personas. Una comunidad trae transformación.",
        subtitle: "",
      },
      pt: {
        kicker: "Comunidade",
        title: "Um evento traz pessoas. Uma comunidade traz transformação.",
        subtitle: "",
      },
    },
    state: "community",
    intensity: 0.6,
    colors: ["#08a9dd", "#e96daa", "#f7f7f4"],
    behavior: {
      structure: "constellation",
      linkOpacity: 0.5,
      pulseRate: 0.4,
      spread: 1.1,
      rotation: 0.3,
    },
  },
  {
    id: "confianza",
    layout: "left",
    copy: {
      es: {
        kicker: "Confianza",
        title: "El talento crece a la velocidad de la confianza.",
        subtitle: "",
      },
      pt: {
        kicker: "Confiança",
        title: "O talento cresce na velocidade da confiança.",
        subtitle: "",
      },
    },
    state: "trust",
    intensity: 0.8,
    colors: ["#08a9dd", "#e96daa", "#f7353f"],
    behavior: {
      structure: "constellation", 
      linkOpacity: 0.8,
      pulseRate: 0.9,
      spread: 1.0,
      rotation: 0.4,
    },
  },
  {
    id: "nuevas-rutas",
    layout: "right",
    copy: {
      es: {
        kicker: "Rutas",
        title: "La experiencia construye el camino. Las nuevas generaciones descubren nuevas rutas.",
        subtitle: "",
      },
      pt: {
        kicker: "Rotas",
        title: "A experiência constrói o caminho. As novas gerações descobrem novas rotas.",
        subtitle: "",
      },
    },
    state: "routes",
    intensity: 0.8,
    colors: ["#08a9dd", "#f7353f", "#e96daa"],
    behavior: {
      structure: "orbital_routes",
      linkOpacity: 0.4,
      pulseRate: 0.5,
      spread: 1.4,
      rotation: 0.8,
    },
  },
  {
    id: "vision-generaciones",
    layout: "left",
    copy: {
      es: {
        kicker: "Relevo",
        title: "Una visión. Dos generaciones.",
        subtitle: "",
      },
      pt: {
        kicker: "Revezamento",
        title: "Uma visão. Duas gerações.",
        subtitle: "",
      },
    },
    state: "duality",
    intensity: 0.7,
    colors: ["#f7f7f4", "#08a9dd", "#f7353f"],
    behavior: {
      structure: "dual_rings",
      linkOpacity: 0.2,
      pulseRate: 0.3,
      spread: 1.0,
      rotation: 0.5,
    },
  },
  {
    id: "trabajan-juntas",
    layout: "right",
    copy: {
      es: {
        kicker: "Composición",
        title: "El crecimiento no ocurre cuando una generación reemplaza a otra. Ocurre cuando trabajan juntas.",
        subtitle: "",
      },
      pt: {
        kicker: "Composição",
        title: "O crescimento não acontece quando uma geração substitui a outra. Acontece quando trabalham juntas.",
        subtitle: "",
      },
    },
    state: "convergence",
    intensity: 0.9,
    colors: ["#08a9dd", "#f7353f", "#e96daa"],
    behavior: {
      structure: "interlocking_rings",
      linkOpacity: 0.6,
      pulseRate: 0.8,
      spread: 0.9,
      rotation: 0.6,
    },
  },
  {
    id: "presente-joven",
    layout: "center",
    copy: {
      es: {
        kicker: "Presente",
        title: "Los jóvenes no son el futuro. Son el presente que muchas organizaciones aún no ven.",
        subtitle: "",
      },
      pt: {
        kicker: "Presente",
        title: "Os jovens não são o futuro. São o presente que muitas organizações ainda não veem.",
        subtitle: "",
      },
    },
    state: "present",
    intensity: 0.9,
    colors: ["#f7353f", "#08a9dd", "#f7f7f4"],
    behavior: {
      structure: "youth_forward",
      linkOpacity: 0.5,
      pulseRate: 0.6,
      spread: 1.2,
      rotation: 0.7,
    },
  },
  {
    id: "futuro-construido",
    layout: "center",
    copy: {
      es: {
        kicker: "Futuro construido",
        title: "El futuro no se hereda. Se construye.",
        subtitle: "",
      },
      pt: {
        kicker: "Futuro construído",
        title: "O futuro não se herda. Ele se constrói.",
        subtitle: "",
      },
    },
    state: "future",
    intensity: 1.0,
    colors: ["#f7f7f4", "#08a9dd", "#f7353f"],
    behavior: {
      structure: "mandala",
      linkOpacity: 0.8,
      pulseRate: 1.0,
      spread: 0.85,
      rotation: 0.3,
    },
  },
  {
    id: "qr-cierre",
    layout: "center",
    copy: {
      es: {
        kicker: "Continuidad",
        title: "@centrodeeventosupb",
        subtitle: "",
      },
      pt: {
        kicker: "Continuidade",
        title: "@centrodeeventosupb",
        subtitle: "",
      },
    },
    state: "qr",
    intensity: 0.6,
    colors: ["#f7f7f4", "#08a9dd", "#f7353f"],
    behavior: {
      structure: "mandala",
      linkOpacity: 0.4,
      pulseRate: 0.2,
      spread: 0.85,
      rotation: 0.1,
    },
  },
];