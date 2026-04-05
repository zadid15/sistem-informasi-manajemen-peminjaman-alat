<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlatSeeder extends Seeder
{
    public function run(): void
    {
        // ── KATEGORI ──────────────────────────────────────────────
        $kategori = [
            ['nama_kategori' => 'Elektronik', 'deskripsi' => 'Peralatan elektronik dan kelistrikan'],
            ['nama_kategori' => 'Mekanik', 'deskripsi' => 'Peralatan mekanik dan permesinan'],
            ['nama_kategori' => 'Optik', 'deskripsi' => 'Peralatan optik dan lensa'],
            ['nama_kategori' => 'Ukur', 'deskripsi' => 'Peralatan pengukuran dan kalibrasi'],
            ['nama_kategori' => 'Komputer', 'deskripsi' => 'Perangkat komputer dan jaringan'],
            ['nama_kategori' => 'Audio Visual', 'deskripsi' => 'Peralatan audio dan visual'],
            ['nama_kategori' => 'Kimia', 'deskripsi' => 'Peralatan laboratorium kimia'],
            ['nama_kategori' => 'Fisika', 'deskripsi' => 'Peralatan laboratorium fisika'],
            ['nama_kategori' => 'Robotik', 'deskripsi' => 'Peralatan robotik dan otomasi'],
            ['nama_kategori' => 'Jaringan', 'deskripsi' => 'Peralatan jaringan komputer'],
            ['nama_kategori' => 'Keselamatan', 'deskripsi' => 'Peralatan keselamatan kerja'],
            ['nama_kategori' => 'Tangan', 'deskripsi' => 'Perkakas tangan'],
            ['nama_kategori' => 'Listrik', 'deskripsi' => 'Peralatan instalasi listrik'],
            ['nama_kategori' => 'Pneumatik', 'deskripsi' => 'Peralatan pneumatik dan hidraulik'],
            ['nama_kategori' => 'Sensor', 'deskripsi' => 'Sensor dan transduser'],
            ['nama_kategori' => 'Komunikasi', 'deskripsi' => 'Peralatan komunikasi dan telekomunikasi'],
            ['nama_kategori' => 'Fabrikasi', 'deskripsi' => 'Peralatan fabrikasi dan manufaktur'],
            ['nama_kategori' => 'Biomedis', 'deskripsi' => 'Peralatan biomedis dan kesehatan'],
            ['nama_kategori' => 'Energi', 'deskripsi' => 'Peralatan energi dan konversi daya'],
            ['nama_kategori' => 'Lingkungan', 'deskripsi' => 'Peralatan pemantauan lingkungan'],
        ];

        foreach ($kategori as $k) {
            DB::table('kategori')->insertOrIgnore([
                ...$k,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ── ALAT ──────────────────────────────────────────────────
        $alat = [
            // ELEKTRONIK
            ['nama_alat' => 'Oscilloscope Digital 100MHz', 'kategori' => 'Elektronik', 'deskripsi' => 'Oscilloscope digital 100MHz untuk analisis sinyal', 'harga' => 5000000, 'batas' => 7, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Bandwidth', 'value' => '100 MHz'], ['name' => 'Channels', 'value' => '2'], ['name' => 'Sample Rate', 'value' => '1 GSa/s']]],
            ['nama_alat' => 'Multimeter Digital', 'kategori' => 'Elektronik', 'deskripsi' => 'Multimeter digital untuk pengukuran tegangan, arus, dan resistansi', 'harga' => 500000, 'batas' => 3, 'jumlah_unit' => 5, 'spesifikasi' => [['name' => 'Tegangan DC', 'value' => '1000V'], ['name' => 'Arus AC', 'value' => '10A']]],
            ['nama_alat' => 'Function Generator', 'kategori' => 'Elektronik', 'deskripsi' => 'Generator sinyal fungsi untuk pengujian rangkaian', 'harga' => 3500000, 'batas' => 7, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Frekuensi', 'value' => '0.1Hz - 10MHz'], ['name' => 'Output', 'value' => '20Vpp']]],
            ['nama_alat' => 'Spectrum Analyzer', 'kategori' => 'Elektronik', 'deskripsi' => 'Analyzer spektrum frekuensi RF', 'harga' => 15000000, 'batas' => 5, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Range', 'value' => '100kHz - 3GHz'], ['name' => 'Resolution', 'value' => '10Hz']]],
            ['nama_alat' => 'LCR Meter', 'kategori' => 'Elektronik', 'deskripsi' => 'Meter untuk mengukur induktansi, kapasitansi, dan resistansi', 'harga' => 2000000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Frekuensi Test', 'value' => '100Hz - 100kHz'], ['name' => 'Akurasi', 'value' => '0.1%']]],
            ['nama_alat' => 'Soldering Station', 'kategori' => 'Elektronik', 'deskripsi' => 'Stasiun solder digital dengan kontrol suhu', 'harga' => 800000, 'batas' => 3, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'Suhu', 'value' => '150-480°C'], ['name' => 'Power', 'value' => '65W']]],
            ['nama_alat' => 'PCB Etching Kit', 'kategori' => 'Elektronik', 'deskripsi' => 'Kit lengkap untuk pembuatan PCB', 'harga' => 350000, 'batas' => 3, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Ukuran Max PCB', 'value' => '20x30cm']]],
            ['nama_alat' => 'Arduino Mega Kit', 'kategori' => 'Elektronik', 'deskripsi' => 'Kit Arduino Mega dengan komponen lengkap', 'harga' => 450000, 'batas' => 5, 'jumlah_unit' => 8, 'spesifikasi' => [['name' => 'Microcontroller', 'value' => 'ATmega2560'], ['name' => 'Digital I/O', 'value' => '54 pins']]],
            ['nama_alat' => 'Raspberry Pi 4', 'kategori' => 'Elektronik', 'deskripsi' => 'Single board computer Raspberry Pi 4 Model B', 'harga' => 900000, 'batas' => 5, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'CPU', 'value' => 'Cortex-A72 1.8GHz'], ['name' => 'RAM', 'value' => '4GB']]],
            ['nama_alat' => 'Power Supply DC Variable', 'kategori' => 'Elektronik', 'deskripsi' => 'Power supply DC variable untuk keperluan lab', 'harga' => 1500000, 'batas' => 7, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Tegangan', 'value' => '0-30V'], ['name' => 'Arus', 'value' => '0-5A']]],
            ['nama_alat' => 'Logic Analyzer', 'kategori' => 'Elektronik', 'deskripsi' => 'Analyzer logika digital 16 channel', 'harga' => 1200000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Channels', 'value' => '16'], ['name' => 'Sample Rate', 'value' => '100MHz']]],

            // MEKANIK
            ['nama_alat' => 'Drill Press', 'kategori' => 'Mekanik', 'deskripsi' => 'Mesin bor duduk untuk pengeboran presisi', 'harga' => 3500000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Power', 'value' => '550W'], ['name' => 'Chuck Size', 'value' => '13mm']]],
            ['nama_alat' => 'Mesin Bubut Mini', 'kategori' => 'Mekanik', 'deskripsi' => 'Mesin bubut mini untuk machining skala kecil', 'harga' => 12000000, 'batas' => 3, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Swing Over Bed', 'value' => '180mm'], ['name' => 'Power', 'value' => '350W']]],
            ['nama_alat' => 'Angle Grinder', 'kategori' => 'Mekanik', 'deskripsi' => 'Gerinda sudut untuk pemotongan dan penghalusan', 'harga' => 600000, 'batas' => 3, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Disc Size', 'value' => '115mm'], ['name' => 'Power', 'value' => '750W']]],
            ['nama_alat' => 'Hydraulic Jack 5 Ton', 'kategori' => 'Mekanik', 'deskripsi' => 'Dongkrak hidrolik kapasitas 5 ton', 'harga' => 450000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Kapasitas', 'value' => '5 Ton'], ['name' => 'Lift Height', 'value' => '400mm']]],
            ['nama_alat' => 'Torque Wrench', 'kategori' => 'Mekanik', 'deskripsi' => 'Kunci momen untuk pengencangan baut presisi', 'harga' => 350000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Range', 'value' => '10-150 Nm'], ['name' => 'Drive', 'value' => '1/2 inch']]],
            ['nama_alat' => 'Belt Sander', 'kategori' => 'Mekanik', 'deskripsi' => 'Mesin amplas sabuk untuk finishing permukaan', 'harga' => 800000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Belt Size', 'value' => '75x533mm'], ['name' => 'Power', 'value' => '600W']]],
            ['nama_alat' => 'Band Saw', 'kategori' => 'Mekanik', 'deskripsi' => 'Gergaji pita untuk pemotongan kayu dan logam', 'harga' => 5000000, 'batas' => 3, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Throat Depth', 'value' => '250mm'], ['name' => 'Power', 'value' => '370W']]],
            ['nama_alat' => 'Bench Vise', 'kategori' => 'Mekanik', 'deskripsi' => 'Ragum meja besi untuk menjepit benda kerja', 'harga' => 400000, 'batas' => 7, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Jaw Width', 'value' => '100mm'], ['name' => 'Max Opening', 'value' => '125mm']]],
            ['nama_alat' => 'Air Compressor', 'kategori' => 'Mekanik', 'deskripsi' => 'Kompresor udara untuk berbagai keperluan', 'harga' => 2500000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Tank', 'value' => '24L'], ['name' => 'Power', 'value' => '1.5HP']]],
            ['nama_alat' => 'Tap and Die Set', 'kategori' => 'Mekanik', 'deskripsi' => 'Set alat tap dan snei untuk membuat ulir', 'harga' => 300000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Ukuran', 'value' => 'M3-M12'], ['name' => 'Material', 'value' => 'HSS']]],

            // OPTIK
            ['nama_alat' => 'Mikroskop Stereo', 'kategori' => 'Optik', 'deskripsi' => 'Mikroskop stereo untuk observasi objek tiga dimensi', 'harga' => 8000000, 'batas' => 7, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Perbesaran', 'value' => '7x - 45x'], ['name' => 'Working Distance', 'value' => '100mm']]],
            ['nama_alat' => 'Mikroskop Biologi', 'kategori' => 'Optik', 'deskripsi' => 'Mikroskop biologi untuk pengamatan sel dan jaringan', 'harga' => 6000000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Perbesaran', 'value' => '40x - 1000x'], ['name' => 'Eyepiece', 'value' => '10x WF']]],
            ['nama_alat' => 'Laser Diode 5mW', 'kategori' => 'Optik', 'deskripsi' => 'Modul laser diode untuk percobaan optik', 'harga' => 200000, 'batas' => 5, 'jumlah_unit' => 5, 'spesifikasi' => [['name' => 'Power', 'value' => '5mW'], ['name' => 'Panjang Gelombang', 'value' => '650nm']]],
            ['nama_alat' => 'Lensa Konvergen Set', 'kategori' => 'Optik', 'deskripsi' => 'Set lensa konvergen untuk percobaan optik', 'harga' => 500000, 'batas' => 7, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Focal Length', 'value' => '50-500mm'], ['name' => 'Diameter', 'value' => '50mm']]],
            ['nama_alat' => 'Spektrometer Optik', 'kategori' => 'Optik', 'deskripsi' => 'Spektrometer untuk analisis spektrum cahaya', 'harga' => 4500000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Range', 'value' => '380-780nm'], ['name' => 'Resolusi', 'value' => '1nm']]],
            ['nama_alat' => 'Kamera USB Mikroskop', 'kategori' => 'Optik', 'deskripsi' => 'Kamera USB untuk dokumentasi hasil mikroskop', 'harga' => 1200000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Resolusi', 'value' => '5MP'], ['name' => 'Interface', 'value' => 'USB 3.0']]],

            // UKUR
            ['nama_alat' => 'Mikrometer Sekrup', 'kategori' => 'Ukur', 'deskripsi' => 'Mikrometer sekrup presisi tinggi', 'harga' => 350000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Range', 'value' => '0-25mm'], ['name' => 'Resolusi', 'value' => '0.01mm']]],
            ['nama_alat' => 'Jangka Sorong Digital', 'kategori' => 'Ukur', 'deskripsi' => 'Jangka sorong digital dengan display LCD', 'harga' => 250000, 'batas' => 5, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'Range', 'value' => '0-150mm'], ['name' => 'Resolusi', 'value' => '0.01mm']]],
            ['nama_alat' => 'Dial Indicator', 'kategori' => 'Ukur', 'deskripsi' => 'Jam ukur untuk pengukuran kerataan permukaan', 'harga' => 400000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Range', 'value' => '0-10mm'], ['name' => 'Resolusi', 'value' => '0.01mm']]],
            ['nama_alat' => 'Tachometer Digital', 'kategori' => 'Ukur', 'deskripsi' => 'Tachometer digital untuk pengukuran kecepatan rotasi', 'harga' => 350000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Range', 'value' => '10-99999 RPM'], ['name' => 'Akurasi', 'value' => '±0.05%']]],
            ['nama_alat' => 'Lux Meter', 'kategori' => 'Ukur', 'deskripsi' => 'Meter intensitas cahaya', 'harga' => 300000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Range', 'value' => '0-200000 Lux'], ['name' => 'Akurasi', 'value' => '±3%']]],
            ['nama_alat' => 'Sound Level Meter', 'kategori' => 'Ukur', 'deskripsi' => 'Meter tingkat kebisingan suara', 'harga' => 500000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Range', 'value' => '30-130 dB'], ['name' => 'Akurasi', 'value' => '±1.5dB']]],
            ['nama_alat' => 'Thermometer Infrared', 'kategori' => 'Ukur', 'deskripsi' => 'Termometer inframerah non-kontak', 'harga' => 400000, 'batas' => 5, 'jumlah_unit' => 5, 'spesifikasi' => [['name' => 'Range', 'value' => '-50 s/d 380°C'], ['name' => 'Akurasi', 'value' => '±2°C']]],
            ['nama_alat' => 'Clamp Meter', 'kategori' => 'Ukur', 'deskripsi' => 'Tang ampere untuk pengukuran arus listrik', 'harga' => 450000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Arus AC', 'value' => '0-600A'], ['name' => 'Tegangan', 'value' => '0-600V']]],
            ['nama_alat' => 'Pressure Gauge', 'kategori' => 'Ukur', 'deskripsi' => 'Pengukur tekanan untuk sistem pneumatik', 'harga' => 150000, 'batas' => 7, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'Range', 'value' => '0-10 bar'], ['name' => 'Akurasi', 'value' => '±2.5%']]],

            // KOMPUTER
            ['nama_alat' => 'Laptop Lenovo ThinkPad', 'kategori' => 'Komputer', 'deskripsi' => 'Laptop untuk kebutuhan komputasi dan pemrograman', 'harga' => 12000000, 'batas' => 3, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Processor', 'value' => 'Intel Core i5'], ['name' => 'RAM', 'value' => '16GB'], ['name' => 'Storage', 'value' => '512GB SSD']]],
            ['nama_alat' => 'Laptop ASUS ROG', 'kategori' => 'Komputer', 'deskripsi' => 'Laptop gaming dan komputasi tinggi', 'harga' => 18000000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Processor', 'value' => 'Intel Core i7'], ['name' => 'RAM', 'value' => '32GB'], ['name' => 'GPU', 'value' => 'RTX 3060']]],
            ['nama_alat' => 'Raspberry Pi 4 Kit', 'kategori' => 'Komputer', 'deskripsi' => 'Raspberry Pi 4 dengan aksesoris lengkap', 'harga' => 1200000, 'batas' => 5, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'RAM', 'value' => '4GB'], ['name' => 'Storage', 'value' => '32GB SD']]],
            ['nama_alat' => 'Jetson Nano', 'kategori' => 'Komputer', 'deskripsi' => 'NVIDIA Jetson Nano untuk AI edge computing', 'harga' => 2500000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'GPU', 'value' => '128-core Maxwell'], ['name' => 'RAM', 'value' => '4GB']]],
            ['nama_alat' => 'Proyektor Epson', 'kategori' => 'Komputer', 'deskripsi' => 'Proyektor untuk presentasi dan tampilan', 'harga' => 5000000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Resolusi', 'value' => 'Full HD 1080p'], ['name' => 'Brightness', 'value' => '3000 Lumens']]],
            ['nama_alat' => 'Keyboard Mekanik', 'kategori' => 'Komputer', 'deskripsi' => 'Keyboard mekanik untuk programming', 'harga' => 600000, 'batas' => 5, 'jumlah_unit' => 5, 'spesifikasi' => [['name' => 'Switch', 'value' => 'Cherry MX Blue'], ['name' => 'Layout', 'value' => 'TKL']]],

            // AUDIO VISUAL
            ['nama_alat' => 'Kamera DSLR Canon', 'kategori' => 'Audio Visual', 'deskripsi' => 'Kamera DSLR untuk dokumentasi dan fotografi', 'harga' => 8000000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Sensor', 'value' => '24.1MP APS-C'], ['name' => 'Video', 'value' => 'Full HD 60fps']]],
            ['nama_alat' => 'Kamera Mirrorless Sony', 'kategori' => 'Audio Visual', 'deskripsi' => 'Kamera mirrorless untuk konten dan dokumentasi', 'harga' => 12000000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Sensor', 'value' => '24.2MP'], ['name' => 'Video', 'value' => '4K 30fps']]],
            ['nama_alat' => 'Tripod Profesional', 'kategori' => 'Audio Visual', 'deskripsi' => 'Tripod aluminium untuk kamera dan alat ukur', 'harga' => 700000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Max Height', 'value' => '165cm'], ['name' => 'Max Load', 'value' => '8kg']]],
            ['nama_alat' => 'Microphone Condenser', 'kategori' => 'Audio Visual', 'deskripsi' => 'Mikrofon condenser untuk rekaman audio', 'harga' => 1500000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Polar Pattern', 'value' => 'Cardioid'], ['name' => 'Frequency', 'value' => '20Hz-20kHz']]],
            ['nama_alat' => 'Audio Interface', 'kategori' => 'Audio Visual', 'deskripsi' => 'Interface audio USB untuk rekaman', 'harga' => 2000000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Input', 'value' => '2 XLR/TRS'], ['name' => 'Sample Rate', 'value' => '192kHz']]],
            ['nama_alat' => 'Ring Light LED', 'kategori' => 'Audio Visual', 'deskripsi' => 'Ring light LED untuk pencahayaan foto dan video', 'harga' => 500000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Diameter', 'value' => '18 inch'], ['name' => 'Power', 'value' => '55W']]],
            ['nama_alat' => 'Video Switcher HDMI', 'kategori' => 'Audio Visual', 'deskripsi' => 'Switcher HDMI untuk multi-source video', 'harga' => 1200000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Input', 'value' => '4 HDMI'], ['name' => 'Resolusi', 'value' => '4K']]],
            ['nama_alat' => 'Drone DJI Mini', 'kategori' => 'Audio Visual', 'deskripsi' => 'Drone kamera untuk pemotretan udara', 'harga' => 5500000, 'batas' => 3, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Kamera', 'value' => '12MP 4K'], ['name' => 'Flight Time', 'value' => '30 menit']]],

            // KIMIA
            ['nama_alat' => 'Timbangan Analitik', 'kategori' => 'Kimia', 'deskripsi' => 'Timbangan analitik presisi 0.0001g', 'harga' => 6000000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Kapasitas', 'value' => '220g'], ['name' => 'Resolusi', 'value' => '0.0001g']]],
            ['nama_alat' => 'pH Meter Digital', 'kategori' => 'Kimia', 'deskripsi' => 'Meter pH digital untuk analisis larutan', 'harga' => 800000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Range', 'value' => '0-14 pH'], ['name' => 'Akurasi', 'value' => '±0.01 pH']]],
            ['nama_alat' => 'Hot Plate Stirrer', 'kategori' => 'Kimia', 'deskripsi' => 'Hot plate dengan magnetic stirrer', 'harga' => 3000000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Max Temp', 'value' => '340°C'], ['name' => 'Speed', 'value' => '100-1500 RPM']]],
            ['nama_alat' => 'Centrifuge', 'kategori' => 'Kimia', 'deskripsi' => 'Centrifuge untuk pemisahan komponen larutan', 'harga' => 5000000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Max Speed', 'value' => '6000 RPM'], ['name' => 'Kapasitas', 'value' => '12x15mL']]],
            ['nama_alat' => 'Oven Laboratorium', 'kategori' => 'Kimia', 'deskripsi' => 'Oven laboratorium untuk pengeringan sampel', 'harga' => 4000000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Max Temp', 'value' => '250°C'], ['name' => 'Volume', 'value' => '50L']]],
            ['nama_alat' => 'Pipet Set', 'kategori' => 'Kimia', 'deskripsi' => 'Set pipet untuk pengambilan sampel presisi', 'harga' => 1500000, 'batas' => 5, 'jumlah_unit' => 5, 'spesifikasi' => [['name' => 'Volume', 'value' => '10-1000µL'], ['name' => 'Akurasi', 'value' => '±0.5%']]],
            ['nama_alat' => 'Buret Digital', 'kategori' => 'Kimia', 'deskripsi' => 'Buret digital untuk titrasi presisi', 'harga' => 2500000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Volume', 'value' => '50mL'], ['name' => 'Resolusi', 'value' => '0.01mL']]],

            // FISIKA
            ['nama_alat' => 'Rel Optik', 'kategori' => 'Fisika', 'deskripsi' => 'Rel optik untuk percobaan optik geometri', 'harga' => 1500000, 'batas' => 7, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Panjang', 'value' => '1.2m'], ['name' => 'Material', 'value' => 'Aluminium']]],
            ['nama_alat' => 'Kit Mekanika', 'kategori' => 'Fisika', 'deskripsi' => 'Kit percobaan mekanika dasar', 'harga' => 2000000, 'batas' => 7, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Komponen', 'value' => '50 buah']]],
            ['nama_alat' => 'Beban Massa Set', 'kategori' => 'Fisika', 'deskripsi' => 'Set beban massa untuk percobaan fisika', 'harga' => 300000, 'batas' => 7, 'jumlah_unit' => 5, 'spesifikasi' => [['name' => 'Range', 'value' => '10g - 1kg'], ['name' => 'Material', 'value' => 'Besi']]],
            ['nama_alat' => 'Osilator Harmonik', 'kategori' => 'Fisika', 'deskripsi' => 'Alat percobaan osilasi harmonik', 'harga' => 1200000, 'batas' => 7, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Frekuensi', 'value' => '0.1 - 10Hz']]],
            ['nama_alat' => 'Set Kapasitor', 'kategori' => 'Fisika', 'deskripsi' => 'Set kapasitor untuk percobaan listrik', 'harga' => 400000, 'batas' => 7, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Range', 'value' => '1µF - 1000µF'], ['name' => 'Voltage', 'value' => '50V']]],
            ['nama_alat' => 'Generator Van de Graaff', 'kategori' => 'Fisika', 'deskripsi' => 'Generator elektrostatis untuk demonstrasi', 'harga' => 2500000, 'batas' => 3, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Tegangan', 'value' => '200kV'], ['name' => 'Diameter Bola', 'value' => '230mm']]],
            ['nama_alat' => 'Tabung Cathode Ray', 'kategori' => 'Fisika', 'deskripsi' => 'Tabung sinar katoda untuk percobaan fisika modern', 'harga' => 3500000, 'batas' => 3, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Tegangan', 'value' => '1-5kV']]],

            // ROBOTIK
            ['nama_alat' => 'Robot Arm 6DOF', 'kategori' => 'Robotik', 'deskripsi' => 'Lengan robot 6 derajat kebebasan', 'harga' => 8000000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'DOF', 'value' => '6'], ['name' => 'Payload', 'value' => '500g'], ['name' => 'Reach', 'value' => '600mm']]],
            ['nama_alat' => 'Mobile Robot Platform', 'kategori' => 'Robotik', 'deskripsi' => 'Platform robot mobile berbasis ROS', 'harga' => 12000000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'OS', 'value' => 'ROS 2'], ['name' => 'Speed', 'value' => '1.5 m/s']]],
            ['nama_alat' => 'Servo Motor Set', 'kategori' => 'Robotik', 'deskripsi' => 'Set motor servo untuk proyek robotik', 'harga' => 500000, 'batas' => 5, 'jumlah_unit' => 8, 'spesifikasi' => [['name' => 'Torque', 'value' => '13kg.cm'], ['name' => 'Speed', 'value' => '0.11s/60°']]],
            ['nama_alat' => 'Sensor Ultrasonik HC-SR04', 'kategori' => 'Robotik', 'deskripsi' => 'Sensor jarak ultrasonik untuk robotik', 'harga' => 50000, 'batas' => 7, 'jumlah_unit' => 10, 'spesifikasi' => [['name' => 'Range', 'value' => '2-400cm'], ['name' => 'Akurasi', 'value' => '3mm']]],
            ['nama_alat' => 'Drone Rakitan Kit', 'kategori' => 'Robotik', 'deskripsi' => 'Kit drone untuk belajar merakit dan memprogram', 'harga' => 3000000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Frame', 'value' => '450mm'], ['name' => 'Flight Controller', 'value' => 'Pixhawk']]],
            ['nama_alat' => 'Stepper Motor Driver', 'kategori' => 'Robotik', 'deskripsi' => 'Driver motor stepper untuk CNC dan robotik', 'harga' => 150000, 'batas' => 7, 'jumlah_unit' => 8, 'spesifikasi' => [['name' => 'Current', 'value' => '2A'], ['name' => 'Microstep', 'value' => '1/16']]],
            ['nama_alat' => 'LiDAR Sensor', 'kategori' => 'Robotik', 'deskripsi' => 'Sensor LiDAR untuk pemetaan dan navigasi robot', 'harga' => 5000000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Range', 'value' => '12m'], ['name' => 'Scan Rate', 'value' => '8000 points/s']]],

            // JARINGAN
            ['nama_alat' => 'Managed Switch 24 Port', 'kategori' => 'Jaringan', 'deskripsi' => 'Switch jaringan terkelola 24 port Gigabit', 'harga' => 3500000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Port', 'value' => '24x GbE'], ['name' => 'Speed', 'value' => '1Gbps']]],
            ['nama_alat' => 'Router Mikrotik', 'kategori' => 'Jaringan', 'deskripsi' => 'Router Mikrotik untuk konfigurasi jaringan', 'harga' => 1500000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'CPU', 'value' => 'ARM 650MHz'], ['name' => 'RAM', 'value' => '256MB']]],
            ['nama_alat' => 'Network Tester', 'kategori' => 'Jaringan', 'deskripsi' => 'Tester kabel jaringan dan konektivitas', 'harga' => 300000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Standard', 'value' => 'Cat5/5e/6'], ['name' => 'Test', 'value' => 'Wire map, length']]],
            ['nama_alat' => 'Crimping Tool', 'kategori' => 'Jaringan', 'deskripsi' => 'Alat crimping konektor RJ45 dan RJ11', 'harga' => 100000, 'batas' => 7, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'Connector', 'value' => 'RJ11/RJ45']]],
            ['nama_alat' => 'Fiber Optic Toolkit', 'kategori' => 'Jaringan', 'deskripsi' => 'Toolkit lengkap untuk instalasi fiber optik', 'harga' => 5000000, 'batas' => 3, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Tools', 'value' => '20 buah'], ['name' => 'Fusion Splicer', 'value' => 'Included']]],
            ['nama_alat' => 'WiFi Access Point', 'kategori' => 'Jaringan', 'deskripsi' => 'Access point WiFi dual band untuk lab', 'harga' => 800000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Standard', 'value' => 'WiFi 6'], ['name' => 'Speed', 'value' => '1800Mbps']]],

            // KESELAMATAN
            ['nama_alat' => 'Safety Harness Full Body', 'kategori' => 'Keselamatan', 'deskripsi' => 'Harness keselamatan untuk kerja di ketinggian', 'harga' => 800000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Max Load', 'value' => '150kg'], ['name' => 'Standard', 'value' => 'ANSI Z359']]],
            ['nama_alat' => 'Fire Extinguisher CO2', 'kategori' => 'Keselamatan', 'deskripsi' => 'Alat pemadam kebakaran CO2 untuk lab elektronik', 'harga' => 600000, 'batas' => 7, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Kapasitas', 'value' => '3.5kg'], ['name' => 'Jangkauan', 'value' => '3m']]],
            ['nama_alat' => 'First Aid Kit', 'kategori' => 'Keselamatan', 'deskripsi' => 'Kotak P3K lengkap untuk laboratorium', 'harga' => 300000, 'batas' => 7, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Isi', 'value' => '50+ item']]],
            ['nama_alat' => 'Safety Goggle', 'kategori' => 'Keselamatan', 'deskripsi' => 'Kacamata pengaman untuk kerja lab', 'harga' => 80000, 'batas' => 7, 'jumlah_unit' => 10, 'spesifikasi' => [['name' => 'Standard', 'value' => 'ANSI Z87.1'], ['name' => 'Material', 'value' => 'Polycarbonate']]],
            ['nama_alat' => 'Gas Detector 4-in-1', 'kategori' => 'Keselamatan', 'deskripsi' => 'Detektor gas untuk CO, H2S, O2, dan LEL', 'harga' => 3000000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Gas', 'value' => 'CO, H2S, O2, LEL'], ['name' => 'Alarm', 'value' => 'Suara & Getar']]],

            // TANGAN
            ['nama_alat' => 'Set Obeng Presisi', 'kategori' => 'Tangan', 'deskripsi' => 'Set obeng presisi untuk elektronik dan mekanik', 'harga' => 200000, 'batas' => 5, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'Jumlah', 'value' => '32 buah'], ['name' => 'Material', 'value' => 'S2 Steel']]],
            ['nama_alat' => 'Set Kunci Pas', 'kategori' => 'Tangan', 'deskripsi' => 'Set kunci pas kombinasi berbagai ukuran', 'harga' => 350000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Ukuran', 'value' => '8-24mm'], ['name' => 'Jumlah', 'value' => '12 buah']]],
            ['nama_alat' => 'Set Kunci Allen', 'kategori' => 'Tangan', 'deskripsi' => 'Set kunci hex/allen berbagai ukuran', 'harga' => 150000, 'batas' => 5, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'Ukuran', 'value' => '1.5-10mm'], ['name' => 'Jumlah', 'value' => '9 buah']]],
            ['nama_alat' => 'Tang Set Profesional', 'kategori' => 'Tangan', 'deskripsi' => 'Set tang untuk kerja listrik dan mekanik', 'harga' => 300000, 'batas' => 5, 'jumlah_unit' => 5, 'spesifikasi' => [['name' => 'Jumlah', 'value' => '5 buah'], ['name' => 'Material', 'value' => 'Chrome Vanadium']]],
            ['nama_alat' => 'Gergaji Besi', 'kategori' => 'Tangan', 'deskripsi' => 'Gergaji besi untuk pemotongan logam', 'harga' => 100000, 'batas' => 5, 'jumlah_unit' => 5, 'spesifikasi' => [['name' => 'Blade Length', 'value' => '300mm'], ['name' => 'TPI', 'value' => '24']]],

            // LISTRIK
            ['nama_alat' => 'Insulation Tester', 'kategori' => 'Listrik', 'deskripsi' => 'Tester isolasi kabel dan instalasi listrik', 'harga' => 2000000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Tegangan Test', 'value' => '500/1000V'], ['name' => 'Range', 'value' => '0-2000MΩ']]],
            ['nama_alat' => 'Earth Resistance Tester', 'kategori' => 'Listrik', 'deskripsi' => 'Tester resistansi grounding', 'harga' => 3000000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Range', 'value' => '0-2000Ω'], ['name' => 'Akurasi', 'value' => '±2%']]],
            ['nama_alat' => 'Cable Tracer', 'kategori' => 'Listrik', 'deskripsi' => 'Alat pelacak kabel dalam dinding atau tanah', 'harga' => 1500000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Kedalaman', 'value' => '1.5m'], ['name' => 'Frekuensi', 'value' => '512Hz/8kHz']]],
            ['nama_alat' => 'Panel Listrik Trainer', 'kategori' => 'Listrik', 'deskripsi' => 'Panel trainer untuk belajar instalasi listrik', 'harga' => 4000000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Tegangan', 'value' => '220V AC'], ['name' => 'Komponen', 'value' => 'MCB, Relay, Timer']]],
            ['nama_alat' => 'Volt Meter Panel', 'kategori' => 'Listrik', 'deskripsi' => 'Voltmeter panel untuk monitoring tegangan', 'harga' => 200000, 'batas' => 7, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'Range', 'value' => '0-500V AC'], ['name' => 'Akurasi', 'value' => '±1%']]],

            // PNEUMATIK
            ['nama_alat' => 'Pneumatic Cylinder Set', 'kategori' => 'Pneumatik', 'deskripsi' => 'Set silinder pneumatik untuk percobaan', 'harga' => 1500000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Bore', 'value' => '32mm'], ['name' => 'Stroke', 'value' => '100mm']]],
            ['nama_alat' => 'Valve Solenoid 5/2', 'kategori' => 'Pneumatik', 'deskripsi' => 'Valve solenoid 5/2 way untuk pneumatik', 'harga' => 400000, 'batas' => 5, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'Port', 'value' => '1/4 inch'], ['name' => 'Voltage', 'value' => '24V DC']]],
            ['nama_alat' => 'Pneumatic Trainer Board', 'kategori' => 'Pneumatik', 'deskripsi' => 'Board trainer pneumatik lengkap', 'harga' => 8000000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Tekanan', 'value' => '6 bar'], ['name' => 'Komponen', 'value' => '30 buah']]],
            ['nama_alat' => 'Flow Meter Udara', 'kategori' => 'Pneumatik', 'deskripsi' => 'Meter aliran udara untuk sistem pneumatik', 'harga' => 600000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Range', 'value' => '0-200 L/min'], ['name' => 'Akurasi', 'value' => '±2%']]],

            // SENSOR
            ['nama_alat' => 'Data Logger Suhu', 'kategori' => 'Sensor', 'deskripsi' => 'Data logger suhu dan kelembaban', 'harga' => 800000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Range Suhu', 'value' => '-40 s/d 85°C'], ['name' => 'Range RH', 'value' => '0-100%']]],
            ['nama_alat' => 'Sensor Load Cell', 'kategori' => 'Sensor', 'deskripsi' => 'Sensor gaya/berat load cell', 'harga' => 300000, 'batas' => 5, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'Kapasitas', 'value' => '50kg'], ['name' => 'Akurasi', 'value' => '±0.05%']]],
            ['nama_alat' => 'Sensor IMU 9DOF', 'kategori' => 'Sensor', 'deskripsi' => 'Sensor inertial measurement unit 9 DOF', 'harga' => 200000, 'batas' => 7, 'jumlah_unit' => 8, 'spesifikasi' => [['name' => 'Accelerometer', 'value' => '±16g'], ['name' => 'Gyroscope', 'value' => '±2000°/s']]],
            ['nama_alat' => 'Sensor Arus ACS712', 'kategori' => 'Sensor', 'deskripsi' => 'Sensor arus listrik berbasis Hall effect', 'harga' => 50000, 'batas' => 7, 'jumlah_unit' => 10, 'spesifikasi' => [['name' => 'Range', 'value' => '±30A'], ['name' => 'Sensitivity', 'value' => '66mV/A']]],
            ['nama_alat' => 'Sensor Gas MQ Series', 'kategori' => 'Sensor', 'deskripsi' => 'Set sensor gas MQ untuk berbagai jenis gas', 'harga' => 150000, 'batas' => 7, 'jumlah_unit' => 8, 'spesifikasi' => [['name' => 'Gas', 'value' => 'LPG, CO, CH4, H2'], ['name' => 'Output', 'value' => 'Analog/Digital']]],
            ['nama_alat' => 'Sensor Flex', 'kategori' => 'Sensor', 'deskripsi' => 'Sensor lenturan untuk aplikasi wearable', 'harga' => 100000, 'batas' => 7, 'jumlah_unit' => 10, 'spesifikasi' => [['name' => 'Panjang', 'value' => '4.5 inch'], ['name' => 'Resistance', 'value' => '25-125kΩ']]],

            // KOMUNIKASI
            ['nama_alat' => 'SDR Receiver RTL-SDR', 'kategori' => 'Komunikasi', 'deskripsi' => 'Software-defined radio receiver', 'harga' => 250000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Range', 'value' => '500kHz - 1.75GHz'], ['name' => 'Interface', 'value' => 'USB']]],
            ['nama_alat' => 'Walkie Talkie Set', 'kategori' => 'Komunikasi', 'deskripsi' => 'Set walkie talkie untuk komunikasi lapangan', 'harga' => 800000, 'batas' => 3, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Frekuensi', 'value' => 'UHF 400-470MHz'], ['name' => 'Jangkauan', 'value' => '5km']]],
            ['nama_alat' => 'LoRa Module Set', 'kategori' => 'Komunikasi', 'deskripsi' => 'Set modul LoRa untuk IoT jarak jauh', 'harga' => 300000, 'batas' => 5, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'Frekuensi', 'value' => '915MHz'], ['name' => 'Range', 'value' => '10km']]],
            ['nama_alat' => 'RF Signal Generator', 'kategori' => 'Komunikasi', 'deskripsi' => 'Generator sinyal RF untuk pengujian', 'harga' => 5000000, 'batas' => 5, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Range', 'value' => '10MHz - 6GHz'], ['name' => 'Output', 'value' => '+20dBm']]],
            ['nama_alat' => 'Antenna Analyzer', 'kategori' => 'Komunikasi', 'deskripsi' => 'Analyzer antena untuk pengukuran SWR', 'harga' => 1500000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Range', 'value' => '1-60MHz'], ['name' => 'SWR', 'value' => '1.0-9.9']]],

            // FABRIKASI
            ['nama_alat' => '3D Printer FDM', 'kategori' => 'Fabrikasi', 'deskripsi' => 'Printer 3D FDM untuk prototipe', 'harga' => 5000000, 'batas' => 3, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Volume', 'value' => '220x220x250mm'], ['name' => 'Resolusi', 'value' => '0.1mm']]],
            ['nama_alat' => 'Laser Cutter 40W', 'kategori' => 'Fabrikasi', 'deskripsi' => 'Mesin laser cutting untuk kayu dan akrilik', 'harga' => 15000000, 'batas' => 3, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Power', 'value' => '40W CO2'], ['name' => 'Area', 'value' => '300x200mm']]],
            ['nama_alat' => 'CNC Router Mini', 'kategori' => 'Fabrikasi', 'deskripsi' => 'CNC router mini untuk engraving dan cutting', 'harga' => 8000000, 'batas' => 3, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Area', 'value' => '300x300mm'], ['name' => 'Spindle', 'value' => '300W']]],
            ['nama_alat' => 'Heat Gun', 'kategori' => 'Fabrikasi', 'deskripsi' => 'Heat gun untuk shrinkwrap dan fabrikasi plastik', 'harga' => 300000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Temp Range', 'value' => '50-650°C'], ['name' => 'Power', 'value' => '2000W']]],
            ['nama_alat' => 'Resin 3D Printer', 'kategori' => 'Fabrikasi', 'deskripsi' => 'Printer 3D resin untuk detail tinggi', 'harga' => 3500000, 'batas' => 3, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Resolusi XY', 'value' => '0.05mm'], ['name' => 'Volume', 'value' => '130x82x160mm']]],

            // BIOMEDIS
            ['nama_alat' => 'EKG Simulator', 'kategori' => 'Biomedis', 'deskripsi' => 'Simulator sinyal EKG untuk pembelajaran', 'harga' => 4000000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Lead', 'value' => '12 Lead'], ['name' => 'Output', 'value' => '0.5-3mV']]],
            ['nama_alat' => 'Pulse Oximeter', 'kategori' => 'Biomedis', 'deskripsi' => 'Alat ukur saturasi oksigen darah', 'harga' => 300000, 'batas' => 5, 'jumlah_unit' => 6, 'spesifikasi' => [['name' => 'SpO2 Range', 'value' => '70-100%'], ['name' => 'Akurasi', 'value' => '±2%']]],
            ['nama_alat' => 'Tensimeter Digital', 'kategori' => 'Biomedis', 'deskripsi' => 'Tensimeter digital otomatis', 'harga' => 400000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Range', 'value' => '20-280 mmHg'], ['name' => 'Akurasi', 'value' => '±3mmHg']]],
            ['nama_alat' => 'Phantom Ultrasonografi', 'kategori' => 'Biomedis', 'deskripsi' => 'Phantom untuk latihan USG', 'harga' => 10000000, 'batas' => 3, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Material', 'value' => 'Tissue Equivalent'], ['name' => 'Ukuran', 'value' => '20x20x10cm']]],
            ['nama_alat' => 'Stethoscope Digital', 'kategori' => 'Biomedis', 'deskripsi' => 'Stetoskop digital dengan amplifikasi', 'harga' => 1500000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Amplifikasi', 'value' => '18x'], ['name' => 'Frekuensi', 'value' => '20-1000Hz']]],

            // ENERGI
            ['nama_alat' => 'Panel Surya 100W', 'kategori' => 'Energi', 'deskripsi' => 'Panel surya monocrystalline 100W', 'harga' => 800000, 'batas' => 7, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Power', 'value' => '100W'], ['name' => 'Efisiensi', 'value' => '21%']]],
            ['nama_alat' => 'Solar Charge Controller', 'kategori' => 'Energi', 'deskripsi' => 'Controller pengisian baterai dari panel surya', 'harga' => 400000, 'batas' => 7, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Arus Max', 'value' => '30A'], ['name' => 'Tegangan', 'value' => '12/24V']]],
            ['nama_alat' => 'Inverter Pure Sine Wave', 'kategori' => 'Energi', 'deskripsi' => 'Inverter DC ke AC pure sine wave', 'harga' => 1500000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Power', 'value' => '1000W'], ['name' => 'Input', 'value' => '12V DC']]],
            ['nama_alat' => 'Power Meter Energi', 'kategori' => 'Energi', 'deskripsi' => 'Meter konsumsi energi listrik', 'harga' => 250000, 'batas' => 5, 'jumlah_unit' => 5, 'spesifikasi' => [['name' => 'Tegangan', 'value' => '220V AC'], ['name' => 'Arus Max', 'value' => '16A']]],
            ['nama_alat' => 'Turbin Angin Mini', 'kategori' => 'Energi', 'deskripsi' => 'Turbin angin mini untuk percobaan energi', 'harga' => 3000000, 'batas' => 5, 'jumlah_unit' => 1, 'spesifikasi' => [['name' => 'Power', 'value' => '100W'], ['name' => 'Cut-in Speed', 'value' => '3 m/s']]],

            // LINGKUNGAN
            ['nama_alat' => 'Water Quality Meter', 'kategori' => 'Lingkungan', 'deskripsi' => 'Meter kualitas air multi-parameter', 'harga' => 2000000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Parameter', 'value' => 'pH, TDS, EC, Suhu'], ['name' => 'Akurasi', 'value' => '±1%']]],
            ['nama_alat' => 'Air Quality Monitor', 'kategori' => 'Lingkungan', 'deskripsi' => 'Monitor kualitas udara PM2.5 dan CO2', 'harga' => 1500000, 'batas' => 5, 'jumlah_unit' => 3, 'spesifikasi' => [['name' => 'Parameter', 'value' => 'PM2.5, CO2, VOC'], ['name' => 'Range CO2', 'value' => '400-5000ppm']]],
            ['nama_alat' => 'Soil pH Meter', 'kategori' => 'Lingkungan', 'deskripsi' => 'Meter pH tanah untuk analisis lingkungan', 'harga' => 400000, 'batas' => 5, 'jumlah_unit' => 4, 'spesifikasi' => [['name' => 'Range', 'value' => '3.5-8 pH'], ['name' => 'Akurasi', 'value' => '±0.2 pH']]],
            ['nama_alat' => 'Turbidity Meter', 'kategori' => 'Lingkungan', 'deskripsi' => 'Meter kekeruhan air', 'harga' => 800000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Range', 'value' => '0-200 NTU'], ['name' => 'Akurasi', 'value' => '±2%']]],
            ['nama_alat' => 'UV Radiometer', 'kategori' => 'Lingkungan', 'deskripsi' => 'Meter intensitas radiasi UV', 'harga' => 1200000, 'batas' => 5, 'jumlah_unit' => 2, 'spesifikasi' => [['name' => 'Range', 'value' => '0-200 mW/cm²'], ['name' => 'Panjang Gelombang', 'value' => '254nm']]],
        ];

        foreach ($alat as $a) {
            $kategoriId = DB::table('kategori')
                ->where('nama_kategori', $a['kategori'])
                ->value('id');

            $alatId = DB::table('alat')->insertGetId([
                'id_kategori'      => $kategoriId,
                'nama_alat'        => $a['nama_alat'],
                'deskripsi'        => $a['deskripsi'],
                'harga'            => $a['harga'],
                'batas_peminjaman' => $a['batas'],
                'jumlah_unit'      => $a['jumlah_unit'],
                'spesifikasi'      => json_encode($a['spesifikasi']),
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            $prefix = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $a['nama_alat']), 0, 3));

            for ($i = 1; $i <= $a['jumlah_unit']; $i++) {
                DB::table('alat_unit')->insert([
                    'alat_id'    => $alatId,
                    'nomor_urut' => $i,
                    'kode_unit'  => $prefix . '-' . str_pad($alatId, 3, '0', STR_PAD_LEFT) . '-' . str_pad($i, 2, '0', STR_PAD_LEFT),
                    'kondisi'    => 'Baik',
                    'status'     => 'Tersedia',
                    'lokasi'     => 'Gudang Utama',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
