import { Edit, MoreVertical, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { EmptyState } from "../../components/shared/EmptyState";
import { Badge } from "../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import type { User, UserRole } from "../../types/user";
import { useState } from "react";
import { toast } from 'sonner';
import { Button } from "../../components/ui/button";

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        role: 'peminjam' as UserRole,
        phone: '',
    });

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleAdd = () => {
        const newUser: User = {
            id: `${users.length + 1}`,
            ...formData,
            createdAt: new Date().toISOString(),
        };
        setUsers([...users, newUser]);
        setShowAddModal(false);
        resetForm();
        toast.success('User berhasil ditambahkan');
    };

    const handleEdit = () => {
        if (selectedUser) {
            setUsers(users.map((u) => (u.id === selectedUser.id ? { ...selectedUser, ...formData } : u)));
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
            toast.success('User berhasil diperbarui');
        }
    };

    const handleDelete = () => {
        if (selectedUser) {
            setUsers(users.filter((u) => u.id !== selectedUser.id));
            setSelectedUser(null);
            toast.success('User berhasil dihapus');
        }
    };

    const resetForm = () => {
        setFormData({
            nama: '',
            email: '',
            role: 'peminjam',
            phone: '',
        });
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            nama: user.nama,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
                    <p className="text-gray-600 mt-1">Kelola pengguna sistem</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah User
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Cari nama atau email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full md:w-48">
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
                {filteredUsers.length === 0 ? (
                    <EmptyState
                        icon={UserPlus}
                        title="Tidak ada user ditemukan"
                        description="Coba ubah filter atau tambahkan user baru"
                        action={{ label: 'Tambah User', onClick: () => setShowAddModal(true) }}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Nama</th>
                                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Role</th>
                                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">No. Telepon</th>
                                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Terdaftar</th>
                                    <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Aksi</th>
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
                                            <p className="text-sm text-gray-700">
                                                {new Date(user.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => openDeleteDialog(user)}
                                                        className="text-red-600"
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
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah User Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                placeholder="Masukkan nama lengkap"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="user@example.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">No. Telepon</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="08xxxxxxxxxx"
                            />
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleAdd}>Tambah User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Nama Lengkap</Label>
                            <Input
                                id="edit-name"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-phone">No. Telepon</Label>
                            <Input
                                id="edit-phone"
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleEdit}>Simpan Perubahan</Button>
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