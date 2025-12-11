import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Child {
  id: string;
  name: string;
  age: string;
  favoriteTheme: string;
  avatar: string;
}

const THEMES = [
  { id: 'dinosaurs', name: 'Dinosaurs', emoji: '🦕' },
  { id: 'space', name: 'Space', emoji: '🚀' },
  { id: 'cars', name: 'Cars', emoji: '🚗' },
  { id: 'unicorn', name: 'Unicorn', emoji: '🦄' },
  { id: 'ocean', name: 'Ocean', emoji: '🐠' },
  { id: 'safari', name: 'Safari', emoji: '🦁' }
];

const ChildProfiles: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([
    {
      id: '1',
      name: 'Emma',
      age: '4',
      favoriteTheme: 'unicorn',
      avatar: '👧'
    }
  ]);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Child>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  const handleEdit = (child: Child) => {
    setIsEditing(child.id);
    setEditForm(child);
  };

  const handleSave = () => {
    if (isEditing && editForm.name && editForm.age && editForm.favoriteTheme) {
      setChildren(children.map(c => 
        c.id === isEditing ? { ...c, ...editForm } as Child : c
      ));
      setIsEditing(null);
      setEditForm({});
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this child profile?')) {
      setChildren(children.filter(c => c.id !== id));
    }
  };

  const handleAdd = () => {
    if (editForm.name && editForm.age && editForm.favoriteTheme) {
      const newChild: Child = {
        id: Date.now().toString(),
        name: editForm.name,
        age: editForm.age,
        favoriteTheme: editForm.favoriteTheme,
        avatar: '👶'
      };
      setChildren([...children, newChild]);
      setShowAddModal(false);
      setEditForm({});
    }
  };

  const getThemeEmoji = (themeId: string) => {
    return THEMES.find(t => t.id === themeId)?.emoji || '🎨';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display font-bold">Child Profiles</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="brutal-btn bg-duck-green text-black border-2 border-black px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <Plus size={20} />
          Add Child
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child, index) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border-4 border-black rounded-2xl shadow-brutal overflow-hidden"
          >
            {isEditing === child.id ? (
              // Edit Mode
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Name"
                  className="w-full px-4 py-2 border-2 border-black rounded-lg font-bold"
                />
                <select
                  value={editForm.age || ''}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg font-bold"
                >
                  <option value="">Select Age</option>
                  <option value="2-3">2-3 years</option>
                  <option value="3-4">3-4 years</option>
                  <option value="4-5">4-5 years</option>
                  <option value="5-6">5-6 years</option>
                </select>
                <select
                  value={editForm.favoriteTheme || ''}
                  onChange={(e) => setEditForm({ ...editForm, favoriteTheme: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg font-bold"
                >
                  <option value="">Select Theme</option>
                  {THEMES.map(theme => (
                    <option key={theme.id} value={theme.id}>
                      {theme.emoji} {theme.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-duck-blue border-2 border-black px-4 py-2 rounded-lg font-bold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(null);
                      setEditForm({});
                    }}
                    className="flex-1 bg-white border-2 border-black px-4 py-2 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="bg-gradient-to-br from-duck-yellow to-duck-pink p-8 border-b-4 border-black text-center">
                  <div className="text-6xl mb-2">{child.avatar}</div>
                  <h3 className="text-2xl font-display font-bold">{child.name}</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-slate-600">Age:</span>
                      <span className="font-bold">{child.age} years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-slate-600">Loves:</span>
                      <span className="font-bold flex items-center gap-2">
                        {getThemeEmoji(child.favoriteTheme)}
                        {THEMES.find(t => t.id === child.favoriteTheme)?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(child)}
                      className="flex-1 bg-duck-blue border-2 border-black px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-duck-yellow transition-colors"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(child.id)}
                      className="bg-white border-2 border-black px-4 py-2 rounded-lg font-bold hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-4 border-black rounded-2xl shadow-brutal-lg max-w-md w-full p-8"
          >
            <h3 className="text-3xl font-display font-bold mb-6">Add New Child</h3>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Child's Name"
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold text-lg"
              />
              <select
                value={editForm.age || ''}
                onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold text-lg"
              >
                <option value="">Select Age</option>
                <option value="2-3">2-3 years</option>
                <option value="3-4">3-4 years</option>
                <option value="4-5">4-5 years</option>
                <option value="5-6">5-6 years</option>
              </select>
              <select
                value={editForm.favoriteTheme || ''}
                onChange={(e) => setEditForm({ ...editForm, favoriteTheme: e.target.value })}
                className="w-full px-4 py-3 border-3 border-black rounded-xl font-bold text-lg"
              >
                <option value="">Select Favorite Theme</option>
                {THEMES.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.emoji} {theme.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditForm({});
                }}
                className="flex-1 px-6 py-3 border-2 border-black rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!editForm.name || !editForm.age || !editForm.favoriteTheme}
                className="flex-1 brutal-btn bg-duck-green px-6 py-3 border-2 border-black rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Child
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ChildProfiles;
