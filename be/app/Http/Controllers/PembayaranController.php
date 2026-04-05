<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Peminjaman;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Xendit\Configuration;
use Xendit\Invoice\InvoiceApi;

class PembayaranController extends Controller
{
    public function __construct()
    {
        Configuration::setXenditKey(config('services.xendit.secret_key'));
    }

    private function selesaikanPeminjaman(Pembayaran $pembayaran): void
    {
        $peminjaman = Peminjaman::find($pembayaran->peminjaman_id);
        if (!$peminjaman || $peminjaman->status !== 'menunggu_pembayaran') return;

        $isTerlambat = $peminjaman->is_terlambat ?? (
            $peminjaman->tanggal_kembali && $peminjaman->rencana_pengembalian &&
            Carbon::parse($peminjaman->tanggal_kembali)->gt(Carbon::parse($peminjaman->rencana_pengembalian))
        );

        $peminjaman->update([
            'status' => $isTerlambat ? 'dikembalikan_terlambat' : 'dikembalikan',
        ]);
    }

    // Buat invoice Xendit
    public function buatInvoice(Request $request, $peminjamanId)
    {
        $aktor = $request->user();

        $peminjaman = Peminjaman::with(['user', 'detailPeminjaman'])
            ->where('id', $peminjamanId)
            ->where('id_user', $aktor->id)
            ->whereIn('status', ['dikembalikan', 'dikembalikan_terlambat', 'menunggu_pembayaran'])
            ->firstOrFail();

        // Hitung total denda
        $totalDenda = $peminjaman->detailPeminjaman->sum('total_denda');

        if ($totalDenda <= 0) {
            return response()->json(['message' => 'Tidak ada denda yang perlu dibayar'], 400);
        }

        // Cek apakah sudah ada pembayaran pending
        $existing = Pembayaran::where('peminjaman_id', $peminjamanId)
            ->whereIn('status', ['pending'])
            ->first();

        if ($existing) {
            return response()->json([
                'message'     => 'Invoice sudah dibuat',
                'invoice_url' => $existing->xendit_invoice_url,
                'pembayaran'  => $existing,
            ]);
        }

        DB::beginTransaction();
        try {
            $invoiceApi = new InvoiceApi();

            $invoiceData = [
                'external_id'      => 'denda-' . $peminjamanId . '-' . time(),
                'amount'           => (float) $totalDenda,
                'description'      => 'Pembayaran denda peminjaman #' . $peminjamanId,
                'payer_email'      => $peminjaman->user->email,
                'customer'         => [
                    'given_names'   => $peminjaman->user->nama,
                    'email'         => $peminjaman->user->email,
                    'mobile_number' => $peminjaman->user->phone ?? null,
                ],
                'payment_methods'  => ['QRIS', 'OVO', 'DANA', 'LINKAJA', 'BNI', 'BRI', 'MANDIRI', 'BCA'],
                'invoice_duration' => 86400, // 24 jam
                'success_redirect_url' => config('app.frontend_url') . '/detail-peminjaman/' . $peminjamanId,
                'failure_redirect_url' => config('app.frontend_url') . '/detail-peminjaman/' . $peminjamanId,
            ];

            $invoice = $invoiceApi->createInvoice($invoiceData);

            $pembayaran = Pembayaran::create([
                'peminjaman_id'     => $peminjamanId,
                'user_id'           => $aktor->id,
                'jumlah'            => $totalDenda,
                'status'            => 'pending',
                'xendit_invoice_id' => $invoice['id'],
                'xendit_invoice_url' => $invoice['invoice_url'],
                'expired_at'        => Carbon::now()->addDay(),
            ]);

            DB::commit();

            return response()->json([
                'message'     => 'Invoice berhasil dibuat',
                'invoice_url' => $invoice['invoice_url'],
                'pembayaran'  => $pembayaran,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Xendit invoice error: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal membuat invoice: ' . $e->getMessage()], 500);
        }
    }

    // Webhook dari Xendit
    public function webhook(Request $request)
    {
        Log::info('Webhook received', [
            'token_received' => $request->header('x-callback-token'),
            'token_expected' => config('services.xendit.webhook_token'),
            'match' => $request->header('x-callback-token') === config('services.xendit.webhook_token'),
            'data' => $request->all(),
        ]);

        $token = $request->header('x-callback-token');
        if ($token !== config('services.xendit.webhook_token')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $data = $request->all();

        if ($data['status'] === 'PAID') {
            $pembayaran = Pembayaran::where('xendit_invoice_id', $data['id'])->first();
            Log::info('Pembayaran ditemukan:', ['pembayaran' => $pembayaran]);
            if ($pembayaran) {
                DB::beginTransaction();
                try {
                    $pembayaran->update([
                        'status' => 'lunas',
                        'metode' => strtolower($data['payment_method'] ?? 'unknown'),
                    ]);
                    $this->selesaikanPeminjaman($pembayaran);
                    DB::commit();
                    Log::info('Status updated to lunas');
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error('Webhook update error: ' . $e->getMessage());
                }
            }
        }

        if ($data['status'] === 'EXPIRED') {
            Pembayaran::where('xendit_invoice_id', $data['id'])
                ->update(['status' => 'expired']);
        }

        return response()->json(['message' => 'OK']);
    }

    // Konfirmasi manual oleh petugas
    public function konfirmasiManual(Request $request, $peminjamanId)
    {
        $aktor = $request->user();
        if ($aktor->role !== 'petugas') {
            return response()->json(['message' => 'Hanya petugas'], 403);
        }

        $data = $request->validate([
            'bukti_transfer' => 'nullable|image|max:2048',
            'catatan'        => 'nullable|string',
        ]);

        $peminjaman = Peminjaman::whereIn('status', ['dikembalikan', 'dikembalikan_terlambat', 'menunggu_pembayaran'])
            ->findOrFail($peminjamanId);

        $pembayaran = Pembayaran::firstOrCreate(
            ['peminjaman_id' => $peminjamanId],
            [
                'user_id' => $peminjaman->id_user,
                'jumlah'  => $peminjaman->detailPeminjaman->sum('total_denda'),
                'status'  => 'pending',
                'metode'  => 'tunai',
            ]
        );

        $buktiPath = null;
        if ($request->hasFile('bukti_transfer')) {
            $buktiPath = $request->file('bukti_transfer')->store('pembayaran/bukti', 'public');
            $buktiPath = asset('storage/' . $buktiPath);
        }

        $pembayaran->update([
            'status'         => 'manual',
            'metode'         => 'tunai', 
            'bukti_transfer' => $buktiPath,
            'confirmed_by'   => $aktor->id,
            'confirmed_at'   => now(),
            'catatan'        => $data['catatan'] ?? null,
        ]);

        $this->selesaikanPeminjaman($pembayaran);

        return response()->json([
            'message'    => 'Pembayaran dikonfirmasi secara manual',
            'pembayaran' => $pembayaran,
        ]);
    }

    // Get status pembayaran
    public function show(Request $request, $peminjamanId)
    {
        $aktor = $request->user();

        $peminjaman = Peminjaman::where('id', $peminjamanId)
            ->where(function ($q) use ($aktor) {
                if ($aktor->role === 'peminjam') {
                    $q->where('id_user', $aktor->id);
                }
            })
            ->firstOrFail();

        $pembayaran = Pembayaran::where('peminjaman_id', $peminjamanId)
            ->with(['confirmedBy:id,nama'])
            ->first();

        return response()->json([
            'pembayaran'  => $pembayaran,
            'total_denda' => $peminjaman->detailPeminjaman->sum('total_denda'),
        ]);
    }
}
