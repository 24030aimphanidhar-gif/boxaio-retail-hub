import {
  ArrowRight,
  Bookmark,
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  FolderPlus,
  Heart,
  ListChecks,
  MoveRight,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Star,
  Trash2,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSaveLists } from '../context/SaveListsContext';
import { useWishlist } from '../context/WishlistContext';

export function SaveListsPage() {
  const [, navigate] = useLocation();
  const { 
    lists, 
    createList, 
    deleteList, 
    renameList, 
    updateListDescription,
    removeFromSaveList, 
    moveToList,
    setCurrentList,
    currentListId,
    addNoteToListItem
  } = useSaveLists();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated, isGuest, user } = useAuth();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📋');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetListId, setMoveTargetListId] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteProductId, setNoteProductId] = useState<string | null>(null);
  const [noteItemId, setNoteItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showSidebar, setShowSidebar] = useState(true);

  // Available icons for lists
  const listIcons = ['📋', '🛒', '🎁', '❤️', '⭐', '📚', '🍔', '👕', '💻', '🏠', '🎓', '✈️', '🎮', '📷', '🏋️', '🌸', '🎨', '🍷'];

  // Get listId from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const listId = params.get('listId');
    if (listId && lists[listId]) {
      setCurrentList(listId);
    } else if (!currentListId && allLists.length > 0) {
      setCurrentList(allLists[0].id);
    }
  }, [lists]);

  if (!isAuthenticated || isGuest) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="relative w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <Bookmark className="w-14 h-14 text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Your Save Lists
        </h2>
        <p className="text-gray-500 mb-8 max-w-md text-lg">
          Sign in to create and organize your favorite products into custom collections
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-8 py-3.5 rounded-2xl hover:shadow-xl transition-all transform hover:scale-105">
            Sign In
          </Link>
          <Link href="/register" className="border-2 border-emerald-600 text-emerald-600 font-semibold px-8 py-3.5 rounded-2xl hover:bg-emerald-50 transition-all">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const allLists = Object.values(lists);
  const currentList = currentListId ? lists[currentListId] : allLists[0];
  
  // Filter items based on search
  const filteredItems = currentList?.items.filter(item => 
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }
    createList(newListName.trim(), newListDesc.trim() || undefined, selectedIcon);
    setNewListName('');
    setNewListDesc('');
    setSelectedIcon('📋');
    setShowCreateModal(false);
    toast.success(`Created "${newListName}" list`);
  };

  const handleRenameList = () => {
    if (!editName.trim() || !editingListId) {
      toast.error('Please enter a list name');
      return;
    }
    renameList(editingListId, editName.trim());
    if (editDesc !== undefined) {
      updateListDescription(editingListId, editDesc);
    }
    setEditingListId(null);
    setEditName('');
    setEditDesc('');
    toast.success('List updated successfully');
  };

  const handleDeleteList = (listId: string, listName: string) => {
    if (allLists.length === 1) {
      toast.error('Cannot delete the last list. Create another list first.');
      return;
    }
    if (confirm(`Delete "${listName}" list? All items will be moved to "My Saved Items".`)) {
      deleteList(listId);
      toast.success(`Deleted "${listName}" list`);
    }
  };

  const handleRemoveItem = (productId: string, listId: string, productName: string) => {
    if (confirm(`Remove "${productName}" from this list?`)) {
      removeFromSaveList(productId, listId);
      toast.success(`Removed from list`);
    }
  };

  const handleMoveItem = () => {
    if (selectedProductId && moveTargetListId && selectedListId) {
      moveToList(selectedProductId, selectedListId, moveTargetListId);
      toast.success('Item moved successfully');
      setShowMoveModal(false);
      setSelectedProductId(null);
      setMoveTargetListId('');
      setSelectedListId(null);
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(product, 1, 'normal');
    toast.success(`Added ${product.name} to cart!`);
  };

  const handleBuyNow = (product: any) => {
    addToCart(product, 1, 'normal');
    navigate('/checkout');
  };

  const handleAddAllToCart = (listId: string) => {
    const list = lists[listId];
    if (list && list.items.length > 0) {
      list.items.forEach(item => {
        addToCart(item.product, 1, 'normal');
      });
      toast.success(`Added ${list.items.length} items to cart!`);
    }
  };

  const handleAddNote = (productId: string, listId: string, itemId: string, currentNote?: string) => {
    setNoteProductId(productId);
    setSelectedListId(listId);
    setNoteItemId(itemId);
    setNoteText(currentNote || '');
    setShowNoteModal(true);
  };

  const saveNote = () => {
    if (noteProductId && selectedListId && noteItemId) {
      addNoteToListItem(noteProductId, selectedListId, noteText);
      toast.success('Note saved');
      setShowNoteModal(false);
      setNoteText('');
      setNoteProductId(null);
      setSelectedListId(null);
      setNoteItemId(null);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Stats calculations
  const totalItems = currentList?.items.length || 0;
  const estimatedTotal = currentList?.items.reduce((sum, item) => sum + item.product.normalPrice, 0) || 0;

  return (
    <div className="pt-24 pb-24 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Create Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-emerald-600 font-semibold">My Save Lists</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              My Save Lists
            </h1>
            <p className="text-gray-500 mt-1">Organize your favorite products into custom collections</p>
          </div>
          
          {/* Create New List Button - Prominently placed */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
          >
            <FolderPlus className="w-5 h-5" />
            Create New List
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Package, label: 'Total Items', value: allLists.reduce((sum, list) => sum + list.items.length, 0), color: 'emerald' },
            { icon: ListChecks, label: 'Total Lists', value: allLists.length, color: 'blue' },
            { icon: TrendingUp, label: 'Current Total', value: `₹${estimatedTotal.toLocaleString()}`, color: 'purple' },
            { icon: Star, label: 'Wishlisted', value: allLists.reduce((sum, list) => sum + list.items.filter(i => isInWishlist(i.product._id)).length, 0), color: 'rose' }
          ].map((stat, idx) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout: Left - Products, Right - Lists Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN - Products in Selected List */}
          <div className="flex-1">
            {currentList ? (
              <>
                {/* List Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{currentList.icon || '📋'}</span>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{currentList.name}</h2>
                        {currentList.description && (
                          <p className="text-sm text-gray-500">{currentList.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(currentList.createdAt)}
                          </span>
                          <span>•</span>
                          <span>{totalItems} items</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {totalItems > 0 && (
                        <button
                          onClick={() => handleAddAllToCart(currentList.id)}
                          className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-100 transition-all"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add All
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingListId(currentList.id);
                          setEditName(currentList.name);
                          setEditDesc(currentList.description || '');
                        }}
                        className="flex items-center gap-1.5 bg-gray-100 text-gray-600 font-semibold px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  {totalItems > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search items in this list..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Items Display */}
                {totalItems === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">This list is empty</h3>
                    <p className="text-gray-500 text-sm mb-6">Start adding items from products page</p>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-emerald-700 transition-all text-sm"
                    >
                      Browse Products
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No items match your search</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-3 text-emerald-600 text-sm font-semibold hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredItems.map((item, index) => {
                      const p = item.product;
                      const savings = Math.round(((p.mrp - p.normalPrice) / p.mrp) * 100);
                      
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group"
                        >
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <Link href={`/product/${p._id}`} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format';
                                }}
                              />
                            </Link>
                            
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="text-xs text-emerald-600 font-semibold uppercase">
                                      {p.mainCategory.split(',')[0]}
                                    </span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">{p.brand}</span>
                                    {savings > 5 && (
                                      <span className="text-xs bg-rose-100 text-rose-600 font-semibold px-1.5 py-0.5 rounded">
                                        {savings}% off
                                      </span>
                                    )}
                                  </div>
                                  <Link href={`/product/${p._id}`}>
                                    <h3 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors text-sm line-clamp-2">
                                      {p.name}
                                    </h3>
                                  </Link>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="font-bold text-emerald-700">₹{p.normalPrice}</span>
                                    <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
                                    <div className="flex items-center gap-0.5">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs text-gray-600">{p.rating}</span>
                                    </div>
                                  </div>
                                  {item.notes && (
                                    <div className="mt-2 text-xs text-gray-500 bg-amber-50 p-1.5 rounded-lg flex items-start gap-1">
                                      <FileText className="w-3 h-3 text-amber-500 mt-0.5" />
                                      <span className="line-clamp-1">{item.notes}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-1">
                                  <button
                                    onClick={() => handleAddToCart(p)}
                                    className="p-1.5 text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all"
                                    title="Add to cart"
                                  >
                                    <ShoppingCart className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleBuyNow(p)}
                                    className="p-1.5 text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all"
                                    title="Buy now"
                                  >
                                    <Zap className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => toggleWishlist(p)}
                                    className={`p-1.5 rounded-lg transition-all ${
                                      isInWishlist(p._id) ? 'text-rose-500 bg-rose-50' : 'text-gray-400 hover:text-rose-400 hover:bg-rose-50'
                                    }`}
                                    title={isInWishlist(p._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                  >
                                    <Heart className={`w-4 h-4 ${isInWishlist(p._id) ? 'fill-current' : ''}`} />
                                  </button>
                                  <button
                                    onClick={() => handleAddNote(p._id, currentList.id, item.id, item.notes)}
                                    className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all"
                                    title="Add note"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedProductId(p._id);
                                      setSelectedListId(currentList.id);
                                      setShowMoveModal(true);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all"
                                    title="Move to another list"
                                  >
                                    <MoveRight className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveItem(p._id, currentList.id, p.name)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                                    title="Remove from list"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500">Select a list to view items</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Lists Sidebar (Rounded Square Cards) */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-emerald-600" />
                  Your Lists
                </h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-emerald-600 hover:text-emerald-700 p-1 transition-colors"
                  title="Create new list"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                {allLists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => setCurrentList(list.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      currentListId === list.id
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-sm'
                        : 'bg-gray-50 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{list.icon || '📋'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {list.name}
                          </p>
                          <span className="text-xs bg-white rounded-full px-1.5 py-0.5 text-gray-500">
                            {list.items.length}
                          </span>
                        </div>
                        {list.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {list.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-300" />
                          <span className="text-xs text-gray-400">
                            {formatDate(list.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Stats Summary */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Items</span>
                  <span className="font-semibold text-gray-900">
                    {allLists.reduce((sum, list) => sum + list.items.length, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Total Lists</span>
                  <span className="font-semibold text-gray-900">{allLists.length}</span>
                </div>
                {currentList && (
                  <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-100">
                    <span className="text-gray-500">Current Total</span>
                    <span className="font-semibold text-emerald-600">₹{estimatedTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FolderPlus className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Create New List</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Icon Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose an icon</label>
              <div className="grid grid-cols-6 gap-2">
                {listIcons.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setSelectedIcon(icon)}
                    className={`text-2xl p-2 rounded-lg transition-all ${
                      selectedIcon === icon ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name (e.g., Birthday Gifts, Weekly Groceries)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-3"
              autoFocus
            />
            <textarea
              value={newListDesc}
              onChange={(e) => setNewListDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-4 resize-none"
              rows={2}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateList}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-4 py-2 rounded-xl hover:shadow-lg transition-all"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit List Modal */}
      {editingListId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingListId(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit List</h3>
              <button onClick={() => setEditingListId(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-3"
              placeholder="List name"
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-4 resize-none"
              rows={2}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setEditingListId(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameList}
                className="flex-1 bg-emerald-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move to List Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMoveModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Move to Another List</h3>
              <button onClick={() => setShowMoveModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <select
              value={moveTargetListId}
              onChange={(e) => setMoveTargetListId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-4"
            >
              <option value="">Select a list</option>
              {allLists.filter(l => l.id !== selectedListId).map(list => (
                <option key={list.id} value={list.id}>
                  {list.icon} {list.name} ({list.items.length} items)
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMoveModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveItem}
                disabled={!moveTargetListId}
                className="flex-1 bg-emerald-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
              >
                Move Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNoteModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add a Note</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a personal note (e.g., 'Need by Friday', 'Gift for mom')"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none mb-4 resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="flex-1 bg-emerald-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SaveListsPage;