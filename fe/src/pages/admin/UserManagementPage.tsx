import { ArrowLeft, ArrowRight, Edit, MoreVertical, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { EmptyState } from "../../components/shared/EmptyState";
import { Badge } from "../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import type { User, UserRole, UserStatus } from "../../types/user";
import { useEffect, useState } from "react";
import { toast } from 'sonner';
import { Button } from "../../components/ui/button";
import { createUser, deleteUser, getUsers, updateUser } from "../../services/userService";
import { useSearchParams } from "react-router-dom";

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page") || 1);
    const searchQuery = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "all";
    const [searchInput, setSearchInput] = useState(searchQuery);
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    const [pagination, setPagination] = useState<{ total: number; per_page: number; current_page: number; last_page: number; }>({ total: 0, per_page: 10, current_page: 1, last_page: 1 });
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        confirm_password: '',
        role: 'peminjam' as UserRole,
        phone: '',
        is_active: 'true' as UserStatus,
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchInput]);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);

            const res = await getUsers(
                page,
                debouncedSearch,
                roleFilter
            );

            setUsers(res.users);
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengambil data user");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);

                // delay 800ms biar skeleton keliatan
                await new Promise(resolve => setTimeout(resolve, 500));

                const res = await getUsers(
                    currentPage,
                    debouncedSearch,
                    roleFilter
                );

                setUsers(res.users);
                setPagination(res.pagination);
            } catch {
                toast.error("Gagal mengambil data user");
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, [currentPage, debouncedSearch, roleFilter]);

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleAdd = async () => {
        try {
            await createUser({
                nama: formData.nama,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: formData.role,
            });

            toast.success("User berhasil ditambahkan");
            setShowAddModal(false);
            resetForm();
            fetchUsers(currentPage);
        } catch {
            toast.error("Gagal menambahkan user");
        }
    };

    const handleEdit = async () => {
        if (!selectedUser) return;

        try {
            await updateUser(selectedUser.id, {
                nama: formData.nama,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                is_active: formData.is_active,
                ...(formData.password && { password: formData.password }),
            });

            toast.success("User berhasil diperbarui");
            setShowEditModal(false);
            resetForm();
            fetchUsers(currentPage);
        } catch {
            toast.error("Gagal memperbarui user");
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;

        try {
            await deleteUser(selectedUser.id);
            toast.success("User berhasil dihapus");
            setShowDeleteDialog(false);
            setSelectedUser(null);
            fetchUsers(currentPage);
        } catch {
            toast.error("Gagal menghapus user");
        }
    };

    const resetForm = () => {
        setFormData({
            nama: '',
            email: '',
            role: 'peminjam',
            password: '',
            confirm_password: '',
            phone: '',
            is_active: 'aktif',
        });
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);

        setFormData({
            nama: user.nama,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            password: '',
            confirm_password: '',
            is_active: user.is_active,
        });

        setShowEditModal(true);
    };

    const openDeleteDialog = (user: User) => {
        setSelectedUser(user);
        setShowDeleteDialog(true);
    };

    const roleColors = {
        admin: 'bg-purple-100 text-purple-800',
        petugas: 'bg-blue-100 text-blue-800',
        peminjam: 'bg-green-100 text-green-800',
    };

    const roleLabels = {
        admin: 'Admin',
        petugas: 'Petugas',
        peminjam: 'Peminjam',
    };

    const statusColors = {
        aktif: 'bg-green-100 text-green-800',
        nonaktif: 'bg-red-100 text-red-800',
    }

    const statusLabels = {
        aktif: 'Aktif',
        nonaktif: 'Tidak Aktif',
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manajemen User</h1>
                    <p className="text-gray-600 text-md mt-1">Kelola pengguna sistem</p>
                </div>
                <Button onClick={() => {
                    resetForm();
                    setSelectedUser(null);
                    setShowAddModal(true);
                }}
                    className="cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah User
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                        <Input
                            placeholder="Cari nama atau email user ..."
                            value={searchInput}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearchInput(value);
                                setSearchParams({
                                    page: "1",
                                    search: value,
                                    role: roleFilter,
                                })
                            }}
                            className="pl-10 "
                        />
                    </div>
                    <Select
                        value={roleFilter}
                        onValueChange={(value) =>
                            setSearchParams({
                                page: "1",
                                search: searchQuery,
                                role: value,
                            })
                        }
                    >
                        <SelectTrigger className="w-full md:w-48 cursor-pointer">
                            <SelectValue placeholder="Semua Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Role</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="petugas">Petugas</SelectItem>
                            <SelectItem value="peminjam">Peminjam</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {loading ? (
                    <table className="w-full">
                        <thead className="bg-lime-800 border-b">
                            <tr>
                                {['Nama', 'Email', 'Role', 'Nomor Telepon', 'Status', 'Terdaftar', 'Aksi'].map(
                                    (_, i) => (
                                        <th key={i} className={`px-6 py-3 ${i === 6 ? "text-right" : ""}`}>
                                            <div className={`h-4 w-20 bg-gray-200 rounded animate-pulse ${i === 6 ? "ml-auto" : ""}`} />
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {Array.from({ length: 5 }).map((_, row) => (
                                <tr key={row} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>  {/* Nama */}
                                    <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 rounded" /></td>  {/* Email */}
                                    <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>  {/* Role - badge */}
                                    <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>  {/* No. Telepon */}
                                    <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>  {/* Status - badge */}
                                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>  {/* Terdaftar */}
                                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-gray-200 rounded-md inline-block" /></td>  {/* Aksi */}
                                </tr>
                            ))}
                        </tbody>

                        {/* ================= SKELETON FOOTER ================= */}
                        <tfoot>
                            <tr>
                                <td colSpan={7} className="p-0">
                                    <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-gray-200 gap-3 bg-gray-300 min-h-[56px]">
                                        {/* INFO */}
                                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />

                                        {/* PAGINATION */}
                                        <div className="flex items-center gap-1">
                                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />

                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-8 w-8 mx-1 bg-gray-200 rounded animate-pulse"
                                                />
                                            ))}

                                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                ) : filteredUsers.length === 0 ? (
                    <EmptyState
                        icon={UserPlus}
                        title="Tidak ada user yang ditemukan"
                        description="Coba ubah filter atau tambahkan user baru"
                        action={{ label: 'Tambah User', onClick: () => setShowAddModal(true) }}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-lime-800 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 text-md font-semibold text-white">Nama</th>
                                    <th className="text-left py-3 px-6 text-md font-semibold text-white">Email</th>
                                    <th className="text-left py-3 px-6 text-md font-semibold text-white">Role</th>
                                    <th className="text-left py-3 px-6 text-md font-semibold text-white">No. Telepon</th>
                                    <th className="text-left py-3 px-6 text-md font-semibold text-white">Status</th>
                                    <th className="text-left py-3 px-6 text-md font-semibold text-white">Terdaftar</th>
                                    <th className="text-right py-3 px-6 text-md font-semibold text-white">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <p className="text-sm font-medium text-gray-900">{user.nama}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-gray-700">{user.email}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge className={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-gray-700">{user.phone || '-'}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge className={statusColors[user.is_active]}>{statusLabels[user.is_active]}</Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-gray-700">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="cursor-pointer">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditModal(user)} className="cursor-pointer">
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => openDeleteDialog(user)}
                                                        className="text-red-600 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-gray-200 gap-3 bg-gray-300">

                            {/* Info */}
                            <p className="text-sm text-gray-900">
                                Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1}
                                {" - "}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                                {" dari "}
                                {pagination.total} data
                            </p>

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-1">

                                {/* Prev */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={() =>
                                        setSearchParams({
                                            page: String(pagination.current_page - 1),
                                            search: debouncedSearch,
                                            role: roleFilter,
                                        })
                                    }
                                >
                                    <ArrowLeft />
                                    Prev
                                </Button>

                                {/* Page Numbers */}
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        size="sm"
                                        className="w-8 h-8 mx-1 flex items-center justify-center"
                                        variant={page === pagination.current_page ? "default" : "outline"}
                                        onClick={() =>
                                            setSearchParams({
                                                page: String(page),
                                                search: debouncedSearch,
                                                role: roleFilter,
                                            })
                                        }
                                    >
                                        {page}
                                    </Button>
                                ))}

                                {/* Next */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() =>
                                        setSearchParams({
                                            page: String(pagination.current_page + 1),
                                            search: debouncedSearch,
                                            role: roleFilter,
                                        })
                                    }
                                >
                                    Next
                                    <ArrowRight />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Tambah User Baru</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* FORM */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Nama Lengkap</Label>
                                <Input
                                    value={formData.nama}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nama: e.target.value })
                                    }
                                    placeholder="Contoh: Johan"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    placeholder="Contoh: johan@gmail.com"
                                />
                            </div>

                            <div>
                                <Label>Password</Label>
                                <Input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    placeholder="Contoh: Joh4n123"
                                />
                            </div>

                            <div>
                                <Label>Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            role: value as UserRole,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="petugas">Petugas</SelectItem>
                                        <SelectItem value="peminjam">Peminjam</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                                resetForm();
                                setShowAddModal(false);
                            }}
                        >
                            Batal
                        </Button>
                        <Button className="cursor-pointer" onClick={handleAdd}>Tambah User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label htmlFor="edit-name">Nama Lengkap</Label>
                            <Input
                                id="edit-name"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-password">Password</Label>
                            <Input
                                id="edit-password"
                                type="text"
                                placeholder="Contoh: Joh4n123"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-phone">No. Telepon</Label>
                            <Input
                                id="edit-phone"
                                placeholder="Contoh: 0856xxxx"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-role">Role</Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="petugas">Petugas</SelectItem>
                                    <SelectItem value="peminjam">Peminjam</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-status">Status</Label>
                            <Select value={formData.is_active} onValueChange={(value) => setFormData({ ...formData, is_active: value as UserStatus })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="aktif">Aktif</SelectItem>
                                    <SelectItem value="nonaktif">Nonaktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="cursor-pointer" onClick={() => setShowEditModal(false)}>
                            Batal
                        </Button>
                        <Button className="cursor-pointer" onClick={handleEdit}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Hapus User"
                description={`Apakah Anda yakin ingin menghapus user "${selectedUser?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                variant="danger"
            />
        </div>
    )
}