import { useRef, useState } from 'react';
import { Check, Globe, Layers, Lock, Plus, Search, Trash2, TrendingUp, Upload } from 'lucide-react';
import { useStore, VoiceModel } from '../store/useStore';

const MODEL_TYPES: VoiceModel['type'][] = ['RVC', 'Diff-SVC', 'VITS', 'Custom'];
const PRESET_TAGS = ['pop', 'rnb', 'rap', 'rock', 'jazz', 'female', 'male', 'high-range', 'falsetto', 'dark', 'whisper', 'energetic'];

export default function ModelsPage() {
  const { models, addModel, deleteModel, actionLoading, currentUserId, setPage } = useStore();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCharacter, setFormCharacter] = useState('');
  const [formType, setFormType] = useState<VoiceModel['type']>('RVC');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formDescription, setFormDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [customTag, setCustomTag] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = models.filter(
    (model) =>
      model.name.toLowerCase().includes(search.toLowerCase()) ||
      model.character.toLowerCase().includes(search.toLowerCase()) ||
      model.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
  );

  const myModels = models.filter((model) => model.creatorId === currentUserId);
  const publicModels = models.filter((model) => model.isPublic);

  const resetForm = () => {
    setFormName('');
    setFormCharacter('');
    setFormType('RVC');
    setFormTags([]);
    setFormFile(null);
    setFormDescription('');
    setIsPublic(true);
    setCustomTag('');
    setShowUpload(false);
  };

  const handleUpload = async () => {
    if (!formName || !formCharacter || !formFile) return;
    const result = await addModel({
      name: formName,
      character: formCharacter,
      type: formType,
      tags: formTags,
      description: formDescription,
      isPublic,
      file: formFile,
    });
    if (!result.error) resetForm();
  };

  const toggleTag = (tag: string) => {
    setFormTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const addCustomTag = () => {
    const value = customTag.trim().toLowerCase();
    if (!value || formTags.includes(value)) return;
    setFormTags((current) => [...current, value]);
    setCustomTag('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Layers className="w-6 h-6 text-purple-400" />
            Voice Model Library
          </h1>
          <p className="text-gray-400 text-sm mt-1">Real model uploads stored in Supabase Storage and reusable across your cover projects.</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-purple-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Upload Model
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Models', value: models.length, color: 'text-purple-400' },
          { label: 'My Models', value: myModels.length, color: 'text-pink-400' },
          { label: 'Public Library', value: publicModels.length, color: 'text-blue-400' },
          { label: 'Total Uses', value: models.reduce((sum, model) => sum + model.usageCount, 0).toLocaleString(), color: 'text-green-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search models by name, character, creator, or tag..."
          className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/50"
        />
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl shadow-purple-900/30 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" /> Upload Voice Model
            </h2>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Model Name *</label>
                  <input value={formName} onChange={(event) => setFormName(event.target.value)} placeholder="e.g. Ariana Grande v3" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Character / Artist Name *</label>
                  <input value={formCharacter} onChange={(event) => setFormCharacter(event.target.value)} placeholder="e.g. Ariana Grande" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                <textarea value={formDescription} onChange={(event) => setFormDescription(event.target.value)} rows={3} placeholder="Describe the model quality, training style, and best use cases..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 resize-none" />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Model Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {MODEL_TYPES.map((type) => (
                    <button key={type} onClick={() => setFormType(type)} className={`py-2 rounded-lg text-sm font-semibold border transition-all ${formType === type ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Privacy</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setIsPublic(true)} className={`py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${isPublic ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'border-gray-700 text-gray-500'}`}>
                    <Globe className="w-4 h-4" /> Public
                  </button>
                  <button onClick={() => setIsPublic(false)} className={`py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${!isPublic ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'border-gray-700 text-gray-500'}`}>
                    <Lock className="w-4 h-4" /> Private
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_TAGS.map((tag) => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${formTags.includes(tag) ? 'bg-purple-600/30 border-purple-500/60 text-purple-300' : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}>
                      {formTags.includes(tag) && '✓ '} {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={customTag} onChange={(event) => setCustomTag(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addCustomTag()} placeholder="Custom tag..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-purple-500/60" />
                  <button onClick={addCustomTag} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs transition-all">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${formFile ? 'border-green-500/50 bg-green-900/10' : 'border-purple-700/50 hover:border-purple-500 hover:bg-purple-900/10'}`}>
                <input ref={fileRef} type="file" accept=".pth,.zip,.pt,.bin,.safetensors" className="hidden" onChange={(event) => setFormFile(event.target.files?.[0] || null)} />
                {formFile ? (
                  <div>
                    <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-300 font-semibold text-sm">{formFile.name}</p>
                    <p className="text-gray-600 text-xs mt-1">Click to change</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-white font-semibold text-sm">Upload Model File</p>
                    <p className="text-gray-500 text-xs mt-1">.pth, .zip, .pt, .bin, .safetensors</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={resetForm} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all">
                Cancel
              </button>
              <button onClick={() => void handleUpload()} disabled={!formName || !formCharacter || !formFile || actionLoading} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 text-white">
                {actionLoading ? 'Uploading...' : <><Upload className="w-4 h-4" /> Upload Model</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((model) => {
          const isOwner = model.creatorId === currentUserId;
          return (
            <div key={model.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-purple-700/50 transition-all group">
              <div className="flex items-start gap-3 mb-3">
                <img src={model.avatar} alt="" className="w-12 h-12 rounded-full bg-gray-700 border border-purple-500/30 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{model.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{model.character}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">by {model.creatorName || 'Unknown user'}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${model.type === 'RVC' ? 'bg-purple-900/50 text-purple-300 border border-purple-700/30' : model.type === 'Diff-SVC' ? 'bg-blue-900/50 text-blue-300 border border-blue-700/30' : model.type === 'VITS' ? 'bg-pink-900/50 text-pink-300 border border-pink-700/30' : 'bg-green-900/50 text-green-300 border border-green-700/30'}`}>
                  {model.type}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {model.tags.map((tag) => (
                  <span key={tag} className="text-xs text-gray-500 bg-gray-800/60 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>

              {model.description && <p className="text-sm text-gray-400 mb-3 line-clamp-2">{model.description}</p>}

              <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{model.usageCount.toLocaleString()} uses</span>
                <span className="inline-flex items-center gap-1">{model.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}{model.isPublic ? 'Public' : 'Private'}</span>
              </div>

              <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => setPage('create')} className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 py-2 rounded-lg text-xs font-semibold transition-all">
                  Use in Cover
                </button>
                {isOwner && (
                  <button onClick={() => void deleteModel(model.id)} className="p-2 bg-red-900/20 hover:bg-red-900/40 border border-red-700/30 text-red-400 rounded-lg transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-600">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold text-gray-400">No models found</p>
            <p className="text-sm mt-1">Upload your first model to get started</p>
            <button onClick={() => setShowUpload(true)} className="mt-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload Model
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
