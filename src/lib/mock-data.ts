import type { Product, User } from './types';

// Imagens placeholder usando picsum.photos
const placeholderImage = (id: number, category: string) =>
  `https://picsum.photos/seed/${category}-${id}/600/600.jpg`;

export const mockProducts: Product[] = [
  // Processadores
  {
    id: '1',
    slug: 'amd-ryzen-7-7800x3d',
    name: 'AMD Ryzen 7 7800X3D',
    description: 'Processador AMD Ryzen 7 7800X3D, 8 núcleos, 16 threads, cache 3D V-Cache de 96MB, clock base 4.2GHz / boost 5.0GHz. Soquete AM5. Ideal para gaming de alto desempenho.',
    shortDescription: 'Processador 8 núcleos 16 threads com 3D V-Cache para gaming extremo.',
    price: 219990, // R$ 2.199,90
    compareAtPrice: 249990,
    images: [
      placeholderImage(1, 'cpu-amd'),
      placeholderImage(2, 'cpu-amd'),
    ],
    category: 'Processadores',
    stock: 15,
    isActive: true,
    featured: true,
    tags: ['amd', 'ryzen', '7800x3d', 'gaming', 'am5'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    slug: 'intel-core-i7-14700k',
    name: 'Intel Core i7-14700K',
    description: 'Processador Intel Core i7-14700K, 20 núcleos (8 P-cores + 12 E-cores), 28 threads, clock até 5.6GHz. Soquete LGA1700. Desempenho excepcional para gaming e produtividade.',
    shortDescription: 'Processador 20 núcleos 28 threads, até 5.6GHz, LGA1700.',
    price: 239990,
    compareAtPrice: 269990,
    images: [
      placeholderImage(3, 'cpu-intel'),
      placeholderImage(4, 'cpu-intel'),
    ],
    category: 'Processadores',
    stock: 12,
    isActive: true,
    featured: true,
    tags: ['intel', 'core-i7', '14700k', 'gaming', 'produtividade', 'lga1700'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },

  // Placas de Vídeo
  {
    id: '3',
    slug: 'nvidia-rtx-4070-super',
    name: 'NVIDIA GeForce RTX 4070 Super 12GB',
    description: 'Placa de vídeo NVIDIA GeForce RTX 4070 Super, 12GB GDDR6X, 7168 CUDA Cores, DLSS 3, Ray Tracing. 2 slots, 285W TDP. Excelente para gaming 1440p/4K.',
    shortDescription: 'RTX 4070 Super 12GB GDDR6X, DLSS 3, Ray Tracing.',
    price: 389990,
    compareAtPrice: 429990,
    images: [
      placeholderImage(5, 'gpu-nvidia'),
      placeholderImage(6, 'gpu-nvidia'),
    ],
    category: 'Placas de Vídeo',
    stock: 8,
    isActive: true,
    featured: true,
    tags: ['nvidia', 'rtx-4070', 'super', '12gb', 'gaming', 'dlss3'],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '4',
    slug: 'amd-radeon-rx-7900-xtx',
    name: 'AMD Radeon RX 7900 XTX 24GB',
    description: 'Placa de vídeo AMD Radeon RX 7900 XTX, 24GB GDDR6, 6144 Stream Processors, arquitetura RDNA 3. Suporte a FSR 3, Ray Tracing. Flagship da AMD para 4K gaming.',
    shortDescription: 'RX 7900 XTX 24GB GDDR6, RDNA 3, flagship AMD.',
    price: 549990,
    images: [
      placeholderImage(7, 'gpu-amd'),
      placeholderImage(8, 'gpu-amd'),
    ],
    category: 'Placas de Vídeo',
    stock: 5,
    isActive: true,
    featured: false,
    tags: ['amd', 'radeon', 'rx-7900-xtx', '24gb', 'rdna3', '4k-gaming'],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },

  // Memória RAM
  {
    id: '5',
    slug: 'corsair-vengeance-32gb-6000mhz',
    name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz',
    description: 'Kit de memória Corsair Vengeance RGB DDR5, 32GB (2x16GB), 6000MHz CL36, Intel XMP 3.0 / AMD EXPO compatível. Dissipador de alumínio, iluminação RGB personalizável via iCUE.',
    shortDescription: 'Kit 32GB DDR5 6000MHz CL36 RGB, XMP/EXPO.',
    price: 64990,
    compareAtPrice: 74990,
    images: [
      placeholderImage(9, 'ram-corsair'),
      placeholderImage(10, 'ram-corsair'),
    ],
    category: 'Memória RAM',
    stock: 25,
    isActive: true,
    featured: true,
    tags: ['corsair', 'vengeance', 'ddr5', '32gb', '6000mhz', 'rgb'],
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-05T10:00:00Z',
  },
  {
    id: '6',
    slug: 'gskill-trident-z5-32gb-6400mhz',
    name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz',
    description: 'Memória G.Skill Trident Z5 RGB DDR5, 32GB (2x16GB), 6400MHz CL32, perfil Intel XMP 3.0. Design icônico Trident Z, alumínio escovado, RGB endereçável.',
    shortDescription: 'Trident Z5 32GB DDR5 6400MHz CL32 RGB premium.',
    price: 89990,
    images: [
      placeholderImage(11, 'ram-gskill'),
      placeholderImage(12, 'ram-gskill'),
    ],
    category: 'Memória RAM',
    stock: 18,
    isActive: true,
    featured: false,
    tags: ['gskill', 'trident-z5', 'ddr5', '32gb', '6400mhz', 'rgb'],
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },

  // Armazenamento (SSD)
  {
    id: '7',
    slug: 'samsung-990-pro-2tb',
    name: 'Samsung 990 PRO 2TB NVMe M.2',
    description: 'SSD Samsung 990 PRO 2TB, NVMe PCIe 4.0 M.2 2280. Leitura até 7450 MB/s, escrita até 6900 MB/s. Controlador proprietário Samsung, 5 anos de garantia. Ideal para gaming e workloads pesados.',
    shortDescription: 'SSD NVMe PCIe 4.0 2TB, 7450/6900 MB/s, 5 anos garantia.',
    price: 79990,
    compareAtPrice: 94990,
    images: [
      placeholderImage(13, 'ssd-samsung'),
      placeholderImage(14, 'ssd-samsung'),
    ],
    category: 'Armazenamento',
    stock: 30,
    isActive: true,
    featured: true,
    tags: ['samsung', '990-pro', '2tb', 'nvme', 'pcie4', 'm2'],
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
  {
    id: '8',
    slug: 'wd-black-sn850x-1tb',
    name: 'WD BLACK SN850X 1TB NVMe M.2',
    description: 'SSD WD BLACK SN850X 1TB, NVMe PCIe 4.0 M.2 2280. Leitura 7300 MB/s, escrita 6600 MB/s. Com dissipador de calor opcional, 5 anos garantia. Otimizado para gaming.',
    shortDescription: 'WD BLACK SN850X 1TB PCIe 4.0, 7300/6600 MB/s.',
    price: 44990,
    compareAtPrice: 52990,
    images: [
      placeholderImage(15, 'ssd-wd'),
      placeholderImage(16, 'ssd-wd'),
    ],
    category: 'Armazenamento',
    stock: 35,
    isActive: true,
    featured: false,
    tags: ['wd', 'black', 'sn850x', '1tb', 'nvme', 'pcie4', 'gaming'],
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z',
  },

  // Placas-mãe
  {
    id: '9',
    slug: 'asus-rog-strix-b650e-f',
    name: 'ASUS ROG STRIX B650E-F Gaming WiFi',
    description: 'Placa-mãe ASUS ROG STRIX B650E-F, soquete AM5, chipset B650E, DDR5, PCIe 5.0 x16 e M.2, WiFi 6E, 2.5G LAN, áudio SupremeFX, RGB Aura Sync. VRM robusto 14+2 fases.',
    shortDescription: 'Placa-mãe AM5 B650E, DDR5, PCIe 5.0, WiFi 6E, VRM 14+2.',
    price: 149990,
    compareAtPrice: 169990,
    images: [
      placeholderImage(17, 'mobo-asus'),
      placeholderImage(18, 'mobo-asus'),
    ],
    category: 'Placas-mãe',
    stock: 10,
    isActive: true,
    featured: true,
    tags: ['asus', 'rog', 'strix', 'b650e', 'am5', 'ddr5', 'wifi6e'],
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
  {
    id: '10',
    slug: 'msi-mpg-z790-carbon-wifi',
    name: 'MSI MPG Z790 CARBON WiFi',
    description: 'Placa-mãe MSI MPG Z790 CARBON, soquete LGA1700, chipset Z790, DDR5, PCIe 5.0, WiFi 7, 2.5G LAN, DDR5 até 7800MHz+, M.2 Shield Frozr, Mystic Light RGB.',
    shortDescription: 'Placa-mãe LGA1700 Z790, DDR5, PCIe 5.0, WiFi 7.',
    price: 179990,
    images: [
      placeholderImage(19, 'mobo-msi'),
      placeholderImage(20, 'mobo-msi'),
    ],
    category: 'Placas-mãe',
    stock: 8,
    isActive: true,
    featured: false,
    tags: ['msi', 'mpg', 'z790', 'carbon', 'lga1700', 'ddr5', 'wifi7'],
    createdAt: '2024-03-05T10:00:00Z',
    updatedAt: '2024-03-05T10:00:00Z',
  },

  // Fontes
  {
    id: '11',
    slug: 'corsair-rm1000e-1000w',
    name: 'Corsair RM1000e 1000W 80 Plus Gold',
    description: 'Fonte Corsair RM1000e, 1000W, 80 Plus Gold, totalmente modular, ventoinha 140mm RPM zero, capacitores japoneses 105°C, 10 anos de garantia. Certificada ATX 3.0 / PCIe 5.0.',
    shortDescription: 'Fonte 1000W 80+ Gold full modular, ATX 3.0, 10 anos garantia.',
    price: 74990,
    compareAtPrice: 84990,
    images: [
      placeholderImage(21, 'psu-corsair'),
      placeholderImage(22, 'psu-corsair'),
    ],
    category: 'Fontes',
    stock: 20,
    isActive: true,
    featured: true,
    tags: ['corsair', 'rm1000e', '1000w', '80plus-gold', 'modular', 'atx3'],
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z',
  },
  {
    id: '12',
    slug: 'seasonic-focus-gx-850',
    name: 'Seasonic Focus GX-850 850W 80 Plus Gold',
    description: 'Fonte Seasonic Focus GX-850, 850W, 80 Plus Gold, full modular, ventoinha FDB 120mm, modo híbrido silencioso, 10 anos garantia. Compacta 140mm profundidade.',
    shortDescription: 'Seasonic Focus GX-850 850W Gold full modular, 10 anos garantia.',
    price: 59990,
    images: [
      placeholderImage(23, 'psu-seasonic'),
      placeholderImage(24, 'psu-seasonic'),
    ],
    category: 'Fontes',
    stock: 22,
    isActive: true,
    featured: false,
    tags: ['seasonic', 'focus-gx', '850w', '80plus-gold', 'modular'],
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },

  // Gabinetes
  {
    id: '13',
    slug: 'liquido-mesh-200-rgb',
    name: 'Lian Li LANCOOL 216 RGB',
    description: 'Gabinete Lian Li LANCOOL 216 RGB, mid-tower, painel frontal mesh, 3 ventoinhas ARGB 140mm pré-instaladas, suporte radiador 360mm superior/frontal, vidro temperado, gestão de cabos excelente.',
    shortDescription: 'Gabinete mid-tower mesh, 3x ARGB 140mm, suporte 360mm rad.',
    price: 54990,
    compareAtPrice: 62990,
    images: [
      placeholderImage(25, 'case-lianli'),
      placeholderImage(26, 'case-lianli'),
    ],
    category: 'Gabinetes',
    stock: 18,
    isActive: true,
    featured: true,
    tags: ['lian-li', 'lancool', '216', 'rgb', 'mesh', 'mid-tower'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: '14',
    slug: 'fractal-north-charcoal',
    name: 'Fractal Design North Charcoal TG',
    description: 'Gabinete Fractal Design North Charcoal, mid-tower, painel frontal em madeira/tela, 2 ventoinhas Aspect 14 PWM pré-instaladas, suporte radiador 360mm, vidro temperado, design escandinavo minimalista.',
    shortDescription: 'Gabinete design escandinavo, painel madeira, 2x Aspect 14 PWM.',
    price: 69990,
    images: [
      placeholderImage(27, 'case-fractal'),
      placeholderImage(28, 'case-fractal'),
    ],
    category: 'Gabinetes',
    stock: 12,
    isActive: true,
    featured: false,
    tags: ['fractal', 'north', 'charcoal', 'madeira', 'design', 'mid-tower'],
    createdAt: '2024-03-25T10:00:00Z',
    updatedAt: '2024-03-25T10:00:00Z',
  },

  // Water Coolers
  {
    id: '15',
    slug: 'nzxt-kraken-360-rgb',
    name: 'NZXT Kraken 360 RGB',
    description: 'Water cooler AIO NZXT Kraken 360 RGB, radiador 360mm, 3 ventoinhas F120P RGB, bomba com display LCD 2.36" personalizável, suporte Intel LGA1700/AM5, CAM software.',
    shortDescription: 'AIO 360mm LCD display, 3x F120P RGB, Intel/AM5.',
    price: 89990,
    compareAtPrice: 99990,
    images: [
      placeholderImage(29, 'aio-nzxt'),
      placeholderImage(30, 'aio-nzxt'),
    ],
    category: 'Water Coolers',
    stock: 10,
    isActive: true,
    featured: true,
    tags: ['nzxt', 'kraken', '360', 'rgb', 'lcd', 'aio', 'watercooler'],
    createdAt: '2024-04-01T10:00:00Z',
    updatedAt: '2024-04-01T10:00:00Z',
  },
  {
    id: '16',
    slug: 'arctic-liquid-freezer-3-360',
    name: 'ARCTIC Liquid Freezer III 360',
    description: 'Water cooler AIO ARCTIC Liquid Freezer III 360, radiador 360mm, 3 ventoinhas P14 PWM PST, bomba com offset para VRAM, 6 anos garantia. Performance topo de linha custo-benefício.',
    shortDescription: 'AIO 360mm, offset VRAM, 3x P14 PWM, 6 anos garantia.',
    price: 64990,
    images: [
      placeholderImage(31, 'aio-arctic'),
      placeholderImage(32, 'aio-arctic'),
    ],
    category: 'Water Coolers',
    stock: 15,
    isActive: true,
    featured: false,
    tags: ['arctic', 'liquid-freezer', '360', 'aio', 'vrram-offset', 'custo-beneficio'],
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-04-05T10:00:00Z',
  },

  // Periféricos - Teclados
  {
    id: '17',
    slug: 'keychron-q1-pro',
    name: 'Keychron Q1 Pro QMK/VIA Wireless',
    description: 'Teclado mecânico Keychron Q1 Pro 75%, QMK/VIA, wireless 2.4GHz/Bluetooth, hot-swap, corpo alumínio CNC, keycaps PBT double-shot, switches Gateron Jupiter pré-lubrificados, bateria 4000mAh.',
    shortDescription: 'Teclado 75% wireless alumínio, QMK/VIA, hot-swap, Gateron Jupiter.',
    price: 89990,
    compareAtPrice: 99990,
    images: [
      placeholderImage(33, 'kb-keychron'),
      placeholderImage(34, 'kb-keychron'),
    ],
    category: 'Teclados',
    stock: 20,
    isActive: true,
    featured: true,
    tags: ['keychron', 'q1-pro', '75%', 'wireless', 'qmk', 'via', 'aluminio', 'hot-swap'],
    createdAt: '2024-04-10T10:00:00Z',
    updatedAt: '2024-04-10T10:00:00Z',
  },
  {
    id: '18',
    slug: 'logitech-g915-tkl',
    name: 'Logitech G915 TKL Lightspeed',
    description: 'Teclado gaming Logitech G915 TKL sem fio Lightspeed, switches GL táteis low-profile, RGB LIGHTSYNC, alumínio aircraft-grade, 40h bateria, teclas multimídia dedicadas, volume roller.',
    shortDescription: 'TKL wireless Lightspeed, switches low-profile GL, alumínio, 40h bateria.',
    price: 119990,
    images: [
      placeholderImage(35, 'kb-logitech'),
      placeholderImage(36, 'kb-logitech'),
    ],
    category: 'Teclados',
    stock: 14,
    isActive: true,
    featured: false,
    tags: ['logitech', 'g915', 'tkl', 'lightspeed', 'wireless', 'low-profile', 'rgb'],
    createdAt: '2024-04-15T10:00:00Z',
    updatedAt: '2024-04-15T10:00:00Z',
  },

  // Periféricos - Mouses
  {
    id: '19',
    slug: 'logitech-g-pro-x-superlight-2',
    name: 'Logitech G Pro X Superlight 2',
    description: 'Mouse gaming Logitech G Pro X Superlight 2, 60g, sensor HERO 2 32.000 DPI, Lightspeed wireless, 5 botões, switches LIGHTFORCE híbridos, 95h bateria, PTFE feet.',
    shortDescription: 'Mouse 60g, HERO 2 32K DPI, Lightspeed, 95h bateria, switches híbridos.',
    price: 79990,
    compareAtPrice: 89990,
    images: [
      placeholderImage(37, 'mouse-logitech'),
      placeholderImage(38, 'mouse-logitech'),
    ],
    category: 'Mouses',
    stock: 30,
    isActive: true,
    featured: true,
    tags: ['logitech', 'g-pro-x', 'superlight-2', '60g', 'hero2', 'wireless', 'esports'],
    createdAt: '2024-04-20T10:00:00Z',
    updatedAt: '2024-04-20T10:00:00Z',
  },
  {
    id: '20',
    slug: 'razer-deathadder-v3-pro',
    name: 'Razer DeathAdder V3 Pro',
    description: 'Mouse gaming Razer DeathAdder V3 Pro, 63g, sensor Focus Pro 30K DPI, HyperSpeed wireless, 5 botões, switches ópticos Gen-3 90M clicks, 90h bateria, forma ergonômica direita.',
    shortDescription: 'Mouse ergonômico 63g, Focus Pro 30K, HyperSpeed, 90h.',
    price: 74990,
    images: [
      placeholderImage(39, 'mouse-razer'),
      placeholderImage(40, 'mouse-razer'),
    ],
    category: 'Mouses',
    stock: 25,
    isActive: true,
    featured: false,
    tags: ['razer', 'deathadder', 'v3-pro', '63g', 'focus-pro', 'wireless', 'ergonomico'],
    createdAt: '2024-04-25T10:00:00Z',
    updatedAt: '2024-04-25T10:00:00Z',
  },

  // Monitores
  {
    id: '21',
    slug: 'lg-27gp95r-b-27-4k-144hz',
    name: 'LG UltraGear 27GP95R-B 27" 4K 144Hz',
    description: 'Monitor LG UltraGear 27" 4K UHD (3840x2160), 144Hz, Nano IPS, 1ms GtG, HDR 600, G-Sync Compatible / FreeSync Premium, HDMI 2.1, DisplayPort 1.4, 98% DCI-P3.',
    shortDescription: 'Monitor 27" 4K 144Hz Nano IPS, HDR600, HDMI 2.1, 98% DCI-P3.',
    price: 249990,
    compareAtPrice: 289990,
    images: [
      placeholderImage(41, 'monitor-lg'),
      placeholderImage(42, 'monitor-lg'),
    ],
    category: 'Monitores',
    stock: 10,
    isActive: true,
    featured: true,
    tags: ['lg', 'ultragear', '27gp95r', '27', '4k', '144hz', 'nano-ips', 'hdr600'],
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-01T10:00:00Z',
  },
  {
    id: '22',
    slug: 'samsung-odyssey-g7-32-qhd',
    name: 'Samsung Odyssey G7 32" QHD 240Hz Curvo',
    description: 'Monitor Samsung Odyssey G7 32" QHD (2560x1440), 240Hz, 1000R curvatura, VA, 1ms GtG, HDR 600, G-Sync / FreeSync Premium Pro, HDMI 2.1, DisplayPort 1.4, 95% DCI-P3.',
    shortDescription: 'Monitor 32" QHD 240Hz 1000R curvo, VA, HDR600, HDMI 2.1.',
    price: 189990,
    images: [
      placeholderImage(43, 'monitor-samsung'),
      placeholderImage(44, 'monitor-samsung'),
    ],
    category: 'Monitores',
    stock: 8,
    isActive: true,
    featured: false,
    tags: ['samsung', 'odyssey', 'g7', '32', 'qhd', '240hz', 'curvo', '1000r'],
    createdAt: '2024-05-05T10:00:00Z',
    updatedAt: '2024-05-05T10:00:00Z',
  },

  // Headsets
  {
    id: '23',
    slug: 'steelseries-arctis-nova-pro-wireless',
    name: 'SteelSeries Arctis Nova Pro Wireless',
    description: 'Headset SteelSeries Arctis Nova Pro Wireless, drivers 40mm Hi-Fi, áudio espacial 360°, cancelamento ativo ruído (ANC), dual wireless 2.4GHz + Bluetooth, bateria hot-swap infinita, DAC USB.',
    shortDescription: 'Headset wireless Hi-Fi, ANC, dual wireless, bateria hot-swap, DAC.',
    price: 129990,
    compareAtPrice: 149990,
    images: [
      placeholderImage(45, 'headset-steelseries'),
      placeholderImage(46, 'headset-steelseries'),
    ],
    category: 'Headsets',
    stock: 12,
    isActive: true,
    featured: true,
    tags: ['steelseries', 'arctis', 'nova-pro', 'wireless', 'anc', 'hifi', 'dac'],
    createdAt: '2024-05-10T10:00:00Z',
    updatedAt: '2024-05-10T10:00:00Z',
  },
  {
    id: '24',
    slug: 'hyperx-cloud-alpha-wireless',
    name: 'HyperX Cloud Alpha Wireless',
    description: 'Headset HyperX Cloud Alpha Wireless, drivers 50mm dual chamber, 300h bateria, wireless 2.4GHz, microfone destacável noise-cancelling, DTS Headphone:X, conforto memory foam.',
    shortDescription: 'Headset wireless 300h bateria, dual chamber 50mm, DTS:X.',
    price: 89990,
    images: [
      placeholderImage(47, 'headset-hyperx'),
      placeholderImage(48, 'headset-hyperx'),
    ],
    category: 'Headsets',
    stock: 18,
    isActive: true,
    featured: false,
    tags: ['hyperx', 'cloud-alpha', 'wireless', '300h', 'dual-chamber', 'dts'],
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2024-05-15T10:00:00Z',
  },
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'demo@hiskra.com',
    name: 'Usuário Demo',
    passwordHash: btoa('demo123' + 'hiskra_salt_2024'),
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const categories = [
  'Todos',
  'Processadores',
  'Placas de Vídeo',
  'Memória RAM',
  'Armazenamento',
  'Placas-mãe',
  'Fontes',
  'Gabinetes',
  'Water Coolers',
  'Teclados',
  'Mouses',
  'Monitores',
  'Headsets',
];

export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'Todos') return mockProducts.filter((p) => p.isActive);
  return mockProducts.filter((p) => p.isActive && p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return mockProducts.filter((p) => p.isActive && p.featured);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return mockProducts.filter(
    (p) =>
      p.isActive &&
      (p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)))
  );
}