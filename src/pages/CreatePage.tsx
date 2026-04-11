import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Mic2, Music, Plus, Settings2, Wand2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CoverSettings, VoiceSegment, useStore } from '../store/useStore';

const defaultSettings: CoverSettings = {
  pitchShift: 0,
  indexRate: 0.75,
  filterRadius: 3,
  rmsMixRate: 0.25,
  protect: 0.33,
  reverbMix: 0.15,
  pitchDetection: 'rmvpe',
  outputFormat: 'mp3',
  separateVocals: true,
  mainVocalVolume: 100,
  backupVocalVolume: 60,
  instrumentalVolume: 80,
};

const COVER_ARTS = [
  'https://picsum.photos/seed/newcover1/400/400',
  'https://picsum.photos/seed/newcover2/400/400',
  'https://picsum.photos/seed/newcover3/400/400',
  'https://picsum.photos/seed/newcover4/400/400',
  'https://picsum.photos/seed/newcover5/400/400',
  'https://picsum.photos/seed/newcover6/400/400',
];

type Step = 1 | 2 | 3 | 4;

type TemplatePayload = {
  copiedFromPostId?: string | null;
  title?: string;
  originalSong?: string;
  artist?: string;
  description?: string;
  tags?: string[];
  settings?: CoverSettings;
  segments?: VoiceSegment[];
  modelIds?: string[];
  sourceCredit?: string;
  genre?: string;
};

export default function CreatePage() {
  const { models, addPost, setPage, actionLoading } = useStore();
  const [step, setStep] = useState<Step>(1);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [segments, setSegments] = useState<VoiceSegment[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [segStart, setSegStart] = useState(0);
  const [segEnd, setSegEnd] = useState(30);
  const [segPitch, setSegPitch] = useState(0);
  const [segVolume, setSegVolume] = useState(100);
  const [segSpeed, setSegSpeed] = useState(1);
  const [segTone, setSegTone] = useState(0);
  const [segBlend, setSegBlend] = useState(50);
  const [singleVoiceMode, setSingleVoiceMode] = useState(true);
  const [settings, setSettings] = useState<CoverSettings>({ ...defaultSettings });
  const [title, setTitle] = useState('');
  const [originalSong, setOriginalSong] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [genre, setGenre] = useState('');
  const [sourceCredit, setSourceCredit] = useState('');
  const [selectedCoverArt, setSelectedCoverArt] = useState(COVER_ARTS[0]);
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [importUrl, setImportUrl] = useState('');
  const [copiedFromPostId, setCopiedFromPostId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverArtInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem('voxcover:create-template');
    if (!raw) return;
    const payload = JSON.parse(raw) as TemplatePayload;
    setCopiedFromPostId(payload.copiedFromPostId || null);
    setTitle(payload.title || '');
    setOriginalSong(payload.originalSong || '');
    setArtist(payload.artist || '');
    setDescription(payload.description || '');
    setTags((payload.tags || []).join(', '));
    setSettings(payload.settings || { ...defaultSettings });
    setSegments(payload.segments || []);
    if ((payload.modelIds || []).length <= 1 && payload.modelIds?.[0]) {
      setSingleVoiceMode(true);
      setSelectedModelId(payload.modelIds[0]);
    } else if ((payload.modelIds || []).length > 1) {
      setSingleVoiceMode(false);
    }
    setSourceCredit(payload.sourceCredit || '');
    setGenre(payload.genre || '');
    window.sessionStorage.removeItem('voxcover:create-template');
  }, []);

  const usedModels = useMemo(
    () => (singleVoiceMode ? models.filter((model) => model.id === selectedModelId) : models.filter((model) => segments.some((segment) => segment.modelId === model.id))),
    [models, segments, selectedModelId, singleVoiceMode],
  );

  const addSegment = () => {
    if (!selectedModelId || segEnd <= segStart) return;
    setSegments((current) => [
      ...current,
      {
        id: uuidv4(),
        modelId: selectedModelId,
        startTime: segStart,
        endTime: segEnd,
        pitchShift: segPitch,
        volume: segVolume,
        speed: segSpeed,
        tone: segTone,
        blend: segBlend,
      },
    ]);
  };

  const removeSegment = (id: string) => {
    setSegments((current) => current.filter((segment) => segment.id !== id));
  };

  const handleGenerate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1200);
  };

  const handlePost = async () => {
    const result = await addPost({
      title: title || 'Untitled Cover',
      originalSong,
      artist,
      description,
      tags: tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      settings,
      segments: singleVoiceMode ? [] : segments,
      visibility,
      sourceCredit,
      genre,
      audioFile,
      coverArtFile,
      fallbackCoverArtUrl: selectedCoverArt,
      copiedFromPostId,
      modelIds: usedModels.map((model) => model.id),
    });
    if (!result.error) {
      setPage('feed');
    }
  };

  const updateSetting = <K extends keyof CoverSettings>(key: K, value: CoverSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const Slider = ({
    label,
    value,
    min,
    max,
    step: sliderStep = 0.01,
    onChange,
    suffix = '',
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    suffix?: string;
  }) => (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span className="text-purple-300 font-mono">{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={sliderStep} value={value} onChange={(event) => onChange(parseFloat(event.target.value))} className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500" />
    </div>
  );

  const steps = [
    { n: 1, label: 'Upload Audio' },
    { n: 2, label: 'Voice Setup' },
    { n: 3, label: 'AI Settings' },
    { n: 4, label: 'Publish' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
        <Wand2 className="w-6 h-6 text-purple-400" />
        Create AI Cover
      </h1>
      <p className="text-gray-400 text-sm mb-8">Upload audio, assign voice models, store the project metadata, and publish a real Supabase-backed post.</p>

      <div className="flex items-center mb-8 gap-0">
        {steps.map(({ n, label }, index) => (
          <div key={n} className="flex items-center flex-1">
            <button onClick={() => step > n && setStep(n as Step)} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step > n ? 'bg-purple-600 border-purple-500 text-white' : step === n ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-gray-800 border-gray-700 text-gray-600'}`}>
                {step > n ? <Check className="w-4 h-4" /> : n}
              </div>
              <span className={`text-xs hidden sm:block ${step === n ? 'text-purple-300' : 'text-gray-600'}`}>{label}</span>
            </button>
            {index < steps.length - 1 && <div className={`h-0.5 w-full mx-1 transition-all ${step > n ? 'bg-purple-600' : 'bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-purple-700/50 rounded-2xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-900/10 transition-all group">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setAudioFile(file);
                setAudioFileName(file.name);
              }}
            />
            <div className="w-16 h-16 bg-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-800/50 transition-all">
              <Music className="w-8 h-8 text-purple-400" />
            </div>
            {audioFile ? (
              <div>
                <p className="text-green-400 font-semibold text-lg mb-1">{audioFileName}</p>
                <p className="text-gray-500 text-sm">Click to change audio file</p>
              </div>
            ) : (
              <div>
                <p className="text-white font-semibold text-lg mb-1">Upload Audio File</p>
                <p className="text-gray-500 text-sm">MP3, WAV, FLAC, OGG supported</p>
              </div>
            )}
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <label className="block text-sm font-semibold text-white mb-2">Optional source reference URL</label>
            <input value={importUrl} onChange={(event) => setImportUrl(event.target.value)} placeholder="https://youtube.com/watch?v=... or original source URL" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 transition-colors" />
            <p className="text-xs text-gray-500 mt-2">This is stored as source credit metadata only. The app does not ingest external audio URLs automatically.</p>
          </div>

          <button onClick={() => setStep(2)} disabled={!audioFile} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all">
            Continue → Choose Voices
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="flex gap-3">
            <button onClick={() => setSingleVoiceMode(true)} className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-all ${singleVoiceMode ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}>
              Single Voice
            </button>
            <button onClick={() => setSingleVoiceMode(false)} className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-all ${!singleVoiceMode ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'border-gray-700 text-gray-500 hover:border-gray-600'}`}>
              Multi-Voice Timeline
            </button>
          </div>

          {singleVoiceMode ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
              <h3 className="font-bold text-white mb-4">Select Voice Model</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {models.map((model) => (
                  <button key={model.id} onClick={() => setSelectedModelId(model.id)} className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedModelId === model.id ? 'bg-purple-600/20 border-purple-500/60 shadow-lg shadow-purple-900/30' : 'border-gray-700/50 hover:border-gray-600'}`}>
                    <img src={model.avatar} alt="" className="w-10 h-10 rounded-full bg-gray-700" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{model.name}</p>
                      <p className="text-xs text-gray-500">{model.type} · {model.usageCount.toLocaleString()} uses</p>
                    </div>
                    {selectedModelId === model.id && <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
              {models.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No models uploaded yet.</p>
                  <button onClick={() => setPage('models')} className="text-purple-400 mt-2 hover:underline text-sm">Upload a model →</button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-400" /> Add Voice Segment
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Voice Model</label>
                    <select value={selectedModelId} onChange={(event) => setSelectedModelId(event.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60">
                      <option value="">Select a model...</option>
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>{model.name} ({model.type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Start Time (seconds)</label>
                      <input type="number" min={0} value={segStart} onChange={(event) => setSegStart(+event.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">End Time (seconds)</label>
                      <input type="number" min={0} value={segEnd} onChange={(event) => setSegEnd(+event.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Slider label="Pitch Shift" value={segPitch} min={-12} max={12} step={1} onChange={setSegPitch} />
                    <Slider label="Volume" value={segVolume} min={0} max={150} step={5} onChange={setSegVolume} suffix="%" />
                    <Slider label="Speed" value={segSpeed} min={0.5} max={2} step={0.05} onChange={setSegSpeed} />
                    <Slider label="Tone" value={segTone} min={-100} max={100} step={5} onChange={setSegTone} />
                    <div className="col-span-2">
                      <Slider label="Blend" value={segBlend} min={0} max={100} step={5} onChange={setSegBlend} suffix="%" />
                    </div>
                  </div>

                  <button onClick={addSegment} disabled={!selectedModelId || segEnd <= segStart} className="w-full bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-40 border border-purple-500/30 text-purple-300 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Segment
                  </button>
                </div>
              </div>

              {segments.length > 0 && (
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
                  <h3 className="font-bold text-white mb-4">Voice Segments ({segments.length})</h3>
                  <div className="bg-gray-800 rounded-xl p-3 mb-4 overflow-x-auto">
                    <div className="min-w-full" style={{ minHeight: 60 }}>
                      {Array.from(new Set(segments.map((segment) => segment.modelId))).map((modelId, index) => {
                        const modelName = models.find((model) => model.id === modelId)?.character || '?';
                        const colors = ['bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
                        const maxTime = Math.max(...segments.map((segment) => segment.endTime), 60);
                        return (
                          <div key={modelId} className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-400 w-20 truncate flex-shrink-0">{modelName}</span>
                            <div className="flex-1 h-8 bg-gray-700 rounded relative">
                              {segments.filter((segment) => segment.modelId === modelId).map((segment) => (
                                <div key={segment.id} className={`absolute top-0.5 bottom-0.5 ${colors[index % colors.length]} rounded opacity-80 flex items-center px-1`} style={{ left: `${(segment.startTime / maxTime) * 100}%`, width: `${Math.max(2, ((segment.endTime - segment.startTime) / maxTime) * 100)}%` }}>
                                  <span className="text-xs text-white truncate">{segment.startTime}s-{segment.endTime}s</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {segments.map((segment, index) => {
                      const model = models.find((item) => item.id === segment.modelId);
                      return (
                        <div key={segment.id} className="flex items-center gap-3 bg-gray-800/60 rounded-lg px-3 py-2">
                          <span className="text-xs font-bold text-purple-400 w-5">#{index + 1}</span>
                          <img src={model?.avatar} alt="" className="w-6 h-6 rounded-full" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{model?.character}</p>
                            <p className="text-xs text-gray-500">{segment.startTime}s → {segment.endTime}s · pitch {segment.pitchShift > 0 ? '+' : ''}{segment.pitchShift} · vol {segment.volume}% · speed {segment.speed} · tone {segment.tone} · blend {segment.blend}%</p>
                          </div>
                          <button onClick={() => removeSegment(segment.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3.5 rounded-xl font-bold transition-all">← Back</button>
            <button onClick={() => setStep(3)} disabled={singleVoiceMode ? !selectedModelId : segments.length === 0} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 text-white py-3.5 rounded-xl font-bold transition-all">
              Continue → Settings
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-5">
            <h3 className="font-bold text-white flex items-center gap-2"><Settings2 className="w-4 h-4 text-purple-400" /> AI Processing Settings</h3>
            <Slider label="Pitch Shift (semitones)" value={settings.pitchShift} min={-12} max={12} step={1} onChange={(value) => updateSetting('pitchShift', value)} />
            <Slider label="Index Rate" value={settings.indexRate} min={0} max={1} onChange={(value) => updateSetting('indexRate', value)} />
            <Slider label="Filter Radius" value={settings.filterRadius} min={0} max={7} step={1} onChange={(value) => updateSetting('filterRadius', value)} />
            <Slider label="RMS Mix Rate" value={settings.rmsMixRate} min={0} max={1} onChange={(value) => updateSetting('rmsMixRate', value)} />
            <Slider label="Protect" value={settings.protect} min={0} max={0.5} onChange={(value) => updateSetting('protect', value)} />
            <Slider label="Reverb Mix" value={settings.reverbMix} min={0} max={1} onChange={(value) => updateSetting('reverbMix', value)} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Pitch Detection</label>
                <select value={settings.pitchDetection} onChange={(event) => updateSetting('pitchDetection', event.target.value as CoverSettings['pitchDetection'])} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
                  {['rmvpe', 'crepe', 'harvest', 'pm'].map((value) => <option key={value} value={value}>{value.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Output Format</label>
                <select value={settings.outputFormat} onChange={(event) => updateSetting('outputFormat', event.target.value as CoverSettings['outputFormat'])} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none">
                  {['mp3', 'wav', 'flac'].map((value) => <option key={value} value={value}>{value.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Separate Vocals from Instrumental</label>
              <button onClick={() => updateSetting('separateVocals', !settings.separateVocals)} className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${settings.separateVocals ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'border-gray-700 text-gray-500'}`}>
                {settings.separateVocals ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {settings.separateVocals && (
              <div className="space-y-4 pt-2 border-t border-gray-800">
                <Slider label="Main Vocal Volume" value={settings.mainVocalVolume} min={0} max={200} step={5} onChange={(value) => updateSetting('mainVocalVolume', value)} suffix="%" />
                <Slider label="Backup Vocal Volume" value={settings.backupVocalVolume} min={0} max={200} step={5} onChange={(value) => updateSetting('backupVocalVolume', value)} suffix="%" />
                <Slider label="Instrumental Volume" value={settings.instrumentalVolume} min={0} max={200} step={5} onChange={(value) => updateSetting('instrumentalVolume', value)} suffix="%" />
              </div>
            )}
          </div>

          {!generated ? (
            <button onClick={handleGenerate} disabled={generating} className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:cursor-wait text-white py-4 rounded-xl font-bold text-lg transition-all">
              {generating ? 'Preparing publishable cover metadata...' : 'Generate AI Cover'}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-green-300 font-semibold">Cover configuration ready</p>
                  <p className="text-green-500/70 text-sm">Your segments, settings, and selected models are ready to publish.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3.5 rounded-xl font-bold transition-all">← Back</button>
                <button onClick={() => setStep(4)} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3.5 rounded-xl font-bold transition-all">Continue → Publish</button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="font-bold text-white mb-3">Cover Art</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
              {COVER_ARTS.map((art) => (
                <button key={art} onClick={() => setSelectedCoverArt(art)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedCoverArt === art ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-transparent opacity-60 hover:opacity-80'}`}>
                  <img src={art} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input ref={coverArtInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => setCoverArtFile(event.target.files?.[0] || null)} />
            <button onClick={() => coverArtInputRef.current?.click()} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              {coverArtFile ? `Custom image: ${coverArtFile.name}` : 'Upload custom thumbnail'}
            </button>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-white">Post Details</h3>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Cover Title *</label>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Blinding Lights - Ariana AI Cover" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Original Song</label>
                <input value={originalSong} onChange={(event) => setOriginalSong(event.target.value)} placeholder="Blinding Lights" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Original Artist</label>
                <input value={artist} onChange={(event) => setArtist(event.target.value)} placeholder="The Weeknd" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Genre</label>
                <input value={genre} onChange={(event) => setGenre(event.target.value)} placeholder="pop, rnb, rap..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Visibility</label>
                <select value={visibility} onChange={(event) => setVisibility(event.target.value as 'public' | 'unlisted' | 'private')} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60">
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tell people about this cover, your settings, and what makes the voice arrangement special..." rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 resize-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Source Credit / Reference</label>
              <input value={sourceCredit} onChange={(event) => setSourceCredit(event.target.value)} placeholder="Original instrumental, songwriter credit, or source link" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tags (comma separated)</label>
              <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="pop, rvc, ariana, weeknd" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60" />
            </div>
            {copiedFromPostId && <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">This post is based on copied settings from another published cover.</div>}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3.5 rounded-xl font-bold transition-all">← Back</button>
            <button onClick={() => void handlePost()} disabled={!title.trim() || !audioFile || usedModels.length === 0 || actionLoading} className="flex-grow bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 text-white py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
              <Mic2 className="w-5 h-5" /> {actionLoading ? 'Publishing...' : 'Post to VoxCover'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
