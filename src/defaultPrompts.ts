import { Prompt } from "./types";

export const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: "def_1",
    title: "Retrato Cyberpunk",
    instructions: "Hiper-realistic portrait of a cyberpunk character, male or female, neon skin markings, detailed cybernetic eye implants, set against a dark rainy Tokyo street background with vibrant glowing billboards. Intricate details, cinematic lighting, 8k resolution, photorealistic, Unreal Engine 5 render. Style: Neo-noir, cybernetic, cyberpunk. --ar 16:9 --v 6.0",
    description: "Genera retratos hiper-realistas con estética futurista y saturación de neón ideal para avatares y arte conceptual.",
    category: "Portrait",
    model: "Midjourney",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBG8oEAuXaV9xqKr33FqRMhVLtTCInvnXu4cmodup97O7jHNZOVmgXcWfEO4KaaYZC4Q-4UlXwGZuuc0RqrSK5tBJ1JZgZ7FOBObdqj_cGALIpwvuMsdA1bjYDVV2zEaJK8W1a0eR1__5pXEpZvxEZW7YFlFxURUAcsUWrO7zqRji7mZJ4sh8YCcjD11rU_4nBUadrM6C32WqpWF4NMvaKFeyHoSI3-8ur-0TNH1nyRQzrJZ6eldpzDHBZ5wOa1ihgubTL0LtAWw0A",
    authorId: "community",
    authorEmail: "community@promptlib.io",
    createdAt: new Date("2026-06-25T12:00:00Z").toISOString(),
    isCommunity: true
  },
  {
    id: "def_2",
    title: "BioTech Laboratory",
    instructions: "3D isometric scene of a high-tech BioTech Laboratory, glowing glass incubators with bioluminescent plants inside, holographic screens showcasing DNA helix models, futuristic robotic arm pipetting samples, sterile metallic counters, soft cyan and emerald green illumination, detailed sci-fi illustration style, volumetric mist.",
    description: "Escenas isométricas en 3D ideales para proyectos de ciencia ficción, interfaces de juegos y recursos visuales corporativos.",
    category: "Isometric",
    model: "DALL-E 3",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRZYzgtLqG7TtatDx0weP_ZU7scQdh5XsKTzCJBatuEhnt-U9pCHnX_Fq5tAVyKS22Y7-D2c_AptOxasseQW6HaSExPH-eFvNFe33ofRnwDKAz1xeYVQSQ75YZEGdU6RhseDCUm2gjBAZHlgwdOh-1GgWf_dkt77ZPnq_dxpplvjHhpTie8yjExL_0a0l266afPKZctcslB8bAqP6sbRAYIbcJeZVURS8G9zBHHcSft4R5Ldymi_8ytN61DUfQVVsP4wJlEBlFgGo",
    authorId: "community",
    authorEmail: "community@promptlib.io",
    createdAt: new Date("2026-06-26T12:00:00Z").toISOString(),
    isCommunity: true
  },
  {
    id: "def_3",
    title: "Brutalismo Tropical",
    instructions: "Architectural photography of a tropical brutalist concrete villa nestled in a dense Costa Rican jungle. Raw concrete walls, massive glass windows reflecting palm trees, minimalist architecture, lush tropical plants draping from balconies, golden hour warm lighting, 35mm lens, high contrast, cinematic atmosphere, masterpiece.",
    description: "Fotografía de arquitectura moderna brutalista mezclada con vegetación exuberante, perfecta para portafolios y renders de diseño.",
    category: "Architecture",
    model: "Midjourney v6",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuByQKqvAR9EEvDy06VvEZv0usqrSzpNaumkBEaTKpj7xXMkkf0dy2zLfLWX2Iu-Vw06KTVgWBy03eY-ktGkkqem7pjy8oXlrLoKau6uOtX0GyJg4PRwXe14asaB4e4yLpIH_QJwaUs2tDHrGldz0pvkutd-KgW2d8_-KHP0Drc3BbtV-H0-t6UmN3sBKXM-8mTloH-0EMoU7MN3pudiy8EFJAmYBDo_bqB1GXvbLJIY0mjQ2xxOXu0H5GJYicR9jY33F400u-e7oto",
    authorId: "community",
    authorEmail: "community@promptlib.io",
    createdAt: new Date("2026-06-27T12:00:00Z").toISOString(),
    isCommunity: true
  },
  {
    id: "def_4",
    title: "Fluidez Cósmica",
    instructions: "Abstract cosmic fluid background, swirling nebulas with liquid glass textures, soft violet, deep indigo, and iridescent gold colors blending seamlessly. Microscopic glitter, high luxury design, elegant wave patterns, fluid art, extremely smooth gradient, wallpaper quality, 4k render.",
    description: "Fondos abstractos de alta calidad con texturas fluidas e iridiscentes para uso en presentaciones digitales, banners y web design.",
    category: "Abstract",
    model: "Stable Diffusion",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJQT3u8SuGFxYetqo6NTjXTaZ-AUL5S9zYTkXhVBEnm3buqhpgzGE_qmObCzyI0Q3MgmlHHiFRXFWBC1-VlHd888J7INpD3-B3fRzfv5MS161sdGehA9kKQrbvsJNPsgArY9DkM3ZPHdcDzhE6IDWhB7kfsntgWPwKxkbkwWD3CF1dQZ61M4JwrS_oBE1cOBwj5q5NzJGmTCS_ogvLLERHpV9QSvH-KY6VE7fviQM39zA2ShikVHeTKCdNJMRoxDzDBqsIhR4_CaM",
    authorId: "community",
    authorEmail: "community@promptlib.io",
    createdAt: new Date("2026-06-28T12:00:00Z").toISOString(),
    isCommunity: true
  },
  {
    id: "def_5",
    title: "Anatomía Sintética",
    instructions: "Technical botanical illustration of a cybernetic synthetic flower, detailed cross-section view showing wiring, glowing fiber-optic stamens, copper vein structures inside leaves, blueprints layout on a grid pattern background, technical drawings labeling parts, minimalist clean aesthetic, black and white with neon cyan accents.",
    description: "Ilustraciones técnicas médicas o mecánicas que muestran la anatomía de seres o plantas híbridas, ideal para revistas de ciencia y arte.",
    category: "Technical",
    model: "DALL-E 3",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDz-zkYpJ6f39g201WrOzSyLUsyYZEH9jofV0orl8SE-yiv7Rqbwrtp76YsqSlb7TcvRrW2wqprCCsFmXtBsrS4uFjaT1b1QmQ-Ox3O78Y0Wo9QoGrkC6m0ar0_VVvopVIC1HTC3iCPLkG67TDl80eVQabnYt8MZMI0LEsxATOlLBHsPr80Vlmvo-vj7uZPBw1BgYwaCqH8pGRYvSVGDbUD_TngHOx-sUxGw5gTiYhDksgbN7ZYfOyJumIDGLIAsj7BgQvsu8ssI70",
    authorId: "community",
    authorEmail: "community@promptlib.io",
    createdAt: new Date("2026-06-29T12:00:00Z").toISOString(),
    isCommunity: true
  },
  {
    id: "def_6",
    title: "Nostalgia Brutalista",
    instructions: "Interior design photorealistic shot of a mid-century modern living room inside a brutalist architecture loft. Unpolished concrete walls, warm wooden bookshelves filled with books and plants, a dark brown leather Eames lounge chair, large glass sliding doors opening to a quiet grey rain scene, cozy soft floor lamp lighting, highly detailed film grain, realistic architectural digest style.",
    description: "Escenas de interiores de casas de diseño con juego de sombras, concreto rústico y materiales nobles como madera y cuero.",
    category: "Interior",
    model: "Midjourney",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3W2qrDFs31fCWMoI-oMq1dJZbw1ZIxHMzrqr-pddJFL9r0izi8J5T3280GTsHMtx2l0ENsFrvNGcAsTGV_vOCQmqhU4xSFI2yR-HtWjq1PdGSSy00umIIXUg6CLRHTjON8RiRnStfV0icRfpbV45xgl8339e_E0UEks9zIRWBOiqDadqiOHViDV2TprtrphHLCbA9MDL0w_ar9wnSm-RK6bqJLcRxD2_9Sz9Ya8JpWEN_BJSu2cOC7uI0pXK-C3dAJ_ud3PsAFSw",
    authorId: "community",
    authorEmail: "community@promptlib.io",
    createdAt: new Date("2026-06-30T12:00:00Z").toISOString(),
    isCommunity: true
  }
];
