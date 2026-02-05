export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "tersedia" | "dipinjam";
  image: string;
  specifications?: {
    model?: string;
    brand?: string;
    year?: string;
    [key: string]: string | undefined;
  };
}

export const equipmentData: Equipment[] = [
  {
    id: "1",
    name: "Professional DSLR Camera",
    category: "Fotografi",
    description:
      "High-end digital camera with 24MP sensor, perfect for professional photography and videography projects.",
    status: "tersedia",
    image: "camera professional photography",
    specifications: {
      model: "D850",
      brand: "Nikon",
      year: "2024",
      sensor: "Full Frame 24MP",
    },
  },
  {
    id: "2",
    name: "4K Video Projector",
    category: "Presentasi",
    description:
      "Ultra HD projector with 3000 lumens brightness, ideal for presentations and events.",
    status: "tersedia",
    image: "projector presentation technology",
    specifications: {
      model: "EH-TW7100",
      brand: "Epson",
      resolution: "4K UHD",
      brightness: "3000 lumens",
    },
  },
  {
    id: "3",
    name: "Wireless Microphone Set",
    category: "Audio",
    description:
      "Professional wireless microphone system with dual channels for interviews and events.",
    status: "dipinjam",
    image: "microphone audio recording",
    specifications: {
      model: "G4",
      brand: "Rode",
      channels: "Dual",
      range: "100m",
    },
  },
  {
    id: "4",
    name: "MacBook Pro 16-inch",
    category: "Komputer",
    description:
      "Powerful laptop with M3 chip, 32GB RAM, perfect for video editing and development.",
    status: "tersedia",
    image: "laptop computer modern",
    specifications: {
      model: "MacBook Pro",
      brand: "Apple",
      processor: "M3 Max",
      ram: "32GB",
    },
  },
  {
    id: "5",
    name: "Professional Drone",
    category: "Fotografi",
    description:
      "Advanced quadcopter with 4K camera and gimbal stabilization for aerial photography.",
    status: "dipinjam",
    image: "drone aerial photography",
    specifications: {
      model: "Mavic 3 Pro",
      brand: "DJI",
      camera: "4K 60fps",
      flight_time: "40 minutes",
    },
  },
  {
    id: "6",
    name: "Studio Lighting Kit",
    category: "Fotografi",
    description:
      "Complete lighting setup with softboxes and stands for professional studio shoots.",
    status: "tersedia",
    image: "studio lighting photography",
    specifications: {
      brand: "Godox",
      lights: "3-point setup",
      power: "300W each",
    },
  },
  {
    id: "7",
    name: "Graphics Tablet",
    category: "Desain",
    description:
      "Professional drawing tablet with pressure sensitivity for digital artists.",
    status: "dipinjam",
    image: "tablet drawing digital",
    specifications: {
      model: "Cintiq Pro",
      brand: "Wacom",
      screen: "24-inch 4K",
      pressure: "8192 levels",
    },
  },
  {
    id: "8",
    name: "3D Printer",
    category: "Fabrikasi",
    description:
      "High-precision 3D printer for rapid prototyping and small-scale manufacturing.",
    status: "tersedia",
    image: "3d printer technology",
    specifications: {
      model: "Prusa i3 MK3S+",
      brand: "Prusa",
      build_volume: "250×210×210mm",
      layer_resolution: "0.05mm",
    },
  },
];

export const categories = [
  "Semua",
  "Fotografi",
  "Presentasi",
  "Audio",
  "Komputer",
  "Desain",
  "Fabrikasi",
];
