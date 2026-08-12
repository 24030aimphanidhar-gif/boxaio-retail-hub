import { Building, Check, ChevronRight, Edit2, Home, MapPin, Plus, Star, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';

interface Address {
  id: string;
  type: 'Home' | 'Office' | 'Other';
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  phone: string;
  landmark?: string;
}

const mockAddresses: Address[] = [
  {
    id: 'addr_001',
    type: 'Home',
    street: '42, Palm Grove Apartments',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560102',
    isDefault: true,
    phone: '+91 98765 43210',
    landmark: 'Near HSR Club',
  },
  {
    id: 'addr_002',
    type: 'Office',
    street: 'Boxaio Tower, Electronic City Phase 1',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560100',
    isDefault: false,
    phone: '+91 98765 43211',
  },
];

export function AddressesPage() {
  const [, navigate] = useLocation();
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    landmark: '',
  });

  const handleSaveAddress = () => {
    if (!formData.street || !formData.city || !formData.state || !formData.pincode || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingAddress) {
      // Edit existing address
      setAddresses(addresses.map(addr =>
        addr.id === editingAddress.id
          ? { ...addr, ...formData as Address }
          : addr
      ));
      toast.success('Address updated successfully');
    } else {
      // Add new address
      const newAddress: Address = {
        id: `addr_${Date.now()}`,
        type: formData.type as Address['type'],
        street: formData.street!,
        city: formData.city!,
        state: formData.state!,
        pincode: formData.pincode!,
        phone: formData.phone!,
        landmark: formData.landmark,
        isDefault: addresses.length === 0, // Make default if first address
      };
      setAddresses([...addresses, newAddress]);
      toast.success('Address added successfully');
    }

    setShowAddModal(false);
    setEditingAddress(null);
    setFormData({
      type: 'Home',
      street: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      landmark: '',
    });
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
    toast.success('Default address updated');
  };

  const handleDeleteAddress = (id: string) => {
    const address = addresses.find(addr => addr.id === id);
    if (address?.isDefault) {
      toast.error('Cannot delete default address. Set another address as default first.');
      return;
    }
    
    toast.custom((t) => (
      <div className="bg-white rounded-xl shadow-xl p-4 max-w-md mx-auto border-l-4 border-red-500">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900">Delete Address?</h4>
            <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setAddresses(addresses.filter(addr => addr.id !== id));
                  toast.dismiss(t);
                  toast.success('Address deleted');
                }}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => toast.dismiss(t)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowAddModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'Office':
        return <Building className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-emerald-600">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/dashboard" className="hover:text-emerald-600">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-emerald-600 font-medium">Addresses</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Saved Addresses
              </h1>
              <p className="text-gray-500 mt-1">Manage your shipping and delivery addresses</p>
            </div>
            <button
              onClick={() => {
                setEditingAddress(null);
                setFormData({
                  type: 'Home',
                  street: '',
                  city: '',
                  state: '',
                  pincode: '',
                  phone: '',
                  landmark: '',
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add New Address
            </button>
          </div>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-500 mb-6">Add your first address to make checkout faster</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-2xl border-2 p-5 hover:shadow-md transition-all ${
                  address.isDefault ? 'border-emerald-500' : 'border-gray-100'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg ${address.isDefault ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        {getTypeIcon(address.type)}
                      </div>
                      <span className="font-bold text-gray-900">{address.type}</span>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm">{address.street}</p>
                    {address.landmark && (
                      <p className="text-gray-500 text-xs mt-1">Landmark: {address.landmark}</p>
                    )}
                    <p className="text-gray-700 text-sm">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="text-gray-500 text-xs mt-2">Phone: {address.phone}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                      title="Edit address"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Address Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl" title="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                {/* Address Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Home', 'Office', 'Other'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type as Address['type'] })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          formData.type === type
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                        }`}
                      >
                        {type === 'Home' && <Home className="w-4 h-4" />}
                        {type === 'Office' && <Building className="w-4 h-4" />}
                        {type === 'Other' && <MapPin className="w-4 h-4" />}
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Street Address *</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="House number, building, street"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="Near any famous landmark"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* City, State, Pincode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Pincode *</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAddress}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-4 py-3 rounded-xl hover:shadow-lg transition-all"
                  >
                    <Check className="w-4 h-4 inline mr-2" />
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}