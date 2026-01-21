
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Loader2, Check, User, LogOut, Settings, X, Trash2, Upload, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Product {
    id: number;
    name: string;
    price: string;
    originalPrice?: string;
    discountRate?: number;
    imageUrl: string;
    url: string;
}

interface Supporter {
    id: number;
    name: string;
    slug: string;
    description?: string;
    profileImage?: string;
}

export default function AdminPage() {
    // Auth State
    const [supporter, setSupporter] = useState<Supporter | null>(null);
    const [loginSlug, setLoginSlug] = useState('');
    const [loginPasscode, setLoginPasscode] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // New User State
    const [isNewUser, setIsNewUser] = useState(false);

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editDescription, setEditDescription] = useState('');
    const [editProfileImage, setEditProfileImage] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Main App State
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);

    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

    const [savedProducts, setSavedProducts] = useState<Product[]>([]);
    const [isSaving, setIsSaving] = useState(false)

    // Deleting State
    const [deletingId, setDeletingId] = useState<number | null>(null);


    const router = useRouter();


    // Login Function
    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!loginSlug.trim() || !loginPasscode.trim()) return;

        setIsLoggingIn(true);
        try {
            const res = await fetch('/api/supporters/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: loginSlug, passcode: loginPasscode }),
            });
            const data = await res.json();

            if (data.supporter) {
                setSupporter(data.supporter);
                setSavedProducts(data.products || []);

                setEditDescription(data.supporter.description || '');
                setEditProfileImage(data.supporter.profileImage || '');

                localStorage.setItem('spao_supporter_slug', data.supporter.slug);

                // Handle New User Onboarding
                if (data.isNew) {
                    setIsNewUser(true);
                    setIsEditingProfile(true);
                }

            } else {
                alert('로그인/생성에 실패했습니다.');
            }

        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        }
        setIsLoggingIn(false);
    }

    // Logout
    const handleLogout = () => {
        setSupporter(null);
        setSavedProducts([]);
        setSearchResults([]);
        setKeyword('');
        setIsNewUser(false);
        localStorage.removeItem('spao_supporter_slug');
    }

    // Image Upload Handler
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                alert("이미지 크기는 1MB 이하여야 합니다.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Update Profile Function
    const handleUpdateProfile = async () => {
        if (!supporter) return;

        // Validation for New User
        if (isNewUser && !editDescription.trim()) {
            alert("소개글은 필수 입력 항목입니다.");
            return;
        }

        setIsUpdatingProfile(true);
        try {
            const res = await fetch('/api/supporters/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: supporter.id,
                    description: editDescription,
                    profileImage: editProfileImage
                }),
            });
            const data = await res.json();
            if (data.supporter) {
                setSupporter(data.supporter);
                setIsEditingProfile(false);
                if (isNewUser) {
                    setIsNewUser(false); // Graduation!
                    alert('프로필 설정이 완료되었습니다! 환영합니다.');
                } else {
                    alert('프로필이 수정되었습니다.');
                }
            } else {
                alert('수정에 실패했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        }
        setIsUpdatingProfile(false);
    };

    // Product Delete Function
    const handleDeleteProduct = async (productId: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        setDeletingId(productId);
        try {
            const res = await fetch('/api/products/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: productId }),
            });
            const data = await res.json();
            if (data.success) {
                setSavedProducts(savedProducts.filter(p => p.id !== productId));
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        }
        setDeletingId(null);
    }

    // Check for existing session
    useEffect(() => {
        const savedSlug = localStorage.getItem('spao_supporter_slug');
        if (savedSlug) {
            setLoginSlug(savedSlug);
        }
    }, []);


    // Search Function
    const handleSearch = async () => {
        if (!keyword) return;
        setLoading(true);
        setSearchResults([]);
        setSelectedProducts([]);

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: keyword }),
            });
            const data = await res.json();

            if (data.products && data.products.length > 0) {
                setSearchResults(data.products);
            } else {
                alert('검색 결과가 없습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        }
        setLoading(false);
    };

    // Toggle product selection
    const toggleProduct = (product: Product) => {
        setSelectedProducts(prev => {
            const isSelected = prev.some(p => p.url === product.url);
            if (isSelected) {
                return prev.filter(p => p.url !== product.url);
            } else {
                return [...prev, product];
            }
        });
    };

    // Helper to generate UTM URL
    const generateUtmUrl = (url: string, slug: string, name: string) => {
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set('utm_source', 'instagram');
            urlObj.searchParams.set('utm_medium', 'creator');
            urlObj.searchParams.set('utm_campaign', slug);
            urlObj.searchParams.set('utm_term', name);
            return urlObj.toString();
        } catch (e) {
            console.error('Invalid URL:', url);
            return url;
        }
    }

    // Save Function
    const handleSave = async () => {
        if (selectedProducts.length === 0 || !supporter) return;
        setIsSaving(true);
        try {
            const promises = selectedProducts.map(product =>
                fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        supporterId: supporter.id,
                        name: product.name,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        discountRate: product.discountRate,
                        imageUrl: product.imageUrl,
                        linkUrl: generateUtmUrl(product.url, supporter.slug, product.name)
                    }),
                }).then(res => res.json())
            );

            const results = await Promise.all(promises);
            const newSaved = results.map(r => r.product).filter(Boolean);

            if (newSaved.length > 0) {
                setSavedProducts([...newSaved, ...savedProducts]);
                setSelectedProducts([]);
                setSearchResults([]);
                setKeyword('');
                alert(`${newSaved.length}개 상품이 리스트에 추가되었습니다!`);
            } else {
                alert('저장에 실패했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('저장 중 오류가 발생했습니다.');
        }
        setIsSaving(false);
    };


    // RENDER: Login Screen
    if (!supporter) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">SPAO Creator</h1>
                    <p className="text-gray-500 mb-8">인스타그램 아이디를 활용해주세요</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="예: jisoo, minji"
                                className="admin-input pl-12 font-bold text-lg"
                                value={loginSlug}
                                onChange={(e) => setLoginSlug(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute left-4 top-3.5 text-gray-400 font-bold text-sm">🔒</div>
                            <input
                                type="password"
                                placeholder="공통 코드 (Quiz 정답)"
                                className="admin-input pl-12"
                                value={loginPasscode}
                                onChange={(e) => setLoginPasscode(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoggingIn || !loginSlug || !loginPasscode}
                            className="admin-btn-primary"
                        >
                            {isLoggingIn ? <Loader2 className="animate-spin" /> : "시작하기"}
                        </button>
                    </form>
                    <p className="text-xs text-gray-400 mt-6">
                        *처음 입력하는 ID는 자동으로 계정이 생성됩니다.
                    </p>
                </div>
            </div>
        );
    }


    // RENDER: Main Dashboard
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex flex-col items-center">

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditingProfile && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
                        >
                            {/* Hide Close Button for New Users */}
                            {!isNewUser && (
                                <button
                                    onClick={() => setIsEditingProfile(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-black"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            )}

                            <h2 className="admin-title">
                                {isNewUser ? "✨ 환영합니다! 프로필을 설정해주세요" : "프로필 수정"}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="admin-label">
                                        소개글 {isNewUser && <span className="text-red-500">*</span>}
                                    </label>
                                    <textarea
                                        className={cn(
                                            "admin-input min-h-[100px]",
                                            isNewUser && !editDescription.trim() && "admin-input-error"
                                        )}
                                        placeholder="서포터즈 소개글을 입력하세요. (필수)"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                    />
                                    {isNewUser && !editDescription.trim() && (
                                        <p className="text-xs text-red-500 mt-1">소개글을 입력해야 시작할 수 있습니다.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="admin-label">프로필 이미지 (선택)</label>

                                    {editProfileImage && (
                                        <div className="mb-3 flex justify-center">
                                            <img src={editProfileImage} alt="Profile Preview" className="w-20 h-20 rounded-full object-cover border border-gray-200 shadow-sm" />
                                        </div>
                                    )}

                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="profile-upload"
                                        />
                                        <label
                                            htmlFor="profile-upload"
                                            className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all text-gray-500 hover:text-blue-500"
                                        >
                                            <Upload className="w-6 h-6 mb-1" />
                                            <span className="text-sm font-medium">이미지 파일 선택 (1MB 이하)</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={isUpdatingProfile || (isNewUser && !editDescription.trim())}
                                    className="admin-btn-primary"
                                >
                                    {isUpdatingProfile ? <Loader2 className="animate-spin" /> : (isNewUser ? "설정 완료하고 시작하기" : "저장하기")}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            <div className="w-full max-w-2xl">
                <header className="mb-10 flex flex-col items-center relative gap-3">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">스파오 크리에이터 카탈로그</h1>
                    <div className="flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow-sm border border-gray-100">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-sm font-bold text-gray-700 [word-break:keep-all]">{supporter.name}님, 잘 부탁드립니다 : )</span>

                        <div className="w-px h-3 bg-gray-200 mx-1"></div>

                        {/* Settings Button */}
                        <button
                            onClick={() => setIsEditingProfile(true)}
                            className="text-gray-400 hover:text-black p-1 hover:bg-gray-100 rounded-full transition-all"
                            title="프로필 수정"
                        >
                            <Settings className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-all"
                            title="로그아웃"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <a
                            href={`/${supporter.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors bg-gray-100 px-4 py-2 rounded-full hover:bg-blue-50"
                        >
                            내 링크트리 보기
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/${supporter.slug}`);
                                alert("링크가 복사되었습니다!");
                            }}
                            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200"
                        >
                            링크 복사
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </header>

                {/* Search Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 sticky top-4 z-10">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            placeholder="예: 푸퍼, 데일리지, 가디건 등"
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 placeholder-gray-400 text-base"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-black hover:bg-gray-800 text-white rounded-xl px-6 py-3 sm:py-0 font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                            검색
                        </button>
                    </div>
                </div>

                {/* Search Results Grid */}
                <AnimatePresence>
                    {searchResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-10"
                        >
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h2 className="text-lg font-bold text-gray-900">검색 결과 <span className="text-blue-600">{searchResults.length}</span></h2>
                                {selectedProducts.length > 0 && (
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-md animate-pulse flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        선택한 {selectedProducts.length}개 상품 추가하기
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {searchResults.map((item, idx) => {
                                    const isSelected = selectedProducts.some(p => p.url === item.url);
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => toggleProduct(item)}
                                            className={cn(
                                                "cursor-pointer group relative bg-white rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg",
                                                isSelected ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2" : "border-transparent"
                                            )}
                                        >
                                            <div className="aspect-[3/4] bg-gray-100 relative">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                                                        <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                                                            <Check className="w-6 h-6" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug break-all">{item.name}</h3>
                                                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                                    {item.discountRate && (
                                                        <span className="text-red-600 font-bold text-sm">{item.discountRate}%</span>
                                                    )}
                                                    <span className="text-gray-900 font-bold text-sm">{item.price}</span>
                                                    {item.originalPrice && (
                                                        <span className="text-gray-400 text-xs line-through">{item.originalPrice}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Saved List Preview */}
                <div>
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h2 className="text-xl font-bold text-gray-900">등록된 리스트 <span className="text-gray-400 font-normal">({savedProducts.length})</span></h2>
                        <a href={`/${supporter.slug}`} target="_blank" className="text-sm font-bold text-blue-600 hover:underline">
                            내 링크트리 보기 →
                        </a>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {savedProducts.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
                                <img src={item.imageUrl} alt={item.name} className="w-16 h-20 object-cover rounded-lg bg-gray-100" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate whitespace-normal line-clamp-2 break-all">{item.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {item.discountRate && (
                                            <span className="text-red-600 font-bold text-xs">{item.discountRate}%</span>
                                        )}
                                        <span className="text-gray-500 text-sm">{item.price}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteProduct(item.id)}
                                    disabled={deletingId === item.id}
                                    className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all"
                                >
                                    {deletingId === item.id ? <Loader2 className="animate-spin w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                                </button>
                            </div>
                        ))}
                        {savedProducts.length === 0 && searchResults.length === 0 && (
                            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p>등록된 상품이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
