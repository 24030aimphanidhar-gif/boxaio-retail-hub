import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../data/products';

export interface SaveListItem {
  id: string;
  product: Product;
  addedAt: Date;
  notes?: string;
}

export interface SaveList {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  items: SaveListItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface SaveListsContextType {
  lists: Record<string, SaveList>;
  currentListId: string | null;
  createList: (name: string, description?: string, icon?: string) => void;
  deleteList: (listId: string) => void;
  renameList: (listId: string, newName: string) => void;
  updateListDescription: (listId: string, description: string) => void;
  setCurrentList: (listId: string) => void;
  addToSaveList: (product: Product, listName?: string) => void;
  removeFromSaveList: (productId: string, listId?: string) => void;
  moveToList: (productId: string, fromListId: string, toListId: string) => void;
  isInSaveList: (productId: string) => boolean;
  getListsContainingProduct: (productId: string) => SaveList[];
  getListNames: () => string[];
  getCurrentList: () => SaveList | null;
  getListById: (listId: string) => SaveList | null;
  addNoteToListItem: (productId: string, listId: string, note: string) => void;
}

const SaveListsContext = createContext<SaveListsContextType | undefined>(undefined);

const DEFAULT_LIST_ID = 'default_save_list';

export function SaveListsProvider({ children }: { children: React.ReactNode }) {
  const emptyDefault = (): Record<string, SaveList> => ({
    [DEFAULT_LIST_ID]: {
      id: DEFAULT_LIST_ID,
      name: 'My Saved Items',
      description: 'Default list for all saved items',
      icon: '\u{1F4E6}',
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const [lists, setLists] = useState<Record<string, SaveList>>(emptyDefault);
  const [currentListId, setCurrentListId] = useState<string | null>(DEFAULT_LIST_ID);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('save_lists');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.values(parsed).forEach((list: any) => {
          list.createdAt = new Date(list.createdAt);
          list.updatedAt = new Date(list.updatedAt);
          list.items?.forEach((item: any) => {
            item.addedAt = new Date(item.addedAt);
          });
        });
        setLists(parsed);
      }
      const current = localStorage.getItem('current_save_list_id');
      if (current) setCurrentListId(current);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('save_lists', JSON.stringify(lists));
  }, [lists, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (currentListId) {
      localStorage.setItem('current_save_list_id', currentListId);
    }
  }, [currentListId, hydrated]);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 6);

  const createList = (name: string, description?: string, icon?: string) => {
    const newList: SaveList = {
      id: generateId(),
      name,
      description,
      icon: icon || '📋',
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setLists(prev => ({ ...prev, [newList.id]: newList }));
    setCurrentListId(newList.id);
  };

  const deleteList = (listId: string) => {
    if (listId === DEFAULT_LIST_ID) return;
    
    const listToDelete = lists[listId];
    if (!listToDelete) return;

    // Move all items to default list
    const defaultList = lists[DEFAULT_LIST_ID];
    const updatedDefaultList = {
      ...defaultList,
      items: [...defaultList.items, ...listToDelete.items],
      updatedAt: new Date(),
    };

    const { [listId]: _, ...remainingLists } = lists;
    setLists({
      ...remainingLists,
      [DEFAULT_LIST_ID]: updatedDefaultList,
    });

    if (currentListId === listId) {
      setCurrentListId(DEFAULT_LIST_ID);
    }
  };

  const renameList = (listId: string, newName: string) => {
    setLists(prev => ({
      ...prev,
      [listId]: {
        ...prev[listId],
        name: newName,
        updatedAt: new Date(),
      }
    }));
  };

  const updateListDescription = (listId: string, description: string) => {
    setLists(prev => ({
      ...prev,
      [listId]: {
        ...prev[listId],
        description,
        updatedAt: new Date(),
      }
    }));
  };

  const setCurrentList = (listId: string) => {
    if (lists[listId]) {
      setCurrentListId(listId);
    }
  };

  const addToSaveList = (product: Product, listName?: string) => {
    let targetListId = currentListId || DEFAULT_LIST_ID;
    
    // If listName is provided, find or create list with that name
    if (listName) {
      const existingList = Object.values(lists).find(l => l.name === listName);
      if (existingList) {
        targetListId = existingList.id;
      } else {
        createList(listName);
        // After creating, get the new list ID
        const newList = Object.values(lists).find(l => l.name === listName);
        if (newList) {
          targetListId = newList.id;
        }
      }
    }

    const targetList = lists[targetListId];
    if (!targetList) return;

    const existingItem = targetList.items.find(item => item.product._id === product._id);
    
    let updatedItems;
    if (existingItem) {
      // If already exists, do nothing (or could remove - but we'll keep for now)
      return;
    } else {
      // Add new item
      const newItem: SaveListItem = {
        id: generateId(),
        product,
        addedAt: new Date(),
      };
      updatedItems = [...targetList.items, newItem];
    }

    setLists(prev => ({
      ...prev,
      [targetListId]: {
        ...targetList,
        items: updatedItems || targetList.items,
        updatedAt: new Date(),
      }
    }));
  };

  const removeFromSaveList = (productId: string, listId?: string) => {
    if (listId) {
      // Remove from specific list
      const targetList = lists[listId];
      if (!targetList) return;

      setLists(prev => ({
        ...prev,
        [listId]: {
          ...targetList,
          items: targetList.items.filter(item => item.product._id !== productId),
          updatedAt: new Date(),
        }
      }));
    } else {
      // Remove from all lists
      const updatedLists = { ...lists };
      Object.keys(updatedLists).forEach(id => {
        updatedLists[id] = {
          ...updatedLists[id],
          items: updatedLists[id].items.filter(item => item.product._id !== productId),
          updatedAt: new Date(),
        };
      });
      setLists(updatedLists);
    }
  };

  const moveToList = (productId: string, fromListId: string, toListId: string) => {
    const fromList = lists[fromListId];
    const toList = lists[toListId];
    
    if (!fromList || !toList) return;

    const productItem = fromList.items.find(item => item.product._id === productId);
    if (!productItem) return;

    // Remove from source list
    const updatedFromList = {
      ...fromList,
      items: fromList.items.filter(item => item.product._id !== productId),
      updatedAt: new Date(),
    };

    // Add to target list (check for duplicates)
    const alreadyInTarget = toList.items.some(item => item.product._id === productId);
    const updatedToList = {
      ...toList,
      items: alreadyInTarget ? toList.items : [...toList.items, { ...productItem, addedAt: new Date() }],
      updatedAt: new Date(),
    };

    setLists(prev => ({
      ...prev,
      [fromListId]: updatedFromList,
      [toListId]: updatedToList,
    }));
  };

  const isInSaveList = (productId: string) => {
    return Object.values(lists).some(list => 
      list.items.some(item => item.product._id === productId)
    );
  };

  const getListsContainingProduct = (productId: string) => {
    return Object.values(lists).filter(list =>
      list.items.some(item => item.product._id === productId)
    );
  };

  const getListNames = () => {
    return Object.values(lists).map(list => list.name);
  };

  const getCurrentList = () => {
    return currentListId ? lists[currentListId] : null;
  };

  const getListById = (listId: string) => {
    return lists[listId] || null;
  };

  const addNoteToListItem = (productId: string, listId: string, note: string) => {
    const targetList = lists[listId];
    if (!targetList) return;

    const updatedItems = targetList.items.map(item =>
      item.product._id === productId ? { ...item, notes: note } : item
    );

    setLists(prev => ({
      ...prev,
      [listId]: {
        ...targetList,
        items: updatedItems,
        updatedAt: new Date(),
      }
    }));
  };

  return (
    <SaveListsContext.Provider value={{
      lists,
      currentListId,
      createList,
      deleteList,
      renameList,
      updateListDescription,
      setCurrentList,
      addToSaveList,
      removeFromSaveList,
      moveToList,
      isInSaveList,
      getListsContainingProduct,
      getListNames,
      getCurrentList,
      getListById,
      addNoteToListItem,
    }}>
      {children}
    </SaveListsContext.Provider>
  );
}

export function useSaveLists() {
  const context = useContext(SaveListsContext);
  if (context === undefined) {
    throw new Error('useSaveLists must be used within a SaveListsProvider');
  }
  return context;
}